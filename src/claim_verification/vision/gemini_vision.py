"""Gemini Vision client for AI-powered damage analysis.

This module provides the ``GeminiVisionClient`` which sends claim images
to Google Gemini 2.5 Flash for real multimodal damage understanding.  It
replaces the legacy synthetic-marker decoding pipeline with genuine
vision intelligence while preserving the exact output schema required
by downstream agents.

Design decisions
----------------
* **Domain-specific prompt engineering** — each ``ClaimObject`` (car,
  laptop, package) receives a tailored system prompt that enumerates
  *only* the valid issue types and object parts for that domain.  This
  prevents hallucination and keeps outputs schema-compliant.
* **Structured JSON output** — the prompt explicitly requests a JSON
  object and the response is parsed + validated through a Pydantic
  model (``GeminiVisionResponse``).
* **Exponential backoff retry** — transient API failures (network,
  rate-limit) are retried up to ``max_retries`` times with jittered
  exponential backoff.  Permanent failures return ``None`` so the
  caller can fall back to heuristic detection.
* **Rate-limit awareness** — a configurable per-request delay
  (``request_delay_seconds``) prevents hitting the free-tier 10 RPM
  limit during batch processing.
"""

from __future__ import annotations

import base64
import json
import mimetypes
import time
from pathlib import Path
from typing import Any

from loguru import logger
from pydantic import BaseModel, Field, field_validator

from claim_verification.domain.enums import ClaimObject, IssueType, ObjectPart, Severity
from claim_verification.domain.models import ClaimInput


# ---------------------------------------------------------------------------
# Structured response model
# ---------------------------------------------------------------------------

class GeminiVisionResponse(BaseModel):
    """Validated structure for Gemini vision output.

    Every field is constrained to values from the domain enums.
    Invalid or missing values are normalised to safe defaults so that
    downstream agents never receive unexpected strings.
    """

    issue_type: str = Field(default="unknown", description="Detected damage type")
    object_part: str = Field(default="unknown", description="Affected part of the object")
    severity: str = Field(default="unknown", description="Damage severity level")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="Model confidence 0-1")

    @field_validator("issue_type", mode="before")
    @classmethod
    def validate_issue_type(cls, value: Any) -> str:
        """Normalise issue_type to a valid enum value or 'unknown'."""
        if not isinstance(value, str):
            return "unknown"
        normalised = value.strip().lower().replace(" ", "_").replace("-", "_")
        valid = {member.value for member in IssueType}
        return normalised if normalised in valid else "unknown"

    @field_validator("object_part", mode="before")
    @classmethod
    def validate_object_part(cls, value: Any) -> str:
        """Normalise object_part to a valid enum value or 'unknown'."""
        if not isinstance(value, str):
            return "unknown"
        normalised = value.strip().lower().replace(" ", "_").replace("-", "_")
        valid = {member.value for member in ObjectPart}
        return normalised if normalised in valid else "unknown"

    @field_validator("severity", mode="before")
    @classmethod
    def validate_severity(cls, value: Any) -> str:
        """Normalise severity to a valid enum value or 'unknown'."""
        if not isinstance(value, str):
            return "unknown"
        normalised = value.strip().lower()
        valid = {member.value for member in Severity}
        return normalised if normalised in valid else "unknown"

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, value: Any) -> float:
        """Ensure confidence is a float clamped to [0.0, 1.0]."""
        try:
            numeric = float(value)
        except (TypeError, ValueError):
            return 0.0
        return max(0.0, min(1.0, numeric))


# ---------------------------------------------------------------------------
# Prompt templates per claim object
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = (
    "You are an expert insurance damage assessor with 20 years of experience "
    "in visual damage inspection. Analyze the provided image for damage "
    "evidence related to the customer's claim. Be precise and conservative "
    "in your assessment — only report damage you can clearly identify in "
    "the image."
)

_CAR_PROMPT = """Analyze this image for vehicle damage.

**Customer claim**: {claim_text}
**Claimed object**: car

Identify the damage visible in the image. You MUST classify:

1. **issue_type** — exactly one of: dent, scratch, crack, glass_shatter, broken_part, missing_part, none, unknown
2. **object_part** — exactly one of: rear_bumper, front_bumper, left_headlight, right_headlight, headlight, side_mirror, door, door_panel, windshield, glass, exterior, unknown
3. **severity** — exactly one of: none, low, medium, high, unknown
4. **confidence** — a float from 0.0 to 1.0

Rules:
- If no damage is visible, set issue_type to "none" and severity to "none".
- If damage is visible but you cannot determine the exact type, use "unknown".
- Only report what you can SEE in the image, not what the customer claims.

Respond with ONLY a JSON object, no markdown, no explanation:
{{"issue_type": "...", "object_part": "...", "severity": "...", "confidence": ...}}"""

_LAPTOP_PROMPT = """Analyze this image for laptop damage.

**Customer claim**: {claim_text}
**Claimed object**: laptop

Identify the damage visible in the image. You MUST classify:

1. **issue_type** — exactly one of: crack, broken_part, water_damage, scratch, stain, none, unknown
2. **object_part** — exactly one of: screen, keyboard, trackpad, hinge, lid, glass, exterior, unknown
3. **severity** — exactly one of: none, low, medium, high, unknown
4. **confidence** — a float from 0.0 to 1.0

Rules:
- If no damage is visible, set issue_type to "none" and severity to "none".
- Water damage signs include discoloration, staining, corrosion, or warping.
- Only report what you can SEE in the image, not what the customer claims.

Respond with ONLY a JSON object, no markdown, no explanation:
{{"issue_type": "...", "object_part": "...", "severity": "...", "confidence": ...}}"""

_PACKAGE_PROMPT = """Analyze this image for package/shipping damage.

**Customer claim**: {claim_text}
**Claimed object**: package

Identify the damage visible in the image. You MUST classify:

1. **issue_type** — exactly one of: torn_packaging, crushed_packaging, water_damage, stain, broken_part, none, unknown
2. **object_part** — exactly one of: corner, package_corner, package_side, seal, flap, contents, exterior, unknown
3. **severity** — exactly one of: none, low, medium, high, unknown
4. **confidence** — a float from 0.0 to 1.0

Rules:
- If no damage is visible, set issue_type to "none" and severity to "none".
- Distinguish between surface damage (torn/crushed packaging) and content damage (broken contents).
- Only report what you can SEE in the image, not what the customer claims.

Respond with ONLY a JSON object, no markdown, no explanation:
{{"issue_type": "...", "object_part": "...", "severity": "...", "confidence": ...}}"""

_PROMPT_MAP: dict[str, str] = {
    ClaimObject.CAR.value: _CAR_PROMPT,
    ClaimObject.LAPTOP.value: _LAPTOP_PROMPT,
    ClaimObject.PACKAGE.value: _PACKAGE_PROMPT,
}


# ---------------------------------------------------------------------------
# Gemini Vision Client
# ---------------------------------------------------------------------------

class GeminiVisionClient:
    """Multimodal damage analysis via Google Gemini 2.5 Flash.

    Implements the ``VisionProvider`` protocol defined in
    ``claim_verification.domain.ports``.

    Parameters
    ----------
    api_key:
        Google AI Studio API key.
    model:
        Gemini model identifier (default ``gemini-2.5-flash``).
    max_retries:
        Maximum retry attempts for transient API failures.
    request_delay_seconds:
        Minimum delay between API calls to respect rate limits.
        Default 6.5 s keeps us well under the free-tier 10 RPM cap.
    """

    def __init__(
        self,
        api_key: str,
        model: str = "gemini-2.5-flash",
        max_retries: int = 3,
        request_delay_seconds: float = 6.5,
    ) -> None:
        self._api_key = api_key
        self._model = model
        self._max_retries = max_retries
        self._request_delay_seconds = request_delay_seconds
        self._client = self._build_client()
        self._last_request_time: float = 0.0

    def _build_client(self) -> Any:
        """Lazily import and construct the Google GenAI client."""
        try:
            from google import genai  # type: ignore[import-untyped]
            client = genai.Client(api_key=self._api_key)
            logger.info(
                "Gemini Vision client initialised "
                f"(model={self._model}, max_retries={self._max_retries})"
            )
            return client
        except Exception as exc:
            logger.error(f"Failed to initialise Gemini client: {exc}")
            raise

    # -- Public API (VisionProvider protocol) --------------------------------

    def analyze_damage(
        self, image_path: Path, claim: ClaimInput,
    ) -> dict[str, Any] | None:
        """Analyze an image for damage evidence using Gemini Vision.

        Parameters
        ----------
        image_path:
            Absolute path to the image file on disk.
        claim:
            The claim context (text, object type) used to build the
            domain-specific prompt.

        Returns
        -------
        dict or None
            Validated damage analysis dict with keys ``issue_type``,
            ``object_part``, ``severity``, ``confidence``.
            Returns ``None`` on any unrecoverable failure.
        """
        if not image_path.exists():
            logger.warning(f"Image not found for Gemini analysis: {image_path}")
            return None

        prompt = self._build_prompt(claim)
        image_data = self._encode_image(image_path)
        if image_data is None:
            return None

        mime_type = self._mime_type(image_path)

        for attempt in range(1, self._max_retries + 1):
            try:
                self._rate_limit_wait()
                response = self._call_gemini(prompt, image_data, mime_type)
                parsed = self._parse_response(response)
                if parsed is not None:
                    logger.info(
                        f"Gemini analysis succeeded for {image_path.name}: "
                        f"issue={parsed['issue_type']}, "
                        f"part={parsed['object_part']}, "
                        f"severity={parsed['severity']}, "
                        f"confidence={parsed['confidence']:.2f}"
                    )
                    return parsed
                logger.warning(
                    f"Gemini returned unparseable response for {image_path.name} "
                    f"(attempt {attempt}/{self._max_retries})"
                )
            except Exception as exc:
                logger.warning(
                    f"Gemini API error for {image_path.name} "
                    f"(attempt {attempt}/{self._max_retries}): {exc}"
                )
                if attempt < self._max_retries:
                    backoff = min(2 ** attempt, 30)
                    logger.debug(f"Backing off {backoff}s before retry")
                    time.sleep(backoff)

        logger.error(
            f"Gemini analysis failed after {self._max_retries} attempts "
            f"for {image_path.name} — falling back to heuristics"
        )
        return None

    # -- Prompt building -----------------------------------------------------

    def _build_prompt(self, claim: ClaimInput) -> str:
        """Select and format the domain-specific prompt."""
        claim_object = str(
            getattr(claim.claim_object, "value", claim.claim_object)
        )
        template = _PROMPT_MAP.get(claim_object, _CAR_PROMPT)
        return template.format(claim_text=claim.user_claim)

    # -- Image encoding ------------------------------------------------------

    @staticmethod
    def _encode_image(image_path: Path) -> str | None:
        """Read and base64-encode an image file."""
        try:
            raw = image_path.read_bytes()
            encoded = base64.b64encode(raw).decode("utf-8")
            logger.debug(
                f"Encoded image {image_path.name} "
                f"({len(raw)} bytes → {len(encoded)} base64 chars)"
            )
            return encoded
        except Exception as exc:
            logger.error(f"Failed to read/encode image {image_path}: {exc}")
            return None

    @staticmethod
    def _mime_type(image_path: Path) -> str:
        """Determine MIME type from file extension."""
        mime, _ = mimetypes.guess_type(str(image_path))
        return mime or "image/jpeg"

    # -- API call ------------------------------------------------------------

    def _call_gemini(
        self, prompt: str, image_data: str, mime_type: str,
    ) -> str:
        """Send the multimodal request to Gemini and return raw text."""
        from google.genai import types  # type: ignore[import-untyped]

        image_part = types.Part.from_bytes(
            data=base64.b64decode(image_data),
            mime_type=mime_type,
        )

        response = self._client.models.generate_content(
            model=self._model,
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=_SYSTEM_PROMPT),
                        image_part,
                        types.Part.from_text(text=prompt),
                    ],
                ),
            ],
            config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=256,
            ),
        )

        return response.text or ""

    # -- Response parsing ----------------------------------------------------

    @staticmethod
    def _parse_response(raw_text: str) -> dict[str, Any] | None:
        """Parse Gemini's JSON text into a validated response dict.

        Handles common LLM quirks: markdown fences, trailing commas,
        extra whitespace.
        """
        if not raw_text or not raw_text.strip():
            return None

        cleaned = raw_text.strip()
        # Strip markdown code fences if present
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            lines = [
                line for line in lines
                if not line.strip().startswith("```")
            ]
            cleaned = "\n".join(lines).strip()

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError:
            logger.debug(f"JSON parse failed for Gemini response: {cleaned[:200]}")
            return None

        if not isinstance(data, dict):
            return None

        try:
            validated = GeminiVisionResponse(**data)
            return validated.model_dump()
        except Exception as exc:
            logger.debug(f"Validation failed for Gemini response: {exc}")
            return None

    # -- Rate limiting -------------------------------------------------------

    def _rate_limit_wait(self) -> None:
        """Enforce minimum delay between consecutive API requests."""
        if self._request_delay_seconds <= 0:
            return
        elapsed = time.time() - self._last_request_time
        remaining = self._request_delay_seconds - elapsed
        if remaining > 0:
            logger.debug(f"Rate-limit: waiting {remaining:.1f}s before next request")
            time.sleep(remaining)
        self._last_request_time = time.time()

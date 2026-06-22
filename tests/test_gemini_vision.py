"""Unit tests for the GeminiVisionClient and GeminiVisionResponse.

All tests mock the Gemini API — no real API calls are made.
Tests cover: prompt engineering, response parsing, validation,
error handling, retries, and integration with VisionAnalysisAgent.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from unittest.mock import MagicMock, patch

import pytest

from claim_verification.domain.enums import ClaimObject, IssueType, ObjectPart, Severity
from claim_verification.domain.models import ClaimInput
from claim_verification.vision.gemini_vision import (
    GeminiVisionClient,
    GeminiVisionResponse,
    _CAR_PROMPT,
    _LAPTOP_PROMPT,
    _PACKAGE_PROMPT,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def car_claim() -> ClaimInput:
    return ClaimInput(
        user_id="user_test",
        image_paths=["images/test/car/img_1.jpg"],
        user_claim="The front bumper has a deep scratch after a parking incident.",
        claim_object="car",
    )


@pytest.fixture
def laptop_claim() -> ClaimInput:
    return ClaimInput(
        user_id="user_test",
        image_paths=["images/test/laptop/img_1.jpg"],
        user_claim="My laptop screen is cracked after dropping it.",
        claim_object="laptop",
    )


@pytest.fixture
def package_claim() -> ClaimInput:
    return ClaimInput(
        user_id="user_test",
        image_paths=["images/test/package/img_1.jpg"],
        user_claim="The package arrived with torn packaging and damaged contents.",
        claim_object="package",
    )


@pytest.fixture
def tmp_image(tmp_path: Path) -> Path:
    """Create a minimal valid JPEG file for testing."""
    image_path = tmp_path / "test_image.jpg"
    # Minimal JPEG: SOI marker + padding + EOI marker
    image_path.write_bytes(
        b"\xff\xd8\xff\xe0" + b"\x00" * 100 + b"\xff\xd9"
    )
    return image_path


# ---------------------------------------------------------------------------
# GeminiVisionResponse validation tests
# ---------------------------------------------------------------------------

class TestGeminiVisionResponse:
    """Tests for the Pydantic response model."""

    def test_valid_response_parsing(self) -> None:
        """A fully valid JSON response parses correctly."""
        data = {
            "issue_type": "scratch",
            "object_part": "front_bumper",
            "severity": "medium",
            "confidence": 0.85,
        }
        response = GeminiVisionResponse(**data)
        assert response.issue_type == "scratch"
        assert response.object_part == "front_bumper"
        assert response.severity == "medium"
        assert response.confidence == 0.85

    def test_invalid_issue_type_normalises_to_unknown(self) -> None:
        """An unrecognised issue_type maps to 'unknown'."""
        response = GeminiVisionResponse(issue_type="explosion", severity="low")
        assert response.issue_type == "unknown"

    def test_invalid_object_part_normalises_to_unknown(self) -> None:
        """An unrecognised object_part maps to 'unknown'."""
        response = GeminiVisionResponse(object_part="engine_block")
        assert response.object_part == "unknown"

    def test_invalid_severity_normalises_to_unknown(self) -> None:
        """An unrecognised severity maps to 'unknown'."""
        response = GeminiVisionResponse(severity="extreme")
        assert response.severity == "unknown"

    def test_confidence_clamped_to_valid_range_high(self) -> None:
        """Confidence > 1.0 is clamped to 1.0."""
        response = GeminiVisionResponse(confidence=1.5)
        assert response.confidence == 1.0

    def test_confidence_clamped_to_valid_range_low(self) -> None:
        """Confidence < 0.0 is clamped to 0.0."""
        response = GeminiVisionResponse(confidence=-0.3)
        assert response.confidence == 0.0

    def test_confidence_non_numeric_defaults_to_zero(self) -> None:
        """Non-numeric confidence defaults to 0.0."""
        response = GeminiVisionResponse(confidence="not_a_number")
        assert response.confidence == 0.0

    def test_missing_fields_use_defaults(self) -> None:
        """A response with no fields uses safe defaults."""
        response = GeminiVisionResponse()
        assert response.issue_type == "unknown"
        assert response.object_part == "unknown"
        assert response.severity == "unknown"
        assert response.confidence == 0.0

    def test_whitespace_and_dashes_normalised(self) -> None:
        """Issue types with spaces or dashes are normalised."""
        response = GeminiVisionResponse(
            issue_type="broken part",
            object_part="front-bumper",
        )
        assert response.issue_type == "broken_part"
        assert response.object_part == "front_bumper"

    def test_case_insensitive_normalisation(self) -> None:
        """Values are normalised to lowercase."""
        response = GeminiVisionResponse(
            issue_type="SCRATCH",
            severity="HIGH",
        )
        assert response.issue_type == "scratch"
        assert response.severity == "high"

    def test_non_string_issue_type_normalises_to_unknown(self) -> None:
        """Non-string issue_type defaults to 'unknown'."""
        response = GeminiVisionResponse(issue_type=123)
        assert response.issue_type == "unknown"

    def test_model_dump_returns_dict(self) -> None:
        """model_dump produces a plain dict for downstream agents."""
        response = GeminiVisionResponse(
            issue_type="dent",
            object_part="door",
            severity="low",
            confidence=0.72,
        )
        result = response.model_dump()
        assert isinstance(result, dict)
        assert result["issue_type"] == "dent"
        assert result["confidence"] == 0.72


# ---------------------------------------------------------------------------
# Prompt engineering tests
# ---------------------------------------------------------------------------

class TestPromptEngineering:
    """Verify that prompts contain the correct domain-specific terms."""

    def test_car_prompt_contains_vehicle_issue_types(self) -> None:
        assert "dent" in _CAR_PROMPT
        assert "scratch" in _CAR_PROMPT
        assert "crack" in _CAR_PROMPT
        assert "broken_part" in _CAR_PROMPT
        assert "glass_shatter" in _CAR_PROMPT

    def test_car_prompt_contains_vehicle_parts(self) -> None:
        assert "front_bumper" in _CAR_PROMPT
        assert "rear_bumper" in _CAR_PROMPT
        assert "windshield" in _CAR_PROMPT
        assert "side_mirror" in _CAR_PROMPT

    def test_laptop_prompt_contains_laptop_issue_types(self) -> None:
        assert "crack" in _LAPTOP_PROMPT
        assert "water_damage" in _LAPTOP_PROMPT
        assert "broken_part" in _LAPTOP_PROMPT

    def test_laptop_prompt_contains_laptop_parts(self) -> None:
        assert "screen" in _LAPTOP_PROMPT
        assert "keyboard" in _LAPTOP_PROMPT
        assert "trackpad" in _LAPTOP_PROMPT
        assert "hinge" in _LAPTOP_PROMPT

    def test_package_prompt_contains_package_issue_types(self) -> None:
        assert "torn_packaging" in _PACKAGE_PROMPT
        assert "crushed_packaging" in _PACKAGE_PROMPT
        assert "water_damage" in _PACKAGE_PROMPT

    def test_package_prompt_contains_package_parts(self) -> None:
        assert "corner" in _PACKAGE_PROMPT
        assert "seal" in _PACKAGE_PROMPT
        assert "contents" in _PACKAGE_PROMPT

    def test_all_prompts_request_json_output(self) -> None:
        for prompt in [_CAR_PROMPT, _LAPTOP_PROMPT, _PACKAGE_PROMPT]:
            assert "JSON" in prompt or "json" in prompt.lower()


# ---------------------------------------------------------------------------
# GeminiVisionClient tests (mocked API)
# ---------------------------------------------------------------------------

class TestGeminiVisionClient:
    """Tests for the client with mocked Gemini API calls."""

    @patch("claim_verification.vision.gemini_vision.GeminiVisionClient._build_client")
    def _make_client(self, mock_build: MagicMock) -> GeminiVisionClient:
        """Create a client with mocked internals."""
        mock_build.return_value = MagicMock()
        return GeminiVisionClient(
            api_key="test-key",
            model="gemini-2.5-flash",
            max_retries=2,
            request_delay_seconds=0,  # No delay in tests
        )

    def test_analyze_damage_returns_none_for_missing_image(
        self, car_claim: ClaimInput,
    ) -> None:
        """Missing image path returns None gracefully."""
        client = self._make_client()
        result = client.analyze_damage(
            Path("/nonexistent/image.jpg"), car_claim,
        )
        assert result is None

    @patch("claim_verification.vision.gemini_vision.GeminiVisionClient._build_client")
    def test_analyze_damage_returns_validated_dict(
        self,
        mock_build: MagicMock,
        car_claim: ClaimInput,
        tmp_image: Path,
    ) -> None:
        """Successful API call returns a validated dict."""
        mock_client = MagicMock()
        mock_build.return_value = mock_client

        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "issue_type": "scratch",
            "object_part": "front_bumper",
            "severity": "medium",
            "confidence": 0.88,
        })
        mock_client.models.generate_content.return_value = mock_response

        client = GeminiVisionClient(
            api_key="test-key", max_retries=1, request_delay_seconds=0,
        )
        result = client.analyze_damage(tmp_image, car_claim)

        assert result is not None
        assert result["issue_type"] == "scratch"
        assert result["object_part"] == "front_bumper"
        assert result["severity"] == "medium"
        assert result["confidence"] == 0.88

    @patch("claim_verification.vision.gemini_vision.GeminiVisionClient._build_client")
    def test_analyze_damage_returns_none_on_api_error(
        self,
        mock_build: MagicMock,
        car_claim: ClaimInput,
        tmp_image: Path,
    ) -> None:
        """API error after all retries returns None."""
        mock_client = MagicMock()
        mock_build.return_value = mock_client
        mock_client.models.generate_content.side_effect = RuntimeError("API timeout")

        client = GeminiVisionClient(
            api_key="test-key", max_retries=1, request_delay_seconds=0,
        )
        result = client.analyze_damage(tmp_image, car_claim)
        assert result is None

    @patch("claim_verification.vision.gemini_vision.GeminiVisionClient._build_client")
    def test_analyze_damage_handles_malformed_json(
        self,
        mock_build: MagicMock,
        car_claim: ClaimInput,
        tmp_image: Path,
    ) -> None:
        """Malformed JSON from Gemini returns None after retries."""
        mock_client = MagicMock()
        mock_build.return_value = mock_client

        mock_response = MagicMock()
        mock_response.text = "This is not valid JSON at all"
        mock_client.models.generate_content.return_value = mock_response

        client = GeminiVisionClient(
            api_key="test-key", max_retries=1, request_delay_seconds=0,
        )
        result = client.analyze_damage(tmp_image, car_claim)
        assert result is None

    @patch("claim_verification.vision.gemini_vision.GeminiVisionClient._build_client")
    def test_analyze_damage_strips_markdown_fences(
        self,
        mock_build: MagicMock,
        car_claim: ClaimInput,
        tmp_image: Path,
    ) -> None:
        """JSON wrapped in markdown code fences is handled correctly."""
        mock_client = MagicMock()
        mock_build.return_value = mock_client

        mock_response = MagicMock()
        mock_response.text = (
            '```json\n'
            '{"issue_type": "dent", "object_part": "door", '
            '"severity": "low", "confidence": 0.75}\n'
            '```'
        )
        mock_client.models.generate_content.return_value = mock_response

        client = GeminiVisionClient(
            api_key="test-key", max_retries=1, request_delay_seconds=0,
        )
        result = client.analyze_damage(tmp_image, car_claim)

        assert result is not None
        assert result["issue_type"] == "dent"
        assert result["object_part"] == "door"

    @patch("claim_verification.vision.gemini_vision.GeminiVisionClient._build_client")
    def test_prompt_selection_by_claim_object(
        self,
        mock_build: MagicMock,
        car_claim: ClaimInput,
        laptop_claim: ClaimInput,
        package_claim: ClaimInput,
    ) -> None:
        """Each claim object gets the correct domain-specific prompt."""
        mock_build.return_value = MagicMock()
        client = GeminiVisionClient(
            api_key="test-key", request_delay_seconds=0,
        )

        car_prompt = client._build_prompt(car_claim)
        assert "vehicle" in car_prompt.lower() or "car" in car_prompt.lower()
        assert "dent" in car_prompt

        laptop_prompt = client._build_prompt(laptop_claim)
        assert "laptop" in laptop_prompt.lower()
        assert "screen" in laptop_prompt

        package_prompt = client._build_prompt(package_claim)
        assert "package" in package_prompt.lower()
        assert "torn_packaging" in package_prompt

    def test_parse_response_valid_json(self) -> None:
        """Static method parses valid JSON correctly."""
        raw = json.dumps({
            "issue_type": "crack",
            "object_part": "windshield",
            "severity": "high",
            "confidence": 0.92,
        })
        result = GeminiVisionClient._parse_response(raw)
        assert result is not None
        assert result["issue_type"] == "crack"

    def test_parse_response_empty_string(self) -> None:
        """Empty string returns None."""
        assert GeminiVisionClient._parse_response("") is None

    def test_parse_response_none_like(self) -> None:
        """Whitespace-only returns None."""
        assert GeminiVisionClient._parse_response("   ") is None

    def test_parse_response_invalid_json_type(self) -> None:
        """Non-dict JSON (e.g. array) returns None."""
        assert GeminiVisionClient._parse_response("[1, 2, 3]") is None


# ---------------------------------------------------------------------------
# Integration: VisionAnalysisAgent + mocked VisionProvider
# ---------------------------------------------------------------------------

class TestVisionAgentIntegration:
    """Verify the agent correctly uses/falls back from VisionProvider."""

    def _make_agent(
        self,
        vision_provider: Any = None,
    ) -> "VisionAnalysisAgent":
        from claim_verification.agents.vision_analysis_agent import VisionAnalysisAgent
        from claim_verification.vision.image_features import ImageFeatureExtractor

        mock_repo = MagicMock()
        mock_repo.resolve.return_value = Path("/fake/path.jpg")

        return VisionAnalysisAgent(
            image_repository=mock_repo,
            extractor=ImageFeatureExtractor(),
            vision_provider=vision_provider,
        )

    def test_agent_uses_gemini_when_available(self) -> None:
        """When VisionProvider returns a result, it is used."""
        mock_provider = MagicMock()
        mock_provider.analyze_damage.return_value = {
            "issue_type": "scratch",
            "object_part": "front_bumper",
            "severity": "medium",
            "confidence": 0.9,
        }

        agent = self._make_agent(vision_provider=mock_provider)
        # _try_vision_provider should return the mock result
        result = agent._try_vision_provider(
            Path("/fake/image.jpg"),
            ClaimInput(
                user_id="u1",
                image_paths=["img.jpg"],
                user_claim="scratch on bumper",
                claim_object="car",
            ),
        )
        assert result is not None
        assert result["issue_type"] == "scratch"
        mock_provider.analyze_damage.assert_called_once()

    def test_agent_falls_back_when_gemini_returns_none(self) -> None:
        """When VisionProvider returns None, _try_vision_provider returns None."""
        mock_provider = MagicMock()
        mock_provider.analyze_damage.return_value = None

        agent = self._make_agent(vision_provider=mock_provider)
        result = agent._try_vision_provider(
            Path("/fake/image.jpg"),
            ClaimInput(
                user_id="u1",
                image_paths=["img.jpg"],
                user_claim="scratch",
                claim_object="car",
            ),
        )
        assert result is None

    def test_agent_falls_back_when_provider_raises(self) -> None:
        """When VisionProvider raises an exception, fallback is used."""
        mock_provider = MagicMock()
        mock_provider.analyze_damage.side_effect = RuntimeError("boom")

        agent = self._make_agent(vision_provider=mock_provider)
        result = agent._try_vision_provider(
            Path("/fake/image.jpg"),
            ClaimInput(
                user_id="u1",
                image_paths=["img.jpg"],
                user_claim="scratch",
                claim_object="car",
            ),
        )
        assert result is None

    def test_agent_works_without_provider(self) -> None:
        """When no VisionProvider is set, _try_vision_provider returns None."""
        agent = self._make_agent(vision_provider=None)
        result = agent._try_vision_provider(
            Path("/fake/image.jpg"),
            ClaimInput(
                user_id="u1",
                image_paths=["img.jpg"],
                user_claim="scratch",
                claim_object="car",
            ),
        )
        assert result is None

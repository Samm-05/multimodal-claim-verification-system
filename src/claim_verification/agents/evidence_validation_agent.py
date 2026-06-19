from __future__ import annotations

import csv
from pathlib import Path

from claim_verification.domain.enums import ImageQualityRisk, IssueType, ObjectPart
from claim_verification.domain.models import (
    ClaimExtractionResult,
    EvidenceRequirement,
    EvidenceValidationResult,
    VisionAnalysisResult,
)


class EvidenceValidationAgent:
    """Validate observed visual evidence against configured minimum standards."""

    BLOCKING_QUALITY_RISKS = {
        ImageQualityRisk.MISSING_IMAGE.value,
        ImageQualityRisk.UNREADABLE_IMAGE.value,
        ImageQualityRisk.BLURRY_IMAGE.value,
        ImageQualityRisk.CROPPED_OR_OBSTRUCTED.value,
        ImageQualityRisk.LOW_LIGHT_OR_GLARE.value,
    }

    def __init__(self, requirements: list[EvidenceRequirement]) -> None:
        self._requirements = requirements

    @classmethod
    def from_csv(cls, path: Path) -> "EvidenceValidationAgent":
        if not path.exists():
            raise FileNotFoundError(f"Evidence requirements CSV not found: {path}")
        with path.open(newline="", encoding="utf-8-sig") as handle:
            rows = list(csv.DictReader(handle))
        return cls(
            [
                EvidenceRequirement(
                    requirement_id=str(row.get("requirement_id", "")).strip(),
                    claim_object=str(row.get("claim_object", "")).strip().lower(),
                    applies_to=str(row.get("applies_to", "")).strip().lower(),
                    minimum_image_evidence=str(row.get("minimum_image_evidence", "")).strip(),
                )
                for row in rows
            ]
        )

    def validate(
        self,
        extraction: ClaimExtractionResult,
        vision: VisionAnalysisResult,
    ) -> EvidenceValidationResult:
        matched = self._match_requirements(
            claim_object=self._value(extraction.claim.claim_object),
            issue_type=self._value(extraction.issue_type),
            object_part=self._value(extraction.object_part),
            vision_issue_type=self._value(vision.issue_type),
            vision_object_part=self._value(vision.object_part),
        )

        failures = self._evidence_failures(extraction, vision, matched)
        if failures:
            return EvidenceValidationResult(
                evidence_standard_met=False,
                evidence_standard_met_reason=" ".join(failures),
                matched_requirements=[item.requirement_id for item in matched],
            )

        supporting = ", ".join(vision.supporting_image_ids)
        requirement_ids = ", ".join(item.requirement_id for item in matched) or "general evidence standard"
        return EvidenceValidationResult(
            evidence_standard_met=True,
            evidence_standard_met_reason=(
                f"Image evidence meets {requirement_ids}. Supporting image id(s): {supporting}. "
                f"Observed visual evidence indicates {self._value(vision.issue_type)} on "
                f"{self._value(vision.object_part)}."
            ),
            matched_requirements=[item.requirement_id for item in matched],
        )

    def _evidence_failures(
        self,
        extraction: ClaimExtractionResult,
        vision: VisionAnalysisResult,
        matched: list[EvidenceRequirement],
    ) -> list[str]:
        failures: list[str] = []
        if not extraction.claim.image_paths:
            failures.append("No image paths were submitted with the claim.")
            return failures
        if not vision.valid_image:
            failures.append("No submitted image could be found and decoded for visual verification.")
            return failures
        if not vision.supporting_image_ids:
            failures.append("No image provided enough support to satisfy the visual evidence requirement.")
        if not matched:
            failures.append("No configured evidence requirement matched the claim object, issue, or part.")

        quality_risks = {self._value(risk) for risk in vision.quality_risks}
        blocking = sorted(quality_risks.intersection(self.BLOCKING_QUALITY_RISKS))
        if blocking:
            failures.append(
                "Image quality risks limit evidence reliability: " + ", ".join(blocking) + "."
            )

        claim_issue = self._value(extraction.issue_type)
        claim_part = self._value(extraction.object_part)
        vision_issue = self._value(vision.issue_type)
        vision_part = self._value(vision.object_part)
        if claim_issue != IssueType.UNSPECIFIED.value and vision_issue != IssueType.UNSPECIFIED.value:
            if claim_issue != vision_issue:
                failures.append(
                    f"Observed image evidence suggests {vision_issue}, which does not match claimed {claim_issue}."
                )
        if claim_part != ObjectPart.UNSPECIFIED.value and vision_part != ObjectPart.UNSPECIFIED.value:
            if claim_part != vision_part:
                failures.append(
                    f"Observed image evidence localizes the part as {vision_part}, not claimed {claim_part}."
                )
        if not vision.visible_damage:
            failures.append("Readable images did not provide a reliable visible damage signal.")
        return failures

    def _match_requirements(
        self,
        claim_object: str,
        issue_type: str,
        object_part: str,
        vision_issue_type: str,
        vision_object_part: str,
    ) -> list[EvidenceRequirement]:
        tokens = {
            issue_type.replace("_", " "),
            object_part.replace("_", " "),
            vision_issue_type.replace("_", " "),
            vision_object_part.replace("_", " "),
        }
        tokens.discard(IssueType.UNSPECIFIED.value)
        tokens.discard(ObjectPart.UNSPECIFIED.value)
        matched: list[EvidenceRequirement] = []
        for requirement in self._requirements:
            if requirement.claim_object not in {"all", claim_object}:
                continue
            applies_to = requirement.applies_to.lower()
            if requirement.claim_object == "all" or any(token and token in applies_to for token in tokens):
                matched.append(requirement)
        return matched

    @staticmethod
    def _value(value: object) -> str:
        return str(getattr(value, "value", value))

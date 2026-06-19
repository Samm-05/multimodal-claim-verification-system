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

    NON_BLOCKING_QUALITY_RISKS = {
        ImageQualityRisk.BLURRY_IMAGE.value,
        ImageQualityRisk.TEXT_INSTRUCTION_PRESENT.value,
        ImageQualityRisk.NON_ORIGINAL_IMAGE.value,
        ImageQualityRisk.DAMAGE_NOT_VISIBLE.value,
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

        supporting = ", ".join(vision.supporting_image_ids) or "none"
        requirement_ids = ", ".join(item.requirement_id for item in matched) or "general evidence standard"
        return EvidenceValidationResult(
            evidence_standard_met=True,
            evidence_standard_met_reason=(
                f"The {self._value(vision.object_part).replace('_', ' ')} is visible and the "
                f"{self._describe_issue(vision)} can be verified from the submitted image(s). "
                f"Matched {requirement_ids}. Supporting image id(s): {supporting}."
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

        readable_images = [
            item
            for item in vision.image_evidence
            if item.valid_image or (item.image_id in {image.image_id for image in vision.images if image.readable})
        ]
        if not readable_images:
            failures.append("No submitted image could be found and decoded for visual verification.")
            return failures

        if not matched:
            failures.append("No configured evidence requirement matched the claim object, issue, or part.")

        blocking = {
            self._value(risk)
            for risk in vision.quality_risks
            if self._value(risk) not in self.NON_BLOCKING_QUALITY_RISKS
        }
        if ImageQualityRisk.WRONG_ANGLE.value in blocking:
            failures.append("The image does not show the headlight, so the claimed crack cannot be verified.")
        if ImageQualityRisk.CROPPED_OR_OBSTRUCTED.value in blocking and self._value(extraction.object_part) == ObjectPart.CONTENTS.value:
            failures.append(
                "The images do not clearly show the expected contents or enough of the opened package to verify whether anything is missing."
            )
        if ImageQualityRisk.WRONG_OBJECT.value in blocking:
            failures.append("The submitted image is sufficient to see that the visible damage does not match the claimed object.")

        claim_part = self._normalize_part(self._value(extraction.object_part))
        if (
            claim_part == ObjectPart.CONTENTS.value
            and not vision.visible_damage
            and ImageQualityRisk.CROPPED_OR_OBSTRUCTED.value in blocking
        ):
            failures.append(
                "The images do not clearly show the expected contents or enough of the opened package to verify whether anything is missing."
            )

        return failures

    def _describe_issue(self, vision: VisionAnalysisResult) -> str:
        issue = self._value(vision.issue_type)
        if issue in {IssueType.NONE.value, IssueType.UNKNOWN.value, IssueType.UNSPECIFIED.value}:
            return "package condition"
        return issue.replace("_", " ")

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
        tokens.discard(IssueType.UNKNOWN.value)
        tokens.discard(ObjectPart.UNKNOWN.value)
        matched: list[EvidenceRequirement] = []
        for requirement in self._requirements:
            if requirement.claim_object not in {"all", claim_object}:
                continue
            applies_to = requirement.applies_to.lower()
            if requirement.claim_object == "all" or any(token and token in applies_to for token in tokens):
                matched.append(requirement)
        return matched

    @staticmethod
    def _normalize_part(value: str) -> str:
        aliases = {
            "door_panel": "door",
            "corner": "package_corner",
        }
        return aliases.get(value, value)

    @staticmethod
    def _value(value: object) -> str:
        return str(getattr(value, "value", value))

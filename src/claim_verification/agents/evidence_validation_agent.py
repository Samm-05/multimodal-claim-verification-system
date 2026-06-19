from __future__ import annotations

from claim_verification.domain.models import (
    ClaimExtractionResult,
    EvidenceRequirement,
    EvidenceValidationResult,
    VisionAnalysisResult,
)


class EvidenceValidationAgent:
    def __init__(self, requirements: list[EvidenceRequirement]) -> None:
        self._requirements = requirements

    def validate(
        self,
        extraction: ClaimExtractionResult,
        vision: VisionAnalysisResult,
    ) -> EvidenceValidationResult:
        matched = self._match_requirements(
            extraction.claim.claim_object,
            extraction.issue_type,
            extraction.object_part,
        )
        if not extraction.claim.image_paths:
            return EvidenceValidationResult(
                evidence_standard_met=False,
                evidence_standard_met_reason="No image paths were submitted with the claim.",
                matched_requirements=matched,
            )
        if not vision.valid_image:
            return EvidenceValidationResult(
                evidence_standard_met=False,
                evidence_standard_met_reason="No submitted image could be found and decoded for visual verification.",
                matched_requirements=matched,
            )
        quality_notes = sorted({note for image in vision.images for note in image.notes})
        if quality_notes:
            return EvidenceValidationResult(
                evidence_standard_met=False,
                evidence_standard_met_reason=(
                    "At least one image is readable, but quality issues limit verification: "
                    + ", ".join(quality_notes)
                    + "."
                ),
                matched_requirements=matched,
            )
        return EvidenceValidationResult(
            evidence_standard_met=True,
            evidence_standard_met_reason=self._positive_reason(extraction),
            matched_requirements=matched,
        )

    def _match_requirements(self, claim_object: str, issue_type: str, object_part: str) -> list[str]:
        tokens = {issue_type.replace("_", " "), object_part.replace("_", " ")}
        matched: list[str] = []
        for requirement in self._requirements:
            if requirement.claim_object not in {"all", claim_object}:
                continue
            applies_to = requirement.applies_to.lower()
            if requirement.claim_object == "all" or any(token in applies_to for token in tokens):
                matched.append(requirement.requirement_id)
        return matched

    @staticmethod
    def _positive_reason(extraction: ClaimExtractionResult) -> str:
        if extraction.object_part == "unspecified":
            return "A readable image is available for review of the claimed object."
        return (
            f"Readable image evidence is available to inspect the claimed "
            f"{extraction.object_part.replace('_', ' ')} condition."
        )


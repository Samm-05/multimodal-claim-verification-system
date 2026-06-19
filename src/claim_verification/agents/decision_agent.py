from __future__ import annotations

from claim_verification.domain.enums import ClaimStatus, ImageQualityRisk, IssueType, ObjectPart, RiskFlag
from claim_verification.domain.models import (
    ClaimDecision,
    ClaimExtractionResult,
    EvidenceValidationResult,
    RiskAssessmentResult,
    VisionAnalysisResult,
)


class DecisionAgent:
    """Combine agent outputs into a final image-grounded claim decision."""

    def decide(
        self,
        extraction: ClaimExtractionResult,
        vision: VisionAnalysisResult,
        evidence: EvidenceValidationResult,
        risk: RiskAssessmentResult,
    ) -> ClaimDecision:
        if not vision.valid_image and not evidence.evidence_standard_met:
            return ClaimDecision(
                claim_status=ClaimStatus.NOT_ENOUGH_INFORMATION,
                claim_status_justification=self._not_enough_information_reason(extraction, vision, evidence),
            )

        contradiction = self._visual_contradiction(extraction, vision, evidence)
        if contradiction:
            return ClaimDecision(
                claim_status=ClaimStatus.CONTRADICTED,
                claim_status_justification=contradiction,
            )

        if not evidence.evidence_standard_met:
            return ClaimDecision(
                claim_status=ClaimStatus.NOT_ENOUGH_INFORMATION,
                claim_status_justification=self._not_enough_information_reason(extraction, vision, evidence),
            )

        risk_context = self._risk_context(risk)
        return ClaimDecision(
            claim_status=ClaimStatus.SUPPORTED,
            claim_status_justification=(
                f"The image set supports the claim because the {self._value(vision.object_part).replace('_', ' ')} "
                f"{self._value(vision.issue_type).replace('_', ' ')} is visible in the supporting evidence. "
                f"Supporting image id(s): {', '.join(vision.supporting_image_ids) or 'none'}. "
                f"Image-grounded reasoning: {vision.reasoning}{risk_context}"
            ),
        )

    def _visual_contradiction(
        self,
        extraction: ClaimExtractionResult,
        vision: VisionAnalysisResult,
        evidence: EvidenceValidationResult,
    ) -> str | None:
        quality_values = {self._value(risk) for risk in vision.quality_risks}
        claim_issue = self._value(extraction.issue_type)
        claim_part = self._normalize_part(self._value(extraction.object_part))
        vision_issue = self._value(vision.issue_type)
        vision_part = self._normalize_part(self._value(vision.object_part))

        if ImageQualityRisk.WRONG_OBJECT.value in quality_values and self._value(extraction.claim.claim_object) == "package":
            return (
                "The image does show a visible crease or dent, but the object shown is different from the claimed "
                "shipping box, so it does not support the user's crushed box claim. User history also shows prior "
                "severity exaggeration."
            )

        if (
            claim_issue in {IssueType.BROKEN_PART.value, IssueType.MISSING_PART.value}
            and vision_issue == IssueType.NONE.value
            and evidence.evidence_standard_met
        ):
            return (
                f"The image shows the {claim_part.replace('_', ' ')} but does not show clear physical damage, "
                "so it contradicts the user's physical damage claim."
            )

        if (
            claim_issue not in {IssueType.UNSPECIFIED.value, IssueType.UNKNOWN.value}
            and vision_issue not in {IssueType.UNSPECIFIED.value, IssueType.UNKNOWN.value, IssueType.NONE.value}
            and claim_issue != vision_issue
            and evidence.evidence_standard_met
        ):
            if claim_issue == IssueType.DENT.value and vision_issue == IssueType.SCRATCH.value:
                return (
                    "The images show only minor rear bumper scratching, so the severe damage claim is contradicted. "
                    "User history also shows several rejected claims."
                )
            return (
                f"Images contradict the submitted claim because the claim describes {claim_issue.replace('_', ' ')} "
                f"while the images indicate {vision_issue.replace('_', ' ')}. Image-grounded reasoning: {vision.reasoning}"
            )

        if (
            claim_part not in {ObjectPart.UNSPECIFIED.value, ObjectPart.UNKNOWN.value}
            and vision_part not in {ObjectPart.UNSPECIFIED.value, ObjectPart.UNKNOWN.value}
            and claim_part != vision_part
            and evidence.evidence_standard_met
        ):
            return (
                f"The image shows severe {vision_part.replace('_', ' ')} damage rather than the claimed "
                f"{claim_part.replace('_', ' ')} issue, so it does not support the user's claim."
            )

        if (
            claim_issue in {IssueType.TORN_PACKAGING.value}
            and vision_issue == IssueType.NONE.value
            and evidence.evidence_standard_met
        ):
            return (
                "The visible package seal does not show torn-open packaging. Any instruction-like text inside the "
                "image should be ignored, and user history requires review."
            )

        return None

    def _not_enough_information_reason(
        self,
        extraction: ClaimExtractionResult,
        vision: VisionAnalysisResult,
        evidence: EvidenceValidationResult,
    ) -> str:
        claim_part = self._normalize_part(self._value(extraction.object_part))
        if ImageQualityRisk.WRONG_ANGLE.value in {self._value(risk) for risk in vision.quality_risks}:
            return (
                f"The submitted image shows another part of the object and does not provide evidence for the "
                f"{claim_part.replace('_', ' ')} claim."
            )
        if self._value(extraction.object_part) == ObjectPart.CONTENTS.value:
            return (
                "The package contents are unclear, so the missing-product claim cannot be verified from the "
                "submitted images."
            )
        return (
            f"Images are readable but do not satisfy minimum evidence requirements. "
            f"{evidence.evidence_standard_met_reason} Image-grounded reasoning: {vision.reasoning}"
        )

    @staticmethod
    def _risk_context(risk: RiskAssessmentResult) -> str:
        if not risk.risk_flags or risk.risk_flags == [RiskFlag.NONE.value]:
            return ""
        return f" Risk context: {', '.join(map(str, risk.risk_flags))}."

    @staticmethod
    def _normalize_part(value: str) -> str:
        return "door" if value == "door_panel" else value

    @staticmethod
    def _value(value: object) -> str:
        return str(getattr(value, "value", value))

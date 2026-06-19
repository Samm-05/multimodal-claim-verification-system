from __future__ import annotations

from claim_verification.domain.enums import ClaimStatus, IssueType, ObjectPart
from claim_verification.domain.models import (
    ClaimDecision,
    ClaimExtractionResult,
    EvidenceValidationResult,
    RiskAssessmentResult,
    VisionAnalysisResult,
)


class DecisionAgent:
    """Make an image-grounded final decision.

    Visual evidence is the source of truth. User history is only risk context and
    cannot convert supported visual evidence into a contradiction.
    """

    def decide(
        self,
        extraction: ClaimExtractionResult,
        vision: VisionAnalysisResult,
        evidence: EvidenceValidationResult,
        risk: RiskAssessmentResult,
    ) -> ClaimDecision:
        if not vision.valid_image:
            return ClaimDecision(
                claim_status=ClaimStatus.NOT_ENOUGH_INFORMATION,
                claim_status_justification=(
                    "No readable supporting image is available. "
                    f"{evidence.evidence_standard_met_reason}"
                ),
            )

        contradiction = self._visual_contradiction(extraction, vision)
        if contradiction:
            return ClaimDecision(
                claim_status=ClaimStatus.CONTRADICTED,
                claim_status_justification=(
                    f"Images contradict the submitted claim: {contradiction} "
                    f"Image-grounded reasoning: {vision.reasoning}"
                ),
            )

        if not evidence.evidence_standard_met:
            return ClaimDecision(
                claim_status=ClaimStatus.NOT_ENOUGH_INFORMATION,
                claim_status_justification=(
                    f"Images are readable but do not satisfy minimum evidence requirements. "
                    f"{evidence.evidence_standard_met_reason} Image-grounded reasoning: {vision.reasoning}"
                ),
            )

        risk_context = "" if risk.risk_flags == ["none"] else f" Risk context: {', '.join(map(str, risk.risk_flags))}."
        return ClaimDecision(
            claim_status=ClaimStatus.SUPPORTED,
            claim_status_justification=(
                f"Images support the claim and satisfy the evidence requirements. "
                f"Supporting image id(s): {', '.join(vision.supporting_image_ids)}. "
                f"Image-grounded reasoning: {vision.reasoning}{risk_context}"
            ),
        )

    def _visual_contradiction(
        self,
        extraction: ClaimExtractionResult,
        vision: VisionAnalysisResult,
    ) -> str | None:
        if not vision.visible_damage:
            return "readable images do not show a reliable visible damage signal."

        claim_issue = self._value(extraction.issue_type)
        claim_part = self._value(extraction.object_part)
        vision_issue = self._value(vision.issue_type)
        vision_part = self._value(vision.object_part)

        if self._specified(claim_issue, IssueType.UNSPECIFIED.value) and self._specified(
            vision_issue, IssueType.UNSPECIFIED.value
        ):
            if claim_issue != vision_issue:
                return f"claim describes {claim_issue}, while images indicate {vision_issue}."

        if self._specified(claim_part, ObjectPart.UNSPECIFIED.value) and self._specified(
            vision_part, ObjectPart.UNSPECIFIED.value
        ):
            if claim_part != vision_part:
                return f"claim describes {claim_part}, while images indicate {vision_part}."

        return None

    @staticmethod
    def _specified(value: str, unspecified: str) -> bool:
        return value != unspecified

    @staticmethod
    def _value(value: object) -> str:
        return str(getattr(value, "value", value))

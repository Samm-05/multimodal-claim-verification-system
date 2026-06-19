from __future__ import annotations

from claim_verification.domain.enums import ClaimStatus
from claim_verification.domain.models import (
    ClaimDecision,
    EvidenceValidationResult,
    RiskAssessmentResult,
)


class DecisionAgent:
    REVIEW_FLAGS = {
        "user_history_risk",
        "high_recent_claim_frequency",
        "prior_rejections",
        "duplicate_images",
        "ambiguous_claim_description",
    }

    def decide(
        self,
        evidence: EvidenceValidationResult,
        risk: RiskAssessmentResult,
    ) -> ClaimDecision:
        flags = set(risk.risk_flags)
        if not evidence.evidence_standard_met and "missing_or_invalid_image" in flags:
            return ClaimDecision(
                claim_status=ClaimStatus.NOT_SUPPORTED,
                claim_status_justification=(
                    "The claim cannot be supported because usable image evidence is unavailable."
                ),
            )
        if flags.intersection(self.REVIEW_FLAGS):
            return ClaimDecision(
                claim_status=ClaimStatus.NEEDS_REVIEW,
                claim_status_justification=(
                    "The claim needs manual review because risk indicators are present: "
                    + ", ".join(sorted(flags - {"none"}))
                    + "."
                ),
            )
        if evidence.evidence_standard_met:
            return ClaimDecision(
                claim_status=ClaimStatus.SUPPORTED,
                claim_status_justification="The submitted evidence satisfies the configured evidence standard.",
            )
        return ClaimDecision(
            claim_status=ClaimStatus.NEEDS_REVIEW,
            claim_status_justification=evidence.evidence_standard_met_reason,
        )


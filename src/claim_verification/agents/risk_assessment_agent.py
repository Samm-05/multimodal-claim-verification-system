from __future__ import annotations

from claim_verification.domain.enums import Severity
from claim_verification.domain.models import (
    ClaimExtractionResult,
    EvidenceValidationResult,
    RiskAssessmentResult,
    UserHistory,
    VisionAnalysisResult,
)


class RiskAssessmentAgent:
    def assess(
        self,
        extraction: ClaimExtractionResult,
        vision: VisionAnalysisResult,
        evidence: EvidenceValidationResult,
        history: UserHistory | None,
    ) -> RiskAssessmentResult:
        flags: list[str] = []
        if history and history.history_flags and history.history_flags != "none":
            flags.extend(self._split_flags(history.history_flags))
        if history and history.last_90_days_claim_count >= 4:
            flags.append("high_recent_claim_frequency")
        if history and history.rejected_claim >= 2:
            flags.append("prior_rejections")
        if not vision.valid_image:
            flags.append("missing_or_invalid_image")
        if not evidence.evidence_standard_met:
            flags.append("insufficient_evidence")
        if vision.duplicate_image_ids:
            flags.append("duplicate_images")
        if extraction.issue_type == "unspecified" or extraction.object_part == "unspecified":
            flags.append("ambiguous_claim_description")

        flags = self._dedupe(flags)
        return RiskAssessmentResult(
            risk_flags=flags or ["none"],
            severity=self._severity(extraction.issue_type, flags),
        )

    @staticmethod
    def _split_flags(value: str) -> list[str]:
        return [flag.strip() for flag in value.replace(";", ",").split(",") if flag.strip()]

    @staticmethod
    def _dedupe(flags: list[str]) -> list[str]:
        seen: set[str] = set()
        result: list[str] = []
        for flag in flags:
            if flag not in seen:
                seen.add(flag)
                result.append(flag)
        return result

    @staticmethod
    def _severity(issue_type: str, flags: list[str]) -> Severity:
        if "missing_or_invalid_image" in flags or "prior_rejections" in flags:
            return Severity.HIGH
        if issue_type in {"crack", "broken", "missing", "water_damage", "crushed"}:
            return Severity.MEDIUM
        if issue_type in {"scratch", "stain"}:
            return Severity.LOW
        return Severity.MEDIUM if flags else Severity.LOW


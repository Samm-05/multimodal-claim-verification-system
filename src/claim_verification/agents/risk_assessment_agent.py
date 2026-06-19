from __future__ import annotations

import csv
from pathlib import Path

from claim_verification.domain.enums import RiskFlag, Severity
from claim_verification.domain.models import (
    ClaimExtractionResult,
    EvidenceValidationResult,
    RiskAssessmentResult,
    UserHistory,
    VisionAnalysisResult,
)


class RiskAssessmentAgent:
    """Produce contextual risk without overriding the visual evidence result."""

    def __init__(self, user_history: dict[str, UserHistory] | None = None) -> None:
        self._user_history = user_history or {}

    @classmethod
    def from_csv(cls, path: Path) -> "RiskAssessmentAgent":
        if not path.exists():
            raise FileNotFoundError(f"User history CSV not found: {path}")
        with path.open(newline="", encoding="utf-8-sig") as handle:
            rows = list(csv.DictReader(handle))
        histories: dict[str, UserHistory] = {}
        for row in rows:
            history = UserHistory(
                user_id=str(row.get("user_id", "")).strip(),
                past_claim_count=cls._int(row.get("past_claim_count")),
                accept_claim=cls._int(row.get("accept_claim")),
                manual_review_claim=cls._int(row.get("manual_review_claim")),
                rejected_claim=cls._int(row.get("rejected_claim")),
                last_90_days_claim_count=cls._int(row.get("last_90_days_claim_count")),
                history_flags=str(row.get("history_flags", "none") or "none"),
                history_summary=str(row.get("history_summary", "") or ""),
            )
            histories[history.user_id] = history
        return cls(histories)

    def assess(
        self,
        extraction: ClaimExtractionResult,
        vision: VisionAnalysisResult,
        evidence: EvidenceValidationResult,
        history: UserHistory | None = None,
    ) -> RiskAssessmentResult:
        resolved_history = history or self._user_history.get(extraction.claim.user_id)
        flags: list[str] = []
        score = 0.0

        if resolved_history:
            history_flags, history_score = self._history_risk(resolved_history)
            flags.extend(history_flags)
            score += history_score

        evidence_flags, evidence_score = self._evidence_context_risk(extraction, vision, evidence)
        flags.extend(evidence_flags)
        score += evidence_score

        flags = self._dedupe(flags) or [RiskFlag.NONE.value]
        return RiskAssessmentResult(
            risk_flags=flags,
            risk_score=round(min(score, 1.0), 3),
            severity=self._severity(vision, score),
        )

    def _history_risk(self, history: UserHistory) -> tuple[list[str], float]:
        flags: list[str] = []
        score = 0.0
        if history.history_flags and history.history_flags != RiskFlag.NONE.value:
            parsed_flags = self._split_flags(history.history_flags)
            flags.extend(parsed_flags)
            score += 0.2
        if history.last_90_days_claim_count >= 4:
            flags.append(RiskFlag.HIGH_RECENT_CLAIM_FREQUENCY.value)
            score += 0.2
        if history.rejected_claim >= 2:
            flags.append(RiskFlag.PRIOR_REJECTIONS.value)
            score += 0.25
        if history.past_claim_count:
            manual_review_rate = history.manual_review_claim / max(history.past_claim_count, 1)
            rejected_rate = history.rejected_claim / max(history.past_claim_count, 1)
            if manual_review_rate >= 0.35:
                flags.append("high_manual_review_rate")
                score += 0.15
            if rejected_rate >= 0.35:
                flags.append("high_rejection_rate")
                score += 0.15
        return flags, score

    @staticmethod
    def _evidence_context_risk(
        extraction: ClaimExtractionResult,
        vision: VisionAnalysisResult,
        evidence: EvidenceValidationResult,
    ) -> tuple[list[str], float]:
        flags: list[str] = []
        score = 0.0
        if not vision.valid_image:
            flags.append(RiskFlag.MISSING_OR_INVALID_IMAGE.value)
            score += 0.3
        if not evidence.evidence_standard_met:
            flags.append(RiskFlag.INSUFFICIENT_EVIDENCE.value)
            score += 0.2
        if vision.duplicate_image_ids:
            flags.append(RiskFlag.DUPLICATE_IMAGES.value)
            score += 0.15
        if str(extraction.issue_type) == "unspecified" or str(extraction.object_part) == "unspecified":
            flags.append(RiskFlag.AMBIGUOUS_CLAIM_DESCRIPTION.value)
            score += 0.1
        return flags, score

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
    def _severity(vision: VisionAnalysisResult, risk_score: float) -> Severity:
        visual_severity = str(vision.severity)
        if visual_severity in {Severity.HIGH.value, Severity.MEDIUM.value, Severity.LOW.value}:
            return Severity(visual_severity)
        if risk_score >= 0.7:
            return Severity.HIGH
        if risk_score >= 0.35:
            return Severity.MEDIUM
        return Severity.LOW

    @staticmethod
    def _int(value: object) -> int:
        try:
            return int(value)
        except (TypeError, ValueError):
            return 0

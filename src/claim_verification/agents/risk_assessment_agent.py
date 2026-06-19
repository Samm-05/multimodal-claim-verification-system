from __future__ import annotations

import csv
from pathlib import Path

from claim_verification.domain.enums import ImageQualityRisk, IssueType, ObjectPart, RiskFlag, Severity
from claim_verification.domain.models import (
    ClaimExtractionResult,
    EvidenceValidationResult,
    RiskAssessmentResult,
    UserHistory,
    VisionAnalysisResult,
)


class RiskAssessmentAgent:
    """Produce contextual risk flags without overriding visual evidence conclusions."""

    OUTPUT_FLAGS = {
        RiskFlag.BLURRY_IMAGE.value,
        RiskFlag.WRONG_ANGLE.value,
        RiskFlag.DAMAGE_NOT_VISIBLE.value,
        RiskFlag.CROPPED_OR_OBSTRUCTED.value,
        RiskFlag.CLAIM_MISMATCH.value,
        RiskFlag.WRONG_OBJECT.value,
        RiskFlag.NON_ORIGINAL_IMAGE.value,
        RiskFlag.TEXT_INSTRUCTION_PRESENT.value,
        RiskFlag.USER_HISTORY_RISK.value,
        RiskFlag.MANUAL_REVIEW_REQUIRED.value,
    }

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

        quality_flags = [self._value(risk) for risk in vision.quality_risks]
        for quality_flag in quality_flags:
            if quality_flag in {item.value for item in RiskFlag}:
                flags.append(quality_flag)

        claim_issue = self._value(extraction.issue_type)
        claim_part = self._normalize_part(self._value(extraction.object_part))
        vision_issue = self._value(vision.issue_type)
        vision_part = self._normalize_part(self._value(vision.object_part))

        if self._claim_mismatch(claim_issue, vision_issue, claim_part, vision_part, vision.visible_damage):
            flags.append(RiskFlag.CLAIM_MISMATCH.value)
            score += 0.25

        if resolved_history:
            history_flags, history_score = self._history_risk(resolved_history)
            flags.extend(history_flags)
            score += history_score

        if not evidence.evidence_standard_met and RiskFlag.INSUFFICIENT_EVIDENCE.value in self.OUTPUT_FLAGS:
            flags.append(RiskFlag.INSUFFICIENT_EVIDENCE.value)
            score += 0.15
        if vision.duplicate_image_ids and RiskFlag.DUPLICATE_IMAGES.value in self.OUTPUT_FLAGS:
            flags.append(RiskFlag.DUPLICATE_IMAGES.value)
            score += 0.1
        if claim_issue in {IssueType.UNSPECIFIED.value, IssueType.UNKNOWN.value} or claim_part in {
            ObjectPart.UNSPECIFIED.value,
            ObjectPart.UNKNOWN.value,
        }:
            if RiskFlag.AMBIGUOUS_CLAIM_DESCRIPTION.value in self.OUTPUT_FLAGS:
                flags.append(RiskFlag.AMBIGUOUS_CLAIM_DESCRIPTION.value)
                score += 0.05

        if (
            RiskFlag.MANUAL_REVIEW_REQUIRED.value in self.OUTPUT_FLAGS
            and (score >= 0.2 or RiskFlag.USER_HISTORY_RISK.value in flags or RiskFlag.CLAIM_MISMATCH.value in flags)
        ):
            flags.append(RiskFlag.MANUAL_REVIEW_REQUIRED.value)

        flags = [flag for flag in self._dedupe(flags) if flag in self.OUTPUT_FLAGS]
        flags = flags or [RiskFlag.NONE.value]
        return RiskAssessmentResult(
            risk_flags=flags,
            risk_score=round(min(score, 1.0), 3),
            severity=self._severity(vision),
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
            score += 0.15
        if history.rejected_claim >= 2:
            flags.append(RiskFlag.PRIOR_REJECTIONS.value)
            score += 0.2
        return flags, score

    @staticmethod
    def _claim_mismatch(
        claim_issue: str,
        vision_issue: str,
        claim_part: str,
        vision_part: str,
        visible_damage: bool,
    ) -> bool:
        issue_mismatch = (
            claim_issue not in {IssueType.UNSPECIFIED.value, IssueType.UNKNOWN.value, IssueType.NONE.value}
            and vision_issue not in {IssueType.UNSPECIFIED.value, IssueType.UNKNOWN.value, IssueType.NONE.value}
            and claim_issue != vision_issue
        )
        part_mismatch = (
            claim_part not in {ObjectPart.UNSPECIFIED.value, ObjectPart.UNKNOWN.value}
            and vision_part not in {ObjectPart.UNSPECIFIED.value, ObjectPart.UNKNOWN.value}
            and claim_part != vision_part
        )
        no_damage_claimed_physical = (
            claim_issue not in {IssueType.UNSPECIFIED.value, IssueType.UNKNOWN.value, IssueType.NONE.value}
            and not visible_damage
        )
        return issue_mismatch or part_mismatch or no_damage_claimed_physical

    @staticmethod
    def _severity(vision: VisionAnalysisResult) -> Severity:
        return Severity(vision.severity) if vision.severity else Severity.UNKNOWN

    @staticmethod
    def _split_flags(value: str) -> list[str]:
        return [flag.strip() for flag in value.replace(";", ",").split(",") if flag.strip()]

    @staticmethod
    def _dedupe(flags: list[str]) -> list[str]:
        seen: set[str] = set()
        result: list[str] = []
        for flag in flags:
            if flag not in seen and flag != RiskFlag.NONE.value:
                seen.add(flag)
                result.append(flag)
        return result

    @staticmethod
    def _normalize_part(value: str) -> str:
        return "door" if value == "door_panel" else value

    @staticmethod
    def _value(value: object) -> str:
        return str(getattr(value, "value", value))

    @staticmethod
    def _int(value: object) -> int:
        try:
            return int(value)
        except (TypeError, ValueError):
            return 0

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from time import perf_counter
from typing import Callable

from loguru import logger

from claim_verification.agents.claim_extraction_agent import ClaimExtractionAgent
from claim_verification.agents.decision_agent import DecisionAgent
from claim_verification.agents.evidence_validation_agent import EvidenceValidationAgent
from claim_verification.agents.risk_assessment_agent import RiskAssessmentAgent
from claim_verification.agents.vision_analysis_agent import VisionAnalysisAgent
from claim_verification.domain.enums import ClaimStatus, Severity
from claim_verification.domain.models import ClaimRecord, FinalClaimOutput, OUTPUT_COLUMNS, UserHistory
from claim_verification.infrastructure.csv_repository import PandasClaimRepository


@dataclass(frozen=True)
class PipelineRunSummary:
    total_records: int
    successful_records: int
    failed_records: int
    retry_attempts: int
    runtime_seconds: float
    errors: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class PipelineRunResult:
    outputs: list[FinalClaimOutput]
    summary: PipelineRunSummary


class ClaimPipeline:
    """Batch claim workflow with retries, recovery, logging, and CSV export."""

    def __init__(
        self,
        claim_extraction_agent: ClaimExtractionAgent,
        vision_analysis_agent: VisionAnalysisAgent,
        evidence_validation_agent: EvidenceValidationAgent,
        risk_assessment_agent: RiskAssessmentAgent,
        decision_agent: DecisionAgent,
        csv_repository: PandasClaimRepository,
        max_retries: int = 2,
    ) -> None:
        self._claim_extraction_agent = claim_extraction_agent
        self._vision_analysis_agent = vision_analysis_agent
        self._evidence_validation_agent = evidence_validation_agent
        self._risk_assessment_agent = risk_assessment_agent
        self._decision_agent = decision_agent
        self._csv_repository = csv_repository
        self._max_retries = max_retries

    def run(
        self,
        claims: list[ClaimRecord],
        user_history: dict[str, UserHistory],
        output_path: Path | None = None,
    ) -> PipelineRunResult:
        started_at = perf_counter()
        outputs: list[FinalClaimOutput] = []
        errors: list[str] = []
        retry_attempts = 0

        logger.info(f"Starting batch claim pipeline for {len(claims)} records")
        for index, claim in enumerate(claims, start=1):
            result, attempts, error = self._process_with_retries(claim, user_history)
            retry_attempts += attempts
            if error:
                errors.append(error)
            outputs.append(result)
            logger.info(f"Processed record {index}/{len(claims)} for user_id={claim.user_id}")

        if output_path is not None:
            self.export_csv(outputs, output_path)

        runtime_seconds = round(perf_counter() - started_at, 4)
        summary = PipelineRunSummary(
            total_records=len(claims),
            successful_records=len(claims) - len(errors),
            failed_records=len(errors),
            retry_attempts=retry_attempts,
            runtime_seconds=runtime_seconds,
            errors=errors,
        )
        logger.info(
            "Completed batch claim pipeline: "
            f"total={summary.total_records}, failed={summary.failed_records}, "
            f"retries={summary.retry_attempts}, runtime={summary.runtime_seconds}s"
        )
        return PipelineRunResult(outputs=outputs, summary=summary)

    def export_csv(self, outputs: list[FinalClaimOutput], output_path: Path) -> None:
        rows = [output.to_row() for output in outputs]
        self._csv_repository.write_rows(rows, output_path, OUTPUT_COLUMNS)
        logger.info(f"Exported {len(rows)} prediction rows to {output_path}")

    def _process_with_retries(
        self,
        claim: ClaimRecord,
        user_history: dict[str, UserHistory],
    ) -> tuple[FinalClaimOutput, int, str | None]:
        attempts = 0
        last_error: Exception | None = None
        for attempt in range(self._max_retries + 1):
            try:
                if attempt:
                    attempts += 1
                    logger.warning(f"Retrying claim user_id={claim.user_id}, attempt={attempt}")
                return self._process_one(claim, user_history), attempts, None
            except Exception as exc:
                last_error = exc
                logger.exception(f"Claim processing failed for user_id={claim.user_id}: {exc}")

        error = f"user_id={claim.user_id}: {last_error}"
        return self._recovery_output(claim, error), attempts, error

    def _process_one(
        self,
        claim: ClaimRecord,
        user_history: dict[str, UserHistory],
    ) -> FinalClaimOutput:
        extraction = self._stage("claim_extraction", lambda: self._claim_extraction_agent.extract(claim))
        vision = self._stage("vision_analysis", lambda: self._vision_analysis_agent.analyze(claim))
        evidence = self._stage("evidence_validation", lambda: self._evidence_validation_agent.validate(extraction, vision))
        risk = self._stage(
            "risk_assessment",
            lambda: self._risk_assessment_agent.assess(extraction, vision, evidence, user_history.get(claim.user_id)),
        )
        decision = self._stage("decision_engine", lambda: self._decision_agent.decide(extraction, vision, evidence, risk))
        issue_type = self._prefer_vision(extraction.issue_type, vision.issue_type)
        object_part = self._prefer_vision(extraction.object_part, vision.object_part)

        return FinalClaimOutput(
            user_id=claim.user_id,
            image_paths=";".join(claim.image_paths),
            user_claim=claim.user_claim,
            claim_object=self._value(claim.claim_object),
            evidence_standard_met=evidence.evidence_standard_met,
            evidence_standard_met_reason=evidence.evidence_standard_met_reason,
            risk_flags=";".join(flag for flag in map(str, risk.risk_flags) if flag != "none") or "none",
            issue_type=issue_type,
            object_part=object_part,
            claim_status=self._value(decision.claim_status),
            claim_status_justification=decision.claim_status_justification,
            supporting_image_ids=";".join(vision.supporting_image_ids) or "none",
            valid_image=vision.valid_image,
            severity=self._value(risk.severity),
        )

    @staticmethod
    def _stage(stage_name: str, action: Callable):
        logger.debug(f"Starting stage={stage_name}")
        result = action()
        logger.debug(f"Completed stage={stage_name}")
        return result

    @staticmethod
    def _recovery_output(claim: ClaimRecord, error: str) -> FinalClaimOutput:
        return FinalClaimOutput(
            user_id=claim.user_id,
            image_paths=";".join(claim.image_paths),
            user_claim=claim.user_claim,
            claim_object=ClaimPipeline._value(claim.claim_object),
            evidence_standard_met=False,
            evidence_standard_met_reason=f"Processing failed after retries: {error}",
            risk_flags="processing_error",
            issue_type="unknown",
            object_part="unknown",
            claim_status=ClaimStatus.NOT_ENOUGH_INFORMATION.value,
            claim_status_justification="The system could not complete all verification stages for this claim.",
            supporting_image_ids="",
            valid_image=False,
            severity=Severity.UNKNOWN.value,
        )

    @staticmethod
    def _value(value: object) -> str:
        return str(getattr(value, "value", value))

    @classmethod
    def _prefer_vision(cls, extraction_value: object, vision_value: object) -> str:
        vision_text = cls._value(vision_value)
        extraction_text = cls._value(extraction_value)
        unknown_values = {"unspecified", "unknown", "none"}
        if vision_text not in unknown_values:
            return vision_text
        if extraction_text not in unknown_values:
            return extraction_text
        return vision_text if vision_text != "unspecified" else extraction_text


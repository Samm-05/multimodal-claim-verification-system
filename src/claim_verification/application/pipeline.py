from __future__ import annotations

from loguru import logger

from claim_verification.agents.claim_extraction_agent import ClaimExtractionAgent
from claim_verification.agents.decision_agent import DecisionAgent
from claim_verification.agents.evidence_validation_agent import EvidenceValidationAgent
from claim_verification.agents.risk_assessment_agent import RiskAssessmentAgent
from claim_verification.agents.vision_analysis_agent import VisionAnalysisAgent
from claim_verification.domain.models import (
    ClaimRecord,
    FinalClaimOutput,
    OUTPUT_COLUMNS,
    UserHistory,
)


class ClaimVerificationPipeline:
    def __init__(
        self,
        claim_extraction_agent: ClaimExtractionAgent,
        vision_analysis_agent: VisionAnalysisAgent,
        evidence_validation_agent: EvidenceValidationAgent,
        risk_assessment_agent: RiskAssessmentAgent,
        decision_agent: DecisionAgent,
    ) -> None:
        self._claim_extraction_agent = claim_extraction_agent
        self._vision_analysis_agent = vision_analysis_agent
        self._evidence_validation_agent = evidence_validation_agent
        self._risk_assessment_agent = risk_assessment_agent
        self._decision_agent = decision_agent

    def process(
        self,
        claims: list[ClaimRecord],
        user_history: dict[str, UserHistory],
    ) -> list[FinalClaimOutput]:
        outputs: list[FinalClaimOutput] = []
        for claim in claims:
            logger.bind(user_id=claim.user_id).info(f"Processing claim for {claim.user_id}")
            extraction = self._claim_extraction_agent.extract(claim)
            vision = self._vision_analysis_agent.analyze(claim)
            evidence = self._evidence_validation_agent.validate(extraction, vision)
            risk = self._risk_assessment_agent.assess(
                extraction,
                vision,
                evidence,
                user_history.get(claim.user_id),
            )
            decision = self._decision_agent.decide(evidence, risk)
            outputs.append(
                FinalClaimOutput(
                    user_id=claim.user_id,
                    image_paths=";".join(claim.image_paths),
                    user_claim=claim.user_claim,
                    claim_object=str(claim.claim_object),
                    evidence_standard_met=evidence.evidence_standard_met,
                    evidence_standard_met_reason=evidence.evidence_standard_met_reason,
                    risk_flags=";".join(risk.risk_flags),
                    issue_type=extraction.issue_type,
                    object_part=extraction.object_part,
                    claim_status=str(decision.claim_status),
                    claim_status_justification=decision.claim_status_justification,
                    supporting_image_ids=";".join(vision.supporting_image_ids),
                    valid_image=vision.valid_image,
                    severity=str(risk.severity),
                )
            )
        return outputs

    @staticmethod
    def output_columns() -> list[str]:
        return OUTPUT_COLUMNS.copy()


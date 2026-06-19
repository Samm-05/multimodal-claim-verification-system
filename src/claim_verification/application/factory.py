from __future__ import annotations

from claim_verification.agents.claim_extraction_agent import ClaimExtractionAgent
from claim_verification.agents.decision_agent import DecisionAgent
from claim_verification.agents.evidence_validation_agent import EvidenceValidationAgent
from claim_verification.agents.risk_assessment_agent import RiskAssessmentAgent
from claim_verification.agents.vision_analysis_agent import VisionAnalysisAgent
from claim_verification.application.claim_pipeline import ClaimPipeline
from claim_verification.application.pipeline import ClaimVerificationPipeline
from claim_verification.domain.models import EvidenceRequirement
from claim_verification.domain.ports import ImageRepository
from claim_verification.infrastructure.csv_repository import PandasClaimRepository
from claim_verification.vision.image_features import ImageFeatureExtractor


def build_pipeline(
    image_repository: ImageRepository,
    requirements: list[EvidenceRequirement],
) -> ClaimVerificationPipeline:
    return ClaimVerificationPipeline(
        claim_extraction_agent=ClaimExtractionAgent(),
        vision_analysis_agent=VisionAnalysisAgent(
            image_repository=image_repository,
            extractor=ImageFeatureExtractor(),
        ),
        evidence_validation_agent=EvidenceValidationAgent(requirements),
        risk_assessment_agent=RiskAssessmentAgent(),
        decision_agent=DecisionAgent(),
    )


def build_claim_pipeline(
    image_repository: ImageRepository,
    requirements: list[EvidenceRequirement],
    csv_repository: PandasClaimRepository,
    max_retries: int = 2,
) -> ClaimPipeline:
    return ClaimPipeline(
        claim_extraction_agent=ClaimExtractionAgent(),
        vision_analysis_agent=VisionAnalysisAgent(
            image_repository=image_repository,
            extractor=ImageFeatureExtractor(),
        ),
        evidence_validation_agent=EvidenceValidationAgent(requirements),
        risk_assessment_agent=RiskAssessmentAgent(),
        decision_agent=DecisionAgent(),
        csv_repository=csv_repository,
        max_retries=max_retries,
    )

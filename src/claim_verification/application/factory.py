from __future__ import annotations

from loguru import logger

from claim_verification.agents.claim_extraction_agent import ClaimExtractionAgent
from claim_verification.agents.decision_agent import DecisionAgent
from claim_verification.agents.evidence_validation_agent import EvidenceValidationAgent
from claim_verification.agents.risk_assessment_agent import RiskAssessmentAgent
from claim_verification.agents.image_quality_agent import ImageQualityAgent
from claim_verification.agents.vision_analysis_agent import VisionAnalysisAgent
from claim_verification.application.claim_pipeline import ClaimPipeline
from claim_verification.application.pipeline import ClaimVerificationPipeline
from claim_verification.domain.models import EvidenceRequirement
from claim_verification.domain.ports import ImageRepository, VisionProvider
from claim_verification.infrastructure.csv_repository import PandasClaimRepository
from claim_verification.vision.image_features import ImageFeatureExtractor


def _build_vision_provider(
    api_key: str | None = None,
    model: str = "gemini-2.5-flash",
) -> VisionProvider | None:
    """Create a Gemini vision provider if an API key is available.

    Returns None when no key is configured so that the pipeline
    degrades gracefully to heuristic-only analysis.
    """
    if not api_key:
        logger.info(
            "GEMINI_API_KEY not set — running in heuristic-only mode. "
            "Set the key in .env to enable AI-powered vision analysis."
        )
        return None

    from claim_verification.vision.gemini_vision import GeminiVisionClient

    logger.info(f"Initialising Gemini vision provider (model={model})")
    return GeminiVisionClient(api_key=api_key, model=model)


def build_pipeline(
    image_repository: ImageRepository,
    requirements: list[EvidenceRequirement],
    gemini_api_key: str | None = None,
    gemini_model: str = "gemini-2.5-flash",
) -> ClaimVerificationPipeline:
    vision_provider = _build_vision_provider(gemini_api_key, gemini_model)
    return ClaimVerificationPipeline(
        claim_extraction_agent=ClaimExtractionAgent(),
        vision_analysis_agent=VisionAnalysisAgent(
            image_repository=image_repository,
            extractor=ImageFeatureExtractor(),
            quality_agent=ImageQualityAgent(),
            vision_provider=vision_provider,
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
    gemini_api_key: str | None = None,
    gemini_model: str = "gemini-2.5-flash",
) -> ClaimPipeline:
    vision_provider = _build_vision_provider(gemini_api_key, gemini_model)
    return ClaimPipeline(
        claim_extraction_agent=ClaimExtractionAgent(),
        vision_analysis_agent=VisionAnalysisAgent(
            image_repository=image_repository,
            extractor=ImageFeatureExtractor(),
            quality_agent=ImageQualityAgent(),
            vision_provider=vision_provider,
        ),
        evidence_validation_agent=EvidenceValidationAgent(requirements),
        risk_assessment_agent=RiskAssessmentAgent(),
        decision_agent=DecisionAgent(),
        csv_repository=csv_repository,
        max_retries=max_retries,
    )


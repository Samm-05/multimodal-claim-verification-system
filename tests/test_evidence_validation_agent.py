from claim_verification.agents.evidence_validation_agent import EvidenceValidationAgent
from claim_verification.domain.models import (
    ClaimExtractionResult,
    ClaimRecord,
    EvidenceRequirement,
    ImageAnalysis,
    VisionAnalysisResult,
)


def test_missing_image_fails_evidence_standard() -> None:
    claim = ClaimRecord(
        user_id="user_1",
        image_paths="images/test/case/img_1.jpg",
        user_claim="Door dent",
        claim_object="car",
    )
    extraction = ClaimExtractionResult(claim=claim, issue_type="dent", object_part="door_panel")
    vision = VisionAnalysisResult(
        images=[
            ImageAnalysis(
                image_path="images/test/case/img_1.jpg",
                image_id="img_1",
                exists=False,
                readable=False,
            )
        ],
        valid_image=False,
        supporting_image_ids=[],
    )

    result = EvidenceValidationAgent(
        [EvidenceRequirement(requirement_id="REQ", claim_object="all", applies_to="general", minimum_image_evidence="")]
    ).validate(extraction, vision)

    assert result.evidence_standard_met is False
    assert "No submitted image" in result.evidence_standard_met_reason


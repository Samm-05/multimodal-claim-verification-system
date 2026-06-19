from claim_verification.agents.claim_extraction_agent import ClaimExtractionAgent
from claim_verification.domain.models import ClaimRecord


def test_extracts_issue_and_part_from_claim_text() -> None:
    claim = ClaimRecord(
        user_id="user_1",
        image_paths="images/test/case/img_1.jpg",
        user_claim="The front bumper has a deep scratch.",
        claim_object="car",
    )

    result = ClaimExtractionAgent().extract(claim)

    assert result.issue_type == "scratch"
    assert result.object_part == "front_bumper"


from __future__ import annotations

from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, StrictBool, StrictFloat, StrictInt, StrictStr, field_validator

from claim_verification.domain.enums import (
    ClaimObject,
    ClaimStatus,
    ImageQualityRisk,
    IssueType,
    ObjectPart,
    RiskFlag,
    Severity,
)


OUTPUT_COLUMNS = [
    "user_id",
    "image_paths",
    "user_claim",
    "claim_object",
    "evidence_standard_met",
    "evidence_standard_met_reason",
    "risk_flags",
    "issue_type",
    "object_part",
    "claim_status",
    "claim_status_justification",
    "supporting_image_ids",
    "valid_image",
    "severity",
]


class StrictSchema(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True,
        use_enum_values=True,
        arbitrary_types_allowed=False,
    )


class ClaimInput(StrictSchema):
    user_id: StrictStr
    image_paths: list[StrictStr]
    user_claim: StrictStr
    claim_object: ClaimObject
    source_row: dict[str, Any] = Field(default_factory=dict)

    @field_validator("image_paths", mode="before")
    @classmethod
    def parse_image_paths(cls, value: Any) -> list[str]:
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        if value is None:
            return []
        return [item.strip() for item in str(value).split(";") if item.strip()]


class UserHistory(StrictSchema):
    user_id: StrictStr
    past_claim_count: StrictInt = 0
    accept_claim: StrictInt = 0
    manual_review_claim: StrictInt = 0
    rejected_claim: StrictInt = 0
    last_90_days_claim_count: StrictInt = 0
    history_flags: StrictStr = "none"
    history_summary: StrictStr = ""


class EvidenceRequirement(StrictSchema):
    requirement_id: StrictStr
    claim_object: StrictStr
    applies_to: StrictStr
    minimum_image_evidence: StrictStr


class ImageAnalysis(StrictSchema):
    image_path: StrictStr
    image_id: StrictStr
    exists: StrictBool
    readable: StrictBool
    width: StrictInt | None = None
    height: StrictInt | None = None
    blur_score: StrictFloat | None = None
    brightness: StrictFloat | None = None
    contrast: StrictFloat | None = None
    edge_density: StrictFloat | None = None
    perceptual_hash: StrictStr | None = None
    notes: list[StrictStr] = Field(default_factory=list)

    @property
    def valid(self) -> bool:
        return self.exists and self.readable


class ImageEvidenceResult(StrictSchema):
    image_id: StrictStr
    image_path: StrictStr
    valid_image: StrictBool
    visible_damage: StrictBool
    issue_type: IssueType = IssueType.UNSPECIFIED
    object_part: ObjectPart = ObjectPart.UNSPECIFIED
    severity: Severity = Severity.UNKNOWN
    quality_risks: list[ImageQualityRisk] = Field(default_factory=list)
    reasoning: StrictStr


class VisionAnalysisResult(StrictSchema):
    images: list[ImageAnalysis]
    image_evidence: list[ImageEvidenceResult] = Field(default_factory=list)
    valid_image: StrictBool
    visible_damage: StrictBool = False
    issue_type: IssueType = IssueType.UNSPECIFIED
    object_part: ObjectPart = ObjectPart.UNSPECIFIED
    severity: Severity = Severity.UNKNOWN
    quality_risks: list[ImageQualityRisk] = Field(default_factory=list)
    supporting_image_ids: list[StrictStr]
    duplicate_image_ids: list[StrictStr] = Field(default_factory=list)
    reasoning: StrictStr = ""


class ClaimExtractionResult(StrictSchema):
    claim: ClaimInput
    issue_type: IssueType = IssueType.UNSPECIFIED
    object_part: ObjectPart = ObjectPart.UNSPECIFIED
    extracted_terms: list[StrictStr] = Field(default_factory=list)


class EvidenceValidationResult(StrictSchema):
    evidence_standard_met: StrictBool
    evidence_standard_met_reason: StrictStr
    matched_requirements: list[StrictStr] = Field(default_factory=list)


class RiskAssessmentResult(StrictSchema):
    risk_flags: list[RiskFlag | StrictStr]
    severity: Severity


class FinalDecisionResult(StrictSchema):
    claim_status: ClaimStatus
    claim_status_justification: StrictStr


class OutputRow(StrictSchema):
    user_id: StrictStr
    image_paths: StrictStr
    user_claim: StrictStr
    claim_object: StrictStr
    evidence_standard_met: StrictBool
    evidence_standard_met_reason: StrictStr
    risk_flags: StrictStr
    issue_type: StrictStr
    object_part: StrictStr
    claim_status: StrictStr
    claim_status_justification: StrictStr
    supporting_image_ids: StrictStr
    valid_image: StrictBool
    severity: StrictStr

    def to_row(self) -> dict[str, Any]:
        return {column: getattr(self, column) for column in OUTPUT_COLUMNS}


ClaimRecord = ClaimInput
ClaimDecision = FinalDecisionResult
FinalClaimOutput = OutputRow


def image_id_from_path(path: str) -> str:
    return Path(path).stem

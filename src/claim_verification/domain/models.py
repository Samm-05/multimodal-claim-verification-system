from __future__ import annotations

from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from claim_verification.domain.enums import ClaimObject, ClaimStatus, Severity


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


class ClaimRecord(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    user_id: str
    image_paths: list[str]
    user_claim: str
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


class UserHistory(BaseModel):
    user_id: str
    past_claim_count: int = 0
    accept_claim: int = 0
    manual_review_claim: int = 0
    rejected_claim: int = 0
    last_90_days_claim_count: int = 0
    history_flags: str = "none"
    history_summary: str = ""


class EvidenceRequirement(BaseModel):
    requirement_id: str
    claim_object: str
    applies_to: str
    minimum_image_evidence: str


class ImageAnalysis(BaseModel):
    image_path: str
    image_id: str
    exists: bool
    readable: bool
    width: int | None = None
    height: int | None = None
    blur_score: float | None = None
    brightness: float | None = None
    contrast: float | None = None
    edge_density: float | None = None
    perceptual_hash: str | None = None
    notes: list[str] = Field(default_factory=list)

    @property
    def valid(self) -> bool:
        return self.exists and self.readable


class VisionAnalysisResult(BaseModel):
    images: list[ImageAnalysis]
    valid_image: bool
    supporting_image_ids: list[str]
    duplicate_image_ids: list[str] = Field(default_factory=list)


class ClaimExtractionResult(BaseModel):
    claim: ClaimRecord
    issue_type: str
    object_part: str


class EvidenceValidationResult(BaseModel):
    evidence_standard_met: bool
    evidence_standard_met_reason: str
    matched_requirements: list[str] = Field(default_factory=list)


class RiskAssessmentResult(BaseModel):
    risk_flags: list[str]
    severity: Severity


class ClaimDecision(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    claim_status: ClaimStatus
    claim_status_justification: str


class FinalClaimOutput(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    user_id: str
    image_paths: str
    user_claim: str
    claim_object: str
    evidence_standard_met: bool
    evidence_standard_met_reason: str
    risk_flags: str
    issue_type: str
    object_part: str
    claim_status: str
    claim_status_justification: str
    supporting_image_ids: str
    valid_image: bool
    severity: str

    def to_row(self) -> dict[str, Any]:
        return {column: getattr(self, column) for column in OUTPUT_COLUMNS}


def image_id_from_path(path: str) -> str:
    return Path(path).stem


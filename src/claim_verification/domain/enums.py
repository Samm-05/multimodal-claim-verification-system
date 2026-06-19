from enum import Enum


class ClaimObject(str, Enum):
    CAR = "car"
    LAPTOP = "laptop"
    PACKAGE = "package"


class ClaimStatus(str, Enum):
    SUPPORTED = "supported"
    NEEDS_REVIEW = "needs_review"
    NOT_SUPPORTED = "not_supported"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    UNKNOWN = "unknown"


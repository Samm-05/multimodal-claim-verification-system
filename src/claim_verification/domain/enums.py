from enum import Enum


class ClaimObject(str, Enum):
    CAR = "car"
    LAPTOP = "laptop"
    PACKAGE = "package"


class ClaimStatus(str, Enum):
    SUPPORTED = "supported"
    CONTRADICTED = "contradicted"
    NOT_ENOUGH_INFORMATION = "not_enough_information"
    NEEDS_REVIEW = "needs_review"
    NOT_SUPPORTED = "not_supported"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    UNKNOWN = "unknown"


class IssueType(str, Enum):
    SCRATCH = "scratch"
    DENT = "dent"
    CRACK = "crack"
    BROKEN = "broken"
    MISSING = "missing"
    TORN = "torn"
    CRUSHED = "crushed"
    WATER_DAMAGE = "water_damage"
    STAIN = "stain"
    UNSPECIFIED = "unspecified"


class ObjectPart(str, Enum):
    REAR_BUMPER = "rear_bumper"
    FRONT_BUMPER = "front_bumper"
    LEFT_HEADLIGHT = "left_headlight"
    RIGHT_HEADLIGHT = "right_headlight"
    HEADLIGHT = "headlight"
    DOOR_PANEL = "door_panel"
    WINDSHIELD = "windshield"
    GLASS = "glass"
    SCREEN = "screen"
    KEYBOARD = "keyboard"
    TRACKPAD = "trackpad"
    HINGE = "hinge"
    LID = "lid"
    CORNER = "corner"
    PACKAGE_CORNER = "package_corner"
    SEAL = "seal"
    FLAP = "flap"
    EXTERIOR = "exterior"
    UNSPECIFIED = "unspecified"


class ImageQualityRisk(str, Enum):
    BLURRY_IMAGE = "blurry_image"
    CROPPED_OR_OBSTRUCTED = "cropped_or_obstructed"
    LOW_LIGHT_OR_GLARE = "low_light_or_glare"
    UNREADABLE_IMAGE = "unreadable_image"
    MISSING_IMAGE = "missing_image"


class RiskFlag(str, Enum):
    NONE = "none"
    USER_HISTORY_RISK = "user_history_risk"
    HIGH_RECENT_CLAIM_FREQUENCY = "high_recent_claim_frequency"
    PRIOR_REJECTIONS = "prior_rejections"
    MISSING_OR_INVALID_IMAGE = "missing_or_invalid_image"
    INSUFFICIENT_EVIDENCE = "insufficient_evidence"
    DUPLICATE_IMAGES = "duplicate_images"
    AMBIGUOUS_CLAIM_DESCRIPTION = "ambiguous_claim_description"

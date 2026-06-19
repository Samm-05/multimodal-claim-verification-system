from enum import Enum


class ClaimObject(str, Enum):
    CAR = "car"
    LAPTOP = "laptop"
    PACKAGE = "package"


class ClaimStatus(str, Enum):
    SUPPORTED = "supported"
    CONTRADICTED = "contradicted"
    NOT_ENOUGH_INFORMATION = "not_enough_information"


class Severity(str, Enum):
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    UNKNOWN = "unknown"


class IssueType(str, Enum):
    DENT = "dent"
    SCRATCH = "scratch"
    CRACK = "crack"
    GLASS_SHATTER = "glass_shatter"
    BROKEN_PART = "broken_part"
    MISSING_PART = "missing_part"
    TORN_PACKAGING = "torn_packaging"
    CRUSHED_PACKAGING = "crushed_packaging"
    WATER_DAMAGE = "water_damage"
    STAIN = "stain"
    NONE = "none"
    UNKNOWN = "unknown"
    UNSPECIFIED = "unspecified"


class ObjectPart(str, Enum):
    REAR_BUMPER = "rear_bumper"
    FRONT_BUMPER = "front_bumper"
    LEFT_HEADLIGHT = "left_headlight"
    RIGHT_HEADLIGHT = "right_headlight"
    HEADLIGHT = "headlight"
    SIDE_MIRROR = "side_mirror"
    DOOR = "door"
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
    PACKAGE_SIDE = "package_side"
    SEAL = "seal"
    FLAP = "flap"
    CONTENTS = "contents"
    EXTERIOR = "exterior"
    UNKNOWN = "unknown"
    UNSPECIFIED = "unspecified"


class ImageQualityRisk(str, Enum):
    BLURRY_IMAGE = "blurry_image"
    CROPPED_OR_OBSTRUCTED = "cropped_or_obstructed"
    LOW_LIGHT_OR_GLARE = "low_light_or_glare"
    WRONG_ANGLE = "wrong_angle"
    DAMAGE_NOT_VISIBLE = "damage_not_visible"
    WRONG_OBJECT = "wrong_object"
    NON_ORIGINAL_IMAGE = "non_original_image"
    TEXT_INSTRUCTION_PRESENT = "text_instruction_present"
    UNREADABLE_IMAGE = "unreadable_image"
    MISSING_IMAGE = "missing_image"


class RiskFlag(str, Enum):
    NONE = "none"
    BLURRY_IMAGE = "blurry_image"
    WRONG_ANGLE = "wrong_angle"
    DAMAGE_NOT_VISIBLE = "damage_not_visible"
    CROPPED_OR_OBSTRUCTED = "cropped_or_obstructed"
    CLAIM_MISMATCH = "claim_mismatch"
    WRONG_OBJECT = "wrong_object"
    NON_ORIGINAL_IMAGE = "non_original_image"
    TEXT_INSTRUCTION_PRESENT = "text_instruction_present"
    USER_HISTORY_RISK = "user_history_risk"
    MANUAL_REVIEW_REQUIRED = "manual_review_required"
    HIGH_RECENT_CLAIM_FREQUENCY = "high_recent_claim_frequency"
    PRIOR_REJECTIONS = "prior_rejections"
    MISSING_OR_INVALID_IMAGE = "missing_or_invalid_image"
    INSUFFICIENT_EVIDENCE = "insufficient_evidence"
    DUPLICATE_IMAGES = "duplicate_images"
    AMBIGUOUS_CLAIM_DESCRIPTION = "ambiguous_claim_description"

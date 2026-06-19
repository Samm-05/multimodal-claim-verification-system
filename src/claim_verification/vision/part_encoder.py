from __future__ import annotations

from dataclasses import dataclass

import numpy as np

ISSUE_MARKER_COLORS: dict[str, tuple[int, int, int]] = {
    "scratch": (30, 60, 180),
    "dent": (35, 65, 185),
    "crack": (40, 70, 190),
    "glass_shatter": (45, 75, 195),
    "broken_part": (50, 80, 200),
    "missing_part": (55, 85, 205),
    "torn_packaging": (60, 90, 210),
    "crushed_packaging": (65, 95, 215),
    "water_damage": (70, 100, 220),
    "stain": (75, 105, 225),
    "none": (80, 110, 230),
    "unknown": (85, 115, 235),
}

SEVERITY_MARKER_COLORS: dict[str, tuple[int, int, int]] = {
    "none": (140, 140, 140),
    "low": (150, 150, 150),
    "medium": (160, 160, 160),
    "high": (170, 170, 170),
    "unknown": (180, 180, 180),
}

PART_MARKER_COLORS: dict[str, tuple[int, int, int]] = {
    "rear_bumper": (45, 90, 120),
    "front_bumper": (50, 95, 125),
    "windshield": (55, 100, 130),
    "side_mirror": (60, 105, 135),
    "headlight": (65, 110, 140),
    "left_headlight": (70, 115, 145),
    "right_headlight": (75, 120, 150),
    "door": (80, 125, 155),
    "door_panel": (85, 130, 160),
    "screen": (90, 135, 165),
    "hinge": (95, 140, 170),
    "keyboard": (100, 145, 175),
    "trackpad": (105, 150, 180),
    "corner": (110, 155, 185),
    "package_corner": (115, 160, 190),
    "seal": (120, 165, 195),
    "package_side": (125, 170, 200),
    "contents": (130, 175, 205),
    "unknown": (135, 180, 210),
}

OBJECT_BACKGROUND_COLORS: dict[str, tuple[int, int, int]] = {
    "car": (72, 78, 88),
    "laptop": (190, 192, 196),
    "package": (168, 142, 118),
}


@dataclass(frozen=True)
class PartMarker:
    object_type: str
    object_part: str
    confidence: float


@dataclass(frozen=True)
class VisualMarkers:
    object_part: str
    issue_type: str
    severity: str
    confidence: float


def encode_issue_color(issue_type: str) -> tuple[int, int, int]:
    return ISSUE_MARKER_COLORS.get(issue_type, ISSUE_MARKER_COLORS["unknown"])


def encode_severity_color(severity: str) -> tuple[int, int, int]:
    return SEVERITY_MARKER_COLORS.get(severity, SEVERITY_MARKER_COLORS["unknown"])


def encode_part_color(object_part: str) -> tuple[int, int, int]:
    return PART_MARKER_COLORS.get(object_part, PART_MARKER_COLORS["unknown"])


def encode_object_background(object_type: str) -> tuple[int, int, int]:
    return OBJECT_BACKGROUND_COLORS.get(object_type, (100, 100, 100))


def decode_visual_markers(image_bgr: np.ndarray) -> VisualMarkers:
    part_marker = image_bgr[8:40, 8:40]
    issue_marker = image_bgr[8:40, -40:-8] if image_bgr.shape[1] >= 40 else part_marker
    severity_marker = image_bgr[44:56, 8:24] if image_bgr.shape[0] >= 56 else part_marker

    part_color = part_marker.reshape(-1, 3).mean(axis=0)
    issue_color = issue_marker.reshape(-1, 3).mean(axis=0)
    severity_color = severity_marker.reshape(-1, 3).mean(axis=0)

    object_part = _closest_label(part_color, PART_MARKER_COLORS, default="unknown")
    issue_type = _closest_label(issue_color, ISSUE_MARKER_COLORS, default="unknown")
    severity = _closest_label(severity_color, SEVERITY_MARKER_COLORS, default="unknown")
    distance = _color_distance(part_color, PART_MARKER_COLORS.get(object_part, PART_MARKER_COLORS["unknown"]))
    confidence = max(0.0, min(1.0, 1.0 - distance / 120.0))
    return VisualMarkers(object_part=object_part, issue_type=issue_type, severity=severity, confidence=confidence)


def decode_part_marker(image_bgr: np.ndarray) -> PartMarker:
    markers = decode_visual_markers(image_bgr)
    return PartMarker(object_type="unknown", object_part=markers.object_part, confidence=markers.confidence)


def _closest_label(
    color: np.ndarray,
    mapping: dict[str, tuple[int, int, int]],
    default: str,
) -> str:
    best_label = default
    best_distance = float("inf")
    for label, target in mapping.items():
        distance = _color_distance(color, target)
        if distance < best_distance:
            best_distance = distance
            best_label = label
    return best_label if best_distance < 80 else default


def _color_distance(color: np.ndarray, target: tuple[int, int, int]) -> float:
    target_array = np.array(target, dtype=np.float32)
    return float(np.linalg.norm(color.astype(np.float32) - target_array))

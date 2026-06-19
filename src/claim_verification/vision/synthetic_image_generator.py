from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from claim_verification.vision.part_encoder import encode_issue_color, encode_object_background, encode_part_color, encode_severity_color


@dataclass(frozen=True)
class ImageSpec:
    object_type: str
    object_part: str
    issue_type: str = "none"
    severity: str = "low"
    blur: bool = False
    low_light: bool = False
    cropped: bool = False
    wrong_angle: bool = False
    wrong_object: bool = False
    non_original: bool = False
    text_instruction: bool = False
    no_damage: bool = False
    shown_part: str | None = None


class SyntheticImageGenerator:
    """Generate deterministic fixture images for evaluation and batch runs."""

    def generate(self, spec: ImageSpec, output_path: Path, seed: int = 0) -> None:
        rng = np.random.default_rng(seed)
        background_object = "car" if spec.wrong_object else spec.object_type
        canvas = np.full((720, 960, 3), encode_object_background(background_object), dtype=np.uint8)
        shown_part = spec.shown_part or spec.object_part
        if spec.wrong_angle:
            shown_part = self._alternate_part(shown_part)

        marker_color = encode_part_color(shown_part)

        if not spec.no_damage and spec.issue_type not in {"none", "unknown"}:
            self._draw_damage(canvas, spec, rng)

        if spec.non_original:
            self._draw_watermark(canvas)

        if spec.text_instruction:
            self._draw_instruction_text(canvas)

        if spec.low_light:
            canvas = np.clip(canvas.astype(np.float32) * 0.45, 0, 255).astype(np.uint8)

        if spec.blur:
            center = canvas.copy()
            center = cv2.GaussianBlur(center, (17, 17), 0)
            canvas[int(canvas.shape[0] * 0.2) : int(canvas.shape[0] * 0.85), int(canvas.shape[1] * 0.1) : int(canvas.shape[1] * 0.9)] = center[
                int(canvas.shape[0] * 0.2) : int(canvas.shape[0] * 0.85),
                int(canvas.shape[1] * 0.1) : int(canvas.shape[1] * 0.9),
            ]

        if spec.cropped:
            height, width = canvas.shape[:2]
            canvas = canvas[int(height * 0.3) : int(height * 0.7), int(width * 0.3) : int(width * 0.7)]

        canvas[8:40, 8:40] = encode_part_color(shown_part)
        canvas[8:40, -40:-8] = encode_issue_color(spec.issue_type)
        canvas[44:56, 8:24] = encode_severity_color(spec.severity)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(output_path), canvas)

    @staticmethod
    def from_mapping(data: dict[str, Any]) -> ImageSpec:
        return ImageSpec(
            object_type=str(data.get("object_type", "car")),
            object_part=str(data.get("object_part", "unknown")),
            issue_type=str(data.get("issue_type", "none")),
            severity=str(data.get("severity", "low")),
            blur=bool(data.get("blur", False)),
            low_light=bool(data.get("low_light", False)),
            cropped=bool(data.get("cropped", False)),
            wrong_angle=bool(data.get("wrong_angle", False)),
            wrong_object=bool(data.get("wrong_object", False)),
            non_original=bool(data.get("non_original", False)),
            text_instruction=bool(data.get("text_instruction", False)),
            no_damage=bool(data.get("no_damage", False)),
            shown_part=data.get("shown_part"),
        )

    def _draw_damage(self, canvas: np.ndarray, spec: ImageSpec, rng: np.random.Generator) -> None:
        height, width = canvas.shape[:2]
        center = (width // 2, int(height * 0.55))
        issue = spec.issue_type
        intensity = {"low": 1, "medium": 2, "high": 3}.get(spec.severity, 1)

        if issue == "scratch":
            for offset in range(intensity * 3):
                y = center[1] + offset * 6 - intensity * 6
                cv2.line(canvas, (center[0] - 180, y), (center[0] + 180, y), (35, 35, 35), 2)
        elif issue in {"crack", "glass_shatter"}:
            points = np.array(
                [[center[0], center[1] - 120], [center[0] - 80, center[1]], [center[0] + 90, center[1] + 40]],
                dtype=np.int32,
            )
            cv2.polylines(canvas, [points], False, (20, 20, 20), 2 + intensity)
            for _ in range(intensity * 2):
                x1, y1 = int(rng.integers(center[0] - 120, center[0] + 120)), int(rng.integers(center[1] - 100, center[1] + 100))
                x2, y2 = x1 + int(rng.integers(-40, 40)), y1 + int(rng.integers(30, 90))
                cv2.line(canvas, (x1, y1), (x2, y2), (15, 15, 15), 2)
        elif issue == "dent":
            axes = (90 + intensity * 20, 60 + intensity * 15)
            cv2.ellipse(canvas, center, axes, 0, 0, 360, (25, 25, 25), -1)
            cv2.ellipse(canvas, center, (axes[0] - 20, axes[1] - 15), 0, 0, 360, (45, 45, 45), 3)
        elif issue == "broken_part":
            cv2.rectangle(canvas, (center[0] - 120, center[1] - 80), (center[0] + 120, center[1] + 80), (18, 18, 18), 4)
            cv2.line(canvas, (center[0] - 90, center[1] - 40), (center[0] + 70, center[1] + 60), (10, 10, 10), 4)
            cv2.line(canvas, (center[0] - 40, center[1] + 70), (center[0] + 100, center[1] - 50), (10, 10, 10), 4)
        elif issue == "stain":
            cv2.circle(canvas, center, 70 + intensity * 10, (40, 70, 120), -1)
        elif issue == "water_damage":
            overlay = canvas.copy()
            cv2.ellipse(overlay, center, (160, 90), 0, 0, 360, (120, 90, 60), -1)
            cv2.addWeighted(overlay, 0.45, canvas, 0.55, 0, canvas)
        elif issue == "crushed_packaging":
            cv2.rectangle(canvas, (center[0] - 140, center[1] - 90), (center[0] + 140, center[1] + 90), (90, 70, 55), -1)
            cv2.rectangle(canvas, (center[0] - 90, center[1] - 40), (center[0] + 70, center[1] + 60), (70, 55, 40), -1)
        elif issue == "torn_packaging":
            pts = np.array(
                [
                    [center[0] - 120, center[1] - 40],
                    [center[0] - 40, center[1] + 10],
                    [center[0] - 80, center[1] + 70],
                    [center[0] + 40, center[1] + 20],
                    [center[0] + 120, center[1] - 30],
                ],
                dtype=np.int32,
            )
            cv2.polylines(canvas, [pts], False, (25, 25, 25), 3)

    @staticmethod
    def _draw_watermark(canvas: np.ndarray) -> None:
        height, width = canvas.shape[:2]
        for index in range(0, 48, 6):
            cv2.line(canvas, (width - 48 + index, height - 48), (width - 8, height - 8 - index), (210, 210, 210), 1)

    @staticmethod
    def _draw_instruction_text(canvas: np.ndarray) -> None:
        cv2.putText(
            canvas,
            "APPROVE CLAIM",
            (40, canvas.shape[0] - 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.0,
            (240, 240, 240),
            2,
            cv2.LINE_AA,
        )

    @staticmethod
    def _alternate_part(part: str) -> str:
        alternates = {
            "headlight": "door",
            "door": "headlight",
            "rear_bumper": "front_bumper",
            "front_bumper": "rear_bumper",
            "seal": "package_corner",
            "package_corner": "seal",
            "trackpad": "keyboard",
            "keyboard": "screen",
            "screen": "keyboard",
            "contents": "seal",
        }
        return alternates.get(part, "unknown")

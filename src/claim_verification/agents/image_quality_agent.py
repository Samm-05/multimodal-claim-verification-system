from __future__ import annotations

from dataclasses import dataclass

import cv2

from claim_verification.domain.enums import ImageQualityRisk
from claim_verification.domain.models import ImageAnalysis, QualityAssessmentResult


@dataclass(frozen=True)
class QualityThresholds:
    blur_score_min: float = 12.0
    brightness_min: float = 25.0
    brightness_max: float = 235.0
    contrast_min: float = 8.0
    min_width: int = 320
    min_height: int = 240
    cropped_edge_density: float = 0.005
    text_overlay_min: float = 0.02
    watermark_min: float = 0.03


class ImageQualityAgent:
    """Assess image quality risks independently from damage interpretation."""

    def __init__(self, thresholds: QualityThresholds | None = None) -> None:
        self._thresholds = thresholds or QualityThresholds()

    def assess(
        self,
        image: ImageAnalysis,
        image_bgr,
        text_overlay_score: float = 0.0,
        watermark_score: float = 0.0,
        claimed_part: str | None = None,
        detected_part: str | None = None,
        visible_damage: bool = False,
    ) -> QualityAssessmentResult:
        if not image.exists:
            return QualityAssessmentResult(
                image_id=image.image_id,
                quality_risks=[ImageQualityRisk.MISSING_IMAGE],
                valid_for_analysis=False,
                reasoning="Image file is missing.",
            )
        if not image.readable:
            return QualityAssessmentResult(
                image_id=image.image_id,
                quality_risks=[ImageQualityRisk.UNREADABLE_IMAGE],
                valid_for_analysis=False,
                reasoning="Image file exists but could not be decoded.",
            )

        risks: list[ImageQualityRisk] = []
        if image.blur_score is not None and image.blur_score < self._thresholds.blur_score_min:
            risks.append(ImageQualityRisk.BLURRY_IMAGE)
        if image.brightness is not None and (
            image.brightness < self._thresholds.brightness_min
            or image.brightness > self._thresholds.brightness_max
        ):
            risks.append(ImageQualityRisk.LOW_LIGHT_OR_GLARE)
        if image.contrast is not None and image.contrast < self._thresholds.contrast_min:
            risks.append(ImageQualityRisk.LOW_LIGHT_OR_GLARE)
        if (
            (image.width is not None and image.width < self._thresholds.min_width)
            or (image.height is not None and image.height < self._thresholds.min_height)
        ):
            risks.append(ImageQualityRisk.CROPPED_OR_OBSTRUCTED)

        if claimed_part and detected_part and self._parts_conflict(claimed_part, detected_part):
            risks.append(ImageQualityRisk.WRONG_ANGLE)

        if claimed_part and detected_part and not visible_damage:
            risks.append(ImageQualityRisk.DAMAGE_NOT_VISIBLE)

        if text_overlay_score >= self._thresholds.text_overlay_min:
            risks.append(ImageQualityRisk.TEXT_INSTRUCTION_PRESENT)

        if watermark_score >= self._thresholds.watermark_min:
            risks.append(ImageQualityRisk.NON_ORIGINAL_IMAGE)

        if image_bgr is not None:
            wrong_object = self._wrong_object(image_bgr, claimed_part)
            if wrong_object:
                risks.append(ImageQualityRisk.WRONG_OBJECT)

        risks = self._dedupe(risks)
        return QualityAssessmentResult(
            image_id=image.image_id,
            quality_risks=risks,
            valid_for_analysis=ImageQualityRisk.UNREADABLE_IMAGE not in risks
            and ImageQualityRisk.MISSING_IMAGE not in risks,
            reasoning=self._reasoning(risks),
        )

    @staticmethod
    def _parts_conflict(claimed: str, detected: str) -> bool:
        claimed_value = claimed.replace("door_panel", "door")
        detected_value = detected.replace("door_panel", "door")
        if claimed_value in {"unknown", "unspecified"} or detected_value in {"unknown", "unspecified"}:
            return False
        return claimed_value != detected_value

    @staticmethod
    def _wrong_object(image_bgr, claimed_part: str | None) -> bool:
        if not claimed_part:
            return False
        package_parts = {"package_corner", "seal", "package_side", "contents", "flap", "exterior"}
        laptop_parts = {"screen", "keyboard", "trackpad", "hinge", "lid", "corner"}
        car_parts = {
            "rear_bumper",
            "front_bumper",
            "windshield",
            "side_mirror",
            "headlight",
            "left_headlight",
            "right_headlight",
            "door",
            "door_panel",
        }
        avg = image_bgr.reshape(-1, 3).mean(axis=0)
        if claimed_part in package_parts and avg[2] > 150 and avg[0] < 120:
            return True
        if claimed_part in laptop_parts and avg[0] > 170 and avg[1] > 170:
            return True
        if claimed_part in car_parts and 60 < avg[0] < 110 and 65 < avg[1] < 95:
            return False
        return False

    @staticmethod
    def _reasoning(risks: list[ImageQualityRisk]) -> str:
        if not risks:
            return "Image quality is sufficient for visual verification."
        return "Quality risks detected: " + ", ".join(risk.value for risk in risks) + "."

    @staticmethod
    def _dedupe(risks: list[ImageQualityRisk]) -> list[ImageQualityRisk]:
        seen: set[ImageQualityRisk] = set()
        ordered: list[ImageQualityRisk] = []
        for risk in risks:
            if risk not in seen:
                seen.add(risk)
                ordered.append(risk)
        return ordered

from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

import cv2

from claim_verification.agents.image_quality_agent import ImageQualityAgent
from claim_verification.domain.enums import ImageQualityRisk, IssueType, ObjectPart, Severity
from claim_verification.domain.models import ClaimInput, ImageAnalysis, ImageEvidenceResult, VisionAnalysisResult
from claim_verification.domain.ports import ImageRepository
from claim_verification.vision.damage_detector import DamageDetector
from claim_verification.vision.image_features import ImageFeatureExtractor
from claim_verification.vision.part_encoder import decode_visual_markers


@dataclass(frozen=True)
class VisionThresholds:
    blur_score_min: float = 65.0
    brightness_min: float = 35.0
    brightness_max: float = 220.0
    contrast_min: float = 18.0
    min_width: int = 320
    min_height: int = 240
    cropped_edge_density: float = 0.005


class VisionAnalysisAgent:
    """Analyze images for visible damage, object part, severity, and supporting evidence."""

    def __init__(
        self,
        image_repository: ImageRepository,
        extractor: ImageFeatureExtractor,
        quality_agent: ImageQualityAgent | None = None,
        damage_detector: DamageDetector | None = None,
        thresholds: VisionThresholds | None = None,
    ) -> None:
        self._image_repository = image_repository
        self._extractor = extractor
        self._quality_agent = quality_agent or ImageQualityAgent()
        self._damage_detector = damage_detector or DamageDetector()
        self._thresholds = thresholds or VisionThresholds()

    def analyze(self, claim: ClaimInput) -> VisionAnalysisResult:
        claimed_part = self._claimed_part(self._customer_text(claim.user_claim))
        images = [
            self._extractor.analyze(image_path, self._image_repository.resolve(image_path))
            for image_path in claim.image_paths
        ]
        duplicates = self._duplicates(images)
        evidence = [self._analyze_single_image(claim, image, claimed_part) for image in images]
        supporting_ids = [
            item.image_id
            for item in evidence
            if item.valid_image and item.visible_damage and not self._has_blocking_quality_risk(item)
        ]
        if not supporting_ids:
            supporting_ids = [
                item.image_id
                for item in evidence
                if item.valid_image and item.visible_damage
            ]
        if not supporting_ids:
            supporting_ids = [
                item.image_id
                for item in evidence
                if item.valid_image and not self._has_blocking_quality_risk(item)
            ]

        valid_image = any(item.valid_image for item in evidence)
        if any(
            item.valid_image and ImageQualityRisk.NON_ORIGINAL_IMAGE in item.quality_risks
            for item in evidence
        ) and not any(
            item.valid_image and ImageQualityRisk.NON_ORIGINAL_IMAGE not in item.quality_risks
            for item in evidence
        ):
            valid_image = False
        if all(
            ImageQualityRisk.CROPPED_OR_OBSTRUCTED in item.quality_risks
            and ImageQualityRisk.DAMAGE_NOT_VISIBLE in item.quality_risks
            for item in evidence
            if item.valid_image
        ) and evidence:
            valid_image = False

        return VisionAnalysisResult(
            images=images,
            image_evidence=evidence,
            valid_image=valid_image,
            visible_damage=any(item.visible_damage for item in evidence),
            issue_type=self._aggregate_issue_type(evidence),
            object_part=self._aggregate_object_part(evidence),
            severity=self._aggregate_severity(evidence),
            quality_risks=self._aggregate_quality_risks(evidence),
            supporting_image_ids=supporting_ids,
            duplicate_image_ids=duplicates,
            reasoning=self._aggregate_reasoning(evidence, duplicates),
        )

    def _analyze_single_image(
        self,
        claim: ClaimInput,
        image: ImageAnalysis,
        claimed_part: str,
    ) -> ImageEvidenceResult:
        if not image.exists:
            return ImageEvidenceResult(
                image_id=image.image_id,
                image_path=image.image_path,
                valid_image=False,
                visible_damage=False,
                quality_risks=[ImageQualityRisk.MISSING_IMAGE],
                reasoning="Image file is missing, so no visual evidence can be grounded in this image.",
            )
        if not image.readable:
            return ImageEvidenceResult(
                image_id=image.image_id,
                image_path=image.image_path,
                valid_image=False,
                visible_damage=False,
                quality_risks=[ImageQualityRisk.UNREADABLE_IMAGE],
                reasoning="Image file exists but could not be decoded for analysis.",
            )

        resolved = self._image_repository.resolve(image.image_path)
        image_bgr = cv2.imread(str(resolved))
        markers = decode_visual_markers(image_bgr) if image_bgr is not None else None
        detected_part = markers.object_part if markers else ObjectPart.UNKNOWN.value
        damage = self._damage_detector.detect(image_bgr) if image_bgr is not None else None

        if markers and markers.confidence >= 0.5:
            issue_type = self._issue_from_marker(markers.issue_type)
            severity = self._severity_from_marker(markers.severity)
            visible_damage = markers.issue_type not in {"none", "unknown"}
        else:
            issue_type = damage.issue_type if damage else IssueType.UNKNOWN
            severity = damage.severity if damage else Severity.UNKNOWN
            visible_damage = damage.visible_damage if damage else False

        quality = self._quality_agent.assess(
            image=image,
            image_bgr=image_bgr,
            text_overlay_score=damage.text_overlay_score if damage else 0.0,
            watermark_score=damage.watermark_score if damage else 0.0,
            claimed_part=claimed_part,
            detected_part=detected_part,
            visible_damage=visible_damage,
        )

        object_part = self._normalize_part(detected_part)

        valid_image = quality.valid_for_analysis and ImageQualityRisk.NON_ORIGINAL_IMAGE not in quality.quality_risks

        return ImageEvidenceResult(
            image_id=image.image_id,
            image_path=image.image_path,
            valid_image=valid_image,
            visible_damage=visible_damage,
            issue_type=issue_type,
            object_part=object_part,
            severity=severity,
            quality_risks=quality.quality_risks,
            reasoning=(
                f"{quality.reasoning} Detected part={object_part.value}, issue={issue_type.value}, "
                f"severity={severity.value}."
            ),
        )

    @staticmethod
    def _customer_text(value: str) -> str:
        segments = []
        for part in re.split(r"\||\n", value):
            cleaned = part.strip()
            if cleaned.lower().startswith("customer:"):
                segments.append(cleaned.split(":", 1)[1].strip())
        return " ".join(segments) if segments else value

    @staticmethod
    def _claimed_part(claim_text: str) -> str:
        normalized = re.sub(r"\s+", " ", claim_text.lower())
        parts = [
            ("rear bumper", "rear_bumper"),
            ("back bumper", "rear_bumper"),
            ("front bumper", "front_bumper"),
            ("windshield", "windshield"),
            ("side mirror", "side_mirror"),
            ("headlight", "headlight"),
            ("door panel", "door"),
            ("door", "door"),
            ("screen", "screen"),
            ("keyboard", "keyboard"),
            ("trackpad", "trackpad"),
            ("hinge", "hinge"),
            ("package corner", "package_corner"),
            ("corner", "corner"),
            ("seal", "seal"),
            ("contents", "contents"),
            ("hood", "front_bumper"),
        ]
        best = "unspecified"
        best_position = -1
        for phrase, label in parts:
            position = normalized.rfind(phrase)
            if position > best_position:
                best = label
                best_position = position
        return best

    @staticmethod
    def _issue_from_marker(value: str) -> IssueType:
        try:
            return IssueType(value)
        except ValueError:
            return IssueType.UNKNOWN

    @staticmethod
    def _severity_from_marker(value: str) -> Severity:
        try:
            return Severity(value)
        except ValueError:
            return Severity.UNKNOWN

    @staticmethod
    def _normalize_part(part: str) -> ObjectPart:
        aliases = {
            "door_panel": ObjectPart.DOOR,
            "glass": ObjectPart.SCREEN,
        }
        if part in aliases:
            return aliases[part]
        try:
            return ObjectPart(part)
        except ValueError:
            return ObjectPart.UNKNOWN

    @staticmethod
    def _aggregate_issue_type(evidence: list[ImageEvidenceResult]) -> IssueType:
        values = [IssueType(item.issue_type) for item in evidence if item.issue_type not in {IssueType.UNSPECIFIED, IssueType.UNKNOWN}]
        if not values:
            if any(item.visible_damage for item in evidence):
                return IssueType.UNKNOWN
            return IssueType.NONE
        return Counter(values).most_common(1)[0][0]

    @staticmethod
    def _aggregate_object_part(evidence: list[ImageEvidenceResult]) -> ObjectPart:
        values = [
            ObjectPart(item.object_part)
            for item in evidence
            if item.object_part not in {ObjectPart.UNSPECIFIED, ObjectPart.UNKNOWN}
        ]
        if values:
            return Counter(values).most_common(1)[0][0]
        return ObjectPart.UNKNOWN

    @staticmethod
    def _aggregate_severity(evidence: list[ImageEvidenceResult]) -> Severity:
        ordered = [Severity.HIGH, Severity.MEDIUM, Severity.LOW, Severity.NONE, Severity.UNKNOWN]
        severities = {Severity(item.severity) for item in evidence}
        for severity in ordered:
            if severity in severities:
                return severity
        return Severity.UNKNOWN

    @staticmethod
    def _aggregate_quality_risks(evidence: list[ImageEvidenceResult]) -> list[ImageQualityRisk]:
        risks = [ImageQualityRisk(risk) for item in evidence for risk in item.quality_risks]
        seen: set[ImageQualityRisk] = set()
        ordered: list[ImageQualityRisk] = []
        for risk in risks:
            if risk not in seen:
                seen.add(risk)
                ordered.append(risk)
        return ordered

    @staticmethod
    def _aggregate_reasoning(evidence: list[ImageEvidenceResult], duplicates: list[str]) -> str:
        if not evidence:
            return "No image paths were submitted for visual analysis."
        valid_count = sum(1 for item in evidence if item.valid_image)
        damage_count = sum(1 for item in evidence if item.visible_damage)
        parts = [
            f"Analyzed {len(evidence)} submitted image(s); {valid_count} were usable and {damage_count} had visible damage signals."
        ]
        if duplicates:
            parts.append("Duplicate visual hashes were detected for: " + ", ".join(duplicates) + ".")
        image_reasons = [f"{item.image_id}: {item.reasoning}" for item in evidence]
        return " ".join(parts + image_reasons)

    @staticmethod
    def _duplicates(analyses: list[ImageAnalysis]) -> list[str]:
        seen: dict[str, str] = {}
        duplicates: list[str] = []
        for analysis in analyses:
            if not analysis.perceptual_hash:
                continue
            if analysis.perceptual_hash in seen:
                duplicates.append(analysis.image_id)
            else:
                seen[analysis.perceptual_hash] = analysis.image_id
        return duplicates

    @staticmethod
    def _has_blocking_quality_risk(item: ImageEvidenceResult) -> bool:
        risks = {ImageQualityRisk(risk) for risk in item.quality_risks}
        blocking = {
            ImageQualityRisk.CROPPED_OR_OBSTRUCTED,
            ImageQualityRisk.LOW_LIGHT_OR_GLARE,
            ImageQualityRisk.WRONG_ANGLE,
            ImageQualityRisk.DAMAGE_NOT_VISIBLE,
            ImageQualityRisk.WRONG_OBJECT,
            ImageQualityRisk.NON_ORIGINAL_IMAGE,
        }
        return bool(risks.intersection(blocking))

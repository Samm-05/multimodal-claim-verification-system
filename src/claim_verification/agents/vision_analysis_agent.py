from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass

from claim_verification.domain.enums import ImageQualityRisk, IssueType, ObjectPart, Severity
from claim_verification.domain.models import ClaimInput, ImageAnalysis, ImageEvidenceResult, VisionAnalysisResult
from claim_verification.domain.ports import ImageRepository
from claim_verification.vision.image_features import ImageFeatureExtractor


@dataclass(frozen=True)
class VisionThresholds:
    blur_score_min: float = 65.0
    brightness_min: float = 35.0
    brightness_max: float = 220.0
    contrast_min: float = 18.0
    min_width: int = 320
    min_height: int = 240
    visible_damage_edge_density: float = 0.035
    cropped_edge_density: float = 0.005


class VisionAnalysisAgent:
    ISSUE_PATTERNS: dict[IssueType, tuple[str, ...]] = {
        IssueType.SCRATCH: ("scratch", "scrape", "scuff", "mark", "scratched"),
        IssueType.DENT: ("dent", "dented", "deformation"),
        IssueType.CRACK: ("crack", "cracked", "shatter", "shattered"),
        IssueType.BROKEN: ("broken", "break", "smashed"),
        IssueType.MISSING: ("missing", "lost"),
        IssueType.TORN: ("torn", "tear", "ripped"),
        IssueType.CRUSHED: ("crushed", "crush", "bent"),
        IssueType.WATER_DAMAGE: ("water", "liquid", "spill", "wet"),
        IssueType.STAIN: ("stain", "stained"),
    }
    PART_PATTERNS: dict[ObjectPart, tuple[str, ...]] = {
        ObjectPart.WINDSHIELD: ("windshield", "front glass"),
        ObjectPart.REAR_BUMPER: ("rear bumper", "back bumper", "back of the car"),
        ObjectPart.FRONT_BUMPER: ("front bumper", "front side"),
        ObjectPart.LEFT_HEADLIGHT: ("left headlight",),
        ObjectPart.RIGHT_HEADLIGHT: ("right headlight",),
        ObjectPart.HEADLIGHT: ("headlight", "light"),
        ObjectPart.DOOR_PANEL: ("door panel", "door"),
        ObjectPart.SCREEN: ("screen", "display"),
        ObjectPart.KEYBOARD: ("keyboard", "key"),
        ObjectPart.TRACKPAD: ("trackpad", "touchpad"),
        ObjectPart.HINGE: ("hinge",),
        ObjectPart.LID: ("lid",),
        ObjectPart.PACKAGE_CORNER: ("package corner", "box corner"),
        ObjectPart.CORNER: ("corner",),
        ObjectPart.SEAL: ("seal", "tape"),
        ObjectPart.FLAP: ("flap",),
        ObjectPart.EXTERIOR: ("package", "box", "parcel"),
    }

    def __init__(
        self,
        image_repository: ImageRepository,
        extractor: ImageFeatureExtractor,
        thresholds: VisionThresholds | None = None,
    ) -> None:
        self._image_repository = image_repository
        self._extractor = extractor
        self._thresholds = thresholds or VisionThresholds()

    def analyze(self, claim: ClaimInput) -> VisionAnalysisResult:
        images = [
            self._extractor.analyze(image_path, self._image_repository.resolve(image_path))
            for image_path in claim.image_paths
        ]
        duplicates = self._duplicates(images)
        evidence = [self._analyze_single_image(claim, image) for image in images]
        supporting_ids = [
            item.image_id
            for item in evidence
            if item.valid_image and item.visible_damage and not self._has_blocking_quality_risk(item)
        ]
        if not supporting_ids:
            supporting_ids = [item.image_id for item in evidence if item.valid_image]

        return VisionAnalysisResult(
            images=images,
            image_evidence=evidence,
            valid_image=any(item.valid_image for item in evidence),
            visible_damage=any(item.visible_damage for item in evidence),
            issue_type=self._aggregate_issue_type(evidence, claim.user_claim),
            object_part=self._aggregate_object_part(evidence, claim.user_claim),
            severity=self._aggregate_severity(evidence),
            quality_risks=self._aggregate_quality_risks(evidence),
            supporting_image_ids=supporting_ids,
            duplicate_image_ids=duplicates,
            reasoning=self._aggregate_reasoning(evidence, duplicates),
        )

    def _analyze_single_image(self, claim: ClaimInput, image: ImageAnalysis) -> ImageEvidenceResult:
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

        quality_risks = self._quality_risks(image)
        issue_type = self._infer_issue_type(claim.user_claim, image)
        object_part = self._infer_object_part(claim.user_claim)
        visible_damage = self._visible_damage(image, issue_type, quality_risks)
        severity = self._infer_severity(issue_type, image, quality_risks, visible_damage)

        return ImageEvidenceResult(
            image_id=image.image_id,
            image_path=image.image_path,
            valid_image=True,
            visible_damage=visible_damage,
            issue_type=issue_type,
            object_part=object_part,
            severity=severity,
            quality_risks=quality_risks,
            reasoning=self._single_image_reasoning(image, visible_damage, issue_type, object_part, quality_risks),
        )

    def _quality_risks(self, image: ImageAnalysis) -> list[ImageQualityRisk]:
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
            or (image.edge_density is not None and image.edge_density < self._thresholds.cropped_edge_density)
        ):
            risks.append(ImageQualityRisk.CROPPED_OR_OBSTRUCTED)
        return self._dedupe_enum_values(risks)

    def _visible_damage(
        self,
        image: ImageAnalysis,
        issue_type: IssueType,
        quality_risks: list[ImageQualityRisk],
    ) -> bool:
        if ImageQualityRisk.BLURRY_IMAGE in quality_risks and ImageQualityRisk.LOW_LIGHT_OR_GLARE in quality_risks:
            return False
        if issue_type == IssueType.UNSPECIFIED:
            return bool(image.edge_density is not None and image.edge_density >= self._thresholds.visible_damage_edge_density)
        return image.edge_density is None or image.edge_density >= self._thresholds.cropped_edge_density

    def _infer_issue_type(self, claim_text: str, image: ImageAnalysis) -> IssueType:
        text_issue = self._last_text_match(claim_text, self.ISSUE_PATTERNS, IssueType.UNSPECIFIED)
        if text_issue != IssueType.UNSPECIFIED:
            return text_issue
        if image.edge_density is not None and image.edge_density >= self._thresholds.visible_damage_edge_density:
            return IssueType.CRACK
        return IssueType.UNSPECIFIED

    def _infer_object_part(self, claim_text: str) -> ObjectPart:
        return self._last_text_match(claim_text, self.PART_PATTERNS, ObjectPart.UNSPECIFIED)

    @staticmethod
    def _infer_severity(
        issue_type: IssueType,
        image: ImageAnalysis,
        quality_risks: list[ImageQualityRisk],
        visible_damage: bool,
    ) -> Severity:
        if not visible_damage:
            return Severity.UNKNOWN
        if issue_type in {IssueType.BROKEN, IssueType.MISSING, IssueType.CRUSHED, IssueType.WATER_DAMAGE}:
            return Severity.HIGH
        if issue_type in {IssueType.CRACK, IssueType.DENT, IssueType.TORN}:
            return Severity.MEDIUM
        if quality_risks:
            return Severity.MEDIUM
        if image.edge_density is not None and image.edge_density > 0.08:
            return Severity.MEDIUM
        return Severity.LOW

    @staticmethod
    def _last_text_match(
        text: str,
        patterns: dict[IssueType, tuple[str, ...]] | dict[ObjectPart, tuple[str, ...]],
        fallback: IssueType | ObjectPart,
    ) -> IssueType | ObjectPart:
        normalized = re.sub(r"\s+", " ", text.lower())
        best_label = fallback
        best_position = -1
        best_length = -1
        for label, terms in patterns.items():
            for term in terms:
                position = normalized.rfind(term)
                if position > best_position or (position == best_position and len(term) > best_length):
                    best_label = label
                    best_position = position
                    best_length = len(term)
        return best_label

    @staticmethod
    def _aggregate_issue_type(
        evidence: list[ImageEvidenceResult],
        claim_text: str,
    ) -> IssueType:
        values = [IssueType(item.issue_type) for item in evidence if item.issue_type != IssueType.UNSPECIFIED]
        if values:
            return Counter(values).most_common(1)[0][0]
        return VisionAnalysisAgent._last_text_match(claim_text, VisionAnalysisAgent.ISSUE_PATTERNS, IssueType.UNSPECIFIED)

    @staticmethod
    def _aggregate_object_part(
        evidence: list[ImageEvidenceResult],
        claim_text: str,
    ) -> ObjectPart:
        values = [ObjectPart(item.object_part) for item in evidence if item.object_part != ObjectPart.UNSPECIFIED]
        if values:
            return Counter(values).most_common(1)[0][0]
        return VisionAnalysisAgent._last_text_match(claim_text, VisionAnalysisAgent.PART_PATTERNS, ObjectPart.UNSPECIFIED)

    @staticmethod
    def _aggregate_severity(evidence: list[ImageEvidenceResult]) -> Severity:
        ordered = [Severity.HIGH, Severity.MEDIUM, Severity.LOW, Severity.UNKNOWN]
        severities = {Severity(item.severity) for item in evidence}
        for severity in ordered:
            if severity in severities:
                return severity
        return Severity.UNKNOWN

    @staticmethod
    def _aggregate_quality_risks(evidence: list[ImageEvidenceResult]) -> list[ImageQualityRisk]:
        risks = [ImageQualityRisk(risk) for item in evidence for risk in item.quality_risks]
        return VisionAnalysisAgent._dedupe_enum_values(risks)

    @staticmethod
    def _aggregate_reasoning(evidence: list[ImageEvidenceResult], duplicates: list[str]) -> str:
        if not evidence:
            return "No image paths were submitted for visual analysis."
        valid_count = sum(1 for item in evidence if item.valid_image)
        damage_count = sum(1 for item in evidence if item.visible_damage)
        parts = [
            f"Analyzed {len(evidence)} submitted image(s); {valid_count} were readable and {damage_count} had visual damage signals."
        ]
        if duplicates:
            parts.append("Duplicate visual hashes were detected for: " + ", ".join(duplicates) + ".")
        image_reasons = [f"{item.image_id}: {item.reasoning}" for item in evidence]
        return " ".join(parts + image_reasons)

    @staticmethod
    def _single_image_reasoning(
        image: ImageAnalysis,
        visible_damage: bool,
        issue_type: IssueType,
        object_part: ObjectPart,
        quality_risks: list[ImageQualityRisk],
    ) -> str:
        metrics = []
        if image.blur_score is not None:
            metrics.append(f"blur={image.blur_score}")
        if image.brightness is not None:
            metrics.append(f"brightness={image.brightness}")
        if image.edge_density is not None:
            metrics.append(f"edge_density={image.edge_density}")
        risk_text = ", ".join(risk.value for risk in quality_risks) or "none"
        damage_text = "visible damage signal found" if visible_damage else "no reliable visible damage signal found"
        return (
            f"{damage_text}; inferred issue={issue_type.value}, part={object_part.value}; "
            f"quality_risks={risk_text}; metrics={', '.join(metrics) or 'not available'}."
        )

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
        return ImageQualityRisk.BLURRY_IMAGE in risks and ImageQualityRisk.LOW_LIGHT_OR_GLARE in risks

    @staticmethod
    def _dedupe_enum_values(values: list[ImageQualityRisk]) -> list[ImageQualityRisk]:
        seen: set[ImageQualityRisk] = set()
        result: list[ImageQualityRisk] = []
        for value in values:
            if value not in seen:
                seen.add(value)
                result.append(value)
        return result

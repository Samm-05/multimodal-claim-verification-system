from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np

from claim_verification.domain.enums import IssueType, Severity


@dataclass(frozen=True)
class DamageDetection:
    issue_type: IssueType
    severity: Severity
    visible_damage: bool
    confidence: float
    horizontal_line_density: float
    vertical_line_density: float
    blob_score: float
    stain_score: float
    tear_score: float
    text_overlay_score: float
    watermark_score: float


class DamageDetector:
    """Detect visually encoded damage patterns from image pixels."""

    def detect(self, image_bgr: np.ndarray) -> DamageDetection:
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        height, width = gray.shape[:2]
        center = gray[int(height * 0.25) : int(height * 0.85), int(width * 0.15) : int(width * 0.85)]
        if center.size == 0:
            return self._empty()

        edges = cv2.Canny(center, 60, 150)
        horizontal = self._line_density(edges, horizontal=True)
        vertical = self._line_density(edges, horizontal=False)
        blob_score = self._blob_score(center)
        stain_score = self._stain_score(image_bgr)
        tear_score = self._tear_score(edges)
        text_overlay_score = self._text_overlay_score(image_bgr)
        watermark_score = self._watermark_score(image_bgr)

        issue_type, severity, visible_damage, confidence = self._classify(
            horizontal=horizontal,
            vertical=vertical,
            blob_score=blob_score,
            stain_score=stain_score,
            tear_score=tear_score,
            center_edges=float(np.count_nonzero(edges) / edges.size),
        )
        return DamageDetection(
            issue_type=issue_type,
            severity=severity,
            visible_damage=visible_damage,
            confidence=confidence,
            horizontal_line_density=horizontal,
            vertical_line_density=vertical,
            blob_score=blob_score,
            stain_score=stain_score,
            tear_score=tear_score,
            text_overlay_score=text_overlay_score,
            watermark_score=watermark_score,
        )

    def _classify(
        self,
        horizontal: float,
        vertical: float,
        blob_score: float,
        stain_score: float,
        tear_score: float,
        center_edges: float,
    ) -> tuple[IssueType, Severity, bool, float]:
        scores = {
            IssueType.SCRATCH: horizontal * 2.0,
            IssueType.CRACK: vertical * 1.8 + center_edges * 0.6,
            IssueType.GLASS_SHATTER: vertical * 2.0 + center_edges * 1.0,
            IssueType.DENT: blob_score * 2.0,
            IssueType.BROKEN_PART: blob_score * 1.2 + center_edges * 1.4,
            IssueType.CRUSHED_PACKAGING: blob_score * 1.4 + horizontal * 0.5,
            IssueType.TORN_PACKAGING: tear_score * 2.2,
            IssueType.WATER_DAMAGE: stain_score * 0.8,
            IssueType.STAIN: stain_score * 0.7,
        }
        best_issue, best_score = max(scores.items(), key=lambda item: item[1])
        if best_score < 0.12:
            return IssueType.NONE, Severity.NONE, False, best_score

        if best_issue == IssueType.SCRATCH:
            severity = Severity.LOW if best_score < 0.22 else Severity.MEDIUM
        elif best_issue in {IssueType.BROKEN_PART, IssueType.CRUSHED_PACKAGING, IssueType.GLASS_SHATTER}:
            severity = Severity.HIGH if best_score > 0.35 else Severity.MEDIUM
        elif best_issue in {IssueType.DENT, IssueType.CRACK, IssueType.TORN_PACKAGING}:
            severity = Severity.MEDIUM if best_score > 0.2 else Severity.LOW
        elif best_issue in {IssueType.STAIN, IssueType.WATER_DAMAGE}:
            severity = Severity.MEDIUM
        else:
            severity = Severity.LOW

        return best_issue, severity, True, min(1.0, best_score)

    @staticmethod
    def _line_density(edges: np.ndarray, horizontal: bool) -> float:
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=25, minLineLength=18, maxLineGap=8)
        if lines is None:
            return 0.0
        matching = 0
        for line in lines:
            x1, y1, x2, y2 = line[0]
            dx = abs(x2 - x1)
            dy = abs(y2 - y1)
            if horizontal and dx > dy * 2:
                matching += 1
            if not horizontal and dy > dx * 2:
                matching += 1
        return matching / max(edges.size / 10_000, 1.0)

    @staticmethod
    def _blob_score(gray: np.ndarray) -> float:
        blur = cv2.GaussianBlur(gray, (9, 9), 0)
        laplacian = cv2.Laplacian(blur, cv2.CV_64F)
        normalized = cv2.normalize(np.abs(laplacian), None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        _, thresh = cv2.threshold(normalized, 40, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return 0.0
        largest = max(contours, key=cv2.contourArea)
        area_ratio = cv2.contourArea(largest) / gray.size
        return min(1.0, area_ratio * 12.0)

    @staticmethod
    def _stain_score(image_bgr: np.ndarray) -> float:
        height, width = image_bgr.shape[:2]
        center = image_bgr[int(height * 0.25) : int(height * 0.85), int(width * 0.15) : int(width * 0.85)]
        hsv = cv2.cvtColor(center, cv2.COLOR_BGR2HSV)
        brown_mask = cv2.inRange(hsv, (8, 60, 40), (30, 255, 220))
        blue_mask = cv2.inRange(hsv, (95, 60, 40), (130, 255, 220))
        combined = cv2.bitwise_or(brown_mask, blue_mask)
        return float(np.count_nonzero(combined) / combined.size)

    @staticmethod
    def _tear_score(edges: np.ndarray) -> float:
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return 0.0
        irregular = 0
        for contour in contours:
            perimeter = cv2.arcLength(contour, True)
            area = cv2.contourArea(contour)
            if perimeter <= 0 or area <= 0:
                continue
            circularity = 4 * np.pi * area / (perimeter * perimeter)
            if circularity < 0.15 and area > 80:
                irregular += 1
        return min(1.0, irregular / 6.0)

    @staticmethod
    def _text_overlay_score(image_bgr: np.ndarray) -> float:
        height, width = image_bgr.shape[:2]
        footer = image_bgr[int(height * 0.82) :, :]
        gray = cv2.cvtColor(footer, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 80, 180)
        return float(np.count_nonzero(edges) / edges.size)

    @staticmethod
    def _watermark_score(image_bgr: np.ndarray) -> float:
        width = image_bgr.shape[1]
        corner = image_bgr[0:48, width - 48 : width] if width >= 48 else image_bgr
        gray = cv2.cvtColor(corner, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 60, 140)
        return float(np.count_nonzero(edges) / edges.size)

    @staticmethod
    def _empty() -> DamageDetection:
        return DamageDetection(
            issue_type=IssueType.NONE,
            severity=Severity.NONE,
            visible_damage=False,
            confidence=0.0,
            horizontal_line_density=0.0,
            vertical_line_density=0.0,
            blob_score=0.0,
            stain_score=0.0,
            tear_score=0.0,
            text_overlay_score=0.0,
            watermark_score=0.0,
        )

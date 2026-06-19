from __future__ import annotations

from pathlib import Path

import cv2
import imagehash
import numpy as np
from PIL import Image

from claim_verification.domain.models import ImageAnalysis, image_id_from_path


class ImageFeatureExtractor:
    def analyze(self, declared_path: str, resolved_path: Path) -> ImageAnalysis:
        if not resolved_path.exists():
            return ImageAnalysis(
                image_path=declared_path,
                image_id=image_id_from_path(declared_path),
                exists=False,
                readable=False,
                notes=["image file not found"],
            )

        image = cv2.imread(str(resolved_path))
        if image is None:
            return ImageAnalysis(
                image_path=declared_path,
                image_id=image_id_from_path(declared_path),
                exists=True,
                readable=False,
                notes=["image file could not be decoded"],
            )

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        height, width = gray.shape[:2]
        roi = gray[int(height * 0.2) : int(height * 0.85), int(width * 0.1) : int(width * 0.9)]
        blur_score = float(cv2.Laplacian(roi, cv2.CV_64F).var())
        brightness = float(np.mean(roi))
        contrast = float(np.std(roi))
        edges = cv2.Canny(roi, 80, 160)
        edge_density = float(np.count_nonzero(edges) / edges.size)
        notes = self._quality_notes(width, height, blur_score, brightness, contrast)

        return ImageAnalysis(
            image_path=declared_path,
            image_id=image_id_from_path(declared_path),
            exists=True,
            readable=True,
            width=width,
            height=height,
            blur_score=round(blur_score, 3),
            brightness=round(brightness, 3),
            contrast=round(contrast, 3),
            edge_density=round(edge_density, 5),
            perceptual_hash=self._hash(resolved_path),
            notes=notes,
        )

    @staticmethod
    def _hash(path: Path) -> str | None:
        try:
            with Image.open(path) as image:
                return str(imagehash.phash(image))
        except Exception:
            return None

    @staticmethod
    def _quality_notes(
        width: int,
        height: int,
        blur_score: float,
        brightness: float,
        contrast: float,
    ) -> list[str]:
        notes: list[str] = []
        if width < 320 or height < 240:
            notes.append("low resolution")
        if blur_score < 65:
            notes.append("potential blur")
        if brightness < 35:
            notes.append("underexposed")
        if brightness > 220:
            notes.append("overexposed")
        if contrast < 18:
            notes.append("low contrast")
        return notes


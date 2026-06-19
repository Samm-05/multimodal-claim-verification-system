from __future__ import annotations

from claim_verification.domain.models import ClaimRecord, VisionAnalysisResult
from claim_verification.domain.ports import ImageRepository
from claim_verification.vision.image_features import ImageFeatureExtractor


class VisionAnalysisAgent:
    def __init__(self, image_repository: ImageRepository, extractor: ImageFeatureExtractor) -> None:
        self._image_repository = image_repository
        self._extractor = extractor

    def analyze(self, claim: ClaimRecord) -> VisionAnalysisResult:
        analyses = [
            self._extractor.analyze(image_path, self._image_repository.resolve(image_path))
            for image_path in claim.image_paths
        ]
        valid_ids = [analysis.image_id for analysis in analyses if analysis.valid]
        duplicates = self._duplicates(analyses)
        return VisionAnalysisResult(
            images=analyses,
            valid_image=bool(valid_ids),
            supporting_image_ids=valid_ids,
            duplicate_image_ids=duplicates,
        )

    @staticmethod
    def _duplicates(analyses: list) -> list[str]:
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


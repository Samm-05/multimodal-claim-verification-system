from __future__ import annotations

from pathlib import Path
from typing import Protocol

from claim_verification.domain.models import ClaimRecord, EvidenceRequirement, UserHistory


class ClaimRepository(Protocol):
    def load_claims(self, path: Path) -> list[ClaimRecord]:
        ...

    def load_user_history(self, path: Path) -> dict[str, UserHistory]:
        ...

    def load_evidence_requirements(self, path: Path) -> list[EvidenceRequirement]:
        ...


class ImageRepository(Protocol):
    def resolve(self, image_path: str) -> Path:
        ...


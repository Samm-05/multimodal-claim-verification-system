from __future__ import annotations

from pathlib import Path


class LocalImageRepository:
    def __init__(self, project_root: Path) -> None:
        self._project_root = project_root

    def resolve(self, image_path: str) -> Path:
        path = Path(image_path)
        if path.is_absolute():
            return path
        direct = self._project_root / path
        if direct.exists():
            return direct
        data_claims = self._project_root / "data" / "claims" / path
        if data_claims.exists():
            return data_claims
        return direct


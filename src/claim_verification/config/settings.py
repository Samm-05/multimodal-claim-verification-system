from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    project_root: Path
    data_dir: Path
    claims_path: Path
    sample_claims_path: Path
    user_history_path: Path
    evidence_requirements_path: Path
    output_path: Path
    evaluation_path: Path
    log_path: Path

    @classmethod
    def from_project_root(cls, project_root: Path) -> "Settings":
        data_dir = project_root / "data" / "claims"
        return cls(
            project_root=project_root,
            data_dir=data_dir,
            claims_path=data_dir / "claims.csv",
            sample_claims_path=data_dir / "sample_claims.csv",
            user_history_path=data_dir / "user_history.csv",
            evidence_requirements_path=data_dir / "evidence_requirements.csv",
            output_path=project_root / "outputs" / "predictions.csv",
            evaluation_path=project_root / "outputs" / "evaluation_report.json",
            log_path=project_root / "logs" / "app.log",
        )


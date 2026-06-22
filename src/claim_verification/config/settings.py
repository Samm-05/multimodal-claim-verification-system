from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


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
    evaluation_markdown_path: Path
    log_path: Path
    gemini_api_key: str | None
    gemini_model: str

    @classmethod
    def from_project_root(cls, project_root: Path) -> "Settings":
        load_dotenv(project_root / ".env")
        data_dir = project_root / "data" / "claims"
        return cls(
            project_root=project_root,
            data_dir=data_dir,
            claims_path=data_dir / "claims.csv",
            sample_claims_path=data_dir / "sample_claims.csv",
            user_history_path=data_dir / "user_history.csv",
            evidence_requirements_path=data_dir / "evidence_requirements.csv",
            output_path=project_root / "output.csv",
            evaluation_path=project_root / "outputs" / "evaluation_report.json",
            evaluation_markdown_path=project_root / "evaluation" / "evaluation_report.md",
            log_path=project_root / "logs" / "app.log",
            gemini_api_key=os.getenv("GEMINI_API_KEY"),
            gemini_model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        )


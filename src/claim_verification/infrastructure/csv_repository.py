from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd

from claim_verification.domain.models import ClaimRecord, EvidenceRequirement, UserHistory


class PandasClaimRepository:
    def load_claims(self, path: Path) -> list[ClaimRecord]:
        frame = self._read_csv(path)
        records: list[ClaimRecord] = []
        for row in frame.fillna("").to_dict(orient="records"):
            records.append(
                ClaimRecord(
                    user_id=str(row.get("user_id", "")).strip(),
                    image_paths=row.get("image_paths", ""),
                    user_claim=str(row.get("user_claim", "")).strip(),
                    claim_object=str(row.get("claim_object", "")).strip().lower(),
                    source_row=row,
                )
            )
        return records

    def load_user_history(self, path: Path) -> dict[str, UserHistory]:
        frame = self._read_csv(path)
        history: dict[str, UserHistory] = {}
        for row in frame.fillna("").to_dict(orient="records"):
            parsed = UserHistory(
                user_id=str(row.get("user_id", "")).strip(),
                past_claim_count=self._int(row.get("past_claim_count")),
                accept_claim=self._int(row.get("accept_claim")),
                manual_review_claim=self._int(row.get("manual_review_claim")),
                rejected_claim=self._int(row.get("rejected_claim")),
                last_90_days_claim_count=self._int(row.get("last_90_days_claim_count")),
                history_flags=str(row.get("history_flags", "none") or "none"),
                history_summary=str(row.get("history_summary", "") or ""),
            )
            history[parsed.user_id] = parsed
        return history

    def load_evidence_requirements(self, path: Path) -> list[EvidenceRequirement]:
        frame = self._read_csv(path)
        return [
            EvidenceRequirement(
                requirement_id=str(row.get("requirement_id", "")).strip(),
                claim_object=str(row.get("claim_object", "")).strip().lower(),
                applies_to=str(row.get("applies_to", "")).strip().lower(),
                minimum_image_evidence=str(row.get("minimum_image_evidence", "")).strip(),
            )
            for row in frame.fillna("").to_dict(orient="records")
        ]

    def write_rows(self, rows: list[dict[str, Any]], path: Path, columns: list[str]) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        pd.DataFrame(rows, columns=columns).to_csv(path, index=False)

    @staticmethod
    def _read_csv(path: Path) -> pd.DataFrame:
        if not path.exists():
            raise FileNotFoundError(f"Required CSV not found: {path}")
        return pd.read_csv(path)

    @staticmethod
    def _int(value: Any) -> int:
        try:
            return int(value)
        except (TypeError, ValueError):
            return 0


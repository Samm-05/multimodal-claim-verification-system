from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import pandas as pd

from claim_verification.domain.models import OUTPUT_COLUMNS


@dataclass(frozen=True)
class EvaluationReport:
    row_count: int
    exact_match_accuracy: float | None
    column_accuracy: dict[str, float]
    schema_valid: bool

    def to_dict(self) -> dict[str, Any]:
        return {
            "row_count": self.row_count,
            "exact_match_accuracy": self.exact_match_accuracy,
            "column_accuracy": self.column_accuracy,
            "schema_valid": self.schema_valid,
        }


class Evaluator:
    LABEL_COLUMNS = [
        "evidence_standard_met",
        "risk_flags",
        "issue_type",
        "object_part",
        "claim_status",
        "supporting_image_ids",
        "valid_image",
        "severity",
    ]

    def evaluate(self, predictions: pd.DataFrame, labels: pd.DataFrame) -> EvaluationReport:
        schema_valid = list(predictions.columns) == OUTPUT_COLUMNS
        comparable = [column for column in self.LABEL_COLUMNS if column in labels.columns]
        if not comparable or predictions.empty:
            return EvaluationReport(
                row_count=len(predictions),
                exact_match_accuracy=None,
                column_accuracy={},
                schema_valid=schema_valid,
            )

        aligned = predictions.head(len(labels)).reset_index(drop=True)
        labels = labels.head(len(aligned)).reset_index(drop=True)
        column_accuracy = {
            column: float((self._norm(aligned[column]) == self._norm(labels[column])).mean())
            for column in comparable
            if column in aligned.columns
        }
        exact = pd.Series(True, index=aligned.index)
        for column in column_accuracy:
            exact = exact & (self._norm(aligned[column]) == self._norm(labels[column]))
        return EvaluationReport(
            row_count=len(aligned),
            exact_match_accuracy=float(exact.mean()),
            column_accuracy=column_accuracy,
            schema_valid=schema_valid,
        )

    @staticmethod
    def _norm(series: pd.Series) -> pd.Series:
        return series.fillna("").astype(str).str.strip().str.lower()


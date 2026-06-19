from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import pandas as pd

from claim_verification.application.claim_pipeline import PipelineRunSummary
from claim_verification.domain.models import OUTPUT_COLUMNS


@dataclass(frozen=True)
class ClassificationMetrics:
    accuracy: float
    precision: float
    recall: float
    f1_score: float

    def to_dict(self) -> dict[str, float]:
        return {
            "accuracy": self.accuracy,
            "precision": self.precision,
            "recall": self.recall,
            "f1_score": self.f1_score,
        }


@dataclass(frozen=True)
class EvaluationReport:
    row_count: int
    correct_predictions: int
    exact_match_accuracy: float | None
    column_accuracy: dict[str, float]
    classification_metrics: dict[str, ClassificationMetrics]
    schema_valid: bool
    error_analysis: list[dict[str, str]] = field(default_factory=list)
    runtime_seconds: float = 0.0
    estimated_cost_usd: float = 0.0
    model_usage_estimation: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "row_count": self.row_count,
            "correct_predictions": self.correct_predictions,
            "exact_match_accuracy": self.exact_match_accuracy,
            "column_accuracy": self.column_accuracy,
            "classification_metrics": {
                column: metrics.to_dict() for column, metrics in self.classification_metrics.items()
            },
            "schema_valid": self.schema_valid,
            "error_analysis": self.error_analysis,
            "runtime_seconds": self.runtime_seconds,
            "estimated_cost_usd": self.estimated_cost_usd,
            "model_usage_estimation": self.model_usage_estimation,
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
    METRIC_COLUMNS = ["claim_status", "evidence_standard_met", "valid_image", "severity"]
    COST_PER_1K_RECORDS_USD = 0.0

    def evaluate(
        self,
        predictions: pd.DataFrame,
        labels: pd.DataFrame,
        run_summary: PipelineRunSummary | None = None,
    ) -> EvaluationReport:
        schema_valid = list(predictions.columns) == OUTPUT_COLUMNS
        comparable = [column for column in self.LABEL_COLUMNS if column in labels.columns and column in predictions.columns]
        aligned_predictions = predictions.head(len(labels)).reset_index(drop=True)
        aligned_labels = labels.head(len(aligned_predictions)).reset_index(drop=True)

        if not comparable or aligned_predictions.empty:
            return EvaluationReport(
                row_count=len(aligned_predictions),
                correct_predictions=0,
                exact_match_accuracy=None,
                column_accuracy={},
                classification_metrics={},
                schema_valid=schema_valid,
                runtime_seconds=self._runtime(run_summary),
                estimated_cost_usd=self._cost(len(aligned_predictions)),
                model_usage_estimation=self._usage(aligned_predictions, run_summary),
            )

        matches_by_column = {
            column: self._norm(aligned_predictions[column]) == self._norm(aligned_labels[column])
            for column in comparable
        }
        column_accuracy = {
            column: round(float(matches.mean()), 4) for column, matches in matches_by_column.items()
        }
        exact = pd.Series(True, index=aligned_predictions.index)
        for matches in matches_by_column.values():
            exact = exact & matches
        correct_predictions = int(exact.sum())
        metrics = {
            column: self._classification_metrics(aligned_predictions[column], aligned_labels[column])
            for column in self.METRIC_COLUMNS
            if column in comparable
        }

        return EvaluationReport(
            row_count=len(aligned_predictions),
            correct_predictions=correct_predictions,
            exact_match_accuracy=round(float(exact.mean()), 4),
            column_accuracy=column_accuracy,
            classification_metrics=metrics,
            schema_valid=schema_valid,
            error_analysis=self._error_analysis(aligned_predictions, aligned_labels, comparable),
            runtime_seconds=self._runtime(run_summary),
            estimated_cost_usd=self._cost(len(aligned_predictions)),
            model_usage_estimation=self._usage(aligned_predictions, run_summary),
        )

    def write_markdown_report(self, report: EvaluationReport, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(self.to_markdown(report), encoding="utf-8")

    @staticmethod
    def to_markdown(report: EvaluationReport) -> str:
        lines = [
            "# Evaluation Report",
            "",
            "## Summary",
            "",
            f"- Total records: {report.row_count}",
            f"- Correct predictions: {report.correct_predictions}",
            f"- Exact match accuracy: {Evaluator._fmt(report.exact_match_accuracy)}",
            f"- Schema valid: {report.schema_valid}",
            "",
            "## Classification Metrics",
            "",
            "| Target | Accuracy | Precision | Recall | F1 Score |",
            "|---|---:|---:|---:|---:|",
        ]
        for column, metrics in report.classification_metrics.items():
            lines.append(
                f"| {column} | {metrics.accuracy:.4f} | {metrics.precision:.4f} | "
                f"{metrics.recall:.4f} | {metrics.f1_score:.4f} |"
            )
        lines.extend(["", "## Column Accuracy", "", "| Column | Accuracy |", "|---|---:|"])
        for column, accuracy in report.column_accuracy.items():
            lines.append(f"| {column} | {accuracy:.4f} |")

        lines.extend(["", "## Error Analysis", ""])
        if report.error_analysis:
            lines.extend(["| Row | User ID | Column | Prediction | Label |", "|---:|---|---|---|---|"])
            for item in report.error_analysis[:25]:
                lines.append(
                    f"| {item['row']} | {item['user_id']} | {item['column']} | "
                    f"{item['prediction']} | {item['label']} |"
                )
        else:
            lines.append("No comparable prediction errors were found.")

        lines.extend(
            [
                "",
                "## Failure Modes",
                "",
                "- Missing or unreadable images reduce evidence to `not_enough_information`.",
                "- Wrong-angle or cropped images block part-specific verification.",
                "- Claim/image mismatch routes to `contradicted` while preserving image-grounded reasoning.",
                "- User history adds risk flags only; it does not override visible evidence.",
                "",
                "## Misclassification Review",
                "",
            ]
        )
        misclassified = [item for item in report.error_analysis if item["column"] == "claim_status"][:10]
        if misclassified:
            lines.extend(["| Row | User ID | Prediction | Label |", "|---:|---|---|---|"])
            for item in misclassified:
                lines.append(f"| {item['row']} | {item['user_id']} | {item['prediction']} | {item['label']} |")
        else:
            lines.append("No claim_status misclassifications were found.")

        lines.extend(
            [
                "",
                "## Runtime Analysis",
                "",
                f"- Runtime seconds: {report.runtime_seconds:.4f}",
                f"- Records per second: {Evaluator._records_per_second(report)}",
                "",
                "## Cost Estimation",
                "",
                f"- Estimated external model/API cost: ${report.estimated_cost_usd:.4f}",
                "- Current implementation is local CPU-only heuristic processing, so external inference cost is $0.00.",
                "",
                "## Model Usage Estimation",
                "",
            ]
        )
        for key, value in report.model_usage_estimation.items():
            lines.append(f"- {key}: {value}")
        lines.append("")
        return "\n".join(lines)

    @staticmethod
    def _classification_metrics(predictions: pd.Series, labels: pd.Series) -> ClassificationMetrics:
        pred = Evaluator._norm(predictions)
        truth = Evaluator._norm(labels)
        classes = sorted(set(pred.tolist()) | set(truth.tolist()))
        if not classes:
            return ClassificationMetrics(accuracy=0.0, precision=0.0, recall=0.0, f1_score=0.0)

        accuracy = float((pred == truth).mean())
        precisions: list[float] = []
        recalls: list[float] = []
        f1s: list[float] = []
        for label in classes:
            tp = int(((pred == label) & (truth == label)).sum())
            fp = int(((pred == label) & (truth != label)).sum())
            fn = int(((pred != label) & (truth == label)).sum())
            precision = tp / (tp + fp) if tp + fp else 0.0
            recall = tp / (tp + fn) if tp + fn else 0.0
            f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
            precisions.append(precision)
            recalls.append(recall)
            f1s.append(f1)

        return ClassificationMetrics(
            accuracy=round(accuracy, 4),
            precision=round(sum(precisions) / len(precisions), 4),
            recall=round(sum(recalls) / len(recalls), 4),
            f1_score=round(sum(f1s) / len(f1s), 4),
        )

    @staticmethod
    def _error_analysis(
        predictions: pd.DataFrame,
        labels: pd.DataFrame,
        comparable: list[str],
    ) -> list[dict[str, str]]:
        errors: list[dict[str, str]] = []
        for index in range(len(predictions)):
            for column in comparable:
                prediction = str(predictions.at[index, column])
                label = str(labels.at[index, column])
                if prediction.strip().lower() != label.strip().lower():
                    errors.append(
                        {
                            "row": str(index + 1),
                            "user_id": str(labels.at[index, "user_id"]) if "user_id" in labels.columns else "",
                            "column": column,
                            "prediction": prediction,
                            "label": label,
                        }
                    )
        return errors

    @staticmethod
    def _usage(predictions: pd.DataFrame, run_summary: PipelineRunSummary | None) -> dict[str, Any]:
        image_count = 0
        if "image_paths" in predictions.columns:
            image_count = int(
                predictions["image_paths"]
                .fillna("")
                .astype(str)
                .apply(lambda value: len([item for item in value.split(";") if item.strip()]))
                .sum()
            )
        return {
            "records_processed": len(predictions),
            "images_referenced": image_count,
            "images_processed": image_count,
            "external_model_calls": 0,
            "vision_backend": "OpenCV/Pillow heuristic feature extraction",
            "retry_attempts": run_summary.retry_attempts if run_summary else 0,
            "failed_records": run_summary.failed_records if run_summary else 0,
            "caching_strategy": "per-run in-memory image feature extraction",
            "retry_strategy": "per-claim bounded retries with recovery output",
            "rate_limit_strategy": "not required for local CPU pipeline",
            "token_estimate": 0,
            "throughput_records_per_second": (
                round(len(predictions) / run_summary.runtime_seconds, 4)
                if run_summary and run_summary.runtime_seconds > 0
                else 0
            ),
        }

    @classmethod
    def _cost(cls, row_count: int) -> float:
        return round((row_count / 1000) * cls.COST_PER_1K_RECORDS_USD, 6)

    @staticmethod
    def _runtime(run_summary: PipelineRunSummary | None) -> float:
        return run_summary.runtime_seconds if run_summary else 0.0

    @staticmethod
    def _records_per_second(report: EvaluationReport) -> str:
        if report.runtime_seconds <= 0:
            return "not available"
        return f"{report.row_count / report.runtime_seconds:.4f}"

    @staticmethod
    def _fmt(value: float | None) -> str:
        return "not available" if value is None else f"{value:.4f}"

    @staticmethod
    def _norm(series: pd.Series) -> pd.Series:
        return series.fillna("").astype(str).str.strip().str.lower()


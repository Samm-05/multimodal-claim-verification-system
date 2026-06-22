from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd

from claim_verification.application.factory import build_claim_pipeline
from claim_verification.config.settings import Settings
from claim_verification.domain.models import OUTPUT_COLUMNS
from claim_verification.evaluation.evaluator import Evaluator
from claim_verification.infrastructure.csv_repository import PandasClaimRepository
from claim_verification.infrastructure.image_repository import LocalImageRepository
from claim_verification.infrastructure.logger import configure_logger


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run multi-modal claim verification.")
    parser.add_argument("--input", choices=["claims", "sample"], default="claims")
    parser.add_argument("--output", type=Path, default=None)
    parser.add_argument("--evaluate", action="store_true")
    parser.add_argument("--max-retries", type=int, default=2)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    project_root = Path.cwd()
    settings = Settings.from_project_root(project_root)
    configure_logger(settings.log_path)

    repository = PandasClaimRepository()
    claims_path = settings.sample_claims_path if args.input == "sample" else settings.claims_path
    output_path = args.output or settings.output_path

    claims = repository.load_claims(claims_path)
    history = repository.load_user_history(settings.user_history_path)
    requirements = repository.load_evidence_requirements(settings.evidence_requirements_path)
    pipeline = build_claim_pipeline(
        image_repository=LocalImageRepository(project_root),
        requirements=requirements,
        csv_repository=repository,
        max_retries=args.max_retries,
        gemini_api_key=settings.gemini_api_key,
        gemini_model=settings.gemini_model,
    )
    run_result = pipeline.run(claims, history, output_path)
    outputs = run_result.outputs

    if args.evaluate:
        predictions = pd.DataFrame([output.to_row() for output in outputs], columns=OUTPUT_COLUMNS)
        labels = pd.read_csv(settings.sample_claims_path)
        evaluator = Evaluator()
        report = evaluator.evaluate(predictions, labels, run_result.summary)
        settings.evaluation_path.parent.mkdir(parents=True, exist_ok=True)
        settings.evaluation_path.write_text(json.dumps(report.to_dict(), indent=2), encoding="utf-8")
        evaluator.write_markdown_report(report, settings.evaluation_markdown_path)

    print(f"Wrote {len(outputs)} predictions to {output_path}")


if __name__ == "__main__":
    main()

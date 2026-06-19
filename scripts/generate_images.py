from __future__ import annotations

import argparse
import re
from pathlib import Path

import pandas as pd
import yaml

from claim_verification.agents.claim_extraction_agent import ClaimExtractionAgent
from claim_verification.domain.models import ClaimRecord
from claim_verification.vision.synthetic_image_generator import ImageSpec, SyntheticImageGenerator


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate synthetic fixture images for claim verification.")
    parser.add_argument("--project-root", type=Path, default=Path.cwd())
    parser.add_argument("--dataset", choices=["sample", "test", "all"], default="all")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    root = args.project_root
    generator = SyntheticImageGenerator()
    if args.dataset in {"sample", "all"}:
        generate_from_specs(
            generator,
            root / "data" / "image_specs" / "sample_cases.yaml",
            root / "images" / "sample",
        )
    if args.dataset in {"test", "all"}:
        generate_from_claims(
            generator,
            root / "data" / "claims" / "claims.csv",
            root / "images" / "test",
        )


def generate_from_specs(generator: SyntheticImageGenerator, spec_path: Path, output_root: Path) -> None:
    specs = yaml.safe_load(spec_path.read_text(encoding="utf-8"))
    for case_name, case_data in specs.items():
        object_type = case_data["object_type"]
        for image_name, image_data in case_data["images"].items():
            spec = SyntheticImageGenerator.from_mapping({"object_type": object_type, **image_data})
            output_path = output_root / case_name / image_name
            seed = abs(hash(f"{case_name}:{image_name}")) % 10_000
            generator.generate(spec, output_path, seed=seed)


def generate_from_claims(generator: SyntheticImageGenerator, claims_path: Path, output_root: Path) -> None:
    frame = pd.read_csv(claims_path)
    extractor = ClaimExtractionAgent()
    for row in frame.fillna("").to_dict(orient="records"):
        claim = ClaimRecord(
            user_id=str(row["user_id"]),
            image_paths=row["image_paths"],
            user_claim=str(row["user_claim"]),
            claim_object=str(row["claim_object"]).lower(),
        )
        extraction = extractor.extract(claim)
        issue_type = str(extraction.issue_type)
        object_part = str(extraction.object_part).replace("unspecified", "unknown")
        for index, image_path in enumerate(claim.image_paths):
            case_name = _case_name(image_path)
            image_name = Path(image_path).name
            spec = ImageSpec(
                object_type=str(claim.claim_object),
                object_part=object_part,
                issue_type=issue_type if index == 0 else "none",
                severity="medium" if index == 0 else "none",
                blur=index == 0 and "blurry" in claim.user_claim.lower(),
            )
            output_path = output_root / case_name / image_name
            seed = abs(hash(image_path)) % 10_000
            generator.generate(spec, output_path, seed=seed)


def _case_name(image_path: str) -> str:
    match = re.search(r"(case_\d+)", image_path)
    if not match:
        raise ValueError(f"Could not parse case folder from image path: {image_path}")
    return match.group(1)


if __name__ == "__main__":
    main()

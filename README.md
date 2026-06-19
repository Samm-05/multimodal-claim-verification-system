# Multi-Modal Damage Claim Verification System

Production-style Python pipeline for verifying car, laptop, and package damage claims from CSV records and image paths.

## Architecture

The app uses Clean Architecture with dependency injection and a six-agent workflow:

1. **Claim Extraction Agent** — parses customer conversation into issue type and object part
2. **Vision Analysis Agent** — analyzes images for visible damage and supporting evidence
3. **Image Quality Agent** — detects blur, wrong angle, wrong object, and related quality risks
4. **Evidence Validation Agent** — checks images against `evidence_requirements.csv`
5. **Risk Assessment Agent** — adds user-history and evidence risk flags (never overrides vision)
6. **Decision Agent** — produces final `supported`, `contradicted`, or `not_enough_information`

Images are the primary source of truth. User history provides risk context only.

## Data Layout

```text
data/claims/claims.csv
data/claims/sample_claims.csv
data/claims/user_history.csv
data/claims/evidence_requirements.csv
data/image_specs/sample_cases.yaml
images/sample/
images/test/
```

Generate fixture images before the first run:

```bash
$env:PYTHONPATH="src"; python scripts/generate_images.py --dataset all
```

## Run

Process all claims and write `output.csv`:

```bash
$env:PYTHONPATH="src"; python -m claim_verification.main --input claims
```

Evaluate against labeled `sample_claims.csv`:

```bash
$env:PYTHONPATH="src"; python -m claim_verification.main --input sample --evaluate
```

Outputs:

```text
output.csv
evaluation/evaluation_report.md
outputs/evaluation_report.json
logs/app.log
```

## Output Schema

```text
user_id
image_paths
user_claim
claim_object
evidence_standard_met
evidence_standard_met_reason
risk_flags
issue_type
object_part
claim_status
claim_status_justification
supporting_image_ids
valid_image
severity
```

## Tests

```bash
$env:PYTHONPATH="src"; pytest
```

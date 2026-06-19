# Multi-Modal Damage Claim Verification System

Production-style Python pipeline for verifying car, laptop, and package damage claims from CSV records and image paths.

## Architecture

The app uses Clean Architecture with dependency injection:

- Claim Extraction Agent
- Vision Analysis Agent
- Evidence Validation Agent
- Risk Assessment Agent
- Decision Agent

Infrastructure adapters handle CSV and image filesystem access. Domain logic is typed with Pydantic models and isolated from Pandas/OpenCV details.

## Data Layout

Expected files:

```text
data/claims/claims.csv
data/claims/sample_claims.csv
data/claims/user_history.csv
data/claims/evidence_requirements.csv
data/claims/images/sample/
data/claims/images/test/
```

The current supplied zip includes CSVs. If images are absent, the system records invalid image evidence and explains the decision.

## Run

```bash
$env:PYTHONPATH="src"; python -m claim_verification.main
```

For evaluation on labeled sample data:

```bash
$env:PYTHONPATH="src"; python -m claim_verification.main --input sample --evaluate
```

Outputs are written to:

```text
outputs/predictions.csv
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

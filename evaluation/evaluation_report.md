# Evaluation Report

## Summary

- Total records: 20
- Correct predictions: 0
- Exact match accuracy: 0.0000
- Schema valid: True

## Classification Metrics

| Target | Accuracy | Precision | Recall | F1 Score |
|---|---:|---:|---:|---:|
| claim_status | 0.1000 | 0.0333 | 0.3333 | 0.0606 |
| evidence_standard_met | 0.1000 | 0.0500 | 0.5000 | 0.0909 |
| valid_image | 0.1000 | 0.0500 | 0.5000 | 0.0909 |
| severity | 0.1000 | 0.0200 | 0.2000 | 0.0364 |

## Column Accuracy

| Column | Accuracy |
|---|---:|
| evidence_standard_met | 0.1000 |
| risk_flags | 0.0000 |
| issue_type | 0.1500 |
| object_part | 0.0500 |
| claim_status | 0.1000 |
| supporting_image_ids | 0.0000 |
| valid_image | 0.1000 |
| severity | 0.1000 |

## Error Analysis

| Row | User ID | Column | Prediction | Label |
|---:|---|---|---|---|
| 1 | user_001 | evidence_standard_met | False | True |
| 1 | user_001 | risk_flags | processing_error | none |
| 1 | user_001 | issue_type | unknown | dent |
| 1 | user_001 | object_part | unknown | rear_bumper |
| 1 | user_001 | claim_status | not_enough_information | supported |
| 1 | user_001 | supporting_image_ids |  | img_1 |
| 1 | user_001 | valid_image | False | True |
| 1 | user_001 | severity | unknown | medium |
| 2 | user_002 | evidence_standard_met | False | True |
| 2 | user_002 | risk_flags | processing_error | none |
| 2 | user_002 | issue_type | unknown | scratch |
| 2 | user_002 | object_part | unknown | front_bumper |
| 2 | user_002 | claim_status | not_enough_information | supported |
| 2 | user_002 | supporting_image_ids |  | img_1 |
| 2 | user_002 | valid_image | False | True |
| 2 | user_002 | severity | unknown | low |
| 3 | user_004 | evidence_standard_met | False | True |
| 3 | user_004 | risk_flags | processing_error | none |
| 3 | user_004 | issue_type | unknown | crack |
| 3 | user_004 | object_part | unknown | windshield |
| 3 | user_004 | claim_status | not_enough_information | supported |
| 3 | user_004 | supporting_image_ids |  | img_1 |
| 3 | user_004 | valid_image | False | True |
| 3 | user_004 | severity | unknown | medium |
| 4 | user_007 | evidence_standard_met | False | True |

## Failure Modes

- Missing or unreadable images reduce evidence to `not_enough_information`.
- Wrong-angle or cropped images block part-specific verification.
- Claim/image mismatch routes to `contradicted` while preserving image-grounded reasoning.
- User history adds risk flags only; it does not override visible evidence.

## Misclassification Review

| Row | User ID | Prediction | Label |
|---:|---|---|---|
| 1 | user_001 | not_enough_information | supported |
| 2 | user_002 | not_enough_information | supported |
| 3 | user_004 | not_enough_information | supported |
| 4 | user_007 | not_enough_information | supported |
| 5 | user_005 | not_enough_information | contradicted |
| 7 | user_003 | not_enough_information | supported |
| 8 | user_008 | not_enough_information | contradicted |
| 9 | user_009 | not_enough_information | supported |
| 10 | user_010 | not_enough_information | supported |
| 11 | user_011 | not_enough_information | supported |

## Runtime Analysis

- Runtime seconds: 3.0623
- Records per second: 6.5310

## Cost Estimation

- Estimated external model/API cost: $0.0000
- Current implementation is local CPU-only heuristic processing, so external inference cost is $0.00.

## Model Usage Estimation

- records_processed: 20
- images_referenced: 29
- images_processed: 29
- external_model_calls: 0
- vision_backend: OpenCV/Pillow heuristic feature extraction
- retry_attempts: 40
- failed_records: 20
- caching_strategy: per-run in-memory image feature extraction
- retry_strategy: per-claim bounded retries with recovery output
- rate_limit_strategy: not required for local CPU pipeline
- token_estimate: 0
- throughput_records_per_second: 6.531

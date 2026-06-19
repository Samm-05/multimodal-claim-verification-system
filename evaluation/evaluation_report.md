# Evaluation Report

## Summary

- Total records: 20
- Correct predictions: 4
- Exact match accuracy: 0.2000
- Schema valid: True

## Classification Metrics

| Target | Accuracy | Precision | Recall | F1 Score |
|---|---:|---:|---:|---:|
| claim_status | 0.5500 | 0.4074 | 0.4462 | 0.4026 |
| evidence_standard_met | 0.7500 | 0.4412 | 0.4167 | 0.4286 |
| valid_image | 0.9500 | 0.9737 | 0.7500 | 0.8198 |
| severity | 0.9000 | 0.7000 | 0.8000 | 0.7333 |

## Column Accuracy

| Column | Accuracy |
|---|---:|
| evidence_standard_met | 0.7500 |
| risk_flags | 0.3000 |
| issue_type | 0.7500 |
| object_part | 0.9500 |
| claim_status | 0.5500 |
| supporting_image_ids | 0.8000 |
| valid_image | 0.9500 |
| severity | 0.9000 |

## Error Analysis

| Row | User ID | Column | Prediction | Label |
|---:|---|---|---|---|
| 2 | user_002 | risk_flags | blurry_image;damage_not_visible | none |
| 3 | user_004 | risk_flags | blurry_image;damage_not_visible | none |
| 5 | user_005 | risk_flags | blurry_image;damage_not_visible;claim_mismatch;user_history_risk;manual_review_required | claim_mismatch;user_history_risk;manual_review_required |
| 6 | user_006 | evidence_standard_met | True | False |
| 6 | user_006 | risk_flags | blurry_image;damage_not_visible;claim_mismatch;manual_review_required | wrong_angle;damage_not_visible |
| 6 | user_006 | issue_type | crack | unknown |
| 6 | user_006 | claim_status | supported | not_enough_information |
| 6 | user_006 | severity | none | unknown |
| 7 | user_003 | supporting_image_ids | img_1;img_2 | img_2 |
| 8 | user_008 | risk_flags | non_original_image;claim_mismatch;user_history_risk;manual_review_required | claim_mismatch;non_original_image;user_history_risk;manual_review_required |
| 8 | user_008 | supporting_image_ids | none | img_1 |
| 10 | user_010 | evidence_standard_met | False | True |
| 10 | user_010 | risk_flags | wrong_angle;blurry_image;damage_not_visible;claim_mismatch;manual_review_required | none |
| 10 | user_010 | claim_status | not_enough_information | supported |
| 12 | user_012 | risk_flags | blurry_image;damage_not_visible;claim_mismatch;manual_review_required | none |
| 12 | user_012 | claim_status | contradicted | supported |
| 13 | user_018 | risk_flags | claim_mismatch;manual_review_required | none |
| 13 | user_018 | claim_status | contradicted | supported |
| 14 | user_020 | risk_flags | blurry_image;damage_not_visible;claim_mismatch;user_history_risk;manual_review_required | damage_not_visible;user_history_risk;manual_review_required |
| 14 | user_020 | issue_type | dent | none |
| 14 | user_020 | claim_status | supported | contradicted |
| 14 | user_020 | supporting_image_ids | none | img_1 |
| 15 | user_015 | evidence_standard_met | False | True |
| 15 | user_015 | risk_flags | wrong_angle | none |
| 15 | user_015 | claim_status | not_enough_information | supported |

## Failure Modes

- Missing or unreadable images reduce evidence to `not_enough_information`.
- Wrong-angle or cropped images block part-specific verification.
- Claim/image mismatch routes to `contradicted` while preserving image-grounded reasoning.
- User history adds risk flags only; it does not override visible evidence.

## Misclassification Review

| Row | User ID | Prediction | Label |
|---:|---|---|---|
| 6 | user_006 | supported | not_enough_information |
| 10 | user_010 | not_enough_information | supported |
| 12 | user_012 | contradicted | supported |
| 13 | user_018 | contradicted | supported |
| 14 | user_020 | supported | contradicted |
| 15 | user_015 | not_enough_information | supported |
| 16 | user_030 | contradicted | supported |
| 17 | user_031 | contradicted | supported |
| 18 | user_032 | contradicted | not_enough_information |

## Runtime Analysis

- Runtime seconds: 1.4388
- Records per second: 13.9005

## Cost Estimation

- Estimated external model/API cost: $0.0000
- Current implementation is local CPU-only heuristic processing, so external inference cost is $0.00.

## Model Usage Estimation

- records_processed: 20
- images_referenced: 29
- images_processed: 29
- external_model_calls: 0
- vision_backend: OpenCV/Pillow heuristic feature extraction
- retry_attempts: 0
- failed_records: 0
- caching_strategy: per-run in-memory image feature extraction
- retry_strategy: per-claim bounded retries with recovery output
- rate_limit_strategy: not required for local CPU pipeline
- token_estimate: 0
- throughput_records_per_second: 13.9005

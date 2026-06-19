# Evaluation Report

## Summary

- Total records: 20
- Correct predictions: 1
- Exact match accuracy: 0.0500
- Schema valid: True

## Classification Metrics

| Target | Accuracy | Precision | Recall | F1 Score |
|---|---:|---:|---:|---:|
| claim_status | 0.4000 | 0.4359 | 0.3692 | 0.3050 |
| evidence_standard_met | 0.6500 | 0.5330 | 0.5833 | 0.4982 |
| valid_image | 0.9500 | 0.9737 | 0.7500 | 0.8198 |
| severity | 0.9000 | 0.7167 | 0.8000 | 0.7513 |

## Column Accuracy

| Column | Accuracy |
|---|---:|
| evidence_standard_met | 0.6500 |
| risk_flags | 0.0500 |
| issue_type | 0.7500 |
| object_part | 0.8500 |
| claim_status | 0.4000 |
| supporting_image_ids | 0.8000 |
| valid_image | 0.9500 |
| severity | 0.9000 |

## Error Analysis

| Row | User ID | Column | Prediction | Label |
|---:|---|---|---|---|
| 2 | user_002 | risk_flags | blurry_image;damage_not_visible | none |
| 3 | user_004 | risk_flags | blurry_image;damage_not_visible | none |
| 4 | user_007 | risk_flags | claim_mismatch;manual_review_required | none |
| 4 | user_007 | claim_status | contradicted | supported |
| 5 | user_005 | risk_flags | blurry_image;damage_not_visible;claim_mismatch;user_history_risk;manual_review_required | claim_mismatch;user_history_risk;manual_review_required |
| 6 | user_006 | risk_flags | blurry_image;damage_not_visible;claim_mismatch;manual_review_required | wrong_angle;damage_not_visible |
| 6 | user_006 | issue_type | crack | unknown |
| 6 | user_006 | claim_status | contradicted | not_enough_information |
| 6 | user_006 | severity | none | unknown |
| 7 | user_003 | evidence_standard_met | False | True |
| 7 | user_003 | risk_flags | blurry_image;wrong_angle;claim_mismatch;manual_review_required | blurry_image |
| 7 | user_003 | object_part | right_headlight | door |
| 7 | user_003 | claim_status | not_enough_information | supported |
| 8 | user_008 | evidence_standard_met | False | True |
| 8 | user_008 | risk_flags | non_original_image;claim_mismatch;user_history_risk;manual_review_required | claim_mismatch;non_original_image;user_history_risk;manual_review_required |
| 8 | user_008 | claim_status | not_enough_information | contradicted |
| 8 | user_008 | supporting_image_ids | none | img_1 |
| 9 | user_009 | risk_flags | wrong_object | none |
| 9 | user_009 | claim_status | contradicted | supported |
| 10 | user_010 | evidence_standard_met | False | True |
| 10 | user_010 | risk_flags | wrong_angle;wrong_object;blurry_image;damage_not_visible;claim_mismatch;manual_review_required | none |
| 10 | user_010 | claim_status | contradicted | supported |
| 11 | user_011 | risk_flags | wrong_object | none |
| 11 | user_011 | claim_status | contradicted | supported |
| 12 | user_012 | risk_flags | blurry_image;damage_not_visible;wrong_object | none |

## Failure Modes

- Missing or unreadable images reduce evidence to `not_enough_information`.
- Wrong-angle or cropped images block part-specific verification.
- Claim/image mismatch routes to `contradicted` while preserving image-grounded reasoning.
- User history adds risk flags only; it does not override visible evidence.

## Misclassification Review

| Row | User ID | Prediction | Label |
|---:|---|---|---|
| 4 | user_007 | contradicted | supported |
| 6 | user_006 | contradicted | not_enough_information |
| 7 | user_003 | not_enough_information | supported |
| 8 | user_008 | not_enough_information | contradicted |
| 9 | user_009 | contradicted | supported |
| 10 | user_010 | contradicted | supported |
| 11 | user_011 | contradicted | supported |
| 12 | user_012 | contradicted | supported |
| 13 | user_018 | contradicted | supported |
| 15 | user_015 | not_enough_information | supported |

## Runtime Analysis

- Runtime seconds: 1.8242
- Records per second: 10.9637

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
- throughput_records_per_second: 10.9637

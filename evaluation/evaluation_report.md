# Evaluation Report

## Summary

- Total records: 20
- Correct predictions: 0
- Exact match accuracy: 0.0000
- Schema valid: True

## Classification Metrics

| Target | Accuracy | Precision | Recall | F1 Score |
|---|---:|---:|---:|---:|
| claim_status | 0.2000 | 0.4905 | 0.3256 | 0.2226 |
| evidence_standard_met | 0.2500 | 0.4333 | 0.3611 | 0.2327 |
| valid_image | 0.4000 | 0.4792 | 0.4444 | 0.3407 |
| severity | 0.9000 | 0.7167 | 0.8000 | 0.7513 |

## Column Accuracy

| Column | Accuracy |
|---|---:|
| evidence_standard_met | 0.2500 |
| risk_flags | 0.0000 |
| issue_type | 0.7000 |
| object_part | 0.8500 |
| claim_status | 0.2000 |
| supporting_image_ids | 0.5000 |
| valid_image | 0.4000 |
| severity | 0.9000 |

## Error Analysis

| Row | User ID | Column | Prediction | Label |
|---:|---|---|---|---|
| 1 | user_001 | risk_flags | claim_mismatch;manual_review_required | none |
| 1 | user_001 | claim_status | contradicted | supported |
| 2 | user_002 | evidence_standard_met | False | True |
| 2 | user_002 | risk_flags | blurry_image;damage_not_visible;non_original_image;insufficient_evidence | none |
| 2 | user_002 | claim_status | not_enough_information | supported |
| 2 | user_002 | valid_image | False | True |
| 3 | user_004 | evidence_standard_met | False | True |
| 3 | user_004 | risk_flags | blurry_image;damage_not_visible;non_original_image;insufficient_evidence | none |
| 3 | user_004 | claim_status | not_enough_information | supported |
| 3 | user_004 | valid_image | False | True |
| 4 | user_007 | evidence_standard_met | False | True |
| 4 | user_007 | risk_flags | wrong_angle;non_original_image;claim_mismatch;insufficient_evidence;manual_review_required | none |
| 4 | user_007 | claim_status | not_enough_information | supported |
| 4 | user_007 | supporting_image_ids | none | img_1 |
| 4 | user_007 | valid_image | False | True |
| 5 | user_005 | evidence_standard_met | False | True |
| 5 | user_005 | risk_flags | blurry_image;damage_not_visible;non_original_image;claim_mismatch;user_history_risk;high_recent_claim_frequency;prior_rejections;insufficient_evidence;manual_review_required | claim_mismatch;user_history_risk;manual_review_required |
| 5 | user_005 | claim_status | not_enough_information | contradicted |
| 5 | user_005 | valid_image | False | True |
| 6 | user_006 | risk_flags | blurry_image;damage_not_visible;non_original_image;claim_mismatch;insufficient_evidence;manual_review_required | wrong_angle;damage_not_visible |
| 6 | user_006 | issue_type | crack | unknown |
| 6 | user_006 | valid_image | False | True |
| 6 | user_006 | severity | none | unknown |
| 7 | user_003 | evidence_standard_met | False | True |
| 7 | user_003 | risk_flags | blurry_image;wrong_angle;claim_mismatch;insufficient_evidence;manual_review_required | blurry_image |

## Failure Modes

- Missing or unreadable images reduce evidence to `not_enough_information`.
- Wrong-angle or cropped images block part-specific verification.
- Claim/image mismatch routes to `contradicted` while preserving image-grounded reasoning.
- User history adds risk flags only; it does not override visible evidence.

## Misclassification Review

| Row | User ID | Prediction | Label |
|---:|---|---|---|
| 1 | user_001 | contradicted | supported |
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

- Runtime seconds: 1.6794
- Records per second: 11.9090

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
- throughput_records_per_second: 11.909

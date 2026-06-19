# Multi-Modal Claim Verification System

> AI-Powered Damage Claim Verification using Multi-Agent Architecture, Computer Vision, Evidence Validation, and Risk Assessment.

---

## 📌 Project Overview

The **Multi-Modal Claim Verification System** is an AI-driven solution designed to automatically review and verify insurance-style damage claims using:

* 📷 Images (Primary Source of Truth)
* 💬 Customer Claim Conversations
* 👤 User Claim History
* 📋 Evidence Requirements

The system analyzes submitted evidence and determines whether a claim is:

* **Supported**
* **Contradicted**
* **Not Enough Information**

The solution follows a **multi-agent architecture** that separates vision analysis, evidence validation, risk assessment, and final decision-making to ensure explainable and scalable claim processing.

---

## 🎯 Problem Statement

Manual claim verification is time-consuming, inconsistent, and expensive.

Organizations receive thousands of claims involving:

* 🚗 Vehicle Damage
* 💻 Laptop Damage
* 📦 Package Damage

Each claim may contain:

* Multiple images
* Customer conversations
* Historical user data
* Different evidence requirements

The challenge is to build an automated system that verifies whether the submitted image evidence supports the customer's damage claim while maintaining transparency and consistency.

---

## 🚀 Key Features

### Claim Understanding

* Extracts damage claims from customer conversations
* Identifies claimed issue type
* Identifies claimed object part

### Image Analysis

* Processes one or multiple images
* Detects visible damage
* Detects image quality issues
* Identifies relevant object parts

### Evidence Validation

* Verifies evidence against predefined requirements
* Ensures sufficient visual evidence exists

### Risk Assessment

* Uses historical user claim patterns
* Adds risk context
* Does not override visual evidence

### Decision Engine

Determines:

* Supported
* Contradicted
* Not Enough Information

### Explainable Outputs

Provides:

* Supporting image IDs
* Damage type
* Severity level
* Risk flags
* Justifications

### Evaluation Framework

* Automated evaluation workflow
* Performance reporting
* Error analysis
* Runtime analysis

---

# 🏗️ System Architecture

```text
Customer Claim
      │
      ▼
┌─────────────────────┐
│ Claim Extraction    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Vision Analysis     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Image Quality Check │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Evidence Validation │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Risk Assessment     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Decision Agent      │
└─────────┬───────────┘
          │
          ▼
       output.csv
```

---

# 🤖 Multi-Agent Pipeline

## 1. Claim Extraction Agent

Responsible for:

* Understanding customer conversations
* Extracting issue type
* Extracting object part
* Structuring claim information

### Example

Input:

```text
My car door was scratched while parked.
```

Output:

```json
{
  "issue_type": "scratch",
  "object_part": "door"
}
```

---

## 2. Vision Analysis Agent

Responsible for:

* Image inspection
* Damage detection
* Object identification
* Severity estimation

Outputs:

* Issue Type
* Object Part
* Severity
* Supporting Images

---

## 3. Image Quality Agent

Detects:

* Blurry Images
* Wrong Angle
* Cropped Images
* Low Light
* Obstructed Views

Outputs:

```text
valid_image
risk_flags
```

---

## 4. Evidence Validation Agent

Checks:

* Evidence sufficiency
* Minimum image requirements
* Object-specific evidence rules

Outputs:

```text
evidence_standard_met
```

---

## 5. Risk Assessment Agent

Analyzes:

* User history
* Previous claims
* Rejection patterns
* Review patterns

Outputs:

```text
user_history_risk
manual_review_required
```

---

## 6. Decision Agent

Combines:

* Vision Results
* Evidence Validation
* Risk Assessment

Produces final decision:

```text
supported
contradicted
not_enough_information
```

---

📂 Project Structure
multimodal-claim-verification-system/

├── .agents/                     # AI agent configurations and prompts
│
├── .venv/                       # Python virtual environment (excluded from Git)
│
├── data/                        # Dataset files and metadata
│   ├── claims.csv
│   ├── sample_claims.csv
│   ├── user_history.csv
│   └── evidence_requirements.csv
│
├── evaluation/                  # Evaluation reports and analysis
│   ├── evaluation_report.md
│   └── evaluation_report.json
│
├── images/                      # Sample and test claim images
│   ├── sample/
│   └── test/
│
├── logs/                        # Application logs and execution tracking
│
├── outputs/                     # Generated outputs and reports
│
├── scripts/                     # Utility and image generation scripts
│   └── generate_images.py
│
├── src/                         # Main application source code
│   └── claim_verification/
│       ├── agents/              # Multi-agent system
│       │   ├── claim_extraction_agent.py
│       │   ├── vision_analysis_agent.py
│       │   ├── image_quality_agent.py
│       │   ├── evidence_validation_agent.py
│       │   ├── risk_assessment_agent.py
│       │   └── decision_agent.py
│       │
│       ├── application/         # Pipeline orchestration
│       ├── domain/              # Models, schemas, enums
│       ├── infrastructure/      # Data access and repositories
│       ├── evaluation/          # Evaluation engine
│       └── vision/              # Computer vision utilities
│
├── tests/                       # Unit and integration tests
│   ├── test_claim_extraction_agent.py
│   ├── test_evidence_validation_agent.py
│   └── test_output_schema.py
│
├── .gitignore                   # Git ignore rules
│
├── architecture.md              # Detailed system architecture
│
├── output.csv                   # Final prediction output
│
├── pytest.ini                   # Pytest configuration
│
├── README.md                    # Project documentation
│
├── requirements.txt             # Python dependencies
│
└── run.py                       # Main application entry point
```

---

# 🛠️ Tech Stack

### Programming Language

* Python 3.12

### Computer Vision

* OpenCV
* Pillow

### Data Processing

* Pandas
* NumPy

### Validation & Models

* Pydantic

### Testing

* Pytest

### Logging

* Python Logging

---

# 📊 Evaluation Results

## Sample Dataset Performance

| Metric                        | Score |
| ----------------------------- | ----- |
| Claim Status Accuracy         | 65%   |
| Evidence Standard Accuracy    | 75%   |
| Issue Type Accuracy           | 75%   |
| Object Part Accuracy          | 95%   |
| Valid Image Accuracy          | 95%   |
| Severity Accuracy             | 90%   |
| Supporting Image IDs Accuracy | 80%   |

---

## Runtime Performance

| Metric            | Value        |
| ----------------- | ------------ |
| Records Processed | 20           |
| Images Processed  | 29           |
| Runtime           | 1.64 Seconds |
| Records / Second  | 12.23        |
| Failed Records    | 0            |
| Retry Attempts    | 0            |

---

## Cost Analysis

Current implementation uses:

```text
OpenCV + Pillow
```

No external AI APIs are used.

Estimated Processing Cost:

```text
$0.00
```

---

# 📄 Output Schema

The system generates:

```text
output.csv
```

with the following fields:

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

---

# 🧪 Running the Project

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Generate Images

```bash
$env:PYTHONPATH="src"
python scripts/generate_images.py --dataset all
```

---

## Run Predictions

```bash
$env:PYTHONPATH="src"
python -m claim_verification.main --input claims
```

---

## Run Evaluation

```bash
$env:PYTHONPATH="src"
python -m claim_verification.main --input sample --evaluate
```

---

## Run Tests

```bash
$env:PYTHONPATH="src"
pytest
```

---

# 🔮 Future Improvements

* Multimodal Vision Language Models (VLMs)
* GPT-4o Vision Integration
* Gemini Vision Integration
* Fraud Detection Engine
* Confidence Scoring Framework
* Human Review Dashboard
* Cloud Deployment
* Real-Time Claim Processing API

---

# 🎯 Submission Deliverables

Included:

* ✅ Full Source Code
* ✅ Multi-Agent Architecture
* ✅ Evaluation Workflow
* ✅ Evaluation Report
* ✅ Output CSV Generation
* ✅ Automated Testing
* ✅ Documentation

---

# 👨‍💻 Author

**Samyak Mahatme**

---

## ⭐ Project Highlights

* Multi-Agent AI Architecture
* Explainable Decision Making
* Evidence-Based Verification
* Image-Centric Reasoning
* Risk-Aware Claim Assessment
* Scalable Production-Oriented Design
* End-to-End Automated Evaluation Pipeline

**Built for the Multi-Modal Evidence Review Challenge.** 🚀

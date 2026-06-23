# 🚀 Multi-Modal Claim Verification System

> AI-Powered Damage Claim Verification using Multi-Agent Architecture, Computer Vision, Evidence Validation, and Risk Assessment.

---

## 📌 Overview

The **Multi-Modal Claim Verification System** is an end-to-end AI solution designed to automatically verify damage claims using:

* 📷 Images (Primary Source of Truth)
* 💬 Customer Claim Conversations
* 👤 User Claim History
* 📋 Evidence Requirements

The system evaluates whether submitted image evidence supports, contradicts, or lacks sufficient information to verify a customer's claim.

The solution follows a **Multi-Agent Architecture** where each agent is responsible for a specific task, enabling modularity, explainability, scalability, and production readiness.

---

## 🎯 Problem Statement

Organizations process thousands of damage claims every day involving:

* 🚗 Cars
* 💻 Laptops
* 📦 Packages

Manual review is expensive, slow, and inconsistent.

This project automates claim verification by:

1. Understanding customer conversations.
2. Analyzing submitted images.
3. Validating evidence sufficiency.
4. Assessing historical claim risk.
5. Producing an explainable final decision.

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

## 1️⃣ Claim Extraction Agent

Responsible for:

* Parsing customer conversations
* Identifying issue type
* Identifying object part
* Structuring claim information

### Example

Input:

```text
"My laptop screen cracked after it fell from the table."
```

Output:

```json
{
  "issue_type": "crack",
  "object_part": "screen"
}
```

---

## 2️⃣ Vision Analysis Agent

Responsible for:

* Multimodal image analysis using **Google Gemini 2.5 Flash** (via the `VisionProvider` port)
* Grounded visual damage inspection (dents, scratches, cracks, packaging damage)
* Robust quality assessment (blur, lighting, obstruction, original image detection)
* Resilient fallback to local OpenCV/Pillow computer vision heuristics if Gemini API keys are absent or calls fail

Outputs:

* Issue Type (dent, scratch, crack, torn_packaging, etc.)
* Object Part (windshield, front_bumper, screen, contents, etc.)
* Severity (none, low, medium, high)
* Supporting Images (valid images with visible damage)

---

## 3️⃣ Image Quality Agent

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

## 4️⃣ Evidence Validation Agent

Checks:

* Evidence sufficiency
* Required visual coverage
* Object-specific evidence requirements

Outputs:

```text
evidence_standard_met
```

---

## 5️⃣ Risk Assessment Agent

Analyzes:

* User claim history
* Previous approvals
* Previous rejections
* Manual review patterns

Outputs:

```text
user_history_risk
manual_review_required
```

---

## 6️⃣ Decision Agent

Combines:

* Vision Analysis
* Evidence Validation
* Risk Assessment

Produces final decisions:

```text
supported
contradicted
not_enough_information
```

---

# ✨ Key Features

### Claim Understanding

* Customer conversation parsing
* Issue extraction
* Object part extraction

### Computer Vision

* Multi-image analysis
* Damage identification
* Severity estimation

### Image Quality Assessment

* Blur detection
* Visibility validation
* Angle verification

### Evidence Validation

* Rule-based evidence verification
* Minimum evidence requirements

### Risk Assessment

* Historical claim analysis
* User risk scoring

### Explainable AI

* Justification generation
* Supporting image selection
* Transparent decision logic

### Evaluation Framework

* Automated evaluation
* Error analysis
* Runtime analysis
* Cost estimation

---

# 📂 Project Structure

```text
multimodal-claim-verification-system/

├── .agents/
│
├── .venv/
│
├── data/
│   ├── claims.csv
│   ├── sample_claims.csv
│   ├── user_history.csv
│   └── evidence_requirements.csv
│
├── evaluation/
│   ├── evaluation_report.md
│   └── evaluation_report.json
│
├── images/
│   ├── sample/
│   └── test/
│
├── logs/
│
├── outputs/
│
├── scripts/
│   └── generate_images.py
│
├── src/
│   └── claim_verification/
│       ├── agents/
│       ├── application/
│       ├── domain/
│       ├── infrastructure/
│       ├── evaluation/
│       └── vision/
│
├── tests/
│   ├── test_claim_extraction_agent.py
│   ├── test_evidence_validation_agent.py
│   └── test_output_schema.py
│
├── .gitignore
├── architecture.md
├── output.csv
├── pytest.ini
├── README.md
├── requirements.txt
└── run.py
```

---

# 🏛️ Architecture Principles

The project follows a layered architecture:

```text
User Input
     │
     ▼
Application Layer
     │
     ▼
Agent Layer
     │
     ├── Claim Extraction
     ├── Vision Analysis
     ├── Image Quality
     ├── Evidence Validation
     ├── Risk Assessment
     └── Decision Agent
     │
     ▼
Domain Layer
     │
     ▼
Infrastructure Layer
     │
     ▼
Output Generation
```

Benefits:

* Separation of Concerns
* Scalability
* Maintainability
* Explainability
* Testability
* Production Readiness

---

# 🛠️ Tech Stack

## Programming Language

* Python 3.12

## Computer Vision

* OpenCV
* Pillow

## Data Processing

* Pandas
* NumPy

## Data Validation

* Pydantic

## Testing

* Pytest

## Logging

* Python Logging

---

# 📊 Evaluation Results

## Sample Dataset Metrics

| Metric                     | Score |
| -------------------------- | ----- |
| Claim Status Accuracy      | 65%   |
| Evidence Standard Accuracy | 75%   |
| Issue Type Accuracy        | 75%   |
| Object Part Accuracy       | 95%   |
| Valid Image Accuracy       | 95%   |
| Severity Accuracy          | 90%   |
| Supporting Image Accuracy  | 80%   |

---

## Runtime Statistics

| Metric            | Value                |
| ----------------- | -------------------- |
| Records Processed | 20                   |
| Images Processed  | 29                   |
| Runtime           | 1.64 Seconds         |
| Throughput        | 12.23 Records/Second |
| Failed Records    | 0                    |
| Retry Attempts    | 0                    |

---

## Cost Analysis & Rate Limiting

The system runs in one of two modes depending on settings:

1. **AI-Powered (Gemini 2.5 Flash)**:
   * Uses Google GenAI API to perform real-world multimodal understanding.
   * **API Costs**: Free tier is available (10 RPM, 1500 RPD). Paid tier is extremely cost-effective (~$0.000075 per image).
   * **Rate Limit Guard**: Integrates an automatic request delay (default 6.5s) to guarantee stay-under limits on the free tier.
2. **Local Heuristics (Fallback)**:
   * Activates automatically if `GEMINI_API_KEY` is not set or the API is unreachable.
   * Runs offline with OpenCV/Pillow.
   * **Estimated Cost**: $0.00

---

# 📄 Output Schema

The system generates:

```text
output.csv
```

Fields:

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

# 🧪 Installation

## Clone Repository

```bash
git clone https://github.com/Samm-05/multimodal-claim-verification-system.git
cd multimodal-claim-verification-system
```

## Create Virtual Environment

```bash
python -m venv .venv
```

## Activate Environment

### Windows

```bash
.venv\Scripts\activate
```

### Linux / Mac

```bash
source .venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Configure Environment

Copy the environment example file and set your Gemini API key:

```bash
copy .env.example .env   # On Windows
cp .env.example .env     # On Linux/macOS
```

Open `.env` and add your key:
```env
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

---

# ▶️ Usage

## Generate Images

```bash
$env:PYTHONPATH="src"
python scripts/generate_images.py --dataset all
```

## Run Predictions

```bash
$env:PYTHONPATH="src"
python -m claim_verification.main --input claims
```

## Run Evaluation

```bash
$env:PYTHONPATH="src"
python -m claim_verification.main --input sample --evaluate
```

## Run Tests

```bash
$env:PYTHONPATH="src"
pytest
```

---

# 📈 Future Improvements

* GPT-4o Vision Integration
* Confidence Scoring Framework
* Fraud Detection Engine
* Human Review Dashboard
* Cloud Deployment
* REST API Service
* Real-Time Claim Verification

---

# 📦 Deliverables

Included:

* ✅ Source Code
* ✅ Multi-Agent Architecture
* ✅ Evaluation Workflow
* ✅ Evaluation Report
* ✅ Output Generation
* ✅ Automated Testing
* ✅ Documentation

---

# 👨‍💻 Author

**Samyak Mahatme**

---

# ⭐ Highlights

* Multi-Agent AI Architecture
* Explainable Decision Making
* Evidence-Based Verification
* Computer Vision Pipeline
* Risk-Aware Assessment
* Automated Evaluation Framework
* Production-Oriented Design

**Built for the Multi-Modal Evidence Review Challenge 🚀**

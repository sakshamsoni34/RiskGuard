# RiskGuard Investigator
### AI-Assisted Cybercrime Investigation Support Platform for Authorized Cyber Cells

[![Python 3.13](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![Next.js 16.4](https://img.shields.io/badge/Next.js-16.4%20(Turbopack)-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/ML-XGBoost%20%2B%20TreeSHAP-orange.svg)](https://xgboost.readthedocs.io/)
[![Compliance](https://img.shields.io/badge/Compliance-IT%20Act%20Sec%2065B-red.svg)](#statutory-compliance)

> **IMPORTANT STATUTORY NOTICE:**
> RiskGuard Investigator is an AI-assisted decision-support aid designed strictly for authorized law enforcement officers and financial intelligence units.
> All machine-generated risk evaluations, TreeSHAP feature attributions, and anomaly scores constitute investigative triage telemetry only and **do not constitute conclusive legal proof of guilt** under the Indian Evidence Act, 1872 / Information Technology Act, 2000.
> All data ingested and displayed is **100% synthetic mock data** adhering to the Digital Personal Data Protection (DPDP) Act 2023.

---

## 🏛️ System Architecture

```
                                  OFFICER ACCESS
                           (Badge Number + Bcrypt 2FA)
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 16.4 INVESTIGATOR WORKSTATION                    │
│                          http://localhost:3000                              │
│                                                                             │
│  • Command Center Dashboard (`/dashboard`)  • Live Stream Filter (`/transactions`)│
│  • Transaction Dossier (`/transactions/[id]`) • Case Pipeline Kanban (`/cases`) │
│  • Case Evidence Graph (`/cases/[id]`)      • Tamper-Proof Audit (`/audit`)  │
│  • Sec 65B Dossier PDF Preview (`/reports`)  • Active Attack Simulator (`/simulator`)│
│  • Model Drift Analytics (`/models`)         • Audio Telemetry System (Muted)│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Same-Origin Proxy (`/api/v1/*`)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CORE BACKEND SERVICE (FASTAPI)                          │
│                          http://localhost:9000                              │
│                                                                             │
│  • RBAC Auth & Lockout Engine              • Keyset Query & Multi-Filters    │
│  • Finite State Machine (`case_state_machine.py`) • Case Transactions Linking│
│  • SHA-256 Merkle Hash Chain Engine        • ReportLab PDF Generator         │
│  • Circuit Breaker & Fallback Scoring      • SQLite WAL Storage (`PRAGMA`)   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Sub-40ms HTTP Proxy
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                  REAL-TIME ML ENGINE (FASTAPI MICROSERVICE)                 │
│                          http://localhost:8000                              │
│                                                                             │
│  • Calibrated XGBoost Classifier (v2.0.0)  • TreeSHAP Explainer Matrix       │
│  • Unsupervised Isolation Forest (Anomaly) • Single & Batch `/evaluate/batch`│
│  • P50 Latency: 2.87 ms • P95: 14.2 ms     • Synthetic Fraud Typology Weights│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart

### Method 1: Docker Compose (Recommended for Deployment)

```bash
# Clone the repository
git clone https://github.com/sakshamsoni34/RiskGuard.git
cd RiskGuard

# Build and start all 3 services
docker compose up --build
```

### Method 2: Local Bare-Metal (Development)

```bash
# Run automated startup script (boots ML Microservice, Core Backend, and Next.js)
./scripts/run_all.sh
```

Or run each service individually in separate terminals:

```bash
# Terminal 1: ML Microservice
cd ml-service
./venv/bin/python -m uvicorn src.main:app --host 0.0.0.0 --port 8000

# Terminal 2: Core Backend
cd ..
./backend/venv/bin/python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 9000

# Terminal 3: Next.js Frontend
cd frontend
npm run dev
```

---

## 👮 Officer Credentials Quick Reference

Navigate to **`http://localhost:3000/login`** to authenticate:

| Officer Name | Badge ID | Role | Responsibilities | Demo Password |
| :--- | :--- | :--- | :--- | :--- |
| **Insp. Vikram Sharma** | `CC-8421` | Lead Investigator | FIR registration, manual overrides, note appending | `CyberPass#2026!` |
| **Sub-Insp. Ananya Patel** | `CC-9104` | Field Investigator | Telemetry analysis, evidence linking | `CyberPass#2026!` |
| **ACP Rajesh Nair** | `SUP-010` | Cell Supervisor | Case escalation, final report dispatch approval | `CyberPass#2026!` |
| **Admin Devraj Desai** | `ADM-001` | Systems Administrator | Audit ledger verification, model calibration | `CyberPass#2026!` |

---

## 🧪 Testing & Verification

Run the comprehensive preservation and integration check:

```bash
# Executes all Category A, B, C, D, and E tests in sequence
./scripts/verify_preserve.sh
```

Individual test suites:

```bash
# 1. Core Backend Tests (23 tests: auth, RBAC, state machine, audit, PDF, security)
./backend/venv/bin/pytest backend/tests/ -v

# 2. ML Engine Quality Tests (11 tests: no-leakage, latency, batch determinism)
./ml-service/venv/bin/pytest ml-service/tests/ -v

# 3. Frontend Unit Tests (Vitest)
cd frontend && npm run test

# 4. Zero-PII Audit Check
./scripts/audit_pii.sh
```

---

## 📜 Statutory Compliance & Audit Trail

RiskGuard Investigator complies with:
- **IT Act, 2000 & Indian Evidence Act, 1872 Section 65B:** Append-only cryptographic SHA-256 Merkle chain guarantees electronic record integrity from extraction to judicial filing.
- **Digital Personal Data Protection (DPDP) Act, 2023:** 100% synthetic mock data policy enforced by continuous CI/CD audit scanning (`scripts/audit_pii.sh`).
- **OWASP ASVS Level 1:** Robust CSP, HSTS, secure cookies, brute-force lockout, and absence of public registration surfaces.

For full walkthrough scenarios and storyline scripts, see **[`docs/DEMO.md`](docs/DEMO.md)**.
For security threat modeling and ASVS compliance, see **[`docs/SECURITY.md`](docs/SECURITY.md)**.
For model architecture and training provenance, see **[`ml-service/MODEL_CARD.md`](ml-service/MODEL_CARD.md)**.

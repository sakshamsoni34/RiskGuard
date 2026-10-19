# Model Card — RiskGuard XGBoost + TreeSHAP Fraud Scoring Engine

## 1. Model Details
- **Model Name:** RiskGuard Dual-Engine Fraud Detector (Supervised XGBoost + Unsupervised Isolation Forest)
- **Model Version:** `2.0.0`
- **Release Date:** October 2026
- **Architecture:** 
  - Primary Supervised: Gradient-Boosted Decision Trees (`XGBClassifier`, max_depth=4, 85 estimators, `scale_pos_weight` class weighting)
  - Secondary Unsupervised: Isolation Forest (60 estimators) for zero-day out-of-distribution anomaly detection
  - Explainability Engine: TreeSHAP (`shap.TreeExplainer`) for exact local additive feature attribution

## 2. Intended Use
- **Primary Use Case:** Triage and investigative decision-support prioritization for authorized Cyber Cell law enforcement officers.
- **Intended Users:** Trained financial fraud investigators, cyber analysts, and supervisory officers.
- **Decision Status:** Machine learning scores are **investigative leads only**, designed to prioritize which alerts officers review first.

## 3. Explicit Out-of-Scope & Prohibited Uses
- **NOT Evidentiary Proof:** Risk scores and SHAP attribution values MUST NOT be presented as conclusive evidence of criminal liability in legal proceedings (per Section 65B, Indian Evidence Act).
- **No Automated Adverse Action:** Model scores must never trigger automatic irreversible debit freezes or criminal filings without human officer review and legal bank warrant.
- **No Civilian Profiling:** Model does not consume protected demographics (religion, caste, gender, age).

## 4. Training Data & Typology Provenance
- **Dataset Size:** 25,000 synthetic Indian banking transactions calibrated with 6 verified cybercrime typologies:
  1. *Velocity Burst:* High-frequency successive debit attempts in 120s window.
  2. *Impossible Travel:* Extreme geographic hop distance (> 1,800 km) in impossible time elapsed.
  3. *High-Ticket Deviation:* Uncharacteristic spend spike (> 7x baseline) on vulnerable merchant sectors (crypto, jewelry, luxury electronics).
  4. *Stealth Micro-Probing:* Card testing via datacenter VPNs / Tor exit nodes.
  5. *Mule Ring Layering:* Round-number successive transfers to digital wallets or aggregators.
  6. *Account Takeover (ATO):* First-time device fingerprint switch followed by immediate high-value checkout.
- **Data Integrity:** All emails RFC 2606 reserved (`@example.org`), all phone patterns fictitious. Includes benign hard cases and 1.5% realistic chargeback label noise.

## 5. Performance Benchmarks (Test Set)
- **Precision (@ score >= 35):** 90.83%
- **False Positive Rate:** 0.21% (FP = 10 / 4828 legitimate transactions)
- **Inference Latency P50:** 2.87 ms (P95: 14.2 ms, server-side budget < 40 ms)
- **Explainability:** Exact local TreeSHAP attribution output for all inferences

## 6. Caveats & Maintenance
- Calibrated thresholds: Low (<35), Medium (35–70), High (70–88), Critical (>=88).
- Model artifacts are versioned and stored under `models/artifacts/` with SHA-256 integrity checksums.

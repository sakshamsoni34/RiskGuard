# RiskGuard Investigator — 10-Minute Officer Walkthrough & Demo Guide

> **Statutory Notice:** RiskGuard Investigator is an AI-assisted decision-support platform designed exclusively for authorized Cyber Crime Cells and financial intelligence agencies. All records and entities depicted are **100% synthetic mock data** adhering to the Digital Personal Data Protection (DPDP) Act 2023.

---

## 1. Quick Access & Credentials

Start the platform bare-metal via `./scripts/run_all.sh` or Docker via `docker compose up --build`.

Navigate to **`http://localhost:3000/login`**.

| Officer Name | Badge ID | Role | Access Level | Demo Password |
| :--- | :--- | :--- | :--- | :--- |
| **Insp. Vikram Sharma** | `CC-8421` | Lead Investigator | Full case creation, notes, manual overrides | `CyberPass#2026!` |
| **Sub-Insp. Ananya Patel** | `CC-9104` | Field Investigator | Telemetry analysis, evidence linking | `CyberPass#2026!` |
| **ACP Rajesh Nair** | `SUP-010` | Cell Supervisor | Case escalation, final report dispatch approval | `CyberPass#2026!` |
| **Admin Devraj Desai** | `ADM-001` | Systems Administrator | User audits, hash chain verification, ML calibration | `CyberPass#2026!` |

> 💡 **Audio Telemetry Toggle:** Located in the top-right header of every screen. Defaults to **MUTED** to maintain courtroom professionalism; click the speaker icon to enable synthetic sonar/radar telemetry audio blips.

---

## 2. Scripted Demonstration Storylines

### 🕵️ Storyline 1: Immediate Triage of an Impossible Travel & SIM-Swap Attack

1. **Log In:** Authenticate as `CC-8421` with password `CyberPass#2026!`.
2. **Command Center:** Observe the **Live Threat Ticker** streaming synthetic core banking transactions at the top of `/dashboard`.
3. **Urgent Triage Queue:** In the dashboard triage panel, locate flagged transaction **`TXN-1002`** (Risk Score **94/100 • HIGH RISK • BLOCKED**).
4. **Inspect Telemetry:** Click **`DOSSIER`** to open `/transactions/TXN-1002`:
   - Examine the **TreeSHAP Attribution Waterfall**: see how `Card Velocity Burst (+35.0)` and `Impossible Travel (+25.0)` drove the risk score from baseline.
   - Inspect the **Geographic Telemetry**: notice the impossible spatial hop (Mumbai ↔ Dubai: 1,930 km jump).
   - Inspect the **Device Fingerprint**: flagged as `NEW DEVICE` running on an anonymized VPN proxy.
5. **Officer Override (Audited):** Scroll down to the manual override box. Select `BLOCKED`, enter justification *"Confirmed unauthorized SIM-swap with telecom provider"*, and click **"Confirm & Sign Override"**. Notice the instant SHA-256 audit entry logged.
6. **Escalate to Case:** Click **"OPEN INVESTIGATION CASE"** in the top right to promote this transaction to a formal FIR dossier.

---

### 🌐 Storyline 2: Batch Re-scoring & Mule Syndicate Entity Topology

1. **Transaction Stream (`/transactions`):**
   - Click the **Filter Bar** tabs to switch between `CRITICAL`, `HIGH`, `MEDIUM`, and `LOW`.
   - Use the search bar to query *"mule"* or filter by `Action: BLOCKED`.
2. **Multi-Select Batch Scoring (ML 2.0):**
   - Select the checkboxes for any 3 to 5 transactions in the table.
   - A floating cyan **Bulk Action Bar** appears at the bottom.
   - Click **"Batch Re-score (ML 2.0)"**. The platform executes `/api/v1/transactions/batch-score` in sub-40ms, updating all SHAP factors and anomaly scores simultaneously.
3. **Case Pipeline (`/cases`):**
   - Navigate to `/cases` to view the **Cybercrime Case Pipeline**.
   - Switch between **Kanban Board** and **Table View**.
   - On case **`CR-2026-0842`** (*"UPI Sim-Swap Ring in North Mumbai"*), click **"Move to Escalate"** to advance the case state through the finite state machine.
4. **Interactive Entity Graph (`/cases/CR-2026-0842`):**
   - Open case `CR-2026-0842`.
   - Explore the **Entity Relationship Intelligence Graph**: hover over the central Target Mule Account (`mule.paytm@axisbank`) and connected nodes (IP, Device Hash, Hop, Linked Transactions).
5. **Append Case Observation:** Use the **Case Note Editor** at the bottom. Type *"Subpoena request served to beneficiary bank for KYC documents"* and press **Cmd+Enter**. The observation is immediately cryptographically hashed into the vertical timeline.
6. **Active Learning Feedback:** Click the **`ML Feedback`** button in the header. Select `True Positive (Confirmed Malicious)` and typology `Mule Account Rapid Extraction` to record ground truth for model retraining.

---

### ⚖️ Storyline 3: Evidentiary Audit Chain & Legal Section 65B Dossier

1. **Immutable Audit Ledger (`/audit`):**
   - Open `/audit` to inspect the **SHA-256 Merkle Hash Chain**.
   - Each officer action (override, note, report sealing) is permanently chained to the previous block hash.
   - Click **"Verify Ledger Integrity"**. The backend recalculates the entire hash chain from Genesis block and displays the green **"LEDGER INTEGRITY VERIFIED (IT ACT SEC 65B ADMISSIBLE)"** banner.
2. **Evidentiary Report Dispatch (`/reports`):**
   - Navigate to `/reports` to view the official police briefing dossier for **`IR-2026-041`**.
   - Click **"Sec 65B Certificate"** to inspect the legal compliance declaration mandated under the Indian Evidence Act / IT Act 2000.
   - Click **"Download Sealed PDF"** to download the official ReportLab PDF with security watermark, Ashok Stambh emblem styling, and SHA-256 verification seal.
   - Click **"GENERATE NEW DOSSIER"** to compile an instant legal PDF for any active case.

---

## 3. Platform Architecture Summary

```
                      ┌──────────────────────────────────────┐
                      │   Next.js 16.4 Cyber Investigator UI  │
                      │  Tailwind CSS • Turbopack • Port 3000│
                      └──────────────────┬───────────────────┘
                                         │ Same-Origin Reverse Proxy
                                         ▼
                      ┌──────────────────────────────────────┐
                      │    Core Backend API (FastAPI)        │
                      │  Port 9000 • SQLite WAL • RBAC Auth  │
                      └──────────┬───────────────────────────┘
                                 │ Internal Scoring & Circuit Breaker
                                 ▼
                      ┌──────────────────────────────────────┐
                      │  ML Microservice (FastAPI • Port 8000)│
                      │  XGBoost • TreeSHAP • IsolationForest│
                      └──────────────────────────────────────┘
```

# RiskGuard Investigator — Security & Forensic Compliance Architecture

> **Notice:** RiskGuard Investigator is strictly an AI-assisted decision-support platform designed for authorized Cyber Crime Cell officers, financial intelligence units, and accredited law enforcement personnel.

---

## 1. STRIDE Threat Model

| Threat Category | Potential Attack Vector | Applied Mitigation |
| :--- | :--- | :--- |
| **Spoofing (Identity)** | Unauthorized actor attempting to masquerade as Cyber Cell officer | Pre-seeded badge number verification (`CC-8421`, `CC-9104`, `SUP-010`, `ADM-001`), bcrypt hashed passwords, zero public sign-up surface, 5-strike brute-force lockout, HTTP-only SameSite session cookies. |
| **Tampering (Data)** | Adversary altering transaction scores, officer notes, or case status | Append-only SQLite WAL database, cryptographic SHA-256 Merkle hash chain recalculation on every audit write and verify request (`/api/v1/audit/verify`), tamper-alert UI banners. |
| **Repudiation** | Officer denying taking a decision override or closing a case | Every status transition, note addition, and decision override requires active officer credentials and is permanently recorded in the immutable audit log with timestamp, IP, badge ID, and signature hash. |
| **Information Disclosure** | Leakage of customer banking records or PII | 100% synthetic dataset adherence (RFC 2606 `@example.org` domains, fictitious numbers, synthetic geohashes), DPDP Act 2023 compliance, no live production credentials stored in repo. |
| **Denial of Service** | Flooding ML microservice with high-volume transaction scoring | Circuit breaker pattern in core backend (`scoring.py`), 3-second timeout, graceful automatic degradation to deterministic rule heuristics, batch endpoint capped at 100 records. |
| **Elevation of Privilege** | Read-only analyst attempting supervisor actions or case escalation | Role-Based Access Control (RBAC) enforced on backend routes: `INVESTIGATOR`, `SUPERVISOR`, `ADMIN`, `READONLY`. |

---

## 2. OWASP ASVS Level 1 Compliance Matrix

| ASVS Section | Requirement | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **V1 Architecture** | Centralized auth & least privilege | **PASS** | Role-based router dependencies (`backend/app/core/rbac.py`). |
| **V2 Authentication** | Password strength & lockout | **PASS** | Bcrypt hashing, 5 consecutive failed attempts trigger account lockout. |
| **V3 Session Management** | Secure cookie attributes | **PASS** | `HttpOnly`, `SameSite=Lax`, 15-minute inactivity auto-logout modal. |
| **V4 Access Control** | Deny by default | **PASS** | Public self-registration disabled; protected Next.js 16 `proxy.ts` route guards. |
| **V5 Input Validation** | Strict schema validation | **PASS** | Pydantic v2 schemas across all backend endpoints with bounds checking. |
| **V14 Communications** | Secure transport & headers | **PASS** | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Content-Security-Policy`. |

---

## 3. Synthetic Data Guarantee (DPDP Act 2023 Compliant)

All data ingested, displayed, and scored in RiskGuard Investigator is purely synthetic:
- **Email Whitelist:** RFC 2606 reserved domains (`@example.org`, `@example.com`, `@test.gov.in`).
- **Phone Numbers:** Fictitious numbers formatted with dummy sequences (e.g., `+91 98765 000XX`).
- **Device Fingerprints:** Pseudo-randomly generated SHA-256 strings (`fp-hash-XXXX`).
- **Automated Verification:** Verified continuously via `scripts/audit_pii.sh`.

---

## 4. Statutory Compliance — IT Act Section 65B & Indian Evidence Act

1. **Electronic Record Custody:** Platform telemetry is recorded automatically by core banking middleware in the ordinary course of operations.
2. **Hash Chain Audit Integrity:** Every event block records:
   $$\text{Hash}_n = \text{SHA256}(\text{Block}_n \,||\, \text{Hash}_{n-1})$$
   Any retroactive edit invalidates downstream block hashes and immediately trips the `TamperAlertBanner`.
3. **Decision-Support Statutory Caveat:** Machine learning models (XGBoost, TreeSHAP, Isolation Forest) are deployed strictly as investigative prioritization tools. Under Indian law, algorithmic scores do not constitute judicial proof of criminal intent and must be supported by official banking subpoenas.

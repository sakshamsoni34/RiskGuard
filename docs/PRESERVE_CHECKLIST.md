# RiskGuard — Preserve Checklist
**Phase 0 baseline — verified 2026-10-19**

> Every item here must remain working after each phase. Check the "Last Verified" column at each gate.

---

## CATEGORY A — ML Service Endpoints

| # | Feature | How to verify | Status | Last Verified |
|---|---------|--------------|--------|---------------|
| A1 | `GET /health` returns `{"status":"HEALTHY","models_loaded":true}` | `curl localhost:8000/health` | ✅ PASS | Phase 0 |
| A2 | `GET /v1/model/metrics` returns all metric fields | `curl localhost:8000/v1/model/metrics` | ✅ PASS | Phase 0 |
| A3 | `POST /v1/risk/evaluate` low-risk payload → `APPROVED`, score < 35 | pytest `test_legitimate_transaction_approved` | ✅ PASS | Phase 0 |
| A4 | `POST /v1/risk/evaluate` high-risk payload → `BLOCKED`, score ≥ 70 | pytest `test_high_fraud_velocity_burst_blocked` | ✅ PASS | Phase 0 |
| A5 | `POST /v1/risk/evaluate` medium payload → `OTP_REQUIRED`, 35 ≤ score < 70 | pytest `test_moderate_risk_otp_required` | ✅ PASS | Phase 0 |
| A6 | Inference latency P95 < 40 ms (server-side) | pytest `test_sub_40ms_latency_benchmark` | ✅ PASS | Phase 0 |
| A7 | Response schema: `risk_score`, `risk_level`, `decision`, `shap_explanation`, `anomaly_score`, `rule_flags` all present | Schema validation in test | ✅ PASS | Phase 0 |
| A8 | All 6 pytest tests pass | `pytest tests/ -v` | ✅ 6/6 | Phase 0 |

**Automated re-check command:** `cd ml-service && ./venv/bin/pytest tests/ -v`

---

## CATEGORY B — Frontend Build & Pages

| # | Feature | How to verify | Status | Last Verified |
|---|---------|--------------|--------|---------------|
| B1 | `npm run build` in `frontend/` exits 0 | Run build | ✅ PASS | Phase 0 |
| B2 | Dev server starts on :3000 | `npm run dev`, check logs | ✅ PASS | Phase 0 |
| B3 | No TypeScript errors | Build output / `tsc --noEmit` | ✅ PASS | Phase 0 |
| B4 | Frontend root `/` renders without console errors | Visual / curl | ✅ PASS | Phase 0 |

**Automated re-check command:** `cd frontend && npm run build`

---

## CATEGORY C — Existing UI Components (must not regress)

| # | Component | Preserved feature | Verification | Status |
|---|-----------|------------------|-------------|--------|
| C1 | RiskSimulator | All sliders/inputs work; calls scoring logic; shows SHAP waterfall | Manual | ✅ Visual Phase 0 |
| C2 | ShapWaterfallChart | Renders positive/negative bars for a transaction's SHAP values | Manual | ✅ Visual Phase 0 |
| C3 | ModelAnalytics | PR-curve chart, confusion matrix, SHAP global importance, hourly trend render | Manual | ✅ Visual Phase 0 |
| C4 | GeoThreatMap | SVG world map with threat markers renders | Manual | ✅ Visual Phase 0 |
| C5 | ArchitectureDiagram | Architecture SVG/diagram renders | Manual | ✅ Visual Phase 0 |
| C6 | TransactionTable | Renders rows, filter buttons (ALL/HIGH/MEDIUM/LOW) work | Manual | ✅ Visual Phase 0 |
| C7 | InlineInspector | Shows SHAP explanation, rule flags, override buttons | Manual | ✅ Visual Phase 0 |
| C8 | TransactionModal | Full expanded modal with all transaction fields renders | Manual | ✅ Visual Phase 0 |
| C9 | StatsCards | KPI cards render with numeric values | Manual | ✅ Visual Phase 0 |
| C10 | ThreatTicker | Scrolling ticker renders (may be moved behind setting) | Manual | ✅ Visual Phase 0 |
| C11 | Navbar | Tab navigation renders, attack vector buttons fire | Manual | ✅ Visual Phase 0 |

---

## CATEGORY D — ML Endpoint Schema Backward Compatibility

| # | Field | Required? | Type | Preserved rule |
|---|-------|----------|------|---------------|
| D1 | `risk_score` | YES | float 0–100 | Must remain in response; no renaming |
| D2 | `risk_level` | YES | `"LOW"\|"MEDIUM"\|"HIGH"` | Must remain; new `"CRITICAL"` may be added as extension only |
| D3 | `decision` | YES | `"APPROVED"\|"OTP_REQUIRED"\|"BLOCKED"` | Must remain; no enum changes |
| D4 | `shap_explanation[]` | YES | `{feature, contribution, direction, rawValue, description}` | All fields must remain |
| D5 | `anomaly_score` | YES | float | Must remain |
| D6 | `rule_flags[]` | YES | string[] | Must remain |
| D7 | Request: `amount`, `currency`, `merchant_category`, `is_new_device`, `velocity_2min`, `is_vpn_proxy`, `distance_jump_km`, `avg_user_amount` | YES | As-is | No renaming; new fields must be Optional with defaults |

**Automated check:** `pytest tests/test_service.py::test_high_fraud_velocity_burst_blocked` (validates schema presence)

---

## CATEGORY E — Data Integrity

| # | Item | Rule |
|---|------|------|
| E1 | All transaction data is synthetic | Every DB row must have `is_synthetic = true`; verified by seed script |
| E2 | No real PII | Names from faker with obviously-fake locale; emails `@example.org`; phones in reserved pattern |
| E3 | Demo banner visible | "DEMO — SYNTHETIC DATA ONLY. Risk scores are investigative leads, not evidence." always visible in UI |

---

## CATEGORY F — Developer Experience

| # | Item | Check |
|---|------|-------|
| F1 | `npm install` at repo root installs frontend deps (postinstall) | ✅ Configured Phase 0 |
| F2 | `npm run dev` starts frontend | ✅ Working |
| F3 | `npm run dev:ml` starts ML service | ✅ Working |
| F4 | pytest passes from `ml-service/` | ✅ 6/6 |

---

## VERIFICATION SCRIPT

Run this at the end of every phase gate:

```bash
#!/bin/bash
set -e
echo "=== ML Service Tests ==="
cd ml-service && ./venv/bin/pytest tests/ -v
cd ..

echo "=== Frontend Build ==="
cd frontend && npm run build
cd ..

echo "=== ML Service Health ==="
curl -sf http://localhost:8000/health | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['status']=='HEALTHY' and d['models_loaded']==True, f'Health check failed: {d}'"

echo "=== All checks PASSED ==="
```

Save as `scripts/verify_preserve.sh` and run with `bash scripts/verify_preserve.sh`.

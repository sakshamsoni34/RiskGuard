#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "=========================================================="
echo "🛡️  RiskGuard Investigator — Baseline Preservation Verify"
echo "=========================================================="

FAILED=0

assert_ok() {
  local desc="$1"
  local cmd="$2"
  echo -n "Checking $desc... "
  if ( cd "$ROOT_DIR" && eval "$cmd" ) > /dev/null 2>&1; then
    echo "✅ PASS"
  else
    echo "❌ FAIL"
    FAILED=$((FAILED + 1))
  fi
}

echo ""
echo "--- CATEGORY A: ML Endpoints (Port 8000) ---"
assert_ok "A1: GET /health returns status HEALTHY" \
  "curl -sf http://localhost:8000/health | grep -q '\"status\":\"HEALTHY\"'"

assert_ok "A2: POST /v1/risk/evaluate returns valid risk score & shap" \
  "curl -sf -X POST http://localhost:8000/v1/risk/evaluate -H 'Content-Type: application/json' -d '{\"amount\": 15000, \"currency\": \"INR\", \"merchant_category\": \"Electronics\", \"is_new_device\": true, \"velocity_2min\": 1, \"is_vpn_proxy\": false, \"distance_jump_km\": 10, \"avg_user_amount\": 2500}' | grep -q '\"risk_score\"'"

assert_ok "A3: GET /v1/model/metrics returns metrics JSON" \
  "curl -sf http://localhost:8000/v1/model/metrics | grep -q '\"precision\"'"

echo ""
echo "--- CATEGORY B: Frontend Build & Tests ---"
assert_ok "B1: Frontend Vitest test suite passes" \
  "(cd frontend && npm run test)"

assert_ok "B2: Frontend Next.js production build exits 0" \
  "(cd frontend && npm run build)"

assert_ok "B3: Next.js server responds on port 3000" \
  "curl -sf http://localhost:3000/login | grep -qi 'RiskGuard'"

echo ""
echo "--- CATEGORY C: Existing UI Components (C1–C11) ---"
COMPONENTS=(
  "frontend/src/components/TransactionTable.tsx"
  "frontend/src/components/InlineInspector.tsx"
  "frontend/src/components/TransactionModal.tsx"
  "frontend/src/components/ShapWaterfallChart.tsx"
  "frontend/src/components/StatsCards.tsx"
  "frontend/src/components/GeoThreatMap.tsx"
  "frontend/src/components/ThreatTicker.tsx"
  "frontend/src/components/RiskSimulator.tsx"
  "frontend/src/components/ModelAnalytics.tsx"
  "frontend/src/components/ArchitectureDiagram.tsx"
  "frontend/src/components/Navbar.tsx"
)

for comp in "${COMPONENTS[@]}"; do
  cname=$(basename "$comp")
  assert_ok "C: Component $cname is preserved on disk" \
    "[ -f '$comp' ]"
done

echo ""
echo "--- CATEGORY D: ML Schemas (D1–D7) ---"
assert_ok "D1-D5: Schemas present in ml-service/src/schemas.py" \
  "grep -q 'class TransactionEvaluationRequest' ml-service/src/schemas.py && grep -q 'class RiskEvaluationResponse' ml-service/src/schemas.py && grep -q 'class ShapValue' ml-service/src/schemas.py"

assert_ok "D6: Batch scoring endpoint is active" \
  "curl -sf -X POST http://localhost:8000/v1/risk/evaluate/batch -H 'Content-Type: application/json' -d '{\"transactions\": [{\"amount\": 1200, \"currency\": \"INR\", \"merchant_category\": \"Grocery\", \"is_new_device\": false, \"velocity_2min\": 0, \"is_vpn_proxy\": false, \"distance_jump_km\": 0, \"avg_user_amount\": 1200}]}' | grep -q '\"results\"'"

echo ""
echo "--- CATEGORY E: Core Backend & Security Audit (Port 9000) ---"
assert_ok "E1: Backend /health responds healthy" \
  "curl -sf http://localhost:9000/health | grep -q '\"status\":\"HEALTHY\"'"

assert_ok "E2: Backend test suite passes (23 tests)" \
  "./backend/venv/bin/pytest backend/tests/ -q"

assert_ok "E3: ML service test suite passes (11 tests)" \
  "./ml-service/venv/bin/pytest ml-service/tests/ -q"

assert_ok "E4: PII audit script passes with 0 violations" \
  "./scripts/audit_pii.sh"

echo ""
echo "----------------------------------------------------------"
if [ "$FAILED" -eq 0 ]; then
  echo "🎉 ALL PRESERVATION & INTEGRATION CHECKS PASSED PERFECTLY!"
  exit 0
else
  echo "🚨 VERIFICATION FAILED: $FAILED check(s) did not succeed."
  exit 1
fi

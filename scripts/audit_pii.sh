#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================="
echo "🛡️  RiskGuard Investigator — Synthetic PII Audit Script"
echo "=========================================================="

ERRORS=0

echo "[1/3] Scanning for prohibited consumer email domains (gmail, yahoo, hotmail, rediffmail)..."
PROHIBITED_DOMAINS='@(gmail\.com|yahoo\.co(m|\.in)|hotmail\.com|rediffmail\.com|outlook\.com)'

MATCHES=$(grep -rnE "$PROHIBITED_DOMAINS" \
  --exclude-dir={.git,node_modules,venv,.next,dist,reports_generated,__pycache__} \
  --exclude={"*.log","*.lock","package-lock.json","audit_pii.sh"} \
  . || true)

if [ -n "$MATCHES" ]; then
  echo "❌ FAIL: Prohibited public email domain found:"
  echo "$MATCHES"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: No prohibited public email domains detected."
fi

echo "[2/3] Checking synthetic email domain whitelist..."
# Any email found in code/mock/seeds must match approved RFC 2606 reserved domains
ALL_EMAILS=$(grep -I -rhoE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' \
  --exclude-dir={.git,node_modules,venv,.next,dist,reports_generated,__pycache__} \
  --exclude={"*.log","*.lock","package-lock.json","audit_pii.sh","*.md","*.db","*.db-wal","*.db-shm"} \
  . | sort -u || true)

NON_COMPLIANT_EMAILS=""
for email in $ALL_EMAILS; do
  case "$email" in
    *@example.org|*@example.com|*@test.gov.in|*@riskguard.internal|*@axisbank|*@okhdfcbank|*@paytm)
      ;;
    *)
      NON_COMPLIANT_EMAILS="$NON_COMPLIANT_EMAILS $email"
      ;;
  esac
done

if [ -n "$NON_COMPLIANT_EMAILS" ]; then
  echo "❌ FAIL: Non-compliant email addresses detected: $NON_COMPLIANT_EMAILS"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: All emails adhere to synthetic whitelist (@example.org, @example.com, @test.gov.in)."
fi

echo "[3/3] Checking for unmasked private keys or AWS secrets..."
KEY_MATCHES=$(grep -rnE '(AKIA[0-9A-Z]{16}|-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----)' \
  --exclude-dir={.git,node_modules,venv,.next,dist} \
  . || true)

if [ -n "$KEY_MATCHES" ]; then
  echo "❌ FAIL: Unmasked private keys or AWS keys found:"
  echo "$KEY_MATCHES"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: Zero private keys or cloud credentials detected."
fi

echo "----------------------------------------------------------"
if [ "$ERRORS" -eq 0 ]; then
  echo "🎉 SYNTHETIC DATA AUDIT PASSED: ZERO REAL PII DETECTED."
  exit 0
else
  echo "🚨 SYNTHETIC DATA AUDIT FAILED: $ERRORS violation(s) identified."
  exit 1
fi

import httpx
from typing import Dict, Any
from backend.app.core.config import settings


async def evaluate_transaction_risk(payload: Dict[str, Any]) -> Dict[str, Any]:
    url = f"{settings.ML_SERVICE_URL}/v1/risk/evaluate"
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                data["source"] = "ml_service"
                return data
        except Exception as e:
            # Service unavailable or connection refused
            pass

    # Safe deterministic fallback scoring if ML service is unreachable
    amount = float(payload.get("amount", 0.0))
    velocity = int(payload.get("velocity_2min", 1))
    is_vpn = bool(payload.get("is_vpn_proxy", False))
    is_new_device = bool(payload.get("is_new_device", False))

    score = 15.0
    flags = []
    if amount > 100000:
        score += 35.0
        flags.append("HIGH_VALUE_THRESHOLD")
    if velocity >= 3:
        score += 30.0
        flags.append("RAPID_BURST_VELOCITY")
    if is_vpn:
        score += 20.0
        flags.append("PROXY_OR_VPN_DETECTED")
    if is_new_device:
        score += 15.0
        flags.append("UNRECOGNIZED_HARDWARE_FINGERPRINT")

    score = min(100.0, score)
    decision = "BLOCKED" if score >= 70 else ("OTP_REQUIRED" if score >= 35 else "APPROVED")
    risk_level = "HIGH" if score >= 70 else ("MEDIUM" if score >= 35 else "LOW")

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "decision": decision,
        "anomaly_score": 0.45 if score >= 70 else 0.12,
        "rule_flags": flags,
        "shap_explanation": [
            {
                "feature": "amount",
                "contribution": 35.0 if amount > 100000 else 5.0,
                "direction": "increase",
                "rawValue": amount,
                "description": "Transaction amount vs user historical baseline",
            },
            {
                "feature": "velocity_2min",
                "contribution": 30.0 if velocity >= 3 else 0.0,
                "direction": "increase" if velocity >= 3 else "decrease",
                "rawValue": velocity,
                "description": "Successive payment frequency in 120s window",
            },
        ],
        "source": "fallback_rules",
    }

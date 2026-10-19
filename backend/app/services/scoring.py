import httpx
import time
from typing import Dict, Any, List, Optional
from backend.app.core.config import settings

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 3, recovery_time_secs: float = 15.0):
        self.failure_threshold = failure_threshold
        self.recovery_time_secs = recovery_time_secs
        self.failure_count = 0
        self.last_failure_time = 0.0
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN

    def record_success(self):
        self.failure_count = 0
        self.state = "CLOSED"

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"

    def can_attempt(self) -> bool:
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_time_secs:
                self.state = "HALF_OPEN"
                return True
            return False
        if self.state == "HALF_OPEN":
            return True
        return False

breaker = CircuitBreaker()

def fallback_score(payload: Dict[str, Any]) -> Dict[str, Any]:
    amount = float(payload.get("amount", 0.0))
    velocity = int(payload.get("velocity_2min", 1))
    is_vpn = bool(payload.get("is_vpn_proxy", False))
    is_new_device = bool(payload.get("is_new_device", False))
    dist = float(payload.get("distance_jump_km", 0.0))

    score = 12.0
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
    if dist > 500.0:
        score += 25.0
        flags.append("IMPOSSIBLE_TRAVEL_HOP")

    score = min(100.0, score)
    if score >= 88.0:
        risk_level = "CRITICAL"
        decision = "BLOCKED"
    elif score >= 70.0:
        risk_level = "HIGH"
        decision = "BLOCKED"
    elif score >= 35.0:
        risk_level = "MEDIUM"
        decision = "OTP_REQUIRED"
    else:
        risk_level = "LOW"
        decision = "APPROVED"

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
        "model_version": "fallback-rules-1.0",
        "calibrated_probability": round(score / 100.0, 4),
        "risk_band": risk_level,
        "top_reasons": flags or ["Baseline transactional profile within normal limits"],
        "source": "fallback_rules",
    }

async def evaluate_transaction_risk(payload: Dict[str, Any]) -> Dict[str, Any]:
    url = f"{settings.ML_SERVICE_URL}/v1/risk/evaluate"
    if breaker.can_attempt():
        for attempt in range(2):
            try:
                async with httpx.AsyncClient(timeout=3.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        data["source"] = "ml_service"
                        breaker.record_success()
                        return data
            except Exception:
                pass
        breaker.record_failure()

    # Fallback to local heuristic
    return fallback_score(payload)

async def evaluate_batch_risk(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    url = f"{settings.ML_SERVICE_URL}/v1/risk/evaluate/batch"
    if breaker.can_attempt():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(url, json={"transactions": transactions})
                if resp.status_code == 200:
                    breaker.record_success()
                    data = resp.json()
                    data["source"] = "ml_service"
                    return data
        except Exception:
            breaker.record_failure()

    # Fallback processing for batch
    results = [fallback_score(tx) for tx in transactions]
    return {
        "results": results,
        "total_processed": len(results),
        "batch_latency_ms": 1.0,
        "source": "fallback_rules",
    }

async def get_ml_status() -> Dict[str, Any]:
    url = f"{settings.ML_SERVICE_URL}/health"
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                return {
                    "online": True,
                    "circuit_breaker": breaker.state,
                    "service_response": resp.json(),
                }
    except Exception as e:
        return {
            "online": False,
            "circuit_breaker": breaker.state,
            "error": str(e),
        }
    return {
        "online": False,
        "circuit_breaker": breaker.state,
        "error": "Non-200 status",
    }

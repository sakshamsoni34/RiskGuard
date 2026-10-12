import time
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

import sys
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from src.main import app
from src.engine import RiskEngine

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_engine():
    engine = RiskEngine.get_instance()
    engine.load_artifacts()
    assert engine.is_loaded is True

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["models_loaded"] is True

def test_model_metrics_endpoint():
    response = client.get("/v1/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["totalProcessed"] > 0
    assert 0.0 <= data["prAuc"] <= 1.0
    assert 0.0 <= data["rocAuc"] <= 1.0
    assert 0.0 <= data["precision"] <= 1.0
    assert 0.0 <= data["recall"] <= 1.0

def test_legitimate_transaction_approved():
    """Test Case 2: ₹1,850 grocery transaction on known device -> must score <35 and return APPROVED."""
    payload = {
        "amount": 1850.0,
        "currency": "INR",
        "merchant_category": "Grocery",
        "is_new_device": False,
        "velocity_2min": 0,
        "is_vpn_proxy": False,
        "distance_jump_km": 2.5,
        "avg_user_amount": 2000.0,
    }
    response = client.post("/v1/risk/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] < 35.0, f"Expected risk_score < 35, got {data['risk_score']}"
    assert data["risk_level"] == "LOW"
    assert data["decision"] == "APPROVED"
    assert len(data["shap_explanation"]) > 0

def test_high_fraud_velocity_burst_blocked():
    """Test Case 1: ₹85,000 velocity burst in Lagos (impossible travel) -> must score >70 and return BLOCKED."""
    payload = {
        "amount": 85000.0,
        "currency": "INR",
        "merchant_category": "Electronics",
        "is_new_device": True,
        "velocity_2min": 5,
        "is_vpn_proxy": True,
        "distance_jump_km": 6800.0,
        "avg_user_amount": 1850.0,
    }
    response = client.post("/v1/risk/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] >= 70.0, f"Expected risk_score >= 70, got {data['risk_score']}"
    assert data["risk_level"] == "HIGH"
    assert data["decision"] == "BLOCKED"
    assert "VELOCITY_BURST_CRITICAL" in data["rule_flags"]
    assert "IMPOSSIBLE_TRAVEL_EXTREME" in data["rule_flags"]
    assert len(data["shap_explanation"]) > 0

def test_moderate_risk_otp_required():
    """Test Case 4: Moderate deviation (e.g. ₹9,500 on new device without impossible travel) -> OTP_REQUIRED."""
    payload = {
        "amount": 9500.0,
        "currency": "INR",
        "merchant_category": "Electronics",
        "is_new_device": True,
        "velocity_2min": 1,
        "is_vpn_proxy": False,
        "distance_jump_km": 15.0,
        "avg_user_amount": 2000.0,
    }
    response = client.post("/v1/risk/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 35.0 <= data["risk_score"] < 70.0, f"Expected 35 <= risk_score < 70, got {data['risk_score']}"
    assert data["risk_level"] == "MEDIUM"
    assert data["decision"] == "OTP_REQUIRED"

def test_sub_40ms_latency_benchmark():
    """Test Case 3: P95 inference latency must be well under 40 milliseconds."""
    payload = {
        "amount": 25000.0,
        "currency": "INR",
        "merchant_category": "Jewelry",
        "is_new_device": True,
        "velocity_2min": 2,
        "is_vpn_proxy": False,
        "distance_jump_km": 120.0,
        "avg_user_amount": 3500.0,
    }

    # Warm-up requests
    for _ in range(3):
        client.post("/v1/risk/evaluate", json=payload)

    server_latencies = []
    total_latencies = []
    iterations = 50
    for _ in range(iterations):
        t0 = time.perf_counter()
        res = client.post("/v1/risk/evaluate", json=payload)
        dur_ms = (time.perf_counter() - t0) * 1000
        assert res.status_code == 200
        total_latencies.append(dur_ms)
        server_latencies.append(float(res.headers.get("x-inference-time-ms", dur_ms)))

    server_latencies.sort()
    total_latencies.sort()
    server_p95 = server_latencies[int(0.95 * len(server_latencies))]
    server_p50 = server_latencies[int(0.50 * len(server_latencies))]
    total_p95 = total_latencies[int(0.95 * len(total_latencies))]
    total_p50 = total_latencies[int(0.50 * len(total_latencies))]

    print(f"\n--- Latency Benchmark (50 iterations) ---")
    print(f"Server Engine P50: {server_p50:.2f} ms | Server Engine P95: {server_p95:.2f} ms")
    print(f"Total Client  P50: {total_p50:.2f} ms | Total Client  P95: {total_p95:.2f} ms")

    assert server_p95 < 40.0, f"Server P95 latency {server_p95:.2f}ms exceeded 40ms threshold!"
    assert total_p95 < 50.0, f"Total client P95 latency {total_p95:.2f}ms exceeded 50ms threshold!"

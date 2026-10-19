import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.engine import RiskEngine
from src.schemas import TransactionEvaluationRequest

engine = RiskEngine.get_instance()
engine.load_artifacts()


def test_no_leakage_and_credible_metrics():
    metrics = engine.get_metrics()
    assert metrics is not None, "Metrics must be present"
    precision = metrics.get("precision", 0.0)
    fpr = metrics.get("falsePositiveRate", 0.0)
    recall = metrics.get("recall", 0.0)

    # In Phase 4, metrics must be credible (not artificial 1.0 or 0.0)
    assert precision < 1.0, f"Precision {precision} is too perfect, indicates label leakage"
    assert precision >= 0.85, f"Precision {precision} should be competitive"
    assert fpr > 0.0, f"FPR {fpr} should reflect non-zero false positive rate"
    assert recall > 0.50, f"Recall {recall} should capture majority of fraud"


def test_batch_equals_single_evaluations():
    req1 = TransactionEvaluationRequest(
        amount=500.0,
        currency="INR",
        merchant_category="Grocery",
        is_new_device=False,
        velocity_2min=0,
        is_vpn_proxy=False,
        distance_jump_km=2.0,
        avg_user_amount=600.0,
    )
    req2 = TransactionEvaluationRequest(
        amount=85000.0,
        currency="INR",
        merchant_category="Crypto",
        is_new_device=True,
        velocity_2min=5,
        is_vpn_proxy=True,
        distance_jump_km=3500.0,
        avg_user_amount=2000.0,
    )

    single1 = engine.evaluate(req1)
    single2 = engine.evaluate(req2)

    batch_resp = engine.evaluate_batch([req1, req2])
    assert len(batch_resp.results) == 2
    assert batch_resp.results[0].risk_score == single1.risk_score
    assert batch_resp.results[1].risk_score == single2.risk_score
    assert batch_resp.results[0].decision == single1.decision
    assert batch_resp.results[1].decision == single2.decision


def test_monotonic_risk_increase_with_velocity():
    base_req = {
        "amount": 25000.0,
        "currency": "INR",
        "merchant_category": "Electronics",
        "is_new_device": True,
        "is_vpn_proxy": False,
        "distance_jump_km": 10.0,
        "avg_user_amount": 5000.0,
    }

    req_low_velocity = TransactionEvaluationRequest(**base_req, velocity_2min=1)
    req_high_velocity = TransactionEvaluationRequest(**base_req, velocity_2min=6)

    res_low = engine.evaluate(req_low_velocity)
    res_high = engine.evaluate(req_high_velocity)

    assert res_high.risk_score >= res_low.risk_score, (
        f"Higher velocity ({res_high.risk_score}) must yield >= score than lower velocity ({res_low.risk_score})"
    )


def test_sub_40ms_p95_inference_speed():
    req = TransactionEvaluationRequest(
        amount=12000.0,
        currency="INR",
        merchant_category="Electronics",
        is_new_device=False,
        velocity_2min=1,
        is_vpn_proxy=False,
        distance_jump_km=15.0,
        avg_user_amount=8000.0,
    )

    import time
    times = []
    for _ in range(30):
        t0 = time.perf_counter()
        _ = engine.evaluate(req)
        times.append((time.perf_counter() - t0) * 1000)

    times.sort()
    p95 = times[int(len(times) * 0.95)]
    assert p95 < 40.0, f"P95 latency {p95:.2f}ms exceeds 40ms threshold"


def test_shap_fields_and_schema_presence():
    req = TransactionEvaluationRequest(
        amount=95000.0,
        currency="INR",
        merchant_category="Jewelry",
        is_new_device=True,
        velocity_2min=4,
        is_vpn_proxy=True,
        distance_jump_km=4200.0,
        avg_user_amount=3000.0,
    )
    res = engine.evaluate(req)
    assert res.decision in ["BLOCKED", "OTP_REQUIRED", "APPROVED"]
    assert res.risk_level in ["LOW", "MEDIUM", "HIGH"]
    assert res.model_version == "2.0.0"
    assert len(res.shap_explanation) >= 3
    for s in res.shap_explanation:
        assert s.feature is not None
        assert s.direction in ["increase", "decrease"]
        assert s.description is not None

import pytest
from fastapi.testclient import TestClient
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.main import app

client = TestClient(app)

def test_case_lifecycle_and_state_machine():
    # 1. Create a case
    create_res = client.post("/api/v1/cases", json={
        "title": "Phishing Ring Syndicate Mumbai",
        "priority": "P1_CRITICAL",
        "transaction_ids": ["TXN-1001"],
        "summary": "Coordinated mule extraction across multiple geohashes."
    })
    assert create_res.status_code == 200
    case_data = create_res.json()
    case_id = case_data["id"]
    assert case_data["status"] == "NEW"

    # 2. Test illegal transition (NEW -> ESCALATED directly is illegal)
    bad_res = client.patch(f"/api/v1/cases/{case_id}", json={
        "status": "ESCALATED"
    })
    assert bad_res.status_code == 400
    assert "Illegal case status transition" in bad_res.json()["detail"]

    # 3. Valid transition: NEW -> UNDER_INVESTIGATION
    step1_res = client.patch(f"/api/v1/cases/{case_id}", json={
        "status": "UNDER_INVESTIGATION"
    })
    assert step1_res.status_code == 200
    assert step1_res.json()["status"] == "UNDER_INVESTIGATION"

    # 4. Valid transition: UNDER_INVESTIGATION -> ESCALATED
    step2_res = client.patch(f"/api/v1/cases/{case_id}", json={
        "status": "ESCALATED"
    })
    assert step2_res.status_code == 200
    assert step2_res.json()["status"] == "ESCALATED"

    # 5. Valid transition: ESCALATED -> CLOSED
    step3_res = client.patch(f"/api/v1/cases/{case_id}", json={
        "status": "CLOSED"
    })
    assert step3_res.status_code == 200
    assert step3_res.json()["status"] == "CLOSED"

def test_link_transactions_to_case():
    # Create case
    res = client.post("/api/v1/cases", json={
        "title": "UPI Sim-Swap Ring",
        "priority": "P2_HIGH",
        "transaction_ids": ["TXN-1001"],
    })
    assert res.status_code == 200
    case_id = res.json()["id"]

    # Link additional transactions
    link_res = client.post(f"/api/v1/cases/{case_id}/transactions", json={
        "transaction_ids": ["TXN-1002", "TXN-1003"]
    })
    assert link_res.status_code == 200
    data = link_res.json()
    assert "TXN-1002" in data["transactionIds"]
    assert "TXN-1003" in data["transactionIds"]
    assert len(data["transactionIds"]) >= 3

def test_submit_analyst_feedback():
    # Log analyst feedback on model prediction
    res = client.post("/api/v1/cases/CR-2026-0842/feedback", json={
        "transaction_id": "TXN-1002",
        "ground_truth_label": "TRUE_POSITIVE",
        "notes": "Confirmed unauthorized device registration from known VPN exit node",
        "typology_tag": "MULE_ACCOUNT_EXTRACTION"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "FEEDBACK_LOGGED"
    assert data["ground_truth_label"] == "TRUE_POSITIVE"

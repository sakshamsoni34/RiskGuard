import pytest
from fastapi.testclient import TestClient
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.main import app
from backend.seed_demo import seed_database

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    seed_database()


def test_backend_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "HEALTHY"
    assert data["service"] == "riskguard-investigator-backend"


def test_auth_login_success():
    resp = client.post(
        "/api/v1/auth/login",
        json={"badge_number": "CC-8421", "password": "investigator123"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["officer"]["badge_number"] == "CC-8421"
    assert data["officer"]["role"] == "INVESTIGATOR"


def test_auth_login_invalid_credentials():
    resp = client.post(
        "/api/v1/auth/login",
        json={"badge_number": "CC-8421", "password": "wrong_password_attempt"},
    )
    assert resp.status_code == 401
    assert "Invalid officer badge" in resp.json()["detail"]


def test_list_transactions():
    resp = client.get("/api/v1/transactions?limit=10")
    assert resp.status_code == 200
    txns = resp.json()
    assert len(txns) <= 10
    assert len(txns) > 0
    first = txns[0]
    assert "id" in first
    assert "riskScore" in first
    assert "decision" in first
    assert first["isSynthetic"] is True


def test_transaction_override():
    resp = client.post(
        "/api/v1/transactions/TXN-1002/override",
        json={"decision": "BLOCKED", "reason": "SOP-402 manual cybercell hold"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["decision"] == "BLOCKED"
    assert data["status"] == "MANUALLY_OVERRIDDEN"


def test_list_cases():
    resp = client.get("/api/v1/cases")
    assert resp.status_code == 200
    cases = resp.json()
    assert len(cases) >= 3
    assert any(c["caseNumber"] == "CR-2026-0842" for c in cases)


def test_create_case():
    resp = client.post(
        "/api/v1/cases",
        json={
            "title": "Automated Test Case File",
            "priority": "P2_HIGH",
            "target_mule_account": "test-mule@example.org",
            "transaction_ids": ["TXN-1001"],
            "summary": "Integration test created case",
            "tags": ["IntegrationTest"],
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "CR-2026-" in data["caseNumber"]
    assert data["title"] == "Automated Test Case File"


def test_add_case_note():
    resp = client.post(
        "/api/v1/cases/CR-2026-0842/notes",
        json={"text": "Integration test officer note verification."},
    )
    assert resp.status_code == 200
    note = resp.json()
    assert note["officerBadge"] == "#CC-8421"
    assert "Integration test" in note["text"]


def test_audit_verify_hash_chain():
    resp = client.post("/api/v1/audit/verify")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "INTACT"
    assert data["merkle_valid"] is True
    assert data["total_records_verified"] > 0


def test_list_reports():
    resp = client.get("/api/v1/reports")
    assert resp.status_code == 200
    reports = resp.json()
    assert len(reports) >= 2
    assert any(r["reportNumber"] == "IR-2026-041" for r in reports)

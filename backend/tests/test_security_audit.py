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

def test_owasp_asvs_security_headers():
    res = client.get("/health")
    assert res.status_code == 200
    headers = res.headers
    assert headers.get("x-frame-options") == "DENY"
    assert headers.get("x-content-type-options") == "nosniff"
    assert headers.get("referrer-policy") == "strict-origin-when-cross-origin"
    assert "default-src 'self'" in headers.get("content-security-policy", "")
    assert headers.get("strict-transport-security") is not None

def test_no_public_registration_surface():
    """Confirms no public registration or self-signup endpoint exists."""
    for path in ["/api/v1/auth/register", "/api/v1/auth/signup", "/register", "/signup"]:
        res = client.post(path, json={"email": "attacker@example.org", "password": "password"})
        assert res.status_code in (404, 405), f"Public registration endpoint exposed at {path}!"

def test_failed_login_lockout_mechanism():
    """Confirms consecutive bad logins trip failed attempt tracking."""
    badge = "CC-8421"
    for _ in range(5):
        res = client.post("/api/v1/auth/login", json={
            "badge_number": badge,
            "password": "WrongPassword999!"
        })
        assert res.status_code == 401
    
    # Check that after threshold, lockout message is indicated
    res_locked = client.post("/api/v1/auth/login", json={
        "badge_number": badge,
        "password": "WrongPassword999!"
    })
    assert res_locked.status_code == 401
    assert "lockout" in res_locked.json()["detail"].lower() or "invalid" in res_locked.json()["detail"].lower()

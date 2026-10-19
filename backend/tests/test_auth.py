import pytest
from fastapi.testclient import TestClient
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.main import app
from backend.seed_demo import seed_database

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_auth_db():
    seed_database()


def test_officer_roles_login_matrix():
    officers = [
        ("CC-8421", "investigator123", "INVESTIGATOR"),
        ("CC-9104", "investigator123", "INVESTIGATOR"),
        ("SUP-010", "supervisor123", "SUPERVISOR"),
        ("ADM-001", "admin123", "ADMIN"),
    ]

    for badge, pwd, expected_role in officers:
        resp = client.post(
            "/api/v1/auth/login",
            json={"badge_number": badge, "password": pwd},
        )
        assert resp.status_code == 200, f"Login failed for {badge}"
        data = resp.json()
        assert data["officer"]["role"] == expected_role
        assert "access_token" in data


def test_public_signup_is_disabled():
    # Attempting to POST /signup or /register must return 404 or not be allowed
    resp = client.post("/api/v1/auth/signup", json={"username": "hacker"})
    assert resp.status_code == 404 or resp.status_code == 405


def test_invalid_badge_returns_401():
    resp = client.post(
        "/api/v1/auth/login",
        json={"badge_number": "FAKE-000", "password": "password"},
    )
    assert resp.status_code == 401


def test_authenticated_profile_endpoint():
    # Login as Insp. Sharma
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"badge_number": "CC-8421", "password": "investigator123"},
    )
    token = login_resp.json()["access_token"]

    # Call /auth/me with Bearer token
    me_resp = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["badge_number"] == "CC-8421"
    assert me_resp.json()["full_name"] == "Insp. Vikram Sharma"

import pytest
from fastapi.testclient import TestClient
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.main import app

client = TestClient(app)

def test_audit_logs_query_and_filtering():
    res = client.get("/api/v1/audit/logs?limit=10")
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)
    assert len(logs) > 0
    assert "sha256Hash" in logs[0]
    assert len(logs[0]["sha256Hash"]) == 64

def test_audit_merkle_chain_integrity():
    res = client.get("/api/v1/audit/verify")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ("INTACT", "VERIFIED")
    assert data["merkle_valid"] is True
    assert data["total_records_verified"] > 0
    assert len(data["last_block_hash"]) == 64

def test_report_generation_and_pdf_download():
    # 1. Generate report
    gen_res = client.post("/api/v1/reports", json={
        "case_id": "CR-2026-0842",
        "title": "FIR Forensic Dossier — Case CR-2026-0842",
        "primary_typology": "Mule Extraction Ring",
    })
    assert gen_res.status_code == 200
    report_data = gen_res.json()
    assert report_data["status"] == "SEALED"
    assert len(report_data["sha256VerificationHash"]) == 64
    rep_num = report_data["reportNumber"]

    # 2. Download report PDF
    down_res = client.get(f"/api/v1/reports/{rep_num}/download")
    assert down_res.status_code == 200
    assert down_res.headers.get("content-type") == "application/pdf"
    assert len(down_res.content) > 1000  # valid PDF size
    assert down_res.content.startswith(b"%PDF")

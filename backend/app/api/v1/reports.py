from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os

from backend.app.core.database import get_db
from backend.app.models.report import ReportRecord
from backend.app.models.case import CaseRecord
from backend.app.schemas.report import ReportCreate, ReportOut
from backend.app.services.report_gen import generate_pdf_report
from backend.app.services.audit import record_audit_event

router = APIRouter(prefix="/reports", tags=["Reports"])


def map_report(r: ReportRecord) -> ReportOut:
    return ReportOut(
        id=r.id,
        reportNumber=r.report_number,
        caseId=r.case_id,
        generatedBy=r.generated_by,
        generatedAt=r.generated_at.isoformat(),
        title=r.title,
        totalTransactions=r.total_transactions,
        totalDisputedAmount=r.total_disputed_amount,
        primaryTypology=r.primary_typology,
        sha256VerificationHash=r.sha256_verification_hash,
        status=r.status,
        filePath=r.file_path,
    )


@router.get("", response_model=List[ReportOut])
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(ReportRecord).order_by(ReportRecord.generated_at.desc()).all()
    return [map_report(r) for r in reports]


@router.post("", response_model=ReportOut)
def create_report(req: ReportCreate, db: Session = Depends(get_db)):
    case = db.query(CaseRecord).filter((CaseRecord.id == req.case_id) | (CaseRecord.case_number == req.case_id)).first()
    if not case:
        raise HTTPException(status_code=404, detail="Associated case dossier not found")

    report_count = db.query(ReportRecord).count()
    report_num = f"IR-2026-{41 + report_count:03d}"
    officer = "Insp. Vikram Sharma (#CC-8421)"

    filepath, file_hash = generate_pdf_report(
        report_number=report_num,
        case_number=case.case_number,
        title=req.title,
        officer_name=officer,
        total_amount=case.total_amount_at_risk,
        total_txns=len(case.links),
        typology=req.primary_typology or "Account Takeover / Mule Exfiltration",
    )

    report = ReportRecord(
        report_number=report_num,
        case_id=case.case_number,
        generated_by=officer,
        title=req.title,
        total_transactions=len(case.links),
        total_disputed_amount=case.total_amount_at_risk,
        primary_typology=req.primary_typology or "Account Takeover / Mule Exfiltration",
        sha256_verification_hash=file_hash,
        status="SEALED",
        file_path=filepath,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    record_audit_event(
        db=db,
        officer_id="#CC-8421",
        officer_name="Insp. Vikram Sharma",
        action="REPORT_SEALED_AND_DISPATCHED",
        entity_type="REPORT",
        entity_id=report.report_number,
        details=f"Generated PDF dossier with SHA-256 {file_hash[:16]}... for {case.case_number}",
    )

    return map_report(report)


@router.get("/{id}/download")
def download_report(id: str, db: Session = Depends(get_db)):
    report = db.query(ReportRecord).filter((ReportRecord.id == id) | (ReportRecord.report_number == id)).first()
    if not report or not report.file_path or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report PDF file not found on disk")

    return FileResponse(
        path=report.file_path,
        media_type="application/pdf",
        filename=f"{report.report_number}.pdf",
    )

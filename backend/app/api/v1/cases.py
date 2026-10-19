from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from backend.app.core.database import get_db
from backend.app.models.case import CaseRecord, CaseTransactionLink, CaseNoteRecord
from backend.app.models.transaction import TransactionRecord
from backend.app.schemas.case import (
    CaseCreate,
    CaseUpdate,
    CaseOut,
    CaseNoteCreate,
    CaseNoteOut,
)
from backend.app.services.audit import record_audit_event

router = APIRouter(prefix="/cases", tags=["Cases"])


def map_case_to_schema(c: CaseRecord) -> CaseOut:
    tags = json.loads(c.tags_json or "[]")
    notes = [
        CaseNoteOut(
            id=n.id,
            officerBadge=n.officer_badge,
            officerName=n.officer_name,
            timestamp=n.timestamp.isoformat(),
            text=n.text,
        )
        for n in c.notes
    ]
    txn_ids = [l.transaction_id for l in c.links]

    return CaseOut(
        id=c.id,
        caseNumber=c.case_number,
        title=c.title,
        status=c.status,
        priority=c.priority,
        assignedTo=c.assigned_to,
        targetMuleAccount=c.target_mule_account,
        suspectEntity=c.suspect_entity,
        totalAmountAtRisk=c.total_amount_at_risk,
        transactionIds=txn_ids,
        createdAt=c.created_at.isoformat(),
        updatedAt=c.updated_at.isoformat(),
        tags=tags,
        notes=notes,
        summary=c.summary,
    )


@router.get("", response_model=List[CaseOut])
def list_cases(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(CaseRecord)
    if status and status != "ALL":
        query = query.filter(CaseRecord.status == status)
    if priority and priority != "ALL":
        query = query.filter(CaseRecord.priority == priority)
    cases = query.order_by(CaseRecord.updated_at.desc()).all()
    return [map_case_to_schema(c) for c in cases]


@router.post("", response_model=CaseOut)
def create_case(req: CaseCreate, db: Session = Depends(get_db)):
    case_count = db.query(CaseRecord).count()
    case_number = f"CR-2026-{842 + case_count:04d}"

    # Calculate total amount from linked txns
    total_amount = 0.0
    if req.transaction_ids:
        txns = db.query(TransactionRecord).filter(TransactionRecord.id.in_(req.transaction_ids)).all()
        total_amount = sum(t.amount for t in txns)

    new_case = CaseRecord(
        case_number=case_number,
        title=req.title,
        priority=req.priority,
        target_mule_account=req.target_mule_account,
        suspect_entity=req.suspect_entity,
        total_amount_at_risk=total_amount,
        summary=req.summary or "New dossier registered for cyber cell digital investigation.",
        tags_json=json.dumps(req.tags),
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    # Link transactions
    for tid in req.transaction_ids:
        link = CaseTransactionLink(case_id=new_case.id, transaction_id=tid)
        db.add(link)

    # Initial Note
    note = CaseNoteRecord(
        case_id=new_case.id,
        officer_badge="#CC-8421",
        officer_name="Insp. Vikram Sharma",
        text="Case dossier opened. Initial evidence linked from transaction telemetry.",
    )
    db.add(note)
    db.commit()
    db.refresh(new_case)

    record_audit_event(
        db=db,
        officer_id="#CC-8421",
        officer_name="Insp. Vikram Sharma",
        action="CASE_REGISTERED",
        entity_type="CASE",
        entity_id=new_case.case_number,
        details=f"Opened case file: {new_case.title} (Priority: {new_case.priority})",
    )

    return map_case_to_schema(new_case)


@router.get("/{id}", response_model=CaseOut)
def get_case(id: str, db: Session = Depends(get_db)):
    c = db.query(CaseRecord).filter((CaseRecord.id == id) | (CaseRecord.case_number == id)).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case file not found")
    return map_case_to_schema(c)


@router.patch("/{id}", response_model=CaseOut)
def update_case(id: str, req: CaseUpdate, db: Session = Depends(get_db)):
    c = db.query(CaseRecord).filter((CaseRecord.id == id) | (CaseRecord.case_number == id)).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case file not found")

    old_status = c.status
    if req.title:
        c.title = req.title
    if req.status:
        c.status = req.status
    if req.priority:
        c.priority = req.priority
    if req.assigned_to:
        c.assigned_to = req.assigned_to
    if req.summary:
        c.summary = req.summary

    db.commit()
    db.refresh(c)

    record_audit_event(
        db=db,
        officer_id="#CC-8421",
        officer_name="Insp. Vikram Sharma",
        action="CASE_STATUS_UPDATED",
        entity_type="CASE",
        entity_id=c.case_number,
        details=f"Status changed from {old_status} to {c.status}",
    )

    return map_case_to_schema(c)


@router.post("/{id}/notes", response_model=CaseNoteOut)
def add_case_note(id: str, req: CaseNoteCreate, db: Session = Depends(get_db)):
    c = db.query(CaseRecord).filter((CaseRecord.id == id) | (CaseRecord.case_number == id)).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case file not found")

    note = CaseNoteRecord(
        case_id=c.id,
        officer_badge="#CC-8421",
        officer_name="Insp. Vikram Sharma",
        text=req.text,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    record_audit_event(
        db=db,
        officer_id="#CC-8421",
        officer_name="Insp. Vikram Sharma",
        action="CASE_NOTE_APPENDED",
        entity_type="CASE",
        entity_id=c.case_number,
        details=f"Appended investigation observation: {req.text[:60]}...",
    )

    return CaseNoteOut(
        id=note.id,
        officerBadge=note.officer_badge,
        officerName=note.officer_name,
        timestamp=note.timestamp.isoformat(),
        text=note.text,
    )

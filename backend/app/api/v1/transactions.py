from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import json

from backend.app.core.database import get_db
from backend.app.models.transaction import TransactionRecord
from backend.app.schemas.transaction import (
    TransactionOut,
    TransactionOverrideRequest,
    EvaluateRiskRequest,
    EvaluateRiskResponse,
    PaymentMethodSchema,
    DeviceInfoSchema,
    GeoLocationSchema,
    TransactionVelocitySchema,
    ShapItem,
    BatchScoreRequest,
    BatchScoreResponse,
    BatchScoreResultItem,
)
from backend.app.services.scoring import (
    evaluate_transaction_risk,
    evaluate_batch_risk,
    get_ml_status,
)
from backend.app.services.audit import record_audit_event

router = APIRouter(prefix="/transactions", tags=["Transactions"])


def map_to_schema(r: TransactionRecord) -> TransactionOut:
    shap_raw = json.loads(r.shap_explanation_json or "[]")
    shap_items = [ShapItem(**item) for item in shap_raw]
    rule_flags = json.loads(r.rule_flags_json or "[]")

    return TransactionOut(
        id=r.id,
        timestamp=r.timestamp.isoformat(),
        customerId=r.customer_id,
        customerName=r.customer_name,
        customerEmail=r.customer_email,
        customerPhone=r.customer_phone,
        amount=r.amount,
        currency=r.currency,
        merchant=r.merchant,
        merchantCategory=r.merchant_category,
        paymentMethod=PaymentMethodSchema(
            type=r.payment_type,
            brand=r.payment_brand,
        ),
        device=DeviceInfoSchema(
            os=r.device_os,
            browser=r.device_browser,
            fingerprintHash=r.device_fingerprint,
            isNewDevice=r.is_new_device,
        ),
        location=GeoLocationSchema(
            city=r.city,
            country=r.country,
            ipAddress=r.ip_address,
            isVpnOrProxy=r.is_vpn_or_proxy,
            distanceFromHomeKm=r.distance_from_home_km,
        ),
        velocity=TransactionVelocitySchema(
            last2MinutesCount=r.velocity_2min,
        ),
        riskScore=r.risk_score,
        riskLevel=r.risk_level,
        decision=r.decision,
        status=r.status,
        shapExplanation=shap_items,
        anomalyScore=r.anomaly_score,
        ruleFlags=rule_flags,
        isSynthetic=r.is_synthetic,
    )


@router.get("", response_model=List[TransactionOut])
def list_transactions(
    risk_level: Optional[str] = Query(None),
    decision: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None, ge=0),
    max_amount: Optional[float] = Query(None, ge=0),
    cursor_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(TransactionRecord)

    if risk_level and risk_level != "ALL":
        query = query.filter(TransactionRecord.risk_level == risk_level.upper())
    if decision and decision != "ALL":
        query = query.filter(TransactionRecord.decision == decision.upper())
    if min_amount is not None:
        query = query.filter(TransactionRecord.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(TransactionRecord.amount <= max_amount)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                TransactionRecord.id.ilike(search_pattern),
                TransactionRecord.customer_name.ilike(search_pattern),
                TransactionRecord.customer_email.ilike(search_pattern),
                TransactionRecord.merchant.ilike(search_pattern),
                TransactionRecord.city.ilike(search_pattern),
            )
        )

    # Keyset cursor pagination
    if cursor_id:
        cursor_item = db.query(TransactionRecord).filter(TransactionRecord.id == cursor_id).first()
        if cursor_item:
            query = query.filter(
                (TransactionRecord.timestamp < cursor_item.timestamp) |
                ((TransactionRecord.timestamp == cursor_item.timestamp) & (TransactionRecord.id < cursor_item.id))
            )

    records = query.order_by(TransactionRecord.timestamp.desc(), TransactionRecord.id.desc()).limit(limit).all()
    return [map_to_schema(r) for r in records]


@router.get("/status/ml")
async def get_ml_integration_status():
    """Checks connection to ML service, circuit breaker state, and model health."""
    return await get_ml_status()


@router.post("/batch-score", response_model=BatchScoreResponse)
async def batch_score_transactions(
    req: BatchScoreRequest,
    db: Session = Depends(get_db),
):
    """Batch-scores a collection of transaction IDs using the ML microservice."""
    records = db.query(TransactionRecord).filter(TransactionRecord.id.in_(req.transaction_ids)).all()
    if not records:
        return BatchScoreResponse(processed_count=0, results=[], source="none")

    inputs = []
    for r in records:
        inputs.append({
            "amount": r.amount,
            "currency": r.currency,
            "merchant_category": r.merchant_category,
            "is_new_device": r.is_new_device,
            "velocity_2min": r.velocity_2min,
            "is_vpn_proxy": r.is_vpn_or_proxy,
            "distance_jump_km": r.distance_from_home_km,
            "avg_user_amount": 2500.0,
        })

    eval_result = await evaluate_batch_risk(inputs)
    results_list = eval_result.get("results", [])

    updated_items: List[BatchScoreResultItem] = []
    for r, score_data in zip(records, results_list):
        r.risk_score = score_data.get("risk_score", r.risk_score)
        r.risk_level = score_data.get("risk_level", r.risk_level)
        r.decision = score_data.get("decision", r.decision)
        r.anomaly_score = score_data.get("anomaly_score", r.anomaly_score)
        r.rule_flags_json = json.dumps(score_data.get("rule_flags", []))
        r.shap_explanation_json = json.dumps(score_data.get("shap_explanation", []))
        
        updated_items.append(
            BatchScoreResultItem(
                id=r.id,
                risk_score=r.risk_score,
                risk_level=r.risk_level,
                decision=r.decision,
                anomaly_score=r.anomaly_score,
                rule_flags=score_data.get("rule_flags", []),
            )
        )

    db.commit()

    record_audit_event(
        db=db,
        officer_id="#CC-8421",
        officer_name="Insp. Vikram Sharma",
        action="TRANSACTIONS_BATCH_RESCORED",
        entity_type="TRANSACTION_BATCH",
        entity_id=f"batch-{len(records)}",
        details=f"Batch re-scored {len(records)} transactions via ML service source: {eval_result.get('source')}",
    )

    return BatchScoreResponse(
        processed_count=len(updated_items),
        results=updated_items,
        source=eval_result.get("source", "ml_service"),
    )


@router.get("/{id}", response_model=TransactionOut)
def get_transaction(id: str, db: Session = Depends(get_db)):
    r = db.query(TransactionRecord).filter(TransactionRecord.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Transaction record not found")
    return map_to_schema(r)


@router.get("/{id}/related", response_model=List[TransactionOut])
def get_related_transactions(id: str, db: Session = Depends(get_db)):
    """Finds related transactions sharing customer, IP, or device fingerprint."""
    target = db.query(TransactionRecord).filter(TransactionRecord.id == id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Transaction not found")

    query = db.query(TransactionRecord).filter(
        TransactionRecord.id != id,
        or_(
            TransactionRecord.customer_id == target.customer_id,
            TransactionRecord.ip_address == target.ip_address,
            (TransactionRecord.device_fingerprint == target.device_fingerprint) & (TransactionRecord.device_fingerprint != ""),
        )
    ).order_by(TransactionRecord.timestamp.desc()).limit(10)

    related = query.all()
    return [map_to_schema(r) for r in records] if False else [map_to_schema(r) for r in related]


@router.post("/{id}/override", response_model=TransactionOut)
def override_transaction_decision(
    id: str,
    req: TransactionOverrideRequest,
    db: Session = Depends(get_db),
):
    r = db.query(TransactionRecord).filter(TransactionRecord.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Transaction not found")

    old_decision = r.decision
    r.decision = req.decision
    r.status = "MANUALLY_OVERRIDDEN"
    db.commit()
    db.refresh(r)

    # Immutable Audit Log
    record_audit_event(
        db=db,
        officer_id="#CC-8421",
        officer_name="Insp. Vikram Sharma",
        action="TRANSACTION_MANUAL_OVERRIDE",
        entity_type="TRANSACTION",
        entity_id=r.id,
        details=f"Overrode decision from {old_decision} to {req.decision}. Reason: {req.reason}",
    )

    return map_to_schema(r)


@router.post("/evaluate", response_model=EvaluateRiskResponse)
async def evaluate_risk(
    req: EvaluateRiskRequest,
    db: Session = Depends(get_db),
):
    payload = req.model_dump()
    result = await evaluate_transaction_risk(payload)

    # Format response
    shap_items = [ShapItem(**item) for item in result.get("shap_explanation", [])]
    return EvaluateRiskResponse(
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        decision=result["decision"],
        shap_explanation=shap_items,
        anomaly_score=result["anomaly_score"],
        rule_flags=result["rule_flags"],
        model_version=result.get("model_version", "2.0.0"),
        calibrated_probability=result.get("calibrated_probability"),
        risk_band=result.get("risk_band"),
        top_reasons=result.get("top_reasons", []),
        source=result.get("source", "ml_service"),
    )

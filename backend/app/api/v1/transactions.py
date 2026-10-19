from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
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
)
from backend.app.services.scoring import evaluate_transaction_risk
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
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(TransactionRecord)
    if risk_level and risk_level != "ALL":
        query = query.filter(TransactionRecord.risk_level == risk_level)
    records = query.order_by(TransactionRecord.timestamp.desc()).limit(limit).all()
    return [map_to_schema(r) for r in records]


@router.get("/{id}", response_model=TransactionOut)
def get_transaction(id: str, db: Session = Depends(get_db)):
    r = db.query(TransactionRecord).filter(TransactionRecord.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Transaction record not found")
    return map_to_schema(r)


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
        model_version=result.get("model_version", "1.0.0"),
    )

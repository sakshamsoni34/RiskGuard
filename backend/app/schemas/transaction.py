from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime


class ShapItem(BaseModel):
    feature: str
    contribution: float
    direction: str  # "increase" | "decrease"
    rawValue: Any
    description: str


class PaymentMethodSchema(BaseModel):
    type: str = "upi"
    brand: Optional[str] = None
    last4: Optional[str] = None
    upiHandle: Optional[str] = None


class DeviceInfoSchema(BaseModel):
    browser: str = "Chrome Mobile"
    os: str = "Android"
    fingerprintHash: str = ""
    isNewDevice: bool = False
    screenResolution: str = "1080x2400"


class GeoLocationSchema(BaseModel):
    city: str = "Mumbai"
    country: str = "India"
    ipAddress: str = "127.0.0.1"
    isVpnOrProxy: bool = False
    distanceFromHomeKm: float = 0.0


class TransactionVelocitySchema(BaseModel):
    last2MinutesCount: int = 1
    lastHourCount: int = 1
    totalSpentToday: float = 0.0


class TransactionOut(BaseModel):
    id: str
    timestamp: str
    customerId: str
    customerName: str
    customerEmail: str
    customerPhone: str
    amount: float
    currency: str
    merchant: str
    merchantCategory: str
    paymentMethod: PaymentMethodSchema
    device: DeviceInfoSchema
    location: GeoLocationSchema
    velocity: TransactionVelocitySchema
    riskScore: float
    riskLevel: str
    decision: str
    status: str
    shapExplanation: List[ShapItem] = []
    anomalyScore: float = 0.0
    ruleFlags: List[str] = []
    isSynthetic: bool = True


class TransactionOverrideRequest(BaseModel):
    decision: str  # APPROVED, OTP_REQUIRED, BLOCKED
    reason: str


class EvaluateRiskRequest(BaseModel):
    amount: float = Field(..., gt=0)
    currency: str = "INR"
    merchant_category: str
    is_new_device: bool = False
    velocity_2min: int = 1
    is_vpn_proxy: bool = False
    distance_jump_km: float = 0.0
    avg_user_amount: float = Field(5000.0, gt=0)


class EvaluateRiskResponse(BaseModel):
    risk_score: float
    risk_level: str
    decision: str
    shap_explanation: List[ShapItem]
    anomaly_score: float
    rule_flags: List[str]
    model_version: Optional[str] = "1.0.0"

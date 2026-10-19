from typing import List, Literal, Union, Optional
from pydantic import BaseModel, Field

RiskLevel = Literal["LOW", "MEDIUM", "HIGH"]
DecisionAction = Literal["APPROVED", "OTP_REQUIRED", "BLOCKED"]

class TransactionEvaluationRequest(BaseModel):
    amount: float = Field(..., description="Transaction amount in local currency (e.g. INR)", ge=0.0)
    currency: Optional[str] = Field("INR", description="Currency code (e.g. INR, USD)")
    merchant_category: str = Field("Grocery", description="Merchant category (e.g. Electronics, Crypto, Grocery, Travel)")
    is_new_device: bool = Field(False, description="Whether transaction is initiated from a previously unseen hardware/browser fingerprint")
    velocity_2min: int = Field(0, description="Number of transaction attempts in previous 120 seconds", ge=0)
    is_vpn_proxy: bool = Field(False, description="Whether source IP maps to datacenter, VPN, or Tor exit node")
    distance_jump_km: float = Field(0.0, description="Physical distance from user's primary geohash or last transaction in km", ge=0.0)
    avg_user_amount: float = Field(1000.0, description="Customer's habitual average spend baseline", gt=0.0)

    model_config = {
        "json_schema_extra": {
            "example": {
                "amount": 85000.0,
                "currency": "INR",
                "merchant_category": "Electronics",
                "is_new_device": True,
                "velocity_2min": 5,
                "is_vpn_proxy": True,
                "distance_jump_km": 6800.0,
                "avg_user_amount": 1850.0
            }
        }
    }

class ShapValue(BaseModel):
    feature: str
    contribution: float
    direction: Literal["increase", "decrease"]
    rawValue: Union[str, float, int]
    description: str

class RiskEvaluationResponse(BaseModel):
    risk_score: float = Field(..., description="Risk score calibrated from 0 to 100")
    risk_level: RiskLevel = Field(..., description="LOW, MEDIUM, or HIGH risk bucket")
    decision: DecisionAction = Field(..., description="APPROVED, OTP_REQUIRED, or BLOCKED")
    shap_explanation: List[ShapValue] = Field(default_factory=list, description="TreeSHAP local feature attribution factors")
    anomaly_score: float = Field(..., description="Unsupervised Isolation Forest anomaly score (-1 to 1 or normalized 0 to 1)")
    rule_flags: List[str] = Field(default_factory=list, description="Rule-based heuristic trigger alerts")
    # Optional extensions for Phase 4 (backward compatible)
    model_version: Optional[str] = Field("2.0.0", description="Model architecture version")
    calibrated_probability: Optional[float] = Field(None, description="Calibrated posterior fraud probability [0, 1]")
    risk_band: Optional[str] = Field(None, description="Detailed 4-band risk category")
    top_reasons: Optional[List[str]] = Field(default_factory=list, description="Top decision driver bullet points")

class BatchEvaluationRequest(BaseModel):
    transactions: List[TransactionEvaluationRequest] = Field(..., max_length=100)

class BatchEvaluationResponse(BaseModel):
    results: List[RiskEvaluationResponse]
    total_processed: int
    batch_latency_ms: float

class ModelMetricsResponse(BaseModel):
    totalProcessed: int
    fraudBlockedAmount: float
    fraudAttemptCount: int
    otpChallengeCount: int
    autoApprovedCount: int
    precision: float
    recall: float
    f1Score: float
    prAuc: float
    rocAuc: float
    falsePositiveRate: float
    avgLatencyMs: float

class HealthCheckResponse(BaseModel):
    status: str
    service: str
    version: str
    models_loaded: bool

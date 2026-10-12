import os
import time
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import joblib
import shap

from src.config import MODELS_DIR, OTP_THRESHOLD, BLOCK_THRESHOLD, ALL_FEATURE_COLUMNS
from src.schemas import (
    TransactionEvaluationRequest,
    RiskEvaluationResponse,
    ShapValue,
    RiskLevel,
    DecisionAction,
    ModelMetricsResponse,
)
from src.features import extract_features_from_dict, evaluate_heuristics

FEATURE_FRIENDLY_NAMES = {
    "velocity_2min": "Card Velocity Burst",
    "distance_jump_km": "Impossible Travel Geo Hop",
    "amount_ratio": "High Purchase Deviation",
    "amount": "Transaction Magnitude",
    "is_new_device": "Unrecognized Device Fingerprint",
    "is_vpn_proxy": "Anonymized Proxy / VPN",
    "is_high_risk_category": "High-Risk Merchant Sector",
    "amount_log": "Log Amount Scaling",
    "avg_user_amount": "Customer Spend Baseline",
    "amount_diff": "Absolute Deviation from Baseline",
    "cat_Crypto": "Crypto Merchant Category",
    "cat_Electronics": "Electronics Merchant Category",
    "cat_Gaming": "Gaming Merchant Category",
    "cat_Grocery": "Grocery Merchant Category",
    "cat_Jewelry": "Jewelry Merchant Category",
    "cat_Travel": "Travel Merchant Category",
    "cat_Utilities": "Utilities Merchant Category",
}

class RiskEngine:
    _instance: Optional["RiskEngine"] = None

    def __init__(self):
        self.xgb_model = None
        self.iso_forest = None
        self.explainer = None
        self.metrics: Optional[Dict[str, Any]] = None
        self.scale_pos_weight: float = 54.71
        self.is_loaded = False

    @classmethod
    def get_instance(cls) -> "RiskEngine":
        if cls._instance is None:
            cls._instance = RiskEngine()
        return cls._instance

    def load_artifacts(self, force_reload: bool = False):
        if self.is_loaded and not force_reload:
            return

        xgb_path = MODELS_DIR / "xgboost_model.joblib"
        iso_path = MODELS_DIR / "isolation_forest.joblib"
        explainer_path = MODELS_DIR / "shap_explainer.joblib"
        metrics_path = MODELS_DIR / "model_metrics.json"

        if not (xgb_path.exists() and iso_path.exists()):
            raise FileNotFoundError(
                f"Model artifacts not found in {MODELS_DIR}. Run models/train.py first."
            )

        print(f"Loading ML Risk Engine models from {MODELS_DIR}...")
        self.xgb_model = joblib.load(xgb_path)
        self.iso_forest = joblib.load(iso_path)
        self.iso_forest.n_jobs = 1
        
        # Load or re-initialize TreeSHAP explainer
        if explainer_path.exists():
            try:
                self.explainer = joblib.load(explainer_path)
            except Exception:
                self.explainer = shap.TreeExplainer(self.xgb_model)
        else:
            self.explainer = shap.TreeExplainer(self.xgb_model)

        if metrics_path.exists():
            with open(metrics_path, "r") as f:
                self.metrics = json.load(f)
        else:
            self.metrics = {}

        self.is_loaded = True
        print("ML Risk Engine loaded successfully and ready for sub-40ms inference!")

    def evaluate(self, request: TransactionEvaluationRequest) -> RiskEvaluationResponse:
        if not self.is_loaded:
            self.load_artifacts()

        req_dict = request.model_dump()
        
        # 1. Feature Vectorization
        df_feat = extract_features_from_dict(req_dict)
        rule_flags = evaluate_heuristics(req_dict)

        # 2. XGBoost Supervised Inference
        probs = self.xgb_model.predict_proba(df_feat)[0]
        p_raw = float(probs[1])

        # 3. Isolation Forest Unsupervised Outlier Scoring
        # decision_function: positive = inlier/normal, negative = outlier/anomaly
        dec_func = float(self.iso_forest.decision_function(df_feat)[0])
        # Normalize into [0.02, 0.98] anomaly score
        anomaly_score = float(np.clip(0.5 - (dec_func / 0.4), 0.02, 0.98))
        anomaly_score = round(anomaly_score, 3)

        # 4. TreeSHAP Local Feature Attribution
        shap_values = self.explainer.shap_values(df_feat, check_additivity=False)
        if isinstance(shap_values, list):
            raw_contributions = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
        elif hasattr(shap_values, "values"):
            raw_contributions = shap_values.values[0]
        else:
            raw_contributions = shap_values[0]

        # 5. Risk Score Computation & Calibration (0 to 100)
        # Unweight odds to derive true calibrated posterior probability
        odds = (p_raw / max(1e-7, (1.0 - p_raw))) / self.scale_pos_weight
        p_true = odds / (1.0 + odds)

        # Calibrated risk score mapping:
        # p_true ~ 0.0001 -> score ~ 8.0 (LOW / APPROVED)
        # p_true ~ 0.15   -> score ~ 45.0 (MEDIUM / OTP_REQUIRED)
        # p_true ~ 0.95+  -> score ~ 92.0+ (HIGH / BLOCKED)
        calibrated_score = 100.0 * (p_true ** 0.42)

        # Heuristic rules & extreme anomaly fusion
        if "VELOCITY_BURST_CRITICAL" in rule_flags and "NEW_DEVICE_DETECTED" in rule_flags:
            calibrated_score = max(calibrated_score, 88.0)
        elif "IMPOSSIBLE_TRAVEL_EXTREME" in rule_flags and "ANONYMIZED_IP_VPN" in rule_flags:
            calibrated_score = max(calibrated_score, 90.0)
        elif "AMOUNT_DEVIATION_CRITICAL" in rule_flags:
            calibrated_score = max(calibrated_score, 78.0)
        elif anomaly_score > 0.88:
            calibrated_score = max(calibrated_score, 74.0)
        elif anomaly_score > 0.70:
            calibrated_score = max(calibrated_score, 45.0)

        final_risk_score = round(float(np.clip(calibrated_score, 5.0, 99.0)), 1)

        # 6. Determine Risk Level and Decision Action
        if final_risk_score >= BLOCK_THRESHOLD:
            decision: DecisionAction = "BLOCKED"
            risk_level: RiskLevel = "HIGH"
        elif final_risk_score >= OTP_THRESHOLD:
            decision: DecisionAction = "OTP_REQUIRED"
            risk_level: RiskLevel = "MEDIUM"
        else:
            decision: DecisionAction = "APPROVED"
            risk_level: RiskLevel = "LOW"

        # 7. Format Top SHAP Explanations
        shap_items: List[ShapValue] = []
        feature_impacts = list(zip(ALL_FEATURE_COLUMNS, raw_contributions))
        
        # Sort by absolute SHAP contribution descending
        feature_impacts.sort(key=lambda x: abs(x[1]), reverse=True)

        for col_name, contrib in feature_impacts[:4]:
            val = df_feat[col_name].values[0]
            friendly_name = FEATURE_FRIENDLY_NAMES.get(col_name, col_name)
            
            # Format raw value
            if col_name == "velocity_2min":
                raw_str = f"{int(val)} attempts in 2 min"
                desc = "Rapid burst cadence indicating automated card testing or bot script."
            elif col_name == "distance_jump_km":
                raw_str = f"{float(val):,.1f} km hop"
                desc = "Physical hop distance compared to previous confirmed user transaction."
            elif col_name == "amount_ratio":
                raw_str = f"{float(val):.1f}x user baseline"
                desc = "Transaction ticket compared to user's habitual average spend."
            elif col_name == "amount":
                raw_str = f"₹{float(val):,.2f}"
                desc = "Absolute transaction monetary volume."
            elif col_name == "is_new_device":
                raw_str = "New Hardware / Token" if val else "Recognized Device"
                desc = "Hardware signature match against user's authenticated device fleet."
            elif col_name == "is_vpn_proxy":
                raw_str = "Commercial VPN / Proxy" if val else "Clean ISP IP"
                desc = "Network topology analysis against known proxy & Tor exit node lists."
            elif col_name == "is_high_risk_category":
                raw_str = f"{req_dict.get('merchant_category', 'Category')}"
                desc = "Merchant MCC classification vulnerability tier."
            else:
                raw_str = str(val)
                desc = f"Attribution factor for {friendly_name}."

            scaled_contrib = round(float(contrib * 25.0), 1)
            direction = "increase" if scaled_contrib >= 0 else "decrease"
            
            shap_items.append(ShapValue(
                feature=friendly_name,
                contribution=abs(scaled_contrib) if scaled_contrib != 0 else 1.0,
                direction=direction,
                rawValue=raw_str,
                description=desc
            ))

        return RiskEvaluationResponse(
            risk_score=final_risk_score,
            risk_level=risk_level,
            decision=decision,
            shap_explanation=shap_items,
            anomaly_score=anomaly_score,
            rule_flags=rule_flags
        )

    def get_metrics(self) -> Dict[str, Any]:
        if not self.is_loaded:
            self.load_artifacts()
        return self.metrics or {}

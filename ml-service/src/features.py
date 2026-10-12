import math
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from src.config import ALL_FEATURE_COLUMNS

HIGH_RISK_MERCHANTS = {"Crypto", "Electronics", "Gaming", "Jewelry"}
ALL_MERCHANT_CATEGORIES = [
    "Crypto",
    "Electronics",
    "Gaming",
    "Grocery",
    "Jewelry",
    "Travel",
    "Utilities",
]

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in kilometers."""
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def extract_features_from_dict(tx_dict: Dict[str, Any]) -> pd.DataFrame:
    """
    Transforms a single transaction dictionary into a 1-row DataFrame 
    matching ALL_FEATURE_COLUMNS for XGBoost and Isolation Forest inference.
    """
    amount = float(tx_dict.get("amount", 0.0))
    avg_user_amount = float(tx_dict.get("avg_user_amount", 1000.0))
    if avg_user_amount <= 0:
        avg_user_amount = 1.0

    amount_ratio = amount / avg_user_amount
    amount_diff = amount - avg_user_amount
    amount_log = float(np.log1p(max(0.0, amount)))

    velocity_2min = int(tx_dict.get("velocity_2min", 0))
    distance_jump_km = float(tx_dict.get("distance_jump_km", 0.0))
    is_new_device = 1 if bool(tx_dict.get("is_new_device", False)) else 0
    is_vpn_proxy = 1 if bool(tx_dict.get("is_vpn_proxy", False)) else 0

    merchant_category = str(tx_dict.get("merchant_category", "Grocery")).capitalize()
    is_high_risk_category = 1 if merchant_category in HIGH_RISK_MERCHANTS else 0

    # Build row dictionary
    row = {
        "amount": amount,
        "avg_user_amount": avg_user_amount,
        "amount_ratio": amount_ratio,
        "amount_diff": amount_diff,
        "amount_log": amount_log,
        "velocity_2min": velocity_2min,
        "distance_jump_km": distance_jump_km,
        "is_new_device": is_new_device,
        "is_vpn_proxy": is_vpn_proxy,
        "is_high_risk_category": is_high_risk_category,
    }

    # One-hot encoding for merchant categories
    for cat in ALL_MERCHANT_CATEGORIES:
        col_name = f"cat_{cat}"
        row[col_name] = 1 if merchant_category == cat else 0

    df_features = pd.DataFrame([row])
    # Ensure correct column ordering
    return df_features[ALL_FEATURE_COLUMNS]

def extract_features_from_df(df: pd.DataFrame) -> pd.DataFrame:
    """
    Feature engineering on full DataFrame for training pipeline.
    """
    df_feat = pd.DataFrame()
    df_feat["amount"] = df["amount"].astype(float)
    df_feat["avg_user_amount"] = df["avg_user_amount"].astype(float).clip(lower=1.0)
    df_feat["amount_ratio"] = df_feat["amount"] / df_feat["avg_user_amount"]
    df_feat["amount_diff"] = df_feat["amount"] - df_feat["avg_user_amount"]
    df_feat["amount_log"] = np.log1p(np.maximum(0.0, df_feat["amount"]))
    df_feat["velocity_2min"] = df["velocity_2min"].astype(int)
    df_feat["distance_jump_km"] = df["distance_jump_km"].astype(float)
    df_feat["is_new_device"] = df["is_new_device"].astype(int)
    df_feat["is_vpn_proxy"] = df["is_vpn_proxy"].astype(int)
    
    cats = df["merchant_category"].astype(str).str.capitalize()
    df_feat["is_high_risk_category"] = cats.apply(lambda x: 1 if x in HIGH_RISK_MERCHANTS else 0)

    for cat in ALL_MERCHANT_CATEGORIES:
        col_name = f"cat_{cat}"
        df_feat[col_name] = (cats == cat).astype(int)

    return df_feat[ALL_FEATURE_COLUMNS]

def evaluate_heuristics(tx_dict: Dict[str, Any]) -> List[str]:
    """
    Identifies deterministic rule triggers for audit ledger and explainability.
    """
    flags: List[str] = []
    amount = float(tx_dict.get("amount", 0.0))
    avg_user = float(tx_dict.get("avg_user_amount", 1000.0))
    ratio = amount / max(1.0, avg_user)
    velocity = int(tx_dict.get("velocity_2min", 0))
    dist = float(tx_dict.get("distance_jump_km", 0.0))
    new_device = bool(tx_dict.get("is_new_device", False))
    vpn = bool(tx_dict.get("is_vpn_proxy", False))
    cat = str(tx_dict.get("merchant_category", ""))

    if velocity >= 4:
        flags.append("VELOCITY_BURST_CRITICAL")
    elif velocity >= 2:
        flags.append("VELOCITY_ELEVATED")

    if dist >= 1500:
        flags.append("IMPOSSIBLE_TRAVEL_EXTREME")
    elif dist >= 500:
        flags.append("GEO_DISTANCE_ANOMALOUS")

    if ratio >= 6.0 and amount >= 20000:
        flags.append("AMOUNT_DEVIATION_CRITICAL")
    elif ratio >= 3.0:
        flags.append("AMOUNT_DEVIATION_HIGH")

    if vpn:
        flags.append("ANONYMIZED_IP_VPN")
    if new_device:
        flags.append("NEW_DEVICE_DETECTED")
    if cat in HIGH_RISK_MERCHANTS:
        flags.append("HIGH_RISK_MERCHANT_SECTOR")

    return flags

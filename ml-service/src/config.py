import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

MODELS_DIR = BASE_DIR / "models" / "artifacts"
DATA_DIR = BASE_DIR / "data"

# Risk threshold cutoffs (calibrated for business risk & cost optimization)
OTP_THRESHOLD = 35.0
BLOCK_THRESHOLD = 70.0

# Server configurations
HOST = "0.0.0.0"
PORT = 8000

# Feature columns order for reproducible inference
CATEGORICAL_FEATURES = ["merchant_category"]
NUMERICAL_FEATURES = [
    "amount",
    "avg_user_amount",
    "amount_ratio",
    "amount_diff",
    "amount_log",
    "velocity_2min",
    "distance_jump_km",
    "is_new_device",
    "is_vpn_proxy",
    "is_high_risk_category",
]

ALL_FEATURE_COLUMNS = [
    "amount",
    "avg_user_amount",
    "amount_ratio",
    "amount_diff",
    "amount_log",
    "velocity_2min",
    "distance_jump_km",
    "is_new_device",
    "is_vpn_proxy",
    "is_high_risk_category",
    # One-hot encoded category columns
    "cat_Crypto",
    "cat_Electronics",
    "cat_Gaming",
    "cat_Grocery",
    "cat_Jewelry",
    "cat_Travel",
    "cat_Utilities",
]

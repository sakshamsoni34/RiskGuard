"""
RiskGuard Synthetic Dataset Generator
Generates realistic Indian banking/e-commerce transaction data with realistic class imbalance (~1.8% fraud)
and complex multi-vector fraud attacks (velocity bursts, impossible travel, high purchase deviation, VPN/proxy).
"""

import os
import random
import numpy as np
import pandas as pd

MERCHANT_CATEGORIES = [
    "Electronics",
    "Jewelry",
    "Grocery",
    "Travel",
    "Gaming",
    "Crypto",
    "Utilities",
]

HIGH_RISK_MERCHANTS = {"Crypto", "Electronics", "Gaming", "Jewelry"}

def generate_transaction_dataset(num_samples: int = 25000, fraud_ratio: float = 0.018, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)
    random.seed(seed)

    num_fraud = int(num_samples * fraud_ratio)
    num_legit = num_samples - num_fraud

    records = []

    # 1. Legitimate transactions (~98.2%)
    for _ in range(num_legit):
        # Habitual average ticket for an Indian user (e.g., ₹500 to ₹15,000)
        avg_user_amount = float(np.random.choice([
            np.random.uniform(300, 2500),    # Daily spenders (groceries, food, travel)
            np.random.uniform(2500, 8000),   # Moderate spenders
            np.random.uniform(8000, 20000),  # Affluent spenders
        ], p=[0.60, 0.30, 0.10]))

        # Normal spend deviation around baseline (mostly 0.4x to 1.8x)
        ratio_multiplier = np.random.lognormal(mean=0.0, sigma=0.35)
        # bound legitimate ratio realistically
        ratio_multiplier = float(np.clip(ratio_multiplier, 0.15, 3.2))
        amount = round(avg_user_amount * ratio_multiplier, 2)

        # Category distribution
        category = np.random.choice(
            MERCHANT_CATEGORIES,
            p=[0.12, 0.04, 0.38, 0.14, 0.06, 0.02, 0.24]  # High grocery/utilities, low crypto
        )

        # Known device (95% known, 5% new legitimate device upgrade)
        is_new_device = 1 if np.random.random() < 0.05 else 0

        # Normal velocity (mostly 0, occasionally 1 in 2 minutes)
        velocity_2min = int(np.random.choice([0, 1, 2], p=[0.88, 0.10, 0.02]))

        # VPN/Proxy (rare for legit, ~3%)
        is_vpn_proxy = 1 if np.random.random() < 0.03 else 0

        # Geolocation hop (almost all local < 25 km, rarely domestic commute/flight < 800 km)
        distance_jump_km = float(np.random.choice([
            np.random.exponential(scale=3.0),      # At home / office (0 - 15 km)
            np.random.uniform(20, 250),            # Inter-city commute
            np.random.uniform(250, 950),           # Domestic flight
        ], p=[0.92, 0.06, 0.02]))
        distance_jump_km = round(float(np.clip(distance_jump_km, 0.0, 1200.0)), 2)

        records.append({
            "amount": amount,
            "currency": "INR",
            "merchant_category": category,
            "is_new_device": is_new_device,
            "velocity_2min": velocity_2min,
            "is_vpn_proxy": is_vpn_proxy,
            "distance_jump_km": distance_jump_km,
            "avg_user_amount": round(avg_user_amount, 2),
            "is_fraud": 0,
        })

    # 2. Fraudulent transactions (~1.8%)
    # Synthetic fraud vectors:
    # A) Velocity Burst + ATO (Account Takeover)
    # B) Impossible Travel (Lagos/Moscow geo-hop)
    # C) High Purchase Deviation (e.g. ₹85,000 electronics/crypto)
    # D) Stealthy Low-ticket Card Testing (micro-probing on VPN)
    for _ in range(num_fraud):
        fraud_vector = np.random.choice(["velocity_burst", "impossible_travel", "high_ticket_deviation", "stealth_vpn"], p=[0.35, 0.30, 0.25, 0.10])
        
        avg_user_amount = float(np.random.uniform(800, 6000))
        is_new_device = 1 if np.random.random() < 0.88 else 0

        if fraud_vector == "velocity_burst":
            # 3 to 7 transactions in 2 minutes
            velocity_2min = int(np.random.randint(3, 8))
            amount = round(float(np.random.uniform(15000, 95000)), 2)
            category = np.random.choice(["Electronics", "Gaming", "Crypto", "Jewelry"])
            is_vpn_proxy = 1 if np.random.random() < 0.75 else 0
            distance_jump_km = round(float(np.random.uniform(40, 1500)), 2)

        elif fraud_vector == "impossible_travel":
            # Physical hop > 1500 km up to 9000 km (e.g. Mumbai -> Lagos/Eastern Europe)
            velocity_2min = int(np.random.choice([1, 2, 3, 4], p=[0.3, 0.4, 0.2, 0.1]))
            amount = round(float(np.random.uniform(22000, 120000)), 2)
            category = np.random.choice(["Travel", "Electronics", "Crypto", "Jewelry"])
            is_vpn_proxy = 1 if np.random.random() < 0.85 else 0
            distance_jump_km = round(float(np.random.uniform(1500, 8500)), 2)

        elif fraud_vector == "high_ticket_deviation":
            # 6x - 25x average ticket on electronics or jewelry
            deviation_mult = float(np.random.uniform(6.0, 25.0))
            amount = round(avg_user_amount * deviation_mult, 2)
            velocity_2min = int(np.random.randint(1, 4))
            category = np.random.choice(["Electronics", "Jewelry", "Crypto"])
            is_vpn_proxy = 1 if np.random.random() < 0.65 else 0
            distance_jump_km = round(float(np.random.uniform(15, 600)), 2)

        else: # stealth_vpn card test
            amount = round(float(np.random.uniform(4999, 18000)), 2)
            velocity_2min = int(np.random.randint(2, 5))
            category = np.random.choice(["Gaming", "Crypto", "Electronics"])
            is_vpn_proxy = 1
            distance_jump_km = round(float(np.random.uniform(500, 4000)), 2)

        records.append({
            "amount": amount,
            "currency": "INR",
            "merchant_category": category,
            "is_new_device": is_new_device,
            "velocity_2min": velocity_2min,
            "is_vpn_proxy": is_vpn_proxy,
            "distance_jump_km": distance_jump_km,
            "avg_user_amount": round(avg_user_amount, 2),
            "is_fraud": 1,
        })

    # Shuffle dataset
    df = pd.DataFrame(records)
    df = df.sample(frac=1.0, random_state=seed).reset_index(drop=True)
    return df

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    
    csv_path = os.path.join(data_dir, "transactions.csv")
    print(f"Generating 25,000 transactions dataset at: {csv_path}")
    df = generate_transaction_dataset(num_samples=25000, fraud_ratio=0.018, seed=42)
    df.to_csv(csv_path, index=False)
    
    fraud_count = df["is_fraud"].sum()
    total_count = len(df)
    fraud_pct = (fraud_count / total_count) * 100
    print(f"Dataset generated successfully!")
    print(f"Total transactions: {total_count}")
    print(f"Fraudulent transactions: {fraud_count} ({fraud_pct:.2f}%)")
    print(f"Legitimate transactions: {total_count - fraud_count} ({100 - fraud_pct:.2f}%)")

if __name__ == "__main__":
    main()

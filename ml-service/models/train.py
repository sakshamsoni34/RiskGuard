"""
RiskGuard ML Model Training Pipeline
Optimized for high-throughput sub-15ms inference budget:
1. Supervised XGBoost Classifier with class-imbalance weighting (scale_pos_weight)
2. Unsupervised Isolation Forest for zero-day out-of-distribution anomaly detection
3. Evaluates PR-AUC, ROC-AUC, precision, recall, and false positive rate
4. Serializes models and benchmark metrics for production FastAPI inference
"""

import os
import sys
import json
import time
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report
)
from sklearn.ensemble import IsolationForest
import xgboost as xgb
import shap

# Ensure ml-service root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from src.config import ALL_FEATURE_COLUMNS, OTP_THRESHOLD, BLOCK_THRESHOLD
from src.features import extract_features_from_df
from data.generate_dataset import generate_transaction_dataset

def run_training_pipeline():
    artifacts_dir = BASE_DIR / "models" / "artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    data_dir = BASE_DIR / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    csv_path = data_dir / "transactions.csv"
    if not csv_path.exists():
        print(f"Dataset not found at {csv_path}. Generating 25,000 transactions...")
        df_raw = generate_transaction_dataset(num_samples=25000, fraud_ratio=0.018, seed=42)
        df_raw.to_csv(csv_path, index=False)
    else:
        print(f"Loading existing transactions from {csv_path}...")
        df_raw = pd.read_csv(csv_path)

    print(f"Dataset loaded: {len(df_raw)} records")
    total_fraud = int(df_raw["is_fraud"].sum())
    total_legit = len(df_raw) - total_fraud
    print(f"Class distribution: {total_legit} Legit ({total_legit/len(df_raw)*100:.2f}%), {total_fraud} Fraud ({total_fraud/len(df_raw)*100:.2f}%)")

    # 1. Feature Engineering
    print("Extracting engineered feature tensor...")
    X = extract_features_from_df(df_raw)
    y = df_raw["is_fraud"].values

    # 2. Stratified Train/Test Split (80/20)
    X_train, X_test, y_train, y_test, df_train, df_test = train_test_split(
        X, y, df_raw, test_size=0.20, random_state=42, stratify=y
    )

    print(f"Train samples: {len(X_train)} ({int(sum(y_train))} fraud)")
    print(f"Test samples:  {len(X_test)} ({int(sum(y_test))} fraud)")

    # 3. Handle Severe Class Imbalance with scale_pos_weight
    neg_count = sum(y_train == 0)
    pos_count = sum(y_train == 1)
    scale_pos_weight = neg_count / max(1, pos_count)
    print(f"Calculated scale_pos_weight: {scale_pos_weight:.2f}")

    # 4. Train Supervised XGBoost Classifier (Optimized 85 trees, max_depth 4, n_jobs=1 for low latency)
    print("\nTraining XGBoost Classifier...")
    start_train_time = time.time()
    xgb_model = xgb.XGBClassifier(
        n_estimators=85,
        max_depth=4,
        learning_rate=0.08,
        scale_pos_weight=scale_pos_weight,
        subsample=0.85,
        colsample_bytree=0.85,
        gamma=1.0,
        min_child_weight=2,
        eval_metric="logloss",
        random_state=42,
        n_jobs=1
    )

    xgb_model.fit(
        X_train,
        y_train,
        eval_set=[(X_train, y_train), (X_test, y_test)],
        verbose=False
    )
    train_duration = time.time() - start_train_time
    print(f"XGBoost training complete in {train_duration:.2f}s")

    # 5. Evaluate on Test Set
    test_probs = xgb_model.predict_proba(X_test)[:, 1]
    
    # Decision threshold logic:
    # Odds unweighting
    odds = (test_probs / np.maximum(1e-7, (1.0 - test_probs))) / scale_pos_weight
    p_true = odds / (1.0 + odds)
    test_risk_scores = 100.0 * (p_true ** 0.42)

    y_pred_binary = (test_risk_scores >= OTP_THRESHOLD).astype(int)

    precision = float(precision_score(y_test, y_pred_binary, zero_division=0))
    recall = float(recall_score(y_test, y_pred_binary, zero_division=0))
    f1 = float(f1_score(y_test, y_pred_binary, zero_division=0))
    pr_auc = float(average_precision_score(y_test, test_probs))
    roc_auc = float(roc_auc_score(y_test, test_probs))

    cm = confusion_matrix(y_test, y_pred_binary)
    tn, fp, fn, tp = cm.ravel()
    fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0

    print("\n--- Model Evaluation Results (Test Set) ---")
    print(f"PR-AUC (Precision-Recall Area): {pr_auc:.4f}")
    print(f"ROC-AUC:                         {roc_auc:.4f}")
    print(f"Precision (@ risk_score >= 35): {precision:.4f}")
    print(f"Recall    (@ risk_score >= 35): {recall:.4f}")
    print(f"F1-Score:                        {f1:.4f}")
    print(f"False Positive Rate:             {fpr:.4f}")
    print(f"Confusion Matrix:\n  TN={tn}, FP={fp}\n  FN={fn}, TP={tp}")

    # 6. Train Unsupervised Isolation Forest (60 trees, n_jobs=1)
    print("\nTraining Unsupervised Isolation Forest...")
    iso_forest = IsolationForest(
        n_estimators=60,
        contamination=0.02,
        max_samples="auto",
        random_state=42,
        n_jobs=1
    )
    iso_forest.fit(X_train)
    print("Isolation Forest trained successfully.")

    # 7. Initialize TreeSHAP Explainer
    print("\nInitializing TreeSHAP Explainer...")
    explainer = shap.TreeExplainer(xgb_model)
    
    # Warm-up and test latency
    sample_feat = X_test.iloc[0:1]
    _ = xgb_model.predict_proba(sample_feat)
    _ = explainer.shap_values(sample_feat, check_additivity=False)
    
    latencies = []
    for _ in range(50):
        t0 = time.perf_counter()
        _ = xgb_model.predict_proba(sample_feat)
        _ = iso_forest.decision_function(sample_feat)
        _ = explainer.shap_values(sample_feat, check_additivity=False)
        latencies.append((time.perf_counter() - t0) * 1000)
    latencies.sort()
    sample_latency_ms = latencies[25] # P50
    print(f"Sample Single Inference + TreeSHAP Latency (P50): {sample_latency_ms:.2f} ms (<40ms target)")

    # 8. Save Model Artifacts
    print(f"\nSaving model binaries to {artifacts_dir}...")
    xgb_model_path = artifacts_dir / "xgboost_model.joblib"
    xgb_json_path = artifacts_dir / "xgboost_model.json"
    iso_forest_path = artifacts_dir / "isolation_forest.joblib"
    explainer_path = artifacts_dir / "shap_explainer.joblib"

    joblib.dump(xgb_model, xgb_model_path)
    xgb_model.save_model(str(xgb_json_path))
    joblib.dump(iso_forest, iso_forest_path)
    joblib.dump(explainer, explainer_path)

    # 9. Compute Overall Dashboard Metrics across entire dataset for live frontend
    full_probs = xgb_model.predict_proba(X)[:, 1]
    full_odds = (full_probs / np.maximum(1e-7, (1.0 - full_probs))) / scale_pos_weight
    full_p_true = full_odds / (1.0 + full_odds)
    full_risk_scores = 100.0 * (full_p_true ** 0.42)

    auto_approved = int((full_risk_scores < OTP_THRESHOLD).sum())
    otp_challenges = int(((full_risk_scores >= OTP_THRESHOLD) & (full_risk_scores < BLOCK_THRESHOLD)).sum())
    blocked_count = int((full_risk_scores >= BLOCK_THRESHOLD).sum())
    
    fraud_blocked_mask = (full_risk_scores >= BLOCK_THRESHOLD) & (y == 1)
    fraud_blocked_amt = float(df_raw.loc[fraud_blocked_mask, "amount"].sum())

    metrics_payload = {
        "totalProcessed": len(df_raw),
        "fraudBlockedAmount": round(fraud_blocked_amt, 2),
        "fraudAttemptCount": int(total_fraud),
        "otpChallengeCount": otp_challenges,
        "autoApprovedCount": auto_approved,
        "blockedCount": blocked_count,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1Score": round(f1, 4),
        "prAuc": round(pr_auc, 4),
        "rocAuc": round(roc_auc, 4),
        "falsePositiveRate": round(fpr, 4),
        "avgLatencyMs": round(sample_latency_ms, 2),
        "featureColumns": ALL_FEATURE_COLUMNS,
        "otpThreshold": OTP_THRESHOLD,
        "blockThreshold": BLOCK_THRESHOLD,
    }

    metrics_file = artifacts_dir / "model_metrics.json"
    with open(metrics_file, "w") as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"Metrics saved to {metrics_file}")
    print("Training pipeline finished successfully!")

if __name__ == "__main__":
    run_training_pipeline()

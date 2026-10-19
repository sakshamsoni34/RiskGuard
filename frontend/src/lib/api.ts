import { Transaction, DecisionAction, SimulationParams } from "@/types/fraud";
import { calculateRisk } from "./scoringEngine";

/**
 * Production API Gateway and FastAPI ML Service Client
 * Supports seamless switching between Simulation Engine (offline demo)
 * and Live Containerized Microservices (FastAPI on :8000 & Express on :5000).
 */

export interface ApiConfig {
  baseUrl: string;
  useLiveBackend: boolean;
}

export const defaultApiConfig: ApiConfig = {
  baseUrl: "/api/v1",
  useLiveBackend: true,
};

/**
 * Evaluate risk for an incoming transaction
 */
export async function evaluateRisk(
  params: SimulationParams,
  config: ApiConfig = defaultApiConfig
): Promise<ReturnType<typeof calculateRisk>> {
  if (!config.useLiveBackend) {
    return calculateRisk(params);
  }

  try {
    const res = await fetch(`${config.baseUrl}/transactions/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency,
        merchant_category: params.merchantCategory,
        is_new_device: params.isNewDevice,
        velocity_2min: params.velocityLast2Min,
        is_vpn_proxy: params.isVpnOrProxy,
        distance_jump_km: params.distanceJumpKm,
        avg_user_amount: params.avgUserAmount,
      }),
    });

    if (!res.ok) {
      throw new Error(`Scoring engine returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      riskScore: data.risk_score,
      riskLevel: data.risk_level,
      decision: data.decision,
      shapExplanation: data.shap_explanation,
      anomalyScore: data.anomaly_score,
      ruleFlags: data.rule_flags || [],
    };
  } catch (err) {
    console.warn("Live backend unavailable; falling back to local simulation:", err);
    return calculateRisk(params);
  }
}

/**
 * Send manual analyst decision override to audit ledger
 */
export async function recordAnalystOverride(
  transactionId: string,
  newDecision: DecisionAction,
  analystNotes?: string,
  config: ApiConfig = defaultApiConfig
): Promise<boolean> {
  if (!config.useLiveBackend) {
    return true;
  }

  try {
    const res = await fetch(`${config.baseUrl}/transactions/${transactionId}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision: newDecision,
        reason: analystNotes || "Manual officer override",
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn("Backend unreachable for override record:", err);
    return false;
  }
}

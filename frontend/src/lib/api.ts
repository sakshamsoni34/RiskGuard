import { Transaction, DecisionAction, SimulationParams } from "@/types/fraud";
import { calculateRisk } from "./scoringEngine";

/**
 * Production API Gateway and FastAPI ML Service Client
 * Supports seamless switching between Simulation Engine (offline demo)
 * and Live Containerized Microservices (FastAPI on :8000 & Express on :5000).
 */

export interface ApiConfig {
  mlServiceUrl: string;
  gatewayUrl: string;
  useLiveBackend: boolean;
}

export const defaultApiConfig: ApiConfig = {
  mlServiceUrl: process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://localhost:8000",
  gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:5000",
  useLiveBackend: true, // connected to live FastAPI ML engine on :8000
};

/**
 * Evaluate risk for an incoming transaction
 */
export async function evaluateRisk(
  params: SimulationParams,
  config: ApiConfig = defaultApiConfig
): Promise<ReturnType<typeof calculateRisk>> {
  if (!config.useLiveBackend) {
    // High-performance client-side inference simulation
    return calculateRisk(params);
  }

  try {
    const res = await fetch(`${config.mlServiceUrl}/v1/risk/evaluate`, {
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
      throw new Error(`ML engine returned HTTP ${res.status}`);
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
    console.warn("Live FastAPI service unavailable; falling back to local ML engine simulation:", err);
    return calculateRisk(params);
  }
}

/**
 * Send manual analyst decision override to audit ledger (PostgreSQL)
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
    const res = await fetch(`${config.gatewayUrl}/api/v1/transactions/${transactionId}/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision: newDecision,
        analyst_notes: analystNotes,
        timestamp: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn("API Gateway unreachable for override record:", err);
    return false;
  }
}

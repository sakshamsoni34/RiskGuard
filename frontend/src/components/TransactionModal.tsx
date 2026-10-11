"use client";

import React, { useState } from "react";
import { Transaction } from "@/types/fraud";
import {
  X,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  Smartphone,
  MapPin,
  Clock,
  Activity,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onUpdateStatus: (txnId: string, newAction: Transaction["decision"]) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  onClose,
  onUpdateStatus,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!transaction) return null;

  const isHigh = transaction.riskLevel === "HIGH";
  const isMedium = transaction.riskLevel === "MEDIUM";

  const handleAction = (action: Transaction["decision"], label: string) => {
    onUpdateStatus(transaction.id, action);
    setToastMessage(`Action Applied: ${label}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0e1424] shadow-2xl z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                isHigh
                  ? "bg-rose-950/60 border-rose-500/40 text-rose-400 glow-rose"
                  : isMedium
                  ? "bg-amber-950/60 border-amber-500/40 text-amber-400 glow-amber"
                  : "bg-emerald-950/60 border-emerald-500/40 text-emerald-400 glow-emerald"
              }`}
            >
              {isHigh ? (
                <ShieldAlert className="h-6 w-6" />
              ) : isMedium ? (
                <KeyRound className="h-6 w-6" />
              ) : (
                <ShieldCheck className="h-6 w-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-mono">{transaction.id}</h3>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300 font-mono">
                  {transaction.timestamp}
                </span>
                <span
                  className={`rounded-md px-2.5 py-0.5 text-xs font-bold border ${
                    isHigh
                      ? "bg-rose-950/80 text-rose-300 border-rose-700/50"
                      : isMedium
                      ? "bg-amber-950/80 text-amber-300 border-amber-700/50"
                      : "bg-emerald-950/80 text-emerald-300 border-emerald-700/50"
                  }`}
                >
                  {transaction.decision}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Customer: <span className="text-slate-200 font-medium">{transaction.customerName}</span> ({transaction.customerId}) • {transaction.merchant}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/80 px-4 py-2.5 text-xs font-semibold text-emerald-200 flex items-center gap-2 shadow-lg animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {toastMessage}
            </div>
          )}

          {/* Top Overview: Risk Score & Decision Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Score Gauge Card */}
            <div
              className={`rounded-xl border p-4 flex flex-col justify-between ${
                isHigh
                  ? "bg-rose-950/20 border-rose-500/30 glow-rose"
                  : isMedium
                  ? "bg-amber-950/20 border-amber-500/30 glow-amber"
                  : "bg-emerald-950/20 border-emerald-500/30 glow-emerald"
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>ML Risk Score</span>
                <span className="font-mono text-[11px] text-slate-500">XGBoost v2.4</span>
              </div>

              <div className="my-3 flex items-baseline gap-2">
                <span
                  className={`text-4xl font-extrabold font-mono ${
                    isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {transaction.riskScore}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>

              <div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${
                      isHigh ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${transaction.riskScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 (Safe)</span>
                  <span>35 (OTP Threshold)</span>
                  <span>70 (Block)</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            {/* Decision Rule Tier */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Classification Tier
              </div>
              <div className="my-2">
                <div
                  className={`text-lg font-bold ${
                    isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {transaction.riskLevel} RISK TIER
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {isHigh
                    ? "Exceeds 70 risk cutoff. Immediate block enacted to prevent irreversible financial loss."
                    : isMedium
                    ? "Falls in 35-70 intermediate band. Step-up OTP verification challenge issued to user."
                    : "Below 35 threshold. Transaction classified as genuine; automatic low-friction approval."}
                </p>
              </div>
              <div className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/50 rounded px-2 py-1">
                Anomaly Score: {(transaction.anomalyScore * 100).toFixed(0)}% (Isolation Forest)
              </div>
            </div>

            {/* Financial Details */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Transaction Profile
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono text-white">
                  ₹{transaction.amount.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Merchant: <span className="text-slate-200 font-medium">{transaction.merchant}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Category: <span className="text-indigo-400 font-medium">{transaction.merchantCategory}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex justify-between">
                <span>Daily Velocity:</span>
                <span className="font-mono text-slate-200">
                  {transaction.velocity.lastHourCount} tx / hr (₹{transaction.velocity.totalSpentToday.toLocaleString("en-IN")})
                </span>
              </div>
            </div>
          </div>

          {/* SHAP Explainability Breakdown (Core requirement from abstract) */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white tracking-wide">
                  SHAP (SHapley Additive exPlanations) Feature Attribution
                </h4>
              </div>
              <span className="rounded bg-indigo-950/80 border border-indigo-800/60 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                Model Interpretability & Compliance
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              TreeSHAP calculates the exact marginal contribution of each signal pushing the model decision up (red risk drivers) or down (green trust anchors) from baseline.
            </p>

            <div className="space-y-3">
              {transaction.shapExplanation.map((shap, idx) => {
                const isIncrease = shap.direction === "increase";
                const absContrib = Math.abs(shap.contribution);

                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-800/80 bg-slate-900/80 p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isIncrease ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-rose-500/20 text-rose-400">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/20 text-emerald-400">
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-200">{shap.feature}</span>
                        <span className="text-[11px] font-mono text-slate-400">({shap.rawValue})</span>
                      </div>

                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          isIncrease
                            ? "bg-rose-950 text-rose-400 border border-rose-800/40"
                            : "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                        }`}
                      >
                        {isIncrease ? `+${shap.contribution}` : shap.contribution} pts
                      </span>
                    </div>

                    {/* Visual Bar representation */}
                    <div className="w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isIncrease ? "bg-rose-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(100, absContrib * 2.8)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400">{shap.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Signal Dossier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Device & Hardware Fingerprint */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Smartphone className="h-4 w-4 text-cyan-400" />
                <span>Hardware & Fingerprint Signals</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Browser Client:</span>
                  <span className="font-mono text-slate-200">{transaction.device.browser}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Operating System:</span>
                  <span className="font-mono text-slate-200">{transaction.device.os}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Fingerprint Hash:</span>
                  <span className="font-mono text-cyan-400">{transaction.device.fingerprintHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Device Familiarity:</span>
                  <span
                    className={`font-semibold ${
                      transaction.device.isNewDevice ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {transaction.device.isNewDevice ? "New Device (No Prior History)" : "Verified Trusted Device"}
                  </span>
                </div>
              </div>
            </div>

            {/* Geolocation & Network */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>Network & Geolocation Signals</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Coordinates Origin:</span>
                  <span className="font-semibold text-slate-200">
                    {transaction.location.city}, {transaction.location.country}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">IP Address:</span>
                  <span className="font-mono text-slate-300">{transaction.location.ipAddress}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Proxy / VPN Cloaking:</span>
                  <span
                    className={`font-semibold ${
                      transaction.location.isVpnOrProxy ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {transaction.location.isVpnOrProxy ? "Detected (High Anomaly)" : "Clean Domestic ISP"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Distance from Habitual Area:</span>
                  <span
                    className={`font-mono font-semibold ${
                      transaction.location.distanceFromHomeKm > 500 ? "text-rose-400" : "text-slate-200"
                    }`}
                  >
                    {transaction.location.distanceFromHomeKm} km
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar for Risk Analysts */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-4 gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-slate-500" />
            <span>Analyst Authority Actions</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleAction("APPROVED", "Manual Override Approved")}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-600/40 bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-500 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              Override Approve
            </button>

            <button
              onClick={() => handleAction("OTP_REQUIRED", "OTP Challenge Dispatched")}
              className="flex items-center gap-1.5 rounded-lg border border-amber-600/40 bg-amber-950/60 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-900/60 hover:border-amber-500 transition-colors"
            >
              <KeyRound className="h-4 w-4" />
              Trigger OTP Challenge
            </button>

            <button
              onClick={() => handleAction("BLOCKED", "Fraud Confirmed & Device Blacklisted")}
              className="flex items-center gap-1.5 rounded-lg border border-rose-600/40 bg-rose-950/60 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/60 hover:border-rose-500 transition-colors"
            >
              <ShieldAlert className="h-4 w-4" />
              Confirm Fraud Block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

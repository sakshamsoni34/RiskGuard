"use client";

import React, { useState } from "react";
import { Transaction } from "@/types/fraud";
import {
  X,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  ArrowUpRight,
  ArrowDownRight,
  Smartphone,
  MapPin,
  Clock,
  CheckCircle2,
  Lock,
  CreditCard,
  User,
  Check,
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
    setToastMessage(`Decision updated: ${label}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-xl border border-slate-800 bg-[#0c1322] shadow-2xl z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                isHigh
                  ? "bg-rose-950/60 border-rose-800/50 text-rose-400"
                  : isMedium
                  ? "bg-amber-950/60 border-amber-800/50 text-amber-400"
                  : "bg-emerald-950/60 border-emerald-800/50 text-emerald-400"
              }`}
            >
              {isHigh ? (
                <ShieldAlert className="h-5 w-5" />
              ) : isMedium ? (
                <KeyRound className="h-5 w-5" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">{transaction.id}</h3>
                <span className="text-xs text-slate-400 font-mono">
                  {transaction.timestamp}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-semibold border ${
                    isHigh
                      ? "bg-rose-950/80 text-rose-300 border-rose-800/40"
                      : isMedium
                      ? "bg-amber-950/80 text-amber-300 border-amber-800/40"
                      : "bg-emerald-950/80 text-emerald-300 border-emerald-800/40"
                  }`}
                >
                  {transaction.decision === "BLOCKED" ? "Blocked" : transaction.decision === "OTP_REQUIRED" ? "3DS Review" : "Allowed"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Customer: <span className="text-slate-200 font-medium">{transaction.customerName}</span> ({transaction.customerEmail})
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
            <div className="rounded-lg border border-emerald-700/50 bg-emerald-950/80 px-4 py-2.5 text-xs font-medium text-emerald-200 flex items-center gap-2 shadow-lg animate-fade-in">
              <Check className="h-4 w-4 text-emerald-400" />
              {toastMessage}
            </div>
          )}

          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Score Gauge Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
              <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>Risk Score</span>
                <span className="font-mono text-[11px] text-slate-500">XGBoost Model</span>
              </div>

              <div className="my-3 flex items-baseline gap-2">
                <span
                  className={`text-4xl font-bold font-mono ${
                    isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {transaction.riskScore}
                </span>
                <span className="text-sm font-medium text-slate-500">/ 100</span>
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
                  <span>0 (Normal)</span>
                  <span>35 (3DS)</span>
                  <span>70 (Block)</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            {/* 2. Classification Tier */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
              <div className="text-xs font-medium text-slate-400">
                Decision Policy
              </div>
              <div className="my-2">
                <div
                  className={`text-base font-semibold ${
                    isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {transaction.riskLevel} Risk Tier
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {isHigh
                    ? "Score exceeds 70 threshold. Automatic block enacted to safeguard against unauthorized transfer."
                    : isMedium
                    ? "Falls in 35–70 band. 3DS OTP challenge issued to cardholder."
                    : "Score below 35 cutoff. Automatically allowed with zero customer friction."}
                </p>
              </div>
              <div className="text-[11px] font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-800/40 rounded px-2 py-1">
                Anomaly Rating: {(transaction.anomalyScore * 100).toFixed(0)}% (Isolation Forest)
              </div>
            </div>

            {/* 3. Payment Details */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
              <div className="text-xs font-medium text-slate-400">
                Payment Profile
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono text-white">
                  ₹{transaction.amount.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Merchant: <span className="text-slate-200 font-medium">{transaction.merchant}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Payment: <span className="text-slate-200 font-medium">
                    {transaction.paymentMethod.type === "card" && `${transaction.paymentMethod.brand} •••• ${transaction.paymentMethod.last4}`}
                    {transaction.paymentMethod.type === "upi" && transaction.paymentMethod.upiHandle}
                    {transaction.paymentMethod.type === "netbanking" && transaction.paymentMethod.bankName}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex justify-between">
                <span>Recent Velocity</span>
                <span className="font-mono text-slate-200">{transaction.velocity.lastHourCount} tx in last hour</span>
              </div>
            </div>
          </div>

          {/* Feature Attribution (Explainability) */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Risk Signals & Attribution
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Breakdown of factors contributing to the machine learning decision
                </p>
              </div>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                TreeSHAP Weights
              </span>
            </div>

            <div className="space-y-2.5">
              {transaction.shapExplanation.map((shap, idx) => {
                const isIncrease = shap.direction === "increase";
                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isIncrease ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-rose-500/10 text-rose-400">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 text-emerald-400">
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-200">{shap.feature}</span>
                        <span className="text-[11px] font-mono text-slate-400">({shap.rawValue})</span>
                      </div>

                      <span
                        className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                          isIncrease
                            ? "bg-rose-950/80 text-rose-300 border border-rose-800/40"
                            : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/40"
                        }`}
                      >
                        {isIncrease ? `+${shap.contribution}` : shap.contribution} pts
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isIncrease ? "bg-rose-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(100, Math.abs(shap.contribution) * 2.8)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400">{shap.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Client Hardware & Geolocation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-slate-400" />
                <span>Client & Device Environment</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Browser</span>
                  <span className="text-slate-200 font-mono">{transaction.device.browser}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Operating System</span>
                  <span className="text-slate-200 font-mono">{transaction.device.os}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Fingerprint Hash</span>
                  <span className="text-slate-300 font-mono">{transaction.device.fingerprintHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Device Status</span>
                  <span className={transaction.device.isNewDevice ? "text-amber-400 font-medium" : "text-emerald-400 font-medium"}>
                    {transaction.device.isNewDevice ? "Unrecognized Client" : "Verified Trusted Device"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>Network & Geolocation</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Location</span>
                  <span className="text-slate-200 font-medium">{transaction.location.city}, {transaction.location.country}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">IP Address</span>
                  <span className="text-slate-300 font-mono">{transaction.location.ipAddress}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Proxy / VPN</span>
                  <span className={transaction.location.isVpnOrProxy ? "text-rose-400 font-medium" : "text-emerald-400 font-medium"}>
                    {transaction.location.isVpnOrProxy ? "Detected (Anonymous Proxy)" : "Clean Domestic ISP"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Distance from Anchor</span>
                  <span className="text-slate-200 font-mono">{transaction.location.distanceFromHomeKm} km</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-4 gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-slate-500" />
            <span>Manual Analyst Override</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleAction("APPROVED", "Allowed")}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Allow Transaction
            </button>
            <button
              onClick={() => handleAction("OTP_REQUIRED", "3DS OTP Requested")}
              className="rounded-lg border border-amber-800/40 bg-amber-950/60 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-900/60 transition-colors"
            >
              Request 3DS OTP
            </button>
            <button
              onClick={() => handleAction("BLOCKED", "Fraud Block Confirmed")}
              className="rounded-lg border border-rose-800/40 bg-rose-950/60 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-900/60 transition-colors"
            >
              Confirm Block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { Transaction } from "@/types/fraud";
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Maximize2,
  X,
  MapPin,
  Smartphone,
  CreditCard,
  User,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Check,
} from "lucide-react";

interface InlineInspectorProps {
  transaction: Transaction | null;
  onClose: () => void;
  onExpandModal: () => void;
  onUpdateStatus: (txnId: string, newAction: Transaction["decision"]) => void;
}

export const InlineInspector: React.FC<InlineInspectorProps> = ({
  transaction,
  onClose,
  onExpandModal,
  onUpdateStatus,
}) => {
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!transaction) {
    return (
      <div className="h-full rounded-xl border border-slate-800 bg-[#0d1424] p-6 flex flex-col items-center justify-center text-center space-y-3">
        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
          <CreditCard className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-200">No Transaction Selected</div>
          <p className="text-xs text-slate-400 max-w-xs">
            Click any row in the table to inspect risk evaluation, device fingerprinting, and feature attribution.
          </p>
        </div>
      </div>
    );
  }

  const isHigh = transaction.riskLevel === "HIGH";
  const isMedium = transaction.riskLevel === "MEDIUM";

  const handleAction = (action: Transaction["decision"], label: string) => {
    onUpdateStatus(transaction.id, action);
    setActionNotice(label);
    setTimeout(() => setActionNotice(null), 2500);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-white">{transaction.id}</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
              isHigh
                ? "bg-rose-950/70 text-rose-300 border-rose-800/40"
                : isMedium
                ? "bg-amber-950/70 text-amber-300 border-amber-800/40"
                : "bg-emerald-950/70 text-emerald-300 border-emerald-800/40"
            }`}
          >
            {transaction.decision === "BLOCKED" ? "Blocked" : transaction.decision === "OTP_REQUIRED" ? "3DS Review" : "Allowed"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onExpandModal}
            className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Expand Full Investigation View"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="rounded-lg bg-emerald-950/60 border border-emerald-800/50 px-3 py-1.5 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Payment Summary */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
        <div className="text-xs text-slate-400">Charge Amount</div>
        <div className="text-2xl font-bold font-mono text-white">
          ₹{transaction.amount.toLocaleString("en-IN")}
        </div>
        <div className="text-xs text-slate-300 flex justify-between border-t border-slate-800 pt-2">
          <span className="text-slate-400">Merchant</span>
          <span className="font-medium text-slate-200">{transaction.merchant}</span>
        </div>
        <div className="text-xs text-slate-300 flex justify-between">
          <span className="text-slate-400">Payment Method</span>
          <span className="text-slate-200">
            {transaction.paymentMethod.type === "card" && `${transaction.paymentMethod.brand} •••• ${transaction.paymentMethod.last4}`}
            {transaction.paymentMethod.type === "upi" && transaction.paymentMethod.upiHandle}
            {transaction.paymentMethod.type === "netbanking" && transaction.paymentMethod.bankName}
          </span>
        </div>
      </div>

      {/* Risk Score Evaluation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Risk Score Evaluation</span>
          <span
            className={`font-mono font-bold text-xs ${
              isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {transaction.riskScore} / 100
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full ${isHigh ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500"}`}
            style={{ width: `${transaction.riskScore}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0 (Normal)</span>
          <span>35 (3DS Threshold)</span>
          <span>70 (Auto-Block)</span>
          <span>100</span>
        </div>
      </div>

      {/* Top Risk Contributing Factors */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-300">
          Evaluation Signals & Attribution
        </div>
        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
          {transaction.shapExplanation.slice(0, 4).map((item, idx) => {
            const isInc = item.direction === "increase";
            return (
              <div
                key={idx}
                className="rounded-lg border border-slate-800 bg-slate-900/40 p-2 text-xs flex items-center justify-between"
              >
                <div className="truncate max-w-[170px]">
                  <div className="font-medium text-slate-200 text-[11px] truncate">{item.feature}</div>
                  <div className="text-[10px] text-slate-400 truncate">{item.description}</div>
                </div>
                <span
                  className={`font-mono text-xs font-semibold px-1.5 py-0.5 rounded ${
                    isInc ? "text-rose-400 bg-rose-950/60" : "text-emerald-400 bg-emerald-950/60"
                  }`}
                >
                  {isInc ? `+${item.contribution}` : item.contribution}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer & Location */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-1.5">
        <div className="flex justify-between">
          <span className="text-slate-400">Customer</span>
          <span className="font-medium text-slate-200">{transaction.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Location & Hop</span>
          <span className="text-slate-200">
            {transaction.location.city}, {transaction.location.country}
            {transaction.location.distanceFromHomeKm > 500 && (
              <span className="text-rose-400 font-mono text-[11px] ml-1">({transaction.location.distanceFromHomeKm}km)</span>
            )}
            {transaction.location.isVpnOrProxy && (
              <span className="ml-1 rounded bg-rose-950/80 px-1 text-[9px] font-semibold text-rose-300 border border-rose-800/50">
                VPN
              </span>
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Device</span>
          <span className="text-slate-200 text-[11px] truncate max-w-[170px]">{transaction.device.browser}</span>
        </div>
        <div className="flex justify-between border-t border-slate-800/80 pt-1.5 text-[11px]">
          <span className="text-slate-400">Anomaly Index</span>
          <span className="font-mono text-cyan-400 font-semibold">
            {(transaction.anomalyScore * 100).toFixed(0)}% (Isolation Forest)
          </span>
        </div>
      </div>

      {/* Analyst Authority Actions */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <div className="text-[10px] uppercase font-semibold text-slate-500">
          Analyst Decision Override
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => handleAction("APPROVED", "Transaction manually marked as Allowed")}
            className="rounded-lg border border-slate-700 bg-slate-800/80 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Allow
          </button>
          <button
            onClick={() => handleAction("OTP_REQUIRED", "3DS OTP verification requested")}
            className="rounded-lg border border-amber-800/40 bg-amber-950/50 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-900/60 transition-colors"
          >
            Require 3DS
          </button>
          <button
            onClick={() => handleAction("BLOCKED", "Transaction confirmed as Fraud / Blocked")}
            className="rounded-lg border border-rose-800/40 bg-rose-950/50 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-900/60 transition-colors"
          >
            Block
          </button>
        </div>
      </div>
    </div>
  );
};

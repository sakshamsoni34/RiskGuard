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
  CheckCircle2,
  AlertTriangle,
  Check,
  Building,
  Info,
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
      <div className="rounded-2xl border border-slate-800 bg-[#0c1220]/90 p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[460px]">
        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <CreditCard className="h-6 w-6" />
        </div>
        <div className="space-y-1.5 max-w-xs">
          <div className="text-sm font-semibold text-slate-200">No Transaction Selected</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click any row in the live table to inspect the transaction details, risk explanation, and AI verdict.
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

  // Generate plain English explanation of the decision
  const getPlainEnglishSummary = () => {
    if (transaction.decision === "BLOCKED") {
      if (transaction.location.distanceFromHomeKm > 2000 && transaction.location.isVpnOrProxy) {
        return "Blocked due to impossible physical travel and masked VPN connection.";
      }
      if (transaction.velocity.last2MinutesCount >= 3) {
        return "Blocked due to an unusual burst of rapid authorization attempts.";
      }
      return "Blocked due to multiple high-risk indicators exceeding the auto-defense threshold.";
    }
    if (transaction.decision === "OTP_REQUIRED") {
      return "Sent for 2FA identity challenge due to unusual spend or new device profile.";
    }
    return "Cleared instantly as a trusted normal transaction from a recognized device.";
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0c1220]/95 p-5 shadow-xl space-y-4.5 backdrop-blur-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-white bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/60">
            {transaction.id}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border flex items-center gap-1 ${
              isHigh
                ? "bg-rose-950/80 text-rose-300 border-rose-800/50"
                : isMedium
                ? "bg-amber-950/80 text-amber-300 border-amber-800/50"
                : "bg-emerald-950/80 text-emerald-300 border-emerald-800/50"
            }`}
          >
            {isHigh && <ShieldAlert className="h-3 w-3 text-rose-400" />}
            {isMedium && <KeyRound className="h-3 w-3 text-amber-400" />}
            {!isHigh && !isMedium && <ShieldCheck className="h-3 w-3 text-emerald-400" />}
            {transaction.decision === "BLOCKED" ? "Blocked" : transaction.decision === "OTP_REQUIRED" ? "3DS Review" : "Approved"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onExpandModal}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 transition-colors border border-indigo-900/40"
            title="Expand Full Investigation Modal"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Deep Dive</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Action Notice feedback */}
      {actionNotice && (
        <div className="rounded-xl bg-emerald-950/80 border border-emerald-700/60 px-3.5 py-2 text-xs text-emerald-200 flex items-center gap-2 animate-fade-in shadow-md">
          <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Charge & Customer Hero Card */}
      <div className="rounded-xl border border-slate-800/90 bg-gradient-to-br from-slate-900/80 to-[#080d17] p-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Transaction Amount</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              ₹{transaction.amount.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Merchant</div>
            <div className="text-xs font-semibold text-slate-200 mt-0.5 max-w-[130px] truncate">
              {transaction.merchant}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-2.5 text-xs">
          <div>
            <span className="text-[11px] text-slate-500 block">Customer</span>
            <span className="font-medium text-slate-200 text-xs truncate block">
              {transaction.customerName}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Payment Method</span>
            <span className="text-slate-300 text-xs truncate block font-mono">
              {transaction.paymentMethod.type === "card" && `${transaction.paymentMethod.brand} •••• ${transaction.paymentMethod.last4}`}
              {transaction.paymentMethod.type === "upi" && transaction.paymentMethod.upiHandle}
              {transaction.paymentMethod.type === "netbanking" && transaction.paymentMethod.bankName}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Score & Clear Meter */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/50 p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">AI Risk Score</span>
          <span
            className={`font-mono font-bold text-sm ${
              isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {transaction.riskScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isHigh ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${transaction.riskScore}%` }}
          />
        </div>

        {/* Plain English AI Assessment */}
        <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <span>{getPlainEnglishSummary()}</span>
        </p>
      </div>

      {/* Top Reasons Why AI Flagged / Approved */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Why was this scored this way?</span>
          <span className="text-[10px] text-slate-500 font-mono">Top Signals</span>
        </div>

        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-0.5">
          {transaction.shapExplanation.slice(0, 3).map((item, idx) => {
            const isIncrease = item.direction === "increase";
            return (
              <div
                key={idx}
                className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-2.5 text-xs flex items-center justify-between gap-2"
              >
                <div className="truncate flex-1">
                  <div className="font-medium text-slate-200 text-xs truncate">
                    {item.feature}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {item.description}
                  </div>
                </div>

                <span
                  className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    isIncrease
                      ? "text-rose-300 bg-rose-950/70 border border-rose-800/40"
                      : "text-emerald-300 bg-emerald-950/70 border border-emerald-800/40"
                  }`}
                >
                  {isIncrease ? `+${item.contribution}` : item.contribution} pts
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location & Device Snapshot */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-300">
          <span className="text-slate-400 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            Location
          </span>
          <span className="font-medium text-slate-200">
            {transaction.location.city}, {transaction.location.country}
            {transaction.location.isVpnOrProxy && (
              <span className="ml-1.5 rounded bg-rose-950/80 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 border border-rose-800/50">
                VPN PROXY
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-300 border-t border-slate-800/60 pt-2">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Smartphone className="h-3.5 w-3.5 text-indigo-400" />
            Device
          </span>
          <span className="text-slate-200 text-[11px] truncate max-w-[170px]">
            {transaction.device.isNewDevice ? (
              <span className="text-amber-400 font-medium">Unrecognized Hardware</span>
            ) : (
              <span className="text-emerald-400 font-medium">Trusted Customer Device</span>
            )}
          </span>
        </div>
      </div>

      {/* Manual Override Action Buttons */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
          Analyst Decision Action
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleAction("APPROVED", "Transaction marked as Allowed")}
            className="rounded-xl border border-slate-700 bg-slate-800/90 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Allow
          </button>
          <button
            onClick={() => handleAction("OTP_REQUIRED", "3DS OTP challenge initiated")}
            className="rounded-xl border border-amber-800/50 bg-amber-950/60 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/80 transition-colors"
          >
            Send OTP
          </button>
          <button
            onClick={() => handleAction("BLOCKED", "Confirmed as Fraud & Blocked")}
            className="rounded-xl border border-rose-800/50 bg-rose-950/60 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/80 transition-colors"
          >
            Block
          </button>
        </div>
      </div>
    </div>
  );
};

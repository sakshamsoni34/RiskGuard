"use client";

import React from "react";
import { Transaction } from "@/types/fraud";
import { ShieldAlert, ShieldCheck, KeyRound, Radio, ArrowRight } from "lucide-react";

interface ThreatTickerProps {
  transactions: Transaction[];
  onSelectTransaction: (txn: Transaction) => void;
}

export const ThreatTicker: React.FC<ThreatTickerProps> = ({
  transactions,
  onSelectTransaction,
}) => {
  // Find the latest high or medium risk incident to highlight
  const latestAlert = transactions.find((t) => t.riskLevel === "HIGH" || t.riskLevel === "MEDIUM") || transactions[0];

  if (!latestAlert) return null;

  const isHigh = latestAlert.riskLevel === "HIGH";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border border-slate-800 bg-[#0c1220]/80 px-4.5 py-3 gap-3 text-xs shadow-md backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* Pulsing indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Live Activity</span>
        </div>

        <span className="text-slate-700 hidden sm:inline">|</span>

        {/* Latest incident */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400">Latest flagged transaction:</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
              isHigh
                ? "bg-rose-950/70 text-rose-300 border-rose-800/50"
                : "bg-amber-950/70 text-amber-300 border-amber-800/50"
            }`}
          >
            {isHigh ? <ShieldAlert className="h-3 w-3 text-rose-400" /> : <KeyRound className="h-3 w-3 text-amber-400" />}
            {latestAlert.decision === "BLOCKED" ? "Blocked" : "2FA Challenged"} ({latestAlert.riskScore}/100)
          </span>

          <span className="font-bold text-white font-mono">
            ₹{latestAlert.amount.toLocaleString("en-IN")}
          </span>
          <span className="text-slate-400">
            at <span className="text-slate-300 font-medium">{latestAlert.merchant}</span>
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            ({latestAlert.location.city}, {latestAlert.location.country})
          </span>
        </div>
      </div>

      <button
        onClick={() => onSelectTransaction(latestAlert)}
        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors whitespace-nowrap self-end sm:self-auto rounded-lg px-2.5 py-1 hover:bg-indigo-950/40"
      >
        <span>View incident</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

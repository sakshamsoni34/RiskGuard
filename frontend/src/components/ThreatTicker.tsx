"use client";

import React from "react";
import { Transaction } from "@/types/fraud";
import { ShieldAlert, ShieldCheck, KeyRound, Radio, ArrowRight, Zap } from "lucide-react";

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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-slate-800 bg-[#0d1424] px-4 py-2.5 gap-3 text-xs shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-300">Live Stream</span>
        </div>

        <span className="text-slate-600">|</span>

        {/* Latest incident */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400">Latest evaluation:</span>
          <span
            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold border ${
              isHigh
                ? "bg-rose-950/60 text-rose-300 border-rose-800/40"
                : "bg-amber-950/60 text-amber-300 border-amber-800/40"
            }`}
          >
            {isHigh ? <ShieldAlert className="h-3 w-3 text-rose-400" /> : <KeyRound className="h-3 w-3 text-amber-400" />}
            {latestAlert.decision} ({latestAlert.riskScore}/100)
          </span>

          <span className="font-medium text-white font-mono">
            ₹{latestAlert.amount.toLocaleString("en-IN")}
          </span>
          <span className="text-slate-400">
            at {latestAlert.merchant}
          </span>
          <span className="text-slate-500">
            ({latestAlert.location.city})
          </span>
        </div>
      </div>

      <button
        onClick={() => onSelectTransaction(latestAlert)}
        className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors whitespace-nowrap self-end sm:self-auto"
      >
        <span>View incident</span>
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};

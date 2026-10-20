"use client";

import React from "react";
import { Transaction } from "@/types/fraud";
import { ShieldAlert, KeyRound, ArrowRight } from "lucide-react";

interface ThreatTickerProps {
  transactions: Transaction[];
  onSelectTransaction: (txn: Transaction) => void;
}

export const ThreatTicker: React.FC<ThreatTickerProps> = ({
  transactions,
  onSelectTransaction,
}) => {
  const latestAlert =
    transactions.find((t) => t.riskLevel === "HIGH" || t.riskLevel === "MEDIUM") ||
    transactions[0];

  if (!latestAlert) return null;

  const isHigh = latestAlert.riskLevel === "HIGH";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border border-[#222226] bg-[#0d0d10] px-4 py-2.5 gap-3 text-xs shadow-sm backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-3">
        {/* Live Status indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-300 text-xs">Live Feed</span>
        </div>

        <span className="text-slate-700 hidden sm:inline">•</span>

        {/* Latest incident */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400">Latest flagged transaction:</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
              isHigh
                ? "bg-rose-500/10 text-rose-300 border-rose-500/25"
                : "bg-amber-500/10 text-amber-300 border-amber-500/25"
            }`}
          >
            {isHigh ? (
              <ShieldAlert className="h-3 w-3 text-rose-400" />
            ) : (
              <KeyRound className="h-3 w-3 text-amber-400" />
            )}
            {latestAlert.decision === "BLOCKED" ? "Blocked" : "2FA Challenged"} ({latestAlert.riskScore}/100)
          </span>

          <span className="font-bold text-white font-mono">
            ₹{latestAlert.amount.toLocaleString("en-IN")}
          </span>
          <span className="text-slate-400">
            at <span className="text-slate-200 font-medium">{latestAlert.merchant}</span>
          </span>
          <span className="text-slate-400 text-[11px]">
            ({latestAlert.location.city}, {latestAlert.location.country})
          </span>
        </div>
      </div>

      <button
        onClick={() => onSelectTransaction(latestAlert)}
        className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors whitespace-nowrap self-end sm:self-auto rounded-lg px-2.5 py-1 hover:bg-[#18181c] border border-transparent hover:border-[#27272a]"
      >
        <span>Inspect incident</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

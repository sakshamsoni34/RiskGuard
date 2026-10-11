"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, KeyRound, Cpu, TrendingUp } from "lucide-react";
import { ModelMetrics } from "@/types/fraud";

interface StatsCardsProps {
  metrics: ModelMetrics;
  activeFilter?: string;
  onFilterChange?: (filter: "ALL" | "HIGH" | "MEDIUM" | "LOW") => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  metrics,
  activeFilter = "ALL",
  onFilterChange,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Fraud Intercepted */}
      <div
        onClick={() => onFilterChange && onFilterChange("HIGH")}
        className={`rounded-xl border p-4.5 cursor-pointer transition-all ${
          activeFilter === "HIGH"
            ? "border-rose-500/60 bg-rose-950/20 ring-1 ring-rose-500/30"
            : "border-slate-800 bg-[#0d1424] hover:border-slate-700"
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Fraud Prevented</span>
          <span className="rounded bg-rose-950/50 px-1.5 py-0.5 text-[10px] font-mono text-rose-400 border border-rose-800/40">
            Score &gt; 70
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            ₹{(metrics.fraudBlockedAmount / 100000).toFixed(2)} L
          </span>
          <span className="text-xs text-rose-400 font-medium">
            {metrics.fraudAttemptCount} attacks
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/70 pt-2">
          <span>Action</span>
          <span className="font-medium text-rose-300">Auto-blocked</span>
        </div>
      </div>

      {/* 2. 3DS Step-Up Challenges */}
      <div
        onClick={() => onFilterChange && onFilterChange("MEDIUM")}
        className={`rounded-xl border p-4.5 cursor-pointer transition-all ${
          activeFilter === "MEDIUM"
            ? "border-amber-500/60 bg-amber-950/20 ring-1 ring-amber-500/30"
            : "border-slate-800 bg-[#0d1424] hover:border-slate-700"
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>3DS OTP Challenges</span>
          <span className="rounded bg-amber-950/50 px-1.5 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-800/40">
            Score 35–70
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            {metrics.otpChallengeCount.toLocaleString()}
          </span>
          <span className="text-xs text-amber-400 font-medium">
            {((metrics.otpChallengeCount / (metrics.totalProcessed || 1)) * 100).toFixed(1)}% of volume
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/70 pt-2">
          <span>Action</span>
          <span className="font-medium text-amber-300">2FA challenge required</span>
        </div>
      </div>

      {/* 3. Frictionless Approvals */}
      <div
        onClick={() => onFilterChange && onFilterChange("LOW")}
        className={`rounded-xl border p-4.5 cursor-pointer transition-all ${
          activeFilter === "LOW"
            ? "border-emerald-500/60 bg-emerald-950/20 ring-1 ring-emerald-500/30"
            : "border-slate-800 bg-[#0d1424] hover:border-slate-700"
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Frictionless Approvals</span>
          <span className="rounded bg-emerald-950/50 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-800/40">
            Score &lt; 35
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            {metrics.autoApprovedCount.toLocaleString()}
          </span>
          <span className="text-xs text-emerald-400 font-medium">
            {((metrics.autoApprovedCount / (metrics.totalProcessed || 1)) * 100).toFixed(1)}% instant
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/70 pt-2">
          <span>Action</span>
          <span className="font-medium text-emerald-300">Allowed (avg 32ms)</span>
        </div>
      </div>

      {/* 4. Model Health */}
      <div
        onClick={() => onFilterChange && onFilterChange("ALL")}
        className={`rounded-xl border p-4.5 cursor-pointer transition-all ${
          activeFilter === "ALL"
            ? "border-slate-600 bg-slate-900/60"
            : "border-slate-800 bg-[#0d1424] hover:border-slate-700"
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>PR-AUC & Recall</span>
          <span className="rounded bg-indigo-950/50 px-1.5 py-0.5 text-[10px] font-mono text-indigo-400 border border-indigo-800/40">
            XGBoost v2.4
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            {(metrics.prAuc * 100).toFixed(1)}%
          </span>
          <span className="text-xs text-cyan-400 font-medium">
            {(metrics.recall * 100).toFixed(1)}% Recall
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/70 pt-2">
          <span>False Decline Rate</span>
          <span className="font-medium text-slate-200">{(metrics.falsePositiveRate * 100).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
};

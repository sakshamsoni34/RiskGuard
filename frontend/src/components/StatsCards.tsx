"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, KeyRound, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
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
  const totalVolume = metrics.totalProcessed || 1;
  const blockedPct = ((metrics.fraudAttemptCount / totalVolume) * 100).toFixed(1);
  const otpPct = ((metrics.otpChallengeCount / totalVolume) * 100).toFixed(1);
  const approvedPct = ((metrics.autoApprovedCount / totalVolume) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Fraud Prevented (High Risk) */}
      <div
        onClick={() => onFilterChange && onFilterChange("HIGH")}
        className={`group relative rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${
          activeFilter === "HIGH"
            ? "border-rose-500/50 bg-[#16121e] ring-1 ring-rose-500/30 shadow-md shadow-rose-950/20"
            : "border-[#222226] bg-[#0d0d10] hover:border-zinc-700 hover:bg-[#141418] shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-200">Fraud Prevented</span>
              <div className="text-[11px] text-slate-400">High Risk (Score &gt; 70)</div>
            </div>
          </div>
          <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-300 border border-rose-500/20">
            {metrics.fraudAttemptCount} attacks
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-white">
            ₹{(metrics.fraudBlockedAmount / 100000).toFixed(2)} L
          </span>
          <span className="text-xs font-medium text-rose-400">
            saved
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-400 line-clamp-1">
          Malicious transfers automatically intercepted
        </p>

        <div className="mt-3.5 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px]">
          <span className="text-slate-400">Action:</span>
          <span className="font-medium text-rose-300 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Auto-blocked instantly
          </span>
        </div>
      </div>

      {/* 2. Identity Verification (Medium Risk) */}
      <div
        onClick={() => onFilterChange && onFilterChange("MEDIUM")}
        className={`group relative rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${
          activeFilter === "MEDIUM"
            ? "border-amber-500/50 bg-[#1b1713] ring-1 ring-amber-500/30 shadow-md shadow-amber-950/20"
            : "border-[#222226] bg-[#0d0d10] hover:border-zinc-700 hover:bg-[#141418] shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <KeyRound className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-200">2FA Challenges</span>
              <div className="text-[11px] text-slate-400">Medium Risk (Score 35–70)</div>
            </div>
          </div>
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-500/20">
            {otpPct}% volume
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-white">
            {metrics.otpChallengeCount.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-amber-400">
            step-up OTPs
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-400 line-clamp-1">
          Anomalous activity checked via two-factor auth
        </p>

        <div className="mt-3.5 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px]">
          <span className="text-slate-400">Action:</span>
          <span className="font-medium text-amber-300 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            3DS Step-Up Challenge
          </span>
        </div>
      </div>

      {/* 3. Safe Pass-Through (Low Risk) */}
      <div
        onClick={() => onFilterChange && onFilterChange("LOW")}
        className={`group relative rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${
          activeFilter === "LOW"
            ? "border-emerald-500/50 bg-[#101b17] ring-1 ring-emerald-500/30 shadow-md shadow-emerald-950/20"
            : "border-[#222226] bg-[#0d0d10] hover:border-zinc-700 hover:bg-[#141418] shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-200">Safe Approvals</span>
              <div className="text-[11px] text-slate-400">Low Risk (Score &lt; 35)</div>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/20">
            {approvedPct}% pass
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-white">
            {metrics.autoApprovedCount.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-emerald-400">
            cleared
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-400 line-clamp-1">
          Legitimate shoppers passed with zero friction
        </p>

        <div className="mt-3.5 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px]">
          <span className="text-slate-400">Speed:</span>
          <span className="font-medium text-emerald-300 flex items-center gap-1.5 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            32ms average
          </span>
        </div>
      </div>

      {/* 4. AI Accuracy & Health */}
      <div
        onClick={() => onFilterChange && onFilterChange("ALL")}
        className={`group relative rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${
          activeFilter === "ALL"
            ? "border-zinc-500/60 bg-[#16161c] ring-1 ring-zinc-500/30 shadow-md shadow-black/40"
            : "border-[#222226] bg-[#0d0d10] hover:border-zinc-700 hover:bg-[#141418] shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1b1b22] text-zinc-200 border border-[#2b2b32]">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-200">Detection Rate</span>
              <div className="text-[11px] text-zinc-400">XGBoost + SHAP Engine</div>
            </div>
          </div>
          <span className="rounded-full bg-[#1b1b22] px-2 py-0.5 text-[10px] font-medium text-zinc-300 border border-[#2b2b32]">
            {(metrics.recall * 100).toFixed(1)}% Recall
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-white">
            {(metrics.recall * 100).toFixed(1)}%
          </span>
          <span className="text-xs font-medium text-zinc-400">
            accuracy
          </span>
        </div>

        <p className="mt-2 text-xs text-zinc-400 line-clamp-1">
          Catches 96.8% of attacks with only 1.2% false alarms
        </p>

        <div className="mt-3.5 flex items-center justify-between border-t border-[#222226] pt-2.5 text-[11px]">
          <span className="text-zinc-400">Engine Status:</span>
          <span className="font-medium text-zinc-200 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Active & Calibrated
          </span>
        </div>
      </div>
    </div>
  );
};

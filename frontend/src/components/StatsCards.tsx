"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, KeyRound, Sparkles, ArrowUpRight, CheckCircle2 } from "lucide-react";
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
        className={`group rounded-2xl border p-4.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] ${
          activeFilter === "HIGH"
            ? "border-rose-500/60 bg-[#16121a] ring-1 ring-rose-500/40 shadow-lg shadow-rose-950/30"
            : "border-[#222226] bg-[#0d0d10] hover:border-rose-500/40 hover:bg-[#131317] hover:shadow-xl hover:shadow-rose-950/20 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-110 group-hover:border-rose-500/40 transition-all duration-200">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">Fraud Intercepted</h4>
              <p className="text-[11px] text-zinc-400">Score &gt; 70 • Auto-Blocked</p>
            </div>
          </div>
          <span className="rounded-full bg-rose-950/80 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-800/50 group-hover:brightness-125 transition-all">
            {metrics.fraudAttemptCount} Attacks
          </span>
        </div>

        <div className="mt-3.5 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white group-hover:text-rose-200 transition-colors">
            ₹{(metrics.fraudBlockedAmount / 100000).toFixed(2)} L
          </span>
          <span className="text-xs font-semibold text-rose-400">
            saved
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#1e1e24] pt-2.5 text-[11px] text-zinc-400 font-mono">
          <span>Interception Rate:</span>
          <span className="font-bold text-rose-300">{blockedPct}% of traffic</span>
        </div>
      </div>

      {/* 2. 2FA Step-Up Challenges (Medium Risk) */}
      <div
        onClick={() => onFilterChange && onFilterChange("MEDIUM")}
        className={`group rounded-2xl border p-4.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] ${
          activeFilter === "MEDIUM"
            ? "border-amber-500/60 bg-[#1a1612] ring-1 ring-amber-500/40 shadow-lg shadow-amber-950/30"
            : "border-[#222226] bg-[#0d0d10] hover:border-amber-500/40 hover:bg-[#131317] hover:shadow-xl hover:shadow-amber-950/20 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 group-hover:border-amber-500/40 transition-all duration-200">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">2FA Challenges</h4>
              <p className="text-[11px] text-zinc-400">Score 35–70 • Step-Up OTP</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-950/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-800/50 group-hover:brightness-125 transition-all">
            {otpPct}% Volume
          </span>
        </div>

        <div className="mt-3.5 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white group-hover:text-amber-200 transition-colors">
            {metrics.otpChallengeCount.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-amber-400">
            challenged
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#1e1e24] pt-2.5 text-[11px] text-zinc-400 font-mono">
          <span>3DS SMS / App:</span>
          <span className="font-bold text-amber-300">Identity Verified</span>
        </div>
      </div>

      {/* 3. Safe Approvals (Low Risk) */}
      <div
        onClick={() => onFilterChange && onFilterChange("LOW")}
        className={`group rounded-2xl border p-4.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] ${
          activeFilter === "LOW"
            ? "border-emerald-500/60 bg-[#101a15] ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/30"
            : "border-[#222226] bg-[#0d0d10] hover:border-emerald-500/40 hover:bg-[#131317] hover:shadow-xl hover:shadow-emerald-950/20 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 group-hover:border-emerald-500/40 transition-all duration-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">Safe Approvals</h4>
              <p className="text-[11px] text-zinc-400">Score &lt; 35 • Frictionless</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800/50 group-hover:brightness-125 transition-all">
            {approvedPct}% Clear
          </span>
        </div>

        <div className="mt-3.5 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white group-hover:text-emerald-200 transition-colors">
            {metrics.autoApprovedCount.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-emerald-400">
            approved
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#1e1e24] pt-2.5 text-[11px] text-zinc-400 font-mono">
          <span>Inference Latency:</span>
          <span className="font-bold text-emerald-300">~32ms average</span>
        </div>
      </div>

      {/* 4. AI Accuracy & Precision */}
      <div
        onClick={() => onFilterChange && onFilterChange("ALL")}
        className={`group rounded-2xl border p-4.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] ${
          activeFilter === "ALL"
            ? "border-sky-500/60 bg-[#101622] ring-1 ring-sky-500/40 shadow-lg shadow-sky-950/30"
            : "border-[#222226] bg-[#0d0d10] hover:border-sky-500/40 hover:bg-[#131317] hover:shadow-xl hover:shadow-sky-950/20 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 group-hover:border-sky-500/40 transition-all duration-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">AI Detection Engine</h4>
              <p className="text-[11px] text-zinc-400">XGBoost v2.0 + TreeSHAP</p>
            </div>
          </div>
          <span className="rounded-full bg-sky-950/80 px-2.5 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-800/50 group-hover:brightness-125 transition-all">
            Calibrated
          </span>
        </div>

        <div className="mt-3.5 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white group-hover:text-sky-200 transition-colors">
            {(metrics.recall * 100).toFixed(1)}%
          </span>
          <span className="text-xs font-semibold text-sky-400">
            precision
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#1e1e24] pt-2.5 text-[11px] text-zinc-400 font-mono">
          <span>False Alarms:</span>
          <span className="font-bold text-sky-300">0.21% (Low Friction)</span>
        </div>
      </div>
    </div>
  );
};

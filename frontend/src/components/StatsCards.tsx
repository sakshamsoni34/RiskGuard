"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, KeyRound, TrendingUp, Cpu, IndianRupee } from "lucide-react";
import { ModelMetrics } from "@/types/fraud";

interface StatsCardsProps {
  metrics: ModelMetrics;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Fraud Prevented Value */}
      <div className="relative overflow-hidden rounded-xl border border-rose-500/20 bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900 p-5 shadow-lg shadow-rose-950/20 glass-panel glass-panel-hover">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-rose-400">Fraud Prevented</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">
            ₹{(metrics.fraudBlockedAmount / 100000).toFixed(2)} L
          </span>
          <span className="text-xs font-medium text-rose-400/90 flex items-center">
            {metrics.fraudAttemptCount} attacks
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
          <span>High-Risk Tier (&gt;70)</span>
          <span className="font-semibold text-rose-300">AUTO-BLOCKED</span>
        </div>
        <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-rose-500/5 blur-2xl pointer-events-none" />
      </div>

      {/* 2. Step-up OTP Verifications (Medium Tier) */}
      <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 p-5 shadow-lg shadow-amber-950/20 glass-panel glass-panel-hover">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-amber-400">OTP Challenges</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
            <KeyRound className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">
            {metrics.otpChallengeCount.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-amber-400/90">
            {((metrics.otpChallengeCount / metrics.totalProcessed) * 100).toFixed(1)}% step-up
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
          <span>Medium-Risk Tier (35-70)</span>
          <span className="font-semibold text-amber-300">2FA STEP-UP</span>
        </div>
        <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
      </div>

      {/* 3. Auto-Approved Volume (Frictionless Low Tier) */}
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 p-5 shadow-lg shadow-emerald-950/20 glass-panel glass-panel-hover">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">Frictionless Approval</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">
            {metrics.autoApprovedCount.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-emerald-400/90">
            {((metrics.autoApprovedCount / metrics.totalProcessed) * 100).toFixed(1)}% instant
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
          <span>Low-Risk Tier (&lt;35)</span>
          <span className="font-semibold text-emerald-300">AUTO-APPROVED</span>
        </div>
        <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
      </div>

      {/* 4. Class Imbalance & PR-AUC Precision */}
      <div className="relative overflow-hidden rounded-xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 p-5 shadow-lg shadow-indigo-950/20 glass-panel glass-panel-hover">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400">PR-AUC & Recall</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
            <Cpu className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">
            {(metrics.prAuc * 100).toFixed(1)}%
          </span>
          <span className="text-xs font-semibold text-cyan-400">
            {(metrics.recall * 100).toFixed(1)}% Recall
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
          <span>False Decline Rate</span>
          <span className="font-semibold text-indigo-300">{(metrics.falsePositiveRate * 100).toFixed(2)}% only</span>
        </div>
        <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />
      </div>
    </div>
  );
};

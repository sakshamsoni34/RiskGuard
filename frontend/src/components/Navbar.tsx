"use client";

import React from "react";
import { ShieldCheck, Activity, Play, Pause, Cpu, Zap, BellRing, Sparkles } from "lucide-react";

interface NavbarProps {
  activeTab: "monitor" | "simulator" | "analytics" | "architecture";
  setActiveTab: (tab: "monitor" | "simulator" | "analytics" | "architecture") => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  onSimulateAttack: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isStreaming,
  setIsStreaming,
  onSimulateAttack,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0a0e1a]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">RiskGuard</span>
              <span className="rounded-md border border-cyan-500/30 bg-cyan-950/60 px-2 py-0.5 text-[11px] font-semibold text-cyan-300">
                AI RISK ENGINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Real-Time ML Fraud Detection • XGBoost + SHAP Explainability
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="hidden md:flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
          <button
            onClick={() => setActiveTab("monitor")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "monitor"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Live Monitor
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "simulator"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Risk Simulator
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "analytics"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            SHAP & Metrics
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "architecture"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Architecture
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Simulate Attack quick button */}
          <button
            onClick={onSimulateAttack}
            title="Simulate rapid high-risk fraud attempt (₹85,000 velocity attack)"
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/40 px-2.5 py-1.5 text-xs font-medium text-rose-300 transition-all hover:bg-rose-900/60 hover:border-rose-400 active:scale-95 shadow-sm shadow-rose-900/20"
          >
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="hidden sm:inline">Simulate Attack</span>
            <span className="sm:hidden">Attack</span>
          </button>

          {/* Stream pause/play toggle */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
              isStreaming
                ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50"
                : "border-amber-500/30 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50"
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Live Stream On</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Stream Paused</span>
              </>
            )}
          </button>

          {/* Model info pill */}
          <div className="hidden lg:flex items-center gap-2 border-l border-slate-800 pl-3">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Latency</div>
              <div className="text-xs font-mono font-bold text-emerald-400">38 ms</div>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="flex md:hidden border-t border-slate-800/80 px-2 py-1.5 justify-around bg-slate-900/80">
        <button
          onClick={() => setActiveTab("monitor")}
          className={`px-3 py-1 text-xs font-medium rounded ${
            activeTab === "monitor" ? "text-indigo-400 font-semibold" : "text-slate-400"
          }`}
        >
          Monitor
        </button>
        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-3 py-1 text-xs font-medium rounded ${
            activeTab === "simulator" ? "text-indigo-400 font-semibold" : "text-slate-400"
          }`}
        >
          Simulator
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-3 py-1 text-xs font-medium rounded ${
            activeTab === "analytics" ? "text-indigo-400 font-semibold" : "text-slate-400"
          }`}
        >
          SHAP & ML
        </button>
        <button
          onClick={() => setActiveTab("architecture")}
          className={`px-3 py-1 text-xs font-medium rounded ${
            activeTab === "architecture" ? "text-indigo-400 font-semibold" : "text-slate-400"
          }`}
        >
          Stack
        </button>
      </div>
    </header>
  );
};

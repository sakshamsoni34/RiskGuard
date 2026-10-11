"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Sliders,
  BarChart3,
  Server,
  Play,
  Pause,
  ChevronDown,
  Search,
  Sparkles,
  Command,
  Zap,
  Globe2,
  Lock,
  Flame,
  CheckCircle2,
} from "lucide-react";

export type AttackVectorType = "abstract_velocity" | "geo_spoof" | "account_takeover" | "credential_stuffing";

interface NavbarProps {
  activeTab: "monitor" | "simulator" | "analytics" | "architecture";
  setActiveTab: (tab: "monitor" | "simulator" | "analytics" | "architecture") => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  streamSpeed: "normal" | "fast";
  setStreamSpeed: (speed: "normal" | "fast") => void;
  onSimulateAttackVector: (vector: AttackVectorType) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isStreaming,
  setIsStreaming,
  streamSpeed,
  setStreamSpeed,
  onSimulateAttackVector,
  searchQuery = "",
  setSearchQuery,
}) => {
  const [showSimulateMenu, setShowSimulateMenu] = useState<boolean>(false);

  const handleSelectSim = (type: AttackVectorType) => {
    setShowSimulateMenu(false);
    onSimulateAttackVector(type);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#090d16]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Brand & Workspace */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/15 border border-indigo-500/30 text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">RiskGuard</span>
              <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-700/50">
                Production
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab("monitor")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "monitor"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              Transactions
            </button>
            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "simulator"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Sliders className="h-3.5 w-3.5 text-amber-400" />
              Rule Sandbox
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "analytics"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
              Model Performance
            </button>
            <button
              onClick={() => setActiveTab("architecture")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "architecture"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Server className="h-3.5 w-3.5 text-emerald-400" />
              System & API
            </button>
          </nav>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">
          {/* Stream Status Toggle */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/60 p-0.5 text-xs">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium text-xs transition-colors ${
                isStreaming
                  ? "bg-emerald-950/70 text-emerald-300 border border-emerald-800/50"
                  : "bg-slate-800 text-slate-400"
              }`}
              title="Pause or resume live incoming transactions"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isStreaming ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
              <span className="hidden sm:inline">{isStreaming ? "Live Feed" : "Paused"}</span>
            </button>
            {isStreaming && (
              <button
                onClick={() => setStreamSpeed(streamSpeed === "normal" ? "fast" : "normal")}
                className="px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
                title="Adjust ingestion pace"
              >
                {streamSpeed === "normal" ? "4.5s" : "1.5s"}
              </button>
            )}
          </div>

          {/* Test Payment Simulation Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSimulateMenu(!showSimulateMenu)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors shadow-sm"
            >
              <span>Test Payment</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showSimulateMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-800 bg-[#0f172a] p-1.5 shadow-2xl z-50 animate-fade-in text-xs space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                  Inject Test Scenario
                </div>
                <button
                  onClick={() => handleSelectSim("abstract_velocity")}
                  className="w-full flex items-start gap-2 rounded-lg p-2 text-left hover:bg-slate-800 transition-colors"
                >
                  <Flame className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-200">Velocity Burst Attack</div>
                    <div className="text-[11px] text-slate-400">₹85,000 electronics • 3 attempts in 2 min (Lagos)</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSelectSim("geo_spoof")}
                  className="w-full flex items-start gap-2 rounded-lg p-2 text-left hover:bg-slate-800 transition-colors"
                >
                  <Globe2 className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-200">Impossible Travel Jump</div>
                    <div className="text-[11px] text-slate-400">4,800 km jump from Mumbai home IP (Moscow)</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSelectSim("account_takeover")}
                  className="w-full flex items-start gap-2 rounded-lg p-2 text-left hover:bg-slate-800 transition-colors"
                >
                  <Lock className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-200">High-Ticket Crypto Drain</div>
                    <div className="text-[11px] text-slate-400">₹1,45,000 on brand new unverified client</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSelectSim("credential_stuffing")}
                  className="w-full flex items-start gap-2 rounded-lg p-2 text-left hover:bg-slate-800 transition-colors"
                >
                  <Zap className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-200">Carding Micro-Probe</div>
                    <div className="text-[11px] text-slate-400">Repeated small amounts testing card validity</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700">
              SS
            </div>
            <div className="text-left text-xs hidden lg:block">
              <div className="font-medium text-slate-200 leading-tight">Saksham Soni</div>
              <div className="text-[10px] text-slate-400">Risk Operations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="flex md:hidden border-t border-slate-800 px-3 py-1.5 justify-around bg-[#090d16] text-xs">
        <button
          onClick={() => setActiveTab("monitor")}
          className={`px-2.5 py-1 rounded ${activeTab === "monitor" ? "text-white font-semibold bg-slate-800" : "text-slate-400"}`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-2.5 py-1 rounded ${activeTab === "simulator" ? "text-white font-semibold bg-slate-800" : "text-slate-400"}`}
        >
          Rules
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-2.5 py-1 rounded ${activeTab === "analytics" ? "text-white font-semibold bg-slate-800" : "text-slate-400"}`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab("architecture")}
          className={`px-2.5 py-1 rounded ${activeTab === "architecture" ? "text-white font-semibold bg-slate-800" : "text-slate-400"}`}
        >
          System
        </button>
      </div>
    </header>
  );
};

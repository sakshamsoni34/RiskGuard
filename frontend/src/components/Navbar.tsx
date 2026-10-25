"use client";

import React, { useState, useEffect } from "react";
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
  Volume2,
  VolumeX,
  Flame,
  Globe2,
  Lock,
  Zap,
} from "lucide-react";
import { soundEngine } from "@/lib/soundFx";

export type AttackVectorType = "abstract_velocity" | "geo_spoof" | "account_takeover" | "credential_stuffing";

interface NavbarProps {
  activeTab: "monitor" | "simulator" | "analytics" | "architecture";
  setActiveTab: (tab: "monitor" | "simulator" | "analytics" | "architecture") => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  streamSpeed: "normal" | "fast";
  setStreamSpeed: (speed: "normal" | "fast") => void;
  onSimulateAttackVector: (vector: AttackVectorType) => void;
  apiMode?: "mock" | "live";
  setApiMode?: (mode: "mock" | "live") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isStreaming,
  setIsStreaming,
  streamSpeed,
  setStreamSpeed,
  onSimulateAttackVector,
  apiMode = "mock",
  setApiMode,
}) => {
  const [showSimulateMenu, setShowSimulateMenu] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  useEffect(() => {
    setIsAudioMuted(soundEngine.getMuted());
    const unsub = soundEngine.subscribe((muted) => setIsAudioMuted(muted));
    return unsub;
  }, []);

  const handleToggleAudio = () => {
    const next = soundEngine.toggleMute();
    setIsAudioMuted(next);
    if (!next) {
      soundEngine.playSuccessChime();
    }
  };

  const handleSelectSim = (type: AttackVectorType) => {
    setShowSimulateMenu(false);
    onSimulateAttackVector(type);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#222226] bg-[#08080a]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand & Tabs */}
        <div className="flex items-center gap-7">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#18181c] border border-[#27272a] text-zinc-200 shadow-sm shadow-black/40">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">RiskGuard</span>
                <span className="rounded-full bg-[#18181c] px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-[#27272a]">
                  Live ML
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Real-Time AI Fraud Prevention
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#121215] p-1 rounded-xl border border-[#222226]">
            <button
              onClick={() => setActiveTab("monitor")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 ${
                activeTab === "monitor"
                  ? "bg-[#222228] text-white border border-[#2e2e36] shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-[#18181c] border border-transparent"
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-zinc-300" />
              Live Monitor
            </button>
            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 ${
                activeTab === "simulator"
                  ? "bg-[#222228] text-white border border-[#2e2e36] shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-[#18181c] border border-transparent"
              }`}
            >
              <Sliders className="h-3.5 w-3.5 text-zinc-300" />
              Rule Sandbox
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 ${
                activeTab === "analytics"
                  ? "bg-[#222228] text-white border border-[#2e2e36] shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-[#18181c] border border-transparent"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 text-zinc-300" />
              AI Accuracy
            </button>
            <button
              onClick={() => setActiveTab("architecture")}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 ${
                activeTab === "architecture"
                  ? "bg-[#222228] text-white border border-[#2e2e36] shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-[#18181c] border border-transparent"
              }`}
            >
              <Server className="h-3.5 w-3.5 text-zinc-300" />
              System Info
            </button>
          </nav>
        </div>

        {/* Right Tools & Simulation */}
        <div className="flex items-center gap-2.5">
          {/* Audio Telemetry */}
          <button
            onClick={handleToggleAudio}
            suppressHydrationWarning
            className={`flex h-8.5 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-medium transition-all hover:scale-105 active:scale-95 ${
              !isAudioMuted
                ? "border-[#2b2b32] bg-[#18181c] text-zinc-200 hover:border-zinc-500 shadow-sm"
                : "border-[#222226] bg-[#121215] text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
            }`}
            title={!isAudioMuted ? "Sound alerts on (click to mute)" : "Sound muted (click to unmute)"}
          >
            {!isAudioMuted ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-zinc-300" />
                <span className="hidden xl:inline text-[11px]">Audio On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 text-zinc-500" />
                <span className="hidden xl:inline text-[11px]">Muted</span>
              </>
            )}
          </button>

          {/* Streaming Toggle */}
          <div className="flex items-center rounded-xl border border-[#222226] bg-[#121215] p-0.5 text-xs">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold text-xs transition-all hover:scale-[1.02] active:scale-95 ${
                isStreaming
                  ? "bg-[#18181c] text-emerald-300 border border-[#27272a] hover:border-emerald-500/40"
                  : "bg-[#141418] text-zinc-400 hover:text-zinc-200"
              }`}
              title="Pause or resume live incoming transactions"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isStreaming ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
              <span className="hidden sm:inline">{isStreaming ? "Streaming" : "Paused"}</span>
            </button>
            {isStreaming && (
              <button
                onClick={() => setStreamSpeed(streamSpeed === "normal" ? "fast" : "normal")}
                className="px-2 py-1.5 text-[11px] font-mono text-zinc-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                title="Adjust stream pace"
              >
                {streamSpeed === "normal" ? "4.5s" : "1.5s"}
              </button>
            )}
          </div>

          {/* Test Attack Injection Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSimulateMenu(!showSimulateMenu)}
              className="flex items-center gap-1.5 rounded-xl border border-[#2b2b32] bg-[#18181c] px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-[#222228] hover:text-white hover:border-zinc-500 hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
            >
              <span>Simulate Attack</span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>

            {showSimulateMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#222226] bg-[#0d0d10] p-2 shadow-2xl z-50 animate-fade-in text-xs space-y-1">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Inject Test Scenario into Stream
                </div>
                <button
                  onClick={() => handleSelectSim("abstract_velocity")}
                  className="w-full flex items-start gap-2.5 rounded-xl p-2.5 text-left hover:bg-[#16161c] hover:translate-x-1 transition-all duration-150 group"
                >
                  <Flame className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-slate-200 group-hover:text-white">Velocity Burst Attack</div>
                    <div className="text-[11px] text-slate-400">3 rapid charges in 2 mins at Apple Store (Lagos IP)</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSelectSim("geo_spoof")}
                  className="w-full flex items-start gap-2.5 rounded-xl p-2.5 text-left hover:bg-[#16161c] hover:translate-x-1 transition-all duration-150 group"
                >
                  <Globe2 className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-slate-200 group-hover:text-white">Impossible Travel Jump</div>
                    <div className="text-[11px] text-slate-400">4,800 km jump to Moscow within minutes of Mumbai</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSelectSim("account_takeover")}
                  className="w-full flex items-start gap-2.5 rounded-xl p-2.5 text-left hover:bg-[#16161c] hover:translate-x-1 transition-all duration-150 group"
                >
                  <Lock className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-slate-200 group-hover:text-white">Account Takeover (ATO)</div>
                    <div className="text-[11px] text-slate-400">₹1,45,000 crypto purchase on brand new client device</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSelectSim("credential_stuffing")}
                  className="w-full flex items-start gap-2.5 rounded-xl p-2.5 text-left hover:bg-[#16161c] hover:translate-x-1 transition-all duration-150 group"
                >
                  <Zap className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-slate-200 group-hover:text-white">Carding Micro-Probe</div>
                    <div className="text-[11px] text-slate-400">Rapid small charges testing card validity</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700">
              SS
            </div>
            <div className="text-left text-xs hidden lg:block">
              <div className="font-semibold text-slate-200 leading-tight">Saksham Soni</div>
              <div className="text-[10px] text-slate-400">Risk Operations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="flex md:hidden border-t border-[#222226] px-3 py-2 justify-around bg-[#08080a] text-xs">
        <button
          onClick={() => setActiveTab("monitor")}
          className={`px-3 py-1 rounded-lg ${activeTab === "monitor" ? "text-white font-bold bg-[#18181c]" : "text-zinc-400"}`}
        >
          Monitor
        </button>
        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-3 py-1 rounded-lg ${activeTab === "simulator" ? "text-white font-bold bg-slate-800" : "text-slate-400"}`}
        >
          Sandbox
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-3 py-1 rounded-lg ${activeTab === "analytics" ? "text-white font-bold bg-slate-800" : "text-slate-400"}`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab("architecture")}
          className={`px-3 py-1 rounded-lg ${activeTab === "architecture" ? "text-white font-bold bg-slate-800" : "text-slate-400"}`}
        >
          System
        </button>
      </div>
    </header>
  );
};

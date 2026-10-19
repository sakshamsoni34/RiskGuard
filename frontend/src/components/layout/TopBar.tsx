"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Volume2,
  VolumeX,
  Search,
  Cpu,
  ShieldAlert,
  Bell,
  Menu,
  X,
  Radio,
  ExternalLink,
} from "lucide-react";
import { soundEngine } from "@/lib/soundFx";

export function TopBar() {
  const pathname = usePathname();
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setIsMuted(soundEngine.isSoundMuted());
  }, []);

  const handleToggleSound = () => {
    const nextState = soundEngine.toggleMute();
    setIsMuted(nextState);
  };

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Command Center & Situational Awareness";
    if (pathname.startsWith("/transactions")) return "Transaction Triage & Telemetry";
    if (pathname.startsWith("/cases")) return "Case Investigation Registry";
    if (pathname === "/simulator") return "Interactive Risk Simulation & SHAP Explorer";
    if (pathname === "/models") return "Model Intelligence & Explainability Diagnostics";
    if (pathname === "/audit") return "Cryptographic Audit Trail (Append-Only)";
    if (pathname === "/reports") return "Evidentiary Briefing & Report Dispatch";
    if (pathname === "/settings") return "Cyber Cell Platform Settings";
    if (pathname === "/login") return "Officer Authentication Gateway";
    return "Cybercrime Investigation Platform";
  };

  return (
    <header className="sticky top-[29px] z-40 bg-[#080d19]/90 backdrop-blur-md border-b border-[#141d30] px-4 py-2.5 flex items-center justify-between gap-4">
      {/* Title & Path */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div>
          <h1 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>{getPageTitle()}</span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              CELL-AUTH-L2
            </span>
          </h1>
          <p className="text-[10px] font-mono text-slate-400 hidden lg:block">
            LEGAL STATUS: Investigative Prioritization Aid • Not Admissible Evidence per Sec 65B
          </p>
        </div>
      </div>

      {/* Global Quick Search */}
      <div className="hidden md:flex items-center flex-1 max-w-xs relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Lookup Txn ID, Mule VPA, or Card..."
          className="w-full bg-[#0d1424] text-xs text-slate-200 placeholder-slate-500 pl-8 pr-3 py-1.5 rounded-lg border border-[#1a2438] focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono"
        />
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 font-mono text-xs">
        {/* ML Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-300 text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">ML Engine:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            READY
          </span>
        </div>

        {/* Telemetry Audio Toggle */}
        <button
          onClick={handleToggleSound}
          title={isMuted ? "Sound muted (click to enable telemetry audio)" : "Sound active (click to mute)"}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-colors ${
            isMuted
              ? "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
              : "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-sm shadow-indigo-950"
          }`}
          aria-label={isMuted ? "Unmute audio alerts" : "Mute audio alerts"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />}
          <span className="text-[11px] font-mono hidden sm:inline">{isMuted ? "MUTED" : "AUDIO ON"}</span>
        </button>

        {/* Rapid Alert Action */}
        <Link
          href="/cases"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25 transition-colors text-xs"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline font-mono text-[11px]">3 HIGH-PRIORITY</span>
        </Link>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#070b14] border-b border-slate-800 p-4 space-y-2 shadow-2xl z-50">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
          >
            Command Center
          </Link>
          <Link
            href="/transactions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
          >
            Live Ingestion
          </Link>
          <Link
            href="/cases"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
          >
            Case Registry
          </Link>
          <Link
            href="/simulator"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
          >
            Risk Simulator
          </Link>
          <Link
            href="/models"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
          >
            Model Intelligence
          </Link>
          <Link
            href="/audit"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
          >
            Audit Trail
          </Link>
          <Link
            href="/reports"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
          >
            Official Reports
          </Link>
          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-800"
          >
            Settings
          </Link>
        </div>
      )}
    </header>
  );
}

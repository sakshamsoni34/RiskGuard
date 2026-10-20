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
  User,
  ChevronDown,
} from "lucide-react";
import { soundEngine } from "@/lib/soundFx";
import { LogoutButton } from "./LogoutButton";

export function TopBar() {
  const pathname = usePathname();
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [officerName, setOfficerName] = useState<string>("Insp. Vikram Sharma");
  const [officerBadge, setOfficerBadge] = useState<string>("CC-8421");
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsMuted(soundEngine.isSoundMuted());

    // Read officer name from cookies if available
    if (typeof document !== "undefined") {
      const matchName = document.cookie.match(/officer_name=([^;]+)/);
      if (matchName) {
        setOfficerName(decodeURIComponent(matchName[1]));
      }
      const matchBadge = document.cookie.match(/officer_badge=([^;]+)/);
      if (matchBadge) {
        setOfficerBadge(decodeURIComponent(matchBadge[1]));
      }
    }
  }, []);

  const handleToggleSound = () => {
    const nextState = soundEngine.toggleMute();
    setIsMuted(nextState);
  };

  const getPageInfo = () => {
    if (pathname === "/dashboard") {
      return { section: "Operations", title: "Risk Command Center" };
    }
    if (pathname.startsWith("/transactions")) {
      return { section: "Monitoring", title: "Live Transactions & Triage" };
    }
    if (pathname.startsWith("/cases")) {
      return { section: "Investigations", title: "Case Files Registry" };
    }
    if (pathname === "/simulator") {
      return { section: "Sandbox", title: "Transaction Risk Simulator" };
    }
    if (pathname === "/models") {
      return { section: "Intelligence", title: "Model Performance & SHAP" };
    }
    if (pathname === "/audit") {
      return { section: "Compliance", title: "Immutable Audit Log" };
    }
    if (pathname === "/reports") {
      return { section: "Reporting", title: "Official Briefings & Exports" };
    }
    if (pathname === "/settings") {
      return { section: "Administration", title: "Platform Settings" };
    }
    return { section: "RiskGuard", title: "Fraud Intelligence Platform" };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="sticky top-0 z-40 bg-[#0d1322]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>{pageInfo.section}</span>
            <span>/</span>
            <span className="text-slate-300 font-medium">{pageInfo.title}</span>
          </div>
          <h1 className="text-sm font-semibold text-white tracking-tight">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Global Quick Search */}
      <div className="hidden lg:flex items-center flex-1 max-w-sm relative mx-4">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by transaction ID, customer, or card..."
          className="w-full bg-[#0a0e17] text-xs text-slate-200 placeholder-slate-400 pl-9 pr-12 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
        <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-800/80 rounded border border-slate-700/60">
          ⌘K
        </kbd>
      </div>

      {/* Action Controls & Officer Menu */}
      <div className="flex items-center gap-2.5">
        {/* ML Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400 text-[11px]">ML v2.4</span>
        </div>

        {/* Audio Telemetry Toggle */}
        <button
          onClick={handleToggleSound}
          title={isMuted ? "Enable sound notifications" : "Mute sound notifications"}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            isMuted
              ? "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              : "bg-indigo-600/15 border-indigo-500/40 text-indigo-300"
          }`}
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
          <span className="hidden xl:inline text-[11px]">{isMuted ? "Audio Off" : "Audio On"}</span>
        </button>

        {/* Flagged Cases Alert */}
        <Link
          href="/cases"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/15 transition-colors text-xs font-medium"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline text-[11px]">3 High Risk</span>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-800 hidden sm:block mx-0.5" />

        {/* Officer Profile & Direct Log Out Button */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-semibold text-indigo-300">
              VS
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-medium text-slate-200 leading-tight">
                {officerName}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {officerBadge}
              </div>
            </div>
          </div>

          {/* Primary TopBar Log Out Action */}
          <LogoutButton variant="solid" showText={true} />
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0d1322] border-b border-slate-800 p-4 space-y-3 shadow-2xl z-50">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300">
                VS
              </div>
              <div>
                <div className="text-xs font-medium text-slate-200">{officerName}</div>
                <div className="text-[10px] text-slate-400">{officerBadge} • Online</div>
              </div>
            </div>
            <LogoutButton variant="solid" showText={true} />
          </div>

          <nav className="space-y-1 text-xs">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800/70"
            >
              Command Center
            </Link>
            <Link
              href="/transactions"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800/70"
            >
              Live Transactions
            </Link>
            <Link
              href="/cases"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800/70"
            >
              Case Files
            </Link>
            <Link
              href="/simulator"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800/70"
            >
              Risk Simulator
            </Link>
            <Link
              href="/models"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800/70"
            >
              Model Diagnostics
            </Link>
            <Link
              href="/audit"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800/70"
            >
              Audit Trail
            </Link>
            <Link
              href="/reports"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800/70"
            >
              Official Reports
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

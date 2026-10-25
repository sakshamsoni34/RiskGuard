"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  ShieldAlert,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";

export function TopBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [officerName, setOfficerName] = useState<string>("Insp. Vikram Sharma");
  const [officerBadge, setOfficerBadge] = useState<string>("CC-8421");
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
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
    if (pathname === "/audit" || pathname === "/history") {
      return { section: "Operations", title: "Transaction & Activity History" };
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
    <header className="sticky top-0 z-40 bg-[#08080a]/90 backdrop-blur-xl border-b border-[#1c1c20] px-4 py-2.5 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-[#18181b] transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span>{pageInfo.section}</span>
            <span>/</span>
            <span className="text-zinc-300 font-medium">{pageInfo.title}</span>
          </div>
          <h1 className="text-sm font-semibold text-white tracking-tight">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Global Quick Search */}
      <div className="hidden lg:flex items-center flex-1 max-w-sm relative mx-4">
        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by transaction ID, customer, or card..."
          className="w-full bg-[#121215] text-xs text-zinc-100 placeholder-zinc-500 pl-9 pr-12 py-1.5 rounded-xl border border-[#242429] focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-600 transition-all"
        />
        <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 bg-[#18181c] rounded border border-[#2b2b30]">
          ⌘K
        </kbd>
      </div>

      {/* Action Controls & Officer Menu */}
      <div className="flex items-center gap-2.5">
        {/* Flagged Cases Alert */}
        <Link
          href="/cases"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/15 transition-colors text-xs font-medium"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline text-[11px]">3 High Risk</span>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px bg-[#222226] hidden sm:block mx-0.5" />

        {/* Officer Profile Card & Dropdown on Top Right */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-[#121215] hover:bg-[#18181c] border border-[#242429] transition-all cursor-pointer group"
            title="Officer Profile & Session"
            aria-label="Officer Profile & Session"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200">
                VS
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#08080a]" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-medium text-zinc-200 leading-tight group-hover:text-white transition-colors">
                {officerName}
              </div>
              <div className="text-[10px] text-zinc-400 leading-tight">
                {officerBadge}
              </div>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
                userMenuOpen ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {/* Floating Officer Credential Card */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0e0e11] border border-[#242429] p-3.5 shadow-2xl z-50 animate-fade-in space-y-3">
              {/* Row 1: Active status & Badge ID */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Session Active</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">{officerBadge}</span>
              </div>

              {/* Row 2: Avatar & Officer Details */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200 shrink-0">
                  VS
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-white truncate">
                    {officerName}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    Lead Investigator
                  </div>
                </div>
              </div>

              {/* Row 3: Horizontal divider & Log Out function */}
              <div className="pt-2 border-t border-[#222226]">
                <LogoutButton variant="dropdown" className="py-2" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#08080a] border-b border-[#1c1c20] p-4 space-y-3 shadow-2xl z-50">
          <div className="flex items-center justify-between pb-3 border-b border-[#1c1c20]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200">
                VS
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-200">{officerName}</div>
                <div className="text-[10px] text-zinc-400">{officerBadge} • Online</div>
              </div>
            </div>
            <LogoutButton variant="solid" showText={true} />
          </div>

          <nav className="space-y-1 text-xs">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-zinc-200 hover:bg-[#141417]"
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
              History
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

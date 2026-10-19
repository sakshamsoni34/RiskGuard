"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  FolderGit2,
  Sliders,
  BrainCircuit,
  FileCheck2,
  Shield,
  Settings,
  ShieldAlert,
  UserCheck,
  ChevronRight,
  LogOut,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  {
    name: "Command Center",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Live Ingestion",
    href: "/transactions",
    icon: Activity,
    badge: "LIVE",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
  },
  {
    name: "Case Registry",
    href: "/cases",
    icon: FolderGit2,
    badge: "3",
    badgeColor: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
  },
  {
    name: "Risk Simulator",
    href: "/simulator",
    icon: Sliders,
  },
  {
    name: "Model Intelligence",
    href: "/models",
    icon: BrainCircuit,
  },
  {
    name: "Audit Trail",
    href: "/audit",
    icon: Shield,
    badge: "HASH-OK",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  },
  {
    name: "Official Reports",
    href: "/reports",
    icon: FileCheck2,
  },
  {
    name: "Settings & Telemetry",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Officer Navigation"
      className="w-64 shrink-0 hidden md:flex flex-col bg-[#070b14] border-r border-[#141d30] select-none min-h-[calc(100vh-29px)] sticky top-[29px]"
    >
      {/* Brand & Badge Header */}
      <div className="p-4 border-b border-[#141d30]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#070b14] rounded-[6px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wide text-white">RiskGuard</span>
              <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                INV
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">Cyber Crime Cell • Unit 4</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Investigative Modules
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-950"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-semibold ${
                      item.badgeColor || "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3 h-3 text-indigo-400" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Officer Credential Card */}
      <div className="p-3 border-t border-[#141d30] bg-[#050810]/70">
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACTIVE SESSION</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400">#CC-8421</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-xs font-mono font-semibold text-indigo-300">
              VS
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-slate-200 truncate">Insp. Vikram Sharma</div>
              <div className="text-[10px] text-slate-400 font-mono">Lead Investigator</div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="truncate">Unit 4: FinFraud Triage</span>
            <Link
              href="/login"
              className="hover:text-rose-400 transition-colors flex items-center gap-0.5"
              title="End authorized session"
            >
              <LogOut className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

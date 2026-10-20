"use client";

import React, { useState, useEffect } from "react";
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
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";

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
    badge: "Live",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  },
  {
    name: "Case Files",
    href: "/cases",
    icon: FolderGit2,
    badge: "3 Open",
    badgeColor: "bg-rose-500/15 text-rose-300 border border-rose-500/25",
  },
  {
    name: "Risk Sandbox",
    href: "/simulator",
    icon: Sliders,
  },
  {
    name: "Model Diagnostics",
    href: "/models",
    icon: BrainCircuit,
  },
  {
    name: "Audit Trail",
    href: "/audit",
    icon: Shield,
    badge: "Verified",
    badgeColor: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25",
  },
  {
    name: "Official Reports",
    href: "/reports",
    icon: FileCheck2,
  },
  {
    name: "Settings & Config",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [officerName, setOfficerName] = useState<string>("Insp. Vikram Sharma");
  const [officerBadge, setOfficerBadge] = useState<string>("CC-8421");

  useEffect(() => {
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

  return (
    <aside
      aria-label="Platform Navigation"
      className="w-64 shrink-0 hidden md:flex flex-col bg-[#0d121f] border-r border-slate-800/80 select-none min-h-screen sticky top-0"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 group-hover:border-indigo-500/50 transition-colors shadow-sm">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                RiskGuard
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Fraud & Risk Operations</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? "bg-indigo-600/15 text-indigo-200 border border-indigo-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
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
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      item.badgeColor || "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Officer Credential Card & Dedicated Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090d17]/80">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Session Active</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{officerBadge}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300 shrink-0">
              VS
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-slate-200 truncate">
                {officerName}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                Lead Investigator
              </div>
            </div>
          </div>

          {/* Explicit Prominent Log Out Action */}
          <div className="pt-2 border-t border-slate-800/80">
            <LogoutButton variant="dropdown" className="justify-center py-1.5" />
          </div>
        </div>
      </div>
    </aside>
  );
}

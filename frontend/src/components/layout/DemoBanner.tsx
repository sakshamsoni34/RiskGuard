"use client";

import React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";

export function DemoBanner() {
  return (
    <div
      role="banner"
      aria-label="Demo environment synthetic data notice"
      className="sticky top-0 z-50 flex items-center justify-between px-4 py-1.5 bg-gradient-to-r from-amber-950/90 via-rose-950/90 to-amber-950/90 border-b border-amber-500/30 text-amber-200 text-xs shadow-md backdrop-blur-md"
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full font-mono text-[11px] sm:text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <span className="font-semibold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
          DEMO ENVIRONMENT
        </span>
        <span className="hidden sm:inline text-amber-200/90">
          SYNTHETIC MOCK DATA ONLY — No real personal or financial records.
        </span>
        <span className="text-amber-300 font-medium truncate">
          AI Risk scores are investigative prioritization leads, NOT evidentiary proof of crime.
        </span>
      </div>
      <div className="hidden md:flex items-center gap-1.5 font-mono text-[10px] text-amber-400/80 shrink-0">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        <span>SEC-AUDIT-ACTIVE</span>
      </div>
    </div>
  );
}

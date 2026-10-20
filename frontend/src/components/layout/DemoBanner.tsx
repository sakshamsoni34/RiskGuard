"use client";

import React, { useState } from "react";
import { Info, X } from "lucide-react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="banner"
      aria-label="Demo environment notice"
      className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300 transition-all backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 truncate">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/25 text-[10px] font-medium text-amber-300 shrink-0">
            Demo Mode
          </span>
          <span className="text-[11px] text-slate-300 truncate">
            Synthetic transaction data for evaluation. Real-time ML models and SHAP explainability are fully operational.
          </span>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors shrink-0"
          title="Dismiss banner"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

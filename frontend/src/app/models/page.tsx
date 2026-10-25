"use client";

import React from "react";
import { ModelAnalytics } from "@/components/ModelAnalytics";
import { BrainCircuit } from "lucide-react";

export default function ModelsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0d0d10] border border-[#222226]">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-zinc-300" />
            <span>Model Intelligence & Diagnostics</span>
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            XGBoost classifier telemetry, Precision-Recall curves, and confusion matrices
          </p>
        </div>

        {/* View Badge: Model Metrics only */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#141418] border border-[#282830] text-xs font-mono text-white flex items-center gap-2 font-semibold shadow-sm">
            <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
            <span>MODEL METRICS</span>
          </div>
        </div>
      </div>

      {/* Content Area - Model Metrics Analytics */}
      <div className="fintech-card p-6 rounded-2xl border border-slate-800">
        <ModelAnalytics />
      </div>
    </div>
  );
}

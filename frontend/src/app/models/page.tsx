"use client";

import React, { useState } from "react";
import { ModelAnalytics } from "@/components/ModelAnalytics";
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import {
  BrainCircuit,
  Workflow,
  AlertTriangle,
  Info,
  CheckCircle2,
  Cpu,
} from "lucide-react";

export default function ModelsPage() {
  const [activeSubTab, setActiveSubTab] = useState<"analytics" | "architecture">("analytics");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b1222] border border-[#17223b]">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <span>Model Intelligence & System Architecture</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            XGBoost classifier telemetry, Precision-Recall curves, confusion matrices, and pipeline topography
          </p>
        </div>

        {/* Sub-tab toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab("analytics")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === "analytics"
                ? "bg-indigo-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>MODEL METRICS</span>
          </button>
          <button
            onClick={() => setActiveSubTab("architecture")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === "architecture"
                ? "bg-indigo-600 text-white font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>ARCHITECTURE</span>
          </button>
        </div>
      </div>

      {/* Model Quality / Calibration Advisory Banner (Addresses Problem P1 transparently) */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-amber-300 flex items-center gap-2">
            <span>MODEL CALIBRATION & BENCHMARK ADVISORY</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              AUDIT NOTE
            </span>
          </div>
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            The initial synthetic dataset exhibits near-perfect class separability (Precision 1.0, ROC-AUC 0.9999).
            These baseline numbers reflect synthetic feature purity and will be recalibrated in Phase 4 with
            overlapping multi-typology distributions, temporal decay, and realistic fraud label noise.
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="fintech-card p-6 rounded-2xl border border-slate-800">
        {activeSubTab === "analytics" ? <ModelAnalytics /> : <ArchitectureDiagram />}
      </div>
    </div>
  );
}

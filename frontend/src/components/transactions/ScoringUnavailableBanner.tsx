"use client";

import React from "react";
import { AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";

interface ScoringUnavailableBannerProps {
  mlStatus: { online: boolean; circuit_breaker: string; error?: string };
  onRetry: () => void;
  isRetrying?: boolean;
}

export const ScoringUnavailableBanner: React.FC<ScoringUnavailableBannerProps> = ({
  mlStatus,
  onRetry,
  isRetrying = false,
}) => {
  if (mlStatus.online && mlStatus.circuit_breaker === "CLOSED") {
    return null;
  }

  return (
    <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs font-mono shadow-xl backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-0.5 sm:mt-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <div className="font-semibold text-slate-100 flex items-center gap-2">
            <span>ML Microservice Degraded — Fallback Scoring Active</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 border border-amber-600/50 text-amber-300">
              Circuit: {mlStatus.circuit_breaker}
            </span>
          </div>
          <p className="mt-1 text-slate-400 text-[11px] leading-relaxed">
            FastAPI ML microservice is temporarily unreachable or timing out. The platform is currently operating via deterministic rule heuristics. Officer investigation workflows remain 100% active.
          </p>
        </div>
      </div>

      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-semibold transition-all disabled:opacity-50 whitespace-nowrap self-end sm:self-center"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
        <span>Check ML Service</span>
      </button>
    </div>
  );
};

"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Platform uncaught error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center max-w-lg mx-auto p-6 fintech-card rounded-2xl border border-rose-500/30">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400">
        <AlertOctagon className="w-8 h-8 animate-pulse" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-100">Telemetry Ingestion Disruption</h2>
        <p className="text-xs text-slate-400 font-mono">
          An unhandled fault occurred during component rendering:{" "}
          <span className="text-rose-400">{error.message || "Unknown platform exception"}</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Command Center</span>
        </Link>
      </div>
    </div>
  );
}

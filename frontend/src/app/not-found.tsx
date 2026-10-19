import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center max-w-md mx-auto p-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
        <Terminal className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <div className="inline-block px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-xs">
          HTTP 404 • UNRESOLVED ROUTE
        </div>
        <h2 className="text-xl font-bold text-slate-100">Restricted or Missing Endpoint</h2>
        <p className="text-xs text-slate-400 font-mono">
          The requested investigative directory or dossier does not exist or requires elevated clearance.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-lg shadow-indigo-900/30"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Command Center</span>
      </Link>
    </div>
  );
}

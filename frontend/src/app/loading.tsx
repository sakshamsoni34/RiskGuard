import React from "react";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <ShieldAlert className="w-6 h-6 text-indigo-400 absolute" />
      </div>
      <div className="text-center font-mono space-y-1">
        <p className="text-xs uppercase tracking-widest text-slate-400">Loading Telemetry & Modules</p>
        <p className="text-[10px] text-slate-500">SECURE LINK ESTABLISHED • UNIT 4</p>
      </div>
    </div>
  );
}

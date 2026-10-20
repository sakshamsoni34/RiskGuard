"use client";

import React from "react";
import { CaseNote } from "@/types/fraud";
import { Clock, ShieldCheck, FileText, User, ChevronRight, ShieldAlert } from "lucide-react";

interface CaseTimelineProps {
  caseNumber: string;
  createdAt: string;
  notes: CaseNote[];
  transactionCount: number;
  status: string;
}

export const CaseTimeline: React.FC<CaseTimelineProps> = ({
  caseNumber,
  createdAt,
  notes,
  transactionCount,
  status,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Investigation Evidence & Decision Timeline</span>
        </h4>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          {notes.length + 1} Logged Events
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#222226]">
        {/* Event 1: Creation */}
        <div className="relative space-y-1">
          <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-zinc-300 border-2 border-[#0d0d10] ring-2 ring-white/10" />
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold text-zinc-200">Case Dossier Initialized ({caseNumber})</span>
            <span className="text-zinc-500">{new Date(createdAt).toLocaleString()}</span>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Originating FIR telemetry linked with {transactionCount} initial banking transactions. Assigned to Cyber Crime Cell lead.
          </p>
        </div>

        {/* Dynamic Notes */}
        {notes.map((n, i) => (
          <div key={n.id || i} className="relative space-y-1">
            <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-zinc-400 border-2 border-[#0d0d10] ring-2 ring-white/10" />
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-zinc-400" />
                <span>{n.officerName}</span>
                <span className="text-[10px] text-zinc-500">({n.officerBadge})</span>
              </span>
              <span className="text-zinc-500">{new Date(n.timestamp).toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#121215] border border-[#222226] text-xs font-mono text-zinc-300 leading-relaxed">
              {n.text}
            </div>
          </div>
        ))}

        {/* Current State Marker */}
        <div className="relative space-y-1">
          <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0d0d10] ring-2 ring-emerald-500/20 animate-pulse" />
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold text-emerald-400">Current Standing: {status}</span>
            <span className="text-zinc-500">Live State</span>
          </div>
          <p className="text-xs text-zinc-500 font-mono">
            Tamper-evident audit chain active. Any status transition generates SHA-256 block record.
          </p>
        </div>
      </div>
    </div>
  );
};

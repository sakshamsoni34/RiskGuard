"use client";

import React from "react";
import Link from "next/link";
import { InvestigationCase, CaseStatus } from "@/types/fraud";
import { FolderGit2, AlertCircle, Clock, ShieldAlert, ArrowRight, UserCheck, Layers } from "lucide-react";

interface CaseKanbanProps {
  cases: InvestigationCase[];
  onStatusChange: (caseId: string, newStatus: CaseStatus) => void;
}

export const CaseKanban: React.FC<CaseKanbanProps> = ({ cases, onStatusChange }) => {
  const columns: { status: CaseStatus; label: string; border: string; bg: string; dot: string }[] = [
    {
      status: "NEW",
      label: "NEW DOSSIERS",
      border: "border-[#27272a]",
      bg: "bg-[#0d0d10]",
      dot: "bg-zinc-300",
    },
    {
      status: "UNDER_INVESTIGATION",
      label: "IN TRIAGE / ACTIVE",
      border: "border-[#27272a]",
      bg: "bg-[#0d0d10]",
      dot: "bg-zinc-300",
    },
    {
      status: "ESCALATED",
      label: "ESCALATED TO LEA",
      border: "border-rose-900/40",
      bg: "bg-[#141014]",
      dot: "bg-rose-400",
    },
    {
      status: "CLOSED",
      label: "RESOLVED / CLOSED",
      border: "border-[#222226]",
      bg: "bg-[#08080a]",
      dot: "bg-zinc-600",
    },
  ];

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "P1_CRITICAL":
        return "bg-rose-500/15 text-rose-300 border-rose-500/40";
      case "P2_HIGH":
        return "bg-amber-500/15 text-amber-300 border-amber-500/40";
      case "P3_MEDIUM":
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/40";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const getNextPermittedStatus = (current: CaseStatus): CaseStatus | null => {
    switch (current) {
      case "NEW":
        return "UNDER_INVESTIGATION";
      case "UNDER_INVESTIGATION":
        return "ESCALATED";
      case "ESCALATED":
        return "CLOSED";
      case "CLOSED":
        return "UNDER_INVESTIGATION";
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colCases = cases.filter((c) => c.status === col.status);
        return (
          <div
            key={col.status}
            className={`flex flex-col rounded-2xl border ${col.border} ${col.bg} p-3.5 min-h-[500px] shadow-lg`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <h3 className="font-mono text-xs font-bold text-slate-200">{col.label}</h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-800">
                {colCases.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colCases.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-slate-600">
                  No cases in {col.status.toLowerCase().replace("_", " ")}
                </div>
              ) : (
                colCases.map((c) => {
                  const nextStatus = getNextPermittedStatus(c.status);
                  return (
                    <div
                      key={c.id}
                      className="group p-4 rounded-xl bg-[#121215] border border-[#222226] hover:border-zinc-500 hover:bg-[#18181c] transition-all shadow-md font-mono space-y-3"
                    >
                      {/* Top Row: Case Number & Priority */}
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/cases/${c.caseNumber || c.id}`}
                          className="text-xs font-bold text-zinc-200 hover:text-white flex items-center gap-1"
                        >
                          <FolderGit2 className="w-3.5 h-3.5" />
                          <span>{c.caseNumber}</span>
                        </Link>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded border font-semibold ${getPriorityBadge(
                            c.priority
                          )}`}
                        >
                          {c.priority.replace("P1_", "").replace("P2_", "")}
                        </span>
                      </div>

                      {/* Title */}
                      <Link
                        href={`/cases/${c.caseNumber || c.id}`}
                        className="block text-xs font-semibold text-slate-200 hover:text-white line-clamp-2 leading-relaxed"
                      >
                        {c.title}
                      </Link>

                      {/* Suspect / Mule Info */}
                      {c.suspectEntity && (
                        <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-2">
                          <span className="text-slate-500">Target:</span>
                          <span className="text-slate-300 truncate max-w-[140px]">{c.suspectEntity}</span>
                        </div>
                      )}

                      {/* Total Amount at Risk & Txns */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div>
                          <span className="text-[10px] text-slate-500 block">AT RISK</span>
                          <span className="font-bold text-slate-100">
                            ₹{c.totalAmountAtRisk.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">EVIDENCE</span>
                          <span className="text-slate-300 flex items-center gap-1 justify-end">
                            <Layers className="w-3 h-3 text-cyan-400" />
                            <span>{c.transactionIds.length} txns</span>
                          </span>
                        </div>
                      </div>

                      {/* Officer & Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-emerald-400" />
                          <span className="truncate max-w-[100px]">{c.assignedTo}</span>
                        </span>

                        {nextStatus && (
                          <button
                            onClick={() => onStatusChange(c.id, nextStatus)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-colors flex items-center gap-1"
                          >
                            <span>Move to {nextStatus === "UNDER_INVESTIGATION" ? "Active" : nextStatus === "ESCALATED" ? "Escalate" : "Close"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

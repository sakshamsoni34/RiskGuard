"use client";

import React, { useState } from "react";
import Link from "next/link";
import { InvestigationCase, CaseStatus } from "@/types/fraud";
import { mockCases } from "@/lib/apiClient";
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  ShieldAlert,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
} from "lucide-react";

export default function CasesPage() {
  const [cases, setCases] = useState<InvestigationCase[]>(mockCases);
  const [statusFilter, setStatusFilter] = useState<"ALL" | CaseStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState("");
  const [newCaseMule, setNewCaseMule] = useState("");
  const [newCasePriority, setNewCasePriority] = useState<InvestigationCase["priority"]>("P2_HIGH");

  const filteredCases = cases.filter((c) => {
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.targetMuleAccount && c.targetMuleAccount.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseTitle.trim()) return;

    const newCase: InvestigationCase = {
      id: `case-${Date.now()}`,
      caseNumber: `CR-2026-0${845 + cases.length}`,
      title: newCaseTitle,
      status: "NEW",
      priority: newCasePriority,
      assignedTo: "Insp. Vikram Sharma",
      targetMuleAccount: newCaseMule || "unassigned@example.org",
      totalAmountAtRisk: 120000,
      transactionIds: ["TXN-1002"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["Manual-Initiation", "CyberCell-Triage"],
      summary: "Manually registered case dossier for further digital forensics investigation.",
      notes: [
        {
          id: `note-${Date.now()}`,
          officerBadge: "#CC-8421",
          officerName: "Insp. V. Sharma",
          timestamp: new Date().toISOString(),
          text: "Case dossier initialized by Lead Investigator.",
        },
      ],
    };

    setCases([newCase, ...cases]);
    setNewCaseTitle("");
    setNewCaseMule("");
    setIsNewCaseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b1222] border border-[#17223b]">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-400" />
            <span>Case Investigation Registry</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {cases.length} REGISTERED
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Dossier tracking for cybercrime incidents, financial mule clusters, and legal escalation
          </p>
        </div>

        <button
          onClick={() => setIsNewCaseModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-medium transition-all shadow-lg shadow-indigo-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>REGISTER NEW CASE DOSSIER</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
          {(["ALL", "NEW", "UNDER_INVESTIGATION", "ESCALATED", "CLOSED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === status
                  ? "bg-indigo-600 text-white font-semibold shadow"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {status.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search case #, title, or mule..."
            className="w-full bg-[#0d1424] text-xs text-slate-200 placeholder-slate-500 pl-9 pr-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map((c) => {
          const isCritical = c.priority === "P1_CRITICAL";
          return (
            <div
              key={c.id}
              className={`fintech-card p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 group hover:border-indigo-500/40 ${
                isCritical ? "border-rose-900/50 bg-rose-950/10" : "border-slate-800"
              }`}
            >
              <div className="space-y-3">
                {/* Top Row: Case Number & Status */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-400">{c.caseNumber}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        c.priority === "P1_CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : c.priority === "P2_HIGH"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {c.priority.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        c.status === "ESCALATED"
                          ? "bg-rose-900/40 text-rose-400"
                          : c.status === "UNDER_INVESTIGATION"
                          ? "bg-cyan-900/40 text-cyan-400"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Case Title */}
                <div>
                  <h3 className="font-semibold text-sm text-slate-100 group-hover:text-indigo-200 transition-colors line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2">{c.summary}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Meta & Action Link */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Amount at Risk:</span>
                  <span className="font-bold text-slate-200">₹{c.totalAmountAtRisk.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Assigned:</span>
                  <span className="text-slate-300">{c.assignedTo}</span>
                </div>
                <div className="pt-2">
                  <Link
                    href={`/cases/${c.id}`}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-indigo-300 font-mono text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700 hover:border-indigo-500/40"
                  >
                    <span>OPEN INVESTIGATION FILE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Case Modal */}
      {isNewCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="fintech-card w-full max-w-lg rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
                <span>Initialize Cybercrime Case Dossier</span>
              </h3>
              <button
                onClick={() => setIsNewCaseModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  CASE INCIDENT TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  placeholder="e.g. Distributed SIM Swap & ATM Cashout Cluster"
                  className="w-full bg-[#070b14] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  TARGET BENEFICIARY / MULE IDENTIFIER (SYNTHETIC)
                </label>
                <input
                  type="text"
                  value={newCaseMule}
                  onChange={(e) => setNewCaseMule(e.target.value)}
                  placeholder="e.g. mule-acc-302@example.org"
                  className="w-full bg-[#070b14] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">TRIAGE PRIORITY</label>
                <select
                  value={newCasePriority}
                  onChange={(e) => setNewCasePriority(e.target.value as InvestigationCase["priority"])}
                  className="w-full bg-[#070b14] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="P1_CRITICAL">P1 - Critical (Immediate Active Exfiltration)</option>
                  <option value="P2_HIGH">P2 - High (Velocity Burst / Multi-account)</option>
                  <option value="P3_MEDIUM">P3 - Medium (Suspicious Geo Anomaly)</option>
                  <option value="P4_LOW">P4 - Low (Low Confidence Heuristic)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCaseModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-medium shadow-md shadow-indigo-900/40"
                >
                  CREATE DOSSIER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

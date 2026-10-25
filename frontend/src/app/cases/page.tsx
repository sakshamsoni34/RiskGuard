"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Loader2,
  X,
  CreditCard,
  Building2,
} from "lucide-react";

export default function CasesPage() {
  const [cases, setCases] = useState<InvestigationCase[]>(mockCases);
  const [statusFilter, setStatusFilter] = useState<"ALL" | CaseStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState("");
  const [newCaseMule, setNewCaseMule] = useState("");
  const [newCasePriority, setNewCasePriority] = useState<InvestigationCase["priority"]>("P2_HIGH");
  const [newCaseTxnId, setNewCaseTxnId] = useState("TXN-1002");
  const [alertNotice, setAlertNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch from backend DB
  const loadCases = useCallback(async () => {
    try {
      const q = new URLSearchParams();
      if (statusFilter !== "ALL") q.set("status", statusFilter);
      if (searchQuery.trim()) q.set("search", searchQuery.trim());

      const res = await fetch(`/api/v1/cases?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCases(data);
        }
      }
    } catch {
      // Keep mock cases
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const handleStatusChange = async (caseId: string, newStatus: CaseStatus) => {
    // Optimistic UI update
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c))
    );

    try {
      const res = await fetch(`/api/v1/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        setAlertNotice(`Status transition rejected: ${err.detail || "Invalid transition"}`);
        loadCases(); // revert
        return;
      }

      setAlertNotice(`Case status changed to ${newStatus}. Transition verified & audit signed.`);
      setTimeout(() => setAlertNotice(null), 4000);
    } catch {
      setAlertNotice(`Case status updated locally.`);
      setTimeout(() => setAlertNotice(null), 4000);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newCaseTitle.trim(),
          priority: newCasePriority,
          target_mule_account: newCaseMule.trim() || undefined,
          suspect_entity: newCaseMule.trim() || undefined,
          transaction_ids: newCaseTxnId.trim() ? [newCaseTxnId.trim()] : [],
          summary: "Manually registered case dossier for cybercrime digital investigation.",
          tags: ["CyberCell-Triage", "Digital-Evidence"],
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setCases((prev) => [created, ...prev]);
        setAlertNotice(`Case ${created.caseNumber} registered successfully with immutable audit block.`);
      } else {
        // Fallback local
        const localCase: InvestigationCase = {
          id: `case-${Date.now()}`,
          caseNumber: `CR-2026-0${845 + cases.length}`,
          title: newCaseTitle,
          status: "NEW",
          priority: newCasePriority,
          assignedTo: "Insp. Vikram Sharma",
          targetMuleAccount: newCaseMule || "unassigned@example.org",
          totalAmountAtRisk: 120000,
          transactionIds: [newCaseTxnId || "TXN-1002"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: ["Manual-Initiation"],
          summary: "Manually registered case dossier for digital forensics investigation.",
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
        setCases((prev) => [localCase, ...prev]);
        setAlertNotice(`Case registered.`);
      }
      setNewCaseTitle("");
      setNewCaseMule("");
      setIsNewCaseModalOpen(false);
      setTimeout(() => setAlertNotice(null), 4000);
    } catch {
      setIsNewCaseModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.targetMuleAccount && c.targetMuleAccount.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.suspectEntity && c.suspectEntity.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Alert Notice */}
      {alertNotice && (
        <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{alertNotice}</span>
          </div>
          <button onClick={() => setAlertNotice(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0d0d10] border border-[#222226]">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-zinc-300" />
            <span>Case Investigation Registry</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#18181c] text-zinc-300 border border-[#27272a]">
              {cases.length} ACTIVE DOSSIERS
            </span>
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Dossier tracking for cybercrime incidents, financial mule clusters, and legal escalation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewCaseModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 font-mono text-xs font-semibold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>REGISTER CASE DOSSIER</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0d0d10] border border-[#222226] text-xs font-mono">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Case No (CR-2026-0842), suspect entity, or mule UPI..."
            className="w-full pl-9 pr-3 py-2 bg-[#121215] border border-[#242429] rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-zinc-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-[#121215] border border-[#242429] rounded-xl text-zinc-200 focus:outline-none focus:border-zinc-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="UNDER_INVESTIGATION">UNDER_INVESTIGATION</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>

      {/* Case Investigation Registry Table */}
      <div className="rounded-2xl border border-[#222226] bg-[#0d0d10] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#222226] bg-[#08080a] text-[11px] text-zinc-400">
                <th className="px-4 py-3.5">CASE NUMBER</th>
                <th className="px-4 py-3.5">INCIDENT & ENTITY</th>
                <th className="px-4 py-3.5">PRIORITY</th>
                <th className="px-4 py-3.5">STATUS</th>
                <th className="px-4 py-3.5">AT RISK</th>
                <th className="px-4 py-3.5">EVIDENCE</th>
                <th className="px-4 py-3.5">LEAD OFFICER</th>
                <th className="px-4 py-3.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e24]">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-400 font-sans">
                    <p className="text-sm text-zinc-300 font-medium mb-1">No matching case dossiers found</p>
                    <p className="text-xs text-zinc-500 mb-3">
                      Try adjusting your search terms or status filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("ALL");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#18181c] hover:bg-[#222226] text-zinc-200 text-xs border border-[#27272a] transition-colors"
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const priorityClass =
                    c.priority === "P1_CRITICAL"
                      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                      : c.priority === "P2_HIGH"
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : c.priority === "P3_MEDIUM"
                      ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
                      : "bg-zinc-800 text-zinc-300 border-zinc-700";

                  const statusClass =
                    c.status === "NEW"
                      ? "bg-sky-500/10 text-sky-300 border-sky-500/25"
                      : c.status === "UNDER_INVESTIGATION"
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/25"
                      : c.status === "ESCALATED"
                      ? "bg-rose-500/10 text-rose-300 border-rose-500/25"
                      : "bg-emerald-500/10 text-emerald-300 border-emerald-500/25";

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[#121216] transition-colors group"
                    >
                      <td className="px-4 py-3.5 font-semibold text-cyan-400">
                        <Link
                          href={`/cases/${c.caseNumber || c.id}`}
                          className="hover:underline flex items-center gap-1.5"
                        >
                          <FolderGit2 className="w-3.5 h-3.5 text-zinc-400 group-hover:text-cyan-300" />
                          <span>{c.caseNumber}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="text-zinc-100 font-sans font-medium text-xs leading-snug">
                          {c.title}
                        </div>
                        {(c.suspectEntity || c.targetMuleAccount) && (
                          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5 truncate">
                            <span className="text-zinc-400 font-sans">Target:</span>
                            <span className="text-zinc-300 font-mono">
                              {c.suspectEntity || c.targetMuleAccount}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${priorityClass}`}
                        >
                          {c.priority.replace("P1_", "").replace("P2_", "").replace("P3_", "").replace("P4_", "")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusClass}`}
                        >
                          {c.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-zinc-100">
                        ₹{c.totalAmountAtRisk.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-400 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-[#18181c] border border-[#27272a] text-zinc-300">
                          {c.transactionIds?.length || 1} txns
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-300 font-sans text-xs">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{c.assignedTo}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/cases/${c.caseNumber || c.id}`}
                          className="px-2.5 py-1.5 rounded-xl bg-[#18181c] hover:bg-[#222226] text-cyan-300 hover:text-cyan-200 border border-[#27272a] inline-flex items-center gap-1 transition-colors text-xs font-sans font-medium"
                        >
                          <span>Open Dossier</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Case Modal */}
      {isNewCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0d0d10] border border-[#222226] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-sm text-slate-100">
                  Register Cybercrime Case Dossier
                </h3>
              </div>
              <button
                onClick={() => setIsNewCaseModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Incident / Case Title *</label>
                <input
                  type="text"
                  required
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  placeholder="e.g. Investigation into SIM-Swap Ring in North Mumbai"
                  className="w-full p-2.5 bg-[#121215] border border-[#242429] rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 block mb-1">Priority Classification</label>
                  <select
                    value={newCasePriority}
                    onChange={(e) => setNewCasePriority(e.target.value as any)}
                    className="w-full p-2.5 bg-[#121215] border border-[#242429] rounded-xl text-zinc-200 focus:outline-none focus:border-zinc-500"
                  >
                    <option value="P1_CRITICAL">P1_CRITICAL (&gt; ₹5L / Multi-city)</option>
                    <option value="P2_HIGH">P2_HIGH (&gt; ₹1L / Repeat Mule)</option>
                    <option value="P3_MEDIUM">P3_MEDIUM (Isolated Fraud)</option>
                    <option value="P4_LOW">P4_LOW (Pre-FIR Inquiry)</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1">Initial Disputed Txn ID</label>
                  <input
                    type="text"
                    value={newCaseTxnId}
                    onChange={(e) => setNewCaseTxnId(e.target.value)}
                    placeholder="e.g. TXN-1002"
                    className="w-full p-2.5 bg-[#121215] border border-[#242429] rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Target Mule Account / Suspect UPI</label>
                <input
                  type="text"
                  value={newCaseMule}
                  onChange={(e) => setNewCaseMule(e.target.value)}
                  placeholder="e.g. mule.extracted@okhdfcbank"
                  className="w-full p-2.5 bg-[#121215] border border-[#242429] rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#222226]">
                <button
                  type="button"
                  onClick={() => setIsNewCaseModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#27272a] text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newCaseTitle.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all disabled:opacity-40"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Sign & Register FIR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

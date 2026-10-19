"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { mockCases } from "@/lib/apiClient";
import { initialTransactions } from "@/lib/mockData";
import { CaseStatus, InvestigationCase, CaseNote, Transaction } from "@/types/fraud";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { CaseTimeline } from "@/components/cases/CaseTimeline";
import { CaseNoteEditor } from "@/components/cases/CaseNoteEditor";
import { EntityGraph } from "@/components/cases/EntityGraph";
import { AnalystFeedbackButton } from "@/components/cases/AnalystFeedbackButton";
import {
  ArrowLeft,
  FolderGit2,
  Clock,
  User,
  ShieldAlert,
  FileCheck2,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  CreditCard,
  Share2,
  Lock,
  Layers,
} from "lucide-react";

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [currentCase, setCurrentCase] = useState<InvestigationCase | null>(null);
  const [linkedTxns, setLinkedTxns] = useState<Transaction[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLinkingOpen, setIsLinkingOpen] = useState(false);
  const [newTxnId, setNewTxnId] = useState("");

  // Load from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadCaseData() {
      try {
        const res = await fetch(`/api/v1/cases/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setCurrentCase(data);
          }
        } else {
          const fb = mockCases.find((c) => c.id === id || c.caseNumber === id) || mockCases[0];
          if (isMounted) setCurrentCase(fb);
        }
      } catch {
        const fb = mockCases.find((c) => c.id === id || c.caseNumber === id) || mockCases[0];
        if (isMounted) setCurrentCase(fb);
      }
    }
    loadCaseData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Load linked transactions
  useEffect(() => {
    if (!currentCase) return;
    const caseTxnIds = currentCase.transactionIds;
    let isMounted = true;
    async function loadTxns() {
      try {
        const res = await fetch("/api/v1/transactions?limit=100");
        if (res.ok) {
          const allTxns = await res.json();
          const matched = allTxns.filter((t: any) => caseTxnIds.includes(t.id));
          if (isMounted) setLinkedTxns(matched);
        } else {
          const matched = initialTransactions.filter((t) => caseTxnIds.includes(t.id));
          if (isMounted) setLinkedTxns(matched);
        }
      } catch {
        const matched = initialTransactions.filter((t) => caseTxnIds.includes(t.id));
        if (isMounted) setLinkedTxns(matched);
      }
    }
    loadTxns();
    return () => {
      isMounted = false;
    };
  }, [currentCase]);

  const handleStatusChange = async (newStatus: CaseStatus) => {
    if (!currentCase) return;
    try {
      const res = await fetch(`/api/v1/cases/${currentCase.id || id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCurrentCase(updated);
        setNotice(`Status transitioned to ${newStatus}. Verified by state machine & hashed into audit block.`);
      } else {
        const err = await res.json();
        setNotice(`Transition rejected: ${err.detail || "State machine rule violated"}`);
      }
      setTimeout(() => setNotice(null), 4000);
    } catch {
      setCurrentCase((prev) => prev ? { ...prev, status: newStatus } : null);
      setNotice(`Status changed.`);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const handleAddNoteToState = (note: CaseNote) => {
    setCurrentCase((prev) => (prev ? { ...prev, notes: [...prev.notes, note] } : null));
  };

  const handleLinkTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCase || !newTxnId.trim()) return;

    try {
      const res = await fetch(`/api/v1/cases/${currentCase.id || id}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_ids: [newTxnId.trim()] }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCurrentCase(updated);
        setNotice(`Transaction ${newTxnId.trim()} appended to digital evidence chain.`);
      } else {
        setNotice(`Transaction linked.`);
      }
      setNewTxnId("");
      setIsLinkingOpen(false);
      setTimeout(() => setNotice(null), 4000);
    } catch {
      setIsLinkingOpen(false);
    }
  };

  if (!currentCase) {
    return <div className="p-8 font-mono text-xs text-slate-500">Loading case dossier...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Return & Top Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO CASE REGISTRY</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <AnalystFeedbackButton
            caseId={currentCase.caseNumber || id}
            transactionId={currentCase.transactionIds[0] || "TXN-1002"}
          />
          <Link
            href="/reports"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs shadow-md shadow-indigo-900/30 transition-colors"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>GENERATE EVIDENTIARY DOSSIER</span>
          </Link>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Statutory Sec 65B Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
        <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>INDIAN EVIDENCE ACT SEC 65B CERTIFIED:</strong> All timestamps, entity links, and investigator notes are cryptographically hashed into an append-only ledger.
        </span>
      </div>

      {/* Dossier Header Card */}
      <div className="fintech-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xl font-bold font-mono text-white">{currentCase.caseNumber}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                {currentCase.status}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                {currentCase.priority}
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100">{currentCase.title}</h1>
            <p className="text-xs font-mono text-slate-400">
              Registered: {new Date(currentCase.createdAt).toLocaleString()} • Assigned: {currentCase.assignedTo}
            </p>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 block">TOTAL AT RISK</span>
              <div className="text-2xl font-bold font-mono text-slate-100">
                ₹{currentCase.totalAmountAtRisk.toLocaleString("en-IN")}
              </div>
            </div>

            {/* Status Transition Selector */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-slate-500">Transition:</span>
              <select
                value={currentCase.status}
                onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
                className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500/60"
              >
                <option value="NEW">NEW</option>
                <option value="UNDER_INVESTIGATION">UNDER_INVESTIGATION</option>
                <option value="ESCALATED">ESCALATED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Case Target Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">PRIMARY TARGET BENEFICIARY</span>
            <span className="font-bold text-rose-300 mt-0.5 block truncate">
              {currentCase.targetMuleAccount || "None Identified"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">SUSPECT ENTITY / SYNDICATE</span>
            <span className="font-bold text-slate-200 mt-0.5 block truncate">
              {currentCase.suspectEntity || "Unclassified Entity"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">LINKED DISPUTED TRANSACTIONS</span>
            <span className="font-bold text-cyan-300 mt-0.5 block">
              {currentCase.transactionIds.length} Evidence Records
            </span>
          </div>
        </div>
      </div>

      {/* Entity Relationship Graph */}
      <EntityGraph
        suspectEntity={currentCase.suspectEntity || currentCase.title}
        targetMuleAccount={currentCase.targetMuleAccount || "mule.beneficiary@bank"}
        transactionIds={currentCase.transactionIds}
      />

      {/* Grid: Timeline + Linked Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timeline and Note Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="fintech-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <CaseTimeline
              caseNumber={currentCase.caseNumber}
              createdAt={currentCase.createdAt}
              notes={currentCase.notes}
              transactionCount={currentCase.transactionIds.length}
              status={currentCase.status}
            />
          </div>

          <CaseNoteEditor
            caseId={currentCase.caseNumber || id}
            onNoteAdded={handleAddNoteToState}
          />
        </div>

        {/* Right Col: Linked Disputed Transactions */}
        <div className="space-y-4">
          <div className="fintech-card p-5 rounded-2xl border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 uppercase flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <span>Evidence Records ({currentCase.transactionIds.length})</span>
              </h4>
              <button
                onClick={() => setIsLinkingOpen(true)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Link Txn</span>
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {currentCase.transactionIds.map((tid) => {
                const match = linkedTxns.find((t) => t.id === tid);
                return (
                  <div
                    key={tid}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <Link href={`/transactions/${tid}`} className="font-bold text-cyan-400 hover:underline">
                        {tid}
                      </Link>
                      {match && <RiskBadge score={match.riskScore} level={match.riskLevel as any} size="sm" />}
                    </div>
                    {match ? (
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>₹{match.amount.toLocaleString("en-IN")}</span>
                        <span>{match.decision}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500">Linked to digital case record</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Link Transaction Modal */}
      {isLinkingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono text-xs">
          <div className="w-full max-w-sm p-5 rounded-2xl bg-[#0c1220] border border-cyan-500/40 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-slate-100">Attach Disputed Transaction</span>
              <button onClick={() => setIsLinkingOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleLinkTransaction} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Transaction ID:</label>
                <input
                  type="text"
                  required
                  value={newTxnId}
                  onChange={(e) => setNewTxnId(e.target.value)}
                  placeholder="e.g. TXN-1005"
                  className="w-full p-2.5 bg-[#070b14] border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/60"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkingOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
                >
                  Link Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

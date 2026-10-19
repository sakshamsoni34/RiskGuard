"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { mockCases } from "@/lib/apiClient";
import { initialTransactions } from "@/lib/mockData";
import { CaseStatus, InvestigationCase, CaseNote } from "@/types/fraud";
import { RiskBadge } from "@/components/ui/RiskBadge";
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
} from "lucide-react";

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Find case or fallback to first
  const initialCase = mockCases.find((c) => c.id === id) || mockCases[0];
  const [currentCase, setCurrentCase] = useState<InvestigationCase>(initialCase);
  const [newNoteText, setNewNoteText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  // Associated transactions
  const linkedTxns = initialTransactions.filter((t) =>
    currentCase.transactionIds.includes(t.id)
  );

  const handleStatusChange = (newStatus: CaseStatus) => {
    setCurrentCase((prev) => ({
      ...prev,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    }));
    setNotice(`Case status transitioned to ${newStatus}. Logged to immutable audit trail.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const note: CaseNote = {
      id: `note-${Date.now()}`,
      officerBadge: "#CC-8421",
      officerName: "Insp. Vikram Sharma",
      timestamp: new Date().toISOString(),
      text: newNoteText.trim(),
    };

    setCurrentCase((prev) => ({
      ...prev,
      notes: [...prev.notes, note],
      updatedAt: new Date().toISOString(),
    }));
    setNewNoteText("");
    setNotice("Investigation note appended and cryptographically hashed.");
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Return link */}
      <div className="flex items-center justify-between">
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO CASE REGISTRY</span>
        </Link>
        <Link
          href="/reports"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs shadow-md shadow-indigo-900/30 transition-colors"
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>GENERATE EVIDENTIARY REPORT</span>
        </Link>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Case Header Dossier */}
      <div className="fintech-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold font-mono text-white">{currentCase.caseNumber}</span>
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                  currentCase.status === "ESCALATED"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                }`}
              >
                {currentCase.status}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {currentCase.priority}
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100">{currentCase.title}</h1>
            <p className="text-xs font-mono text-slate-400">
              Assigned: {currentCase.assignedTo} • Created: {new Date(currentCase.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">TOTAL DISPUTED AMOUNT</span>
            <div className="text-2xl font-bold font-mono text-slate-100">
              ₹{currentCase.totalAmountAtRisk.toLocaleString("en-IN")}
            </div>
            <span className="text-xs font-mono text-slate-400">
              Mule Target: {currentCase.targetMuleAccount || "N/A"}
            </span>
          </div>
        </div>

        {/* Transition Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
          <span className="text-slate-500 uppercase text-[10px] mr-1">Status Transitions:</span>
          {(["NEW", "UNDER_INVESTIGATION", "ESCALATED", "CLOSED"] as CaseStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={currentCase.status === status}
              className={`px-2.5 py-1 rounded transition-colors ${
                currentCase.status === status
                  ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 cursor-default"
                  : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700"
              }`}
            >
              {status.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Evidence Transactions & Investigation Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Linked Transactions Evidence */}
        <div className="lg:col-span-2 space-y-4">
          <div className="fintech-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span>Linked Evidence Transactions ({linkedTxns.length})</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">PRIORITIZED LEADS</span>
            </div>

            <div className="space-y-2">
              {linkedTxns.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-100">{t.id}</span>
                      <RiskBadge level={t.riskLevel} score={t.riskScore} />
                      <span className="text-[11px] font-mono text-slate-400">{t.merchantCategory}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      <span>{t.customerName}</span> • <span className="font-mono">{t.location.city}</span> •{" "}
                      <span className="font-mono text-slate-500">{t.device.os}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2">
                    <div className="font-mono font-bold text-sm text-slate-100">
                      ₹{t.amount.toLocaleString("en-IN")}
                    </div>
                    <Link
                      href={`/transactions/${t.id}`}
                      className="text-xs font-mono text-indigo-400 hover:text-indigo-300"
                    >
                      DOSSIER →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Narrative */}
          <div className="fintech-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold">Incident Narrative</h4>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">{currentCase.summary}</p>
          </div>
        </div>

        {/* Right Col: Officer Notes & Case Timeline */}
        <div className="space-y-6">
          <div className="fintech-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Officer Chronology & Notes</span>
            </h3>

            {/* Existing Notes */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {currentCase.notes.length === 0 ? (
                <p className="text-xs font-mono text-slate-500">No investigator notes recorded yet.</p>
              ) : (
                currentCase.notes.map((note) => (
                  <div key={note.id} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="text-indigo-300 font-semibold">{note.officerName}</span>
                      <span>{new Date(note.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-xs font-mono text-slate-200">{note.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-800">
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log investigative observation or liaison request..."
                className="w-full bg-[#070b14] border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>APPEND INVESTIGATION NOTE</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

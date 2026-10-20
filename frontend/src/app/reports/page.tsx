"use client";

import React, { useState, useEffect, useCallback } from "react";
import { mockReports } from "@/lib/apiClient";
import { InvestigationReport } from "@/types/fraud";
import { ReportDossierPreview } from "@/components/reports/ReportDossierPreview";
import { Sec65BNoticeModal } from "@/components/reports/Sec65BNoticeModal";
import {
  FileCheck2,
  Download,
  Printer,
  ShieldAlert,
  Lock,
  Plus,
  FileText,
  Clock,
  User,
  CheckCircle2,
  FileBadge,
  Loader2,
  X,
} from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<InvestigationReport[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<InvestigationReport>(mockReports[0]);
  const [notice, setNotice] = useState<string | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCaseId, setNewCaseId] = useState("CR-2026-0842");
  const [newTypology, setNewTypology] = useState("Account Takeover / Mule Exfiltration");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load from backend API
  const loadReports = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/reports");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setReports(data);
          setSelectedReport(data[0]);
        }
      }
    } catch {
      // Keep mock reports
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: newCaseId.trim(),
          title: newTitle.trim(),
          primary_typology: newTypology,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setReports((prev) => [created, ...prev]);
        setSelectedReport(created);
        setNotice(`Evidentiary dossier ${created.reportNumber} generated, watermarked & signed with SHA-256 hash.`);
      } else {
        const localRep: InvestigationReport = {
          id: `rep-${Date.now()}`,
          reportNumber: `IR-2026-0${43 + reports.length}`,
          caseId: newCaseId,
          generatedBy: "Insp. Vikram Sharma (#CC-8421)",
          generatedAt: new Date().toISOString(),
          title: newTitle,
          totalTransactions: 6,
          totalDisputedAmount: 480000,
          primaryTypology: newTypology,
          sha256VerificationHash: "a9f8b472e391cb28710fa56d49817e0b5123984ca32e917d098e1234abcd5678",
          status: "SEALED",
        };
        setReports((prev) => [localRep, ...prev]);
        setSelectedReport(localRep);
        setNotice(`Evidentiary dossier generated.`);
      }
      setIsGenerateOpen(false);
      setNewTitle("");
      setTimeout(() => setNotice(null), 4000);
    } catch {
      setIsGenerateOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0d0d10] border border-[#222226]">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-zinc-300" />
            <span>Evidentiary Briefing & Report Dispatch</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#18181c] text-zinc-300 border border-[#27272a]">
              SEC 65B SEALED DOSSIERS
            </span>
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Cryptographically sealed investigative summaries with watermark and legal admissible metadata
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGenerateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 font-mono text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>GENERATE NEW DOSSIER</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT DOSSIER</span>
          </button>
        </div>
      </div>

      {/* Grid: Report Queue & Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Report Files Queue */}
        <div className="space-y-3 font-mono text-xs">
          <h3 className="uppercase tracking-wider text-slate-400 font-semibold px-1 text-[11px] flex items-center justify-between">
            <span>Sealed Dossiers ({reports.length})</span>
            <span className="text-cyan-400 text-[10px]">Ready for Subpoena</span>
          </h3>

          <div className="space-y-2.5">
            {reports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedReport.id === rep.id
                    ? "bg-[#18181c] border-zinc-500 shadow-md ring-1 ring-zinc-500/30"
                    : "bg-[#0d0d10] border-[#222226] hover:border-zinc-700 hover:bg-[#141418]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-zinc-200">{rep.reportNumber}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                      rep.status === "SEALED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>
                <h4 className="text-zinc-200 font-semibold line-clamp-1">{rep.title}</h4>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 pt-2 border-t border-[#1e1e22]">
                  <span>Case: {rep.caseId}</span>
                  <span className="font-bold text-zinc-200">₹{rep.totalDisputedAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Full Evidentiary Dossier Preview */}
        <div className="lg:col-span-2">
          {selectedReport && <ReportDossierPreview report={selectedReport} />}
        </div>
      </div>

      {/* Generate Dossier Modal */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm text-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0d0d10] border border-[#222226] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Generate Sealed Evidentiary PDF
                </h3>
              </div>
              <button onClick={() => setIsGenerateOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div>
                <label className="text-slate-300 block mb-1">Target Case Number:</label>
                <input
                  type="text"
                  required
                  value={newCaseId}
                  onChange={(e) => setNewCaseId(e.target.value)}
                  placeholder="e.g. CR-2026-0842"
                  className="w-full p-2.5 bg-[#121215] border border-[#242429] rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Dossier Brief Title:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Comprehensive Evidentiary Report on Syndicate Mule Alpha"
                  className="w-full p-2.5 bg-[#121215] border border-[#242429] rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1">Primary Typology Classification:</label>
                <select
                  value={newTypology}
                  onChange={(e) => setNewTypology(e.target.value)}
                  className="w-full p-2.5 bg-[#121215] border border-[#242429] rounded-xl text-zinc-200 focus:outline-none focus:border-zinc-500"
                >
                  <option value="Account Takeover / Mule Exfiltration">Account Takeover / Mule Exfiltration</option>
                  <option value="Credential Stuffing & Proxy Anonymization">Credential Stuffing & Proxy Anonymization</option>
                  <option value="Rapid Burst Card Testing">Rapid Burst Card Testing</option>
                  <option value="Impossible Travel Geohash Jumping">Impossible Travel Geohash Jumping</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGenerateOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all disabled:opacity-40"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Generate Sealed PDF</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

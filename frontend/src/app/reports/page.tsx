"use client";

import React, { useState } from "react";
import { mockReports } from "@/lib/apiClient";
import { InvestigationReport } from "@/types/fraud";
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
} from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<InvestigationReport[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<InvestigationReport>(mockReports[0]);
  const [notice, setNotice] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleSealReport = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "SEALED" } : r))
    );
    if (selectedReport.id === id) {
      setSelectedReport((prev) => ({ ...prev, status: "SEALED" }));
    }
    setNotice(`Report ${selectedReport.reportNumber} sealed with SHA-256 digital watermark.`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b1222] border border-[#17223b]">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-400" />
            <span>Evidentiary Briefing & Report Dispatch</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              LEGAL DOSSIER
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cryptographically sealed investigative summaries with watermark and Sec 65B metadata
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT DOSSIER</span>
          </button>
        </div>
      </div>

      {/* Grid: Report List & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Report Files */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
            Dispatch Queue ({reports.length})
          </h3>
          {reports.map((rep) => (
            <div
              key={rep.id}
              onClick={() => setSelectedReport(rep)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedReport.id === rep.id
                  ? "bg-indigo-950/25 border-indigo-500/50 shadow-md"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-indigo-300">{rep.reportNumber}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                    rep.status === "SEALED"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {rep.status}
                </span>
              </div>
              <h4 className="text-xs text-slate-200 font-medium line-clamp-1">{rep.title}</h4>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                <span>Case: {rep.caseId}</span>
                <span>₹{rep.totalDisputedAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right 2 Columns: Formal Report Preview Sheet */}
        <div className="lg:col-span-2">
          <div className="fintech-card rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6 relative overflow-hidden bg-[#0c1222]">
            {/* Watermark Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none rotate-[-25deg]">
              <span className="text-7xl font-bold font-mono tracking-widest text-white">
                CYBER CELL • CONFIDENTIAL
              </span>
            </div>

            {/* Document Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileBadge className="w-5 h-5 text-indigo-400" />
                  <span className="font-mono text-xs uppercase tracking-wider text-indigo-300 font-semibold">
                    OFFICIAL INVESTIGATION BRIEFING
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{selectedReport.title}</h2>
                <p className="text-xs font-mono text-slate-400">
                  Dossier Ref: {selectedReport.reportNumber} • Target Case: {selectedReport.caseId}
                </p>
              </div>

              <div className="flex sm:flex-col items-end gap-2">
                {selectedReport.status === "DRAFT" && (
                  <button
                    onClick={() => handleSealReport(selectedReport.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-medium shadow-md shadow-emerald-950 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>SEAL REPORT</span>
                  </button>
                )}
                <span className="text-[10px] font-mono text-slate-500">
                  SEAL STATUS: {selectedReport.status}
                </span>
              </div>
            </div>

            {/* Disclaimer Callout (Section 65B) */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300 uppercase">
                Indian Evidence Act Sec 65B Compliance Caveat:
              </p>
              <p className="leading-relaxed">
                This document compiles automated risk scores and SHAP explainability matrices for investigative
                prioritization. Machine learning predictions represent statistical likelihood, not conclusive legal
                evidence of fraud or guilt.
              </p>
            </div>

            {/* Metric Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">TOTAL DISPUTED VOLUME</span>
                <span className="text-sm font-bold text-slate-100 mt-1 block">
                  ₹{selectedReport.totalDisputedAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">EVIDENCE TRANSACTIONS</span>
                <span className="text-sm font-bold text-slate-100 mt-1 block">
                  {selectedReport.totalTransactions} Items Linked
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">PRIMARY TYPOLOGY</span>
                <span className="text-xs font-bold text-rose-300 mt-1 block">
                  {selectedReport.primaryTypology}
                </span>
              </div>
            </div>

            {/* Officer & Audit Hash Block */}
            <div className="p-4 rounded-xl bg-[#080d19] border border-slate-800/80 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Certifying Officer:</span>
                <span className="text-slate-200">{selectedReport.generatedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp of Record:</span>
                <span className="text-slate-200">{new Date(selectedReport.generatedAt).toUTCString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 text-[10px] block mb-1">CRYPTOGRAPHIC CERTIFICATE HASH (SHA-256)</span>
                <span className="text-[10px] text-cyan-400 break-all font-bold">
                  {selectedReport.sha256VerificationHash}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

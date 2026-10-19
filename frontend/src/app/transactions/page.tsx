"use client";

import React, { useState, useEffect } from "react";
import { Transaction, RiskLevel } from "@/types/fraud";
import { initialTransactions } from "@/lib/mockData";
import { generateRandomTransaction } from "@/lib/scoringEngine";
import { TransactionTable } from "@/components/TransactionTable";
import { InlineInspector } from "@/components/InlineInspector";
import { TransactionModal } from "@/components/TransactionModal";
import { soundEngine } from "@/lib/soundFx";
import { Activity, Play, Pause, Filter, ShieldCheck, CheckCircle2, Download } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(initialTransactions[0]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<"ALL" | RiskLevel>("ALL");
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  // Background stream
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      const newTxn = generateRandomTransaction(false);
      if (newTxn.decision === "BLOCKED") {
        soundEngine.playAttackAlert();
      } else if (newTxn.decision === "OTP_REQUIRED") {
        soundEngine.playStepUpAlert();
      } else {
        soundEngine.playIngestBlip();
      }
      setTransactions((prev) => [newTxn, ...prev.slice(0, 49)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleUpdateStatus = (txnId: string, newAction: Transaction["decision"]) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txnId
          ? {
              ...t,
              decision: newAction,
              status: "MANUALLY_OVERRIDDEN",
            }
          : t
      )
    );
    if (selectedTxn && selectedTxn.id === txnId) {
      setSelectedTxn((prev) => (prev ? { ...prev, decision: newAction, status: "MANUALLY_OVERRIDDEN" } : null));
    }
    setAlertNotice(`Transaction ${txnId} manually updated to ${newAction}. Audit logged.`);
    setTimeout(() => setAlertNotice(null), 4000);
  };

  const exportCsv = () => {
    const headers = ["ID", "Timestamp", "Customer", "Amount", "Currency", "RiskScore", "Decision", "Merchant"];
    const rows = transactions.map((t) => [
      t.id,
      t.timestamp,
      t.customerName,
      t.amount,
      t.currency,
      t.riskScore,
      t.decision,
      t.merchant,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `telemetry-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Action Notice */}
      {alertNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{alertNotice}</span>
          </div>
          <button onClick={() => setAlertNotice(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b1222] border border-[#17223b]">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Investigative Transaction Stream</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              BUFFER: {transactions.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Synthetic banking network traffic with ML risk triage and SHAP contributions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs transition-colors"
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isStreaming ? "PAUSE INGEST" : "RESUME INGEST"}</span>
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-mono text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Table & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={selectedTxn ? "lg:col-span-2" : "lg:col-span-3"}>
          <TransactionTable
            transactions={transactions}
            selectedTransactionId={selectedTxn?.id}
            onSelectTransaction={(txn) => setSelectedTxn(txn)}
            activeFilter={activeFilter}
            onFilterChange={(filter) => setActiveFilter(filter)}
          />
        </div>

        {selectedTxn && (
          <div className="lg:col-span-1">
            <InlineInspector
              transaction={selectedTxn}
              onClose={() => setSelectedTxn(null)}
              onExpandModal={() => setIsModalOpen(true)}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
        )}
      </div>

      {/* Expanded Modal */}
      {isModalOpen && selectedTxn && (
        <TransactionModal
          transaction={selectedTxn}
          onClose={() => setIsModalOpen(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}

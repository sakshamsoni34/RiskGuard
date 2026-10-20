"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Transaction, RiskLevel } from "@/types/fraud";
import { initialTransactions } from "@/lib/mockData";
import { generateRandomTransaction } from "@/lib/scoringEngine";
import { InlineInspector } from "@/components/InlineInspector";
import { TransactionModal } from "@/components/TransactionModal";
import { soundEngine } from "@/lib/soundFx";
import { FilterBar, FilterState } from "@/components/transactions/FilterBar";
import { TransactionListRow } from "@/components/transactions/TransactionListRow";
import { BulkActionBar } from "@/components/transactions/BulkActionBar";
import { ScoringUnavailableBanner } from "@/components/transactions/ScoringUnavailableBanner";
import { CheckCircle2, ShieldAlert, Cpu, ArrowUpDown } from "lucide-react";

function TransactionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-synced initial filter state
  const [filters, setFilters] = useState<FilterState>({
    riskLevel: (searchParams.get("risk") as any) || "ALL",
    decision: (searchParams.get("decision") as any) || "ALL",
    search: searchParams.get("q") || "",
  });

  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(initialTransactions[0]);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mlStatus, setMlStatus] = useState<{ online: boolean; circuit_breaker: string; error?: string }>({
    online: true,
    circuit_breaker: "CLOSED",
  });
  const [isCheckingMl, setIsCheckingMl] = useState<boolean>(false);

  // Sync state to URL
  const updateUrlFilters = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();
    if (newFilters.riskLevel !== "ALL") params.set("risk", newFilters.riskLevel);
    if (newFilters.decision !== "ALL") params.set("decision", newFilters.decision);
    if (newFilters.search) params.set("q", newFilters.search);
    const queryString = params.toString();
    router.replace(`/transactions${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [router]);

  // Fetch from backend
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams();
      if (filters.riskLevel !== "ALL") q.set("risk_level", filters.riskLevel);
      if (filters.decision !== "ALL") q.set("decision", filters.decision);
      if (filters.search) q.set("search", filters.search);
      q.set("limit", "100");

      const res = await fetch(`/api/v1/transactions?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTransactions(data);
          if (!selectedTxn || !data.some((d: any) => d.id === selectedTxn.id)) {
            setSelectedTxn(data[0]);
          }
        }
      }
    } catch {
      // Keep existing memory transactions if offline
    } finally {
      setIsLoading(false);
    }
  }, [filters, selectedTxn]);

  // Check ML integration status
  const checkMlHealth = useCallback(async () => {
    setIsCheckingMl(true);
    try {
      const res = await fetch("/api/v1/transactions/status/ml");
      if (res.ok) {
        const data = await res.json();
        setMlStatus(data);
      } else {
        setMlStatus({ online: false, circuit_breaker: "OPEN", error: "HTTP error" });
      }
    } catch (e: any) {
      setMlStatus({ online: false, circuit_breaker: "OPEN", error: e.message });
    } finally {
      setIsCheckingMl(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    checkMlHealth();
  }, [fetchTransactions, checkMlHealth]);

  const handleFilterChange = (partial: Partial<FilterState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...partial };
      updateUrlFilters(next);
      return next;
    });
  };

  const handleResetFilters = () => {
    const defaultState: FilterState = { riskLevel: "ALL", decision: "ALL", search: "" };
    setFilters(defaultState);
    updateUrlFilters(defaultState);
  };

  // Streaming ingestion simulation
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
      setTransactions((prev) => [newTxn, ...prev.slice(0, 79)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleUpdateStatus = async (txnId: string, newAction: Transaction["decision"]) => {
    // Optimistic UI update
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txnId ? { ...t, decision: newAction, status: "MANUALLY_OVERRIDDEN" } : t
      )
    );
    if (selectedTxn && selectedTxn.id === txnId) {
      setSelectedTxn((prev) => (prev ? { ...prev, decision: newAction, status: "MANUALLY_OVERRIDDEN" } : null));
    }

    try {
      await fetch(`/api/v1/transactions/${txnId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: newAction,
          reason: "Officer manual risk review decision override",
        }),
      });
    } catch {
      // Ignored for demo offline
    }

    setAlertNotice(`Transaction ${txnId} manually updated to ${newAction}. Audit hash chain recorded.`);
    setTimeout(() => setAlertNotice(null), 4000);
  };

  // Multi-select helpers
  const handleToggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (checkedIds.length === transactions.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds(transactions.map((t) => t.id));
    }
  };

  // Bulk batch scoring with ML service
  const handleBatchScore = async () => {
    if (checkedIds.length === 0) return;
    const res = await fetch("/api/v1/transactions/batch-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction_ids: checkedIds }),
    });

    if (!res.ok) throw new Error("Failed to re-score batch");
    const data = await res.json();

    // Merge updated scores into current transactions
    const scoreMap = new Map(data.results.map((r: any) => [r.id, r]));
    setTransactions((prev) =>
      prev.map((t) => {
        const update = scoreMap.get(t.id);
        if (update) {
          return {
            ...t,
            riskScore: (update as any).risk_score,
            riskLevel: (update as any).risk_level,
            decision: (update as any).decision,
            anomalyScore: (update as any).anomaly_score,
            ruleFlags: (update as any).rule_flags,
          };
        }
        return t;
      })
    );
  };

  const exportCsv = (ids?: string[]) => {
    const targetTxns = ids && ids.length > 0
      ? transactions.filter((t) => ids.includes(t.id))
      : transactions;

    const headers = ["ID", "Timestamp", "Customer", "Amount", "Currency", "RiskScore", "RiskLevel", "Decision", "Merchant", "City", "Synthetic"];
    const rows = targetTxns.map((t) => [
      t.id,
      t.timestamp,
      `"${t.customerName}"`,
      t.amount,
      t.currency,
      t.riskScore,
      t.riskLevel,
      t.decision,
      `"${t.merchant}"`,
      `"${t.location.city}"`,
      t.isSynthetic ? "TRUE" : "FALSE",
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `riskguard-telemetry-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Fallback Banner if ML service degraded */}
      <ScoringUnavailableBanner
        mlStatus={mlStatus}
        onRetry={checkMlHealth}
        isRetrying={isCheckingMl}
      />

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

      {/* Advanced Filter & Search Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        totalCount={transactions.length}
      />

      {/* Main Table + Side Inspector View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={selectedTxn ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="rounded-2xl border border-[#222226] bg-[#0d0d10] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#222226] bg-[#08080a] text-[11px] font-mono text-zinc-400">
                    <th className="px-3 py-3 w-8">
                      <input
                        type="checkbox"
                        checked={checkedIds.length > 0 && checkedIds.length === transactions.length}
                        onChange={handleSelectAll}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer"
                      />
                    </th>
                    <th className="px-3 py-3">TIMESTAMP</th>
                    <th className="px-3 py-3">TRANSACTION ID</th>
                    <th className="px-3 py-3">CUSTOMER / ORIGIN</th>
                    <th className="px-3 py-3">AMOUNT</th>
                    <th className="px-3 py-3">MERCHANT</th>
                    <th className="px-3 py-3">RISK SCORE</th>
                    <th className="px-3 py-3">ACTION</th>
                    <th className="px-3 py-3 text-right">DOSSIER</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-xs font-mono text-slate-500">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn) => (
                      <TransactionListRow
                        key={txn.id}
                        transaction={txn}
                        isSelected={selectedTxn?.id === txn.id}
                        isChecked={checkedIds.includes(txn.id)}
                        onSelect={() => setSelectedTxn(txn)}
                        onToggleCheck={() => handleToggleCheck(txn.id)}
                        onOpenModal={() => {
                          setSelectedTxn(txn);
                          setIsModalOpen(true);
                        }}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Inline Live Telemetry Inspector */}
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

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedIds={checkedIds}
        onClearSelection={() => setCheckedIds([])}
        onBatchScore={handleBatchScore}
        onExportSelected={() => exportCsv(checkedIds)}
      />

      {/* Deep Telemetry Modal */}
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

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs font-mono text-slate-500">Loading investigative transactions stream...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}

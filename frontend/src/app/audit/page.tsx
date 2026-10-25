"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { mockAuditLogs } from "@/lib/apiClient";
import { AuditLogEntry } from "@/types/fraud";
import { HashChainViewer } from "@/components/audit/HashChainViewer";
import { AuditFilterBar } from "@/components/audit/AuditFilterBar";
import { FileText, SlidersHorizontal, Users, CreditCard, History } from "lucide-react";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("ALL");
  const [action, setAction] = useState("ALL");
  const [activeQuickFilter, setActiveQuickFilter] = useState("ALL");
  const [isVerifying, setIsVerifying] = useState(false);

  // Load audit logs from backend if available
  const loadLogs = useCallback(async () => {
    try {
      const q = new URLSearchParams();
      if (entityType !== "ALL") q.set("entity_type", entityType);
      if (action !== "ALL") q.set("action", action);
      q.set("limit", "100");

      const res = await fetch(`/api/v1/audit/logs?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLogs(data);
        }
      }
    } catch {
      // Keep mock logs
    }
  }, [entityType, action]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    setTimeout(() => setIsVerifying(false), 400);
  };

  // Filter logs by quick filter, search, entity, and action
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      // 1. Quick Filter check
      if (activeQuickFilter === "TRANSACTIONS") {
        const isTxn =
          l.entityType === "TRANSACTION" ||
          l.entityId.toUpperCase().startsWith("TXN-") ||
          l.details.toUpperCase().includes("TXN-") ||
          l.action.toUpperCase().includes("TRANSACTION");
        if (!isTxn) return false;
      } else if (activeQuickFilter === "DECISIONS") {
        const isDecision =
          l.action.toUpperCase().includes("OVERRIDE") ||
          l.action.toUpperCase().includes("FEEDBACK");
        if (!isDecision) return false;
      } else if (activeQuickFilter === "CASES") {
        const isCase =
          l.entityType === "CASE" ||
          l.action.toUpperCase().includes("CASE");
        if (!isCase) return false;
      } else if (activeQuickFilter === "SESSIONS") {
        const isSession =
          l.entityType === "USER_SESSION" ||
          l.action.toUpperCase().includes("SESSION") ||
          l.action.toUpperCase().includes("AUTH") ||
          l.action.toUpperCase().includes("LOGIN") ||
          l.action.toUpperCase().includes("LOGOUT");
        if (!isSession) return false;
      }

      // 2. Entity Type dropdown
      if (entityType !== "ALL" && l.entityType !== entityType) {
        return false;
      }

      // 3. Action dropdown
      if (action !== "ALL" && l.action !== action) {
        return false;
      }

      // 4. Search query (supports transaction IDs like TXN-1002, names, actions)
      const q = search.toLowerCase().trim();
      if (!q) return true;

      return (
        l.action.toLowerCase().includes(q) ||
        l.officerName.toLowerCase().includes(q) ||
        l.officerId.toLowerCase().includes(q) ||
        l.entityId.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    });
  }, [logs, activeQuickFilter, entityType, action, search]);

  // Compute summary stats
  const stats = useMemo(() => {
    const totalEvents = logs.length;
    const transactionEvents = logs.filter(
      (l) =>
        l.entityType === "TRANSACTION" ||
        l.entityId.toUpperCase().startsWith("TXN-") ||
        l.details.toUpperCase().includes("TXN-") ||
        l.action.toUpperCase().includes("TRANSACTION")
    ).length;
    const analystDecisions = logs.filter(
      (l) =>
        l.action.toUpperCase().includes("OVERRIDE") ||
        l.action.toUpperCase().includes("FEEDBACK")
    ).length;
    const uniqueOfficers = new Set(
      logs.map((l) => l.officerName).filter((name) => name && !name.includes("System"))
    ).size;

    return {
      totalEvents,
      transactionEvents,
      analystDecisions,
      uniqueOfficers: Math.max(1, uniqueOfficers),
    };
  }, [logs]);

  const handleResetFilters = () => {
    setSearch("");
    setEntityType("ALL");
    setAction("ALL");
    setActiveQuickFilter("ALL");
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0d0d10] border border-[#222226]">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center gap-2.5">
            <History className="w-5 h-5 text-zinc-300" />
            <span>Transaction & Activity History</span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Live Feed
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Chronological operational log of financial transaction events, investigator score overrides, and case operations.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0d0d10] border border-[#222226] flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 block font-medium">Total Activity</span>
            <span className="text-lg font-bold text-zinc-100">{stats.totalEvents} Events</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d0d10] border border-[#222226] flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 block font-medium">Transaction History</span>
            <span className="text-lg font-bold text-cyan-300">{stats.transactionEvents} Txn Events</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d0d10] border border-[#222226] flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 block font-medium">Analyst Decisions</span>
            <span className="text-lg font-bold text-amber-300">{stats.analystDecisions} Overrides</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d0d10] border border-[#222226] flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 block font-medium">Active Officers</span>
            <span className="text-lg font-bold text-zinc-100">{stats.uniqueOfficers} Officers</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <AuditFilterBar
        search={search}
        onSearchChange={setSearch}
        entityType={entityType}
        onEntityTypeChange={setEntityType}
        action={action}
        onActionChange={setAction}
        onVerifyChain={handleVerifyChain}
        isVerifying={isVerifying}
        totalLogs={filteredLogs.length}
        totalUnfiltered={logs.length}
        activeQuickFilter={activeQuickFilter}
        onSelectQuickFilter={setActiveQuickFilter}
      />

      {/* Activity Timeline with Show More and Transaction Search */}
      <HashChainViewer
        logs={filteredLogs}
        onResetFilters={handleResetFilters}
        onSearchTransaction={(txnId) => {
          setSearch(txnId);
          setActiveQuickFilter("ALL");
        }}
      />
    </div>
  );
}

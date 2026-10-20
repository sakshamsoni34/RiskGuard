"use client";

import React from "react";
import { Search, ShieldCheck, RefreshCw, X, Filter, SlidersHorizontal, Folder, Cpu, UserCheck } from "lucide-react";

interface AuditFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  entityType: string;
  onEntityTypeChange: (val: string) => void;
  action: string;
  onActionChange: (val: string) => void;
  onVerifyChain: () => void;
  isVerifying: boolean;
  totalLogs: number;
  totalUnfiltered: number;
  activeQuickFilter: string;
  onSelectQuickFilter: (filter: string) => void;
}

export const AuditFilterBar: React.FC<AuditFilterBarProps> = ({
  search,
  onSearchChange,
  entityType,
  onEntityTypeChange,
  action,
  onActionChange,
  onVerifyChain,
  isVerifying,
  totalLogs,
  totalUnfiltered,
  activeQuickFilter,
  onSelectQuickFilter,
}) => {
  const hasActiveFilters = search || entityType !== "ALL" || action !== "ALL" || activeQuickFilter !== "ALL";

  const clearAllFilters = () => {
    onSearchChange("");
    onEntityTypeChange("ALL");
    onActionChange("ALL");
    onSelectQuickFilter("ALL");
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#0d0d10] border border-[#222226] space-y-4 shadow-sm">
      {/* Quick Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-[#1e1e22]">
        <button
          onClick={() => onSelectQuickFilter("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeQuickFilter === "ALL" && entityType === "ALL" && action === "ALL"
              ? "bg-zinc-800 text-white shadow-sm"
              : "bg-[#141418] text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a20]"
          }`}
        >
          <span>All Activities</span>
          <span className="px-1.5 py-0.2 rounded-md bg-[#0a0a0c] text-[11px] text-zinc-300">
            {totalUnfiltered}
          </span>
        </button>

        <button
          onClick={() => onSelectQuickFilter("DECISIONS")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeQuickFilter === "DECISIONS"
              ? "bg-amber-500/20 text-amber-200 border border-amber-500/30"
              : "bg-[#141418] text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a20]"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
          <span>Analyst Decisions</span>
        </button>

        <button
          onClick={() => onSelectQuickFilter("CASES")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeQuickFilter === "CASES"
              ? "bg-[#18181c] text-zinc-100 border border-zinc-600 shadow-sm"
              : "bg-[#141418] text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a20]"
          }`}
        >
          <Folder className="w-3.5 h-3.5 text-zinc-300" />
          <span>Case Updates</span>
        </button>

        <button
          onClick={() => onSelectQuickFilter("SYSTEM")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeQuickFilter === "SYSTEM"
              ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
              : "bg-[#141418] text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a20]"
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>System & Integrity</span>
        </button>

        <button
          onClick={() => onSelectQuickFilter("SESSIONS")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeQuickFilter === "SESSIONS"
              ? "bg-[#18181c] text-zinc-100 border border-zinc-600 shadow-sm"
              : "bg-[#141418] text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a20]"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-zinc-300" />
          <span>Officer Sessions</span>
        </button>
      </div>

      {/* Main Search and Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by investigator name, action, transaction ID (e.g. TXN-1002), or case..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#121215] border border-[#242429] rounded-xl text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-600 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Verify Integrity Button */}
        <button
          onClick={onVerifyChain}
          disabled={isVerifying}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181c] hover:bg-[#222226] border border-[#27272a] text-zinc-200 hover:text-white text-xs font-medium transition-all disabled:opacity-50 whitespace-nowrap shadow-sm"
        >
          <ShieldCheck className={`w-4 h-4 text-emerald-400 ${isVerifying ? "animate-spin" : ""}`} />
          <span>{isVerifying ? "Verifying Seals..." : "Verify Ledger Integrity"}</span>
        </button>
      </div>

      {/* Advanced Filter Dropdowns & Results Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-medium">Category:</span>
            <select
              value={entityType}
              onChange={(e) => onEntityTypeChange(e.target.value)}
              className="px-3 py-1.5 bg-[#121215] border border-[#242429] rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-zinc-500"
            >
              <option value="ALL">All Categories</option>
              <option value="TRANSACTION">Transactions</option>
              <option value="CASE">Case Files</option>
              <option value="MODEL">AI Models</option>
              <option value="REPORT">Investigation Reports</option>
              <option value="USER_SESSION">Officer Sessions</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-medium">Specific Action:</span>
            <select
              value={action}
              onChange={(e) => onActionChange(e.target.value)}
              className="px-3 py-1.5 bg-[#121215] border border-[#242429] rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-zinc-500 max-w-[220px] truncate"
            >
              <option value="ALL">All Actions</option>
              <option value="EVALUATE_SCORE_OVERRIDE">Manual Risk Override</option>
              <option value="OPEN_CASE_INVESTIGATION">Open Investigation</option>
              <option value="CASE_STATUS_TRANSITION">Case Status Update</option>
              <option value="CASE_NOTE_APPENDED">Case Note Added</option>
              <option value="CASE_TRANSACTIONS_LINKED">Transactions Linked</option>
              <option value="ANALYST_MODEL_FEEDBACK">Model Feedback</option>
              <option value="REPORT_SEALED_AND_DISPATCHED">Report Sealed</option>
              <option value="OFFICER_SESSION_AUTHENTICATED">Officer Session</option>
              <option value="CHAIN_INTEGRITY_CHECK">Integrity Check</option>
              <option value="TRANSACTIONS_BATCH_RESCORED">Batch Rescored</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-2 ml-1"
            >
              <X className="w-3 h-3" />
              Reset all filters
            </button>
          )}
        </div>

        <div className="text-slate-400 text-xs">
          Showing <strong className="text-slate-200">{totalLogs}</strong> of{" "}
          <span className="text-slate-400">{totalUnfiltered}</span> events
        </div>
      </div>
    </div>
  );
};

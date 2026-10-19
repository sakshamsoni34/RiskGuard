"use client";

import React from "react";
import { Search, Filter, ShieldCheck, RefreshCw, X } from "lucide-react";

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
}) => {
  return (
    <div className="p-4 rounded-2xl bg-[#0b1222] border border-[#17223b] space-y-3 font-mono text-xs shadow-xl">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search audit trail by entity ID (e.g. TXN-1002, CR-2026-0842), action, or officer..."
            className="w-full pl-9 pr-3 py-2 bg-[#070b14] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action: Verify Chain */}
        <button
          onClick={onVerifyChain}
          disabled={isVerifying}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-semibold transition-all disabled:opacity-50 whitespace-nowrap"
        >
          <ShieldCheck className={`w-4 h-4 ${isVerifying ? "animate-spin" : ""}`} />
          <span>{isVerifying ? "Verifying SHA-256 Chain..." : "Verify Ledger Integrity"}</span>
        </button>
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Entity:</span>
            <select
              value={entityType}
              onChange={(e) => onEntityTypeChange(e.target.value)}
              className="px-2.5 py-1 bg-[#070b14] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/60"
            >
              <option value="ALL">All Entities</option>
              <option value="TRANSACTION">TRANSACTION</option>
              <option value="CASE">CASE</option>
              <option value="MODEL">MODEL</option>
              <option value="REPORT">REPORT</option>
              <option value="USER_SESSION">USER_SESSION</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Action:</span>
            <select
              value={action}
              onChange={(e) => onActionChange(e.target.value)}
              className="px-2.5 py-1 bg-[#070b14] border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/60"
            >
              <option value="ALL">All Actions</option>
              <option value="TRANSACTION_MANUAL_OVERRIDE">TRANSACTION_MANUAL_OVERRIDE</option>
              <option value="TRANSACTIONS_BATCH_RESCORED">TRANSACTIONS_BATCH_RESCORED</option>
              <option value="CASE_REGISTERED">CASE_REGISTERED</option>
              <option value="CASE_STATUS_UPDATED">CASE_STATUS_UPDATED</option>
              <option value="CASE_NOTE_APPENDED">CASE_NOTE_APPENDED</option>
              <option value="CASE_TRANSACTIONS_LINKED">CASE_TRANSACTIONS_LINKED</option>
              <option value="ANALYST_MODEL_FEEDBACK">ANALYST_MODEL_FEEDBACK</option>
              <option value="REPORT_SEALED_AND_DISPATCHED">REPORT_SEALED_AND_DISPATCHED</option>
              <option value="OFFICER_SESSION_AUTHENTICATED">OFFICER_SESSION_AUTHENTICATED</option>
            </select>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800">
          {totalLogs} entries in ledger
        </span>
      </div>
    </div>
  );
};

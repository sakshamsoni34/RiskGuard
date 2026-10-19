"use client";

import React from "react";
import { Search, Filter, Play, Pause, X, RotateCcw } from "lucide-react";
import { RiskLevel } from "@/types/fraud";

export interface FilterState {
  riskLevel: "ALL" | RiskLevel | "CRITICAL";
  decision: "ALL" | "APPROVED" | "OTP_REQUIRED" | "BLOCKED";
  search: string;
  minAmount?: number;
  maxAmount?: number;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  isStreaming,
  onToggleStreaming,
  totalCount,
}) => {
  const riskTabs: Array<"ALL" | RiskLevel | "CRITICAL"> = [
    "ALL",
    "CRITICAL",
    "HIGH",
    "MEDIUM",
    "LOW",
  ];

  return (
    <div className="p-4 rounded-2xl bg-[#0b1222] border border-[#17223b] space-y-4 shadow-xl">
      {/* Top row: search & stream switch */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by Txn ID (e.g. TXN-1001), Officer/Customer name, Merchant, City..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#070b14] border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live stream toggle & reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleStreaming}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isStreaming
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Live Feed Active</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Feed</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            title="Reset Filters"
            className="p-2.5 rounded-xl border border-slate-800 bg-[#070b14] text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Risk Band Tabs & Decision Select */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        {/* Risk Level Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-[11px] font-mono text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Risk:
          </span>
          {riskTabs.map((tab) => {
            const active = filters.riskLevel === tab;
            let colorCls = "text-slate-400 border-slate-800 hover:border-slate-700 bg-slate-900/40";
            if (active) {
              if (tab === "CRITICAL") colorCls = "bg-purple-950/70 border-purple-500 text-purple-300 ring-1 ring-purple-500/50";
              else if (tab === "HIGH") colorCls = "bg-rose-950/70 border-rose-500 text-rose-300 ring-1 ring-rose-500/50";
              else if (tab === "MEDIUM") colorCls = "bg-amber-950/70 border-amber-500 text-amber-300 ring-1 ring-amber-500/50";
              else if (tab === "LOW") colorCls = "bg-emerald-950/70 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50";
              else colorCls = "bg-cyan-950/70 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/50";
            }

            return (
              <button
                key={tab}
                onClick={() => onFilterChange({ riskLevel: tab })}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border transition-all ${colorCls}`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Decision dropdown & count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-500">Action:</span>
            <select
              value={filters.decision}
              onChange={(e) => onFilterChange({ decision: e.target.value as any })}
              className="px-2.5 py-1 bg-[#070b14] border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/60"
            >
              <option value="ALL">All Actions</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="OTP_REQUIRED">OTP_REQUIRED</option>
              <option value="APPROVED">APPROVED</option>
            </select>
          </div>

          <span className="text-xs font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-800/40 border border-slate-800">
            {totalCount} events loaded
          </span>
        </div>
      </div>
    </div>
  );
};

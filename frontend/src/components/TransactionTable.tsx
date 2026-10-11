"use client";

import React, { useState } from "react";
import { Transaction, RiskLevel } from "@/types/fraud";
import { Search, Filter, AlertTriangle, ShieldCheck, ShieldAlert, KeyRound, Eye, Smartphone, MapPin, Gauge } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  onSelectTransaction: (txn: Transaction) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onSelectTransaction,
}) => {
  const [filterLevel, setFilterLevel] = useState<"ALL" | RiskLevel>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = transactions.filter((txn) => {
    const matchesFilter = filterLevel === "ALL" || txn.riskLevel === filterLevel;
    const matchesSearch =
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.location.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm">
      {/* Table Header and Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Real-Time Ingestion Stream</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Streaming live transactions evaluated against XGBoost model + SHAP explanation vectors
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, customer, merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 rounded-lg border border-slate-700 bg-slate-800/80 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Tier Filters */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-xs">
            <button
              onClick={() => setFilterLevel("ALL")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                filterLevel === "ALL" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilterLevel("HIGH")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                filterLevel === "HIGH" ? "bg-rose-950 text-rose-300 border border-rose-800/40" : "text-slate-400 hover:text-rose-400"
              }`}
            >
              High Risk
            </button>
            <button
              onClick={() => setFilterLevel("MEDIUM")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                filterLevel === "MEDIUM" ? "bg-amber-950 text-amber-300 border border-amber-800/40" : "text-slate-400 hover:text-amber-400"
              }`}
            >
              OTP Req
            </button>
            <button
              onClick={() => setFilterLevel("LOW")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                filterLevel === "LOW" ? "bg-emerald-950 text-emerald-300 border border-emerald-800/40" : "text-slate-400 hover:text-emerald-400"
              }`}
            >
              Approved
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="py-3 px-4">Txn ID / Time</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Amount & Merchant</th>
              <th className="py-3 px-4">Signals (Device & Geo)</th>
              <th className="py-3 px-4 text-center">Risk Score</th>
              <th className="py-3 px-4">Decision</th>
              <th className="py-3 px-4 text-right">Explainability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No transactions match the selected criteria.
                </td>
              </tr>
            ) : (
              filtered.map((txn) => {
                const isHigh = txn.riskLevel === "HIGH";
                const isMedium = txn.riskLevel === "MEDIUM";

                return (
                  <tr
                    key={txn.id}
                    className={`transition-colors hover:bg-slate-800/40 cursor-pointer ${
                      isHigh ? "bg-rose-950/10" : ""
                    }`}
                    onClick={() => onSelectTransaction(txn)}
                  >
                    {/* ID & Time */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-white">{txn.id}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{txn.timestamp}</div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{txn.customerName}</div>
                      <div className="font-mono text-[10px] text-slate-500">{txn.customerId}</div>
                    </td>

                    {/* Amount & Merchant */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white font-mono">
                        ₹{txn.amount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {txn.merchant}
                      </div>
                    </td>

                    {/* Signals */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[11px] text-slate-300">
                          <MapPin className="h-3 w-3 text-cyan-400 flex-shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {txn.location.city}, {txn.location.country}
                          </span>
                          {txn.location.isVpnOrProxy && (
                            <span className="rounded bg-rose-900/60 px-1 py-0.2 text-[9px] font-bold text-rose-300 border border-rose-700/50">
                              VPN
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Smartphone className="h-3 w-3 text-slate-400 flex-shrink-0" />
                          {txn.device.isNewDevice ? (
                            <span className="text-amber-400 font-semibold">New Device</span>
                          ) : (
                            <span className="text-slate-400">Known Device</span>
                          )}
                          <span className="text-slate-600">•</span>
                          <span>{txn.velocity.last2MinutesCount} in 2m</span>
                        </div>
                      </div>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div
                          className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-1 rounded-full border ${
                            isHigh
                              ? "bg-rose-950/80 text-rose-400 border-rose-500/40 glow-rose"
                              : isMedium
                              ? "bg-amber-950/80 text-amber-400 border-amber-500/40 glow-amber"
                              : "bg-emerald-950/80 text-emerald-400 border-emerald-500/40 glow-emerald"
                          }`}
                        >
                          {txn.riskScore} / 100
                        </div>
                        <div className="w-14 bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              isHigh ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${txn.riskScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Decision */}
                    <td className="py-3 px-4">
                      {txn.decision === "BLOCKED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-950/60 border border-rose-800/40 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
                          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                          BLOCKED
                        </span>
                      )}
                      {txn.decision === "OTP_REQUIRED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-950/60 border border-amber-800/40 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
                          <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                          OTP STEP-UP
                        </span>
                      )}
                      {txn.decision === "APPROVED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                          APPROVED
                        </span>
                      )}
                    </td>

                    {/* Explainability button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransaction(txn);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1 text-[11px] font-medium text-slate-200 transition-colors hover:border-indigo-500 hover:bg-indigo-950/50 hover:text-white"
                      >
                        <Eye className="h-3 w-3 text-indigo-400" />
                        SHAP View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

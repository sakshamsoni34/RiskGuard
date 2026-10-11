"use client";

import React, { useState } from "react";
import { Transaction, RiskLevel } from "@/types/fraud";
import {
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CreditCard,
  MapPin,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  selectedTransactionId?: string;
  onSelectTransaction: (txn: Transaction) => void;
  activeFilter?: "ALL" | "HIGH" | "MEDIUM" | "LOW";
  onFilterChange?: (filter: "ALL" | "HIGH" | "MEDIUM" | "LOW") => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  selectedTransactionId,
  onSelectTransaction,
  activeFilter = "ALL",
  onFilterChange,
}) => {
  const [internalFilter, setInternalFilter] = useState<"ALL" | RiskLevel>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const currentFilter = onFilterChange ? activeFilter : internalFilter;

  const filtered = transactions.filter((txn) => {
    let matchesFilter = true;
    if (currentFilter === "HIGH" || currentFilter === "MEDIUM" || currentFilter === "LOW") {
      matchesFilter = txn.riskLevel === currentFilter;
    }

    const matchesSearch =
      searchQuery === "" ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.location.city.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleFilterClick = (filter: "ALL" | RiskLevel) => {
    setInternalFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d1424] shadow-sm">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 p-4 gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Live Transactions</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time evaluated payment requests and automated risk decisions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, customer, merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 rounded-lg border border-slate-700 bg-slate-900/80 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Quick Filter Segment */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs">
            <button
              onClick={() => handleFilterClick("ALL")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                currentFilter === "ALL" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => handleFilterClick("HIGH")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                currentFilter === "HIGH" ? "bg-rose-950 text-rose-300 font-semibold" : "text-slate-400 hover:text-rose-400"
              }`}
            >
              Blocked
            </button>
            <button
              onClick={() => handleFilterClick("MEDIUM")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                currentFilter === "MEDIUM" ? "bg-amber-950 text-amber-300 font-semibold" : "text-slate-400 hover:text-amber-400"
              }`}
            >
              3DS Review
            </button>
            <button
              onClick={() => handleFilterClick("LOW")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                currentFilter === "LOW" ? "bg-emerald-950 text-emerald-300 font-semibold" : "text-slate-400 hover:text-emerald-400"
              }`}
            >
              Allowed
            </button>
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 z-10 border-b border-slate-800 bg-[#090e1a] font-medium text-slate-400 text-[11px]">
            <tr>
              <th className="py-2.5 px-4">Transaction</th>
              <th className="py-2.5 px-4">Customer</th>
              <th className="py-2.5 px-4">Payment Method</th>
              <th className="py-2.5 px-4">Amount & Merchant</th>
              <th className="py-2.5 px-4 text-center">Risk Score</th>
              <th className="py-2.5 px-4">Decision</th>
              <th className="py-2.5 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No transactions match the selected filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((txn) => {
                const isHigh = txn.riskLevel === "HIGH";
                const isMedium = txn.riskLevel === "MEDIUM";
                const isSelected = selectedTransactionId === txn.id;

                return (
                  <tr
                    key={txn.id}
                    onClick={() => onSelectTransaction(txn)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? "bg-slate-800/60 border-l-2 border-indigo-500"
                        : "hover:bg-slate-800/40 border-l-2 border-transparent"
                    }`}
                  >
                    {/* ID & Time */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-medium text-white">{txn.id}</div>
                      <div className="text-[11px] text-slate-400">{txn.timestamp}</div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{txn.customerName}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{txn.customerEmail}</div>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                        {txn.paymentMethod.type === "card" && (
                          <span>{txn.paymentMethod.brand} •••• {txn.paymentMethod.last4}</span>
                        )}
                        {txn.paymentMethod.type === "upi" && (
                          <span className="font-mono text-[11px] text-slate-300">{txn.paymentMethod.upiHandle}</span>
                        )}
                        {txn.paymentMethod.type === "netbanking" && (
                          <span>{txn.paymentMethod.bankName}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        <span>{txn.location.city}, {txn.location.country}</span>
                        {txn.location.isVpnOrProxy && (
                          <span className="rounded bg-rose-950/80 px-1 text-[9px] font-semibold text-rose-300 border border-rose-800/50">
                            VPN
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Amount & Merchant */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-white">
                        ₹{txn.amount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {txn.merchant}
                      </div>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`font-mono font-semibold text-xs px-2 py-0.5 rounded ${
                            isHigh
                              ? "bg-rose-950/80 text-rose-300 border border-rose-800/40"
                              : isMedium
                              ? "bg-amber-950/80 text-amber-300 border border-amber-800/40"
                              : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/40"
                          }`}
                        >
                          {txn.riskScore}
                        </span>
                        <div className="w-12 bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
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
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 text-[11px] font-medium text-rose-300">
                          <ShieldAlert className="h-3 w-3 text-rose-400" />
                          Blocked
                        </span>
                      )}
                      {txn.decision === "OTP_REQUIRED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                          <KeyRound className="h-3 w-3 text-amber-400" />
                          3DS Review
                        </span>
                      )}
                      {txn.decision === "APPROVED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                          <ShieldCheck className="h-3 w-3 text-emerald-400" />
                          Allowed
                        </span>
                      )}
                    </td>

                    {/* Row Arrow */}
                    <td className="py-3 px-4 text-right">
                      <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all inline-block" />
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

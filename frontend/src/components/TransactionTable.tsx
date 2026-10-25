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
  Download,
  AlertTriangle,
} from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  selectedTransactionId?: string;
  onSelectTransaction: (txn: Transaction) => void;
  activeFilter?: "ALL" | RiskLevel;
  onFilterChange?: (filter: "ALL" | RiskLevel) => void;
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

  // Counts for each category
  const highCount = transactions.filter((t) => t.riskLevel === "HIGH").length;
  const mediumCount = transactions.filter((t) => t.riskLevel === "MEDIUM").length;
  const lowCount = transactions.filter((t) => t.riskLevel === "LOW").length;

  const filtered = transactions.filter((txn) => {
    let matchesFilter = true;
    if (currentFilter !== "ALL") {
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

  const handleExportCSV = () => {
    const headers = [
      "Transaction ID",
      "Timestamp",
      "Customer Name",
      "Email",
      "Amount (INR)",
      "Merchant",
      "Category",
      "Risk Score",
      "Decision",
      "City",
      "Country",
      "VPN Detected",
    ];

    const rows = filtered.map((t) => [
      t.id,
      t.timestamp,
      `"${t.customerName}"`,
      t.customerEmail,
      t.amount,
      `"${t.merchant}"`,
      t.merchantCategory,
      t.riskScore,
      t.decision,
      t.location.city,
      t.location.country,
      t.location.isVpnOrProxy ? "YES" : "NO",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RiskGuard_Transactions_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#222226] bg-[#0d0d10] shadow-xl backdrop-blur-sm">
      {/* Table Header & Toolbar */}
      <div className="flex flex-col gap-3.5 border-b border-[#222226] p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-white tracking-wide">Live Transaction Stream</h2>
            <span className="rounded-full bg-[#18181c] px-2.5 py-0.5 text-[11px] font-mono text-zinc-300 border border-[#27272a]">
              {filtered.length} showing
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time authorizations analyzed in under 40 milliseconds
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search customer, merchant, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-52 sm:w-60 rounded-xl border border-[#242429] bg-[#121215] pl-9 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-all"
            />
          </div>

          {/* Clean Filter Pills with Counts */}
          <div className="flex rounded-xl border border-[#222226] bg-[#141418] p-1 text-xs">
            <button
              onClick={() => handleFilterClick("ALL")}
              className={`rounded-lg px-3 py-1 font-medium transition-all hover:scale-[1.03] active:scale-95 ${
                currentFilter === "ALL"
                  ? "bg-[#222228] text-white shadow-sm font-semibold border border-[#2e2e36]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => handleFilterClick("HIGH")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-1.5 ${
                currentFilter === "HIGH"
                  ? "bg-rose-950/80 text-rose-300 font-semibold border border-rose-800/50 shadow-sm"
                  : "text-zinc-400 hover:text-rose-400"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              Blocked ({highCount})
            </button>
            <button
              onClick={() => handleFilterClick("MEDIUM")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-1.5 ${
                currentFilter === "MEDIUM"
                  ? "bg-amber-950/80 text-amber-300 font-semibold border border-amber-800/50 shadow-sm"
                  : "text-zinc-400 hover:text-amber-400"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              2FA Review ({mediumCount})
            </button>
            <button
              onClick={() => handleFilterClick("LOW")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-1.5 ${
                currentFilter === "LOW"
                  ? "bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-800/50 shadow-sm"
                  : "text-zinc-400 hover:text-emerald-400"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Approved ({lowCount})
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-[#27272a] bg-[#18181c] px-3 text-xs font-semibold text-zinc-300 hover:bg-[#222227] hover:text-white hover:border-zinc-500 hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
            title="Export filtered records to CSV"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Table Data View */}
      <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 z-10 border-b border-[#222226] bg-[#08080a] font-semibold text-zinc-400 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Decision</th>
              <th className="py-3 px-4">Customer & ID</th>
              <th className="py-3 px-4">Amount & Merchant</th>
              <th className="py-3 px-4">Method & Location</th>
              <th className="py-3 px-4 text-center">AI Risk</th>
              <th className="py-3 px-4 text-right">Time</th>
              <th className="py-3 pr-4 pl-1"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e24]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-zinc-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Filter className="h-8 w-8 text-zinc-600" />
                    <p className="font-medium text-zinc-300">No transactions match your search filter</p>
                    <p className="text-xs text-zinc-500">Try changing your search keywords or switching filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((txn, idx) => {
                const isHigh = txn.riskLevel === "HIGH";
                const isMedium = txn.riskLevel === "MEDIUM";
                const isSelected = selectedTransactionId === txn.id;

                return (
                  <tr
                    key={txn.id}
                    onClick={() => onSelectTransaction(txn)}
                    className={`transition-all cursor-pointer group ${
                      idx === 0 ? "animate-row-enter" : ""
                    } ${
                      isSelected
                        ? "bg-[#18181c] border-l-4 border-zinc-300"
                        : "hover:bg-[#141418] border-l-4 border-transparent"
                    }`}
                  >
                    {/* Decision Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {txn.decision === "BLOCKED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-950/70 border border-rose-800/50 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
                          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                          Blocked
                        </span>
                      )}
                      {txn.decision === "OTP_REQUIRED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-950/70 border border-amber-800/50 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
                          <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                          2FA Review
                        </span>
                      )}
                      {txn.decision === "APPROVED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/70 border border-emerald-800/50 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                          Approved
                        </span>
                      )}
                    </td>

                    {/* Customer & ID */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 group-hover:text-white transition-colors">
                        {txn.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {txn.id}
                      </div>
                    </td>

                    {/* Amount & Merchant */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white">
                        ₹{txn.amount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {txn.merchant}
                      </div>
                    </td>

                    {/* Payment Method & Location */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs">
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
                          <span className="rounded bg-rose-950/90 px-1 py-0.2 text-[9px] font-bold text-rose-300 border border-rose-800/50">
                            VPN
                          </span>
                        )}
                      </div>
                    </td>

                    {/* AI Risk Score */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
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

                    {/* Timestamp */}
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400">
                      {txn.timestamp}
                    </td>

                    {/* Row Select Chevron */}
                    <td className="py-3 pr-4 pl-1 text-right">
                      <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all inline-block" />
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

"use client";

import React from "react";
import Link from "next/link";
import { Transaction } from "@/types/fraud";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { ExternalLink, ShieldCheck, KeyRound, ShieldAlert, Cpu, Eye } from "lucide-react";

interface TransactionListRowProps {
  transaction: Transaction;
  isSelected: boolean;
  isChecked: boolean;
  onSelect: () => void;
  onToggleCheck: () => void;
  onOpenModal: () => void;
}

export const TransactionListRow: React.FC<TransactionListRowProps> = ({
  transaction,
  isSelected,
  isChecked,
  onSelect,
  onToggleCheck,
  onOpenModal,
}) => {
  const formattedTime = new Date(transaction.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "BLOCKED":
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case "OTP_REQUIRED":
        return <KeyRound className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case "BLOCKED":
        return "bg-rose-500/10 text-rose-300 border-rose-500/30";
      case "OTP_REQUIRED":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
    }
  };

  return (
    <tr
      onClick={onSelect}
      className={`border-b border-[#1e1e22] transition-all cursor-pointer font-mono text-xs ${
        isSelected
          ? "bg-[#18181c] border-l-2 border-zinc-300"
          : isChecked
          ? "bg-[#141418]"
          : "hover:bg-[#121215]"
      }`}
    >
      {/* Checkbox for bulk actions */}
      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggleCheck}
          className="rounded border-[#2b2b30] bg-[#121215] text-zinc-100 focus:ring-0 cursor-pointer"
        />
      </td>

      {/* Timestamp */}
      <td className="px-3 py-3 text-zinc-400 whitespace-nowrap">
        {formattedTime}
      </td>

      {/* Transaction ID */}
      <td className="px-3 py-3 whitespace-nowrap">
        <span className="font-semibold text-zinc-200 hover:text-white flex items-center gap-1">
          {transaction.id}
          {transaction.isSynthetic && (
            <span className="text-[9px] px-1 py-0.2 rounded bg-[#18181c] text-zinc-400 border border-[#2b2b30]">MOCK</span>
          )}
        </span>
      </td>

      {/* Customer / Origin */}
      <td className="px-3 py-3">
        <div className="font-medium text-zinc-200 line-clamp-1">{transaction.customerName}</div>
        <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
          <span>{transaction.location.city}</span>
          {transaction.location.isVpnOrProxy && (
            <span className="px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] border border-purple-500/30">
              VPN
            </span>
          )}
          {transaction.device.isNewDevice && (
            <span className="px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px] border border-rose-500/30">
              NEW DEV
            </span>
          )}
        </div>
      </td>

      {/* Amount */}
      <td className="px-3 py-3 whitespace-nowrap font-semibold text-zinc-100">
        ₹{transaction.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </td>

      {/* Merchant & Category */}
      <td className="px-3 py-3">
        <div className="text-zinc-300 line-clamp-1">{transaction.merchant}</div>
        <div className="text-[10px] text-zinc-500">{transaction.merchantCategory}</div>
      </td>

      {/* Risk Score */}
      <td className="px-3 py-3 whitespace-nowrap">
        <RiskBadge score={transaction.riskScore} level={transaction.riskLevel as any} size="sm" />
      </td>

      {/* Decision Tag */}
      <td className="px-3 py-3 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getDecisionBadge(
            transaction.decision
          )}`}
        >
          {getDecisionIcon(transaction.decision)}
          <span>{transaction.decision}</span>
        </span>
      </td>

      {/* Actions */}
      <td className="px-3 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={onOpenModal}
            title="Inspect Telemetry Modal"
            className="p-1.5 rounded-lg border border-[#222226] bg-[#121215] text-zinc-400 hover:text-zinc-100 hover:border-[#2b2b30] transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <Link
            href={`/transactions/${transaction.id}`}
            title="Open Full Investigation Dossier"
            className="p-1.5 rounded-lg border border-[#222226] bg-[#121215] text-zinc-400 hover:text-zinc-100 hover:border-[#2b2b30] transition-all inline-flex"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </td>
    </tr>
  );
};

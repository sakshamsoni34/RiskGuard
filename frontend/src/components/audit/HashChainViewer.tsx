"use client";

import React, { useState } from "react";
import { AuditLogEntry } from "@/types/fraud";
import {
  ShieldCheck,
  SlidersHorizontal,
  FolderPlus,
  Activity,
  FileText,
  Link2,
  Cpu,
  FileCheck2,
  Copy,
  Check,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Hash,
  Globe,
  FileCode,
  Shield,
  SearchX,
} from "lucide-react";
import { formatAuditAction, formatEntityLabel, formatAuditDate } from "./auditHelpers";

interface HashChainViewerProps {
  logs: AuditLogEntry[];
  onResetFilters?: () => void;
}

export const HashChainViewer: React.FC<HashChainViewerProps> = ({ logs, onResetFilters }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [expandedJsonId, setExpandedJsonId] = useState<string | null>(null);

  const copyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getActionIcon = (iconType: string) => {
    switch (iconType) {
      case "override":
        return <SlidersHorizontal className="w-4 h-4 text-amber-400" />;
      case "case":
        return <FolderPlus className="w-4 h-4 text-zinc-300" />;
      case "status":
        return <Activity className="w-4 h-4 text-zinc-300" />;
      case "note":
        return <FileText className="w-4 h-4 text-zinc-300" />;
      case "link":
        return <Link2 className="w-4 h-4 text-zinc-300" />;
      case "model":
        return <Cpu className="w-4 h-4 text-zinc-300" />;
      case "report":
        return <FileCheck2 className="w-4 h-4 text-zinc-300" />;
      case "security":
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <Check className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getIconBackground = (iconType: string) => {
    switch (iconType) {
      case "override":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "case":
        return "bg-[#18181c] border-[#27272a] text-zinc-300";
      case "status":
        return "bg-[#18181c] border-[#27272a] text-zinc-300";
      case "note":
        return "bg-[#18181c] border-[#27272a] text-zinc-300";
      case "link":
        return "bg-[#18181c] border-[#27272a] text-zinc-300";
      case "model":
        return "bg-[#18181c] border-[#27272a] text-zinc-300";
      case "report":
        return "bg-[#18181c] border-[#27272a] text-zinc-300";
      case "security":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      default:
        return "bg-[#18181c] border-[#27272a] text-zinc-300";
    }
  };

  if (logs.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-[#0d0d10] border border-[#222226] text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#141418] border border-[#222226] flex items-center justify-center mx-auto text-zinc-400">
          <SearchX className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-zinc-200">No activity logs found</h4>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          No records match your active search terms or category filters. Try searching with different keywords or reset your filters.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-2 px-4 py-2 rounded-xl bg-[#18181c] hover:bg-[#222226] text-zinc-200 text-xs font-medium border border-[#27272a] transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Activity Timeline Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <span>Activity History</span>
            <span className="text-xs font-normal text-zinc-400">({logs.length} events)</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Chronological log of all analyst interventions and system decisions
          </p>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#1e1e22]">
        {logs.map((log, index) => {
          const actionMeta = formatAuditAction(log.action);
          const dateMeta = formatAuditDate(log.timestamp);
          const entityLabel = formatEntityLabel(log.entityType);
          const isExpanded = expandedLogId === log.id;
          const isJsonExpanded = expandedJsonId === log.id;
          const blockNumber = logs.length - index;

          return (
            <div key={log.id} className="relative group">
              {/* Timeline Node Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-3 w-6 h-6 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center shadow-md z-10 transition-transform group-hover:scale-105 ${getIconBackground(
                  actionMeta.iconType
                )}`}
              >
                {getActionIcon(actionMeta.iconType)}
              </div>

              {/* Event Card */}
              <div className="rounded-2xl bg-[#0d0d10] border border-[#222226] hover:border-zinc-700 p-4 sm:p-5 shadow-sm transition-all space-y-3">
                {/* Header: Action Title, Entity Pill, and Timestamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-100">
                      {actionMeta.title}
                    </span>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${actionMeta.badgeBg} ${actionMeta.badgeText} ${actionMeta.badgeBorder}`}
                    >
                      {actionMeta.badgeLabel}
                    </span>

                    {/* Entity Target Pill */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono bg-[#141418] text-zinc-300 border border-[#242429]">
                      <span className="text-zinc-400 font-sans text-[11px]">{entityLabel}:</span>
                      <strong className="text-zinc-200">{log.entityId}</strong>
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span title={dateMeta.full} className="font-medium text-zinc-300">
                      {dateMeta.relative}
                    </span>
                    <span className="text-zinc-500 text-[11px]">({dateMeta.full})</span>
                  </div>
                </div>

                {/* Event Narrative / Details */}
                <p className="text-xs sm:text-[13px] text-zinc-200 leading-relaxed bg-[#121215] p-3 rounded-xl border border-[#222226]">
                  {log.details}
                </p>

                {/* Actor & Security Seal Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[#1e1e22] text-xs text-zinc-400">
                  {/* Actor / Officer Information */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-bold text-zinc-200 shrink-0">
                      {log.officerName?.charAt(0) || "U"}
                    </div>
                    <span className="font-medium text-zinc-200">{log.officerName}</span>
                    <span className="text-zinc-400 font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#121215] border border-[#222226]">
                      {log.officerId}
                    </span>
                    <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-zinc-400">
                      <Globe className="w-3 h-3 text-zinc-500" />
                      {log.ipAddress}
                    </span>
                  </div>

                  {/* Right: Technical Proof Toggle */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Tamper-Proof Seal</span>
                    </span>

                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#141418] hover:bg-[#1a1a20] text-zinc-300 hover:text-white text-xs font-medium transition-colors border border-[#242429]"
                    >
                      <Hash className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{isExpanded ? "Hide Details" : "Security Proof"}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible Technical & Forensic Proof */}
                {isExpanded && (
                  <div className="mt-3 p-3.5 rounded-xl bg-[#08080a] border border-[#222226] text-xs space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      <div className="p-2.5 rounded-lg bg-[#101014] border border-[#1e1e22]">
                        <span className="text-[11px] text-zinc-400 block font-medium">Chain Block Position</span>
                        <span className="text-zinc-200 font-mono font-semibold mt-0.5 block">
                          Block #{blockNumber}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#101014] border border-[#1e1e22]">
                        <span className="text-[11px] text-zinc-400 block font-medium">Origin IP Address</span>
                        <span className="text-zinc-200 font-mono mt-0.5 block">{log.ipAddress}</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#101014] border border-[#1e1e22] flex items-center justify-between">
                        <div className="overflow-hidden pr-2">
                          <span className="text-[11px] text-zinc-400 block font-medium">SHA-256 Hash Seal</span>
                          <span className="text-zinc-300 font-mono text-[11px] truncate block mt-0.5">
                            {log.sha256Hash}
                          </span>
                        </div>
                        <button
                          onClick={() => copyHash(log.sha256Hash, log.id)}
                          className="px-2 py-1 rounded bg-[#18181c] hover:bg-[#222226] text-zinc-300 hover:text-white transition-colors text-[11px] flex items-center gap-1 shrink-0"
                          title="Copy SHA-256 Checksum"
                        >
                          {copiedId === log.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Raw JSON toggle for legal/compliance export */}
                    <div className="pt-1">
                      <button
                        onClick={() => setExpandedJsonId(isJsonExpanded ? null : log.id)}
                        className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
                      >
                        <FileCode className="w-3 h-3" />
                        <span>{isJsonExpanded ? "Hide Raw Payload JSON" : "Inspect Raw Payload JSON"}</span>
                      </button>

                      {isJsonExpanded && (
                        <div className="mt-2 p-3 rounded-lg bg-[#040405] border border-[#222226] text-[11px] text-zinc-300 font-mono overflow-x-auto">
                          <pre>{JSON.stringify(log, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

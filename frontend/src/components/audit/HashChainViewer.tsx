"use client";

import React, { useState } from "react";
import { AuditLogEntry } from "@/types/fraud";
import { Hash, ShieldCheck, Link2, Copy, Check, User, Clock, FileCode } from "lucide-react";

interface HashChainViewerProps {
  logs: AuditLogEntry[];
}

export const HashChainViewer: React.FC<HashChainViewerProps> = ({ logs }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const copyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-200 uppercase flex items-center gap-2">
          <Link2 className="w-4 h-4 text-cyan-400" />
          <span>SHA-256 Merkle Ledger Sequence ({logs.length} Blocks)</span>
        </h3>
        <span className="text-[11px] text-slate-500">Append-Only Cryptographic Chain</span>
      </div>

      <div className="space-y-3">
        {logs.map((log, index) => {
          const isExpanded = expandedLogId === log.id;
          return (
            <div
              key={log.id}
              className="p-4 rounded-xl bg-[#070b14] border border-slate-800/90 hover:border-slate-700 transition-all space-y-2 relative"
            >
              {/* Merkle link indicator to prior block */}
              {index < logs.length - 1 && (
                <div className="absolute left-6 -bottom-3 w-0.5 h-3 bg-cyan-500/40 z-10" />
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 text-[10px] font-bold">
                    BLOCK #{logs.length - index}
                  </span>
                  <span className="font-bold text-slate-200">{log.action}</span>
                  <span className="text-[10px] text-slate-500">({log.entityType} • {log.entityId})</span>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Details & Officer */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {log.officerName} <span className="text-slate-500">({log.officerId})</span>
                  </span>
                  <span className="text-slate-600">• IP: {log.ipAddress}</span>
                </div>

                <button
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-1"
                >
                  <FileCode className="w-3 h-3" />
                  <span>{isExpanded ? "Collapse Raw" : "Inspect Raw Details"}</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
                {log.details}
              </p>

              {/* Expanded JSON / Raw Payload */}
              {isExpanded && (
                <div className="p-3 rounded-lg bg-[#04060a] border border-cyan-500/30 text-[10px] text-slate-400 font-mono overflow-x-auto">
                  <pre>{JSON.stringify(log, null, 2)}</pre>
                </div>
              )}

              {/* SHA-256 Hash Badge */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                <div className="flex items-center gap-1.5 overflow-hidden text-slate-400">
                  <Hash className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="text-slate-500">SHA-256:</span>
                  <span className="text-slate-300 font-mono truncate">{log.sha256Hash}</span>
                </div>

                <button
                  onClick={() => copyHash(log.sha256Hash, log.id)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0 ml-2"
                  title="Copy SHA-256 Checksum"
                >
                  {copiedId === log.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-[9px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[9px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

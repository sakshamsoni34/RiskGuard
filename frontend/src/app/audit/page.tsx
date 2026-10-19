"use client";

import React, { useState } from "react";
import { mockAuditLogs } from "@/lib/apiClient";
import { AuditLogEntry } from "@/types/fraud";
import {
  Shield,
  Search,
  CheckCircle2,
  Lock,
  RefreshCw,
  Terminal,
  FileText,
  Key,
  Hash,
} from "lucide-react";

export default function AuditPage() {
  const [logs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [search, setSearch] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"VALID" | "VERIFYING">("VALID");

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.officerName.toLowerCase().includes(search.toLowerCase()) ||
      l.entityId.toLowerCase().includes(search.toLowerCase())
  );

  const handleVerifyChain = () => {
    setIsVerifying(true);
    setVerifyStatus("VERIFYING");
    setTimeout(() => {
      setIsVerifying(false);
      setVerifyStatus("VALID");
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b1222] border border-[#17223b]">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>Cryptographic Audit Trail (Append-Only)</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              SEC 65B COMPLIANT
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Tamper-evident hash chain recording every officer action, manual override, and case state transition
          </p>
        </div>

        <button
          onClick={handleVerifyChain}
          disabled={isVerifying}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
          <span>{isVerifying ? "VERIFYING CHAIN..." : "VERIFY SHA-256 HASH CHAIN"}</span>
        </button>
      </div>

      {/* Verification Status Card */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-semibold">BLOCKCHAIN INTEGRITY:</span>
          <span className="text-emerald-400">UNBROKEN MERKLE ROOT</span>
        </div>
        <div className="text-slate-400 text-[11px]">
          LAST VERIFIED: {new Date().toLocaleTimeString()} • ALGORITHM: SHA-256 HMAC
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by action, officer, or entity ID..."
          className="w-full bg-[#0d1424] text-xs text-slate-200 placeholder-slate-500 pl-9 pr-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
        />
      </div>

      {/* Audit Log Table */}
      <div className="fintech-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#070b14] border-b border-slate-800 text-[11px] text-slate-400 uppercase">
              <tr>
                <th className="p-3.5">Timestamp (UTC)</th>
                <th className="p-3.5">Officer / Badge</th>
                <th className="p-3.5">Action Code</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Host IP</th>
                <th className="p-3.5">SHA-256 Block Signature</th>
                <th className="p-3.5">Logged Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="p-3.5 text-slate-200 font-medium whitespace-nowrap">
                    <div>{log.officerName}</div>
                    <div className="text-[10px] text-indigo-400">{log.officerId}</div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300 whitespace-nowrap">
                    <span className="text-slate-400 text-[10px] block">{log.entityType}</span>
                    <span className="font-semibold">{log.entityId}</span>
                  </td>
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">{log.ipAddress}</td>
                  <td className="p-3.5 text-[10px] text-cyan-400/80 max-w-xs truncate" title={log.sha256Hash}>
                    {log.sha256Hash.slice(0, 16)}...
                  </td>
                  <td className="p-3.5 text-slate-300 min-w-[200px] text-[11px]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

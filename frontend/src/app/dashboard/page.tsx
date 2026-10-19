"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Transaction,
  ModelMetrics,
  InvestigationCase,
} from "@/types/fraud";
import { initialTransactions, initialMetrics } from "@/lib/mockData";
import { generateRandomTransaction } from "@/lib/scoringEngine";
import { mockCases } from "@/lib/apiClient";
import { ThreatTicker } from "@/components/ThreatTicker";
import { StatsCards } from "@/components/StatsCards";
import { GeoThreatMap } from "@/components/GeoThreatMap";
import { RiskBadge } from "@/components/ui/RiskBadge";
import {
  ShieldAlert,
  ArrowRight,
  FolderGit2,
  Sliders,
  Play,
  Pause,
  Zap,
  Activity,
  Layers,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { soundEngine } from "@/lib/soundFx";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [metrics, setMetrics] = useState<ModelMetrics>(initialMetrics);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [selectedTxn, setSelectedTxn] = useState<Transaction>(initialTransactions[1] || initialTransactions[0]);
  const [cases] = useState<InvestigationCase[]>(mockCases);

  // Background synthetic transaction ingestion simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const newTxn = generateRandomTransaction(false);
      if (newTxn.decision === "BLOCKED") {
        soundEngine.playAttackAlert();
      } else if (newTxn.decision === "OTP_REQUIRED") {
        soundEngine.playStepUpAlert();
      } else {
        soundEngine.playIngestBlip();
      }

      setTransactions((prev) => [newTxn, ...prev.slice(0, 49)]);
      setMetrics((prev) => ({
        ...prev,
        totalProcessed: prev.totalProcessed + 1,
        fraudAttemptCount: newTxn.decision === "BLOCKED" ? prev.fraudAttemptCount + 1 : prev.fraudAttemptCount,
        otpChallengeCount: newTxn.decision === "OTP_REQUIRED" ? prev.otpChallengeCount + 1 : prev.otpChallengeCount,
        autoApprovedCount: newTxn.decision === "APPROVED" ? prev.autoApprovedCount + 1 : prev.autoApprovedCount,
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // High & critical risk items for the triage queue
  const highRiskQueue = transactions.filter((t) => t.riskLevel === "HIGH" || t.riskScore >= 70).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Threat Ticker */}
      <ThreatTicker
        transactions={transactions}
        onSelectTransaction={(txn) => setSelectedTxn(txn)}
      />

      {/* Stream Control & Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0b1222] border border-[#17223b] text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isStreaming ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            <span className="font-mono text-slate-300 font-medium">
              INGESTION STREAM: {isStreaming ? "ONLINE" : "PAUSED"}
            </span>
          </div>
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono transition-colors border border-slate-700"
          >
            {isStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
            <span>{isStreaming ? "PAUSE STREAM" : "RESUME STREAM"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/simulator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-mono transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>ATTACK SIMULATOR</span>
          </Link>
          <Link
            href="/transactions"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>VIEW ALL ({transactions.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <StatsCards metrics={metrics} />

      {/* Main Grid: Triage Queue & Geo Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Triage Queue & Cases */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Triage Queue */}
          <div className="fintech-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="font-semibold text-sm text-slate-100">
                  Urgent Investigative Queue (High Risk / Score ≥ 70)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {highRiskQueue.length} Active Incidents
              </span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {highRiskQueue.length === 0 ? (
                <div className="p-6 text-center text-xs font-mono text-slate-500">
                  No high-risk transactions currently flagged in active buffer.
                </div>
              ) : (
                highRiskQueue.map((txn) => (
                  <div
                    key={txn.id}
                    onClick={() => setSelectedTxn(txn)}
                    className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/40 cursor-pointer transition-colors ${
                      selectedTxn.id === txn.id ? "bg-indigo-950/20 border-l-2 border-indigo-500" : ""
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-200">{txn.id}</span>
                        <RiskBadge level={txn.riskLevel} score={txn.riskScore} />
                        <span className="text-[11px] font-mono text-slate-400">{txn.merchantCategory}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        <span className="text-slate-300 font-medium">{txn.customerName}</span> •{" "}
                        <span className="font-mono text-slate-400">{txn.location.city}, {txn.location.country}</span> •{" "}
                        <span className="text-[11px] text-slate-500 font-mono">
                          {txn.device.isNewDevice ? "NEW DEVICE" : "KNOWN DEVICE"}
                        </span>
                      </div>
                      {txn.ruleFlags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {txn.ruleFlags.slice(0, 2).map((flag) => (
                            <span
                              key={flag}
                              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-900/40"
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2">
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-slate-100">
                          ₹{txn.amount.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">{txn.paymentMethod.type.toUpperCase()}</div>
                      </div>
                      <Link
                        href={`/transactions/${txn.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <span>DOSSIER</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-[#0a0f1d] border-t border-slate-800 text-center">
              <Link
                href="/transactions"
                className="text-xs font-mono text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
              >
                <span>OPEN FULL INVESTIGATIVE TELEMETRY TABLE</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Active Cases Snapshot */}
          <div className="fintech-card rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-sm text-slate-100">Active Case Files (Cyber Crime Cell)</h3>
              </div>
              <Link
                href="/cases"
                className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>ALL CASES</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.id}`}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group block space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-300">{c.caseNumber}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        c.status === "ESCALATED"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <h4 className="text-xs text-slate-200 font-medium line-clamp-1 group-hover:text-white transition-colors">
                    {c.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>₹{c.totalAmountAtRisk.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-slate-500">{c.assignedTo}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Selected Incident Geo Threat Vector */}
        <div className="space-y-6">
          <div className="fintech-card rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="font-semibold text-sm text-slate-100">Telemetry Geographic Vector</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">FOCUS: {selectedTxn.id}</span>
            </div>

            <GeoThreatMap location={selectedTxn.location} />

            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Entity:</span>
                <span className="text-slate-200">{selectedTxn.merchant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IP Location:</span>
                <span className="text-slate-200">
                  {selectedTxn.location.city}, {selectedTxn.location.country}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">VPN / Tor Proxy:</span>
                <span className={selectedTxn.location.isVpnOrProxy ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  {selectedTxn.location.isVpnOrProxy ? "DETECTED (ANONYMIZER)" : "CLEAN DIRECT"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Travel Distance Jump:</span>
                <span className="text-slate-200">{selectedTxn.location.distanceFromHomeKm} km</span>
              </div>
            </div>

            <Link
              href={`/transactions/${selectedTxn.id}`}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 font-mono text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>INSPECT COMPLETE SHAP BREAKDOWN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Platform Status */}
          <div className="p-4 rounded-xl bg-[#090e1a] border border-[#141d30] space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>SECURITY LEVEL</span>
              <span className="text-emerald-400 font-bold">AIR-GAP MOCK</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>HASH CHAIN</span>
              <span className="text-cyan-400 font-bold">VERIFIED (SHA-256)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>PRECISION BENCHMARK</span>
              <span className="text-amber-400 font-bold">CALIBRATION REQ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

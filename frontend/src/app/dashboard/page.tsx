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
  ChevronRight,
  ShieldCheck,
  Clock,
  MapPin,
  Smartphone,
} from "lucide-react";
import { soundEngine } from "@/lib/soundFx";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [metrics, setMetrics] = useState<ModelMetrics>(initialMetrics);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [selectedTxn, setSelectedTxn] = useState<Transaction>(
    initialTransactions[1] || initialTransactions[0]
  );
  const [cases, setCases] = useState<InvestigationCase[]>(mockCases);

  // Initialize from backend DB
  useEffect(() => {
    async function loadBackendData() {
      try {
        const txnRes = await fetch("/api/v1/transactions?limit=60");
        if (txnRes.ok) {
          const txnData = await txnRes.json();
          if (Array.isArray(txnData) && txnData.length > 0) {
            setTransactions(txnData);
            setSelectedTxn(
              txnData.find((t: any) => t.riskLevel === "HIGH" || t.riskLevel === "CRITICAL") ||
                txnData[0]
            );

            // Compute DB-driven stats
            const total = txnData.length;
            const blocked = txnData.filter((t: any) => t.decision === "BLOCKED");
            const otp = txnData.filter((t: any) => t.decision === "OTP_REQUIRED");
            const approved = txnData.filter((t: any) => t.decision === "APPROVED");
            const blockedAmt = blocked.reduce((acc: number, t: any) => acc + (t.amount || 0), 0);

            setMetrics((prev) => ({
              ...prev,
              totalProcessed: total,
              fraudAttemptCount: blocked.length,
              otpChallengeCount: otp.length,
              autoApprovedCount: approved.length,
              fraudBlockedAmount: blockedAmt,
            }));
          }
        }
      } catch {
        // Fallback to initial mock if backend not yet ready
      }

      try {
        const caseRes = await fetch("/api/v1/cases");
        if (caseRes.ok) {
          const caseData = await caseRes.json();
          if (Array.isArray(caseData) && caseData.length > 0) {
            setCases(caseData);
          }
        }
      } catch {
        // Fallback to mock cases
      }
    }
    loadBackendData();
  }, []);

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

      setTransactions((prev) => [newTxn, ...prev.slice(0, 59)]);
      setMetrics((prev) => ({
        ...prev,
        totalProcessed: prev.totalProcessed + 1,
        fraudAttemptCount:
          newTxn.decision === "BLOCKED" ? prev.fraudAttemptCount + 1 : prev.fraudAttemptCount,
        otpChallengeCount:
          newTxn.decision === "OTP_REQUIRED" ? prev.otpChallengeCount + 1 : prev.otpChallengeCount,
        autoApprovedCount:
          newTxn.decision === "APPROVED" ? prev.autoApprovedCount + 1 : prev.autoApprovedCount,
        fraudBlockedAmount:
          newTxn.decision === "BLOCKED"
            ? prev.fraudBlockedAmount + newTxn.amount
            : prev.fraudBlockedAmount,
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // High risk items for the triage queue
  const highRiskQueue = transactions
    .filter((t) => t.riskLevel === "HIGH" || t.riskScore >= 70)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Threat Ticker */}
      <ThreatTicker
        transactions={transactions}
        onSelectTransaction={(txn) => setSelectedTxn(txn)}
      />

      {/* Stream Control & Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0d0d10] border border-[#222226] text-xs shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isStreaming ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
              }`}
            />
            <span className="text-zinc-200 font-medium">
              Live Ingestion:{" "}
              <span className={isStreaming ? "text-emerald-400 font-semibold" : "text-zinc-400"}>
                {isStreaming ? "Active" : "Paused"}
              </span>
            </span>
          </div>

          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#141418] hover:bg-[#1a1a20] text-zinc-200 transition-colors border border-[#27272a] font-medium"
          >
            {isStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
            <span>{isStreaming ? "Pause Feed" : "Resume Feed"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/simulator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/60 font-medium transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-300" />
            <span>Simulate Attack</span>
          </Link>
          <Link
            href="/transactions"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141418] hover:bg-[#1a1a20] text-zinc-200 border border-[#27272a] font-medium transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-zinc-400" />
            <span>All Transactions ({transactions.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <StatsCards metrics={metrics} />

      {/* Main Grid: Triage Queue & Geo Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Triage Queue & Cases */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Review Queue */}
          <div className="bg-[#0d0d10] backdrop-blur-md rounded-2xl border border-[#222226] overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-[#222226] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-zinc-100">
                    Urgent Review Queue
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    High risk anomalies requiring immediate analyst evaluation
                  </p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#18181c] text-zinc-300 font-medium border border-[#27272a]">
                {highRiskQueue.length} Flagged
              </span>
            </div>

            <div className="divide-y divide-[#1e1e22]">
              {highRiskQueue.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  No critical incidents currently pending review. Live traffic is clean.
                </div>
              ) : (
                highRiskQueue.map((txn) => (
                  <div
                    key={txn.id}
                    onClick={() => setSelectedTxn(txn)}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#121215] cursor-pointer transition-colors ${
                      selectedTxn.id === txn.id
                        ? "bg-[#18181c] border-l-2 border-zinc-400"
                        : ""
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-200">
                          {txn.id}
                        </span>
                        <RiskBadge level={txn.riskLevel} score={txn.riskScore} size="sm" />
                        <span className="text-[11px] text-zinc-400">
                          {txn.merchantCategory}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-2">
                        <span className="text-zinc-200 font-medium">
                          {txn.customerName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          {txn.location.city}, {txn.location.country}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Smartphone className="w-3 h-3 text-zinc-500" />
                          {txn.device.isNewDevice ? "New Device" : "Known Device"}
                        </span>
                      </div>
                      {txn.ruleFlags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {txn.ruleFlags.slice(0, 2).map((flag) => (
                            <span
                              key={flag}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium"
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2">
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-white">
                          ₹{txn.amount.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-zinc-400 uppercase">
                          {txn.paymentMethod.brand} • {txn.paymentMethod.last4}
                        </div>
                      </div>
                      <Link
                        href={`/transactions/${txn.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                      >
                        <span>Inspect Dossier</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-[#08080a] border-t border-[#222226] text-center">
              <Link
                href="/transactions"
                className="text-xs font-medium text-zinc-300 hover:text-white inline-flex items-center gap-1"
              >
                <span>Open Complete Transactions Table</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Active Case Files */}
          <div className="bg-[#0d0d10] backdrop-blur-md rounded-2xl border border-[#222226] p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-zinc-100">
                    Active Investigation Cases
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Escalated cases assigned to fraud specialists
                  </p>
                </div>
              </div>
              <Link
                href="/cases"
                className="text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.id}`}
                  className="p-4 rounded-xl bg-[#121215] border border-[#222226] hover:border-zinc-700 transition-all group block space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-zinc-200">
                      {c.caseNumber}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        c.status === "ESCALATED"
                          ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <h4 className="text-xs text-zinc-200 font-medium line-clamp-1 group-hover:text-white transition-colors">
                    {c.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-[#1e1e22]">
                    <span className="font-mono font-medium text-zinc-200">
                      ₹{c.totalAmountAtRisk.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-zinc-400">{c.assignedTo}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Selected Incident Geo Threat Vector */}
        <div className="space-y-6">
          <div className="bg-[#0d0d10] backdrop-blur-md rounded-2xl border border-[#222226] p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                <h3 className="font-semibold text-sm text-zinc-100">
                  Geographic Risk Vector
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Focus: {selectedTxn.id}
              </span>
            </div>

            <GeoThreatMap location={selectedTxn.location} />

            <div className="p-3.5 rounded-xl bg-[#121215] border border-[#222226] space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Merchant Target:</span>
                <span className="text-zinc-200 font-medium">{selectedTxn.merchant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Origin Location:</span>
                <span className="text-zinc-200">
                  {selectedTxn.location.city}, {selectedTxn.location.country}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">VPN / Anonymizer:</span>
                <span
                  className={
                    selectedTxn.location.isVpnOrProxy
                      ? "text-rose-400 font-medium"
                      : "text-emerald-400 font-medium"
                  }
                >
                  {selectedTxn.location.isVpnOrProxy ? "Detected (Proxy Tunnel)" : "Clean Direct IP"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Travel Distance Jump:</span>
                <span className="text-zinc-200 font-mono">
                  {selectedTxn.location.distanceFromHomeKm.toLocaleString()} km
                </span>
              </div>
            </div>

            <Link
              href={`/transactions/${selectedTxn.id}`}
              className="w-full py-2 px-3 rounded-xl bg-[#18181c] hover:bg-[#222226] border border-[#27272a] text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Inspect SHAP Feature Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Platform Status */}
          <div className="p-4 rounded-xl bg-[#0d0d10] border border-[#222226] space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Environment Security</span>
              <span className="text-emerald-400 font-medium">Verified Active</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Audit Chain Integrity</span>
              <span className="text-zinc-300 font-mono text-[11px]">SHA-256 Validated</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Model Latency</span>
              <span className="text-zinc-300 font-mono text-[11px]">38ms Average</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

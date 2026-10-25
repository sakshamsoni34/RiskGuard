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
  Eye,
  Radio,
  ExternalLink,
  Lock,
  FileCheck,
  TrendingUp,
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
  const [queueFilter, setQueueFilter] = useState<"ALL" | "CRITICAL" | "HIGH">("ALL");

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
              txnData.find((t: any) => t.riskLevel === "CRITICAL" || t.riskLevel === "HIGH") ||
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
    }, 4500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Latest critical/high threat for the real-time ticker
  const latestThreat =
    transactions.find((t) => t.riskLevel === "CRITICAL" || t.riskLevel === "HIGH") ||
    transactions[0];

  // High risk items for the priority triage queue
  const highRiskQueue = transactions
    .filter((t) => {
      if (queueFilter === "CRITICAL") return t.riskScore >= 85 || t.riskLevel === "CRITICAL";
      if (queueFilter === "HIGH") return t.riskScore >= 70 && t.riskScore < 85;
      return t.riskScore >= 70 || t.riskLevel === "HIGH" || t.riskLevel === "CRITICAL";
    })
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* 1. Unified Executive Command Header */}
      <div className="rounded-2xl border border-[#222226] bg-[#0c0c0f] p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        {/* Left: Stream Status & Live Pulse */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#141418] border border-[#26262c]">
            <span className="relative flex h-2.5 w-2.5">
              {isStreaming && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isStreaming ? "bg-emerald-500" : "bg-zinc-500"
                }`}
              />
            </span>
            <span className="text-xs font-semibold text-white">
              {isStreaming ? "Live Feed Ingesting" : "Feed Paused"}
            </span>
          </div>

          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181d] hover:bg-[#222228] text-xs font-medium text-zinc-300 hover:text-white border border-[#282830] hover:border-zinc-500 hover:scale-[1.03] active:scale-95 transition-all"
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5 text-zinc-400" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resume</span>
              </>
            )}
          </button>
        </div>

        {/* Center: Live Threat Alert Ticker */}
        {latestThreat && (
          <div
            onClick={() => setSelectedTxn(latestThreat)}
            className="flex-1 max-w-2xl flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-xl bg-[#131317] border border-[#282830] hover:border-rose-500/50 hover:bg-[#16121a] hover:shadow-lg hover:shadow-rose-950/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center gap-2 truncate text-xs">
              <span className="flex items-center gap-1 font-bold text-rose-400 bg-rose-950/80 border border-rose-800/50 px-2 py-0.5 rounded text-[10px] group-hover:brightness-125 transition-all">
                <ShieldAlert className="w-3 h-3" />
                Latest Threat
              </span>
              <span className="font-mono font-bold text-white group-hover:text-rose-200 transition-colors">
                ₹{latestThreat.amount.toLocaleString("en-IN")}
              </span>
              <span className="text-zinc-400 truncate">
                at <strong className="text-zinc-200">{latestThreat.merchant}</strong> ({latestThreat.location.city})
              </span>
            </div>

            <span className="text-[11px] font-medium text-sky-400 flex items-center gap-1 flex-shrink-0 group-hover:underline group-hover:translate-x-0.5 transition-transform">
              <span>Inspect</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        )}

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          <Link
            href="/simulator"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-md shadow-indigo-950/50 hover:shadow-indigo-500/30 hover:scale-[1.03] active:scale-95 transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate Attack</span>
          </Link>
          <Link
            href="/transactions"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141418] hover:bg-[#1a1a20] text-zinc-200 hover:text-white border border-[#282830] hover:border-zinc-500 hover:scale-[1.03] active:scale-95 font-medium text-xs transition-all"
          >
            <Activity className="w-3.5 h-3.5 text-zinc-400" />
            <span>All Events ({transactions.length})</span>
          </Link>
        </div>
      </div>

      {/* 2. Streamlined Metric KPI Cards */}
      <StatsCards metrics={metrics} />

      {/* 3. Core Investigation Grid (Left: 7 cols, Right: 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Priority Threat Queue & Case Files */}
        <div className="lg:col-span-7 space-y-6">
          {/* Priority Threat Queue Card */}
          <div className="bg-[#0c0c0f] rounded-2xl border border-[#222226] overflow-hidden shadow-xl">
            {/* Queue Header & Filters */}
            <div className="p-4 sm:p-5 border-b border-[#222226] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Priority Threat Queue</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/50">
                      {highRiskQueue.length} Active
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Click any incident to inspect its live geospatial travel vector
                  </p>
                </div>
              </div>

              {/* Severity Filter Tabs */}
              <div className="inline-flex rounded-xl bg-[#141418] p-1 border border-[#242429] text-xs">
                <button
                  type="button"
                  onClick={() => setQueueFilter("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    queueFilter === "ALL"
                      ? "bg-[#25252c] text-white shadow-sm font-semibold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  All ({transactions.filter((t) => t.riskScore >= 70).length})
                </button>
                <button
                  type="button"
                  onClick={() => setQueueFilter("CRITICAL")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    queueFilter === "CRITICAL"
                      ? "bg-rose-950 text-rose-300 border border-rose-800/60 font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-rose-300"
                  }`}
                >
                  Critical (85+)
                </button>
                <button
                  type="button"
                  onClick={() => setQueueFilter("HIGH")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    queueFilter === "HIGH"
                      ? "bg-amber-950 text-amber-300 border border-amber-800/60 font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-amber-300"
                  }`}
                >
                  High (70-84)
                </button>
              </div>
            </div>

            {/* List of Incidents */}
            <div className="divide-y divide-[#1c1c22]">
              {highRiskQueue.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  No high-risk anomalies matching the selected filter.
                </div>
              ) : (
                highRiskQueue.map((txn) => {
                  const isSelected = selectedTxn.id === txn.id;
                  const isCritical = txn.riskScore >= 85 || txn.riskLevel === "CRITICAL";

                  return (
                    <div
                      key={txn.id}
                      onClick={() => setSelectedTxn(txn)}
                      className={`p-4 sm:p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-[#141822] border-l-4 border-sky-400 shadow-md shadow-sky-950/20"
                          : "hover:bg-[#141419] hover:translate-x-1 hover:border-l-4 hover:border-zinc-500 border-l-4 border-transparent"
                      }`}
                    >
                      {/* Left: ID, Score & User Info */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-white bg-[#1a1a22] px-2 py-0.5 rounded border border-[#2a2a34]">
                            {txn.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                              isCritical
                                ? "bg-rose-950/90 text-rose-300 border-rose-800/60"
                                : "bg-amber-950/90 text-amber-300 border-amber-800/60"
                            }`}
                          >
                            Score: {txn.riskScore}/100 ({txn.riskLevel})
                          </span>
                          <span className="text-[11px] text-zinc-400 font-medium">
                            {txn.merchant}
                          </span>
                        </div>

                        <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-2">
                          <strong className="text-zinc-200 font-medium">
                            {txn.customerName}
                          </strong>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-zinc-300">
                            <MapPin className="w-3 h-3 text-sky-400" />
                            {txn.location.city}, {txn.location.country}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                            <Smartphone className="w-3 h-3 text-zinc-500" />
                            {txn.device.isNewDevice ? "Unrecognized Hardware" : "Trusted Device"}
                          </span>
                        </div>

                        {/* Anomaly Badges */}
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {txn.location.isVpnOrProxy && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/40 font-medium">
                              VPN / Tor Proxy
                            </span>
                          )}
                          {txn.location.distanceFromHomeKm > 1000 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/40 font-medium">
                              {txn.location.distanceFromHomeKm.toLocaleString()} km Jump
                            </span>
                          )}
                          {txn.velocity.last2MinutesCount >= 3 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/40 font-medium">
                              {txn.velocity.last2MinutesCount} Rapid Attempts
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Inspect Indicator */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 sm:text-right w-full sm:w-auto">
                        <div>
                          <div className="font-mono font-bold text-base text-white">
                            ₹{txn.amount.toLocaleString("en-IN")}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400 uppercase">
                            {txn.paymentMethod.brand || txn.paymentMethod.type} •••• {txn.paymentMethod.last4 || "0000"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <span className="text-[10px] font-bold text-sky-400 bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Inspecting
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-400 group-hover:text-white flex items-center gap-1">
                              <span>Details</span>
                              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Queue Footer */}
            <div className="p-3 bg-[#09090c] border-t border-[#222226] flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono text-[11px]">
                Showing top 5 high-priority alerts
              </span>
              <Link
                href="/transactions"
                className="font-medium text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 hover:translate-x-0.5 transition-all"
              >
                <span>Open Complete Transactions Table</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Active Case Files Card */}
          <div className="bg-[#0c0c0f] rounded-2xl border border-[#222226] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#222226] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <FolderGit2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Active Case Investigations
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Formal criminal dossiers assigned to cyber-cell officers
                  </p>
                </div>
              </div>

              <Link
                href="/cases"
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 hover:translate-x-0.5 transition-all"
              >
                <span>View All Cases</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {cases.slice(0, 3).map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.id}`}
                  className="p-3.5 rounded-xl bg-[#121216] border border-[#222226] hover:border-zinc-600 hover:bg-[#16161c] hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] transition-all duration-200 group block space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">
                      {c.caseNumber}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                        c.status === "ESCALATED"
                          ? "bg-rose-950/80 text-rose-300 border border-rose-800/40"
                          : "bg-amber-950/80 text-amber-300 border border-amber-800/40"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <h4 className="text-xs text-zinc-200 font-semibold line-clamp-1 group-hover:text-white transition-colors">
                    {c.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-[#1e1e24]">
                    <span className="font-mono font-bold text-white">
                      ₹{c.totalAmountAtRisk.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[100px]">
                      {c.assignedTo}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Active Forensic Threat Dossier */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c0c0f] rounded-2xl border border-[#222226] p-5 space-y-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#222226] pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Incident Forensic Dossier</span>
                  <span className="font-mono text-xs text-sky-400 bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 rounded">
                    {selectedTxn.id}
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Real-time telemetry and decision rationale
                </p>
              </div>

              <div>
                {selectedTxn.decision === "BLOCKED" && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/50">
                    Auto-Blocked
                  </span>
                )}
                {selectedTxn.decision === "OTP_REQUIRED" && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/50">
                    2FA Challenged
                  </span>
                )}
                {selectedTxn.decision === "APPROVED" && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                    Approved
                  </span>
                )}
              </div>
            </div>

            {/* Geospatial Radar Visualization */}
            <GeoThreatMap location={selectedTxn.location} />

            {/* Quick Forensic Attribution Grid */}
            <div className="p-3.5 rounded-xl bg-[#121217] border border-[#222226] space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Target Merchant:</span>
                <span className="text-white font-medium">{selectedTxn.merchant}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Cardholder Name:</span>
                <span className="text-white font-medium">{selectedTxn.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Transaction Value:</span>
                <span className="font-mono font-bold text-white text-sm">
                  ₹{selectedTxn.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Network Telemetry:</span>
                <span
                  className={`font-semibold ${
                    selectedTxn.location.isVpnOrProxy ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {selectedTxn.location.isVpnOrProxy ? "Masked VPN / Proxy Tunnel" : "Direct Residential ISP"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Device Integrity:</span>
                <span
                  className={selectedTxn.device.isNewDevice ? "text-amber-400 font-medium" : "text-emerald-400 font-medium"}
                >
                  {selectedTxn.device.isNewDevice ? "Unrecognized Browser Token" : "Trusted Client Hardware"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#1e1e24]">
                <span className="text-zinc-400 font-mono">Calculated AI Risk:</span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  {selectedTxn.riskScore} / 100 ({selectedTxn.riskLevel})
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <Link
              href={`/transactions/${selectedTxn.id}`}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 border border-zinc-600 hover:border-zinc-400 text-white text-xs font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span>Inspect Complete Forensic Dossier</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Platform Statutory Status */}
          <div className="p-4 rounded-xl bg-[#0c0c0f] border border-[#222226] space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Statutory Compliance</span>
              </span>
              <span className="text-emerald-400 font-semibold text-[11px]">IT Act Sec 65B</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Audit Ledger Integrity</span>
              </span>
              <span className="text-zinc-200 text-[11px]">SHA-256 Merkle Chain</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Engine Latency</span>
              </span>
              <span className="text-zinc-200 text-[11px]">Sub-40ms P95</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

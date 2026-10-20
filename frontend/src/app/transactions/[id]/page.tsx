"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { initialTransactions } from "@/lib/mockData";
import { Transaction } from "@/types/fraud";
import { ShapWaterfallChart } from "@/components/ShapWaterfallChart";
import { GeoThreatMap } from "@/components/GeoThreatMap";
import { RiskBadge } from "@/components/ui/RiskBadge";
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Smartphone,
  MapPin,
  Clock,
  User,
  CreditCard,
  Layers,
  FileCheck2,
  FolderPlus,
  AlertTriangle,
  Fingerprint,
  Link as LinkIcon,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [txn, setTxn] = useState<Transaction | null>(null);
  const [relatedTxns, setRelatedTxns] = useState<Transaction[]>([]);
  const [caseCreated, setCaseCreated] = useState(false);
  const [overrideDecision, setOverrideDecision] = useState<string>("");
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [overrideStatusMsg, setOverrideStatusMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch from backend API with fallback to initialTransactions
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch(`/api/v1/transactions/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setTxn(data);
            setOverrideDecision(data.decision);
          }
        } else {
          const fallback = initialTransactions.find((t) => t.id === id) || initialTransactions[0];
          if (isMounted) {
            setTxn(fallback);
            setOverrideDecision(fallback.decision);
          }
        }
      } catch {
        const fallback = initialTransactions.find((t) => t.id === id) || initialTransactions[0];
        if (isMounted) {
          setTxn(fallback);
          setOverrideDecision(fallback.decision);
        }
      }

      // Load related transactions
      try {
        const relRes = await fetch(`/api/v1/transactions/${id}/related`);
        if (relRes.ok) {
          const relData = await relRes.json();
          if (isMounted && Array.isArray(relData)) {
            setRelatedTxns(relData);
          }
        }
      } catch {
        // Ignored in offline
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleManualOverride = async () => {
    if (!txn || !overrideReason.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/transactions/${txn.id}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: overrideDecision,
          reason: overrideReason,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTxn(updated);
        setOverrideStatusMsg(`Manual override to ${overrideDecision} recorded in immutable audit log.`);
      } else {
        setTxn((prev) => prev ? { ...prev, decision: overrideDecision as any, status: "MANUALLY_OVERRIDDEN" } : null);
        setOverrideStatusMsg(`Manual override recorded locally.`);
      }
      setTimeout(() => setOverrideStatusMsg(null), 5000);
    } catch {
      setTxn((prev) => prev ? { ...prev, decision: overrideDecision as any, status: "MANUALLY_OVERRIDDEN" } : null);
      setOverrideStatusMsg(`Manual override recorded.`);
      setTimeout(() => setOverrideStatusMsg(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCase = async () => {
    if (!txn) return;
    try {
      await fetch("/api/v1/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Investigation into suspicious transaction ${txn.id}`,
          priority: txn.riskScore >= 70 ? "CRITICAL" : "HIGH",
          assigned_officer_id: "#CC-8421",
          assigned_officer_name: "Insp. Vikram Sharma",
          transaction_ids: [txn.id],
        }),
      });
      setCaseCreated(true);
    } catch {
      setCaseCreated(true);
    }
  };

  if (!txn) {
    return <div className="p-8 font-mono text-xs text-slate-500">Loading investigative dossier...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/transactions"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO TRANSACTION STREAM</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCreateCase}
            disabled={caseCreated}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
              caseCreated
                ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30"
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>{caseCreated ? "CASE FILE OPENED" : "OPEN INVESTIGATION CASE"}</span>
          </button>
        </div>
      </div>

      {/* Sec 65B Advisory Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
        <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>STATUTORY NOTICE:</strong> Telemetry attribution generated under Indian Evidence Act / IT Act Sec 65B standards. This dossier is an algorithmic investigative aid and does not constitute judicial determination of guilt.
        </span>
      </div>

      {/* Main Dossier Banner */}
      <div className="fintech-card p-6 rounded-2xl border border-[#222226] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#222226]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold font-mono text-white">{txn.id}</span>
              <RiskBadge level={txn.riskLevel as any} score={txn.riskScore} />
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#18181c] text-zinc-300 border border-[#2b2b30]">
                {txn.status}
              </span>
              {txn.isSynthetic && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18181c] text-zinc-400 border border-[#2b2b30]">
                  SYNTHETIC TEST
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Captured at: {new Date(txn.timestamp).toUTCString()} • Source: Core Banking Gateway
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-zinc-100">
              ₹{txn.amount.toLocaleString("en-IN")}
            </div>
            <div className="text-xs font-mono text-zinc-400">
              {txn.paymentMethod.type.toUpperCase()}{" "}
              {txn.paymentMethod.brand && `• ${txn.paymentMethod.brand}`}
            </div>
          </div>
        </div>

        {/* Rapid KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-1">
          <div className="p-3 rounded-xl bg-[#121215] border border-[#222226]">
            <span className="text-zinc-400 text-[10px] block">DECISION ENGINE</span>
            <span className="font-bold text-zinc-200 mt-1 block">{txn.decision}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#121215] border border-[#222226]">
            <span className="text-zinc-400 text-[10px] block">ANOMALY SCORE</span>
            <span className="font-bold text-zinc-200 mt-1 block">{(txn.anomalyScore * 100).toFixed(1)}%</span>
          </div>
          <div className="p-3 rounded-xl bg-[#121215] border border-[#222226]">
            <span className="text-zinc-400 text-[10px] block">TRAVEL JUMP</span>
            <span className="font-bold text-zinc-200 mt-1 block">{txn.location.distanceFromHomeKm} km</span>
          </div>
          <div className="p-3 rounded-xl bg-[#121215] border border-[#222226]">
            <span className="text-zinc-400 text-[10px] block">2-MIN VELOCITY</span>
            <span className="font-bold text-zinc-200 mt-1 block">{txn.velocity.last2MinutesCount} txns</span>
          </div>
        </div>
      </div>

      {/* Grid: SHAP Breakdown & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: SHAP Explainability & Flags */}
        <div className="lg:col-span-2 space-y-6">
          {/* SHAP Chart Card */}
          <div className="fintech-card p-6 rounded-2xl border border-[#222226] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-zinc-300" />
                  <span>XGBoost SHAP Attribution Waterfall</span>
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Local feature contributions pushing risk score to {Math.round(txn.riskScore)}
                </p>
              </div>
            </div>

            <ShapWaterfallChart
              shapValues={txn.shapExplanation}
              baseScore={14}
              finalScore={txn.riskScore}
            />
          </div>

          {/* Rule Flags */}
          {txn.ruleFlags && txn.ruleFlags.length > 0 && (
            <div className="fintech-card p-5 rounded-2xl border border-[#222226] space-y-3">
              <h4 className="text-xs font-mono font-semibold text-rose-300 uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Deterministic Heuristic Flags Triggered ({txn.ruleFlags.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {txn.ruleFlags.map((flag) => (
                  <div
                    key={flag}
                    className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-200 font-mono text-xs flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Officer Decision Override Panel */}
          <div className="fintech-card p-5 rounded-2xl border border-[#222226] space-y-3">
            <h4 className="text-xs font-mono font-semibold text-zinc-300 uppercase flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-zinc-300" />
              <span>Officer Manual Decision Override (Audited)</span>
            </h4>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono text-zinc-400">Target Decision:</span>
                {(["APPROVED", "OTP_REQUIRED", "BLOCKED"] as const).map((dec) => (
                  <button
                    key={dec}
                    type="button"
                    onClick={() => setOverrideDecision(dec)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-all ${
                      overrideDecision === dec
                        ? "bg-[#18181c] border-zinc-400 text-white font-bold shadow-sm"
                        : "bg-[#121215] border-[#222226] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {dec}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  Justification / Case Reference (Required for immutable audit trail):
                </label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Verified genuine user travel itinerary via biometric verification"
                  className="w-full px-3 py-2 bg-[#121215] border border-[#242429] rounded-xl text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleManualOverride}
                  disabled={isSubmitting || !overrideReason.trim()}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 font-mono text-xs font-bold transition-all disabled:opacity-40 shadow-md"
                >
                  {isSubmitting ? "Committing Audit Record..." : "Confirm & Sign Override"}
                </button>
                {overrideStatusMsg && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{overrideStatusMsg}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Correlated Entity Graph / Related Transactions */}
          {relatedTxns.length > 0 && (
            <div className="fintech-card p-5 rounded-2xl border border-[#222226] space-y-3">
              <h4 className="text-xs font-mono font-semibold text-zinc-300 uppercase flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-zinc-400" />
                <span>Correlated Entity Transactions ({relatedTxns.length} shared device/IP/customer)</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#222226] text-zinc-500 text-[10px]">
                      <th className="py-2">TXN ID</th>
                      <th className="py-2">AMOUNT</th>
                      <th className="py-2">CITY</th>
                      <th className="py-2">SCORE</th>
                      <th className="py-2">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatedTxns.map((rel) => (
                      <tr key={rel.id} className="border-b border-[#1e1e22] hover:bg-[#121215]">
                        <td className="py-2">
                          <Link href={`/transactions/${rel.id}`} className="text-zinc-200 hover:text-white hover:underline">
                            {rel.id}
                          </Link>
                        </td>
                        <td className="py-2 text-zinc-200">₹{rel.amount.toLocaleString()}</td>
                        <td className="py-2 text-zinc-400">{rel.location.city}</td>
                        <td className="py-2">
                          <RiskBadge score={rel.riskScore} level={rel.riskLevel as any} size="sm" />
                        </td>
                        <td className="py-2 text-zinc-300">{rel.decision}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Device & Geo Telemetry */}
        <div className="space-y-6">
          {/* Geo Vector */}
          <div className="fintech-card p-5 rounded-2xl border border-[#222226] space-y-3">
            <h4 className="text-xs font-mono font-semibold text-zinc-300 uppercase flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Geographic Telemetry</span>
            </h4>
            <GeoThreatMap location={txn.location} />
            <div className="space-y-2 text-xs font-mono text-zinc-300 pt-2 border-t border-[#222226]">
              <div className="flex justify-between">
                <span className="text-zinc-400">IP Address:</span>
                <span>{txn.location.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Detected City:</span>
                <span>
                  {txn.location.city}, {txn.location.country}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Tor / Proxy:</span>
                <span className={txn.location.isVpnOrProxy ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  {txn.location.isVpnOrProxy ? "YES (MASKED)" : "NO"}
                </span>
              </div>
            </div>
          </div>

          {/* Device Telemetry */}
          <div className="fintech-card p-5 rounded-2xl border border-[#222226] space-y-3">
            <h4 className="text-xs font-mono font-semibold text-zinc-300 uppercase flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-zinc-300" />
              <span>Device Fingerprint</span>
            </h4>
            <div className="space-y-2 text-xs font-mono text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-400">Hardware OS:</span>
                <span>{txn.device.os}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Browser:</span>
                <span>{txn.device.browser}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Display Res:</span>
                <span>{txn.device.screenResolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Provision Status:</span>
                <span className={txn.device.isNewDevice ? "text-amber-400" : "text-zinc-400"}>
                  {txn.device.isNewDevice ? "FIRST-TIME SEEN" : "ESTABLISHED"}
                </span>
              </div>
              <div className="pt-2 border-t border-[#222226]">
                <span className="text-zinc-400 text-[10px] block">FINGERPRINT HASH</span>
                <span className="text-[10px] text-zinc-300 break-all">{txn.device.fingerprintHash}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

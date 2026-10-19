"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { initialTransactions } from "@/lib/mockData";
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
} from "lucide-react";

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [caseCreated, setCaseCreated] = useState(false);

  // Find transaction from mock data or default to first
  const txn = initialTransactions.find((t) => t.id === id) || initialTransactions[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Navigation & Header */}
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
            onClick={() => setCaseCreated(true)}
            disabled={caseCreated}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-colors ${
              caseCreated
                ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30"
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>{caseCreated ? "CASE FILE OPENED (CR-2026-0845)" : "OPEN INVESTIGATION CASE"}</span>
          </button>
        </div>
      </div>

      {/* Main Dossier Banner */}
      <div className="fintech-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold font-mono text-white">{txn.id}</span>
              <RiskBadge level={txn.riskLevel} score={txn.riskScore} />
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {txn.status}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Captured at: {new Date(txn.timestamp).toUTCString()} • Source: Core Banking Gateway
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-slate-100">
              ₹{txn.amount.toLocaleString("en-IN")}
            </div>
            <div className="text-xs font-mono text-slate-400">
              {txn.paymentMethod.type.toUpperCase()}{" "}
              {txn.paymentMethod.brand && `• ${txn.paymentMethod.brand}`}
            </div>
          </div>
        </div>

        {/* Rapid KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-1">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">DECISION ENGINE</span>
            <span className="font-bold text-slate-200 mt-1 block">{txn.decision}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">ANOMALY SCORE</span>
            <span className="font-bold text-slate-200 mt-1 block">{(txn.anomalyScore * 100).toFixed(1)}%</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">TRAVEL JUMP</span>
            <span className="font-bold text-slate-200 mt-1 block">{txn.location.distanceFromHomeKm} km</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">2-MIN VELOCITY</span>
            <span className="font-bold text-slate-200 mt-1 block">{txn.velocity.last2MinutesCount} txns</span>
          </div>
        </div>
      </div>

      {/* Grid: SHAP Breakdown & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: SHAP Explainability & Flags */}
        <div className="lg:col-span-2 space-y-6">
          {/* SHAP Chart Card */}
          <div className="fintech-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>XGBoost SHAP Attribution Waterfall</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Local feature contributions pushing risk score from base 14 to {Math.round(txn.riskScore)}
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
          {txn.ruleFlags.length > 0 && (
            <div className="fintech-card p-5 rounded-2xl border border-slate-800 space-y-3">
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

          {/* Entity Profile */}
          <div className="fintech-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Customer Entity Demographics (Synthetic Mock)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">NAME</span>
                <span className="text-slate-200">{txn.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">CUSTOMER ID</span>
                <span className="text-slate-200">{txn.customerId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">EMAIL (RESERVED)</span>
                <span className="text-slate-200">{txn.customerEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PHONE PATTERN</span>
                <span className="text-slate-200">{txn.customerPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">MERCHANT TARGET</span>
                <span className="text-slate-200">{txn.merchant}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">CATEGORY</span>
                <span className="text-slate-200">{txn.merchantCategory}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Device & Geo */}
        <div className="space-y-6">
          {/* Geo Vector */}
          <div className="fintech-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Geographic Telemetry</span>
            </h4>
            <GeoThreatMap location={txn.location} />
            <div className="space-y-2 text-xs font-mono text-slate-300 pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">IP Address:</span>
                <span>{txn.location.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Detected City:</span>
                <span>
                  {txn.location.city}, {txn.location.country}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tor / Proxy:</span>
                <span className={txn.location.isVpnOrProxy ? "text-rose-400 font-bold" : "text-emerald-400"}>
                  {txn.location.isVpnOrProxy ? "YES (MASKED)" : "NO"}
                </span>
              </div>
            </div>
          </div>

          {/* Device Telemetry */}
          <div className="fintech-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>Device Fingerprint</span>
            </h4>
            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Hardware OS:</span>
                <span>{txn.device.os}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Browser:</span>
                <span>{txn.device.browser}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Display Res:</span>
                <span>{txn.device.screenResolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Provision Status:</span>
                <span className={txn.device.isNewDevice ? "text-amber-400" : "text-slate-400"}>
                  {txn.device.isNewDevice ? "FIRST-TIME SEEN" : "ESTABLISHED"}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 text-[10px] block">FINGERPRINT HASH</span>
                <span className="text-[10px] text-indigo-300 break-all">{txn.device.fingerprintHash}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

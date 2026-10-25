"use client";

import React, { useState } from "react";
import { Transaction } from "@/types/fraud";
import { ShapWaterfallChart } from "@/components/ShapWaterfallChart";
import { GeoThreatMap } from "@/components/GeoThreatMap";
import {
  X,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Smartphone,
  MapPin,
  Clock,
  Lock,
  CreditCard,
  User,
  Check,
  FileText,
  Save,
  Activity,
  Layers,
  Globe2,
  TrendingUp,
} from "lucide-react";

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onUpdateStatus: (txnId: string, newAction: Transaction["decision"]) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  onClose,
  onUpdateStatus,
}) => {
  const [modalTab, setModalTab] = useState<"summary" | "explainability" | "geo" | "audit">("summary");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [analystNote, setAnalystNote] = useState<string>("");
  const [savedNotes, setSavedNotes] = useState<string[]>([
    "Real-time evaluation completed by FastAPI XGBoost engine in 34ms.",
  ]);

  if (!transaction) return null;

  const isHigh = transaction.riskLevel === "HIGH";
  const isMedium = transaction.riskLevel === "MEDIUM";

  const handleSaveNote = () => {
    if (!analystNote.trim()) return;
    const now = new Date().toLocaleTimeString("en-IN", { hour12: false });
    setSavedNotes((prev) => [...prev, `[${now}] ${analystNote.trim()}`]);
    setAnalystNote("");
    setToastMessage("Note added to investigation history");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAction = (action: Transaction["decision"], label: string) => {
    onUpdateStatus(transaction.id, action);
    const now = new Date().toLocaleTimeString("en-IN", { hour12: false });
    setSavedNotes((prev) => [...prev, `[${now}] Status updated by analyst: ${label}`]);
    setToastMessage(`Decision saved: ${label}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-[#222226] bg-[#0d0d10] shadow-2xl z-10 my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1c1c20] px-6 py-4 bg-[#08080a] gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                isHigh
                  ? "bg-rose-500/10 border-rose-500/25 text-rose-400"
                  : isMedium
                  ? "bg-amber-500/10 border-amber-500/25 text-amber-400"
                  : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
              }`}
            >
              {isHigh ? (
                <ShieldAlert className="h-6 w-6" />
              ) : isMedium ? (
                <KeyRound className="h-6 w-6" />
              ) : (
                <ShieldCheck className="h-6 w-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-white font-mono">{transaction.id}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                    isHigh
                      ? "bg-rose-500/10 text-rose-300 border-rose-500/25"
                      : isMedium
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/25"
                      : "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                  }`}
                >
                  {transaction.decision === "BLOCKED" ? "Blocked (High Risk)" : transaction.decision === "OTP_REQUIRED" ? "2FA Review Required" : "Approved (Low Risk)"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Customer: <span className="text-zinc-200 font-medium">{transaction.customerName}</span> ({transaction.customerEmail})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white font-mono">
                ₹{transaction.amount.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-zinc-400">{transaction.timestamp}</div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-zinc-400 hover:bg-[#18181c] hover:text-white hover:scale-110 active:scale-95 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[#1c1c20] bg-[#08080a] px-6 gap-2 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setModalTab("summary")}
            className={`flex items-center gap-1.5 py-3 border-b-2 px-3 transition-colors ${
              modalTab === "summary"
                ? "border-zinc-200 text-white font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Activity className="h-4 w-4 text-zinc-300" />
            <span>Summary & Verdict</span>
          </button>
          <button
            onClick={() => setModalTab("explainability")}
            className={`flex items-center gap-1.5 py-3 border-b-2 px-3 transition-colors ${
              modalTab === "explainability"
                ? "border-zinc-200 text-white font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <TrendingUp className="h-4 w-4 text-zinc-300" />
            <span>AI Feature Attribution (SHAP)</span>
          </button>
          <button
            onClick={() => setModalTab("geo")}
            className={`flex items-center gap-1.5 py-3 border-b-2 px-3 transition-colors ${
              modalTab === "geo"
                ? "border-zinc-200 text-white font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Globe2 className="h-4 w-4 text-emerald-400" />
            <span>Travel Hop & Device</span>
          </button>
          <button
            onClick={() => setModalTab("audit")}
            className={`flex items-center gap-1.5 py-3 border-b-2 px-3 transition-colors ${
              modalTab === "audit"
                ? "border-zinc-200 text-white font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileText className="h-4 w-4 text-amber-400" />
            <span>Audit Trail & Notes</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Notification Toast */}
          {toastMessage && (
            <div className="rounded-xl border border-emerald-700/60 bg-emerald-950/80 px-4 py-2.5 text-xs font-semibold text-emerald-200 flex items-center gap-2 shadow-lg animate-fade-in">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* TAB 1: SUMMARY & VERDICT */}
          {modalTab === "summary" && (
            <div className="space-y-6">
              {/* Top 3 Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score */}
                <div className="rounded-2xl border border-[#222226] bg-[#121215] p-4.5 flex flex-col justify-between">
                  <div className="text-xs font-medium text-zinc-400">AI Risk Assessment</div>
                  <div className="my-3 flex items-baseline gap-2">
                    <span
                      className={`text-4xl font-bold font-mono ${
                        isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {transaction.riskScore}
                    </span>
                    <span className="text-sm font-medium text-zinc-500">/ 100</span>
                  </div>
                  <div>
                    <div className="w-full bg-[#242429] h-2 rounded-full overflow-hidden mb-1.5">
                      <div
                        className={`h-full ${isHigh ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${transaction.riskScore}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {isHigh ? "High Risk: Score > 70" : isMedium ? "Medium: Score 35-70" : "Low: Score < 35"}
                    </div>
                  </div>
                </div>

                {/* Policy Action */}
                <div className="rounded-2xl border border-[#222226] bg-[#121215] p-4.5 flex flex-col justify-between">
                  <div className="text-xs font-medium text-zinc-400">Automated Defense Policy</div>
                  <div className="my-2">
                    <div
                      className={`text-base font-bold ${
                        isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {transaction.decision === "BLOCKED" ? "Automatic Block" : transaction.decision === "OTP_REQUIRED" ? "3DS Step-Up Challenge" : "Frictionless Pass"}
                    </div>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      {isHigh
                        ? "Intercepted immediately. Card was not charged to protect the account balance."
                        : isMedium
                        ? "Triggered SMS OTP challenge to confirm the legitimate cardholder is present."
                        : "Approved seamlessly with 0 customer friction in 32 milliseconds."}
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-300 bg-[#18181c] border border-[#27272a] rounded-lg px-2.5 py-1">
                    Behavior Anomaly: {(transaction.anomalyScore * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Charge Info */}
                <div className="rounded-2xl border border-[#222226] bg-[#121215] p-4.5 flex flex-col justify-between">
                  <div className="text-xs font-medium text-zinc-400">Payment Breakdown</div>
                  <div className="my-2">
                    <div className="text-2xl font-bold font-mono text-white">
                      ₹{transaction.amount.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-zinc-300 mt-1">
                      Merchant: <span className="font-semibold text-white">{transaction.merchant}</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Category: {transaction.merchantCategory}
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-400 border-t border-[#222226] pt-2 flex justify-between">
                    <span>Recent Velocity:</span>
                    <span className="font-mono text-zinc-200">{transaction.velocity.lastHourCount} tx in last hour</span>
                  </div>
                </div>
              </div>

              {/* Key Reasons Why Flagged */}
              <div className="rounded-2xl border border-[#222226] bg-[#121215] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#222226] pb-3">
                  <h4 className="text-sm font-semibold text-white">Primary Risk Factors for This Decision</h4>
                  <span className="text-xs text-zinc-500">Decomposed by TreeSHAP</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {transaction.shapExplanation.map((item, idx) => {
                    const isIncrease = item.direction === "increase";
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-[#27272a] bg-[#18181c] hover:border-zinc-600 hover:bg-[#1c1c22] hover:-translate-y-0.5 transition-all duration-200 p-3 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="font-semibold text-xs text-zinc-200">{item.feature}</div>
                          <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{item.description}</div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-1">Input: {item.rawValue}</div>
                        </div>
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            isIncrease
                              ? "text-rose-300 bg-rose-950/80 border border-rose-800/50"
                              : "text-emerald-300 bg-emerald-950/80 border border-emerald-800/50"
                          }`}
                        >
                          {isIncrease ? `+${item.contribution}` : item.contribution} pts
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI FEATURE ATTRIBUTION (SHAP) */}
          {modalTab === "explainability" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#222226] bg-[#121215] p-4 text-xs text-zinc-300 leading-relaxed">
                <p>
                  <strong className="text-white">TreeSHAP Explainability:</strong> Every machine learning score starts at a baseline population average (14 points). Each transaction attribute either adds risk or subtracts risk. Below is the exact additive mathematical waterfall that produced the final score of <strong className="text-white">{transaction.riskScore}/100</strong>.
                </p>
              </div>

              <ShapWaterfallChart
                shapValues={transaction.shapExplanation}
                baseScore={14}
                finalScore={transaction.riskScore}
              />
            </div>
          )}

          {/* TAB 3: GEOSPATIAL & DEVICE */}
          {modalTab === "geo" && (
            <div className="space-y-6">
              <GeoThreatMap
                location={transaction.location}
                homeCity="Mumbai"
                homeCountry="India"
              />

              {/* Hardware & Network Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#222226] bg-[#121215] p-4.5 space-y-3">
                  <div className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-zinc-400" />
                    <span>Client Device Telemetry</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-[#222226] pb-2">
                      <span className="text-zinc-400">Browser</span>
                      <span className="text-zinc-200 font-mono">{transaction.device.browser}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#222226] pb-2">
                      <span className="text-zinc-400">Operating System</span>
                      <span className="text-zinc-200 font-mono">{transaction.device.os}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#222226] pb-2">
                      <span className="text-zinc-400">Fingerprint Hash</span>
                      <span className="text-zinc-300 font-mono">{transaction.device.fingerprintHash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Device Status</span>
                      <span className={transaction.device.isNewDevice ? "text-amber-400 font-semibold" : "text-emerald-400 font-semibold"}>
                        {transaction.device.isNewDevice ? "Unrecognized Client" : "Verified Trusted Device"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#222226] bg-[#121215] p-4.5 space-y-3">
                  <div className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-zinc-400" />
                    <span>Network & Origin Data</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-[#222226] pb-2">
                      <span className="text-zinc-400">Observed City / Country</span>
                      <span className="text-zinc-200 font-medium">{transaction.location.city}, {transaction.location.country}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#222226] pb-2">
                      <span className="text-zinc-400">IP Address</span>
                      <span className="text-zinc-300 font-mono">{transaction.location.ipAddress}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#222226] pb-2">
                      <span className="text-zinc-400">Proxy / VPN Detection</span>
                      <span className={transaction.location.isVpnOrProxy ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>
                        {transaction.location.isVpnOrProxy ? "Detected (Anonymous Proxy)" : "Clean Domestic ISP"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Distance from Billing Home</span>
                      <span className="text-zinc-200 font-mono">{transaction.location.distanceFromHomeKm.toLocaleString()} km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL & NOTES */}
          {modalTab === "audit" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#222226] bg-[#121215] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#222226] pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                    <FileText className="h-4 w-4 text-amber-400" />
                    <span>Investigation Log & Audit History</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">Immutable Audit Ledger</span>
                </div>

                <div className="space-y-2">
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {savedNotes.map((note, idx) => (
                      <div key={idx} className="rounded-xl bg-[#18181c] border border-[#27272a] px-3.5 py-2 text-xs text-zinc-300 font-mono flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-zinc-400 flex-shrink-0" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add investigation observation (e.g. Cardholder confirmed overseas trip)..."
                      value={analystNote}
                      onChange={(e) => setAnalystNote(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveNote()}
                      className="flex-1 rounded-xl border border-[#27272a] bg-[#0e0e11] px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                    />
                    <button
                      onClick={handleSaveNote}
                      className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-900 hover:bg-white transition-colors shadow-sm"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between border-t border-[#1c1c20] bg-[#08080a] px-6 py-4 gap-3">
          <div className="text-xs text-zinc-400 flex items-center gap-2">
            <Lock className="h-4 w-4 text-zinc-400" />
            <span>Analyst Override Action:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleAction("APPROVED", "Allowed")}
              className="rounded-xl border border-[#27272a] bg-[#18181c] px-3.5 py-2 text-xs font-medium text-zinc-200 hover:bg-emerald-950/40 hover:border-emerald-500/50 hover:text-emerald-200 hover:scale-[1.03] active:scale-95 transition-all shadow-sm"
            >
              Approve Transaction
            </button>
            <button
              onClick={() => handleAction("OTP_REQUIRED", "3DS OTP Requested")}
              className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2 text-xs font-medium text-amber-300 hover:bg-amber-950/40 hover:border-amber-500/50 hover:text-amber-200 hover:scale-[1.03] active:scale-95 transition-all shadow-sm"
            >
              Request 3DS OTP
            </button>
            <button
              onClick={() => handleAction("BLOCKED", "Fraud Block Confirmed")}
              className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-300 hover:bg-rose-950/40 hover:border-rose-500/50 hover:text-rose-200 hover:scale-[1.03] active:scale-95 transition-all shadow-sm"
            >
              Confirm Fraud Block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

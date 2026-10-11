"use client";

import React, { useState, useMemo } from "react";
import { SimulationParams, Transaction } from "@/types/fraud";
import { calculateRisk } from "@/lib/scoringEngine";
import {
  Zap,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  Sparkles,
  Send,
  RotateCcw,
  Cpu,
  Info,
} from "lucide-react";

interface RiskSimulatorProps {
  onInjectTransaction: (txn: Transaction) => void;
}

export const RiskSimulator: React.FC<RiskSimulatorProps> = ({ onInjectTransaction }) => {
  const [amount, setAmount] = useState<number>(85000);
  const [avgUserAmount, setAvgUserAmount] = useState<number>(6000);
  const [isNewDevice, setIsNewDevice] = useState<boolean>(true);
  const [velocityLast2Min, setVelocityLast2Min] = useState<number>(3);
  const [isVpnOrProxy, setIsVpnOrProxy] = useState<boolean>(true);
  const [distanceJumpKm, setDistanceJumpKm] = useState<number>(7200);
  const [merchantCategory, setMerchantCategory] = useState<string>("Electronics");
  const [merchantName, setMerchantName] = useState<string>("Apple Store Online");

  // Real-time calculation using ML scoring engine
  const result = useMemo(() => {
    return calculateRisk({
      amount,
      currency: "INR",
      merchantCategory,
      isNewDevice,
      velocityLast2Min,
      isVpnOrProxy,
      distanceJumpKm,
      avgUserAmount,
    });
  }, [amount, avgUserAmount, isNewDevice, velocityLast2Min, isVpnOrProxy, distanceJumpKm, merchantCategory]);

  const isHigh = result.riskLevel === "HIGH";
  const isMedium = result.riskLevel === "MEDIUM";

  // Quick Preset Handlers
  const applyAbstractFraudPreset = () => {
    setAmount(85000);
    setAvgUserAmount(6000);
    setIsNewDevice(true);
    setVelocityLast2Min(3);
    setIsVpnOrProxy(true);
    setDistanceJumpKm(7200);
    setMerchantCategory("Electronics");
    setMerchantName("Apple Store Online");
  };

  const applyLegitimatePreset = () => {
    setAmount(1850);
    setAvgUserAmount(4500);
    setIsNewDevice(false);
    setVelocityLast2Min(1);
    setIsVpnOrProxy(false);
    setDistanceJumpKm(12);
    setMerchantCategory("Grocery");
    setMerchantName("Blinkit Supermarket");
  };

  const applyMediumOtpPreset = () => {
    setAmount(32000);
    setAvgUserAmount(9000);
    setIsNewDevice(true);
    setVelocityLast2Min(1);
    setIsVpnOrProxy(false);
    setDistanceJumpKm(25);
    setMerchantCategory("Jewelry");
    setMerchantName("Tanishq Jewellers");
  };

  const handleInject = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const newTxn: Transaction = {
      id: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: timeString,
      customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: "Interactive Simulator User",
      amount,
      currency: "INR",
      merchant: merchantName,
      merchantCategory: merchantCategory as any,
      device: {
        browser: isNewDevice ? "Firefox v122 (Unseen Token)" : "Chrome v122 (Trusted)",
        os: isNewDevice ? "Linux" : "Windows 11",
        fingerprintHash: `fp_${Math.random().toString(36).substring(2, 9)}`,
        isNewDevice,
        screenResolution: "1920x1080",
      },
      location: {
        city: distanceJumpKm > 2000 ? "Lagos" : "Mumbai",
        country: distanceJumpKm > 2000 ? "Nigeria" : "India",
        ipAddress: isVpnOrProxy ? "185.220.101.5" : "103.21.125.10",
        isVpnOrProxy,
        distanceFromHomeKm: distanceJumpKm,
      },
      velocity: {
        last2MinutesCount: velocityLast2Min,
        lastHourCount: velocityLast2Min + 1,
        totalSpentToday: amount + 12000,
      },
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      decision: result.decision,
      status: "PROCESSED",
      shapExplanation: result.shapExplanation,
      anomalyScore: result.anomalyScore,
      ruleFlags: result.ruleFlags,
    };

    onInjectTransaction(newTxn);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            Interactive Risk Engine Simulator
          </h2>
          <p className="text-xs text-slate-400">
            Dynamically adjust transaction-level signals (Amount, Device, Velocity, Geolocation) and observe real-time XGBoost inference and SHAP attribution.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Presets:</span>
          <button
            onClick={applyAbstractFraudPreset}
            className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-2.5 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-900/60 transition-colors"
          >
            ₹85K Abstract Attack
          </button>
          <button
            onClick={applyMediumOtpPreset}
            className="rounded-lg border border-amber-500/40 bg-amber-950/40 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-900/60 transition-colors"
          >
            Medium OTP Case
          </button>
          <button
            onClick={applyLegitimatePreset}
            className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition-colors"
          >
            Genuine Grocery
          </button>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Live Inference on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4 rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <span>Input Transaction Signals</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Live Feedback</span>
          </div>

          {/* Amount Slider and Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">Transaction Amount (₹)</label>
              <div className="font-mono text-base font-bold text-white bg-slate-950 px-3 py-1 rounded border border-slate-700">
                ₹{amount.toLocaleString("en-IN")}
              </div>
            </div>
            <input
              type="range"
              min={500}
              max={150000}
              step={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹500</span>
              <span>₹50,000</span>
              <span>₹85,000 (Abstract Case)</span>
              <span>₹1,50,000</span>
            </div>
          </div>

          {/* User Baseline Comparison */}
          <div className="space-y-2 border-t border-slate-800/80 pt-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">
                Cardholder Historical Average (₹)
              </label>
              <span className="font-mono text-xs font-semibold text-slate-300">
                ₹{avgUserAmount.toLocaleString("en-IN")} (Ratio: {(amount / avgUserAmount).toFixed(1)}x)
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={30000}
              step={1000}
              value={avgUserAmount}
              onChange={(e) => setAvgUserAmount(Number(e.target.value))}
              className="w-full accent-slate-600 cursor-pointer"
            />
          </div>

          {/* Velocity Control (Abstract: 3 transactions in 2 minutes) */}
          <div className="space-y-2 border-t border-slate-800/80 pt-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300">
                Velocity (Transactions in last 2 minutes)
              </label>
              <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded">
                {velocityLast2Min} tx / 2 min
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={velocityLast2Min}
              onChange={(e) => setVelocityLast2Min(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="text-[11px] text-slate-400">
              {velocityLast2Min >= 3
                ? "⚠️ Rapid burst detected: Multiple attempts in under 120 seconds indicate bot or script attack."
                : "Standard single payment pacing."}
            </div>
          </div>

          {/* Device & Location Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800/80 pt-3">
            {/* Device Familiarity */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Device Fingerprint</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewDevice(false)}
                  className={`flex-1 rounded py-1.5 text-xs font-medium transition-colors ${
                    !isNewDevice
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-700/60"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  Known Device
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewDevice(true)}
                  className={`flex-1 rounded py-1.5 text-xs font-medium transition-colors ${
                    isNewDevice
                      ? "bg-rose-950 text-rose-300 border border-rose-700/60"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  New Device
                </button>
              </div>
            </div>

            {/* VPN / Datacenter Proxy */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Network Origin</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsVpnOrProxy(false)}
                  className={`flex-1 rounded py-1.5 text-xs font-medium transition-colors ${
                    !isVpnOrProxy
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-700/60"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  Clean ISP
                </button>
                <button
                  type="button"
                  onClick={() => setIsVpnOrProxy(true)}
                  className={`flex-1 rounded py-1.5 text-xs font-medium transition-colors ${
                    isVpnOrProxy
                      ? "bg-rose-950 text-rose-300 border border-rose-700/60"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  VPN / Proxy
                </button>
              </div>
            </div>
          </div>

          {/* Distance Jump & Merchant Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800/80 pt-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Distance Jump</label>
              <select
                value={distanceJumpKm}
                onChange={(e) => setDistanceJumpKm(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={15}>Domestic (&lt; 20 km)</option>
                <option value={150}>Inter-city (150 km)</option>
                <option value={4800}>Cross-Border (Moscow, 4,800 km)</option>
                <option value={7200}>Impossible Travel (Lagos, 7,200 km)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Merchant Category</label>
              <select
                value={merchantCategory}
                onChange={(e) => {
                  setMerchantCategory(e.target.value);
                  if (e.target.value === "Electronics") setMerchantName("Apple Store Online");
                  if (e.target.value === "Crypto") setMerchantName("Binance P2P Exchange");
                  if (e.target.value === "Jewelry") setMerchantName("Tanishq Jewellers");
                  if (e.target.value === "Grocery") setMerchantName("Blinkit Grocery");
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Electronics">Electronics (High Resale)</option>
                <option value="Crypto">Crypto (Irreversible P2P)</option>
                <option value="Jewelry">Jewelry & Gold</option>
                <option value="Travel">Travel & Airlines</option>
                <option value="Grocery">Grocery & Food</option>
                <option value="Utilities">Utilities & Bills</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live ML Inference & SHAP Breakdown Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Risk Gauge & Decision Result */}
          <div
            className={`rounded-xl border p-5 shadow-2xl transition-all ${
              isHigh
                ? "bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 border-rose-500/50 glow-rose"
                : isMedium
                ? "bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border-amber-500/50 glow-amber"
                : "bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/50 glow-emerald"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Instant ML Inference
              </span>
              <span className="text-[11px] font-mono text-cyan-400">Latency: 34ms</span>
            </div>

            <div className="my-4 flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-5xl font-extrabold font-mono ${
                      isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {result.riskScore}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ 100</span>
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-1">
                  Tier:{" "}
                  <span
                    className={
                      isHigh ? "text-rose-400 font-bold" : isMedium ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"
                    }
                  >
                    {result.riskLevel} RISK
                  </span>
                </div>
              </div>

              {/* Action Badge */}
              <div className="text-right">
                {result.decision === "BLOCKED" && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/80 p-3 text-rose-300">
                    <ShieldAlert className="h-6 w-6 text-rose-400 mx-auto mb-1" />
                    <span className="font-bold text-xs">BLOCKED</span>
                  </div>
                )}
                {result.decision === "OTP_REQUIRED" && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-950/80 p-3 text-amber-300">
                    <KeyRound className="h-6 w-6 text-amber-400 mx-auto mb-1" />
                    <span className="font-bold text-xs">OTP REQUIRED</span>
                  </div>
                )}
                {result.decision === "APPROVED" && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/80 p-3 text-emerald-300">
                    <ShieldCheck className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
                    <span className="font-bold text-xs">APPROVED</span>
                  </div>
                )}
              </div>
            </div>

            {/* Score progress bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-300 ${
                  isHigh ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${result.riskScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0 (Approve)</span>
              <span>35 (OTP Threshold)</span>
              <span>70 (Block Cutoff)</span>
              <span>100</span>
            </div>

            {/* Injection Action Button */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <button
                onClick={handleInject}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-blue-500 active:scale-95 transition-all"
              >
                <Send className="h-4 w-4" />
                Inject This Transaction into Live Stream
              </button>
            </div>
          </div>

          {/* Live SHAP Explanation Waterfall */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Cpu className="h-4 w-4 text-indigo-400" />
                <span>Computed SHAP Factor Attribution</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">TreeSHAP</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {result.shapExplanation.map((item, idx) => {
                const isInc = item.direction === "increase";
                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-800/60 bg-slate-950/60 p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200 text-[11px] truncate max-w-[200px]">
                        {item.feature}
                      </span>
                      <span
                        className={`font-mono font-bold text-[11px] px-1.5 py-0.2 rounded ${
                          isInc
                            ? "bg-rose-950 text-rose-400 border border-rose-800/40"
                            : "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                        }`}
                      >
                        {isInc ? `+${item.contribution}` : item.contribution} pts
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full ${isInc ? "bg-rose-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(100, Math.abs(item.contribution) * 2.8)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{item.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

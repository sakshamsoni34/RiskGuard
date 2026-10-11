"use client";

import React, { useState, useMemo } from "react";
import { Transaction } from "@/types/fraud";
import { calculateRisk } from "@/lib/scoringEngine";
import {
  Sliders,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  RotateCcw,
  Smartphone,
  Globe2,
  Check,
  Flame,
  Zap,
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
  const [injectedNotice, setInjectedNotice] = useState<boolean>(false);

  // Compute live score using the exact ML engine logic
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

  // Preset Handlers
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

  const applyAtoCryptoPreset = () => {
    setAmount(145000);
    setAvgUserAmount(12000);
    setIsNewDevice(true);
    setVelocityLast2Min(4);
    setIsVpnOrProxy(true);
    setDistanceJumpKm(5400);
    setMerchantCategory("Crypto");
    setMerchantName("Binance P2P Exchange");
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

  const handleInject = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-IN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const newTxn: Transaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: timeString,
      customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: "Saksham Soni (Test Payment)",
      customerEmail: "saksham.soni@example.com",
      customerPhone: "+91 98201 00921",
      amount,
      currency: "INR",
      merchant: merchantName,
      merchantCategory: merchantCategory as any,
      paymentMethod: {
        type: "card",
        brand: "Visa",
        last4: "4242",
      },
      device: {
        browser: isNewDevice ? "Firefox 122 (Unseen Hardware)" : "Chrome 122 (Verified Client)",
        os: isNewDevice ? "Linux x86_64" : "Windows 11 x64",
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
    setInjectedNotice(true);
    setTimeout(() => setInjectedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header and Preset Scenarios */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Rule Testing Sandbox</h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Simulate incoming transaction attributes and observe how model rules, velocity checks, and risk thresholds evaluate in real-time.
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Scenarios:</span>
          <button
            onClick={applyAbstractFraudPreset}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Velocity burst (₹85k)
          </button>
          <button
            onClick={applyAtoCryptoPreset}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Crypto ATO (₹1.45L)
          </button>
          <button
            onClick={applyMediumOtpPreset}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Discretionary spend (₹32k)
          </button>
          <button
            onClick={applyLegitimatePreset}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Everyday grocery (₹1.85k)
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parameters Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4 rounded-xl border border-slate-800 bg-[#0d1424] p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold text-slate-300">Transaction Parameters</span>
            <span className="text-xs font-mono text-slate-500">FastAPI Model Evaluation</span>
          </div>

          {/* Amount Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-slate-300">Transaction Amount (₹)</label>
              <div className="font-mono text-base font-semibold text-white bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
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
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>₹500</span>
              <span>₹50,000</span>
              <span>₹85,000</span>
              <span>₹1,50,000</span>
            </div>
          </div>

          {/* User Baseline */}
          <div className="space-y-2 border-t border-slate-800/80 pt-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-slate-300">Cardholder Average Transaction (₹)</label>
              <span className="font-mono text-xs text-slate-300">
                ₹{avgUserAmount.toLocaleString("en-IN")}{" "}
                <span className="text-slate-500">({(amount / avgUserAmount).toFixed(1)}x ratio)</span>
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={30000}
              step={1000}
              value={avgUserAmount}
              onChange={(e) => setAvgUserAmount(Number(e.target.value))}
              className="w-full accent-slate-600 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
          </div>

          {/* Velocity */}
          <div className="space-y-2 border-t border-slate-800/80 pt-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-slate-300">Card Attempts in Last 2 Minutes</label>
              <span className="font-mono text-xs font-semibold text-white bg-slate-800 px-2 py-0.5 rounded">
                {velocityLast2Min} attempts
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={velocityLast2Min}
              onChange={(e) => setVelocityLast2Min(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
            <p className="text-[11px] text-slate-400">
              {velocityLast2Min >= 3
                ? "Multiple authorizations within 120 seconds heavily penalizes the velocity feature score."
                : "Normal authorization cadence."}
            </p>
          </div>

          {/* Device & Proxy Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800/80 pt-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
              <span className="text-xs font-medium text-slate-300 block">Device Fingerprint</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewDevice(false)}
                  className={`flex-1 rounded py-1.5 text-xs font-medium transition-colors ${
                    !isNewDevice ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Known Device
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewDevice(true)}
                  className={`flex-1 rounded py-1.5 text-xs font-medium transition-colors ${
                    isNewDevice ? "bg-rose-950 text-rose-300 border border-rose-800/50" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Unrecognized
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
              <span className="text-xs font-medium text-slate-300 block">Network Origin</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsVpnOrProxy(false)}
                  className={`flex-1 rounded py-1.5 text-xs font-medium transition-colors ${
                    !isVpnOrProxy ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Residential ISP
                </button>
                <button
                  type="button"
                  onClick={() => setIsVpnOrProxy(true)}
                  className={`flex-1 rounded py-1.5 text-xs font-medium transition-colors ${
                    isVpnOrProxy ? "bg-rose-950 text-rose-300 border border-rose-800/50" : "text-slate-400 hover:text-white"
                  }`}
                >
                  VPN / Proxy
                </button>
              </div>
            </div>
          </div>

          {/* Travel & Merchant Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800/80 pt-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Distance from Billing Address</label>
              <select
                value={distanceJumpKm}
                onChange={(e) => setDistanceJumpKm(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={15}>Local (&lt; 20 km)</option>
                <option value={150}>Domestic Travel (150 km)</option>
                <option value={4800}>Cross-Border (Moscow, 4,800 km)</option>
                <option value={7200}>Impossible Travel (Lagos, 7,200 km)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Merchant Category</label>
              <select
                value={merchantCategory}
                onChange={(e) => {
                  setMerchantCategory(e.target.value);
                  if (e.target.value === "Electronics") setMerchantName("Apple Store Online");
                  if (e.target.value === "Crypto") setMerchantName("Binance P2P Exchange");
                  if (e.target.value === "Jewelry") setMerchantName("Tanishq Jewellers");
                  if (e.target.value === "Grocery") setMerchantName("Blinkit Supermarket");
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Electronics">Electronics (High Resale)</option>
                <option value="Crypto">Crypto (Non-Reversible)</option>
                <option value="Jewelry">Jewelry & Gold</option>
                <option value="Travel">Travel & Airlines</option>
                <option value="Grocery">Grocery & Retail</option>
                <option value="Utilities">Utilities & Bills</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Output Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Result Card */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-300">Model Evaluation Output</span>
              <span className="text-[11px] font-mono text-slate-400">P95 Latency: 34ms</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Calculated Risk Score</div>
                <div className="text-4xl font-bold font-mono text-white mt-1">
                  {result.riskScore} <span className="text-sm font-normal text-slate-500">/ 100</span>
                </div>
                <div className="text-xs font-medium text-slate-300 mt-1">
                  Tier: <span className={isHigh ? "text-rose-400 font-semibold" : isMedium ? "text-amber-400 font-semibold" : "text-emerald-400 font-semibold"}>{result.riskLevel} Risk</span>
                </div>
              </div>

              <div>
                {result.decision === "BLOCKED" && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-800/50 bg-rose-950/80 px-3 py-1.5 text-xs font-semibold text-rose-300">
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                    Blocked
                  </span>
                )}
                {result.decision === "OTP_REQUIRED" && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-800/50 bg-amber-950/80 px-3 py-1.5 text-xs font-semibold text-amber-300">
                    <KeyRound className="h-4 w-4 text-amber-400" />
                    Require 3DS
                  </span>
                )}
                {result.decision === "APPROVED" && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-800/50 bg-emerald-950/80 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Allowed
                  </span>
                )}
              </div>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${isHigh ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${result.riskScore}%` }}
              />
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={handleInject}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
              >
                <Send className="h-4 w-4" />
                Inject into Live Stream
              </button>
              {injectedNotice && (
                <div className="mt-2 text-center text-xs font-medium text-emerald-400 flex items-center justify-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Transaction added to live queue
                </div>
              )}
            </div>
          </div>

          {/* Factor Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-semibold text-slate-300">
              <span>Key Decision Factors</span>
              <span className="text-[11px] font-mono text-slate-500">TreeSHAP</span>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {result.shapExplanation.map((item, idx) => {
                const isInc = item.direction === "increase";
                return (
                  <div key={idx} className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">{item.feature}</span>
                      <span className={`font-mono text-xs font-semibold ${isInc ? "text-rose-400" : "text-emerald-400"}`}>
                        {isInc ? `+${item.contribution}` : item.contribution} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.description}</p>
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

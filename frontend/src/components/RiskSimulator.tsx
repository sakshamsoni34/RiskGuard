"use client";

import React, { useState, useMemo } from "react";
import { Transaction } from "@/types/fraud";
import { calculateRisk } from "@/lib/scoringEngine";
import { ShapWaterfallChart } from "@/components/ShapWaterfallChart";
import {
  Sliders,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Send,
  RotateCcw,
  Smartphone,
  Globe2,
  Check,
  Flame,
  Zap,
  Info,
  Layers,
  ArrowRight,
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
  const [activeScenario, setActiveScenario] = useState<string>("velocity");

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
    setActiveScenario("velocity");
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
    setActiveScenario("crypto");
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
    setActiveScenario("discretionary");
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
    setActiveScenario("legitimate");
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
      customerName: "Saksham Soni (Simulator)",
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
      {/* Overview & Quick Scenario Cards */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c1220]/90 p-5 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">
            Interactive Rule Testing Sandbox
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Test how the AI model evaluates different transaction scenarios in real time. Click a preset scenario below or adjust the sliders to watch how risk rules calculate scores.
          </p>
        </div>

        {/* 4 Clickable Scenarios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Scenario 1 */}
          <div
            onClick={applyAbstractFraudPreset}
            className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
              activeScenario === "velocity"
                ? "border-rose-500/70 bg-rose-950/30 ring-1 ring-rose-500/30"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-semibold text-slate-200">Velocity Attack</span>
            </div>
            <div className="mt-2 text-sm font-bold font-mono text-white">₹85,000</div>
            <p className="text-[11px] text-slate-400 mt-1">3 attempts in 2 min + Lagos IP</p>
            <span className="inline-block mt-2 text-[10px] font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
              Expected: Auto-Blocked
            </span>
          </div>

          {/* Scenario 2 */}
          <div
            onClick={applyAtoCryptoPreset}
            className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
              activeScenario === "crypto"
                ? "border-rose-500/70 bg-rose-950/30 ring-1 ring-rose-500/30"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-semibold text-slate-200">Crypto Account Drain</span>
            </div>
            <div className="mt-2 text-sm font-bold font-mono text-white">₹1,45,000</div>
            <p className="text-[11px] text-slate-400 mt-1">Brand new device + VPN Proxy</p>
            <span className="inline-block mt-2 text-[10px] font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
              Expected: Auto-Blocked
            </span>
          </div>

          {/* Scenario 3 */}
          <div
            onClick={applyMediumOtpPreset}
            className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
              activeScenario === "discretionary"
                ? "border-amber-500/70 bg-amber-950/30 ring-1 ring-amber-500/30"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">Unusual High Spend</span>
            </div>
            <div className="mt-2 text-sm font-bold font-mono text-white">₹32,000</div>
            <p className="text-[11px] text-slate-400 mt-1">Jewelry store on new browser</p>
            <span className="inline-block mt-2 text-[10px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              Expected: 2FA OTP Challenge
            </span>
          </div>

          {/* Scenario 4 */}
          <div
            onClick={applyLegitimatePreset}
            className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
              activeScenario === "legitimate"
                ? "border-emerald-500/70 bg-emerald-950/30 ring-1 ring-emerald-500/30"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">Normal Grocery</span>
            </div>
            <div className="mt-2 text-sm font-bold font-mono text-white">₹1,850</div>
            <p className="text-[11px] text-slate-400 mt-1">Known laptop + domestic home ISP</p>
            <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              Expected: Instant Approval
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Parameters Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4 rounded-2xl border border-slate-800 bg-[#0c1220]/90 p-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Configure Transaction</span>
            <span className="text-xs font-mono text-slate-400">FastAPI Model Scoring</span>
          </div>

          {/* Amount Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-200">Transaction Amount</label>
              <div className="font-mono text-base font-bold text-white bg-slate-900 px-3 py-1 rounded-xl border border-slate-700/80">
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
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>₹500 (micro)</span>
              <span>₹50,000</span>
              <span>₹1,50,000 (high ticket)</span>
            </div>
          </div>

          {/* Velocity Attempts */}
          <div className="space-y-2 border-t border-slate-800/80 pt-3.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-200">Card Attempts in Last 2 Minutes</label>
              <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg">
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
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <p className="text-[11px] text-slate-400">
              {velocityLast2Min >= 3
                ? "Multiple authorizations within 120 seconds heavily penalizes the velocity feature score."
                : "Normal single transaction."}
            </p>
          </div>

          {/* Device & Network Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800/80 pt-3.5">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Device Fingerprint</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewDevice(false)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    !isNewDevice ? "bg-slate-800 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Known Device
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewDevice(true)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    isNewDevice ? "bg-rose-950 text-rose-300 border border-rose-800/50 shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Unrecognized
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Network Connection</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsVpnOrProxy(false)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    !isVpnOrProxy ? "bg-slate-800 text-white border border-slate-700 shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Residential ISP
                </button>
                <button
                  type="button"
                  onClick={() => setIsVpnOrProxy(true)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                    isVpnOrProxy ? "bg-rose-950 text-rose-300 border border-rose-800/50 shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  VPN / Proxy
                </button>
              </div>
            </div>
          </div>

          {/* Distance & Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800/80 pt-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Distance from Customer Home</label>
              <select
                value={distanceJumpKm}
                onChange={(e) => setDistanceJumpKm(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={15}>Local (&lt; 20 km) - Normal</option>
                <option value={150}>Domestic Travel (150 km)</option>
                <option value={4800}>Cross-Border Jump (Moscow, 4,800 km)</option>
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
                  if (e.target.value === "Grocery") setMerchantName("Blinkit Supermarket");
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Electronics">Electronics (High Resale Risk)</option>
                <option value="Crypto">Crypto (Non-Reversible)</option>
                <option value="Jewelry">Jewelry & Gold</option>
                <option value="Travel">Travel & Airlines</option>
                <option value="Grocery">Grocery & Retail</option>
              </select>
            </div>
          </div>
        </div>

        {/* Output Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Result Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c1220]/90 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">AI Evaluation Verdict</span>
              <span className="text-xs font-mono text-emerald-400">Response: 32ms</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Calculated Risk Score</div>
                <div className="text-4xl font-bold font-mono text-white mt-1">
                  {result.riskScore} <span className="text-sm font-normal text-slate-500">/ 100</span>
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-1">
                  Classification: <span className={isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400"}>{result.riskLevel} Risk</span>
                </div>
              </div>

              <div>
                {result.decision === "BLOCKED" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-800/60 bg-rose-950/80 px-3.5 py-1.5 text-xs font-bold text-rose-300">
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                    Auto-Blocked
                  </span>
                )}
                {result.decision === "OTP_REQUIRED" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-800/60 bg-amber-950/80 px-3.5 py-1.5 text-xs font-bold text-amber-300">
                    <KeyRound className="h-4 w-4 text-amber-400" />
                    Require 3DS OTP
                  </span>
                )}
                {result.decision === "APPROVED" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800/60 bg-emerald-950/80 px-3.5 py-1.5 text-xs font-bold text-emerald-300">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Auto-Approved
                  </span>
                )}
              </div>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isHigh ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${result.riskScore}%` }}
              />
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <button
                onClick={handleInject}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-950/40"
              >
                <Send className="h-4 w-4" />
                Inject this Test into Live Stream
              </button>
              {injectedNotice && (
                <div className="mt-2 text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5 animate-fade-in">
                  <Check className="h-4 w-4" />
                  Sent! Check the Live Monitor tab.
                </div>
              )}
            </div>
          </div>

          {/* TreeSHAP Waterfall Explanation */}
          <ShapWaterfallChart
            shapValues={result.shapExplanation}
            baseScore={14}
            finalScore={result.riskScore}
          />
        </div>
      </div>
    </div>
  );
};

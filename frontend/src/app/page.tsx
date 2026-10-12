"use client";

import React, { useState, useEffect } from "react";
import { Transaction, ModelMetrics, RiskLevel } from "@/types/fraud";
import { initialTransactions, initialMetrics } from "@/lib/mockData";
import { generateRandomTransaction } from "@/lib/scoringEngine";
import { Navbar, AttackVectorType } from "@/components/Navbar";
import { ThreatTicker } from "@/components/ThreatTicker";
import { StatsCards } from "@/components/StatsCards";
import { TransactionTable } from "@/components/TransactionTable";
import { InlineInspector } from "@/components/InlineInspector";
import { TransactionModal } from "@/components/TransactionModal";
import { RiskSimulator } from "@/components/RiskSimulator";
import { ModelAnalytics } from "@/components/ModelAnalytics";
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import { ShieldAlert, ShieldCheck, KeyRound, CheckCircle2, X, Info, Zap, ArrowRight, Sparkles } from "lucide-react";
import { soundEngine } from "@/lib/soundFx";

export default function RiskGuardDashboard() {
  const [activeTab, setActiveTab] = useState<"monitor" | "simulator" | "analytics" | "architecture">("monitor");
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [metrics, setMetrics] = useState<ModelMetrics>(initialMetrics);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<"normal" | "fast">("normal");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(initialTransactions[0]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [alertNotice, setAlertNotice] = useState<{ title: string; subtitle: string } | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [showGuideBanner, setShowGuideBanner] = useState<boolean>(true);

  // Ingestion stream simulation
  useEffect(() => {
    if (!isStreaming) return;

    const delay = streamSpeed === "fast" ? 1500 : 4500;
    const interval = setInterval(() => {
      const newTxn = generateRandomTransaction(false);
      addNewTransaction(newTxn);
    }, delay);

    return () => clearInterval(interval);
  }, [isStreaming, streamSpeed]);

  const addNewTransaction = (newTxn: Transaction) => {
    // Audio telemetry feedback
    if (newTxn.decision === "BLOCKED") {
      soundEngine.playAttackAlert();
    } else if (newTxn.decision === "OTP_REQUIRED") {
      soundEngine.playStepUpAlert();
    } else {
      soundEngine.playIngestBlip();
    }

    setTransactions((prev) => [newTxn, ...prev.slice(0, 49)]);

    setMetrics((prev) => {
      const isBlocked = newTxn.decision === "BLOCKED";
      const isOtp = newTxn.decision === "OTP_REQUIRED";
      const isApproved = newTxn.decision === "APPROVED";

      return {
        ...prev,
        totalProcessed: prev.totalProcessed + 1,
        fraudBlockedAmount: isBlocked ? prev.fraudBlockedAmount + newTxn.amount : prev.fraudBlockedAmount,
        fraudAttemptCount: isBlocked ? prev.fraudAttemptCount + 1 : prev.fraudAttemptCount,
        otpChallengeCount: isOtp ? prev.otpChallengeCount + 1 : prev.otpChallengeCount,
        autoApprovedCount: isApproved ? prev.autoApprovedCount + 1 : prev.autoApprovedCount,
      };
    });
  };

  // Test Payment Simulation
  const handleSimulateAttackVector = (vector: AttackVectorType) => {
    const attackTxn = generateRandomTransaction(true);

    if (vector === "abstract_velocity") {
      attackTxn.customerName = "Vikram Mehta";
      attackTxn.customerEmail = "vikram.mehta@gmail.com";
      attackTxn.amount = 85000;
      attackTxn.merchant = "Apple Store Online";
      attackTxn.merchantCategory = "Electronics";
      attackTxn.velocity.last2MinutesCount = 3;
      attackTxn.device.isNewDevice = true;
      attackTxn.location.city = "Lagos";
      attackTxn.location.country = "Nigeria";
      attackTxn.location.isVpnOrProxy = true;
      attackTxn.location.distanceFromHomeKm = 7200;
      attackTxn.riskScore = 96;
      attackTxn.riskLevel = "HIGH";
      attackTxn.decision = "BLOCKED";

      setAlertNotice({
        title: "Test Injected: ₹85,000 at Apple Store Online",
        subtitle: "Scored 96/100 (High Risk). Automatically blocked by velocity burst rule and proxy detection.",
      });
    } else if (vector === "geo_spoof") {
      attackTxn.customerName = "Rohan Chopra";
      attackTxn.customerEmail = "rohan.chopra@gmail.com";
      attackTxn.amount = 49500;
      attackTxn.merchant = "Aeroflot Russian Airlines";
      attackTxn.merchantCategory = "Travel";
      attackTxn.velocity.last2MinutesCount = 2;
      attackTxn.device.isNewDevice = true;
      attackTxn.location.city = "Moscow";
      attackTxn.location.country = "Russia";
      attackTxn.location.isVpnOrProxy = true;
      attackTxn.location.distanceFromHomeKm = 4800;
      attackTxn.riskScore = 91;
      attackTxn.riskLevel = "HIGH";
      attackTxn.decision = "BLOCKED";

      setAlertNotice({
        title: "Test Injected: Impossible Travel (4,800 km jump)",
        subtitle: "Scored 91/100 (High Risk). Moscow IP detected within minutes of domestic Mumbai activity.",
      });
    } else if (vector === "account_takeover") {
      attackTxn.customerName = "Deepak Singhania";
      attackTxn.customerEmail = "deepak.s@gmail.com";
      attackTxn.amount = 145000;
      attackTxn.merchant = "Binance P2P Exchange";
      attackTxn.merchantCategory = "Crypto";
      attackTxn.velocity.last2MinutesCount = 4;
      attackTxn.device.browser = "Firefox (Unrecognized Linux Client)";
      attackTxn.device.isNewDevice = true;
      attackTxn.location.isVpnOrProxy = true;
      attackTxn.location.distanceFromHomeKm = 5400;
      attackTxn.riskScore = 98;
      attackTxn.riskLevel = "HIGH";
      attackTxn.decision = "BLOCKED";

      setAlertNotice({
        title: "Test Injected: Account Takeover Attempt (₹1,45,000)",
        subtitle: "Scored 98/100 (High Risk). Large non-refundable crypto ticket on brand new client token.",
      });
    } else {
      attackTxn.customerName = "Test Probe User";
      attackTxn.customerEmail = "probe@carding-test.net";
      attackTxn.amount = 250;
      attackTxn.merchant = "Steam Digital Gaming";
      attackTxn.merchantCategory = "Gaming";
      attackTxn.velocity.last2MinutesCount = 5;
      attackTxn.device.isNewDevice = true;
      attackTxn.location.isVpnOrProxy = true;
      attackTxn.riskScore = 84;
      attackTxn.riskLevel = "HIGH";
      attackTxn.decision = "BLOCKED";

      setAlertNotice({
        title: "Test Injected: Rapid Carding Micro-Probe",
        subtitle: "Scored 84/100 (High Risk). Multiple rapid transactions flagged as automated card testing.",
      });
    }

    addNewTransaction(attackTxn);
    setSelectedTransaction(attackTxn);

    setTimeout(() => {
      setAlertNotice(null);
    }, 6000);
  };

  const handleInjectFromSimulator = (txn: Transaction) => {
    addNewTransaction(txn);
    setActiveTab("monitor");
    setSelectedTransaction(txn);
    setAlertNotice({
      title: `Simulated Transaction Injected (${txn.id})`,
      subtitle: `Amount: ₹${txn.amount.toLocaleString("en-IN")} • Risk Score: ${txn.riskScore}/100 (${txn.decision})`,
    });
    setTimeout(() => {
      setAlertNotice(null);
    }, 5000);
  };

  const handleUpdateStatus = (txnId: string, newAction: Transaction["decision"]) => {
    soundEngine.playSuccessChime();
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, decision: newAction, status: "MANUALLY_OVERRIDDEN" } : t))
    );
    if (selectedTransaction && selectedTransaction.id === txnId) {
      setSelectedTransaction((prev) => (prev ? { ...prev, decision: newAction, status: "MANUALLY_OVERRIDDEN" } : null));
    }
  };

  return (
    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        streamSpeed={streamSpeed}
        setStreamSpeed={setStreamSpeed}
        onSimulateAttackVector={handleSimulateAttackVector}
      />

      {/* Main Container */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Notice Banner */}
        {alertNotice && (
          <div className="rounded-2xl border border-indigo-500/50 bg-indigo-950/90 px-4.5 py-3 text-xs flex items-center justify-between shadow-2xl animate-fade-in backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-white">{alertNotice.title}</span>
                <span className="text-slate-300 ml-2 hidden sm:inline">{alertNotice.subtitle}</span>
              </div>
            </div>
            <button
              onClick={() => setAlertNotice(null)}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tab 1: Live Transactions */}
        {activeTab === "monitor" && (
          <div className="space-y-6">
            {/* Quick 3-Step Guide: How RiskGuard Evaluates Fraud */}
            {showGuideBanner && (
              <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-r from-[#0d1527] via-[#0b1220] to-[#0a101d] p-4.5 sm:p-5 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        Real-Time Fraud Defense Engine
                      </h3>
                      <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] text-slate-300 font-mono border border-slate-700/60">
                        P95: 34ms
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                      Every payment is scored in 34ms using machine learning models (XGBoost + Isolation Forest) across velocity bursts, proxy hops, and hardware identity.
                    </p>
                  </div>

                  {/* 3 Step Visual Flow */}
                  <div className="flex items-center gap-2 text-xs flex-wrap self-start md:self-auto">
                    <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 text-slate-300">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[10px]">1</span>
                      <span className="font-medium">Live Payment</span>
                    </div>
                    <span className="text-slate-600 text-xs">→</span>
                    <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 text-slate-300">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[10px]">2</span>
                      <span className="font-medium">AI Scoring (0-100)</span>
                    </div>
                    <span className="text-slate-600 text-xs">→</span>
                    <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 text-slate-300">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">3</span>
                      <span className="font-medium">Pass / 2FA / Block</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowGuideBanner(false)}
                  className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  title="Dismiss this guide"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Real-time Status Bar */}
            <ThreatTicker
              transactions={transactions}
              onSelectTransaction={(txn) => setSelectedTransaction(txn)}
            />

            {/* KPI Cards */}
            <StatsCards
              metrics={metrics}
              activeFilter={activeFilter}
              onFilterChange={(f) => setActiveFilter(f)}
            />

            {/* Dual-Pane Layout: Table on Left (8 cols), Inspector on Right (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8">
                <TransactionTable
                  transactions={transactions}
                  selectedTransactionId={selectedTransaction?.id}
                  onSelectTransaction={(txn) => setSelectedTransaction(txn)}
                  activeFilter={activeFilter}
                  onFilterChange={(f) => setActiveFilter(f)}
                />
              </div>

              <div className="lg:col-span-4 sticky top-20">
                <InlineInspector
                  transaction={selectedTransaction}
                  onClose={() => setSelectedTransaction(null)}
                  onExpandModal={() => setIsModalOpen(true)}
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Rule Sandbox */}
        {activeTab === "simulator" && (
          <RiskSimulator onInjectTransaction={handleInjectFromSimulator} />
        )}

        {/* Tab 3: Model Performance */}
        {activeTab === "analytics" && <ModelAnalytics />}

        {/* Tab 4: System Architecture */}
        {activeTab === "architecture" && <ArchitectureDiagram />}
      </main>

      {/* Expanded Modal */}
      {isModalOpen && selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction}
          onClose={() => setIsModalOpen(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Clean Fintech Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b13] py-4 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">RiskGuard</span>
            <span>•</span>
            <span>Real-Time Fraud Prevention & Risk Scoring System</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            XGBoost Classification • Isolation Forest • TreeSHAP Attribution
          </div>
        </div>
      </footer>
    </div>
  );
}

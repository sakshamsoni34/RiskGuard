"use client";

import React, { useState, useEffect } from "react";
import { Transaction, ModelMetrics, RiskLevel } from "@/types/fraud";
import { initialTransactions, initialMetrics } from "@/lib/mockData";
import { generateRandomTransaction } from "@/lib/scoringEngine";
import { Navbar } from "@/components/Navbar";
import { StatsCards } from "@/components/StatsCards";
import { TransactionTable } from "@/components/TransactionTable";
import { TransactionModal } from "@/components/TransactionModal";
import { RiskSimulator } from "@/components/RiskSimulator";
import { ModelAnalytics } from "@/components/ModelAnalytics";
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import { ShieldAlert, Play, Pause, Zap, CheckCircle2, AlertOctagon } from "lucide-react";

export default function RiskGuardDashboard() {
  const [activeTab, setActiveTab] = useState<"monitor" | "simulator" | "analytics" | "architecture">("monitor");
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [metrics, setMetrics] = useState<ModelMetrics>(initialMetrics);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  // Periodic Live Stream simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const newTxn = generateRandomTransaction(false);
      addNewTransaction(newTxn);
    }, 4500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const addNewTransaction = (newTxn: Transaction) => {
    setTransactions((prev) => [newTxn, ...prev.slice(0, 49)]); // Keep latest 50

    // Update live metrics
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

  // Immediate High-Risk Attack simulation (matching the abstract example)
  const handleSimulateAttack = () => {
    const attackTxn = generateRandomTransaction(true);
    attackTxn.amount = 85000;
    attackTxn.merchant = "Apple Store Online";
    attackTxn.merchantCategory = "Electronics";
    attackTxn.velocity.last2MinutesCount = 3;
    attackTxn.device.isNewDevice = true;
    attackTxn.location.isVpnOrProxy = true;
    attackTxn.location.distanceFromHomeKm = 7200;
    attackTxn.riskScore = 96;
    attackTxn.riskLevel = "HIGH";
    attackTxn.decision = "BLOCKED";

    addNewTransaction(attackTxn);
    setSelectedTransaction(attackTxn);
    setBannerAlert("🚨 Critical High-Risk Attack Injected: ₹85,000 Velocity Burst Auto-Blocked by XGBoost Engine!");

    setTimeout(() => {
      setBannerAlert(null);
    }, 5000);
  };

  // Inject transaction from Simulator
  const handleInjectFromSimulator = (txn: Transaction) => {
    addNewTransaction(txn);
    setActiveTab("monitor");
    setSelectedTransaction(txn);
    setBannerAlert(`Injected ${txn.id} (Score: ${txn.riskScore}/100 - ${txn.decision}) into live stream`);
    setTimeout(() => {
      setBannerAlert(null);
    }, 4000);
  };

  // Analyst manual override update
  const handleUpdateStatus = (txnId: string, newAction: Transaction["decision"]) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, decision: newAction, status: "MANUALLY_OVERRIDDEN" } : t))
    );
    if (selectedTransaction && selectedTransaction.id === txnId) {
      setSelectedTransaction((prev) => (prev ? { ...prev, decision: newAction, status: "MANUALLY_OVERRIDDEN" } : null));
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        onSimulateAttack={handleSimulateAttack}
      />

      {/* Main Container */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Banner Alert Toast */}
        {bannerAlert && (
          <div className="rounded-xl border border-rose-500/50 bg-rose-950/70 p-4 text-xs font-semibold text-rose-200 flex items-center justify-between shadow-2xl animate-pulse">
            <div className="flex items-center gap-2.5">
              <AlertOctagon className="h-5 w-5 text-rose-400 flex-shrink-0" />
              <span>{bannerAlert}</span>
            </div>
            <button
              onClick={() => setBannerAlert(null)}
              className="text-rose-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Live Monitor */}
        {activeTab === "monitor" && (
          <div className="space-y-6">
            {/* Top KPI Cards */}
            <StatsCards metrics={metrics} />

            {/* Ingestion Stream Table */}
            <TransactionTable
              transactions={transactions}
              onSelectTransaction={(txn) => setSelectedTransaction(txn)}
            />
          </div>
        )}

        {/* Tab 2: Risk Simulator Playground */}
        {activeTab === "simulator" && (
          <RiskSimulator onInjectTransaction={handleInjectFromSimulator} />
        )}

        {/* Tab 3: Model Analytics & Explainability */}
        {activeTab === "analytics" && <ModelAnalytics />}

        {/* Tab 4: System Architecture */}
        {activeTab === "architecture" && <ArchitectureDiagram />}
      </main>

      {/* Transaction Deep-Dive Inspection Modal */}
      <TransactionModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070a12] py-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">RiskGuard</span>
            <span>•</span>
            <span>Real-Time Fraud Detection System Using Machine Learning-Based Risk Scoring</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            XGBoost Classification • Isolation Forest Anomaly • TreeSHAP Interpretability
          </div>
        </div>
      </footer>
    </div>
  );
}

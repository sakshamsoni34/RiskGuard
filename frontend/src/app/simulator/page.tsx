"use client";

import React, { useState } from "react";
import { RiskSimulator } from "@/components/RiskSimulator";
import { Transaction } from "@/types/fraud";
import { CheckCircle2, Sliders, AlertTriangle } from "lucide-react";

export default function SimulatorPage() {
  const [injectedTxn, setInjectedTxn] = useState<Transaction | null>(null);

  const handleInject = (txn: Transaction) => {
    setInjectedTxn(txn);
    setTimeout(() => {
      setInjectedTxn(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {injectedTxn && (
        <div className="p-3.5 rounded-xl bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 text-xs font-mono flex items-center justify-between shadow-xl animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Synthetic test transaction {injectedTxn.id} scored ({injectedTxn.riskScore}/100 -{" "}
              {injectedTxn.decision}) and injected into telemetry queue!
            </span>
          </div>
          <button onClick={() => setInjectedTxn(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b1222] border border-[#17223b]">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span>Interactive Risk Scoring & SHAP Explainer Simulator</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Test custom transaction parameters against the XGBoost scoring pipeline in real-time
          </p>
        </div>
        <div className="text-[11px] font-mono px-2 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
          SANDBOX TESTBENCH
        </div>
      </div>

      {/* Embedded Preserved Simulator */}
      <div className="fintech-card p-6 rounded-2xl border border-slate-800">
        <RiskSimulator onInjectTransaction={handleInject} />
      </div>
    </div>
  );
}

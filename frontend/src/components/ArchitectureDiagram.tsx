"use client";

import React, { useState } from "react";
import {
  Server,
  Database,
  Cpu,
  Monitor,
  Box,
  CheckCircle2,
  Workflow,
  Terminal,
  Copy,
  Check,
  Code2,
} from "lucide-react";

export const ArchitectureDiagram: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string>("ml");
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);

  const sampleCurl = `curl -X POST https://api.riskguard.internal/v1/risk/evaluate \\
  -H "Authorization: Bearer rg_live_9a8f2bc104" \\
  -H "Content-Type: application/json" \\
  -d '{
    "transaction_id": "TXN-1048",
    "amount": 85000,
    "currency": "INR",
    "merchant": "Apple Store Online",
    "customer_id": "CUST-8492",
    "payment_method": { "type": "card", "last4": "4242" },
    "device_fingerprint": "fp_9f8d3a1",
    "ip_address": "197.210.226.41",
    "distance_from_home_km": 7200,
    "velocity_2min": 3
  }'`;

  const copyPayload = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c1220]/90 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">System Architecture & Pipeline</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Containerized microservices running XGBoost classification, Isolation Forest anomaly scoring, and TreeSHAP explainability in &lt;40ms.
            </p>
          </div>
          <span className="rounded-xl bg-slate-800/90 px-3 py-1.5 text-xs font-mono text-emerald-400 border border-slate-700/60 self-start sm:self-auto">
            Docker Compose • Production Ready
          </span>
        </div>

        {/* Latency Waterfall */}
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span>End-to-End Latency Budget</span>
            <span className="font-mono text-emerald-400">Total P95: 37 ms (SLA &lt; 100ms)</span>
          </div>
          <div className="flex w-full h-2.5 rounded-full overflow-hidden gap-0.5 bg-slate-800">
            <div className="bg-indigo-500 w-[14%]" title="API Gateway: 5ms" />
            <div className="bg-cyan-500 w-[76%]" title="XGBoost & TreeSHAP: 28ms" />
            <div className="bg-emerald-500 w-[10%]" title="Database Ledger: 4ms" />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span className="text-indigo-400">Gateway (5ms)</span>
            <span className="text-cyan-400">XGBoost & SHAP (28ms)</span>
            <span className="text-emerald-400">PostgreSQL Store (4ms)</span>
          </div>
        </div>
      </div>

      {/* Microservice Topology Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Node 1: Web Frontend */}
        <div
          onClick={() => setSelectedService("frontend")}
          className={`rounded-2xl border p-4.5 cursor-pointer transition-all ${
            selectedService === "frontend"
              ? "border-indigo-500 bg-slate-900/95 ring-2 ring-indigo-500/30 shadow-lg"
              : "border-slate-800 bg-[#0c1220]/90 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Monitor className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Port 3000
            </span>
          </div>
          <div className="text-sm font-bold text-white">Web Dashboard</div>
          <div className="text-xs text-slate-400 mt-0.5">Next.js 16 + React 19</div>
          <div className="mt-3 text-xs text-slate-400 leading-relaxed">
            Real-time streaming ledger, clean inline inspector, and TreeSHAP waterfall graphs.
          </div>
        </div>

        {/* Node 2: Gateway */}
        <div
          onClick={() => setSelectedService("backend")}
          className={`rounded-2xl border p-4.5 cursor-pointer transition-all ${
            selectedService === "backend"
              ? "border-indigo-500 bg-slate-900/95 ring-2 ring-indigo-500/30 shadow-lg"
              : "border-slate-800 bg-[#0c1220]/90 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Server className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Port 5000
            </span>
          </div>
          <div className="text-sm font-bold text-white">API Gateway</div>
          <div className="text-xs text-slate-400 mt-0.5">Node.js + Express</div>
          <div className="mt-3 text-xs text-slate-400 leading-relaxed">
            Ingestion webhooks, Redis sliding-window velocity checks, and session tokens.
          </div>
        </div>

        {/* Node 3: ML Engine */}
        <div
          onClick={() => setSelectedService("ml")}
          className={`rounded-2xl border p-4.5 cursor-pointer transition-all ${
            selectedService === "ml"
              ? "border-indigo-500 bg-slate-900/95 ring-2 ring-indigo-500/30 shadow-lg"
              : "border-slate-800 bg-[#0c1220]/90 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Cpu className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Port 8000
            </span>
          </div>
          <div className="text-sm font-bold text-white">ML Risk Engine</div>
          <div className="text-xs text-slate-400 mt-0.5">Python + FastAPI</div>
          <div className="mt-3 text-xs text-slate-400 leading-relaxed">
            XGBoost classification model, Isolation Forest anomaly scoring, and TreeSHAP explainer.
          </div>
        </div>

        {/* Node 4: DB */}
        <div
          onClick={() => setSelectedService("db")}
          className={`rounded-2xl border p-4.5 cursor-pointer transition-all ${
            selectedService === "db"
              ? "border-indigo-500 bg-slate-900/95 ring-2 ring-indigo-500/30 shadow-lg"
              : "border-slate-800 bg-[#0c1220]/90 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Database className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Port 5432
            </span>
          </div>
          <div className="text-sm font-bold text-white">Database Store</div>
          <div className="text-xs text-slate-400 mt-0.5">PostgreSQL 16</div>
          <div className="mt-3 text-xs text-slate-400 leading-relaxed">
            ACID transaction ledgers, cardholder historical spend profiles, and manual review logs.
          </div>
        </div>
      </div>

      {/* Service Details & cURL Documentation */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c1220]/90 p-5 space-y-4">
        {selectedService === "frontend" && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white">Frontend Service (Next.js 16 + React 19)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Provides the operations interface for fraud triage. Integrates real-time event streaming, dual-pane inline inspector, TreeSHAP feature waterfalls, and analyst decision actions.
            </p>
          </div>
        )}
        {selectedService === "backend" && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white">API Gateway Service (Node.js + Express + Redis)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consumes incoming authorization requests, checks sliding-window velocity in Redis, queries customer historical baselines, and formats the feature tensor for inference.
            </p>
          </div>
        )}
        {selectedService === "ml" && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white">ML Inference Service (FastAPI + XGBoost + TreeSHAP)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Asynchronous ASGI endpoint returning risk probability score (0-100), classification decision tier, and additive SHAP feature contributions in under 38 milliseconds.
            </p>
          </div>
        )}
        {selectedService === "db" && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white">Database & Feature Store (PostgreSQL 16)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Stores transaction logs, cardholder behavioral baselines, client hardware fingerprint history, and analyst override audit trails.
            </p>
          </div>
        )}

        {/* cURL API Sample */}
        <div className="border-t border-slate-800/80 pt-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-slate-400" />
              <span>Evaluate Risk API Request (cURL)</span>
            </span>
            <button
              onClick={copyPayload}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              {copiedPayload ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy cURL</span>
                </>
              )}
            </button>
          </div>
          <pre className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
            {sampleCurl}
          </pre>
        </div>
      </div>
    </div>
  );
};

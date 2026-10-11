"use client";

import React, { useState } from "react";
import {
  Server,
  Database,
  Cpu,
  Monitor,
  Box,
  CheckCircle2,
  ArrowRight,
  FileText,
  Workflow,
  Sparkles,
} from "lucide-react";

export const ArchitectureDiagram: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string>("ml");

  return (
    <div className="space-y-6">
      {/* Abstract Mission Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Project Abstract & Mission</h3>
          <span className="rounded bg-indigo-950 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 border border-indigo-800/50">
            Real-Time Fraud Detection System Using Machine Learning-Based Risk Scoring
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Online financial fraud causes significant monetary losses and erodes customer trust. Conventional rule-based systems struggle with static thresholds and high false-positive rates. <span className="text-cyan-400 font-semibold">RiskGuard</span> replaces static rules with a machine-learning risk engine combining <span className="text-white font-semibold">XGBoost classification</span> and <span className="text-white font-semibold">anomaly detection</span> to evaluate multi-dimensional signals (amount, device fingerprint, geolocation jump, transaction velocity) in real-time, backed by <span className="text-purple-300 font-semibold">SHAP explainability</span> and a 3-tier action hierarchy (Auto-Approve, OTP Step-Up, Block).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/40 p-3">
            <div className="text-[10px] uppercase font-bold text-emerald-400">Low Risk (0 - 34)</div>
            <div className="text-xs font-semibold text-white mt-1">Automatic Approval</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Zero friction for verified users</div>
          </div>
          <div className="rounded-lg bg-amber-950/40 border border-amber-800/40 p-3">
            <div className="text-[10px] uppercase font-bold text-amber-400">Medium Risk (35 - 70)</div>
            <div className="text-xs font-semibold text-white mt-1">Step-Up OTP Challenge</div>
            <div className="text-[11px] text-slate-400 mt-0.5">2FA verification requested</div>
          </div>
          <div className="rounded-lg bg-rose-950/40 border border-rose-800/40 p-3">
            <div className="text-[10px] uppercase font-bold text-rose-400">High Risk (71 - 100)</div>
            <div className="text-xs font-semibold text-white mt-1">Immediate Block</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Marked for analyst attention</div>
          </div>
        </div>
      </div>

      {/* End-to-End System Architecture (The Containerized 4-Part Stack) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Workflow className="h-5 w-5 text-cyan-400" />
              Full-Stack Containerized Microservices Architecture
            </h3>
            <p className="text-xs text-slate-400">
              Docker-containerized pipeline orchestrated for low-latency financial stream processing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-mono text-indigo-300">Docker Containers • Cloud Ready</span>
          </div>
        </div>

        {/* 4 Interactive Service Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 1. Frontend */}
          <div
            onClick={() => setSelectedService("frontend")}
            className={`rounded-xl border p-4 cursor-pointer transition-all ${
              selectedService === "frontend"
                ? "border-cyan-500 bg-cyan-950/30 glow-indigo"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <Monitor className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Active
              </span>
            </div>
            <div className="text-sm font-bold text-white">Frontend Dashboard</div>
            <div className="text-xs font-mono text-slate-400 mt-0.5">React 19 + Next.js 16</div>
            <div className="mt-3 text-[11px] text-slate-400">
              Real-time analytics UI, analyst investigation console, SHAP visualization.
            </div>
          </div>

          {/* 2. Backend Gateway */}
          <div
            onClick={() => setSelectedService("backend")}
            className={`rounded-xl border p-4 cursor-pointer transition-all ${
              selectedService === "backend"
                ? "border-indigo-500 bg-indigo-950/30 glow-indigo"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Server className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Active
              </span>
            </div>
            <div className="text-sm font-bold text-white">API Gateway</div>
            <div className="text-xs font-mono text-slate-400 mt-0.5">Node.js + Express</div>
            <div className="mt-3 text-[11px] text-slate-400">
              Payment signal ingestion, session authentication, OTP challenge dispatcher.
            </div>
          </div>

          {/* 3. ML Engine */}
          <div
            onClick={() => setSelectedService("ml")}
            className={`rounded-xl border p-4 cursor-pointer transition-all ${
              selectedService === "ml"
                ? "border-purple-500 bg-purple-950/30 glow-indigo"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <Cpu className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Active
              </span>
            </div>
            <div className="text-sm font-bold text-white">Risk ML Engine</div>
            <div className="text-xs font-mono text-slate-400 mt-0.5">Python + FastAPI</div>
            <div className="mt-3 text-[11px] text-slate-400">
              XGBoost classifier, Isolation Forest anomaly, TreeSHAP explainer (&lt;40ms).
            </div>
          </div>

          {/* 4. PostgreSQL Database */}
          <div
            onClick={() => setSelectedService("db")}
            className={`rounded-xl border p-4 cursor-pointer transition-all ${
              selectedService === "db"
                ? "border-blue-500 bg-blue-950/30 glow-indigo"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Database className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Connected
              </span>
            </div>
            <div className="text-sm font-bold text-white">Database Store</div>
            <div className="text-xs font-mono text-slate-400 mt-0.5">PostgreSQL</div>
            <div className="mt-3 text-[11px] text-slate-400">
              Transaction ledgers, user behavioral baselines, hardware hash fingerprints.
            </div>
          </div>
        </div>

        {/* Selected Service Deep Dive Card */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/80 p-5">
          {selectedService === "frontend" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">
                  Frontend Dashboard (Next.js 16 + React 19 + Tailwind CSS)
                </h4>
                <span className="text-xs font-mono text-cyan-400">Container: riskguard-web:latest</span>
              </div>
              <p className="text-xs text-slate-300">
                Implements an asynchronous operational cockpit for fraud triage teams. Employs Server-Sent Events (SSE) and WebSockets to stream incoming evaluated transactions with zero page refresh. Includes an interactive SHAP waterfall inspector, threshold tuning playground, and manual override capabilities.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">Port: 3000</span>
                <span className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">Turbopack SSR</span>
                <span className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">Recharts Visualization</span>
              </div>
            </div>
          )}

          {selectedService === "backend" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">
                  Backend API Gateway (Node.js + Express)
                </h4>
                <span className="text-xs font-mono text-indigo-400">Container: riskguard-gateway:latest</span>
              </div>
              <p className="text-xs text-slate-300">
                Receives incoming payment webhook payloads from checkout gateways. Gathers temporal velocity counts (e.g. 3 transactions within 2 minutes) from Redis and queries cardholder historical habits from PostgreSQL before dispatching the enriched feature tensor to FastAPI.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">Port: 5000</span>
                <span className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">JWT Auth</span>
                <span className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">Rate Limiter</span>
              </div>
            </div>
          )}

          {selectedService === "ml" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">
                  ML Inference Engine (Python 3.11 + FastAPI + XGBoost + SHAP)
                </h4>
                <span className="text-xs font-mono text-purple-400">Container: riskguard-ml:latest</span>
              </div>
              <p className="text-xs text-slate-300">
                Asynchronous ASGI service hosting the serialized XGBoost classification model, Isolation Forest anomaly detector, and TreeSHAP explainer. Returns risk probability (0-100), 3-tier classification, and localized feature attribution vectors in &lt;38ms P95 latency.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">Port: 8000</span>
                <span className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">P95 Latency: 38ms</span>
                <span className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">Uvicorn Workers: 4</span>
                <span className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">Model: XGBoost v2.4</span>
              </div>
            </div>
          )}

          {selectedService === "db" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">
                  Database & Feature Store (PostgreSQL 16)
                </h4>
                <span className="text-xs font-mono text-blue-400">Container: riskguard-db:latest</span>
              </div>
              <p className="text-xs text-slate-300">
                Maintains ACID compliance for financial transaction records, hardware fingerprint tokens, cardholder spending baselines, and analyst manual override audit trails.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">Port: 5432</span>
                <span className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">Connection Pool: PgBouncer</span>
                <span className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300">Encrypted at Rest</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

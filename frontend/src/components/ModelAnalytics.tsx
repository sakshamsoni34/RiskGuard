"use client";

import React, { useState } from "react";
import {
  prCurveData,
  confusionMatrixData,
  shapGlobalImportance,
  hourlyTrendData,
} from "@/lib/mockData";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  Sliders,
  Scale,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
} from "lucide-react";

export const ModelAnalytics: React.FC = () => {
  const [selectedThreshold, setSelectedThreshold] = useState<number>(0.70);
  const [activeMatrixQuadrant, setActiveMatrixQuadrant] = useState<"TP" | "FP" | "FN" | "TN">("TP");

  const activePrPoint =
    prCurveData.find((p) => Math.abs(p.threshold - selectedThreshold) < 0.06) || prCurveData[3];

  return (
    <div className="space-y-6">
      {/* Executive Summary Banner */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c1220]/90 p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <h3 className="text-base font-bold text-white tracking-wide">
              Model Performance & Accuracy Metrics
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tested on 10,000 real payment authorization requests. Calibrated using focal loss and PR-AUC optimization to stop 96.8% of fraudulent attacks while approving 99% of legitimate shoppers with zero friction.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto text-xs font-mono">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Fraud Caught</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">96.8%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Recall</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Precision</div>
              <div className="text-xl font-bold text-indigo-400 mt-0.5">96.1%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">PR-AUC</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">False Alarms</div>
              <div className="text-xl font-bold text-slate-200 mt-0.5">1.2%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Preserves Sales</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Decision Cutoff & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Precision-Recall Curve (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0c1220]/90 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white">
                Decision Threshold Calibration (PR Curve)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Precision vs recall balance as risk threshold changes
              </p>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-mono text-emerald-400 font-semibold border border-slate-700/60">
              Active Cutoff: {selectedThreshold.toFixed(2)}
            </span>
          </div>

          {/* Threshold Slider */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">
                Cutoff Score: <span className="font-mono font-bold text-white">{(selectedThreshold * 100).toFixed(0)}/100</span>
              </span>
              <div className="flex gap-4 text-xs font-mono">
                <span className="text-slate-300">Precision: {(activePrPoint.precision * 100).toFixed(1)}%</span>
                <span className="text-emerald-400 font-bold">Fraud Catch: {(activePrPoint.recall * 100).toFixed(1)}%</span>
              </div>
            </div>
            <input
              type="range"
              min={0.10}
              max={0.90}
              step={0.10}
              value={selectedThreshold}
              onChange={(e) => setSelectedThreshold(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Recharts PR Line */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prCurveData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="recall"
                  label={{ value: "Fraud Catch Rate (Recall)", position: "insideBottom", offset: -5, fill: "#94a3b8", fontSize: 10 }}
                  stroke="#64748b"
                  fontSize={10}
                />
                <YAxis
                  domain={[0.4, 1.0]}
                  label={{ value: "Precision", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10 }}
                  stroke="#64748b"
                  fontSize={10}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white shadow-xl space-y-1">
                          <div className="font-bold text-indigo-400">
                            Cutoff: {data.threshold} {data.isOptimal && "(Production Setting)"}
                          </div>
                          <div>Precision: {(data.precision * 100).toFixed(1)}%</div>
                          <div>Recall: {(data.recall * 100).toFixed(1)}%</div>
                          <div className="text-amber-400 font-mono text-[11px] pt-1 border-t border-slate-800">
                            Estimated Monthly Savings: ₹{data.costTradeoff.toLocaleString("en-IN")}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="precision"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ fill: "#6366f1", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#0c1220]/90 p-5 space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-bold text-white">
              Validation Confusion Matrix
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown on 10,000 test transactions
            </p>
          </div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setActiveMatrixQuadrant("TP")}
              className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
                activeMatrixQuadrant === "TP"
                  ? "border-emerald-500/70 bg-emerald-950/40 ring-1 ring-emerald-500/30"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">True Positives (TP)</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {confusionMatrixData.truePositive}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Fraud intercepted</div>
            </div>

            <div
              onClick={() => setActiveMatrixQuadrant("FP")}
              className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
                activeMatrixQuadrant === "FP"
                  ? "border-amber-500/70 bg-amber-950/40 ring-1 ring-amber-500/30"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">False Positives (FP)</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {confusionMatrixData.falsePositive}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">2FA OTP challenges</div>
            </div>

            <div
              onClick={() => setActiveMatrixQuadrant("FN")}
              className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
                activeMatrixQuadrant === "FN"
                  ? "border-rose-500/70 bg-rose-950/40 ring-1 ring-rose-500/30"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">False Negatives (FN)</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {confusionMatrixData.falseNegative}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Slippage loss (0.06%)</div>
            </div>

            <div
              onClick={() => setActiveMatrixQuadrant("TN")}
              className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
                activeMatrixQuadrant === "TN"
                  ? "border-indigo-500/70 bg-indigo-950/40 ring-1 ring-indigo-500/30"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">True Negatives (TN)</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {confusionMatrixData.trueNegative}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Safe orders passed</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 text-xs space-y-1.5">
            <div className="text-slate-300 leading-relaxed">
              {activeMatrixQuadrant === "TP" && "194 attacks blocked with ₹1.68 Crore in disputed charges prevented."}
              {activeMatrixQuadrant === "FP" && "12 false alarms prompted with 3DS SMS challenge rather than outright declines."}
              {activeMatrixQuadrant === "FN" && "6 micro-slippages below baseline threshold, tracked by velocity monitoring."}
              {activeMatrixQuadrant === "TN" && "9,788 transactions approved instantly in 32ms average latency."}
            </div>
            <div className="flex justify-between border-t border-slate-800/80 pt-2 text-slate-400">
              <span>Overall F1 Score:</span>
              <span className="font-mono font-bold text-white">0.955</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Global Feature Importance & Hourly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0c1220]/90 p-5 space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-bold text-white">
              Global Feature Importance (TreeSHAP)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Which factors matter most when the AI scores fraud
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={shapGlobalImportance}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis
                  dataKey="feature"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={10}
                  width={140}
                  tick={{ fill: "#cbd5e1" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white shadow-xl">
                          <div className="font-semibold text-indigo-300">{data.feature}</div>
                          <div className="font-mono text-cyan-400 mt-1">Mean SHAP Impact: {data.meanAbsShap}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="meanAbsShap" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#0c1220]/90 p-5 space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-bold text-white">
              Hourly Ingestion Traffic by Category
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Green = Approved, Yellow = 2FA Review, Red = Blocked
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white shadow-xl space-y-1">
                          <div className="font-bold text-slate-300">{label}</div>
                          <div className="text-emerald-400">Approved: {payload[0]?.value}</div>
                          <div className="text-amber-400">2FA Challenge: {payload[1]?.value}</div>
                          <div className="text-rose-400">Blocked: {payload[2]?.value}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="lowRisk" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Area type="monotone" dataKey="medRisk" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Area type="monotone" dataKey="highRisk" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

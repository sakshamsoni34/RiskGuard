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
} from "lucide-react";

export const ModelAnalytics: React.FC = () => {
  const [selectedThreshold, setSelectedThreshold] = useState<number>(0.70);
  const [activeMatrixQuadrant, setActiveMatrixQuadrant] = useState<"TP" | "FP" | "FN" | "TN">("TP");

  const activePrPoint =
    prCurveData.find((p) => Math.abs(p.threshold - selectedThreshold) < 0.06) || prCurveData[3];

  return (
    <div className="space-y-6">
      {/* Executive Summary Banner */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">
              Model Performance & Precision-Recall Metrics
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Evaluation benchmarks on test cohort of 10,000 transactions. Calibrated using focal loss and PR-AUC optimization to maximize fraud detection while preserving legitimate cardholder conversion.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-medium">PR-AUC</div>
              <div className="text-base font-bold text-white mt-0.5">96.1%</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-medium">Recall</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">96.8%</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-medium">False Decline</div>
              <div className="text-base font-bold text-slate-200 mt-0.5">1.2%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Precision-Recall Curve & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Precision-Recall Curve (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0d1424] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-semibold text-white">
                Decision Boundary Calibration (PR Curve)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Precision-recall trade-off across varying decision cutoffs
              </p>
            </div>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono text-emerald-400 font-medium">
              Selected Cutoff: 0.70
            </span>
          </div>

          {/* Threshold Slider */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">
                Decision Cutoff: <span className="font-mono font-bold text-white">{selectedThreshold.toFixed(2)}</span>
              </span>
              <div className="flex gap-3 text-xs font-mono">
                <span className="text-slate-300">Precision: {(activePrPoint.precision * 100).toFixed(1)}%</span>
                <span className="text-emerald-400 font-medium">Recall: {(activePrPoint.recall * 100).toFixed(1)}%</span>
              </div>
            </div>
            <input
              type="range"
              min={0.10}
              max={0.90}
              step={0.10}
              value={selectedThreshold}
              onChange={(e) => setSelectedThreshold(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
            />
          </div>

          {/* Recharts PR Line */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prCurveData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="recall"
                  label={{ value: "Recall (Fraud Caught)", position: "insideBottom", offset: -5, fill: "#94a3b8", fontSize: 10 }}
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
                        <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white shadow-xl space-y-1">
                          <div className="font-semibold text-indigo-400">
                            Threshold: {data.threshold} {data.isOptimal && "(Production Default)"}
                          </div>
                          <div>Precision: {(data.precision * 100).toFixed(1)}%</div>
                          <div>Recall: {(data.recall * 100).toFixed(1)}%</div>
                          <div className="text-amber-400 font-mono text-[11px]">
                            Estimated Loss Trade-off: ₹{data.costTradeoff.toLocaleString("en-IN")}
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
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0d1424] p-5 space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-semibold text-white">
              Validation Confusion Matrix
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              10,000 transaction validation set (2.0% fraud prevalence)
            </p>
          </div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => setActiveMatrixQuadrant("TP")}
              className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                activeMatrixQuadrant === "TP"
                  ? "border-emerald-500/60 bg-emerald-950/30"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] font-medium text-emerald-400 uppercase">True Positives (TP)</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {confusionMatrixData.truePositive}
              </div>
              <div className="text-[11px] text-slate-400">Fraud intercepted</div>
            </div>

            <div
              onClick={() => setActiveMatrixQuadrant("FP")}
              className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                activeMatrixQuadrant === "FP"
                  ? "border-amber-500/60 bg-amber-950/30"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] font-medium text-amber-400 uppercase">False Positives (FP)</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {confusionMatrixData.falsePositive}
              </div>
              <div className="text-[11px] text-slate-400">3DS Step-Up challenges</div>
            </div>

            <div
              onClick={() => setActiveMatrixQuadrant("FN")}
              className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                activeMatrixQuadrant === "FN"
                  ? "border-rose-500/60 bg-rose-950/30"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] font-medium text-rose-400 uppercase">False Negatives (FN)</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {confusionMatrixData.falseNegative}
              </div>
              <div className="text-[11px] text-slate-400">Slippage loss (0.06%)</div>
            </div>

            <div
              onClick={() => setActiveMatrixQuadrant("TN")}
              className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                activeMatrixQuadrant === "TN"
                  ? "border-indigo-500/60 bg-indigo-950/30"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] font-medium text-indigo-400 uppercase">True Negatives (TN)</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {confusionMatrixData.trueNegative}
              </div>
              <div className="text-[11px] text-slate-400">Smooth legitimate passes</div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-1">
            <div className="text-slate-300">
              {activeMatrixQuadrant === "TP" && "194 attacks blocked with 0 slippage loss; prevented an estimated ₹1.68 Crore in disputed charges."}
              {activeMatrixQuadrant === "FP" && "12 false alarms prompted with 3DS SMS challenge rather than outright declines, preserving genuine sales."}
              {activeMatrixQuadrant === "FN" && "6 micro-slippages below baseline threshold, monitored by downstream velocity rules."}
              {activeMatrixQuadrant === "TN" && "9,788 transactions approved instantly in 32ms average latency."}
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-1.5 text-slate-400">
              <span>Overall F1 Score:</span>
              <span className="font-mono font-semibold text-white">0.955</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Global Feature Importance & Hourly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0d1424] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-semibold text-white">
                Global Feature Importance (TreeSHAP)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Mean absolute SHAP impact across population decision trees
              </p>
            </div>
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
                        <div className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white shadow-xl">
                          <div className="font-medium text-indigo-300">{data.feature}</div>
                          <div className="font-mono text-cyan-400 mt-1">Mean |SHAP| Value: {data.meanAbsShap}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="meanAbsShap" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0d1424] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-semibold text-white">
                Hourly Ingestion Traffic by Tier
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Allowed vs 3DS Review vs Blocked volume
              </p>
            </div>
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
                        <div className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white shadow-xl space-y-1">
                          <div className="font-semibold text-slate-300">{label}</div>
                          <div className="text-emerald-400">Allowed: {payload[0]?.value}</div>
                          <div className="text-amber-400">3DS Review: {payload[1]?.value}</div>
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

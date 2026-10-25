"use client";

import React, { useState, useMemo } from "react";
import {
  prCurveData,
  shapGlobalImportance,
  hourlyTrendData,
} from "@/lib/mockData";
import {
  calculateMetricsForThreshold,
  generateThresholdSeriesData,
} from "@/lib/thresholdMetrics";
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
  ReferenceDot,
  ReferenceLine,
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
  Activity,
  Layers,
} from "lucide-react";

export const ModelAnalytics: React.FC = () => {
  const [selectedThreshold, setSelectedThreshold] = useState<number>(0.70);
  const [activeMatrixQuadrant, setActiveMatrixQuadrant] = useState<"TP" | "FP" | "FN" | "TN">("TP");
  const [chartMode, setChartMode] = useState<"pr" | "tradeoff">("pr");

  // Real-time calculation of confusion matrix and metrics from current cutoff
  const metrics = useMemo(() => {
    return calculateMetricsForThreshold(selectedThreshold);
  }, [selectedThreshold]);

  // Precomputed sensitivity series across all thresholds for the tradeoff view
  const thresholdSeries = useMemo(() => {
    return generateThresholdSeriesData(17);
  }, []);

  // Dynamically shifts hourly ingestion breakdown based on the active cutoff policy
  const dynamicHourlyTrend = useMemo(() => {
    const delta = selectedThreshold - 0.70; // negative = stricter, positive = more lenient
    return hourlyTrendData.map((row) => {
      const highShift = Math.round(row.highRisk * (-delta * 0.9));
      const medShift = Math.round(row.medRisk * (-delta * 0.5));
      const highRisk = Math.max(3, row.highRisk + highShift);
      const medRisk = Math.max(8, row.medRisk + medShift);
      const lowRisk = Math.max(10, row.volume - highRisk - medRisk);
      return {
        ...row,
        lowRisk,
        medRisk,
        highRisk,
      };
    });
  }, [selectedThreshold]);

  return (
    <div className="space-y-6">
      {/* Row 1: Decision Cutoff & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Precision-Recall Curve (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#222226] bg-[#0d0d10] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#222226] pb-3 gap-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Decision Threshold Calibration</span>
                {metrics.isOptimal && (
                  <span className="text-[10px] font-semibold font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                    Production Optimal
                  </span>
                )}
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time Precision vs Recall trade-off as risk cutoff moves
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg bg-[#141418] p-0.5 border border-[#27272a] text-xs">
                <button
                  type="button"
                  onClick={() => setChartMode("pr")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all hover:scale-[1.02] active:scale-95 ${
                    chartMode === "pr" ? "bg-[#27272e] text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  PR Frontier
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode("tradeoff")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all hover:scale-[1.02] active:scale-95 ${
                    chartMode === "tradeoff" ? "bg-[#27272e] text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Threshold Curve
                </button>
              </div>

              <span className="rounded-full bg-[#18181c] px-3 py-1 text-xs font-mono text-emerald-400 font-semibold border border-[#2b2b30] flex-shrink-0">
                Cutoff: {selectedThreshold.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Threshold Slider with Live Precision / Recall readout */}
          <div className="rounded-xl border border-[#222226] bg-[#121215] p-3.5 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-zinc-300 font-medium">
                  Cutoff Score:{" "}
                  <span className="font-mono font-bold text-white bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded">
                    {Math.round(selectedThreshold * 100)}/100
                  </span>
                </span>
              </div>

              <div className="flex gap-3 text-xs font-mono">
                <span className="text-sky-300">
                  Precision: <strong className="text-white">{(metrics.precision * 100).toFixed(1)}%</strong>
                </span>
                <span className="text-emerald-400 font-bold">
                  Fraud Catch: <strong className="text-emerald-300">{(metrics.recall * 100).toFixed(1)}%</strong>
                </span>
              </div>
            </div>

            <input
              type="range"
              min={0.15}
              max={0.95}
              step={0.01}
              value={selectedThreshold}
              onChange={(e) => setSelectedThreshold(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
            />

            {/* Quick Preset Buttons */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#1c1c22]">
              <span className="text-zinc-500 font-mono">Presets:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedThreshold(0.35)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all hover:scale-[1.04] active:scale-95 ${
                    Math.abs(selectedThreshold - 0.35) < 0.03
                      ? "bg-rose-950 text-rose-300 border border-rose-800/60"
                      : "bg-[#18181c] text-zinc-400 hover:text-white hover:border-zinc-500 border border-[#25252a]"
                  }`}
                >
                  Aggressive Catch (0.35)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedThreshold(0.70)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all hover:scale-[1.04] active:scale-95 ${
                    Math.abs(selectedThreshold - 0.70) < 0.03
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800/60"
                      : "bg-[#18181c] text-zinc-400 hover:text-white hover:border-zinc-500 border border-[#25252a]"
                  }`}
                >
                  Optimal (0.70)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedThreshold(0.85)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all hover:scale-[1.04] active:scale-95 ${
                    Math.abs(selectedThreshold - 0.85) < 0.03
                      ? "bg-sky-950 text-sky-300 border border-sky-800/60"
                      : "bg-[#18181c] text-zinc-400 hover:text-white hover:border-zinc-500 border border-[#25252a]"
                  }`}
                >
                  Low Friction (0.85)
                </button>
              </div>
            </div>
          </div>

          {/* Graph Beneath Slider: Dynamically changes with active operating point */}
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === "pr" ? (
                /* Mode 1: Precision-Recall Curve with Real-Time Sliding Operating Dot */
                <LineChart data={prCurveData} margin={{ top: 10, right: 25, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222226" />
                  <XAxis
                    dataKey="recall"
                    type="number"
                    domain={[0.7, 1.0]}
                    tickCount={7}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    label={{ value: "Fraud Catch Rate (Recall)", position: "insideBottom", offset: -5, fill: "#a1a1aa", fontSize: 10 }}
                    stroke="#71717a"
                    fontSize={10}
                  />
                  <YAxis
                    domain={[0.4, 1.0]}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    label={{ value: "Precision", angle: -90, position: "insideLeft", fill: "#a1a1aa", fontSize: 10 }}
                    stroke="#71717a"
                    fontSize={10}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-[#27272a] bg-[#0e0e11] p-3 text-xs text-white shadow-xl space-y-1">
                            <div className="font-bold text-zinc-200">
                              Cutoff: {data.threshold} {data.isOptimal && "(Production Setting)"}
                            </div>
                            <div>Precision: {(data.precision * 100).toFixed(1)}%</div>
                            <div>Recall: {(data.recall * 100).toFixed(1)}%</div>
                            <div className="text-amber-400 font-mono text-[11px] pt-1 border-t border-[#222226]">
                              Estimated Monthly Savings: ₹{data.costTradeoff.toLocaleString("en-IN")}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Dynamic Vertical Crosshair tracking Recall */}
                  <ReferenceLine
                    x={metrics.recall}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                  />
                  {/* Dynamic Horizontal Crosshair tracking Precision */}
                  <ReferenceLine
                    y={metrics.precision}
                    stroke="#38bdf8"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                  />
                  {/* Static Baseline PR Curve */}
                  <Line
                    type="monotone"
                    dataKey="precision"
                    stroke="#52525b"
                    strokeWidth={2}
                    dot={{ fill: "#3f3f46", r: 3 }}
                    isAnimationActive={false}
                  />
                  {/* Dynamic Glowing Operating Point that moves with the Cutoff Score Slider */}
                  <ReferenceDot
                    x={metrics.recall}
                    y={metrics.precision}
                    r={7}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                  />
                </LineChart>
              ) : (
                /* Mode 2: Threshold Sensitivity Dual-Curve (Cutoff on X-axis) */
                <LineChart data={thresholdSeries} margin={{ top: 10, right: 25, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222226" />
                  <XAxis
                    dataKey="cutoffScore"
                    label={{ value: "Risk Cutoff Score (0 to 100)", position: "insideBottom", offset: -5, fill: "#a1a1aa", fontSize: 10 }}
                    stroke="#71717a"
                    fontSize={10}
                  />
                  <YAxis
                    domain={[40, 100]}
                    tickFormatter={(v) => `${v}%`}
                    label={{ value: "% Metric", angle: -90, position: "insideLeft", fill: "#a1a1aa", fontSize: 10 }}
                    stroke="#71717a"
                    fontSize={10}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-[#27272a] bg-[#0e0e11] p-3 text-xs text-white shadow-xl space-y-1">
                            <div className="font-bold text-amber-400">Cutoff Score: {data.cutoffScore}/100</div>
                            <div className="text-emerald-400 font-mono">Fraud Catch (Recall): {data.recall}%</div>
                            <div className="text-sky-400 font-mono">Precision: {data.precision}%</div>
                            <div className="text-zinc-400 font-mono">TP: {data.TP} | FP: {data.FP}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Moving Vertical Scanner Line tracking Cutoff Score */}
                  <ReferenceLine
                    x={Math.round(selectedThreshold * 100)}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                  />
                  {/* Recall Curve (Green) */}
                  <Line
                    type="monotone"
                    dataKey="recall"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                    name="Fraud Catch (Recall)"
                    isAnimationActive={false}
                  />
                  {/* Precision Curve (Sky Blue) */}
                  <Line
                    type="monotone"
                    dataKey="precision"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    dot={false}
                    name="Precision"
                    isAnimationActive={false}
                  />
                  {/* Dynamic Dot on Recall */}
                  <ReferenceDot
                    x={Math.round(selectedThreshold * 100)}
                    y={Number((metrics.recall * 100).toFixed(1))}
                    r={6}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                  {/* Dynamic Dot on Precision */}
                  <ReferenceDot
                    x={Math.round(selectedThreshold * 100)}
                    y={Number((metrics.precision * 100).toFixed(1))}
                    r={6}
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>

            {/* Live Chart Legend Callout */}
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-3 py-1.5 bg-[#121216] rounded-lg border border-[#222226] mt-2">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Point: Cutoff {(selectedThreshold * 100).toFixed(0)}/100
              </span>
              <span className="text-emerald-400">
                Recall: {(metrics.recall * 100).toFixed(1)}%
              </span>
              <span className="text-sky-400">
                Precision: {(metrics.precision * 100).toFixed(1)}%
              </span>
              <span className="text-amber-400 hidden sm:inline">
                Est. Savings: ₹{metrics.costTradeoff.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Confusion Matrix (5 cols) - Updates dynamically in real time */}
        <div className="lg:col-span-5 rounded-2xl border border-[#222226] bg-[#0d0d10] p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#222226] pb-3">
            <div>
              <h4 className="text-sm font-bold text-white">
                Validation Confusion Matrix
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Breakdown on 10,000 test transactions
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              Cutoff: {(selectedThreshold * 100).toFixed(0)}
            </span>
          </div>

          {/* 2x2 Grid of TP, FP, FN, TN */}
          <div className="grid grid-cols-2 gap-3">
            {/* True Positives */}
            <div
              onClick={() => setActiveMatrixQuadrant("TP")}
              className={`rounded-xl border p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] ${
                activeMatrixQuadrant === "TP"
                  ? "border-emerald-500/70 bg-emerald-950/40 ring-1 ring-emerald-500/30 shadow-emerald-950/20"
                  : "border-[#222226] bg-[#121215] hover:border-emerald-500/50 hover:bg-[#151a17]"
              }`}
            >
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                True Positives (TP)
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1 transition-all">
                {metrics.TP}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">Fraud intercepted</div>
            </div>

            {/* False Positives */}
            <div
              onClick={() => setActiveMatrixQuadrant("FP")}
              className={`rounded-xl border p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] ${
                activeMatrixQuadrant === "FP"
                  ? "border-amber-500/70 bg-amber-950/40 ring-1 ring-amber-500/30 shadow-amber-950/20"
                  : "border-[#222226] bg-[#121215] hover:border-amber-500/50 hover:bg-[#1a1714]"
              }`}
            >
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                False Positives (FP)
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1 transition-all">
                {metrics.FP}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">2FA OTP challenges</div>
            </div>

            {/* False Negatives */}
            <div
              onClick={() => setActiveMatrixQuadrant("FN")}
              className={`rounded-xl border p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] ${
                activeMatrixQuadrant === "FN"
                  ? "border-rose-500/70 bg-rose-950/40 ring-1 ring-rose-500/30 shadow-rose-950/20"
                  : "border-[#222226] bg-[#121215] hover:border-rose-500/50 hover:bg-[#1a1416]"
              }`}
            >
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                False Negatives (FN)
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1 transition-all">
                {metrics.FN}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                Slippage loss ({(metrics.FN / 2).toFixed(1)}%)
              </div>
            </div>

            {/* True Negatives */}
            <div
              onClick={() => setActiveMatrixQuadrant("TN")}
              className={`rounded-xl border p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] ${
                activeMatrixQuadrant === "TN"
                  ? "border-zinc-500/70 bg-[#18181c] ring-1 ring-zinc-500/30 shadow-zinc-950/20"
                  : "border-[#222226] bg-[#121215] hover:border-zinc-500/50 hover:bg-[#18181c]"
              }`}
            >
              <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                True Negatives (TN)
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1 transition-all">
                {metrics.TN.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">Safe orders passed</div>
            </div>
          </div>

          {/* Dynamic Context Box */}
          <div className="rounded-xl border border-[#222226] bg-[#141418] p-3.5 text-xs space-y-1.5">
            <div className="text-zinc-300 leading-relaxed min-h-[36px]">
              {activeMatrixQuadrant === "TP" && (
                <span>
                  <strong>{metrics.TP}</strong> fraud attacks intercepted with an estimated{" "}
                  <strong>₹{(metrics.estimatedFraudPreventedINR / 10000000).toFixed(2)} Crore</strong> in disputed chargebacks prevented.
                </span>
              )}
              {activeMatrixQuadrant === "FP" && (
                <span>
                  <strong>{metrics.FP}</strong> false alarms challenged with 3DS step-up OTP friction (cost impact: ~₹{metrics.frictionCostINR.toLocaleString("en-IN")}).
                </span>
              )}
              {activeMatrixQuadrant === "FN" && (
                <span>
                  <strong>{metrics.FN}</strong> micro-slippage attacks fell below the {Math.round(selectedThreshold * 100)} cutoff, monitored by secondary velocity rules.
                </span>
              )}
              {activeMatrixQuadrant === "TN" && (
                <span>
                  <strong>{metrics.TN.toLocaleString("en-IN")}</strong> safe consumer purchases approved with zero friction in 32ms average latency.
                </span>
              )}
            </div>
            <div className="flex justify-between border-t border-[#222226] pt-2 text-zinc-400">
              <span>Overall F1 Score:</span>
              <span className="font-mono font-bold text-white">{metrics.f1Score.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Global Feature Importance & Hourly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl border border-[#222226] bg-[#0d0d10] p-5 space-y-4">
          <div className="border-b border-[#222226] pb-3">
            <h4 className="text-sm font-bold text-white">
              Global Feature Importance (TreeSHAP)
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#222226" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={10} />
                <YAxis
                  dataKey="feature"
                  type="category"
                  stroke="#a1a1aa"
                  fontSize={10}
                  width={140}
                  tick={{ fill: "#d4d4d8" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-[#27272a] bg-[#0e0e11] p-2.5 text-xs text-white shadow-xl">
                          <div className="font-semibold text-zinc-200">{data.feature}</div>
                          <div className="font-mono text-zinc-300 mt-1">Mean SHAP Impact: {data.meanAbsShap}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="meanAbsShap" fill="#a1a1aa" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-[#222226] bg-[#0d0d10] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222226] pb-3">
            <div>
              <h4 className="text-sm font-bold text-white">
                Hourly Ingestion Traffic by Category
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Green = Approved, Yellow = 2FA Review, Red = Blocked
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-[#141418] px-2 py-0.5 rounded border border-[#222226]">
              Threshold: {(selectedThreshold * 100).toFixed(0)}
            </span>
          </div>

          {/* Dynamic Hourly Ingestion Traffic Chart responding to Cutoff Threshold */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicHourlyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222226" />
                <XAxis dataKey="time" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={10} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-[#27272a] bg-[#0e0e11] p-2.5 text-xs text-white shadow-xl space-y-1">
                          <div className="font-bold text-zinc-300">{label}</div>
                          <div className="text-emerald-400">Approved: {payload[0]?.value}</div>
                          <div className="text-amber-400">2FA Challenge: {payload[1]?.value}</div>
                          <div className="text-rose-400">Blocked: {payload[2]?.value}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="lowRisk" stroke="#10b981" fill="#10b981" fillOpacity={0.2} isAnimationActive={false} />
                <Area type="monotone" dataKey="medRisk" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} isAnimationActive={false} />
                <Area type="monotone" dataKey="highRisk" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

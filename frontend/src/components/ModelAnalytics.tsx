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
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Cpu,
  BarChart2,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Scale,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const ModelAnalytics: React.FC = () => {
  const [selectedThreshold, setSelectedThreshold] = useState<number>(0.70);

  return (
    <div className="space-y-6">
      {/* Abstract Concept Banner: Why Class Imbalance Matters */}
      <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                Class-Imbalance Strategy & Precision-Recall Optimization
              </h3>
              <span className="rounded bg-indigo-900/60 border border-indigo-700/60 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                PR-AUC: 96.1%
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Because fraudulent transactions represent &lt;1% of total banking volume, standard <span className="text-rose-400 font-semibold">accuracy is misleading</span> (a dumb model predicting all legitimate transactions achieves 99% accuracy but catches 0 fraud!). RiskGuard uses <span className="text-cyan-300 font-semibold">weighted focal loss + PR-AUC threshold tuning</span> to minimize false declines while catching 96.8% of attacks.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-center min-w-[180px]">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Fraud Intercepted</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">₹1.68 Crore</div>
            <div className="text-[10px] text-slate-500">Across 10k validation cohort</div>
          </div>
        </div>
      </div>

      {/* Row 1: Precision-Recall Curve & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Precision-Recall Curve (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Precision-Recall Trade-off Curve
              </h4>
              <p className="text-xs text-slate-400">
                Calibrated decision boundary tuning against class-imbalance
              </p>
            </div>
            <span className="rounded bg-slate-800 px-2.5 py-1 text-[11px] font-mono text-emerald-400">
              Optimal Cutoff: 0.70
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prCurveData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
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
                        <div className="rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-white shadow-xl">
                          <div className="font-bold text-indigo-400 mb-1">
                            Threshold: {data.threshold} {data.isOptimal && "(⭐ Calibrated Optimal)"}
                          </div>
                          <div>Precision: {(data.precision * 100).toFixed(1)}%</div>
                          <div>Recall: {(data.recall * 100).toFixed(1)}%</div>
                          <div className="text-amber-400 font-mono mt-1">
                            Trade-off Error Cost: ₹{data.costTradeoff.toLocaleString("en-IN")}
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
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: "#6366f1", r: 4 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>• High Threshold (0.90): Low false alarms, but misses sneaky fraud</span>
            <span className="text-cyan-400 font-semibold">• 0.70 Threshold: Balances 94.2% Precision with 96.8% Recall</span>
          </div>
        </div>

        {/* Confusion Matrix & Business Impact (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3 mb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-indigo-400" />
              Confusion Matrix & Financial Impact
            </h4>
            <p className="text-xs text-slate-400">
              Evaluated on 10,000 transaction test cohort with 2% fraud rate
            </p>
          </div>

          {/* Matrix 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2 my-2">
            {/* True Positive */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3">
              <div className="text-[10px] uppercase font-semibold text-emerald-400">
                True Positives (TP)
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {confusionMatrixData.truePositive}
              </div>
              <div className="text-[10px] text-emerald-300/80">
                Fraud Correctly Intercepted
              </div>
            </div>

            {/* False Positive (False Decline) */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3">
              <div className="text-[10px] uppercase font-semibold text-amber-400">
                False Positives (FP)
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {confusionMatrixData.falsePositive}
              </div>
              <div className="text-[10px] text-amber-300/80">
                Legitimate Step-Up Challenges
              </div>
            </div>

            {/* False Negative (Slippage) */}
            <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-3">
              <div className="text-[10px] uppercase font-semibold text-rose-400">
                False Negatives (FN)
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {confusionMatrixData.falseNegative}
              </div>
              <div className="text-[10px] text-rose-300/80">
                Missed Fraud (Only 0.06%)
              </div>
            </div>

            {/* True Negative */}
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3">
              <div className="text-[10px] uppercase font-semibold text-cyan-400">
                True Negatives (TN)
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {confusionMatrixData.trueNegative}
              </div>
              <div className="text-[10px] text-cyan-300/80">
                Smooth Genuine Approvals
              </div>
            </div>
          </div>

          {/* Key Summary Pill */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Precision:</span>
              <span className="font-mono font-bold text-white">94.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recall (Sensitivity):</span>
              <span className="font-mono font-bold text-emerald-400">96.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">F1 Balance Score:</span>
              <span className="font-mono font-bold text-cyan-400">0.955</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Global SHAP Importance & Volume by Tier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Global SHAP Feature Importance (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-400" />
                Global SHAP Feature Importance (Mean |SHAP Value|)
              </h4>
              <p className="text-xs text-slate-400">
                Top predictors weighted across 250,000 XGBoost decision trees
              </p>
            </div>
            <span className="text-[11px] font-mono text-purple-300 bg-purple-950/50 border border-purple-800/40 px-2 py-0.5 rounded">
              TreeSHAP
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={shapGlobalImportance}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis
                  dataKey="feature"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={10}
                  width={130}
                  tick={{ fill: "#cbd5e1" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white shadow-xl">
                          <div className="font-semibold text-indigo-300">{data.feature}</div>
                          <div className="font-mono text-amber-400 mt-1">
                            Mean |SHAP| Impact: {data.meanAbsShap} pts
                          </div>
                          <div className="text-[10px] text-slate-400 capitalize">Category: {data.type}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="meanAbsShap" fill="#818cf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Volume & Tier Distribution (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-emerald-400" />
                Hourly Traffic by Risk Tier
              </h4>
              <p className="text-xs text-slate-400">
                Low (Auto-Approved) vs Medium (OTP) vs High (Blocked)
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white shadow-xl space-y-1">
                          <div className="font-bold text-slate-300 font-mono">{label}</div>
                          <div className="text-emerald-400">Low Risk: {payload[0]?.value}</div>
                          <div className="text-amber-400">Medium (OTP): {payload[1]?.value}</div>
                          <div className="text-rose-400">High Risk (Blocked): {payload[2]?.value}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="lowRisk" stroke="#10b981" fillOpacity={1} fill="url(#colorLow)" />
                <Area type="monotone" dataKey="medRisk" stroke="#f59e0b" fillOpacity={1} fill="url(#colorMed)" />
                <Area type="monotone" dataKey="highRisk" stroke="#ef4444" fillOpacity={1} fill="url(#colorHigh)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

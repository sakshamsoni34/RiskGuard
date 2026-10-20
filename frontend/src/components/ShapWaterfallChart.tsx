"use client";

import React, { useState } from "react";
import { ShapValue } from "@/types/fraud";
import { Info, ArrowRight, TrendingUp, TrendingDown, HelpCircle } from "lucide-react";

interface ShapWaterfallChartProps {
  shapValues: ShapValue[];
  baseScore?: number;
  finalScore: number;
}

export const ShapWaterfallChart: React.FC<ShapWaterfallChartProps> = ({
  shapValues,
  baseScore = 14,
  finalScore,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute waterfall running coordinates
  let runningScore = baseScore;
  const waterfallSteps = shapValues.map((item) => {
    const start = runningScore;
    runningScore = Math.max(0, Math.min(100, runningScore + item.contribution));
    const end = runningScore;
    return {
      ...item,
      start,
      end,
    };
  });

  return (
    <div className="rounded-xl border border-[#222226] bg-[#0d0d10] p-4.5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#222226] gap-2">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-[#18181c] border border-[#27272a] flex items-center justify-center text-zinc-300">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              TreeSHAP Additive Attribution Waterfall
            </h4>
            <p className="text-[11px] text-zinc-400">
              Decomposing model prediction from population baseline E[f(x)] to transaction risk score
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-zinc-500" />
            <span>Base: {baseScore}</span>
          </div>
          <ArrowRight className="h-3 w-3 text-zinc-600" />
          <div className="flex items-center gap-1.5 font-bold text-white">
            <span
              className={`h-2 w-2 rounded-full ${
                finalScore >= 70 ? "bg-rose-400" : finalScore >= 35 ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
            <span>Score: {finalScore}/100</span>
          </div>
        </div>
      </div>

      {/* Waterfall Visual Bars */}
      <div className="space-y-2.5">
        {/* Baseline anchor */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono bg-[#121215] px-3 py-1.5 rounded-lg border border-[#222226]">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
            Population Expectation E[f(X)]
          </span>
          <span className="font-semibold text-zinc-300">+{baseScore} pts</span>
        </div>

        {/* Dynamic feature bars */}
        {waterfallSteps.map((step, idx) => {
          const isIncrease = step.direction === "increase";
          const barWidthPercent = Math.min(100, Math.max(8, Math.abs(step.contribution) * 2.2));
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`rounded-lg border p-2.5 transition-all cursor-pointer ${
                isHovered
                  ? isIncrease
                    ? "border-rose-500/60 bg-rose-950/30 shadow-md shadow-rose-950/20"
                    : "border-emerald-500/60 bg-emerald-950/30 shadow-md shadow-emerald-950/20"
                  : "border-[#242429] bg-[#121215] hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                <div className="flex items-center gap-2 truncate">
                  {isIncrease ? (
                    <TrendingUp className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  )}
                  <span className="font-semibold text-zinc-200 truncate">{step.feature}</span>
                  <span className="text-[11px] font-mono text-zinc-400 truncate">({step.rawValue})</span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                      isIncrease
                        ? "bg-rose-950/80 text-rose-300 border-rose-800/40"
                        : "bg-emerald-950/80 text-emerald-300 border-emerald-800/40"
                    }`}
                  >
                    {isIncrease ? `+${step.contribution}` : `${step.contribution}`} pts
                  </span>
                </div>
              </div>

              {/* Graphical bar indicator */}
              <div className="w-full bg-[#1f1f24] rounded-full h-1.5 overflow-hidden flex items-center">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isIncrease ? "bg-gradient-to-r from-rose-600 to-rose-400" : "bg-gradient-to-r from-emerald-600 to-emerald-400"
                  }`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>

              {/* Attribution Context */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1.5">
                <span className="truncate pr-2">{step.description}</span>
                <span className="font-mono text-[10px] text-zinc-500 flex-shrink-0">
                  Subtotal: {step.end} pts
                </span>
              </div>
            </div>
          );
        })}

        {/* Final output anchor */}
        <div className="flex items-center justify-between text-xs font-mono bg-[#141418] px-3.5 py-2 rounded-lg border border-[#27272a] mt-2">
          <span className="font-semibold text-white">Aggregated Prediction f(X)</span>
          <span
            className={`font-bold text-sm ${
              finalScore >= 70 ? "text-rose-400" : finalScore >= 35 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {finalScore} / 100 ({finalScore >= 70 ? "HIGH RISK" : finalScore >= 35 ? "MEDIUM RISK" : "LOW RISK"})
          </span>
        </div>
      </div>
    </div>
  );
};

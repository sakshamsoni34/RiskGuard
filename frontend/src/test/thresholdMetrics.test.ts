import { describe, it, expect } from "vitest";
import { calculateMetricsForThreshold, generateThresholdSeriesData } from "@/lib/thresholdMetrics";

describe("Threshold Metrics Engine", () => {
  it("calculates exact production baseline metrics at threshold 0.70", () => {
    const metrics = calculateMetricsForThreshold(0.70);
    expect(metrics.TP).toBe(194);
    expect(metrics.FN).toBe(6);
    expect(metrics.FP).toBe(12);
    expect(metrics.TN).toBe(9788);
    expect(metrics.recall).toBeCloseTo(0.968, 3);
    expect(metrics.precision).toBeCloseTo(0.942, 3);
    expect(metrics.f1Score).toBeCloseTo(0.955, 3);
    expect(metrics.isOptimal).toBe(true);
  });

  it("decreases FP and increases FN when threshold increases to 0.90", () => {
    const base = calculateMetricsForThreshold(0.70);
    const strict = calculateMetricsForThreshold(0.90);

    // Stricter threshold means fewer false alarms, but more fraud missed (FN)
    expect(strict.FP).toBeLessThan(base.FP);
    expect(strict.FN).toBeGreaterThan(base.FN);
    expect(strict.TP).toBeLessThan(base.TP);
    expect(strict.TN).toBeGreaterThan(base.TN);
    expect(strict.precision).toBeGreaterThan(base.precision);
    expect(strict.recall).toBeLessThan(base.recall);
  });

  it("increases TP and increases FP when threshold decreases to 0.35", () => {
    const base = calculateMetricsForThreshold(0.70);
    const sensitive = calculateMetricsForThreshold(0.35);

    // More sensitive threshold catches more fraud (higher TP), but generates more false positives
    expect(sensitive.TP).toBeGreaterThan(base.TP);
    expect(sensitive.FP).toBeGreaterThan(base.FP);
    expect(sensitive.FN).toBeLessThan(base.FN);
    expect(sensitive.recall).toBeGreaterThan(base.recall);
    expect(sensitive.precision).toBeLessThan(base.precision);
  });

  it("maintains total population of 10,000 across all thresholds", () => {
    for (const t of [0.15, 0.30, 0.50, 0.70, 0.85, 0.95]) {
      const m = calculateMetricsForThreshold(t);
      expect(m.TP + m.FN).toBe(200);
      expect(m.FP + m.TN).toBe(9800);
      expect(m.TP + m.FP + m.FN + m.TN).toBe(10000);
    }
  });

  it("generates threshold series data correctly", () => {
    const series = generateThresholdSeriesData(9);
    expect(series).toHaveLength(9);
    expect(series[0].threshold).toBe(0.15);
    expect(series[8].threshold).toBe(0.95);
  });
});

/**
 * Descriptive statistics utilities.
 */

export function quantile(sorted: number[], p: number): number {
  if (!sorted.length) return NaN;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export interface DescriptiveStats {
  count: number;
  sum?: number;
  min?: number;
  p05?: number;
  mean?: number;
  median?: number;
  p95?: number;
  max?: number;
}

export function computeStats(values: number[]): DescriptiveStats {
  const n = values.length;
  if (!n) return { count: 0 };

  let sum = 0;
  let min = Infinity;
  let max = -Infinity;

  for (const v of values) {
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }

  const avg = sum / n;
  const sorted = [...values].sort((a, b) => a - b);

  return {
    count: n,
    sum,
    min,
    p05: quantile(sorted, 0.05),
    mean: avg,
    median: quantile(sorted, 0.5),
    p95: quantile(sorted, 0.95),
    max,
  };
}

import { describe, it, expect } from 'vitest';
import { quantile, mean, computeStats } from '../../src/lib/stats';

describe('quantile', () => {
  it('returns NaN for empty array', () => {
    expect(quantile([], 0.5)).toBeNaN();
  });

  it('returns exact value for single element', () => {
    expect(quantile([42], 0.5)).toBe(42);
  });

  it('computes median correctly', () => {
    expect(quantile([1, 2, 3, 4, 5], 0.5)).toBe(3);
  });

  it('interpolates between values', () => {
    expect(quantile([10, 20], 0.5)).toBe(15);
  });
});

describe('mean', () => {
  it('returns 0 for empty array', () => {
    expect(mean([])).toBe(0);
  });

  it('computes mean correctly', () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
  });
});

describe('computeStats', () => {
  it('returns count 0 for empty array', () => {
    expect(computeStats([])).toEqual({ count: 0 });
  });

  it('computes all stats for a dataset', () => {
    const values = [10, 20, 30, 40, 50];
    const stats = computeStats(values);
    expect(stats.count).toBe(5);
    expect(stats.sum).toBe(150);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(50);
    expect(stats.mean).toBe(30);
    expect(stats.median).toBe(30);
  });
});

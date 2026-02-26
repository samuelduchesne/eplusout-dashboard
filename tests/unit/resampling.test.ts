import { describe, it, expect } from 'vitest';
import {
  aggregateValues,
  resampleHourlyToMonthly,
  resampleHourlyToAnnual,
  resampleMonthlyToAnnual,
  resamplePoints,
} from '../../src/lib/resampling';

describe('aggregateValues', () => {
  it('returns 0 for empty array', () => {
    expect(aggregateValues([], 'sum')).toBe(0);
  });

  it('sums values', () => {
    expect(aggregateValues([1, 2, 3], 'sum')).toBe(6);
  });

  it('averages values', () => {
    expect(aggregateValues([10, 20, 30], 'avg')).toBe(20);
  });

  it('finds min', () => {
    expect(aggregateValues([10, 5, 20], 'min')).toBe(5);
  });

  it('finds max', () => {
    expect(aggregateValues([10, 5, 20], 'max')).toBe(20);
  });
});

describe('resampleHourlyToMonthly', () => {
  it('groups hourly points by month', () => {
    const points = [
      { x: Date.UTC(2000, 0, 1, 0), y: 10, env: 1, month: 1 },
      { x: Date.UTC(2000, 0, 1, 1), y: 20, env: 1, month: 1 },
      { x: Date.UTC(2000, 1, 1, 0), y: 30, env: 1, month: 2 },
    ];
    const result = resampleHourlyToMonthly(points, 'sum');
    expect(result).toHaveLength(2);
    expect(result[0].xLabel).toBe('E1-M01');
    expect(result[0].y).toBe(30);
    expect(result[1].xLabel).toBe('E1-M02');
    expect(result[1].y).toBe(30);
  });
});

describe('resampleHourlyToAnnual', () => {
  it('groups hourly points by environment', () => {
    const points = [
      { x: Date.UTC(2000, 0, 1), y: 10, env: 1, month: 1 },
      { x: Date.UTC(2000, 5, 1), y: 20, env: 1, month: 6 },
    ];
    const result = resampleHourlyToAnnual(points, 'sum');
    expect(result).toHaveLength(1);
    expect(result[0].xLabel).toBe('E1');
    expect(result[0].y).toBe(30);
  });
});

describe('resampleMonthlyToAnnual', () => {
  it('groups monthly points by environment from labels', () => {
    const points = [
      { xLabel: 'E1-M01', y: 10 },
      { xLabel: 'E1-M02', y: 20 },
    ];
    const result = resampleMonthlyToAnnual(points, 'sum');
    expect(result).toHaveLength(1);
    expect(result[0].xLabel).toBe('E1');
    expect(result[0].y).toBe(30);
  });
});

describe('resamplePoints', () => {
  it('returns points unchanged for same frequency', () => {
    const points = [{ y: 10 }];
    expect(resamplePoints(points, 'Hourly', 'Hourly', 'J')).toBe(points);
  });

  it('returns points unchanged for "original" target', () => {
    const points = [{ y: 10 }];
    expect(resamplePoints(points, 'Hourly', 'original', 'J')).toBe(points);
  });

  it('auto-detects sum for energy units', () => {
    const points = [
      { x: Date.UTC(2000, 0, 1), y: 100, env: 1, month: 1 },
      { x: Date.UTC(2000, 0, 2), y: 200, env: 1, month: 1 },
    ];
    const result = resamplePoints(points, 'Hourly', 'monthly', 'J');
    expect(result[0].y).toBe(300); // sum
  });

  it('auto-detects avg for non-energy units', () => {
    const points = [
      { x: Date.UTC(2000, 0, 1), y: 100, env: 1, month: 1 },
      { x: Date.UTC(2000, 0, 2), y: 200, env: 1, month: 1 },
    ];
    const result = resamplePoints(points, 'Hourly', 'monthly', 'C');
    expect(result[0].y).toBe(150); // avg
  });
});

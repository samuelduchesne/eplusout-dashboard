import { describe, it, expect } from 'vitest';
import {
  aggregateValues,
  resampleHourlyToMonthly,
  resampleHourlyToAnnual,
  resampleMonthlyToAnnual,
  resampleTimestepToHourly,
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

describe('resampleTimestepToHourly', () => {
  it('sums all 6 timesteps of EnergyPlus hour 0 (including the 01:00-stamped one) into one bucket', () => {
    // EnergyPlus reports timestep END times. The 6th timestep of "hour 0"
    // is recorded as hour=1, minute=0 — it must still group with the others.
    const points = [
      { x: Date.UTC(2000, 0, 1, 0, 10), y: 10, env: 1, month: 1, day: 1, hour: 0, minute: 10 },
      { x: Date.UTC(2000, 0, 1, 0, 20), y: 10, env: 1, month: 1, day: 1, hour: 0, minute: 20 },
      { x: Date.UTC(2000, 0, 1, 0, 30), y: 10, env: 1, month: 1, day: 1, hour: 0, minute: 30 },
      { x: Date.UTC(2000, 0, 1, 0, 40), y: 10, env: 1, month: 1, day: 1, hour: 0, minute: 40 },
      { x: Date.UTC(2000, 0, 1, 0, 50), y: 10, env: 1, month: 1, day: 1, hour: 0, minute: 50 },
      { x: Date.UTC(2000, 0, 1, 1, 0), y: 10, env: 1, month: 1, day: 1, hour: 1, minute: 0 },
      { x: Date.UTC(2000, 0, 1, 1, 10), y: 50, env: 1, month: 1, day: 1, hour: 1, minute: 10 },
    ];
    const result = resampleTimestepToHourly(points, 'sum');
    expect(result).toHaveLength(2);
    expect(result[0].y).toBe(60); // 6 × 10
    expect(result[0].x).toBe(Date.UTC(2000, 0, 1, 1, 0));
    expect(result[0].hour).toBe(1); // EnergyPlus 1..24 convention: hour 1 = end of first hour
    expect(result[0].day).toBe(1);
    expect(result[0].month).toBe(1);
    expect(result[1].y).toBe(50);
    expect(result[1].hour).toBe(2);
  });

  it('averages non-energy timestep values within the same hour', () => {
    const points = [
      { x: Date.UTC(2000, 0, 1, 0, 30), y: 20, env: 1, month: 1, day: 1, hour: 0 },
      { x: Date.UTC(2000, 0, 1, 1, 0), y: 22, env: 1, month: 1, day: 1, hour: 1 },
    ];
    const result = resampleTimestepToHourly(points, 'avg');
    expect(result).toHaveLength(1);
    expect(result[0].y).toBe(21);
  });
});

describe('resamplePoints', () => {
  it('routes Timestep → hourly through resampleTimestepToHourly', () => {
    const points = [
      { x: Date.UTC(2000, 0, 1, 0, 30), y: 100, env: 1, month: 1, day: 1, hour: 0 },
      { x: Date.UTC(2000, 0, 1, 1, 0), y: 200, env: 1, month: 1, day: 1, hour: 1 },
    ];
    const result = resamplePoints(points, 'Timestep', 'hourly', 'J');
    expect(result).toHaveLength(1);
    expect(result[0].y).toBe(300);
  });

  it('routes Timestep → monthly via Hourly so end-of-month boundary timesteps stay in the right month', () => {
    // Last timestep of Jan 31 is stamped as Feb 1, 00:00. It should still bucket into M01.
    const points = [
      { x: Date.UTC(2000, 0, 31, 23, 30), y: 5, env: 1, month: 1, day: 31, hour: 23 },
      { x: Date.UTC(2000, 1, 1, 0, 0), y: 7, env: 1, month: 2, day: 1, hour: 0 },
      { x: Date.UTC(2000, 1, 1, 0, 30), y: 9, env: 1, month: 2, day: 1, hour: 0 },
    ];
    const result = resamplePoints(points, 'Timestep', 'monthly', 'J');
    expect(result).toHaveLength(2);
    expect(result[0].xLabel).toBe('E1-M01');
    expect(result[0].y).toBe(12); // 5 + 7 (Feb 1 00:00 belongs to Jan 31 hour 23)
    expect(result[1].xLabel).toBe('E1-M02');
    expect(result[1].y).toBe(9);
  });
});

describe('resamplePoints (hourly/monthly)', () => {
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

import { describe, it, expect } from 'vitest';
import {
  timeLabel,
  toHourlyPoints,
  toMonthlyPoints,
  toObjects,
} from '../../src/lib/data-transform';

describe('timeLabel', () => {
  it('formats a timestamp label', () => {
    const result = timeLabel({ value: 0, env: 1, month: 3, day: 15, hour: 14, minute: 30 });
    expect(result).toBe('Env 1 — 03/15 14:30');
  });

  it('pads single-digit values', () => {
    const result = timeLabel({ value: 0, env: 2, month: 1, day: 5, hour: 8, minute: 5 });
    expect(result).toBe('Env 2 — 01/05 08:05');
  });
});

describe('toHourlyPoints', () => {
  it('converts SQL rows to hourly time-series points', () => {
    const rows = [{ value: 42.5, env: 1, month: 6, day: 15, hour: 12, minute: 0 }];
    const result = toHourlyPoints(rows);
    expect(result).toHaveLength(1);
    expect(result[0].y).toBe(42.5);
    expect(result[0].env).toBe(1);
    expect(result[0].month).toBe(6);
    expect(typeof result[0].x).toBe('number');
  });
});

describe('toMonthlyPoints', () => {
  it('converts SQL rows to monthly points', () => {
    const rows = [{ value: 100, env: 1, month: 3 }];
    const result = toMonthlyPoints(rows);
    expect(result).toHaveLength(1);
    expect(result[0].xLabel).toBe('E1-M03');
    expect(result[0].y).toBe(100);
  });
});

describe('toObjects', () => {
  it('converts column+values format to objects', () => {
    const result = toObjects([
      {
        columns: ['id', 'name'],
        values: [
          [1, 'Alice'],
          [2, 'Bob'],
        ],
      },
    ]);
    expect(result).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
  });

  it('returns empty array for null/empty input', () => {
    expect(toObjects([])).toEqual([]);
    expect(toObjects([{}] as never)).toEqual([]);
  });
});

/**
 * Time-series resampling: hourly → monthly/annual, monthly → annual.
 */

export type AggregationMode = 'auto' | 'sum' | 'avg' | 'min' | 'max';

export interface TimePoint {
  x?: number;
  xLabel?: string;
  y: number;
  env?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  label?: string;
}

export function aggregateValues(values: number[], mode: string): number {
  if (!values || values.length === 0) return 0;
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    const n = Number(v) || 0;
    sum += n;
    if (n < min) min = n;
    if (n > max) max = n;
  }
  switch (mode) {
    case 'sum':
      return sum;
    case 'avg':
      return sum / values.length;
    case 'min':
      return min;
    case 'max':
      return max;
    default:
      return sum / values.length;
  }
}

export function resampleHourlyToMonthly(points: TimePoint[], aggregateFunc: string): TimePoint[] {
  const groups = new Map<string, { values: number[]; ord: number; firstX: number }>();
  for (const p of points) {
    const env = p.env || 1;
    const mm = String(p.month || 1).padStart(2, '0');
    const key = `E${env}-M${mm}`;
    let g = groups.get(key);
    if (!g) {
      g = { values: [], ord: (env - 1) * 12 + (parseInt(mm) - 1), firstX: p.x ?? 0 };
      groups.set(key, g);
    }
    g.values.push(p.y);
    if (p.x != null && p.x < g.firstX) g.firstX = p.x;
  }
  const entries = [...groups.entries()].sort((a, b) => {
    return (a[1].ord ?? a[1].firstX) - (b[1].ord ?? b[1].firstX);
  });
  return entries.map(([key, g]) => ({
    xLabel: key,
    y: aggregateValues(g.values, aggregateFunc),
    x: g.firstX,
  }));
}

export function resampleHourlyToAnnual(points: TimePoint[], aggregateFunc: string): TimePoint[] {
  const groups = new Map<string, { values: number[]; ord: number; firstX: number }>();
  for (const p of points) {
    const env = p.env || 1;
    const key = `E${env}`;
    let g = groups.get(key);
    if (!g) {
      g = { values: [], ord: env - 1, firstX: p.x ?? 0 };
      groups.set(key, g);
    }
    g.values.push(p.y);
    if (p.x != null && p.x < g.firstX) g.firstX = p.x;
  }
  const entries = [...groups.entries()].sort((a, b) => (a[1].ord ?? 0) - (b[1].ord ?? 0));
  return entries.map(([key, g]) => ({
    xLabel: key,
    y: aggregateValues(g.values, aggregateFunc),
    x: g.firstX,
  }));
}

export function resampleMonthlyToAnnual(points: TimePoint[], aggregateFunc: string): TimePoint[] {
  const groups = new Map<string, { values: number[]; ord: number }>();
  for (const p of points) {
    let env = p.env;
    if (!env) {
      const match = p.xLabel?.match(/E(\d+)-M(\d+)/);
      if (!match) continue;
      env = Number(match[1]) || 1;
    }
    const key = `E${env}`;
    let g = groups.get(key);
    if (!g) {
      g = { values: [], ord: env - 1 };
      groups.set(key, g);
    }
    g.values.push(p.y);
  }
  const entries = [...groups.entries()].sort((a, b) => (a[1].ord ?? 0) - (b[1].ord ?? 0));
  return entries.map(([key, g]) => ({
    xLabel: key,
    y: aggregateValues(g.values, aggregateFunc),
  }));
}

/**
 * Resample time-series points to a different frequency.
 * @param units - Original unit string, used for auto-detecting aggregation mode
 */
export function resamplePoints(
  points: TimePoint[],
  fromFreq: string,
  toFreq: string,
  units: string,
  aggMode: AggregationMode = 'auto',
): TimePoint[] {
  if (fromFreq === toFreq || toFreq === 'original') return points;
  if (!points || points.length === 0) return points;

  let aggregateFunc: string = aggMode;
  if (!aggregateFunc || aggregateFunc === 'auto') {
    const isEnergy =
      units &&
      (units.toLowerCase().includes('j') ||
        units.toLowerCase().includes('wh') ||
        units.toLowerCase().includes('btu'));
    aggregateFunc = isEnergy ? 'sum' : 'avg';
  }

  if (fromFreq === 'Hourly') {
    if (toFreq === 'monthly') return resampleHourlyToMonthly(points, aggregateFunc);
    if (toFreq === 'annual') return resampleHourlyToAnnual(points, aggregateFunc);
  } else if (fromFreq === 'Monthly') {
    if (toFreq === 'annual') return resampleMonthlyToAnnual(points, aggregateFunc);
  }

  return points;
}

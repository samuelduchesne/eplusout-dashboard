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

const HOUR_MS = 3600000;

export function resampleTimestepToHourly(points: TimePoint[], aggregateFunc: string): TimePoint[] {
  // EnergyPlus timestamps mark the END of each interval, so the 6th timestep
  // of "hour 0" shows up as hour=1, minute=0. Subtracting 1ms before flooring
  // moves the exact hour boundary into the preceding hour, so all timesteps
  // ending between 00:00+ε and 01:00 inclusive bucket together.
  const groups = new Map<number, { values: number[]; env: number; endX: number }>();
  for (const p of points) {
    const x = p.x ?? 0;
    const hourStartMs = Math.floor((x - 1) / HOUR_MS) * HOUR_MS;
    let g = groups.get(hourStartMs);
    if (!g) {
      g = { values: [], env: p.env || 1, endX: hourStartMs + HOUR_MS };
      groups.set(hourStartMs, g);
    }
    g.values.push(p.y);
  }
  const entries = [...groups.values()].sort((a, b) => a.endX - b.endX);
  return entries.map((g) => {
    // Derive month/day from a moment safely inside the bucket so the last hour
    // of a day stays attributed to that day. Hour is reported as 1..24 to match
    // EnergyPlus's end-of-interval convention used by resampleHourlyToMonthly.
    const dInside = new Date(g.endX - 1);
    return {
      x: g.endX,
      y: aggregateValues(g.values, aggregateFunc),
      env: g.env,
      month: dInside.getUTCMonth() + 1,
      day: dInside.getUTCDate(),
      hour: dInside.getUTCHours() + 1,
      minute: 0,
    };
  });
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

  if (fromFreq === 'Timestep') {
    // Cascade through Hourly so the end-of-interval correction applied in
    // resampleTimestepToHourly also fixes month/day boundaries for coarser targets.
    const hourly = resampleTimestepToHourly(points, aggregateFunc);
    if (toFreq === 'hourly') return hourly;
    if (toFreq === 'monthly') return resampleHourlyToMonthly(hourly, aggregateFunc);
    if (toFreq === 'annual') return resampleHourlyToAnnual(hourly, aggregateFunc);
  } else if (fromFreq === 'Hourly') {
    if (toFreq === 'monthly') return resampleHourlyToMonthly(points, aggregateFunc);
    if (toFreq === 'annual') return resampleHourlyToAnnual(points, aggregateFunc);
  } else if (fromFreq === 'Monthly') {
    if (toFreq === 'annual') return resampleMonthlyToAnnual(points, aggregateFunc);
  }

  return points;
}

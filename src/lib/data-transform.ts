/**
 * Transforms raw SQL query rows into typed time-series data points.
 */

export interface SqlRow {
  value: number;
  env?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  [key: string]: unknown;
}

export interface HourlyPoint {
  x: number;
  y: number;
  label: string;
  env: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export interface MonthlyPoint {
  xLabel: string;
  y: number;
}

/** Format a timestamp label from a SQL row's date/time fields. */
export function timeLabel(r: SqlRow): string {
  const hh = String(r.hour ?? 0).padStart(2, '0');
  const mm = String(r.minute ?? 0).padStart(2, '0');
  const md = `${String(r.month || 1).padStart(2, '0')}/${String(r.day || 1).padStart(2, '0')}`;
  return `Env ${r.env} — ${md} ${hh}:${mm}`;
}

/** Convert SQL rows to hourly time-series points with UTC timestamps. */
export function toHourlyPoints(rows: SqlRow[]): HourlyPoint[] {
  const year = 2000;
  return rows.map((r) => ({
    x: Date.UTC(
      year + (r.env || 0) - 1,
      (r.month || 1) - 1,
      r.day || 1,
      r.hour || 0,
      r.minute || 0,
    ),
    y: Number(r.value),
    label: timeLabel(r),
    env: r.env || 1,
    month: r.month || 1,
    day: r.day || 1,
    hour: r.hour || 0,
    minute: r.minute || 0,
  }));
}

/** Convert SQL rows to monthly time-series points with environment-month labels. */
export function toMonthlyPoints(rows: SqlRow[]): MonthlyPoint[] {
  return rows.map((r) => ({
    xLabel: `E${r.env}-M${String(r.month || 1).padStart(2, '0')}`,
    y: Number(r.value),
  }));
}

export interface SqlJsResultSet {
  columns?: string[];
  lc?: string[];
  values?: unknown[][];
}

/**
 * Convert sql.js result sets to an array of plain objects.
 * Handles both standard {columns, values} and legacy {lc, values} formats.
 */
export function toObjects(result: SqlJsResultSet[]): Record<string, unknown>[] {
  if (!Array.isArray(result) || !result[0]) return [];
  const first = result[0];
  const cols = Array.isArray(first.columns)
    ? first.columns
    : Array.isArray(first.lc)
      ? first.lc
      : [];
  const rows = Array.isArray(first.values) ? first.values : [];
  if (!cols.length || !rows.length) return [];
  return rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (let i = 0; i < cols.length; i++) {
      out[cols[i]] = Array.isArray(row) ? row[i] : undefined;
    }
    return out;
  });
}

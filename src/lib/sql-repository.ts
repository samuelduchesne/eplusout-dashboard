/**
 * SQL.js database operations for EnergyPlus output files.
 */

import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import type { Database as SqlJsDatabase } from 'sql.js';
import { DataLoadError, QueryError } from '../services/errors';
import { toObjects } from './data-transform';

let sqlModule: Awaited<ReturnType<typeof initSqlJs>> | null = null;

/** Lazy-load and cache the SQL.js WASM module. */
export async function ensureSql(): Promise<Awaited<ReturnType<typeof initSqlJs>>> {
  if (!sqlModule) {
    sqlModule = await initSqlJs({ locateFile: () => sqlWasmUrl });
  }
  return sqlModule;
}

/** Load a database from a File object. */
export async function readDbFile(file: File): Promise<SqlJsDatabase> {
  try {
    const SQLMod = await ensureSql();
    const u8 = new Uint8Array(await file.arrayBuffer());
    return new SQLMod.Database(u8);
  } catch (error) {
    throw new DataLoadError('Failed to load local database file', {
      fileName: file?.name,
      error,
    });
  }
}

/** Load a database from a URL. */
export async function readDbUrl(url: string): Promise<SqlJsDatabase> {
  try {
    const SQLMod = await ensureSql();
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch database: ' + url);
    const u8 = new Uint8Array(await res.arrayBuffer());
    return new SQLMod.Database(u8);
  } catch (error) {
    throw new DataLoadError('Failed to load database from URL', { url, error });
  }
}

export interface DictionaryRow {
  id: number;
  IsMeter: number;
  Type: string;
  IndexGroup: string;
  key: string;
  Name: string;
  freq: string;
  Units: string;
}

/** Query the report data dictionary table. */
export function queryDictionary(db: SqlJsDatabase): DictionaryRow[] {
  try {
    const sql = `
      SELECT ReportDataDictionaryIndex AS id, IsMeter, Type, IndexGroup, KeyValue AS key,
             Name, ReportingFrequency AS freq, Units
      FROM ReportDataDictionary
      WHERE ReportingFrequency IN ('Hourly','Monthly')
      ORDER BY IsMeter DESC, IndexGroup, Name, key;`;
    return toObjects(db.exec(sql)) as unknown as DictionaryRow[];
  } catch (error) {
    throw new QueryError('Failed querying dictionary metadata', { error });
  }
}

export interface TimeSeriesRow {
  value: number;
  env: number;
  sday: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  interval: number;
  tindex: number;
}

/** Query time-series data for a specific dictionary entry. */
export function queryTimeSeries(db: SqlJsDatabase, dictId: number): TimeSeriesRow[] {
  try {
    const stmt = db.prepare(`
      SELECT rd.Value AS value, t.EnvironmentPeriodIndex AS env, t.SimulationDays AS sday,
             t.Month AS month, t.Day AS day, t.Hour AS hour, t.Minute AS minute,
             t.IntervalType AS interval, t.TimeIndex AS tindex
      FROM ReportData rd JOIN Time t ON t.TimeIndex = rd.TimeIndex
      WHERE rd.ReportDataDictionaryIndex = ?
      ORDER BY t.TimeIndex;`);
    stmt.bind([dictId]);
    const rows: TimeSeriesRow[] = [];
    while (stmt.step()) rows.push(stmt.getAsObject() as unknown as TimeSeriesRow);
    stmt.free();
    return rows;
  } catch (error) {
    throw new QueryError('Failed querying time series data', { dictId, error });
  }
}

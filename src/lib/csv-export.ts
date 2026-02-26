/**
 * CSV export for selected time-series data.
 */

import type { SeriesMeta } from '../types/domain';
import type { UnitPreferences } from './units';
import { convertUnits } from './units';

export interface SeriesForExport {
  meta: SeriesMeta;
  points: Array<{ x?: number; xLabel?: string; y: number }>;
}

/**
 * Generate CSV text from selected series, applying unit conversion.
 * @param seriesMap - Map of series ID to series data
 * @param baseFreq - Current frequency ('Hourly' or 'Monthly')
 * @param unitPrefs - Current unit preferences for value conversion
 */
export function exportCSV(
  seriesMap: Map<number, SeriesForExport>,
  baseFreq: string | null,
  unitPrefs: UnitPreferences,
): string {
  const header =
    baseFreq === 'Hourly'
      ? ['datetime_utc', 'value', 'series_id']
      : ['label', 'value', 'series_id'];
  const rows: string[] = [header.join(',')];

  seriesMap.forEach((v, id) => {
    const units = v.meta.Units || '';
    for (const d of v.points) {
      const val = convertUnits(d.y, units, unitPrefs);
      const x = Number.isFinite(d.x) ? new Date(d.x!).toISOString() : d.xLabel || '';
      rows.push(`${JSON.stringify(x)},${val},${id}`);
    }
  });

  return rows.join('\n');
}

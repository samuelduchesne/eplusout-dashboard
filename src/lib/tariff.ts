/**
 * Tariff cost computation for energy meters.
 */

import type { SeriesMeta } from '../types/domain';
import { toJoules } from './units';

export interface TariffRates {
  rateElec: number;
  rateDH: number;
  rateDC: number;
  demandRate: number;
}

export const DEFAULT_TARIFF_RATES: TariffRates = {
  rateElec: 0.1,
  rateDH: 0.06,
  rateDC: 0.08,
  demandRate: 12,
};

export type FuelKind = 'electricity' | 'districtheating' | 'districtcooling' | 'other';

export interface TariffCost {
  energy: number;
  demand: number;
  total: number;
  kind: FuelKind;
}

/** Classify a meter as electricity, district heating, district cooling, or other. */
export function getFuelKind(meta: SeriesMeta | undefined | null): FuelKind {
  if (!meta || meta.IsMeter !== 1) return 'other';
  const name = (meta.Name || '').toLowerCase();
  if (name.includes('electric')) return 'electricity';
  if (name.includes('districtheating') || name.includes('district heating'))
    return 'districtheating';
  if (name.includes('districtcooling') || name.includes('district cooling'))
    return 'districtcooling';
  return 'other';
}

export interface SeriesForTariff {
  meta: SeriesMeta;
  points: Array<{ x?: number; y: number }>;
}

/**
 * Compute tariff cost for a series. Returns null if computation is not possible
 * (e.g., non-hourly data, non-energy units, or unknown fuel kind).
 */
export function computeTariffCost(
  series: SeriesForTariff,
  rates: TariffRates,
  baseFreq: string | null,
): TariffCost | null {
  try {
    const pts = series.points;
    if (!pts.length || baseFreq !== 'Hourly') return null;

    const unit = series.meta.Units;
    const kind = getFuelKind(series.meta);
    let totalJ = 0;
    for (const p of pts) {
      const J = toJoules(p.y, unit);
      if (J == null) return null;
      totalJ += J;
    }
    const totalKWh = totalJ / 3.6e6;

    let energyRate = rates.rateElec;
    if (kind === 'electricity') energyRate = rates.rateElec;
    else if (kind === 'districtheating') energyRate = rates.rateDH;
    else if (kind === 'districtcooling') energyRate = rates.rateDC;
    const energyCost = totalKWh * energyRate;

    // Demand: compute peak kW per month
    const byMonth = new Map<string, { peak: number }>();
    pts.forEach((p) => {
      const date = new Date(p.x ?? 0);
      const m = date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1);
      const kW = (toJoules(p.y, unit) || 0) / 3.6e6;
      const cur = byMonth.get(m) || { peak: 0 };
      if (kW > cur.peak) cur.peak = kW;
      byMonth.set(m, cur);
    });

    let demandCost = 0;
    if (kind === 'electricity') {
      byMonth.forEach((v) => {
        demandCost += v.peak * rates.demandRate;
      });
    }

    return {
      energy: energyCost,
      demand: demandCost,
      total: energyCost + demandCost,
      kind,
    };
  } catch {
    return null;
  }
}

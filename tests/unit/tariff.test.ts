import { describe, it, expect } from 'vitest';
import { getFuelKind, computeTariffCost, DEFAULT_TARIFF_RATES } from '../../src/lib/tariff';
import type { SeriesMeta } from '../../src/types/domain';

describe('getFuelKind', () => {
  it('detects electricity meters', () => {
    expect(getFuelKind({ id: 1, Name: 'Electricity:Facility', IsMeter: 1 })).toBe('electricity');
  });

  it('detects district heating meters', () => {
    expect(getFuelKind({ id: 2, Name: 'DistrictHeating:Facility', IsMeter: 1 })).toBe(
      'districtheating',
    );
  });

  it('detects district cooling meters', () => {
    expect(getFuelKind({ id: 3, Name: 'DistrictCooling:Facility', IsMeter: 1 })).toBe(
      'districtcooling',
    );
  });

  it('returns other for non-meters', () => {
    expect(getFuelKind({ id: 4, Name: 'Zone Temperature', IsMeter: 0 })).toBe('other');
  });

  it('returns other for null', () => {
    expect(getFuelKind(null)).toBe('other');
  });
});

describe('computeTariffCost', () => {
  it('returns null for non-hourly data', () => {
    const series = {
      meta: { id: 1, Name: 'Electricity:Facility', IsMeter: 1, Units: 'J' } as SeriesMeta,
      points: [{ x: Date.UTC(2000, 0, 1), y: 3.6e6 }],
    };
    expect(computeTariffCost(series, DEFAULT_TARIFF_RATES, 'Monthly')).toBeNull();
  });

  it('computes energy cost for electricity meter', () => {
    // 1 kWh = 3.6e6 J, at $0.10/kWh = $0.10
    const series = {
      meta: { id: 1, Name: 'Electricity:Facility', IsMeter: 1, Units: 'J' } as SeriesMeta,
      points: [{ x: Date.UTC(2000, 0, 1, 1), y: 3.6e6 }],
    };
    const result = computeTariffCost(series, DEFAULT_TARIFF_RATES, 'Hourly');
    expect(result).not.toBeNull();
    expect(result!.kind).toBe('electricity');
    expect(result!.energy).toBeCloseTo(0.1);
  });
});

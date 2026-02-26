import { describe, it, expect } from 'vitest';
import {
  unitKind,
  toJoules,
  convertUnits,
  convertUnitLabel,
  DEFAULT_UNIT_PREFS,
} from '../../src/lib/units';
import type { UnitPreferences } from '../../src/lib/units';

describe('unitKind', () => {
  it('classifies energy units', () => {
    expect(unitKind('J')).toBe('energy');
    expect(unitKind('kWh')).toBe('energy');
    expect(unitKind('MWh')).toBe('energy');
    expect(unitKind('Wh')).toBe('energy');
  });

  it('classifies power units', () => {
    expect(unitKind('W')).toBe('power');
    expect(unitKind('Btu/h')).toBe('power');
  });

  it('classifies temperature units', () => {
    expect(unitKind('C')).toBe('temperature');
    expect(unitKind('K')).toBe('temperature');
    expect(unitKind('F')).toBe('temperature');
  });

  it('returns other for unknown', () => {
    expect(unitKind('m/s')).toBe('other');
    expect(unitKind(null)).toBe('other');
    expect(unitKind(undefined)).toBe('other');
  });
});

describe('toJoules', () => {
  it('converts kWh to J', () => {
    expect(toJoules(1, 'kWh')).toBe(3.6e6);
  });

  it('converts MWh to J', () => {
    expect(toJoules(1, 'MWh')).toBe(3.6e9);
  });

  it('passes through J values', () => {
    expect(toJoules(1000, 'J')).toBe(1000);
  });

  it('returns null for non-energy units', () => {
    expect(toJoules(100, 'W')).toBeNull();
  });
});

describe('convertUnits', () => {
  const siPrefs: UnitPreferences = { ...DEFAULT_UNIT_PREFS, isIP: false, energySI: 'kWh' };
  const ipPrefs: UnitPreferences = { ...DEFAULT_UNIT_PREFS, isIP: true, energyIP: 'kBTU' };

  it('converts J to kWh in SI mode', () => {
    const result = convertUnits(3.6e6, 'J', siPrefs);
    expect(result).toBeCloseTo(1.0);
  });

  it('converts C to F in IP mode', () => {
    const result = convertUnits(100, 'C', ipPrefs);
    expect(result).toBeCloseTo(212);
  });

  it('converts 0 C to 32 F', () => {
    const result = convertUnits(0, 'C', ipPrefs);
    expect(result).toBeCloseTo(32);
  });

  it('passes through non-convertible units', () => {
    expect(convertUnits(42, 'm/s', siPrefs)).toBe(42);
  });

  it('handles NaN/Infinity gracefully', () => {
    expect(convertUnits(NaN, 'J', siPrefs)).toBeNaN();
    expect(convertUnits(Infinity, 'J', siPrefs)).toBe(Infinity);
  });
});

describe('convertUnitLabel', () => {
  it('returns energy label for SI', () => {
    const prefs: UnitPreferences = { ...DEFAULT_UNIT_PREFS, isIP: false, energySI: 'kWh' };
    expect(convertUnitLabel('J', prefs)).toBe('kWh');
  });

  it('returns energy label for IP', () => {
    const prefs: UnitPreferences = { ...DEFAULT_UNIT_PREFS, isIP: true, energyIP: 'kBTU' };
    expect(convertUnitLabel('J', prefs)).toBe('kBTU');
  });

  it('converts C label to F in IP mode', () => {
    const prefs: UnitPreferences = { ...DEFAULT_UNIT_PREFS, isIP: true };
    expect(convertUnitLabel('C', prefs)).toBe('F');
  });
});

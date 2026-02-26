/**
 * Unit conversion system for SI/IP (metric/US customary) energy, power,
 * and temperature values. All functions accept explicit preferences
 * rather than relying on global/closure state.
 */

export type UnitKind = 'energy' | 'power' | 'temperature' | 'other';

export interface UnitPreferences {
  isIP: boolean;
  energySI: 'J' | 'kWh' | 'MWh';
  energyIP: 'BTU' | 'kBTU' | 'MMBTU';
  powerIP: 'Btu/h' | 'Tons';
  tempSI: 'C' | 'K';
  tempIP: 'F';
}

export const DEFAULT_UNIT_PREFS: UnitPreferences = {
  isIP: false,
  energySI: 'J',
  energyIP: 'kBTU',
  powerIP: 'Btu/h',
  tempSI: 'C',
  tempIP: 'F',
};

/** Classify a unit string as energy, power, temperature, or other. */
export function unitKind(units: string | undefined | null): UnitKind {
  if (!units) return 'other';
  const u = String(units).toLowerCase();
  if (
    u.includes('wh') ||
    u.includes('joule') ||
    u === 'j' ||
    u.includes('kwh') ||
    u.includes('mwh')
  )
    return 'energy';
  if (
    u.includes('btu/h') ||
    u.includes('btuh') ||
    /\bw(?!h)\b/.test(u) ||
    u.includes('watt') ||
    u.includes('ton')
  )
    return 'power';
  if (
    u === 'c' ||
    u.includes('celsius') ||
    u === 'k' ||
    u.includes('kelvin') ||
    u === 'f' ||
    u.includes('fahrenheit')
  )
    return 'temperature';
  return 'other';
}

/** Convert any energy value to Joules. Returns null if units not recognized. */
export function toJoules(value: number, units: string | undefined | null): number | null {
  const u = String(units || '').toLowerCase();
  if (u.includes('mwh')) return value * 3.6e9;
  if (u.includes('kwh')) return value * 3.6e6;
  if (u.includes('wh')) return value * 3600;
  if (u.includes('joule') || u === 'j') return value;
  return null;
}

/** Convert a value from its original units to the user's preferred display units. */
export function convertUnits(value: number, units: string, prefs: UnitPreferences): number {
  if (value == null || !isFinite(value)) return value;
  if (!units) return value;
  const kind = unitKind(units);

  if (prefs.isIP) {
    const u = String(units).toLowerCase();
    if (u === 'c' || u.includes('celsius')) return (value * 9) / 5 + 32;
    if (kind === 'energy') {
      let J = toJoules(value, units);
      if (J == null) J = value;
      const btu = J / 1055.06;
      if (prefs.energyIP === 'kBTU') return btu / 1e3;
      if (prefs.energyIP === 'MMBTU') return btu / 1e6;
      return btu;
    }
    if (kind === 'power') {
      let v = value;
      const ul = String(units).toLowerCase();
      if (ul.includes('w') && !ul.includes('wh')) v = value * 3.412141633;
      if (prefs.powerIP === 'Tons') return v / 12000;
      return v;
    }
    if (kind === 'temperature') {
      if (prefs.tempIP === 'F') {
        if (/c|celsius/.test(String(units).toLowerCase())) return (value * 9) / 5 + 32;
        if (/k|kelvin/.test(String(units).toLowerCase())) return ((value - 273.15) * 9) / 5 + 32;
      }
      return value;
    }
    return value;
  } else {
    if (kind === 'energy') {
      let J = toJoules(value, units);
      if (J == null) J = value;
      if (prefs.energySI === 'kWh') return J / 3.6e6;
      if (prefs.energySI === 'MWh') return J / 3.6e9;
      return J;
    }
    if (kind === 'temperature') {
      const ul = String(units).toLowerCase();
      let cVal: number;
      if (ul === 'c' || ul.includes('celsius')) cVal = value;
      else if (ul === 'k' || ul.includes('kelvin')) cVal = value - 273.15;
      else if (ul === 'f' || ul.includes('fahrenheit')) cVal = ((value - 32) * 5) / 9;
      else cVal = value;
      if (prefs.tempSI === 'K') return cVal + 273.15;
      return cVal;
    }
    return value;
  }
}

/** Get the display unit label for the current unit system. */
export function convertUnitLabel(units: string | undefined | null, prefs: UnitPreferences): string {
  if (!units) return units || '';
  const kind = unitKind(units);

  if (prefs.isIP) {
    const u = String(units).toLowerCase();
    if (u === 'c' || u.includes('celsius')) return 'F';
    if (kind === 'energy') return prefs.energyIP;
    if (kind === 'power') return prefs.powerIP === 'Tons' ? 'tons' : 'Btu/h';
    if (kind === 'temperature') return prefs.tempIP;
    return units || '';
  } else {
    if (kind === 'energy') return prefs.energySI;
    if (kind === 'temperature') return prefs.tempSI;
    return units || '';
  }
}

/** Get the display label for the opposite unit system (for dual-axis charts). */
export function convertUnitLabelOpposite(
  units: string | undefined | null,
  prefs: UnitPreferences,
): string {
  if (!units) return '';
  const kind = unitKind(units);
  if (prefs.isIP) {
    if (kind === 'energy') return prefs.energySI;
    if (kind === 'power') return 'W';
    if (kind === 'temperature') return prefs.tempSI;
  } else {
    if (kind === 'energy') return prefs.energyIP;
    if (kind === 'power') return prefs.powerIP === 'Tons' ? 'tons' : 'Btu/h';
    if (kind === 'temperature') return prefs.tempIP;
  }
  return '';
}

/**
 * Convert a displayed tick value (already in the current system)
 * to the opposite system. Used for dual-axis rendering.
 */
export function convertDisplayedToOpposite(
  v: number,
  origUnits: string,
  prefs: UnitPreferences,
): number {
  if (!isFinite(v)) return v;
  const kind = unitKind(origUnits);

  if (kind === 'energy') {
    if (prefs.isIP) {
      // IP → SI
      let J: number;
      if (prefs.energyIP === 'BTU') J = v * 1055.06;
      else if (prefs.energyIP === 'kBTU') J = v * 1000 * 1055.06;
      else if (prefs.energyIP === 'MMBTU') J = v * 1e6 * 1055.06;
      else J = v * 1055.06;
      if (prefs.energySI === 'J') return J;
      if (prefs.energySI === 'kWh') return J / 3.6e6;
      if (prefs.energySI === 'MWh') return J / 3.6e9;
      return J;
    } else {
      // SI → IP
      let J: number;
      if (prefs.energySI === 'J') J = v;
      else if (prefs.energySI === 'kWh') J = v * 3.6e6;
      else if (prefs.energySI === 'MWh') J = v * 3.6e9;
      else J = v;
      const BTU = J / 1055.06;
      if (prefs.energyIP === 'BTU') return BTU;
      if (prefs.energyIP === 'kBTU') return BTU / 1000;
      if (prefs.energyIP === 'MMBTU') return BTU / 1e6;
      return BTU;
    }
  }

  if (kind === 'power') {
    if (prefs.isIP) {
      // IP → SI (W)
      let Btuh: number;
      if (prefs.powerIP === 'Tons') Btuh = v * 12000;
      else Btuh = v;
      return Btuh * 0.29307107;
    } else {
      // SI → IP
      if (prefs.powerIP === 'Tons') return v / 0.29307107 / 12000;
      return v / 0.29307107;
    }
  }

  if (kind === 'temperature') {
    if (prefs.isIP) {
      // IP → SI
      let c: number;
      if (prefs.tempIP === 'F') c = ((v - 32) * 5) / 9;
      else c = v;
      if (prefs.tempSI === 'K') return c + 273.15;
      return c;
    } else {
      // SI → IP
      let c: number;
      if (prefs.tempSI === 'K') c = v - 273.15;
      else c = v;
      if (prefs.tempIP === 'F') return (c * 9) / 5 + 32;
      return c;
    }
  }

  return v;
}

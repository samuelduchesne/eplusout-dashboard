/**
 * Chart color schemes and palettes.
 */

export interface ChartColorScheme {
  axis: string;
  grid: string;
  tooltipBg: string;
  text: string;
  border: string;
  accent: string;
  accentStrong: string;
}

/** Get theme-aware chart colors. */
export function chartColors(isDark: boolean): ChartColorScheme {
  return isDark
    ? {
        axis: '#9fb0c3',
        grid: '#223042',
        tooltipBg: 'rgba(20,25,32,0.95)',
        text: '#e6eef7',
        border: '#223042',
        accent: '#2563eb',
        accentStrong: '#1d4ed8',
      }
    : {
        axis: '#334155',
        grid: 'rgb(229 231 235 / 1)',
        tooltipBg: 'rgba(255,255,255,0.98)',
        text: '#0b1220',
        border: '#e2e8f0',
        accent: '#2563eb',
        accentStrong: '#1d4ed8',
      };
}

/** 10-color palette for chart series. */
export const SERIES_PALETTE = [
  '#2563eb', // blue
  '#16a34a', // green
  '#9333ea', // purple
  '#dc2626', // red
  '#f59e0b', // amber
  '#0891b2', // cyan
  '#64748b', // slate
  '#4f46e5', // indigo
  '#059669', // emerald
  '#d946ef', // fuchsia
] as const;

/** Semantic color mapping for load balance categories. */
export const LOAD_BALANCE_COLORS: Record<string, string> = {
  heating: '#dc2626',
  cooling: '#2563eb',
  internal: '#f59e0b',
  solar: '#ea580c',
  infiltration_gain: '#f97316',
  infiltration_loss: '#0ea5e9',
  ventilation_gain: '#f43f5e',
  ventilation_loss: '#06b6d4',
  conduction_gain: '#7c3aed',
  conduction_loss: '#64748b',
  storage: '#9333ea',
};

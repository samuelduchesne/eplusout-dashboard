/**
 * Zustand store — centralized state management for the dashboard.
 *
 * Replaces the ~15 individual localStorage keys and closure variables
 * from the legacy App.ts with a single typed, persisted store.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Database as SqlJsDatabase } from 'sql.js';
import type { ViewMode, SeriesMeta } from '../types/domain';
import type { UnitPreferences } from '../lib/units';
import { DEFAULT_UNIT_PREFS } from '../lib/units';
import type { TariffRates } from '../lib/tariff';
import { DEFAULT_TARIFF_RATES } from '../lib/tariff';
import type { DictionaryRow } from '../lib/sql-repository';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface SelectedSeries {
  meta: SeriesMeta;
  points: Array<{
    x?: number;
    xLabel?: string;
    y: number;
    env?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    label?: string;
  }>;
  color: string;
  visible: boolean;
}

export type ResampleMode = 'original' | 'hourly' | 'monthly' | 'annual';
export type AggregationMode = 'auto' | 'sum' | 'avg' | 'max' | 'min';
export type Theme = 'light' | 'dark';

export interface DegreeDayConfig {
  enabled: boolean;
  baseTemp: number;
  period: 'daily' | 'monthly';
  mode: 'heating' | 'cooling' | 'both';
}

export interface ScatterConfig {
  pair: { x: number; y: number } | null;
  showRegression: boolean;
  degDay: DegreeDayConfig;
}

export interface TempResponseConfig {
  enabled: boolean;
  baseTemp: number;
  period: 'daily' | 'monthly';
  mode: 'heating' | 'cooling' | 'both';
  model: unknown | null;
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

export interface AppState {
  // Database
  db: SqlJsDatabase | null;
  dictionary: DictionaryRow[];
  isLoading: boolean;

  // Selection
  selected: Map<number, SelectedSeries>;
  baseFrequency: 'Hourly' | 'Monthly' | null;
  favorites: Set<number>;

  // View
  viewMode: ViewMode;
  resampleMode: ResampleMode;
  resampleAgg: AggregationMode;
  normalize: boolean;
  currentXDomain: [number, number] | null;
  scatter: ScatterConfig;
  tempResponse: TempResponseConfig;

  // Units
  unitPrefs: UnitPreferences;

  // Theme
  theme: Theme;

  // Crosshair
  hoverXMs: number | null;
  hoverBandKey: string | null;

  // Tariff
  tariffRates: TariffRates;

  // Actions — Database
  setDb: (db: SqlJsDatabase | null) => void;
  setDictionary: (dict: DictionaryRow[]) => void;
  setIsLoading: (loading: boolean) => void;

  // Actions — Selection
  setSelected: (selected: Map<number, SelectedSeries>) => void;
  addSeries: (id: number, series: SelectedSeries) => void;
  removeSeries: (id: number) => void;
  clearSelection: () => void;
  setBaseFrequency: (freq: 'Hourly' | 'Monthly' | null) => void;
  toggleFavorite: (id: number) => void;
  setFavorites: (favs: Set<number>) => void;
  toggleVisibility: (id: number) => void;

  // Actions — View
  setViewMode: (mode: ViewMode) => void;
  setResampleMode: (mode: ResampleMode) => void;
  setResampleAgg: (agg: AggregationMode) => void;
  setNormalize: (normalize: boolean) => void;
  setCurrentXDomain: (domain: [number, number] | null) => void;
  setScatter: (config: Partial<ScatterConfig>) => void;
  setTempResponse: (config: Partial<TempResponseConfig>) => void;

  // Actions — Units
  setUnitPrefs: (prefs: Partial<UnitPreferences>) => void;
  toggleUnitSystem: () => void;

  // Actions — Theme
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // Actions — Crosshair
  setHoverX: (ms: number | null) => void;
  setHoverBand: (key: string | null) => void;

  // Actions — Tariff
  setTariffRates: (rates: Partial<TariffRates>) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitialTheme(): Theme {
  try {
    const s = localStorage.getItem('eplus_theme');
    if (s === 'light' || s === 'dark') return s;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function getInitialIsIP(): boolean {
  try {
    return localStorage.getItem('eplus_units_mode') === 'IP';
  } catch {
    return false;
  }
}

function loadFavorites(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem('eplus_favs') || '[]'));
  } catch {
    return new Set();
  }
}

// ---------------------------------------------------------------------------
// Store creation
// ---------------------------------------------------------------------------

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ---- Initial state ----
      db: null,
      dictionary: [],
      isLoading: false,
      selected: new Map(),
      baseFrequency: null,
      favorites: loadFavorites(),
      viewMode: 'time' as ViewMode,
      resampleMode: 'original',
      resampleAgg: 'auto',
      normalize: false,
      currentXDomain: null,
      scatter: {
        pair: null,
        showRegression: true,
        degDay: { enabled: false, baseTemp: 18, period: 'daily', mode: 'both' },
      },
      tempResponse: {
        enabled: false,
        baseTemp: 18,
        period: 'daily',
        mode: 'both',
        model: null,
      },
      unitPrefs: { ...DEFAULT_UNIT_PREFS, isIP: getInitialIsIP() },
      theme: getInitialTheme(),
      hoverXMs: null,
      hoverBandKey: null,
      tariffRates: DEFAULT_TARIFF_RATES,

      // ---- Actions: Database ----
      setDb: (db) => set({ db }),
      setDictionary: (dictionary) => set({ dictionary }),
      setIsLoading: (isLoading) => set({ isLoading }),

      // ---- Actions: Selection ----
      setSelected: (selected) => set({ selected: new Map(selected) }),
      addSeries: (id, series) =>
        set((state) => {
          const next = new Map(state.selected);
          next.set(id, series);
          return { selected: next };
        }),
      removeSeries: (id) =>
        set((state) => {
          const next = new Map(state.selected);
          next.delete(id);
          return { selected: next };
        }),
      clearSelection: () => set({ selected: new Map(), baseFrequency: null }),
      setBaseFrequency: (baseFrequency) => set({ baseFrequency }),
      toggleFavorite: (id) =>
        set((state) => {
          const next = new Set(state.favorites);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { favorites: next };
        }),
      setFavorites: (favorites) => set({ favorites: new Set(favorites) }),
      toggleVisibility: (id) =>
        set((state) => {
          const next = new Map(state.selected);
          const s = next.get(id);
          if (s) next.set(id, { ...s, visible: !s.visible });
          return { selected: next };
        }),

      // ---- Actions: View ----
      setViewMode: (viewMode) => set({ viewMode }),
      setResampleMode: (resampleMode) => set({ resampleMode }),
      setResampleAgg: (resampleAgg) => set({ resampleAgg }),
      setNormalize: (normalize) => set({ normalize }),
      setCurrentXDomain: (currentXDomain) => set({ currentXDomain }),
      setScatter: (config) => set((state) => ({ scatter: { ...state.scatter, ...config } })),
      setTempResponse: (config) =>
        set((state) => ({ tempResponse: { ...state.tempResponse, ...config } })),

      // ---- Actions: Units ----
      setUnitPrefs: (prefs) => set((state) => ({ unitPrefs: { ...state.unitPrefs, ...prefs } })),
      toggleUnitSystem: () =>
        set((state) => ({
          unitPrefs: { ...state.unitPrefs, isIP: !state.unitPrefs.isIP },
        })),

      // ---- Actions: Theme ----
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          document.documentElement.classList.toggle('dark', next === 'dark');
          return { theme: next };
        }),

      // ---- Actions: Crosshair ----
      setHoverX: (hoverXMs) => set({ hoverXMs }),
      setHoverBand: (hoverBandKey) => set({ hoverBandKey }),

      // ---- Actions: Tariff ----
      setTariffRates: (rates) =>
        set((state) => ({ tariffRates: { ...state.tariffRates, ...rates } })),
    }),
    {
      name: 'eplusout-dashboard',
      // Only persist user preferences, not runtime state
      partialize: (state) => ({
        theme: state.theme,
        unitPrefs: state.unitPrefs,
        favorites: [...state.favorites],
        tariffRates: state.tariffRates,
        resampleMode: state.resampleMode,
        resampleAgg: state.resampleAgg,
      }),
      // Custom storage to handle Set serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Convert favorites array back to Set on hydration
          if (parsed?.state?.favorites) {
            parsed.state.favorites = new Set(parsed.state.favorites);
          }
          return parsed;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    },
  ),
);

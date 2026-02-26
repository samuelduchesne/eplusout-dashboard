import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../../src/store';

describe('Zustand store', () => {
  beforeEach(() => {
    // Reset store to initial state between tests
    useAppStore.setState({
      dictionary: [],
      selected: new Map(),
      baseFrequency: null,
      viewMode: 'time',
      resampleMode: 'original',
      resampleAgg: 'auto',
      normalize: false,
      hoverXMs: null,
      hoverBandKey: null,
      favorites: new Set(),
    });
  });

  it('initializes with default values', () => {
    const state = useAppStore.getState();
    expect(state.viewMode).toBe('time');
    expect(state.resampleMode).toBe('original');
    expect(state.resampleAgg).toBe('auto');
    expect(state.normalize).toBe(false);
    expect(state.selected.size).toBe(0);
    expect(state.dictionary).toEqual([]);
    expect(state.baseFrequency).toBeNull();
  });

  it('setViewMode updates the view mode', () => {
    useAppStore.getState().setViewMode('ldc');
    expect(useAppStore.getState().viewMode).toBe('ldc');

    useAppStore.getState().setViewMode('scatter');
    expect(useAppStore.getState().viewMode).toBe('scatter');
  });

  it('setResampleMode and setResampleAgg update correctly', () => {
    useAppStore.getState().setResampleMode('monthly');
    expect(useAppStore.getState().resampleMode).toBe('monthly');

    useAppStore.getState().setResampleAgg('sum');
    expect(useAppStore.getState().resampleAgg).toBe('sum');
  });

  it('setNormalize toggles the normalize flag', () => {
    useAppStore.getState().setNormalize(true);
    expect(useAppStore.getState().normalize).toBe(true);

    useAppStore.getState().setNormalize(false);
    expect(useAppStore.getState().normalize).toBe(false);
  });

  it('setDictionary replaces the dictionary', () => {
    const dict = [
      {
        id: 1,
        Name: 'Electricity',
        Type: 'Meter',
        IndexGroup: 'Meters',
        Units: 'J',
        IsMeter: 1,
        key: '',
        freq: 'Hourly' as const,
      },
      {
        id: 2,
        Name: 'Temperature',
        Type: 'Variable',
        IndexGroup: 'Zone',
        Units: 'C',
        IsMeter: 0,
        key: 'Zone One',
        freq: 'Hourly' as const,
      },
    ];
    useAppStore.getState().setDictionary(dict);
    expect(useAppStore.getState().dictionary).toHaveLength(2);
    expect(useAppStore.getState().dictionary[0].Name).toBe('Electricity');
  });

  it('addSeries and removeSeries manage selected map', () => {
    const series = {
      meta: { id: 1, Name: 'Test' },
      points: [],
      color: '#2563eb',
      visible: true,
    };
    useAppStore.getState().addSeries(1, series);
    expect(useAppStore.getState().selected.size).toBe(1);
    expect(useAppStore.getState().selected.get(1)?.meta.Name).toBe('Test');

    useAppStore.getState().removeSeries(1);
    expect(useAppStore.getState().selected.size).toBe(0);
  });

  it('toggleVisibility flips the visible flag on a series', () => {
    const series = {
      meta: { id: 1, Name: 'Test' },
      points: [],
      color: '#2563eb',
      visible: true,
    };
    useAppStore.getState().addSeries(1, series);
    useAppStore.getState().toggleVisibility(1);
    expect(useAppStore.getState().selected.get(1)?.visible).toBe(false);

    useAppStore.getState().toggleVisibility(1);
    expect(useAppStore.getState().selected.get(1)?.visible).toBe(true);
  });

  it('toggleFavorite adds and removes favorites', () => {
    useAppStore.getState().toggleFavorite(42);
    expect(useAppStore.getState().favorites.has(42)).toBe(true);

    useAppStore.getState().toggleFavorite(42);
    expect(useAppStore.getState().favorites.has(42)).toBe(false);
  });

  it('clearSelection empties selected and resets baseFrequency', () => {
    const series = {
      meta: { id: 1, Name: 'Test' },
      points: [],
      color: '#2563eb',
      visible: true,
    };
    useAppStore.getState().addSeries(1, series);
    useAppStore.getState().setBaseFrequency('Hourly');

    useAppStore.getState().clearSelection();
    expect(useAppStore.getState().selected.size).toBe(0);
    expect(useAppStore.getState().baseFrequency).toBeNull();
  });

  it('setHoverX and setHoverBand update crosshair state', () => {
    useAppStore.getState().setHoverX(1234567890);
    expect(useAppStore.getState().hoverXMs).toBe(1234567890);

    useAppStore.getState().setHoverBand('E1-M07');
    expect(useAppStore.getState().hoverBandKey).toBe('E1-M07');

    useAppStore.getState().setHoverX(null);
    expect(useAppStore.getState().hoverXMs).toBeNull();
  });

  it('toggleUnitSystem flips isIP', () => {
    const before = useAppStore.getState().unitPrefs.isIP;
    useAppStore.getState().toggleUnitSystem();
    expect(useAppStore.getState().unitPrefs.isIP).toBe(!before);
  });
});

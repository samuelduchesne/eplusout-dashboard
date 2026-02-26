import { useAppStore } from '../store';

export function useUnits() {
  return useAppStore((s) => ({
    unitPrefs: s.unitPrefs,
    setUnitPrefs: s.setUnitPrefs,
    toggleUnitSystem: s.toggleUnitSystem,
  }));
}

import { useAppStore } from '../store';

export function useSelection() {
  return useAppStore((s) => ({
    selected: s.selected,
    baseFrequency: s.baseFrequency,
    favorites: s.favorites,
    setSelected: s.setSelected,
    addSeries: s.addSeries,
    removeSeries: s.removeSeries,
    clearSelection: s.clearSelection,
    setBaseFrequency: s.setBaseFrequency,
    toggleFavorite: s.toggleFavorite,
    toggleVisibility: s.toggleVisibility,
  }));
}

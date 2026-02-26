import { useAppStore } from '../store';

export function useViewMode() {
  return useAppStore((s) => ({
    viewMode: s.viewMode,
    resampleMode: s.resampleMode,
    resampleAgg: s.resampleAgg,
    normalize: s.normalize,
    currentXDomain: s.currentXDomain,
    scatter: s.scatter,
    tempResponse: s.tempResponse,
    setViewMode: s.setViewMode,
    setResampleMode: s.setResampleMode,
    setResampleAgg: s.setResampleAgg,
    setNormalize: s.setNormalize,
    setCurrentXDomain: s.setCurrentXDomain,
    setScatter: s.setScatter,
    setTempResponse: s.setTempResponse,
  }));
}

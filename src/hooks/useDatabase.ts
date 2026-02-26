import { useAppStore } from '../store';

export function useDatabase() {
  return useAppStore((s) => ({
    db: s.db,
    dictionary: s.dictionary,
    isLoading: s.isLoading,
    setDb: s.setDb,
    setDictionary: s.setDictionary,
    setIsLoading: s.setIsLoading,
  }));
}

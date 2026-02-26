import { useAppStore } from '../store';

export function useTheme() {
  return useAppStore((s) => ({
    theme: s.theme,
    setTheme: s.setTheme,
    toggleTheme: s.toggleTheme,
  }));
}

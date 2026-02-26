import { useEffect, useRef } from 'react';
import { bootstrapApp } from './App';
import { createLogger } from '../services/Logger';
import { useAppStore } from '@/store';
import type { DictionaryRow } from '@/lib/sql-repository';

const logger = createLogger('legacy-bridge');

/**
 * Bridge interface exposed on `window.__eplusBridge` so the legacy
 * vanilla-TS App.ts can push state updates to the React/Zustand world.
 */
interface LegacyBridge {
  setDictionary: (list: DictionaryRow[]) => void;
  onSelectionChange: (ids: number[], baseFreq: string | null) => void;
  /** Legacy pushes series colors after chart rendering so React legend matches. */
  updateSeriesColors: (colorMap: Record<number, string>) => void;
  /** Legacy pushes view mode so React toolbar stays in sync. */
  setViewMode: (mode: string) => void;
}

declare global {
  interface Window {
    __eplusBridge?: LegacyBridge;
  }
}

/**
 * Legacy bridge component that runs the old vanilla TS bootstrapApp()
 * inside a React lifecycle. It also exposes a global bridge so the
 * legacy code can push dictionary and selection data to Zustand.
 */
export function LegacyApp() {
  const initialized = useRef(false);

  useEffect(() => {
    // Set up the bridge BEFORE bootstrapping so the legacy code can
    // call it during its init sequence (e.g. loading a sample DB).
    window.__eplusBridge = {
      setDictionary: (list) => {
        useAppStore.getState().setDictionary(list);
      },
      onSelectionChange: (ids, baseFreq) => {
        const state = useAppStore.getState();
        // Build a minimal selected Map so React knows what's selected
        const next = new Map(state.selected);
        const idSet = new Set(ids);
        // Remove deselected
        for (const key of next.keys()) {
          if (!idSet.has(key)) next.delete(key);
        }
        // Add newly selected (minimal entries — full data lives in legacy)
        for (const id of ids) {
          if (!next.has(id)) {
            const meta = state.dictionary.find((d) => d.id === id);
            if (meta) {
              next.set(id, {
                meta: {
                  id: meta.id,
                  Name: meta.Name,
                  IndexGroup: meta.IndexGroup,
                  Units: meta.Units,
                  IsMeter: meta.IsMeter,
                  key: meta.key,
                  freq: meta.freq,
                },
                points: [],
                color: '',
                visible: true,
              });
            }
          }
        }
        state.setSelected(next);
        state.setBaseFrequency((baseFreq as 'Hourly' | 'Monthly') || null);
      },
      updateSeriesColors: (colorMap) => {
        const state = useAppStore.getState();
        const next = new Map(state.selected);
        let changed = false;
        for (const [idStr, color] of Object.entries(colorMap)) {
          const id = Number(idStr);
          const entry = next.get(id);
          if (entry && entry.color !== color) {
            next.set(id, { ...entry, color });
            changed = true;
          }
        }
        if (changed) state.setSelected(next);
      },
      setViewMode: (mode) => {
        const validModes = ['time', 'ldc', 'balance', 'scatter'];
        if (validModes.includes(mode)) {
          useAppStore.getState().setViewMode(mode as 'time' | 'ldc' | 'balance' | 'scatter');
        }
      },
    };

    if (initialized.current) return;
    initialized.current = true;

    try {
      bootstrapApp();
    } catch (error) {
      logger.error('Legacy app bootstrap failed', { error });
      const chart = document.getElementById('chart');
      if (chart) {
        chart.textContent = 'Application failed to start. Check console logs for details.';
      }
    }

    return () => {
      delete window.__eplusBridge;
    };
  }, []);

  return null;
}

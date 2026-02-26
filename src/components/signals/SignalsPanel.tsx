import { useState, useMemo, useCallback } from 'react';
import { FileUp } from 'lucide-react';
import { useAppStore } from '@/store';
import { SearchInput } from './SearchInput';
import { FilterBar } from './FilterBar';
import { DictionaryList } from './DictionaryList';
import { ZoneQuickAccess } from './ZoneQuickAccess';
import type { DictionaryRow } from '@/lib/sql-repository';

/**
 * Bridge selected IDs to the legacy `<select id="dictionary">` element
 * and trigger its change event so legacy handleSelectionChange() runs.
 */
function bridgeSelectionToLegacy(ids: number[]) {
  const selEl = document.getElementById('dictionary') as HTMLSelectElement | null;
  if (!selEl) return;
  for (const opt of selEl.options) {
    opt.selected = ids.includes(Number(opt.value));
  }
  selEl.dispatchEvent(new Event('change', { bubbles: true }));
}

function applyFilters(
  dict: DictionaryRow[],
  search: string,
  freqFilter: string,
  meterFilter: string,
  groupFilter: string,
  favOnly: boolean,
  favorites: Set<number>,
): DictionaryRow[] {
  const q = search.trim().toLowerCase();
  return dict.filter((d) => {
    if (freqFilter && d.freq !== freqFilter) return false;
    if (meterFilter !== '' && String(d.IsMeter) !== meterFilter) return false;
    if (groupFilter && d.IndexGroup !== groupFilter) return false;
    if (favOnly && !favorites.has(d.id)) return false;
    if (q) {
      const hay = `${d.Name} ${d.IndexGroup || ''} ${d.key || ''} ${d.Units || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function SignalsPanel() {
  const dictionary = useAppStore((s) => s.dictionary);
  const selected = useAppStore((s) => s.selected);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const unitPrefs = useAppStore((s) => s.unitPrefs);

  const [search, setSearch] = useState('');
  const [freqFilter, setFreqFilter] = useState('');
  const [meterFilter, setMeterFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [favOnly, setFavOnly] = useState(false);

  const disabled = dictionary.length === 0;
  const selectedIds = useMemo(() => new Set(selected.keys()), [selected]);

  const filtered = useMemo(
    () =>
      applyFilters(dictionary, search, freqFilter, meterFilter, groupFilter, favOnly, favorites),
    [dictionary, search, freqFilter, meterFilter, groupFilter, favOnly, favorites],
  );

  const handleSelect = useCallback((ids: number[]) => {
    bridgeSelectionToLegacy(ids);
  }, []);

  const handleToggleFavorite = useCallback(
    (id: number) => {
      toggleFavorite(id);
      // Also update legacy favorites in localStorage for consistency
      const state = useAppStore.getState();
      const next = new Set(state.favorites);
      localStorage.setItem('eplus_favs', JSON.stringify([...next]));
    },
    [toggleFavorite],
  );

  const handleSelectZone = useCallback((ids: number[]) => {
    // Switch to time view in legacy
    const viewBtn = document.getElementById('view-time');
    if (viewBtn) viewBtn.click();
    bridgeSelectionToLegacy(ids);
  }, []);

  return (
    <div className="flex flex-col overflow-hidden min-h-0 flex-1">
      <div className="flex justify-between items-center px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <strong className="text-sm">Signals</strong>
          {!disabled && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {filtered.length} / {dictionary.length}
            </span>
          )}
        </div>
      </div>

      {disabled ? (
        /* Empty state — no database loaded */
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="rounded-full bg-muted/50 p-3">
            <FileUp className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No database loaded</p>
            <p className="text-xs text-muted-foreground mt-1">
              Open an{' '}
              <code className="px-1 py-0.5 rounded bg-muted text-[11px] font-mono">
                eplusout.sql
              </code>{' '}
              file to explore variables and meters.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 flex flex-col gap-2 overflow-auto flex-1 min-h-0">
          <SearchInput value={search} onChange={setSearch} disabled={disabled} />
          <FilterBar
            dictionary={dictionary}
            freqFilter={freqFilter}
            meterFilter={meterFilter}
            groupFilter={groupFilter}
            favOnly={favOnly}
            onFreqChange={setFreqFilter}
            onMeterChange={setMeterFilter}
            onGroupChange={setGroupFilter}
            onFavChange={setFavOnly}
            disabled={disabled}
          />
          <DictionaryList
            items={filtered}
            selectedIds={selectedIds}
            favorites={favorites}
            unitPrefs={unitPrefs}
            onSelect={handleSelect}
            onToggleFavorite={handleToggleFavorite}
            disabled={disabled}
          />
          <p className="text-[11px] text-muted-foreground">
            Tip: Choose an entry to plot. Hourly = line; Monthly = bars.
          </p>
          <ZoneQuickAccess dictionary={dictionary} onSelectZone={handleSelectZone} />
        </div>
      )}
    </div>
  );
}

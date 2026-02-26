import { useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import { convertUnitLabel } from '@/lib/units';
import type { DictionaryRow } from '@/lib/sql-repository';
import type { UnitPreferences } from '@/lib/units';

interface DictionaryListProps {
  items: DictionaryRow[];
  selectedIds: Set<number>;
  favorites: Set<number>;
  unitPrefs: UnitPreferences;
  onSelect: (ids: number[]) => void;
  onToggleFavorite: (id: number) => void;
  disabled?: boolean;
}

export function DictionaryList({
  items,
  selectedIds,
  favorites,
  unitPrefs,
  onSelect,
  onToggleFavorite,
  disabled,
}: DictionaryListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const lastClickedIndex = useRef<number | null>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 20,
  });

  const handleClick = useCallback(
    (index: number, e: React.MouseEvent) => {
      if (disabled) return;
      const id = items[index].id;

      let nextIds: number[];

      if (e.metaKey || e.ctrlKey) {
        // Toggle individual item
        const current = new Set(selectedIds);
        if (current.has(id)) {
          current.delete(id);
        } else {
          current.add(id);
        }
        nextIds = Array.from(current);
      } else if (e.shiftKey && lastClickedIndex.current !== null) {
        // Range select
        const start = Math.min(lastClickedIndex.current, index);
        const end = Math.max(lastClickedIndex.current, index);
        const rangeIds = items.slice(start, end + 1).map((d) => d.id);
        const current = new Set(selectedIds);
        for (const rid of rangeIds) current.add(rid);
        nextIds = Array.from(current);
      } else {
        // Single select (replace)
        nextIds = [id];
      }

      lastClickedIndex.current = index;
      onSelect(nextIds);
    },
    [disabled, items, selectedIds, onSelect],
  );

  const handleDoubleClick = useCallback(
    (index: number) => {
      if (disabled) return;
      onToggleFavorite(items[index].id);
    },
    [disabled, items, onToggleFavorite],
  );

  return (
    <div
      ref={parentRef}
      className={cn(
        'flex-1 min-h-[200px] overflow-auto rounded-md border border-input bg-background text-xs',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          const isSelected = selectedIds.has(item.id);
          const isFav = favorites.has(item.id);
          const tag = item.IsMeter ? 'M' : 'V';
          const units = item.Units ? ` [${convertUnitLabel(item.Units, unitPrefs)}]` : '';
          const key = item.key ? ` (${item.key})` : '';

          return (
            <div
              key={item.id}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className={cn(
                'px-2 py-0.5 cursor-pointer select-none truncate transition-colors duration-150',
                isSelected ? 'bg-primary/15 dark:bg-primary/25 font-medium' : 'hover:bg-muted/60',
              )}
              onClick={(e) => handleClick(virtualRow.index, e)}
              onDoubleClick={() => handleDoubleClick(virtualRow.index)}
            >
              {isFav && <span className="text-amber-500 mr-0.5">★</span>}
              <span className="text-muted-foreground">{item.freq}</span>
              <span className="text-muted-foreground"> | </span>
              <span className="text-muted-foreground">{item.IndexGroup || '—'}</span>
              <span className="text-muted-foreground"> | </span>
              <span
                className={cn(
                  'font-mono text-[10px] mr-0.5',
                  item.IsMeter
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-emerald-600 dark:text-emerald-400',
                )}
              >
                [{tag}]
              </span>
              <span className="font-medium">{item.Name}</span>
              <span className="text-muted-foreground">{key}</span>
              <span className="text-muted-foreground">{units}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

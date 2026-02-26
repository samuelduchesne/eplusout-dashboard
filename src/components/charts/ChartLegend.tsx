import { useCallback } from 'react';
import { useAppStore } from '@/store';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { convertUnitLabel } from '@/lib/units';

/**
 * ChartLegend — displays clickable pill-shaped legend items for each
 * selected series.  Clicking an item toggles its visibility and bridges
 * the change to the legacy chart renderer.
 */
export function ChartLegend() {
  const selected = useAppStore((s) => s.selected);
  const unitPrefs = useAppStore((s) => s.unitPrefs);
  const toggleVisibility = useAppStore((s) => s.toggleVisibility);

  const handleClick = useCallback(
    (id: number) => {
      toggleVisibility(id);
      // Bridge to legacy: click the corresponding legend item if it exists
      const legacyBtn = document.querySelector(`[data-legend-id="${id}"]`);
      if (legacyBtn instanceof HTMLElement) legacyBtn.click();
    },
    [toggleVisibility],
  );

  const entries = Array.from(selected.entries());
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {entries.map(([id, series]) => {
        const units = series.meta.Units
          ? ` [${convertUnitLabel(series.meta.Units, unitPrefs)}]`
          : '';
        return (
          <Badge
            key={id}
            variant="outline"
            className={cn(
              'cursor-pointer select-none transition-opacity text-xs font-normal py-0.5 px-2 gap-1.5',
              !series.visible && 'opacity-40 line-through',
            )}
            onClick={() => handleClick(id)}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: series.color || '#888' }}
            />
            <span className="truncate max-w-[200px]">
              {series.meta.Name}
              {series.meta.key ? ` (${series.meta.key})` : ''}
              {units}
            </span>
          </Badge>
        );
      })}
    </div>
  );
}

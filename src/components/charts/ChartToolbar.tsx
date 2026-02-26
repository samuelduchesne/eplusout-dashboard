import { useCallback } from 'react';
import { useAppStore } from '@/store';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { ViewMode } from '@/types/domain';
import type { ResampleMode, AggregationMode } from '@/store';

/**
 * Bridges a view mode change to legacy by clicking the hidden button
 * and dispatching to Zustand.
 */
function bridgeViewMode(mode: ViewMode) {
  const btnId: Record<ViewMode, string> = {
    time: 'view-time',
    ldc: 'view-ldc',
    balance: 'view-balance',
    scatter: 'view-scatter',
  };
  document.getElementById(btnId[mode])?.click();
}

/**
 * Bridges a select change to legacy by updating the hidden select element
 * and dispatching a change event.
 */
function bridgeSelect(elementId: string, value: string) {
  const el = document.getElementById(elementId) as HTMLSelectElement | null;
  if (!el) return;
  el.value = value;
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Bridges the normalize checkbox to legacy.
 */
function bridgeNormalize(checked: boolean) {
  const el = document.getElementById('ldc-normalize') as HTMLInputElement | null;
  if (!el) return;
  el.checked = checked;
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

interface ChartToolbarProps {
  disabled?: boolean;
}

export function ChartToolbar({ disabled }: ChartToolbarProps) {
  const viewMode = useAppStore((s) => s.viewMode);
  const resampleMode = useAppStore((s) => s.resampleMode);
  const resampleAgg = useAppStore((s) => s.resampleAgg);
  const normalize = useAppStore((s) => s.normalize);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const setResampleMode = useAppStore((s) => s.setResampleMode);
  const setResampleAgg = useAppStore((s) => s.setResampleAgg);
  const setNormalize = useAppStore((s) => s.setNormalize);

  const handleViewMode = useCallback(
    (value: string) => {
      if (!value) return; // ToggleGroup can emit empty on re-click
      const mode = value as ViewMode;
      setViewMode(mode);
      bridgeViewMode(mode);
    },
    [setViewMode],
  );

  const handleResampleMode = useCallback(
    (value: string) => {
      const mode = value as ResampleMode;
      setResampleMode(mode);
      bridgeSelect('resample-mode', mode);
    },
    [setResampleMode],
  );

  const handleResampleAgg = useCallback(
    (value: string) => {
      const agg = value as AggregationMode;
      setResampleAgg(agg);
      bridgeSelect('resample-agg', agg);
    },
    [setResampleAgg],
  );

  const handleNormalize = useCallback(
    (checked: boolean | 'indeterminate') => {
      const val = checked === true;
      setNormalize(val);
      bridgeNormalize(val);
    },
    [setNormalize],
  );

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <ToggleGroup
          type="single"
          variant="outline"
          value={viewMode}
          onValueChange={handleViewMode}
          disabled={disabled}
          className="h-8"
        >
          <ToggleGroupItem
            value="time"
            className="text-xs px-3 h-7 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Time Series
          </ToggleGroupItem>
          <ToggleGroupItem
            value="ldc"
            className="text-xs px-3 h-7 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Load Duration
          </ToggleGroupItem>
          <ToggleGroupItem
            value="balance"
            className="text-xs px-3 h-7 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Load Balance
          </ToggleGroupItem>
          <ToggleGroupItem
            value="scatter"
            className="text-xs px-3 h-7 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Scatter
          </ToggleGroupItem>
        </ToggleGroup>

        {viewMode === 'ldc' && (
          <div className="flex items-center gap-1.5">
            <Checkbox
              id="normalize-check"
              checked={normalize}
              onCheckedChange={handleNormalize}
              disabled={disabled}
              className="h-3.5 w-3.5"
            />
            <Label htmlFor="normalize-check" className="text-xs cursor-pointer">
              Normalize to peak
            </Label>
          </div>
        )}

        {viewMode === 'time' && (
          <>
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground">Resolution:</Label>
              <Select value={resampleMode} onValueChange={handleResampleMode} disabled={disabled}>
                <SelectTrigger className="h-7 w-[100px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original" className="text-xs">
                    Original
                  </SelectItem>
                  <SelectItem value="hourly" className="text-xs">
                    Hourly
                  </SelectItem>
                  <SelectItem value="monthly" className="text-xs">
                    Monthly
                  </SelectItem>
                  <SelectItem value="annual" className="text-xs">
                    Annual
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground">Aggregation:</Label>
              <Select value={resampleAgg} onValueChange={handleResampleAgg} disabled={disabled}>
                <SelectTrigger className="h-7 w-[80px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto" className="text-xs">
                    Auto
                  </SelectItem>
                  <SelectItem value="sum" className="text-xs">
                    Sum
                  </SelectItem>
                  <SelectItem value="avg" className="text-xs">
                    Avg
                  </SelectItem>
                  <SelectItem value="max" className="text-xs">
                    Max
                  </SelectItem>
                  <SelectItem value="min" className="text-xs">
                    Min
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

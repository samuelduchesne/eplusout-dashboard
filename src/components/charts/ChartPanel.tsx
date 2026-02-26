import { useAppStore } from '@/store';
import { Separator } from '@/components/ui/separator';
import { ChartToolbar } from './ChartToolbar';
import { ChartLegend } from './ChartLegend';

/**
 * ChartPanel — React shell for the chart area.
 *
 * Renders the toolbar and legend as React components, while leaving
 * the actual D3 chart SVG, KPIs, stats, and insights to the legacy
 * renderer (which writes directly to DOM containers below this panel).
 *
 * The legacy containers (#chart, #kpis, #stats, #insights, etc.)
 * remain in the DOM and legacy App.ts continues to populate them.
 * This component provides the modern toolbar and legend UI.
 */
export function ChartPanel() {
  const selected = useAppStore((s) => s.selected);
  const disabled = selected.size === 0;

  return (
    <div className="flex flex-col gap-2">
      <ChartToolbar disabled={disabled} />
      <ChartLegend />
      {!disabled && <Separator className="mt-1" />}
    </div>
  );
}

import { cn } from '@/lib/utils';

export interface InsightEntry {
  label: string;
  value: string;
  color?: string;
}

interface InsightsPanelProps {
  entries: InsightEntry[];
  className?: string;
}

/**
 * InsightsPanel — shows peak value info per series.
 * Content is pushed from legacy App.ts via the bridge.
 */
export function InsightsPanel({ entries, className }: InsightsPanelProps) {
  if (entries.length === 0) return null;

  return (
    <div className={cn('rounded-md border bg-muted/30 p-3 text-sm space-y-1', className)}>
      {entries.map((entry, i) => (
        <div key={i} className="flex items-baseline gap-2 text-xs">
          {entry.color && (
            <span
              className="inline-block w-2 h-2 rounded-full shrink-0 mt-0.5"
              style={{ backgroundColor: entry.color }}
            />
          )}
          <span className="text-muted-foreground">{entry.label}:</span>
          <span className="font-medium font-mono tabular-nums">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

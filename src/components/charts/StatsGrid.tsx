import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fmt } from '@/lib/formatting';
import type { DescriptiveStats } from '@/lib/stats';

export interface StatsRow {
  name: string;
  color: string;
  stats: DescriptiveStats;
}

interface StatsGridProps {
  rows: StatsRow[];
}

/**
 * StatsGrid — displays per-series descriptive statistics in a table.
 * Data is pushed from legacy App.ts via the bridge.
 */
export function StatsGrid({ rows }: StatsGridProps) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="text-[10px]">
            <TableHead className="h-7 text-xs">Series</TableHead>
            <TableHead className="h-7 text-xs text-right">Min</TableHead>
            <TableHead className="h-7 text-xs text-right">P05</TableHead>
            <TableHead className="h-7 text-xs text-right">Mean</TableHead>
            <TableHead className="h-7 text-xs text-right">Median</TableHead>
            <TableHead className="h-7 text-xs text-right">P95</TableHead>
            <TableHead className="h-7 text-xs text-right">Max</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i} className="text-xs font-mono tabular-nums">
              <TableCell className="py-1.5 font-sans">
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: row.color }}
                  />
                  <span className="truncate max-w-[180px]">{row.name}</span>
                </span>
              </TableCell>
              <TableCell className="py-1.5 text-right">{fmt(row.stats.min)}</TableCell>
              <TableCell className="py-1.5 text-right">{fmt(row.stats.p05)}</TableCell>
              <TableCell className="py-1.5 text-right">{fmt(row.stats.mean)}</TableCell>
              <TableCell className="py-1.5 text-right">{fmt(row.stats.median)}</TableCell>
              <TableCell className="py-1.5 text-right">{fmt(row.stats.p95)}</TableCell>
              <TableCell className="py-1.5 text-right">{fmt(row.stats.max)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

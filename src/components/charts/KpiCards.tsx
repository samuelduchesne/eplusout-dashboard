import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface KpiItem {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

interface KpiCardsProps {
  items: KpiItem[];
}

/**
 * KpiCards — responsive grid of KPI metric cards.
 * Data is pushed from legacy App.ts via the bridge.
 */
export function KpiCards({ items }: KpiCardsProps) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
      {items.map((kpi, i) => (
        <Card key={i} className={cn('shadow-sm')}>
          <CardContent className="p-3">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              {kpi.label}
            </div>
            <div
              className="text-lg font-semibold font-mono tabular-nums leading-tight"
              style={kpi.color ? { color: kpi.color } : undefined}
            >
              {kpi.value}
            </div>
            {kpi.sub && <div className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

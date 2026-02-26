import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import type { DictionaryRow } from '@/lib/sql-repository';

interface ZoneRecord {
  zone: string;
  ids: number[];
  freq: string;
}

interface ZoneQuickAccessProps {
  dictionary: DictionaryRow[];
  onSelectZone: (ids: number[]) => void;
}

const ZONE_NAMES = [
  'Zone Mean Air Temperature',
  'Zone Thermostat Heating Setpoint Temperature',
  'Zone Thermostat Cooling Setpoint Temperature',
];

export function ZoneQuickAccess({ dictionary, onSelectZone }: ZoneQuickAccessProps) {
  const zones = useMemo(() => {
    const map = new Map<string, { temp?: number; heat?: number; cool?: number; freq: string }>();

    for (const d of dictionary) {
      if (!d.key || !ZONE_NAMES.includes(d.Name)) continue;
      let rec = map.get(d.key);
      if (!rec) {
        rec = { freq: d.freq };
        map.set(d.key, rec);
      }
      if (d.Name === ZONE_NAMES[0]) rec.temp = d.id;
      else if (d.Name === ZONE_NAMES[1]) rec.heat = d.id;
      else if (d.Name === ZONE_NAMES[2]) rec.cool = d.id;
    }

    const result: ZoneRecord[] = [];
    for (const [zone, rec] of map) {
      const ids = [rec.temp, rec.heat, rec.cool].filter((x): x is number => x !== undefined);
      if (ids.length > 0) {
        result.push({ zone, ids, freq: rec.freq });
      }
    }
    return result.sort((a, b) => a.zone.localeCompare(b.zone));
  }, [dictionary]);

  if (zones.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <strong className="text-xs">Zones</strong>
        <span className="text-[10px] text-muted-foreground">{zones.length} zones</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {zones.map((z) => (
          <Button
            key={z.zone}
            variant="outline"
            size="sm"
            className="h-6 px-2 text-[10px] font-normal"
            onClick={() => onSelectZone(z.ids)}
          >
            {z.zone}
          </Button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">
        Click a zone to load Temperature and Setpoints.
      </p>
    </div>
  );
}

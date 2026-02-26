import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DictionaryRow } from '@/lib/sql-repository';

interface FilterBarProps {
  dictionary: DictionaryRow[];
  freqFilter: string;
  meterFilter: string;
  groupFilter: string;
  favOnly: boolean;
  onFreqChange: (v: string) => void;
  onMeterChange: (v: string) => void;
  onGroupChange: (v: string) => void;
  onFavChange: (v: boolean) => void;
  disabled?: boolean;
}

export function FilterBar({
  dictionary,
  freqFilter,
  meterFilter,
  groupFilter,
  favOnly,
  onFreqChange,
  onMeterChange,
  onGroupChange,
  onFavChange,
  disabled,
}: FilterBarProps) {
  const groups = useMemo(
    () =>
      Array.from(new Set(dictionary.map((d) => d.IndexGroup).filter(Boolean))).sort() as string[],
    [dictionary],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id="fav-only-react"
          checked={favOnly}
          onCheckedChange={(v) => onFavChange(v === true)}
          disabled={disabled}
        />
        <Label htmlFor="fav-only-react" className="text-xs text-muted-foreground cursor-pointer">
          Favorites only (double-click to toggle)
        </Label>
      </div>
      <div className="flex gap-2">
        <Select
          value={freqFilter || '_all'}
          onValueChange={(v) => onFreqChange(v === '_all' ? '' : v)}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Any frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all" className="text-xs">
              Any frequency
            </SelectItem>
            <SelectItem value="Hourly" className="text-xs">
              Hourly
            </SelectItem>
            <SelectItem value="Monthly" className="text-xs">
              Monthly
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={meterFilter || '_all'}
          onValueChange={(v) => onMeterChange(v === '_all' ? '' : v)}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Vars & Meters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all" className="text-xs">
              Vars & Meters
            </SelectItem>
            <SelectItem value="1" className="text-xs">
              Meters only
            </SelectItem>
            <SelectItem value="0" className="text-xs">
              Variables only
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Select
        value={groupFilter || '_all'}
        onValueChange={(v) => onGroupChange(v === '_all' ? '' : v)}
        disabled={disabled}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Any index group" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all" className="text-xs">
            Any index group
          </SelectItem>
          {groups.map((g) => (
            <SelectItem key={g} value={g} className="text-xs">
              {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

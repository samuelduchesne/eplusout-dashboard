import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store';
import type { UnitPreferences } from '@/lib/units';

interface UnitSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnitSettingsDialog({ open, onOpenChange }: UnitSettingsDialogProps) {
  const unitPrefs = useAppStore((s) => s.unitPrefs);
  const setUnitPrefs = useAppStore((s) => s.setUnitPrefs);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unit Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">SI (metric)</p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="si-energy">Energy base unit</Label>
                <Select
                  value={unitPrefs.energySI}
                  onValueChange={(v) =>
                    setUnitPrefs({ energySI: v as UnitPreferences['energySI'] })
                  }
                >
                  <SelectTrigger id="si-energy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="J">J</SelectItem>
                    <SelectItem value="kWh">kWh</SelectItem>
                    <SelectItem value="MWh">MWh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="si-temp">Temperature unit</Label>
                <Select
                  value={unitPrefs.tempSI}
                  onValueChange={(v) => setUnitPrefs({ tempSI: v as UnitPreferences['tempSI'] })}
                >
                  <SelectTrigger id="si-temp">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="K">K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs text-muted-foreground mb-2">IP (US customary)</p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="ip-energy">Energy base unit</Label>
                <Select
                  value={unitPrefs.energyIP}
                  onValueChange={(v) =>
                    setUnitPrefs({ energyIP: v as UnitPreferences['energyIP'] })
                  }
                >
                  <SelectTrigger id="ip-energy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTU">BTU</SelectItem>
                    <SelectItem value="kBTU">kBTU</SelectItem>
                    <SelectItem value="MMBTU">MMBTU</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ip-temp">Temperature unit</Label>
                <Select value={unitPrefs.tempIP} disabled>
                  <SelectTrigger id="ip-temp">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ip-power">Power base unit</Label>
                <Select
                  value={unitPrefs.powerIP}
                  onValueChange={(v) => setUnitPrefs({ powerIP: v as UnitPreferences['powerIP'] })}
                >
                  <SelectTrigger id="ip-power">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Btu/h">Btu/h</SelectItem>
                    <SelectItem value="Tons">Tons</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">1 Ton = 12,000 Btu/h</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

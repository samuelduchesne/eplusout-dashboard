import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppStore } from '@/store';

export function UnitsToggle() {
  const isIP = useAppStore((s) => s.unitPrefs.isIP);
  const toggleUnitSystem = useAppStore((s) => s.toggleUnitSystem);

  const handleClick = useCallback(() => {
    toggleUnitSystem();
    // Bridge: also toggle legacy closure variable via hidden button click
    document.getElementById('btn-units')?.click();
  }, [toggleUnitSystem]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleClick} aria-label="Toggle units">
          {isIP ? 'IP' : 'SI'}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Toggle SI/IP units</TooltipContent>
    </Tooltip>
  );
}

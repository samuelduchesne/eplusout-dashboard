import { Badge } from '@/components/ui/badge';

interface AppTitleProps {
  onVersionClick: () => void;
}

export function AppTitle({ onVersionClick }: AppTitleProps) {
  return (
    <div className="flex flex-col flex-1 min-w-0">
      <h1 className="text-base font-semibold tracking-tight truncate flex items-baseline gap-2">
        <span>EnergyPlus eplusout.sql Dashboard</span>
        <Badge
          variant="secondary"
          className="cursor-pointer text-[10px] font-mono hover:bg-secondary/80 transition-colors"
          onClick={onVersionClick}
          id="app-version-react"
        >
          {`v${(window as unknown as Record<string, unknown>).__APP_VERSION__ || '0.0.1'}`}
        </Badge>
      </h1>
      <span className="text-[11px] text-muted-foreground">
        Drop{' '}
        <code className="px-1 py-0.5 rounded bg-muted text-[11px] font-mono">eplusout.sql</code> to
        explore variables &amp; meters.
      </span>
    </div>
  );
}

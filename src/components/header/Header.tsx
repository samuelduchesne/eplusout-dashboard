import { FileUp, Bug, Download, FileSpreadsheet, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AppTitle } from './AppTitle';
import { ThemeToggle } from './ThemeToggle';
import { UnitsToggle } from './UnitsToggle';
import { useAppStore } from '@/store';

interface HeaderProps {
  onOpenDb: () => void;
  onExportCsv: () => void;
  onHtmlReport: () => void;
  onChangelog: () => void;
  onUnitSettings: () => void;
}

export function Header({
  onOpenDb,
  onExportCsv,
  onHtmlReport,
  onChangelog,
  onUnitSettings,
}: HeaderProps) {
  const hasSelection = useAppStore((s) => s.selected.size > 0);
  const hasDb = useAppStore((s) => s.dictionary.length > 0);

  return (
    <header className="px-4 py-2.5 border-b sticky top-0 z-10 backdrop-blur-sm bg-background/95 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <AppTitle onVersionClick={onChangelog} />
        <div className="flex flex-nowrap gap-2 overflow-x-auto items-center">
          <Button variant="outline" size="sm" onClick={onOpenDb}>
            <FileUp className="h-4 w-4 mr-1.5" />
            Open
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    'https://github.com/sebastienjouhans/eplusout-dashboard/issues/new',
                    '_blank',
                  )
                }
              >
                <Bug className="h-4 w-4 mr-1.5" />
                Report
              </Button>
            </TooltipTrigger>
            <TooltipContent>Report a bug or request a feature</TooltipContent>
          </Tooltip>

          <Button variant="default" size="sm" onClick={onExportCsv} disabled={!hasSelection}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onHtmlReport}
                disabled={!hasDb}
                aria-label="View HTML Report"
              >
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View HTML Report</TooltipContent>
          </Tooltip>

          <ThemeToggle />
          <UnitsToggle />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onUnitSettings}
                aria-label="Unit settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Unit settings</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}

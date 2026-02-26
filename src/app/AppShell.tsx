import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/header/Header';
import { SignalsPanel } from '@/components/signals/SignalsPanel';
import { ChartPanel } from '@/components/charts/ChartPanel';
import { ChangelogDialog } from '@/components/dialogs/ChangelogDialog';

/**
 * AppShell — top-level React shell that renders the header, signals panel,
 * chart panel toolbar/legend, and manages dialog state.
 *
 * During the transitional period the legacy vanilla-TS app still provides
 * the D3 chart SVGs; header buttons that need legacy functionality bridge
 * to hidden DOM elements via programmatic clicks.
 *
 * The SignalsPanel and ChartPanel are rendered via React portals into
 * containers placed inside the legacy DOM, so the existing grid layout
 * from `#main-grid` positions them correctly.
 */
export function AppShell() {
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [signalsPortal, setSignalsPortal] = useState<HTMLElement | null>(null);
  const [chartPortal, setChartPortal] = useState<HTMLElement | null>(null);
  const setupDone = useRef(false);

  useEffect(() => {
    if (setupDone.current) return;
    setupDone.current = true;

    // ---- Signals panel portal setup ----
    const signalsPanel = document.getElementById('signals-panel');
    if (signalsPanel) {
      // Hide all legacy children (search, filters, dictionary select, etc.)
      // but keep them in the DOM so legacy event handlers still work.
      const signalsBody = document.getElementById('signals-body');
      if (signalsBody) {
        signalsBody.style.display = 'none';
      }
      // Hide the legacy panel header bar too
      const panelHeader = signalsPanel.querySelector(':scope > div');
      if (panelHeader instanceof HTMLElement) {
        panelHeader.style.display = 'none';
      }

      const container = document.createElement('div');
      container.id = 'signals-panel-react';
      container.className = 'flex flex-col flex-1 min-h-0 overflow-hidden';
      signalsPanel.appendChild(container);
      setSignalsPortal(container);
    }

    // ---- Chart panel portal setup ----
    // Hide the legacy toolbar (view mode buttons, resolution, aggregation, normalize)
    // and the legacy legend. Insert a React container before the chart content.
    const chartBody = document.querySelector('#single-chart-panel')?.parentElement;
    if (chartBody) {
      // Hide the legacy toolbar area (the flex row containing view buttons + controls)
      const legacyToolbar = chartBody.querySelector('.flex.items-center.justify-between.flex-wrap');
      if (legacyToolbar instanceof HTMLElement) {
        legacyToolbar.style.display = 'none';
      }
      // Hide the legacy legend
      const legacyLegend = document.getElementById('legend');
      if (legacyLegend) {
        legacyLegend.style.display = 'none';
      }
      // Hide the legacy zoom hint (React toolbar handles state)
      const zoomHint = document.getElementById('zoom-hint');
      if (zoomHint) {
        zoomHint.style.display = 'none';
      }

      // Create a container for the React chart portal, placed before
      // the single-chart-panel so toolbar + legend appear above the chart
      const container = document.createElement('div');
      container.id = 'chart-panel-react';
      container.className = 'flex flex-col gap-3';
      const singlePanel = document.getElementById('single-chart-panel');
      if (singlePanel) {
        chartBody.insertBefore(container, singlePanel);
      } else {
        chartBody.appendChild(container);
      }
      setChartPortal(container);
    }
  }, []);

  // ---- Legacy bridges (click hidden buttons from the old header) --------

  const handleOpenDb = useCallback(() => {
    document.getElementById('btn-open')?.click();
  }, []);

  const handleExportCsv = useCallback(() => {
    document.getElementById('btn-export')?.click();
  }, []);

  const handleHtmlReport = useCallback(() => {
    document.getElementById('btn-html-report')?.click();
  }, []);

  const handleUnitSettings = useCallback(() => {
    document.getElementById('btn-units-settings')?.click();
  }, []);

  // -----------------------------------------------------------------------

  return (
    <TooltipProvider delayDuration={300}>
      <Header
        onOpenDb={handleOpenDb}
        onExportCsv={handleExportCsv}
        onHtmlReport={handleHtmlReport}
        onChangelog={() => setChangelogOpen(true)}
        onUnitSettings={handleUnitSettings}
      />
      {signalsPortal && createPortal(<SignalsPanel />, signalsPortal)}
      {chartPortal && createPortal(<ChartPanel />, chartPortal)}
      <ChangelogDialog open={changelogOpen} onOpenChange={setChangelogOpen} />
    </TooltipProvider>
  );
}

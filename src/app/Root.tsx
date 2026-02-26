import { StrictMode } from 'react';
import { AppShell } from './AppShell';
import { LegacyApp } from './LegacyApp';

/**
 * Root React component.  Renders the new React header/shell above the
 * legacy vanilla-TS app.  The legacy header is hidden via CSS and the
 * React header bridges to legacy functionality where needed.
 */
export function Root() {
  return (
    <StrictMode>
      <AppShell />
      <LegacyApp />
    </StrictMode>
  );
}

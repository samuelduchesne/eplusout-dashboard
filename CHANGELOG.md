# Changelog

All notable changes to this project will be documented here.

## [Unreleased]

### Changed (Unreleased)

- Improved Load Balance chart color palette with semantic color mapping: heating uses intuitive warm red colors, cooling uses cool blues, window solar uses bright orange, internal gains use amber/yellow, and infiltration/ventilation/conduction categories use appropriate warm/cool color distinctions. Colors automatically adapt for light and dark mode themes.

## [0.4.0] - 2025-08-22

### Added (0.4.0)

- "Report issue" button in the header that opens a prefilled GitHub issue with app version, theme, units, and browser details.
- GitHub issue templates for bug reports and feature requests to standardize submissions.
- Synchronized crosshair for time-series charts: a vertical guideline follows the mouse with per-series hover markers and a consolidated tooltip; when multiple charts are visible (grouped by units), the crosshair position is kept in sync across them to quickly read values at the same time.

### Fixed (0.4.0)

- Load Balance chart now loads correctly when switching between chart types. Fixed "TypeError: Assignment to constant variable" error that prevented Load Balance from rendering on subsequent loads after viewing other chart types.

## [0.3.1] - 2025-08-22

### Added (0.3.1)

- Resampling Aggregation selector next to Resolution: choose how values are aggregated when switching resolution (Auto, Sum, Avg, Max, Min). Auto sums energy units (J/Wh/BTU) and averages other units.

### Fixed (0.3.1)

- Monthly resampling could produce a 13th column due to Date roll-over at 24:00. Grouping now uses EnergyPlus Environment + Month keys (E{env}-M{mm}) to avoid off-by-one issues and ensures exactly 12 months per environment.

## [0.3.0] - 2025-08-22

### Added (0.3.0)

- Zones quick-pick buttons under the Signals list: click a zone to auto-load Zone Mean Air Temperature + Thermostat Heating/Cooling Setpoint Temperatures for that zone (Hourly), replacing the current chart selection.
- Charts now group selected series by original units and render one chart per unit group; zoom is synced across charts and the charts are stacked in a scrollable layout.
- HTML Report viewer: new button in header opens a modal with comprehensive EnergyPlus report data including Building Summary, Annual Building Utility Performance Summary, HVAC Sizing Summary, Component Sizing Summary, and Energy Meters Summary with professional table formatting and copy-to-clipboard functionality for each data table.
- Built-in sample database: added a "Load Sample" button in the header. The build now generates a small sample `eplusout.sql` and copies it into `dist/` so users can explore the dashboard immediately without providing a file.
- Signal resampling: added Resolution dropdown control that allows resampling signals to different time resolutions (Original/Hourly/Monthly/Annual). Energy values are summed when aggregating to coarser time steps, while temperature and other non-energy values are averaged. This enables viewing hourly data as monthly totals or annual summaries.
- Open workflow redesigned: the "Open eplusout.sql" button now opens a modal with a large drag & drop zone (or click to pick) and includes a "Load Sample" action inside the modal.

### Changed (0.3.0)

- Time series charts now render Monthly and Annual resolutions as bar charts, even when the original data is Hourly. The chart decides by the effective resolution (after resampling), not the source frequency.

### Fixed (0.3.0)

- HTML Report: Copy CSV buttons now work reliably on all tables. Replaced fragile inline onclick with delegated handler and added clipboard fallback for file:// and non-secure contexts.
- HTML Report: “Copy CSV” replaced by a single “Copy” button that writes rich clipboard data (text/html table + text/plain TSV). This improves pasting into Excel, Google Sheets, Notion, and Markdown-capable tools; falls back to TSV-only where rich clipboard is unavailable.
- Signals panel mistakenly displayed raw JavaScript due to a misplaced template block; restored proper filters and removed the injected code.
- Minor: Signals panel can now be resized horizontally on large screens via a draggable handle between panels; width persists across sessions.
- HTML Report TOC (mobile): improved resizer behavior with better default height (260px) and clamped range; only applies stored height on mobile and clears explicit sizing on desktop to ensure full-height sidebar.
- Open modal: increased z-index and backdrop blur, locked background scroll, and added Esc/backdrop close to prevent Signals filters from bleeding through.
- Offline file loading: selecting an eplusout.sql from the Open modal now works without internet. Bundled sql.js (WASM + loader) and d3 locally under dist/vendor and pointed the app to those paths; added error handling around the file picker to surface failures instead of silently doing nothing.
- Signals: ensured the `#dictionary` multi-select keeps a sensible minimum height so it remains usable when the panel gets crowded.

## [0.2.0] - 2025-08-19

### Added

- Scatter plot view (select two or more series then choose Scatter: shows correlation, regression line (dashed & toggleable), slope, intercept, R²; supports pair switching and overlapping point filtering for Hourly or Monthly data).
- Degree-day temperature response regression in Scatter view: when pairing an energy series with a temperature series you can toggle a Deg Days panel to fit E = b + h*HDD + c*CDD (configurable base temperature, daily vs monthly aggregation, heating-only, cooling-only, or both) with overlay line and R².
- Temperature response (degree-day) regression overlay for time-series (Hourly): toggle via legend when both an energy and temperature series are selected; offers base temperature, period (daily/monthly), and heating/cooling/both options with model coefficients and R².

### Fixed

- Load Duration Curve now correctly scales y-axis for negative values and draws a zero baseline instead of clipping lines outside chart area.
- Chart tooltips now flip position horizontally/vertically to remain within viewport when hovering near right or top edges.
- Scatter Deg Days: overlay line now renders (previously missing path 'd' when toggled on).
- Scatter Deg Days: corrected model form to period-based `E = b*days + h*HDD + c*CDD` and overlay now plots hourly-average prediction for daily periods (previous version treated b as constant intercept leading to exaggerated slopes and baseload).
- Scatter Deg Days: added help tooltip explaining model terms, units, and why hourly plot shows daily prediction / 24.

## [0.1.1] - 2025-08-18

*No user-facing changes (deployment-only adjustments).*

## [0.1.0] - 2025-08-18

### Added Features

- Load balance chart (derives monthly stacks from required hourly heat balance variables; reports partial data if some categories missing).
- Load balance interactive tooltip with vertical guideline showing per-category percent breakdown (of gains, losses, and total) per month.
- Load balance loading indicator while aggregating data.

### Changed

- Optimized load balance rendering: caching aggregated monthly category totals, reduced redundant frequency filtering, and fewer object creations.

## [0.0.1] - 2025-08-18

### Added (initial release)

- Initial Tailwind refactor and theming with dark mode.
- KPI cards, tariff popover, LDC view, and version badge.
- Changelog modal trigger via version number.

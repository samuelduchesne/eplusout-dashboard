# Changelog

All notable changes to this project will be documented here.

## [Unreleased]

<!-- Keep upcoming changes here. Use subsections Added/Changed/Fixed/Removed when populated. -->
Minor: Signals panel can now be resized horizontally on large screens via a draggable handle between panels; width persists across sessions.

<!-- Keep upcoming changes here. Use subsections Added/Changed/Fixed/Removed when populated. -->

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

# Changelog

All notable changes to this project will be documented here.

## [0.1.0] - 2025-08-18

### Added

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

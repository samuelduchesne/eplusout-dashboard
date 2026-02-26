# EnergyPlus Dashboard

This repository is a Vite + TypeScript static dashboard for exploring EnergyPlus `eplusout.sql` files.

## Quick Start

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`

## Required Quality Checks

Run locally before merge:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

Single command:

- `npm run ci`

E2E smoke:

- `npx playwright install --with-deps chromium`
- `npm run test:e2e`

## Runtime Constraints

- Supported: HTTP(S) hosting (local dev server, GitHub Pages)
- Not supported: opening `index.html` directly via `file://`

## Architecture

- `src/app` bootstrap and runtime orchestration
- `src/data` SQL repository abstractions
- `src/state` state management model
- `src/renderers` chart boundaries
- `src/services` logging/errors/storage/theme
- `src/utils` DOM safety and math helpers
- `src/types` shared domain interfaces

## Security Guidance

- Treat SQL file content as untrusted input.
- Avoid `innerHTML` for data-driven rendering.
- Prefer `textContent` + explicit DOM node creation.

# EnergyPlus Dashboard

EnergyPlus Dashboard is a static web app for exploring `eplusout.sql` simulation data.

## Runtime Support

- Supported: HTTP(S) hosting (local dev server, GitHub Pages)
- Unsupported: opening `index.html` directly with the `file://` protocol

## Tech Stack

- Vite + TypeScript
- Tailwind CSS
- d3
- sql.js (WASM)

## Development

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Open the printed local URL.

## Build

```bash
npm run build
npm run preview
```

## Quality Gates

Run all required checks:

```bash
npm run ci
```

This runs:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

E2E smoke test:

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

## Key Commands

- `npm run dev` - local development server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript checks
- `npm run test` - unit tests
- `npm run test:e2e` - Playwright smoke tests

## Architecture

See [docs/architecture.md](docs/architecture.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

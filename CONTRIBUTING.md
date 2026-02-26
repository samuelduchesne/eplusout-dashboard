# Contributing

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

1. `npm install`
2. `npm run dev`

## Quality Gates

Run before opening a PR:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

Or run all at once:

- `npm run ci`

## E2E Smoke Test

- `npx playwright install --with-deps chromium`
- `npm run test:e2e`

## Release Checklist

1. Update `CHANGELOG.md` (`[Unreleased]` section)
2. Bump `package.json` version
3. Run `npm run ci`
4. Run `npm run build`

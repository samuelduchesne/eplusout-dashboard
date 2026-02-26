# Architecture Overview

## Runtime

- Static frontend built with Vite.
- Deploy target: GitHub Pages over HTTP(S).

## Modules

- `src/app`: bootstrap and application composition.
- `src/data`: SQL data access abstractions.
- `src/state`: global app state management.
- `src/renderers`: chart rendering boundaries.
- `src/services`: logging, storage, theme, errors.
- `src/utils`: DOM safety + math utilities.
- `src/types`: shared domain interfaces.

## Security Model

- Untrusted data from uploaded SQL files is treated as plain text.
- Trusted HTML rendering is constrained to explicit static templates.
- ESLint rules block unsafe unsanitized sinks.

# EnergyPlus Dashboard

This project is a standalone HTML dashboard that works entirely offline. It includes embedded CSS and JavaScript.

## Features

- Standalone HTML file
- Embedded CSS and JavaScript
- Interactive chart (using d3.js, included locally)
- Responsive and modern design (tailwind.css)

## Usage

Just open the `index.html` file in your browser. No server or internet connection is needed.

## Customization


## Development

Formatting is enforced on `index.html` using Prettier via pre-commit.

Setup:

1. Install dependencies: `npm install`
2. Install pre-commit (if not already): `pip install pre-commit` (or use your package manager)
3. Run `pre-commit install` to activate the hook.

Manual formatting: `npm run format`

Note: Only `index.html` is targeted currently. Adjust `.pre-commit-config.yaml` if more files are added.

### Tailwind CSS Build

Tailwind is compiled locally (no CDN at runtime).

Scripts:

- `npm run dev:css` – watch & rebuild `dist/tailwind.css`
- `npm run tailwind` – one-off production build (minified)
- `npm run build` – alias for the production Tailwind build

Source file: `src.css` (contains `@tailwind` directives)

Output: `dist/tailwind.css` (linked from `index.html`)

If you add new HTML templates or files containing Tailwind classes, add them to the `content` array in `tailwind.config.js` so unused styles are purged correctly.

### Deploy to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds Tailwind and publishes the site.

Steps:

- Ensure your default branch is `main`.
- Enable GitHub Pages: Settings → Pages → Source: GitHub Actions.
- Push/merge to `main` (or trigger manually via the workflow dispatch) and the site will deploy.

Artifacts published: `index.html` plus `dist/tailwind.css`.

If you rename branches or add assets, update the workflow accordingly.

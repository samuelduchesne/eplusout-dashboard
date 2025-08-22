# EnergyPlus Dashboard

This project is a standalone HTML dashboard that works entirely offline. It includes embedded CSS and JavaScript.

## Features

- Standalone HTML file
- Embedded CSS and JavaScript
- Interactive chart (using d3.js, included locally)
- Responsive and modern design (tailwind.css)
- Multiple visualization modes: Time Series, Load Duration Curve, Load Balance, and Scatter (correlation between two selected series with regression stats)

## Usage

Just open the `index.html` file in your browser. No server or internet connection is needed.

- Click "Load Sample" in the header to load a small built-in `eplusout.sql` for a quick tour.
- The sample is generated during the build and copied to `dist/eplusout.sql`.
- If the button reports an error, run the build once to create the sample.

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
- `npm run sample:generate` – generate a small sample `assets/eplusout.sql`
- `npm run build` – production build (inject version, compile Tailwind, generate sample, copy assets)

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

### Versioning & Release

The version displayed in the header (and in the changelog modal) is sourced from `package.json` and embedded at build time into `dist/version.js`.

Steps to prepare a release:

1. Update the changelog:
    - Collect unreleased changes under an `## [Unreleased]` section at the top of `CHANGELOG.md` during development.
    - Before releasing, move those entries to a new version section: `## [x.y.z] - YYYY-MM-DD` and leave a fresh empty `## [Unreleased]` above it.
1. Bump the version (choose one):
    - Manual: edit the `"version"` field in `package.json` (e.g. 0.0.1 -> 0.0.2).
    - Automated (also creates a git tag & commit):

```sh
npm version patch   # or minor / major
```

1. Rebuild assets so the embedded version + changelog update:

```sh
npm run build
```

This runs the `version:inject` script generating `dist/version.js` with the new version and changelog content.

1. Commit & push (skip if you used `npm version` which already committed):

```sh
git add package.json CHANGELOG.md dist/version.js
git commit -m "chore(release): x.y.z"
git tag vx.y.z   # skip if npm version already added
git push && git push --tags
```

1. (Optional) Create a GitHub Release referencing the tag and paste the matching changelog section.

Semantic Versioning (SemVer) guideline:

- Increment MAJOR for incompatible changes.
- Increment MINOR for new functionality in a backwards compatible manner.
- Increment PATCH for backwards compatible bug fixes.

If a change affects only tooling/internal scripts and has no user-visible impact, you may defer a release until user-visible changes accumulate.

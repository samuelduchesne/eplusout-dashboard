# EnergyPlus Dashboard

EnergyPlus Dashboard is a standalone HTML5 application for visualizing EnergyPlus simulation data. It works entirely offline using client-side JavaScript, Tailwind CSS, and embedded libraries (sql.js, d3).

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap, Build, and Test the Repository
- Install dependencies: `npm install` (takes ~7 seconds)
- Build the project: `npm run build` (takes ~2 seconds, NEVER CANCEL)
- Format code: `npm run format` (instant, runs Prettier on index.html only)
- Install pre-commit hooks: `pip install pre-commit && pre-commit install` (one-time setup)
- Run pre-commit checks: `pre-commit run --all-files` (takes ~3 seconds on first run)

### Development Workflow
- **Development CSS watch mode**: `npm run dev:css` - watches and rebuilds `dist/tailwind.css` automatically
- **Production build**: `npm run build` - complete build including version injection, CSS compilation, sample generation, and asset copying
- **Individual build steps**:
  - `npm run version:inject` - generates `dist/version.js` with version and changelog
  - `npm run tailwind` - compiles and minifies CSS
  - `npm run sample:generate` - creates sample database (`assets/eplusout.sql`)
  - `npm run assets` - copies assets and vendor libraries to `dist/`

### Run the Application
- Start local server: `python3 -m http.server 8080` or any static file server
- Navigate to `http://localhost:8080`
- The application works entirely offline once loaded

## Validation

### Manual Validation Scenarios
**ALWAYS manually validate any changes by running through these complete scenarios:**

1. **Basic functionality test**:
   - Start local server and navigate to dashboard
   - Click "Open eplusout.sql" button
   - Click "Load Sample" in the modal
   - Verify data loads and charts render correctly
   - Verify statistics display (Annual Energy, EUI, Peak, Load Factor, Cost)

2. **Interface interaction test**:
   - Test signals panel search functionality
   - Test frequency and type filters (Hourly/Monthly, Vars & Meters)
   - Test chart type switching (Time Series, Load Duration, Load Balance, Scatter)
   - Test units toggle (SI/IP)
   - Test dark/light mode switching

3. **Data export test**:
   - Load sample data
   - Test "Export CSV" button functionality
   - Test "View HTML Report" button

### Build Validation
- Always run `npm run build` before committing changes - build takes ~2 seconds, NEVER CANCEL
- Always run `npm run format` to ensure code formatting is correct
- Pre-commit hooks will automatically format `index.html` on commit

## Critical Timing Information

**NEVER CANCEL these commands - they complete quickly:**
- `npm install` - 7 seconds
- `npm run build` - 2 seconds, NEVER CANCEL, set timeout to 30+ seconds
- `pre-commit run --all-files` - 3 seconds on first run, instant thereafter

## Common Tasks

### Repository Structure
```
.
├── index.html              # Main dashboard application
├── package.json           # Node.js dependencies and scripts
├── src.css               # Tailwind CSS source
├── tailwind.config.js    # Tailwind configuration
├── dist/                 # Build output directory
│   ├── tailwind.css     # Compiled CSS
│   ├── version.js       # Embedded version and changelog
│   ├── eplusout.sql     # Sample database
│   └── vendor/          # Bundled libraries (sql.js, d3)
├── scripts/             # Build scripts
│   ├── gen-version.js   # Version injection
│   ├── gen-sample-db.js # Sample database generation
│   └── copy-assets.js   # Asset copying
├── assets/              # Static assets
└── .github/workflows/   # GitHub Actions for deployment
```

### Key Files to Monitor
- **Always check `index.html`** after making changes to the main application
- **Always rebuild (`npm run build`)** after modifying:
  - `package.json` version field
  - `CHANGELOG.md`
  - `src.css`
  - Any scripts in `scripts/` directory
- **Always format (`npm run format`)** before committing changes to `index.html`

### GitHub Actions Deployment
- Deployment happens automatically on push to `main` branch
- Build process: `npm ci && npm run build`
- Deploys to GitHub Pages with `index.html` and `dist/` contents

### Dependencies and Libraries
- **sql.js**: SQLite implementation in WebAssembly for database processing
- **d3**: Data visualization library for charts and graphs
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Prettier**: Code formatting for HTML

### Troubleshooting
- If Tailwind CSS changes don't appear, run `npm run tailwind` to rebuild
- If version doesn't update in UI, run `npm run version:inject` and refresh browser
- If sample data doesn't load, check `dist/eplusout.sql` exists after `npm run build`
- For offline functionality issues, verify vendor libraries in `dist/vendor/` directory

## Changelog Maintenance

- Whenever a user-visible feature is added, changed, fixed, or removed, add an entry to `CHANGELOG.md` under an `## [Unreleased]` section (create it if missing) with one of the categorized subsections: `### Added`, `### Changed`, `### Fixed`, `### Removed`.
- On version bump (package.json `version` change), promote the `Unreleased` entries to a new version heading: `## [x.y.z] - YYYY-MM-DD` and start a fresh empty `Unreleased` section above it.
- Ensure the build is re-run (`npm run build`) so the embedded changelog and version variables (`dist/version.js`) reflect the latest changes.
- If no user-visible changes occurred (e.g., dev tooling only), you may skip updating the changelog for that commit, but DO document any release version tag.
- Keep headings and list formatting consistent (blank line after headings, lists surrounded by blank lines) to satisfy markdown lint.

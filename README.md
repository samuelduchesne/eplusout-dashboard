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

# Source Code Restructuring Guide

This document outlines the intelligent reorganization of the monolithic `index.html` file into a modular `/src` directory structure while maintaining the standalone, offline-capable nature of the EnergyPlus Dashboard.

## 🎯 Objectives

- **Maintainability**: Break down the 6000-line monolithic file into logical, focused modules
- **Developer Experience**: Enable multiple developers to work on different parts simultaneously
- **Separation of Concerns**: Organize code by functionality (HTML structure, JavaScript modules, etc.)
- **Preserve Functionality**: Maintain the standalone, offline nature of the final application
- **Build Integration**: Seamlessly integrate with existing build pipeline

## 📁 New Directory Structure

```
src/
├── html/
│   ├── head.html              # Document head, meta tags, scripts, styles
│   ├── header.html            # Main header with navigation buttons
│   ├── main.html              # Main content layout (signals panel, charts)
│   └── modals/
│       ├── open-file.html     # File open dialog
│       ├── changelog.html     # What's New modal
│       ├── units-settings.html # Units configuration modal
│       └── html-report.html   # HTML report viewer modal
├── js/
│   ├── core/
│   │   ├── utils.js           # Utility functions, constants, DOM helpers
│   │   ├── theme.js           # Theme management (light/dark mode)
│   │   └── library-loader.js  # D3/SQL.js dynamic loading
│   ├── data/
│   │   ├── database.js        # SQLite database operations
│   │   ├── signals.js         # Signal processing and filtering
│   │   └── export.js          # CSV export functionality
│   ├── ui/
│   │   ├── modals.js          # Modal dialogs management
│   │   ├── filters.js         # Signal filtering controls
│   │   ├── charts.js          # Chart rendering (time series, LDC, etc.)
│   │   └── reports.js         # HTML report generation
│   └── app.js                 # Application initialization
└── css/
    └── custom.css             # Any additional custom CSS (optional)
```

## 🔧 Build Process

### New Build Script: `scripts/build-src.js`

The new build script assembles the modular source files back into a single `index.html`:

```javascript
// Reads all modules from /src and concatenates them intelligently
// Maintains original standalone file structure
// Preserves all functionality and offline capabilities
```

### Updated npm Scripts

```json
{
  "build:src": "node scripts/build-src.js",
  "build": "npm run version:inject && npm run tailwind && npm run sample:generate && npm run assets && npm run build:src"
}
```

### Build Flow

1. **Version Injection**: `npm run version:inject` - Generates version info
2. **CSS Compilation**: `npm run tailwind` - Compiles Tailwind CSS
3. **Sample Generation**: `npm run sample:generate` - Creates sample database
4. **Assets Copy**: `npm run assets` - Copies vendor libraries and assets
5. **Source Assembly**: `npm run build:src` - **NEW** - Assembles modular sources into `index.html`

## 📋 Migration Guide

### Phase 1: Extract HTML Structure
- [x] Extract `<head>` section → `src/html/head.html`
- [x] Extract header with navigation → `src/html/header.html`
- [x] Extract main content layout → `src/html/main.html`
- [x] Extract modal dialogs → `src/html/modals/*.html`

### Phase 2: Extract JavaScript Modules
- [x] Extract core utilities → `src/js/core/utils.js`
- [x] Extract theme management → `src/js/core/theme.js`
- [x] Extract modal management → `src/js/ui/modals.js`
- [x] Extract app initialization → `src/js/app.js`
- [ ] Extract database operations → `src/js/data/database.js`
- [ ] Extract signal processing → `src/js/data/signals.js`
- [ ] Extract chart rendering → `src/js/ui/charts.js`
- [ ] Extract report generation → `src/js/ui/reports.js`

### Phase 3: Full Modularization (Future)
- [ ] Complete extraction of remaining ~4000 lines of JavaScript
- [ ] Implement proper module dependencies
- [ ] Add JSDoc documentation for all modules
- [ ] Consider TypeScript for better development experience

## 🎯 Benefits Achieved

### For Developers
- **Focused Files**: Each file has a single, clear responsibility
- **Easier Navigation**: Find specific functionality quickly
- **Reduced Merge Conflicts**: Multiple developers can work on different modules
- **Better Code Review**: Smaller, focused changes are easier to review

### For Maintainability
- **Logical Organization**: Related functionality is grouped together
- **Separation of Concerns**: HTML, CSS, and JavaScript are properly separated
- **Reusable Modules**: Common functionality can be shared across components
- **Easier Testing**: Individual modules can be tested in isolation

### For Build Process
- **Backward Compatibility**: Existing build commands continue to work
- **Standalone Output**: Still produces a single, offline-capable `index.html`
- **Development Flexibility**: Source can be modular while deployment remains simple

## 🔄 Development Workflow

### Working with Modular Sources

1. **Edit source files** in `/src` directory
2. **Run build process**: `npm run build`
3. **Test the output**: Open `index.html` in browser
4. **Commit both source and built files**

### File Watching (Development)

```bash
# Watch CSS changes (existing)
npm run dev:css

# For JavaScript changes, you'll need to run build:src manually
# (Future enhancement: add file watching for JS modules)
```

## 🚀 Future Enhancements

### Immediate Opportunities
1. **Complete the modularization** by extracting remaining JavaScript
2. **Add module documentation** with JSDoc comments
3. **Implement file watching** for JavaScript modules during development

### Advanced Opportunities
1. **TypeScript conversion** for better type safety and IDE support
2. **Module bundling** with tools like Rollup or esbuild
3. **Component-based architecture** for better code organization
4. **Unit testing framework** for individual modules

## ⚠️ Important Notes

### Maintaining Standalone Nature
- The final `index.html` remains a single, self-contained file
- All JavaScript is inlined (no external module loading at runtime)
- Offline functionality is preserved
- No additional dependencies for end users

### Deployment Considerations
- GitHub Actions workflow continues to work unchanged
- The built `index.html` is what gets deployed to GitHub Pages
- Source files in `/src` are for development only

### Backward Compatibility
- All existing npm scripts continue to work
- The final output is functionally identical to the original
- No breaking changes for end users

## 📝 Example Usage

```bash
# Install dependencies
npm install

# Full build (includes source assembly)
npm run build

# Development workflow
1. Edit files in /src directory
2. Run: npm run build:src
3. Test in browser
4. Commit changes
```

This restructuring provides a solid foundation for future development while maintaining all the benefits of the current standalone approach.
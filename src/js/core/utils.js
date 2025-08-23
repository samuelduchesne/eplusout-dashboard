      /**
       * @fileoverview Core utility functions and constants for the EnergyPlus Dashboard
       * Provides global state management, unit conversion system, formatting functions, 
       * and application constants.
       * @author EnergyPlus Dashboard
       */

      /**
       * @namespace StorageKeys
       * @description Local storage keys for user preferences and application state
       */
      
      /** @const {string} Theme preference storage key */
      const THEME_KEY = 'eplus_theme';
      
      /** @const {string} Units system preference storage key (SI/IP) */
      const UNITS_KEY = 'eplus_units_mode';
      
      /** @const {string} Favorite signals storage key */
      const FAVORITES_KEY = 'eplus_favs';
      
      /** @const {string} Selected signals storage key */
      const SELECT_KEY = 'eplus_selected_ids';
      
      /** @const {string} Signals panel collapse state storage key */
      const COLLAPSE_KEY = 'eplus_signals_collapsed';
      
      /** @const {string} SI temperature unit preference storage key */
      const TEMP_SI_KEY = 'eplus_temp_si';
      
      /** @const {string} IP temperature unit preference storage key */
      const TEMP_IP_KEY = 'eplus_temp_ip';

      /** @const {string} SI energy unit preference storage key */
      const ENERGY_SI_KEY = 'eplus_energy_si';
      
      /** @const {string} IP energy unit preference storage key */
      const ENERGY_IP_KEY = 'eplus_energy_ip';
      
      /** @const {string} IP power unit preference storage key */
      const POWER_IP_KEY = 'eplus_power_ip';

      /**
       * @namespace GlobalState
       * @description Global application state variables for database, UI, and chart management
       */
      
      /** @type {Map<number, Object>} Currently selected signals/meters */
      let selected = new Map();
      
      /** @type {Set<number>} User's favorite signals/meters */
      let favs = new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'));
      
      /** @type {boolean} Whether chart zooming is enabled */
      let zoomEnabled = true;
      
      /** @type {string|null} Base frequency for data resampling */
      let baseFreq = null;
      
      /** @type {string} Current chart view mode */
      let viewMode = 'time';
      
      /** @type {string} Data resampling mode */
      let resampleMode = 'original';
      
      /** @type {string} Aggregation method for resampling */
      let resampleAgg = 'auto';
      
      /** @type {Array<number>|null} Signal pair for scatter plots */
      let scatterPair = null;
      
      /** @type {boolean} Whether to show regression line in scatter plots */
      let scatterShowRegression = true;
      
      /** @type {boolean} Whether to show degree day analysis in scatter plots */
      let scatterShowDegDay = false;
      
      /** @type {number} Base temperature for degree day calculations */
      let scatterDegDayBaseTemp = 18;
      
      /** @type {string} Period for degree day calculations */
      let scatterDegDayPeriod = 'daily';
      
      /** @type {string} Degree day calculation mode */
      let scatterDegDayMode = 'both';
      
      /** @type {boolean} Whether temperature response is enabled */
      let tempRespEnabled = false;
      
      /** @type {number} Base temperature for temperature response */
      let tempRespBaseTemp = 18;
      
      /** @type {string} Period for temperature response */
      let tempRespPeriod = 'daily';
      
      /** @type {string} Temperature response mode */
      let tempRespMode = 'both';
      
      /** @type {Object|null} Temperature response model */
      let tempRespModel = null;
      
      /** @type {Array<number>|null} Current X-axis domain for charts */
      let currentXDomain = null;
      
      /** @type {boolean} Internal flag to prevent render loops */
      let __rendering = false;
      
      /** @type {Object|null} Cached load balance data */
      let __loadBalanceCache = null;

      // Units system preferences
      let isIP = localStorage.getItem(UNITS_KEY) === 'IP' ? true : false;
      let prefEnergySI = localStorage.getItem(ENERGY_SI_KEY) || 'J';
      let prefEnergyIP = localStorage.getItem(ENERGY_IP_KEY) || 'BTU';
      let prefPowerIP = localStorage.getItem(POWER_IP_KEY) || 'Btu/h';
      let prefTempSI = localStorage.getItem(TEMP_SI_KEY) || 'C';
      let prefTempIP = localStorage.getItem(TEMP_IP_KEY) || 'F';

      // Chart palette derived from Tailwind color tokens
      const palette = [
        '#1565c0', '#c62828', '#2e7d32', '#ed6c02', '#5e35b1',
        '#d81b60', '#00695c', '#ef6c00', '#1976d2', '#388e3c',
        '#f57c00', '#7b1fa2', '#c2185b', '#0097a7', '#fbc02d',
        '#455a64', '#6a1b9a', '#00796b', '#f9a825', '#424242'
      ];

      // DOM utility function
      const $ = (id) => document.getElementById(id);

      function getPreferredTheme() {
        const s = localStorage.getItem(THEME_KEY);
        return s === 'light' || s === 'dark'
          ? s
          : matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
      }

      function escapeHtml(s) {
        return String(s).replace(
          /[&<>"']/g,
          (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m],
        );
      }

      function mdToHtml(md) {
        const lines = md.split(/\r?\n/);
        let html = '',
          listOpen = false;
        for (const raw of lines) {
          const line = raw.trimEnd();
          if (!line) {
            if (listOpen) {
              html += '</ul>';
              listOpen = false;
            }
            html += '';
            continue;
          }
          if (line.startsWith('### ')) {
            if (listOpen) {
              html += '</ul>';
              listOpen = false;
            }
            html += '<h3 class="mt-4 text-sm font-semibold">' + escapeHtml(line.slice(4)) + '</h3>';
            continue;
          }
          if (line.startsWith('## ')) {
            if (listOpen) {
              html += '</ul>';
              listOpen = false;
            }
            html +=
              '<h2 class="mt-5 text-base font-semibold">' + escapeHtml(line.slice(3)) + '</h2>';
            continue;
          }
          if (line.startsWith('# ')) {
            if (listOpen) {
              html += '</ul>';
              listOpen = false;
            }
            html += '<h1 class="mt-5 text-lg font-bold">' + escapeHtml(line.slice(2)) + '</h1>';
            continue;
          }
          if (line.startsWith('- ')) {
            if (!listOpen) {
              html += '<ul class="list-disc ml-5 mt-2 space-y-1">';
              listOpen = true;
            }
            html += '<li class="text-xs">' + escapeHtml(line.slice(2)) + '</li>';
            continue;
          }
          // paragraph
          if (listOpen) {
            html += '</ul>';
            listOpen = false;
          }
          html += '<p class="text-xs leading-relaxed mt-2">' + escapeHtml(line) + '</p>';
        }
        if (listOpen) html += '</ul>';
        return html;
      }

      // Unit conversion functions
      function unitKind(units) {
        const u = String(units).toLowerCase();
        if (
          u.includes('wh') ||
          u.includes('joule') ||
          u === 'j' ||
          u.includes('kwh') ||
          u.includes('mwh')
        )
          return 'energy';
        if (
          u.includes('btu/h') ||
          u.includes('btuh') ||
          /\bw(?!h)\b/.test(u) ||
          u.includes('watt') ||
          u.includes('ton')
        )
          return 'power';
        if (
          u === 'c' ||
          u.includes('celsius') ||
          u === 'k' ||
          u.includes('kelvin') ||
          u === 'f' ||
          u.includes('fahrenheit')
        )
          return 'temperature';
        return 'other';
      }
      
      function toJoules(value, units) {
        const u = String(units || '').toLowerCase();
        if (u.includes('mwh')) return value * 3.6e9;
        if (u.includes('kwh')) return value * 3.6e6;
        if (u.includes('wh')) return value * 3600;
        if (u.includes('joule') || u === 'j') return value;
        return null;
      }

      // Fallback functions to prevent recursion
      const __orig_convertUnits = (v) => v;
      const __orig_convertUnitLabel = (u) => u || '';

      function convertUnits(value, units) {
        if (value == null || !isFinite(value)) return value;
        if (!units) return value;
        const kind = unitKind(units);
        if (isIP) {
          const u = String(units).toLowerCase();
          if (u === 'c' || u.includes('celsius')) return (value * 9) / 5 + 32;
          if (kind === 'energy') {
            let J = toJoules(value, units);
            if (J == null) J = value;
            let btu = J / 1055.06;
            if (prefEnergyIP === 'kBTU') return btu / 1e3;
            if (prefEnergyIP === 'MMBTU') return btu / 1e6;
            return btu;
          }
          if (kind === 'power') {
            let v = value;
            const ul = String(units).toLowerCase();
            if (ul.includes('w') && !ul.includes('wh')) v = value * 3.412141633;
            if (prefPowerIP === 'Tons') return v / 12000;
            return v;
          }
          if (kind === 'temperature') {
            if (prefTempIP === 'F') {
              if (/c|celsius/.test(String(units).toLowerCase())) return (value * 9) / 5 + 32;
              if (/k|kelvin/.test(String(units).toLowerCase()))
                return ((value - 273.15) * 9) / 5 + 32;
            }
            return value;
          }
          return __orig_convertUnits(value, units);
        } else {
          if (kind === 'energy') {
            let J = toJoules(value, units);
            if (J == null) J = value;
            if (prefEnergySI === 'kWh') return J / 3.6e6;
            if (prefEnergySI === 'MWh') return J / 3.6e9;
            return J;
          }
          if (kind === 'temperature') {
            const ul = String(units).toLowerCase();
            let cVal;
            if (ul === 'c' || ul.includes('celsius')) cVal = value;
            else if (ul === 'k' || ul.includes('kelvin')) cVal = value - 273.15;
            else if (ul === 'f' || ul.includes('fahrenheit')) cVal = ((value - 32) * 5) / 9;
            else cVal = value;
            if (prefTempSI === 'K') return cVal + 273.15;
            return cVal; // C
          }
          return __orig_convertUnits(value, units);
        }
      }
      
      function convertUnitLabel(units) {
        if (!units) return units || '';
        const kind = unitKind(units);
        if (isIP) {
          const u = String(units).toLowerCase();
          if (u === 'c' || u.includes('celsius')) return 'F';
          if (kind === 'energy') return prefEnergyIP;
          if (kind === 'power') return prefPowerIP === 'Tons' ? 'tons' : 'Btu/h';
          if (kind === 'temperature') return prefTempIP;
          return __orig_convertUnitLabel(units);
        } else {
          if (kind === 'energy') return prefEnergySI;
          if (kind === 'temperature') return prefTempSI;
          return __orig_convertUnitLabel(units);
        }
      }

      // Core utility functions
      function chartColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
          grid: isDark ? '#374151' : '#e5e7eb',
          text: isDark ? '#d1d5db' : '#374151',
          muted: isDark ? '#6b7280' : '#9ca3af',
          bg: isDark ? '#111827' : '#ffffff',
        };
      }

      function toObjects(result) {
        if (!result[0]) return [];
        const cols = result[0].columns;
        return result[0].values.map((row) => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
      }

      function quantile(sorted, p) {
        if (sorted.length === 0) return null;
        const i = (sorted.length - 1) * p;
        const lower = Math.floor(i);
        const upper = Math.ceil(i);
        const w = i % 1;
        return sorted[lower] * (1 - w) + sorted[upper] * w;
      }

      function computeStats(values) {
        const finite = values.filter(isFinite);
        if (!finite.length) return { count: 0 };
        const sorted = [...finite].sort((a, b) => a - b);
        const sum = finite.reduce((a, b) => a + b, 0);
        return {
          count: finite.length,
          sum,
          mean: sum / finite.length,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          q1: quantile(sorted, 0.25),
          median: quantile(sorted, 0.5),
          q3: quantile(sorted, 0.75),
        };
      }

      function fmt(n) {
        if (!isFinite(n)) return '—';
        const abs = Math.abs(n);
        if (abs >= 1e9) return (n / 1e9).toFixed(1) + 'G';
        if (abs >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'k';
        return n.toFixed(abs < 10 ? 2 : abs < 100 ? 1 : 0);
      }

      // Alias for fmt function (used in chart rendering)
      const formatValue = fmt;

      function kpiFmt(n, opts = {}) {
        if (!isFinite(n)) return '—';
        const { compact = true, maxDigits = 3, forceSign = false } = opts;
        const abs = Math.abs(n);
        const sign = forceSign && n > 0 ? '+' : '';
        if (compact && abs >= 1e9) return sign + (n / 1e9).toFixed(1) + 'G';
        if (compact && abs >= 1e6) return sign + (n / 1e6).toFixed(1) + 'M';
        if (compact && abs >= 1e3) return sign + (n / 1e3).toFixed(1) + 'k';
        if (abs >= 100) return sign + n.toFixed(0);
        if (abs >= 10) return sign + n.toFixed(Math.min(1, maxDigits - 2));
        if (abs >= 1) return sign + n.toFixed(Math.min(2, maxDigits - 1));
        if (abs >= 0.1) return sign + n.toFixed(Math.min(3, maxDigits));
        if (abs >= 0.01) return sign + n.toFixed(Math.min(4, maxDigits + 1));
        return sign + n.toExponential(Math.max(0, maxDigits - 1));
      }

      function downloadFile(name, text) {
        try {
          const blob = new Blob([text], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = name;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error('Download failed', e);
        }
      }
      // Core utility functions and constants
      
      const THEME_KEY = 'eplus_theme';
      const UNITS_KEY = 'eplus_units_mode';
      const FAVORITES_KEY = 'eplus_favs';
      const SELECT_KEY = 'eplus_selected_ids';
      const COLLAPSE_KEY = 'eplus_signals_collapsed';
      const TEMP_SI_KEY = 'eplus_temp_si';
      const TEMP_IP_KEY = 'eplus_temp_ip';

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
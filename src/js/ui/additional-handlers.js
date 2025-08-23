      /**
       * @fileoverview Additional UI event handlers for main application buttons
       * Provides export functionality and other missing event handlers
       * @author EnergyPlus Dashboard
       */

      /**
       * Export selected data as CSV
       */
      function handleExport() {
        if (selected.size === 0) return;
        downloadFile('series.csv', exportCSV(selected));
      }

      /**
       * Handle dictionary double-click for favorites
       * @param {Event} e - The double-click event
       */
      function handleDictionaryDoubleClick(e) {
        const sel = $('dictionary');
        const opt = sel.selectedOptions[0];
        if (!opt) return;
        const id = Number(opt.value);
        if (favs.has(id)) favs.delete(id);
        else favs.add(id);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
        populateDictionaryList();
      }

      /**
       * Setup additional UI event handlers
       */
      function setupAdditionalEventHandlers() {
        // Export button
        const btnExport = $('btn-export');
        if (btnExport) {
          btnExport.addEventListener('click', handleExport);
        }

        // Dictionary double-click for favorites
        const dictionary = $('dictionary');
        if (dictionary) {
          dictionary.addEventListener('dblclick', handleDictionaryDoubleClick);
        }

        // Enable theme toggle if it exists
        const themeToggle = $('theme-toggle');
        if (themeToggle) {
          themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem(THEME_KEY, next);
          });
        }

        // Enable units settings if they exist
        const unitsSettings = ['energy-si', 'energy-ip', 'power-ip', 'temp-si', 'temp-ip'];
        unitsSettings.forEach(id => {
          const el = $(id);
          if (el) {
            el.addEventListener('change', () => {
              // Update unit preferences based on setting changes
              if (id === 'energy-si') prefEnergySI = el.value;
              if (id === 'energy-ip') prefEnergyIP = el.value;
              if (id === 'power-ip') prefPowerIP = el.value;
              if (id === 'temp-si') prefTempSI = el.value;
              if (id === 'temp-ip') prefTempIP = el.value;
              
              // Save to localStorage
              localStorage.setItem(id.replace('-', '_').toUpperCase() + '_KEY', el.value);
              
              // Re-render if data is loaded
              if (selected.size > 0) {
                renderAll();
              }
            });
          }
        });
      }
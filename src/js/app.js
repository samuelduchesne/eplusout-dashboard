      // Application initialization and setup
      
      // Core file handling function
      async function handleFile(file) {
        await readDbFile(file);
        // Preload D3 early to avoid race when first render triggers before script loads
        try {
          await ensureD3();
        } catch (e) {
          console.warn('d3 preload failed', e);
        }
        const list = queryDictionary();
        populateFilters(list);
        populateDictionaryList();
        populateZoneQuick();
        restoreSelection();
        // Enable HTML report button now that database is loaded
        const btnHtmlReport = $('btn-html-report');
        if (btnHtmlReport) btnHtmlReport.disabled = false;
        // If nothing selected from previous session, auto-select the first meter
        if (selected.size === 0) {
          const firstMeter = list.find((d) => d.IsMeter == 1);
          if (firstMeter) {
            const sel = $('dictionary');
            if (sel) {
              for (const option of sel.options) {
                if (Number(option.value) === firstMeter.id) {
                  option.selected = true;
                  break;
                }
              }
              handleSelectionChange();
            }
          }
        }
      }

      // Setup event listeners for UI controls
      function setupEventListeners() {
        // Dictionary selection
        const dictionary = $('dictionary');
        if (dictionary) {
          dictionary.addEventListener('change', handleSelectionChange);
        }

        // Filter controls
        const filters = ['search', 'filter-freq', 'filter-meter', 'filter-group', 'fav-only'];
        filters.forEach(id => {
          const el = $(id);
          if (el) {
            el.addEventListener('change', populateDictionaryList);
            if (el.tagName === 'INPUT') {
              el.addEventListener('input', populateDictionaryList);
            }
          }
        });

        // Units toggle
        const btnUnits = $('btn-units');
        if (btnUnits) {
          btnUnits.textContent = isIP ? 'IP' : 'SI';
          btnUnits.addEventListener('click', () => {
            isIP = !isIP;
            btnUnits.textContent = isIP ? 'IP' : 'SI';
            localStorage.setItem(UNITS_KEY, isIP ? 'IP' : 'SI');
            renderAll();
          });
        }

        // View mode buttons
        const viewButtons = [
          { id: 'btn-time', mode: 'time' },
          { id: 'btn-ldc', mode: 'ldc' },
          { id: 'btn-balance', mode: 'balance' },
          { id: 'btn-scatter', mode: 'scatter' }
        ];

        viewButtons.forEach(({ id, mode }) => {
          const btn = $(id);
          if (btn) {
            btn.addEventListener('click', () => {
              viewMode = mode;
              // Update button states
              viewButtons.forEach(({ id: otherId }) => {
                const otherBtn = $(otherId);
                if (otherBtn) {
                  if (otherId === id) {
                    otherBtn.classList.add('bg-panel-2', 'dark:bg-panel-2-dark');
                  } else {
                    otherBtn.classList.remove('bg-panel-2', 'dark:bg-panel-2-dark');
                  }
                }
              });
              renderAll();
            });
          }
        });

        // Load sample button
        const btnLoadSample = $('btn-load-sample');
        if (btnLoadSample) {
          btnLoadSample.addEventListener('click', async () => {
            try {
              await readDbUrl('dist/eplusout.sql');
              try {
                await ensureD3();
              } catch (e) {
                console.warn('d3 preload failed', e);
              }
              const list = queryDictionary();
              populateFilters(list);
              populateDictionaryList();
              populateZoneQuick();
              restoreSelection();
              const btnHtmlReport = $('btn-html-report');
              if (btnHtmlReport) btnHtmlReport.disabled = false;
              if (selected.size === 0 && list.length) {
                const firstMeter = list.find((d) => d.IsMeter == 1) || list[0];
                if (firstMeter) {
                  const sel = $('dictionary');
                  if (sel) {
                    for (const option of sel.options) {
                      option.selected = Number(option.value) === firstMeter.id;
                    }
                    handleSelectionChange();
                  }
                }
              }
              // Close modal after loading
              const modal = $('open-modal');
              if (modal) modal.classList.add('hidden');
            } catch (err) {
              console.error('Sample load failed', err);
              alert('Failed to load sample: ' + (err?.message || String(err)));
            }
          });
        }
      }

      // Inject app version (fallback to hardcoded package.json version if no build replacement)
      (function setAppVersion() {
        try {
          const v = window.__APP_VERSION__ || '0.0.1';
          const el = document.getElementById('app-version');
          if (el) el.textContent = 'v' + v;
        } catch {}
      })();

      // New Issue launcher
      (function setupIssueButton() {
        const btn = document.getElementById('btn-report');
        if (!btn) return;
        btn.addEventListener('click', () => {
          try {
            const ghOwner = 'samuelduchesne';
            const ghRepo = 'eplusout-dashboard';
            const version = (window.__APP_VERSION__ || '').trim() || 'dev';
            const theme = document.documentElement.getAttribute('data-theme') || '';
            const units = localStorage.getItem('eplus_units_mode') || 'SI';
            const browser = navigator.userAgent;
            const body = encodeURIComponent(`**Version:** ${version}
**Theme:** ${theme}
**Units:** ${units}
**Browser:** ${browser}

**Issue Description:**

(Please describe your issue or feature request here)`);
            const url = `https://github.com/${ghOwner}/${ghRepo}/issues/new?body=${body}`;
            window.open(url, '_blank');
          } catch (e) {
            console.warn('Failed to open issue URL', e);
          }
        });
      })();

      // Initialize the application
      function initializeApp() {
        console.log('[app] Initializing EnergyPlus Dashboard');
        setupEventListeners();
        
        // Set initial view mode
        const btnTime = $('btn-time');
        if (btnTime) {
          btnTime.classList.add('bg-panel-2', 'dark:bg-panel-2-dark');
        }
        
        console.log('[app] Application initialized successfully');
      }

      // Auto-initialize when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
      } else {
        initializeApp();
      }
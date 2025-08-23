      /**
       * @fileoverview File handling functionality for database loading
       * Provides file input, drag-and-drop, and database opening capabilities
       * @author EnergyPlus Dashboard
       */

      /**
       * Show the file opening modal
       */
      function showOpen() {
        const modal = $('open-modal');
        const backdrop = $('open-backdrop');
        const mainGrid = $('main-grid');
        
        if (modal) modal.classList.remove('hidden');
        if (backdrop) backdrop.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        if (mainGrid) mainGrid.setAttribute('inert', '');
        
        // Ensure dropzone is initialized
        const dropZone = $('open-drop');
        if (dropZone) enableDropZone(dropZone);
      }

      /**
       * Hide the file opening modal
       */
      function hideOpen() {
        const modal = $('open-modal');
        const backdrop = $('open-backdrop');
        const mainGrid = $('main-grid');
        
        if (modal) modal.classList.add('hidden');
        if (backdrop) backdrop.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        if (mainGrid) mainGrid.removeAttribute('inert');
      }

      /**
       * Enable drag and drop functionality for a drop zone element
       * @param {HTMLElement} el - The drop zone element
       */
      function enableDropZone(el) {
        if (!el) return;
        
        const highlight = () =>
          el.classList.add(
            'ring-2',
            'ring-accent',
            'dark:ring-accent-dark',
            'ring-offset-2',
            'ring-offset-panel',
            'dark:ring-offset-panel-dark',
          );
        
        const unhighlight = () =>
          el.classList.remove(
            'ring-2',
            'ring-accent',
            'dark:ring-accent-dark',
            'ring-offset-2',
            'ring-offset-panel',
            'dark:ring-offset-panel-dark',
          );
        
        ['dragenter', 'dragover'].forEach((evt) =>
          el.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            highlight();
          }),
        );
        
        ['dragleave', 'drop'].forEach((evt) =>
          el.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            unhighlight();
          }),
        );
        
        el.addEventListener('drop', async (e) => {
          const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
          if (f) {
            try {
              await handleFile(f);
              hideOpen();
            } catch (err) {
              console.warn('Drop file load failed', err);
              alert('Failed to open database: ' + (err && err.message ? err.message : String(err)));
            }
          }
        });
      }

      /**
       * Handle file input change events
       * @param {Event} e - The change event
       */
      async function handleFileInputChange(e) {
        try {
          const f = e.target.files && e.target.files[0];
          if (!f) return; // cancelled
          await handleFile(f);
          hideOpen();
        } catch (err) {
          console.warn('File load failed', err);
          alert('Failed to open database: ' + (err && err.message ? err.message : String(err)));
        }
      }

      /**
       * Setup file handling event listeners
       */
      function setupFileHandling() {
        // Open button
        const btnOpen = $('btn-open');
        if (btnOpen) {
          btnOpen.addEventListener('click', showOpen);
        }

        // Modal close handlers
        const openClose = $('open-close');
        const openBackdrop = $('open-backdrop');
        if (openClose) openClose.addEventListener('click', hideOpen);
        if (openBackdrop) openBackdrop.addEventListener('click', hideOpen);

        // File input handlers
        const fileInput = $('file-input');
        if (fileInput) {
          fileInput.addEventListener('click', (e) => {
            // Ensure same-file re-selection triggers change on all browsers
            try {
              e.target.value = '';
            } catch {}
          });
          fileInput.addEventListener('change', handleFileInputChange);
        }

        // Load sample button
        const btnLoadSample = $('open-load-sample');
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
              hideOpen();
            } catch (err) {
              console.error('Sample load failed', err);
              alert('Failed to load sample: ' + (err?.message || String(err)));
            }
          });
        }

        // Initialize dropzone for existing modal
        const dropZone = $('open-drop');
        if (dropZone) enableDropZone(dropZone);

        // Global body drag-and-drop
        enableBodyDropZone();
      }

      /**
       * Enable drag and drop on the entire body for convenience
       */
      function enableBodyDropZone() {
        document.body.addEventListener('dragover', (e) => {
          e.preventDefault();
        });

        document.body.addEventListener('drop', async (e) => {
          e.preventDefault();
          const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
          if (f && f.name.match(/\.(sql|sqlite|db)$/i)) {
            try {
              await handleFile(f);
            } catch (err) {
              console.warn('Body drop file load failed', err);
              alert('Failed to open database: ' + (err && err.message ? err.message : String(err)));
            }
          }
        });
      }
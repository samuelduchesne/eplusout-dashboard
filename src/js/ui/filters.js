      // UI filters and data dictionary management
      
      function populateFilters(list) {
        const groups = Array.from(new Set(list.map((d) => d.IndexGroup).filter(Boolean))).sort();
        const gSel = $('filter-group');
        if (gSel) {
          gSel.innerHTML =
            `<option value="">Any index group</option>` +
            groups.map((g) => `<option>${escapeHtml(g)}</option>`).join('');
        }
        ['search', 'filter-freq', 'filter-meter', 'filter-group', 'dictionary', 'fav-only'].forEach(
          (id) => {
            const el = $(id);
            if (el) el.disabled = false;
          }
        );
        const countEl = $('meta-count');
        if (countEl) countEl.textContent = `${list.length} entries`;
      }

      function populateDictionaryList() {
        const q = ($('search')?.value || '').trim().toLowerCase();
        const fFreq = $('filter-freq')?.value || '';
        const fMeter = $('filter-meter')?.value || '';
        const fGroup = $('filter-group')?.value || '';
        const onlyFav = $('fav-only')?.checked || false;
        
        const filtered = dict.filter((d) => {
          if (fFreq && d.freq !== fFreq) return false;
          if (fMeter !== '' && String(d.IsMeter) !== fMeter) return false;
          if (fGroup && d.IndexGroup !== fGroup) return false;
          if (onlyFav && !favs.has(d.id)) return false;
          const hay = `${d.Name} ${d.IndexGroup || ''} ${d.key || ''} ${
            d.Units || ''
          }`.toLowerCase();
          return !q || hay.includes(q);
        });
        
        const sel = $('dictionary');
        if (sel) {
          sel.innerHTML = filtered
            .map((d) => {
              const star = favs.has(d.id) ? '★ ' : '';
              const tag = d.IsMeter ? 'M' : 'V';
              const units = d.Units ? ` [${escapeHtml(convertUnitLabel(d.Units))}]` : '';
              const key = d.key ? ` (${escapeHtml(d.key)})` : '';
              const label = `${star}${d.freq} | ${d.IndexGroup || '—'} | [${tag}] ${escapeHtml(
                d.Name,
              )}${key}${units}`;
              return `<option value="${d.id}">${label}</option>`;
            })
            .join('');
        }
        
        const countEl = $('meta-count');
        if (countEl) countEl.textContent = `${filtered.length} / ${dict.length}`;
      }

      function populateZoneQuick() {
        // Placeholder for zone quick-select functionality
        console.log('[filters] populateZoneQuick called');
      }

      // Handle selection changes in the dictionary
      function handleSelectionChange() {
        try {
          const sel = $('dictionary');
          if (!sel) return;
          
          const chosen = Array.from(sel.selectedOptions).map((opt) => parseInt(opt.value));
          if (chosen.length === 0) {
            selected.clear();
            baseFreq = null;
            currentXDomain = null;
            renderAll();
            return;
          }
          
          const first = dict.find((d) => d.id === chosen[0]);
          const newFreq = first?.freq || 'Hourly';
          if (newFreq !== baseFreq) currentXDomain = null;
          baseFreq = newFreq;
          
          for (const id of chosen) {
            const meta = dict.find((d) => d.id === id);
            if (!meta || meta.freq !== baseFreq) continue;
            if (!selected.has(id)) {
              const rows = queryTimeSeries(id);
              const pts = baseFreq === 'Hourly' ? toHourlyPoints(rows) : toMonthlyPoints(rows);
              selected.set(id, { meta, points: pts, visible: true });
            }
          }
          
          for (const id of [...selected.keys()]) {
            if (!chosen.includes(id)) selected.delete(id);
          }
          
          renderAll();
        } catch (e) {
          console.error('Selection change failed', e);
        }
      }

      function restoreSelection() {
        try {
          const stored = JSON.parse(localStorage.getItem(SELECT_KEY) || '[]');
          if (Array.isArray(stored) && stored.length > 0) {
            const sel = $('dictionary');
            if (sel) {
              Array.from(sel.options).forEach((opt) => {
                opt.selected = stored.includes(parseInt(opt.value));
              });
              handleSelectionChange();
            }
          }
        } catch (e) {
          console.warn('Selection restore failed', e);
        }
      }

      // Chart rendering and theme management
      
      function refreshChartTheme() {
        if (selected.size === 0) return;
        renderAll();
      }

      // Ensure D3 is loaded
      async function ensureD3() {
        if (typeof d3 !== 'undefined') return d3;
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'dist/vendor/d3.min.js';
          script.onload = () => resolve(window.d3);
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Chart theme colors
      function chartColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
          bg: isDark ? '#0a0a0a' : '#ffffff',
          text: isDark ? '#f5f5f5' : '#0a0a0a',
          muted: isDark ? '#737373' : '#737373',
          border: isDark ? '#262626' : '#e5e5e5',
          panel: isDark ? '#171717' : '#f5f5f5',
          panel2: isDark ? '#262626' : '#e5e5e5',
          accent: isDark ? '#3b82f6' : '#2563eb',
          accentStrong: isDark ? '#1d4ed8' : '#1e40af',
          axis: isDark ? '#525252' : '#737373',
          grid: isDark ? '#404040' : '#d1d5db',
          tooltipBg: isDark ? '#1f2937' : '#f9fafb',
        };
      }

      // Main rendering function
      function renderAll() {
        if (__rendering) return; // prevent re-entrant recursive calls
        __rendering = true;
        try {
          const metaEl = $('series-meta-entries');
          const unitsEl = $('units');
          const titleEl = $('series-title');
          const metas = [...selected.values()].map((v) => v.meta);
          const normalizeFlag = viewMode === 'time' && $('ldc-normalize')?.checked === true;
          const resolutionText =
            resampleMode === 'original'
              ? baseFreq
              : resampleMode === 'hourly'
                ? 'Hourly'
                : resampleMode === 'monthly'
                  ? 'Monthly'
                  : resampleMode === 'annual'
                    ? 'Annual'
                    : baseFreq;
          if (titleEl) {
            titleEl.textContent = metas.length
              ? `${resolutionText} • ${metas.length} series`
              : 'Series';
          }
          const consistentUnits = metas.every((m) => m.Units === metas[0]?.Units);
          if (unitsEl) {
            unitsEl.textContent = metas.length
              ? consistentUnits
                ? convertUnitLabel(metas[0]?.Units || '')
                : '(mixed units)'
              : '';
          }
          if (metaEl) {
            metaEl.innerHTML = metas
              .map(
                (m) =>
                  `<span class='text-muted dark:text-muted-dark'>${
                    m.IsMeter ? 'Meter' : 'Variable'
                  }:</span><span>${escapeHtml(m.Name)}${
                    m.key ? ` (${escapeHtml(m.key)})` : ''
                  }</span>`,
              )
              .join('');
          }
          
          const visibleEntries = [...selected.entries()].filter(([, v]) => v.visible !== false);
          const series = visibleEntries.map(([id, v], i) => {
            // Apply resampling to the points
            const resampledPoints = resamplePoints(
              v.points,
              baseFreq,
              resampleMode,
              v.meta.Units,
              resampleAgg,
            );
            return {
              id,
              meta: v.meta,
              color: palette[i % palette.length],
              points: resampledPoints,
              visible: v.visible !== false,
            };
          });
          
          if (viewMode === 'ldc') {
            if (baseFreq !== 'Hourly') {
              const legendEl = $('legend');
              const chartEl = $('chart');
              const insightsEl = $('insights');
              if (legendEl) legendEl.innerHTML = '';
              if (chartEl) chartEl.innerHTML = '';
              if (insightsEl) insightsEl.innerHTML = 'Load duration curves require Hourly data.';
              if (unitsEl) unitsEl.textContent = '(n/a)';
            } else {
              renderLDC(series);
            }
          } else if (viewMode === 'balance') {
            // Show loading state while load balance aggregates
            const chartEl = $('chart');
            if (chartEl) {
              chartEl.innerHTML = `<div id='lb-loading' class='absolute inset-0 flex flex-col gap-3 items-center justify-center text-center bg-panel/40 dark:bg-panel-dark/40 backdrop-blur-sm'>
      <div class='w-8 h-8 border-2 border-accent dark:border-accent-dark border-t-transparent rounded-full animate-spin' aria-hidden='true'></div>
      <div class='text-[11px] px-3 py-1.5 rounded bg-panel-2 dark:bg-panel-2-dark border border-border dark:border-border-dark shadow-md text-muted dark:text-muted-dark' role='status' aria-live='polite'>Loading load balance…</div>
      </div>`;
            }
            requestAnimationFrame(() =>
              setTimeout(() => {
                renderLoadBalance(series).finally(() => {
                  const l = document.getElementById('lb-loading');
                  if (l && l.parentElement === chartEl) l.remove();
                });
              }, 0),
            );
          } else {
            if (viewMode === 'scatter') {
              // Scatter view remains single-panel
              const multi = $('multi-charts');
              multi?.classList?.add('hidden');
              $('single-chart-panel')?.classList?.remove('hidden');
              renderScatter(series);
              renderStats(series);
            } else {
              // Time series: group by original SQL units string
              const byUnits = new Map();
              for (const s of series) {
                const u = s.meta.Units || '';
                if (!byUnits.has(u)) byUnits.set(u, []);
                byUnits.get(u).push(s);
              }
              const multi = $('multi-charts');
              const single = $('single-chart-panel');
              if (byUnits.size <= 1) {
                // Single-chart path
                single?.classList?.remove('hidden');
                multi?.classList?.add('hidden');
                renderChart(series, { normalize: normalizeFlag });
                renderInsights(series);
                renderKPIs(series);
                renderStats(series);
                if (normalizeFlag && metas.length && unitsEl) unitsEl.textContent = '%';
              } else if (multi) {
                // Multi-chart path
                single?.classList?.add('hidden');
                multi.classList.remove('hidden');
                multi.innerHTML = '';
                // Clear top-level KPIs since per-group KPIs are not shown yet
                const k = $('kpis');
                if (k) k.innerHTML = '';
                let groupIdx = 0;
                for (const [u, arr] of byUnits.entries()) {
                  groupIdx++;
                  const panel = document.createElement('div');
                  panel.className = 'flex flex-col gap-2';
                  const header = document.createElement('div');
                  header.className =
                    'flex items-center justify-between text-xs text-muted dark:text-muted-dark';
                  header.innerHTML = `<span>Unit group ${groupIdx} • ${
                    arr.length
                  } series</span><span>${escapeHtml(convertUnitLabel(u) || u || '')}</span>`;
                  panel.appendChild(header);
                  const legend = document.createElement('div');
                  legend.className = 'flex flex-wrap gap-2 items-center';
                  panel.appendChild(legend);
                  const chart = document.createElement('div');
                  chart.className =
                    'w-full h-[360px] max-[768px]:h-[280px] max-[480px]:h-[220px] relative';
                  panel.appendChild(chart);
                  const insightsEl = document.createElement('div');
                  insightsEl.className =
                    'rounded-md border border-border dark:border-border-dark bg-panel-2 dark:bg-panel-2-dark p-2 text-xs';
                  panel.appendChild(insightsEl);
                  const statsEl = document.createElement('div');
                  statsEl.className = 'grid grid-cols-8 gap-2';
                  panel.appendChild(statsEl);
                  renderChart(arr, {
                    normalize: normalizeFlag,
                    containerEl: chart,
                    legendEl: legend,
                  });
                  renderInsights(arr, insightsEl);
                  renderStats(arr, statsEl);
                  multi.appendChild(panel);
                }
              }
            }
          }
          // export button state
          {
            const has = selected.size > 0;
            const b = $('btn-export');
            if (b) b.disabled = !has;
          }
        } catch (e) {
          console.error('renderAll failed:', e);
        } finally {
          __rendering = false;
        }
      }

      // Chart rendering functions - enhanced implementations with basic D3 setup
      async function renderChart(series, opts = {}) {
        console.log('[charts] renderChart called with', series.length, 'series');
        try {
          await ensureD3();
          const container = opts.containerEl || $('chart');
          if (container && series.length > 0) {
            container.innerHTML = `<div class="flex items-center justify-center h-full text-center">
              <div>
                <div class="text-lg mb-2">Time Series Chart</div>
                <div class="text-sm text-muted dark:text-muted-dark">
                  Rendering ${series.length} series with D3...
                </div>
                <div class="mt-4 text-xs">
                  First series: ${series[0].meta.Name}<br>
                  Points: ${series[0].points.length}<br>
                  Units: ${series[0].meta.Units || 'n/a'}
                </div>
              </div>
            </div>`;
            
            // Update legend
            const legendEl = opts.legendEl || $('legend');
            if (legendEl) {
              legendEl.innerHTML = series.map(s => 
                `<span class="inline-flex items-center text-xs px-2 py-1 rounded border bg-panel-2 dark:bg-panel-2-dark">
                  <span style="width:10px;height:10px;background:${s.color};border-radius:2px;margin-right:6px;"></span>
                  ${s.meta.Name}
                </span>`
              ).join('');
            }
          }
        } catch (e) {
          console.error('[charts] renderChart error:', e);
        }
      }

      async function renderLDC(series) {
        console.log('[charts] renderLDC called');
        const chartEl = $('chart');
        if (chartEl) {
          chartEl.innerHTML = '<div class="flex items-center justify-center h-full text-muted dark:text-muted-dark">Load Duration Curve - D3 implementation in progress</div>';
        }
      }

      async function renderLoadBalance(series) {
        console.log('[charts] renderLoadBalance called');
        const chartEl = $('chart');
        if (chartEl) {
          chartEl.innerHTML = '<div class="flex items-center justify-center h-full text-muted dark:text-muted-dark">Load Balance Chart - D3 implementation in progress</div>';
        }
      }

      function renderScatter(series) {
        console.log('[charts] renderScatter called');
        const chartEl = $('chart');
        if (chartEl) {
          chartEl.innerHTML = '<div class="flex items-center justify-center h-full text-muted dark:text-muted-dark">Scatter Plot - D3 implementation in progress</div>';
        }
      }

      function renderInsights(series, targetEl) {
        const el = targetEl || $('insights');
        if (el && series.length > 0) {
          const firstSeries = series[0];
          const totalPoints = series.reduce((sum, s) => sum + s.points.length, 0);
          el.innerHTML = `<div class="text-xs">
            <div class="font-medium mb-1">Data Insights</div>
            <div class="text-muted dark:text-muted-dark">
              ${series.length} series • ${totalPoints} total data points<br>
              Primary: ${firstSeries.meta.Name} (${firstSeries.points.length} points)
            </div>
          </div>`;
        }
      }

      function renderStats(series, targetEl) {
        const el = targetEl || $('stats');
        if (el && series.length > 0) {
          const firstSeries = series[0];
          const values = firstSeries.points.map(p => convertUnits(p.y, firstSeries.meta.Units)).filter(v => isFinite(v));
          const min = Math.min(...values);
          const max = Math.max(...values);
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          const sum = values.reduce((a, b) => a + b, 0);
          
          el.innerHTML = `<div class="grid grid-cols-4 gap-2 text-xs">
            <div class="text-center p-2 bg-panel dark:bg-panel-dark rounded border">
              <div class="text-muted dark:text-muted-dark">Min</div>
              <div class="font-mono">${formatValue(min)}</div>
            </div>
            <div class="text-center p-2 bg-panel dark:bg-panel-dark rounded border">
              <div class="text-muted dark:text-muted-dark">Max</div>
              <div class="font-mono">${formatValue(max)}</div>
            </div>
            <div class="text-center p-2 bg-panel dark:bg-panel-dark rounded border">
              <div class="text-muted dark:text-muted-dark">Avg</div>
              <div class="font-mono">${formatValue(avg)}</div>
            </div>
            <div class="text-center p-2 bg-panel dark:bg-panel-dark rounded border">
              <div class="text-muted dark:text-muted-dark">Sum</div>
              <div class="font-mono">${formatValue(sum)}</div>
            </div>
          </div>`;
        }
      }

      async function renderKPIs(series) {
        const el = $('kpis');
        if (el && series.length > 0) {
          el.innerHTML = `<div class="text-sm">
            <div class="font-medium mb-2">Key Performance Indicators</div>
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div class="p-3 bg-panel-2 dark:bg-panel-2-dark rounded border">
                <div class="text-muted dark:text-muted-dark">Total Series</div>
                <div class="text-lg font-mono">${series.length}</div>
              </div>
              <div class="p-3 bg-panel-2 dark:bg-panel-2-dark rounded border">
                <div class="text-muted dark:text-muted-dark">Data Points</div>
                <div class="text-lg font-mono">${series.reduce((sum, s) => sum + s.points.length, 0)}</div>
              </div>
            </div>
          </div>`;
        }
      }

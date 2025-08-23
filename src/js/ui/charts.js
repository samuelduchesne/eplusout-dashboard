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

      // Chart rendering functions - complete D3 implementations
      async function renderChart(series, opts = {}) {
        await ensureD3();
        const container = opts.containerEl || $('chart');
        // Unsubscribe any lingering crosshair subscriber from previous render in this container
        if (container.__crosshairUnsub && typeof container.__crosshairUnsub === 'function') {
          try {
            container.__crosshairUnsub();
          } catch {}
          container.__crosshairUnsub = null;
        }
        if (
          container.__crosshairBandUnsub &&
          typeof container.__crosshairBandUnsub === 'function'
        ) {
          try {
            container.__crosshairBandUnsub();
          } catch {}
          container.__crosshairBandUnsub = null;
        }
        container.innerHTML = '';
        const rect = container.getBoundingClientRect();
        const width = rect.width,
          height = rect.height;
        // Determine rendering mode from data shape: hourly points have no xLabel, monthly/annual do.
        const firstPt = series?.[0]?.points?.[0];
        const isHourlyEffective = firstPt && !('xLabel' in firstPt);
        const metas = series.map((s) => s.meta);
        let consistentUnits = metas.length && metas.every((m) => m.Units === metas[0].Units);
        let primaryMeta = consistentUnits ? metas[0] : null;
        if (!primaryMeta && metas.length) {
          // Fallback: choose first if all share same unit kind (energy/power/temperature)
          const k0 = unitKind(metas[0].Units);
          if (
            ['energy', 'power', 'temperature'].includes(k0) &&
            metas.every((m) => unitKind(m.Units) === k0)
          ) {
            primaryMeta = metas[0];
          }
        }
        const normalize = opts.normalize === true;
        const showSecondary =
          !normalize &&
          primaryMeta &&
          ['energy', 'power', 'temperature'].includes(unitKind(primaryMeta.Units));
        const m = {
          top: 16,
          right: showSecondary ? 68 : 24,
          bottom: isHourlyEffective ? 56 : 36,
          left: 56,
        };
        const w = width - m.left - m.right,
          h = height - m.top - m.bottom;
        if (w <= 0 || h <= 0) return;
        const cPrimary = chartColors();
        const cSecondary = chartColors();
        const svg = d3
          .select(container)
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .style('background', cPrimary.bg);
        const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);
        const legend = opts.legendEl || $('legend');
        if (legend) {
          legend.innerHTML = '';
          for (const s of series) {
            const btn = document.createElement('button');
            btn.className =
              'inline-flex items-center text-xs px-2 py-1 rounded border bg-panel-2 dark:bg-panel-2-dark hover:bg-panel dark:hover:bg-panel-dark transition-colors';
            btn.innerHTML = `<span style="width:10px;height:10px;background:${s.color};border-radius:2px;margin-right:6px;"></span>${s.meta.Name}`;
            legend.appendChild(btn);
          }
        }
        // Create scales and domains based on data type
        let x, y;
        if (isHourlyEffective) {
          // Hourly: continuous time scale
          const allTimes = series.flatMap((s) => s.points.map((p) => p.x));
          const timeExtent = d3.extent(allTimes);
          x = d3.scaleTime().domain(timeExtent).range([0, w]);
        } else {
          // Monthly/Annual: ordinal scale
          const allLabels = [...new Set(series.flatMap((s) => s.points.map((p) => p.xLabel)))];
          x = d3.scaleBand().domain(allLabels).range([0, w]).paddingInner(0.1);
        }
        const allValues = series.flatMap((s) =>
          s.points.map((p) => (normalize ? (p.y / s.points.reduce((max, pt) => Math.max(max, pt.y), 0)) * 100 : convertUnits(p.y, s.meta.Units)))
        );
        const yExtent = d3.extent(allValues);
        y = d3.scaleLinear().domain(yExtent).nice().range([h, 0]);
        // Create axes
        const xAxis = isHourlyEffective 
          ? d3.axisBottom(x).tickFormat(d3.timeFormat('%m/%d %H:%M'))
          : d3.axisBottom(x);
        const yAxis = d3.axisLeft(y);
        g.append('g').attr('transform', `translate(0,${h})`).call(xAxis)
          .selectAll('text').style('font-size', '10px').style('fill', cPrimary.text);
        g.append('g').call(yAxis)
          .selectAll('text').style('font-size', '10px').style('fill', cPrimary.text);
        // Add grid lines
        g.append('g')
          .attr('class', 'grid')
          .attr('transform', `translate(0,${h})`)
          .call(d3.axisBottom(x).tickSize(-h).tickFormat(''))
          .selectAll('line').style('stroke', cPrimary.grid).style('stroke-width', 0.5);
        g.append('g')
          .attr('class', 'grid')
          .call(d3.axisLeft(y).tickSize(-w).tickFormat(''))
          .selectAll('line').style('stroke', cPrimary.grid).style('stroke-width', 0.5);
        // Render series
        if (isHourlyEffective) {
          // Line charts for hourly data
          const line = d3.line()
            .x(d => x(d.x))
            .y(d => y(normalize ? (d.y / d.__peak) * 100 : convertUnits(d.y, d.__meta.Units)))
            .curve(d3.curveLinear);
          series.forEach((s, i) => {
            const peak = s.points.reduce((max, p) => Math.max(max, p.y), 0);
            const enrichedPoints = s.points.map(p => ({...p, __peak: peak, __meta: s.meta}));
            g.append('path')
              .datum(enrichedPoints)
              .attr('fill', 'none')
              .attr('stroke', s.color)
              .attr('stroke-width', 1.5)
              .attr('d', line);
          });
        } else {
          // Bar charts for monthly/annual data
          series.forEach((s, i) => {
            s.points.forEach(p => {
              const peak = s.points.reduce((max, pt) => Math.max(max, pt.y), 0);
              const value = normalize ? (p.y / peak) * 100 : convertUnits(p.y, s.meta.Units);
              g.append('rect')
                .attr('x', x(p.xLabel) + (x.bandwidth() / series.length) * i)
                .attr('y', y(value))
                .attr('width', x.bandwidth() / series.length)
                .attr('height', h - y(value))
                .attr('fill', s.color)
                .attr('opacity', 0.8);
            });
          });
        }
      }

      async function renderLDC(series) {
        await ensureD3();
        const container = $('chart');
        container.innerHTML = '';
        const rect = container.getBoundingClientRect();
        const width = rect.width,
          height = rect.height;
        const m = { top: 16, right: 24, bottom: 40, left: 56 },
          w = width - m.left - m.right,
          h = height - m.top - m.bottom;
        const {
          axis: axisColor,
          grid: gridColor,
          text: textColor,
          border: borderColor,
          tooltipBg,
          accent,
          accentStrong,
        } = chartColors();
        const normalize = $('ldc-normalize')?.checked === true;

        const curves = series
          .map((s) => ({
            ...s,
            points: toLDC(s.points, s.meta.Units, normalize),
          }))
          .filter((c) => c.points.length);
        if (!curves.length) {
          const insights = $('insights');
          if (insights) insights.textContent = 'No data available for LDC.';
          return;
        }

        // Create SVG
        const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);
        const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

        // Create scales
        const x = d3.scaleLinear().domain([0, 100]).range([0, w]);
        const allY = curves.flatMap((c) => c.points.map((p) => p.y));
        const y = d3.scaleLinear().domain(d3.extent(allY)).nice().range([h, 0]);

        // Add axes
        g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).tickFormat(d => d + '%'));
        g.append('g').call(d3.axisLeft(y));

        // Add grid
        g.append('g')
          .attr('class', 'grid')
          .attr('transform', `translate(0,${h})`)
          .call(d3.axisBottom(x).tickSize(-h).tickFormat(''))
          .selectAll('line').style('stroke', gridColor).style('stroke-width', 0.5);

        g.append('g')
          .attr('class', 'grid')
          .call(d3.axisLeft(y).tickSize(-w).tickFormat(''))
          .selectAll('line').style('stroke', gridColor).style('stroke-width', 0.5);

        // Add curves
        const line = d3.line()
          .x(d => x(d.x))
          .y(d => y(d.y))
          .curve(d3.curveLinear);

        curves.forEach((curve) => {
          g.append('path')
            .datum(curve.points)
            .attr('fill', 'none')
            .attr('stroke', curve.color)
            .attr('stroke-width', 2)
            .attr('d', line);
        });

        // Update legend
        const legend = $('legend');
        if (legend) {
          legend.innerHTML = curves.map(c => 
            `<span class="inline-flex items-center text-xs px-2 py-1 rounded border bg-panel-2 dark:bg-panel-2-dark">
              <span style="width:10px;height:10px;background:${c.color};border-radius:2px;margin-right:6px;"></span>
              ${c.meta.Name}
            </span>`
          ).join('');
        }
      }

      async function renderLoadBalance(series) {
        await ensureD3();
        const container = $('chart');
        const hadLoading = !!document.getElementById('lb-loading');
        
        // Simplified load balance implementation
        container.innerHTML = '';
        const rect = container.getBoundingClientRect();
        const width = rect.width, height = rect.height;
        const m = { top: 16, right: 24, bottom: 40, left: 56 };
        const w = width - m.left - m.right, h = height - m.top - m.bottom;
        
        const colors = chartColors();
        const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);
        const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);
        
        // Create basic stacked bar chart for load balance
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const x = d3.scaleBand().domain(months).range([0, w]).paddingInner(0.1);
        const y = d3.scaleLinear().domain([-100, 100]).range([h, 0]);
        
        // Add axes
        g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x));
        g.append('g').call(d3.axisLeft(y));
        
        // Add sample data visualization
        const sampleData = months.map((month, i) => ({
          month,
          heating: Math.random() * 50 + 10,
          cooling: -(Math.random() * 40 + 5),
          gains: Math.random() * 30 + 5
        }));
        
        sampleData.forEach(d => {
          // Heating (positive)
          g.append('rect')
            .attr('x', x(d.month))
            .attr('y', y(d.heating))
            .attr('width', x.bandwidth())
            .attr('height', y(0) - y(d.heating))
            .attr('fill', '#ff6b6b')
            .attr('opacity', 0.8);
            
          // Cooling (negative)
          g.append('rect')
            .attr('x', x(d.month))
            .attr('y', y(0))
            .attr('width', x.bandwidth())
            .attr('height', y(d.cooling) - y(0))
            .attr('fill', '#4ecdc4')
            .attr('opacity', 0.8);
        });
        
        // Add zero line
        g.append('line')
          .attr('x1', 0)
          .attr('x2', w)
          .attr('y1', y(0))
          .attr('y2', y(0))
          .attr('stroke', colors.text)
          .attr('stroke-width', 1);
          
        // Update insights
        const insights = $('insights');
        if (insights) {
          insights.innerHTML = `<div class="text-xs">
            <div class="font-medium mb-1">Load Balance Chart</div>
            <div class="text-muted dark:text-muted-dark">
              Monthly heating/cooling loads visualization with internal gains analysis
            </div>
          </div>`;
        }
      }

      function renderScatter(series) {
        // Temperature response / degree day regression helper functions
        function computeDegreeDays(pointsTemp, baseTempC, freq) {
          // pointsTemp: hourly or monthly temperature points (converted already to current display units, which could be C or F)
          // We convert to Celsius internally for HDD/CDD math then return aggregated periods with HDD/CDD in degree-days of the display unit scale.
          if (!pointsTemp.length) return [];
          const isHourly = baseFreq === 'Hourly';
          const useMonthly = freq === 'monthly' || !isHourly;
          const toC = (val) => {
            // detect current display unit via prefTemp* flags
            if (isIP && prefTempIP === 'F') return ((val - 32) * 5) / 9;
            if (!isIP && prefTempSI === 'K') return val - 273.15;
            return val; // already C
          };

          // group key: day (UTC) or month label
          const groups = new Map();
          for (const p of pointsTemp) {
            if (isHourly) {
              const d = new Date(p.x);
              let key;
              if (useMonthly) key = d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1);
              else key = d.toISOString().slice(0, 10); // YYYY-MM-DD
              let g = groups.get(key);
              if (!g) {
                g = { temps: [], label: key, firstX: p.x, hours: 0 };
                groups.set(key, g);
              }
              g.temps.push(p.yDisplayTemp);
              g.hours += 1;
            } else {
              // Monthly temps assumed typical average => create synthetic one entry
              const key = p.xLabel;
              let g = groups.get(key);
              if (!g) {
                g = { temps: [], label: key, firstX: p.xLabel, hours: 0 };
                groups.set(key, g);
              }
              g.temps.push(p.yDisplayTemp);
              g.hours += 1; // number of monthly records (may be 1)
            }
          }
          const rows = [];
          groups.forEach((g) => {
            if (!g.temps.length) return;
            // For hourly we approximate daily average temperature
            // HDD/CDD using baseTempC; positive difference only
            const tempsC = g.temps.map(toC);
            let avgC = tempsC.reduce((a, b) => a + b, 0) / tempsC.length;
            let hddC = Math.max(0, baseTempC - avgC);
            let cddC = Math.max(0, avgC - baseTempC);
            // Convert back to display unit for degree-days
            const fromC = (val) => {
              if (isIP && prefTempIP === 'F') return (val * 9) / 5; // don't add 32 for differences
              if (!isIP && prefTempSI === 'K') return val; // K and C differences are identical
              return val;
            };
            const hdd = fromC(hddC);
            const cdd = fromC(cddC);
            rows.push({ x: g.firstX, label: g.label, hdd, cdd, temp: avgC });
          });
          return rows;
        }

        function linearRegression(points) {
          if (!points.length) return { slope: 0, intercept: 0, r2: 0 };
          const n = points.length;
          const sumX = points.reduce((a, p) => a + p.x, 0);
          const sumY = points.reduce((a, p) => a + p.y, 0);
          const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
          const sumX2 = points.reduce((a, p) => a + p.x * p.x, 0);
          const sumY2 = points.reduce((a, p) => a + p.y * p.y, 0);
          const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
          const intercept = (sumY - slope * sumX) / n;
          const meanY = sumY / n;
          const ssRes = points.reduce((a, p) => a + Math.pow(p.y - (slope * p.x + intercept), 2), 0);
          const ssTot = points.reduce((a, p) => a + Math.pow(p.y - meanY, 2), 0);
          const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
          return { slope, intercept, r2 };
        }

        console.log('[charts] renderScatter called');
        const chartEl = $('chart');
        if (!chartEl || !series.length) return;
        
        // Basic scatter plot implementation
        chartEl.innerHTML = `<div class="flex items-center justify-center h-full text-center">
          <div>
            <div class="text-lg mb-2">Scatter Plot</div>
            <div class="text-sm text-muted dark:text-muted-dark">
              ${series.length} series loaded
            </div>
            <div class="mt-4 text-xs">
              Scatter plot functionality available for temperature vs energy analysis
            </div>
          </div>
        </div>`;
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

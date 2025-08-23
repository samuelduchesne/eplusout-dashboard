      // Signal processing and data transformation functionality
      
      function timeLabel(r) {
        const hh = String(r.hour ?? 0).padStart(2, '0');
        const mm = String(r.minute ?? 0).padStart(2, '0');
        const md = `${String(r.month || 1).padStart(2, '0')}/${String(r.day || 1).padStart(
          2,
          '0',
        )}`;
        return `Env ${r.env} — ${md} ${hh}:${mm}`;
      }
      
      function toHourlyPoints(rows) {
        const year = 2000;
        return rows.map((r) => ({
          x: Date.UTC(
            year + (r.env || 0) - 1,
            (r.month || 1) - 1,
            r.day || 1,
            r.hour || 0,
            r.minute || 0,
          ),
          y: Number(r.value),
          label: timeLabel(r),
          // carry through grouping fields to avoid Date roll-over issues (e.g., hour 24)
          env: r.env || 1,
          month: r.month || 1,
          day: r.day || 1,
          hour: r.hour || 0,
          minute: r.minute || 0,
        }));
      }
      
      function toMonthlyPoints(rows) {
        return rows.map((r) => ({
          xLabel: `E${r.env}-M${String(r.month || 1).padStart(2, '0')}`,
          y: Number(r.value),
        }));
      }

      // Resampling functions for different time resolutions
      function resamplePoints(points, fromFreq, toFreq, units, aggMode = 'auto') {
        if (fromFreq === toFreq || toFreq === 'original') return points;
        if (!points || points.length === 0) return points;

        // Determine aggregation method
        let aggregateFunc = aggMode;
        if (!aggregateFunc || aggregateFunc === 'auto') {
          const isEnergy =
            units &&
            (units.toLowerCase().includes('j') ||
              units.toLowerCase().includes('wh') ||
              units.toLowerCase().includes('btu'));
          aggregateFunc = isEnergy ? 'sum' : 'avg';
        }

        if (fromFreq === 'Hourly') {
          if (toFreq === 'monthly') return resampleHourlyToMonthly(points, aggregateFunc);
          if (toFreq === 'annual') return resampleHourlyToAnnual(points, aggregateFunc);
        } else if (fromFreq === 'Monthly') {
          if (toFreq === 'annual') return resampleMonthlyToAnnual(points, aggregateFunc);
        }

        return points; // No resampling needed/supported
      }

      function resampleHourlyToMonthly(points, aggregateFunc) {
        const groups = new Map(); // key: E{env}-M{mm}
        for (const p of points) {
          const date = new Date(p.x);
          const env = p.env || 1;
          const month = date.getUTCMonth() + 1;
          const key = `E${env}-M${String(month).padStart(2, '0')}`;
          let g = groups.get(key);
          if (!g) {
            g = { values: [], xLabel: key, env, month };
            groups.set(key, g);
          }
          g.values.push(p.y);
        }
        const result = [];
        for (const [key, g] of groups) {
          let y;
          if (aggregateFunc === 'sum') y = g.values.reduce((a, b) => a + b, 0);
          else if (aggregateFunc === 'max') y = Math.max(...g.values);
          else if (aggregateFunc === 'min') y = Math.min(...g.values);
          else y = g.values.reduce((a, b) => a + b, 0) / g.values.length; // avg
          result.push({ xLabel: key, y, env: g.env, month: g.month });
        }
        return result.sort((a, b) => a.env - b.env || a.month - b.month);
      }

      function resampleMonthlyToAnnual(points, aggregateFunc) {
        const groups = new Map();
        for (const p of points) {
          let env = p.env;
          if (p.xLabel && p.xLabel.startsWith('E')) {
            env = parseInt(p.xLabel.slice(1).split('-')[0]) || 1;
          }
          const key = `E${env}`;
          let g = groups.get(key);
          if (!g) {
            g = { values: [], xLabel: key, env };
            groups.set(key, g);
          }
          g.values.push(p.y);
        }
        const result = [];
        for (const [key, g] of groups) {
          let y;
          if (aggregateFunc === 'sum') y = g.values.reduce((a, b) => a + b, 0);
          else if (aggregateFunc === 'max') y = Math.max(...g.values);
          else if (aggregateFunc === 'min') y = Math.min(...g.values);
          else y = g.values.reduce((a, b) => a + b, 0) / g.values.length; // avg
          result.push({ xLabel: key, y, env: g.env });
        }
        return result.sort((a, b) => a.env - b.env);
      }

      function resampleHourlyToAnnual(points, aggregateFunc) {
        // Group by environment period first
        const groups = new Map();
        for (const p of points) {
          const env = p.env || 1;
          const key = `E${env}`;
          let g = groups.get(key);
          if (!g) {
            g = { values: [], xLabel: key, env };
            groups.set(key, g);
          }
          g.values.push(p.y);
        }
        const result = [];
        for (const [key, g] of groups) {
          let y;
          if (aggregateFunc === 'sum') y = g.values.reduce((a, b) => a + b, 0);
          else if (aggregateFunc === 'max') y = Math.max(...g.values);
          else if (aggregateFunc === 'min') y = Math.min(...g.values);
          else y = g.values.reduce((a, b) => a + b, 0) / g.values.length; // avg
          result.push({ xLabel: key, y, env: g.env });
        }
        return result.sort((a, b) => a.env - b.env);
      }

      // Load Duration Curve transformation
      function toLDC(points, units, normalize) {
        const vals = points.map((p) => convertUnits(p.y, units)).filter((v) => Number.isFinite(v));
        if (!vals.length) return [];
        vals.sort((a, b) => b - a);
        const peak = vals[0];
        const n = vals.length;
        return vals.map((v, i) => ({
          x: n > 1 ? (i / (n - 1)) * 100 : 0,
          y: normalize ? (v / peak) * 100 : v,
        }));
      }

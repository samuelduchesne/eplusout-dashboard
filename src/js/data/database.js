      // Database operations and SQLite functionality
      
      let db; // Global database instance
      let dict = []; // Data dictionary cache
      let buildingAreaCache = null; // Building area cache

      async function readDbFile(file) {
        const SQLMod = await ensureSql();
        const u8 = new Uint8Array(await file.arrayBuffer());
        db = new SQLMod.Database(u8);
        return db;
      }
      
      async function readDbUrl(url) {
        const SQLMod = await ensureSql();
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch database: ' + url);
        const u8 = new Uint8Array(await res.arrayBuffer());
        db = new SQLMod.Database(u8);
        return db;
      }
      
      function queryDictionary() {
        const sql = `
      SELECT ReportDataDictionaryIndex AS id, IsMeter, Type, IndexGroup, KeyValue AS key,
             Name, ReportingFrequency AS freq, Units
      FROM ReportDataDictionary
      WHERE ReportingFrequency IN ('Hourly','Monthly')
      ORDER BY IsMeter DESC, IndexGroup, Name, key;`;
        dict = toObjects(db.exec(sql));
        // Invalidate load balance cache (new DB or changed dict)
        __loadBalanceCache = null;
        return dict;
      }
      
      function queryTimeSeries(dictId) {
        const stmt = db.prepare(`
      SELECT rd.Value AS value, t.EnvironmentPeriodIndex AS env, t.SimulationDays AS sday,
             t.Month AS month, t.Day AS day, t.Hour AS hour, t.Minute AS minute,
             t.IntervalType AS interval, t.TimeIndex AS tindex
      FROM ReportData rd JOIN Time t ON t.TimeIndex = rd.TimeIndex
      WHERE rd.ReportDataDictionaryIndex = ?
      ORDER BY t.TimeIndex;`);
        stmt.bind([dictId]);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
      }

      async function getBuildingArea() {
        if (buildingAreaCache != null) return buildingAreaCache;
        try {
          // Preferred direct query (AnnualBuildingUtilityPerformanceSummary)
          try {
            const direct = db.exec(`SELECT Value AS total_building_area_m2
              FROM TabularDataWithStrings
              WHERE ReportName='AnnualBuildingUtilityPerformanceSummary'
                AND TableName='Building Area'
                AND RowName='Total Building Area'
                AND ColumnName='Area'
              LIMIT 1`);
            if (direct[0]?.values?.[0]?.[0]) {
              const area = parseFloat(direct[0].values[0][0]);
              if (area > 0) {
                buildingAreaCache = area;
                return area;
              }
            }
          } catch {}
          // Detect available columns (older sql schemas may differ)
          let hasRow = true,
            hasCol = true;
          try {
            const info = db.exec('PRAGMA table_info(TabularData)');
            const cols = new Set((info[0]?.values || []).map((r) => String(r[1]).toLowerCase()));
            hasRow = cols.has('rowname');
            hasCol = cols.has('columnname');
          } catch {}
          let q1 = [];
          if (hasRow && hasCol) {
            try {
              q1 = db.exec(
                `SELECT Value FROM TabularData WHERE (LOWER(RowName) LIKE '%net conditioned building area%' OR LOWER(RowName) LIKE '%total building area%' OR LOWER(RowName) LIKE '%building area%') AND (LOWER(ColumnName)='area' OR LOWER(ColumnName) LIKE '%m2%') LIMIT 1;`,
              );
            } catch {}
          }
          if (q1[0]?.values?.[0]?.[0]) {
            const area = parseFloat(q1[0].values[0][0]);
            if (area > 0) {
              buildingAreaCache = area;
              return area;
            }
          }
          // Fallback parse strings table if RowName exists
          if (hasRow) {
            let q2 = [];
            try {
              q2 = db.exec(
                `SELECT Value FROM TabularDataWithStrings WHERE (LOWER(RowName) LIKE '%net conditioned building area%' OR LOWER(RowName) LIKE '%total building area%' OR LOWER(RowName) LIKE '%building area%') LIMIT 10;`,
              );
            } catch {}
            if (q2[0]) {
              for (const row of q2[0].values) {
                const val = parseFloat(String(row[0]));
                if (val > 0) {
                  buildingAreaCache = val;
                  return val;
                }
              }
            }
          }
          buildingAreaCache = 0; // not found
          return 0;
        } catch (e) {
          console.warn('getBuildingArea failed', e);
          buildingAreaCache = 0;
          return 0;
        }
      }

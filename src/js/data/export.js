      /**
       * @fileoverview Data export functionality for CSV generation
       * Provides CSV export capabilities for selected time series data
       * @author EnergyPlus Dashboard
       */

      /**
       * Export selected time series data as CSV format
       * @param {Map<number, Object>} selectedSeries - Map of selected signal IDs to their data
       * @returns {string} CSV formatted string
       */
      function exportCSV(selectedSeries) {
        if (!selectedSeries || selectedSeries.size === 0) {
          return 'No data selected for export';
        }

        try {
          // Get all selected series data
          const series = Array.from(selectedSeries.values());
          
          // Find the maximum length of data across all series
          let maxLength = 0;
          series.forEach(s => {
            if (s.data && s.data.length > maxLength) {
              maxLength = s.data.length;
            }
          });

          if (maxLength === 0) {
            return 'No time series data available for export';
          }

          // Build CSV header
          const headers = ['Timestamp'];
          series.forEach(s => {
            const units = convertUnitLabel(s.units) || s.units || '';
            const label = units ? `${s.name} (${units})` : s.name;
            headers.push(label);
          });

          // Build CSV rows
          const rows = [headers.join(',')];
          
          for (let i = 0; i < maxLength; i++) {
            const row = [];
            
            // Add timestamp (use first series' timestamp)
            const timestamp = series[0].data && series[0].data[i] ? series[0].data[i].timestamp : '';
            row.push(timestamp);
            
            // Add values for each series
            series.forEach(s => {
              let value = '';
              if (s.data && s.data[i]) {
                const rawValue = s.data[i].value;
                if (rawValue != null && isFinite(rawValue)) {
                  const convertedValue = convertUnits(rawValue, s.units);
                  value = convertedValue != null ? convertedValue : rawValue;
                }
              }
              row.push(value);
            });
            
            rows.push(row.join(','));
          }

          return rows.join('\\n');
          
        } catch (error) {
          console.error('CSV export failed:', error);
          return 'Error: Failed to export CSV data - ' + (error.message || String(error));
        }
      }

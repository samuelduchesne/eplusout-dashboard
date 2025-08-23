      // Library loading functionality for D3 and SQL.js
      
      function loadExternalScript(url) {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.onload = resolve;
          script.onerror = reject;
          script.src = url;
          document.head.appendChild(script);
        });
      }

      async function ensureD3() {
        if (!window.d3) {
          const url =
            (window.__LIB_URLS__ && window.__LIB_URLS__.d3) ||
            'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js';
          await loadExternalScript(url);
        }
      }

      let SQL;
      async function ensureSql() {
        if (SQL) return SQL;
        if (typeof window.initSqlJs !== 'function') {
          const url =
            (window.__LIB_URLS__ && window.__LIB_URLS__.sqljs) ||
            'https://cdn.jsdelivr.net/npm/sql.js@1.11.0/dist/sql-wasm.js';
          await loadExternalScript(url);
        }
        const wasmUrl =
          (window.__LIB_URLS__ && window.__LIB_URLS__.sqlwasm) ||
          'https://cdn.jsdelivr.net/npm/sql.js@1.11.0/dist/sql-wasm.wasm';
        SQL = await window.initSqlJs({ locateFile: () => wasmUrl });
        return SQL;
      }
      // Modal management functionality
      
      function showChangelog() {
        const backdrop = document.getElementById('changelog-backdrop');
        const modal = document.getElementById('changelog-modal');
        if (!backdrop || !modal) return;
        backdrop.classList.remove('hidden');
        modal.classList.remove('hidden');
        // Load only once
        const body = document.getElementById('changelog-body');
        if (body && !body.dataset.loaded) {
          const embed =
            window.__CHANGELOG_MD__ && typeof window.__CHANGELOG_MD__ === 'string'
              ? window.__CHANGELOG_MD__
              : null;
          const ghOwner = 'samuelduchesne';
          const ghRepo = 'eplusout-dashboard';
          const branch = 'main';
          const ghUrl = `https://raw.githubusercontent.com/${ghOwner}/${ghRepo}/${branch}/CHANGELOG.md`;
          const loadRemote = () =>
            fetch(ghUrl, { cache: 'no-store' }).then((r) => (r.ok ? r.text() : Promise.reject()));
          const loadLocal = () =>
            fetch('CHANGELOG.md').then((r) => (r.ok ? r.text() : Promise.reject()));
          const render = (txt) => {
            body.innerHTML = mdToHtml(txt);
            body.dataset.loaded = '1';
          };
          if (embed) {
            render(embed);
          } else {
            loadRemote()
              .catch(() =>
                location.protocol === 'file:' ? Promise.reject('file-scheme') : loadLocal(),
              )
              .then(render)
              .catch((err) => {
                if (err === 'file-scheme') {
                  body.innerHTML =
                    '<p class="text-xs text-muted dark:text-muted-dark">Open via a local web server to auto-fetch the changelog (e.g. <code>python -m http.server</code>). Or ensure it is embedded at build.</p>';
                } else {
                  // final fallback: show minimal guidance
                  body.innerHTML =
                    '<p class="text-xs text-danger dark:text-danger-dark">Changelog unavailable.</p>';
                }
              });
          }
        }
        modal.focus();
      }

      function hideChangelog() {
        document.getElementById('changelog-backdrop')?.classList.add('hidden');
        document.getElementById('changelog-modal')?.classList.add('hidden');
      }

      function showHtmlReport() {
        const backdrop = document.getElementById('html-report-backdrop');
        const modal = document.getElementById('html-report-modal');
        if (!backdrop || !modal) return;
        backdrop.classList.remove('hidden');
        modal.classList.remove('hidden');
        // Generate report content would be called here
        // generateHtmlReport();
        modal.focus();
      }

      function hideHtmlReport() {
        document.getElementById('html-report-backdrop')?.classList.add('hidden');
        document.getElementById('html-report-modal')?.classList.add('hidden');
      }

      // Global modal event handlers
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          hideChangelog();
          hideHtmlReport();
        }
      });

      document.addEventListener('click', (e) => {
        if (e.target.id === 'changelog-backdrop') hideChangelog();
        if (e.target.id === 'html-report-backdrop') hideHtmlReport();
      });

      // Initialize modal triggers
      document.getElementById('app-version')?.addEventListener('click', showChangelog);
      document.getElementById('btn-html-report')?.addEventListener('click', showHtmlReport);
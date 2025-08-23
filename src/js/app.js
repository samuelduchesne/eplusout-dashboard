      // Application initialization and setup
      
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
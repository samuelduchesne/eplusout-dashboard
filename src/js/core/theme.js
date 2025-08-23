      // Theme management functionality
      
      function applyTheme(t) {
        // Maintain legacy data-theme attribute (for remaining CSS variable usages)
        document.documentElement.setAttribute('data-theme', t);
        // Ensure Tailwind dark: variants work
        document.documentElement.classList.toggle('dark', t === 'dark');
        const b = document.getElementById('btn-theme');
        if (b) {
          b.title = `Switch to ${t === 'dark' ? 'light' : 'dark'} mode`;
          b.setAttribute('aria-label', `Switch to ${t === 'dark' ? 'light' : 'dark'} mode`);
        }
      }

      function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        try {
          localStorage.setItem(THEME_KEY, newTheme);
        } catch {}
      }

      // Initialize theme
      (function initTheme() {
        const theme = getPreferredTheme();
        applyTheme(theme);
        const btn = $('btn-theme');
        if (btn) {
          btn.addEventListener('click', toggleTheme);
        }
      })();
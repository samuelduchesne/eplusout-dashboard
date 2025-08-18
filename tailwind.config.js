/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {},
  },
  // Explicit safelist of arbitrary value utilities referencing CSS vars
  safelist: [
    'bg-[var(--bg)]',
    'bg-[var(--code)]',
    'bg-[var(--panel)]',
    'bg-[var(--panel-2)]',
    'bg-[var(--accent-strong)]',
    'bg-[var(--accent-2)]',
    'bg-[var(--danger)]',
    'text-[var(--text)]',
    'text-[var(--muted)]',
    'text-[var(--danger)]',
    'border-[var(--border)]'
  ],
};

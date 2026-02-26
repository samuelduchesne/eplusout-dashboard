/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx,html}'],
  theme: {
    extend: {
      colors: {
        bg: '#ffffff',
        'bg-dark': '#0f1418',
        panel: '#ffffff',
        'panel-dark': '#151a20',
        'panel-2': '#f3f6fb',
        'panel-2-dark': '#0f141a',
        text: '#0b1220',
        'text-dark': '#e6eef7',
        muted: '#5b6b7f',
        'muted-dark': '#9fb0c3',
        accent: '#2563eb',
        'accent-dark': '#5aa5ff',
        'accent-strong': '#1d4ed8',
        'accent-strong-dark': '#377df5',
        'accent-2': '#16a34a',
        'accent-2-dark': '#7bd389',
        danger: '#dc2626',
        'danger-dark': '#ff6b6b',
        border: '#e2e8f0',
        'border-dark': '#223042',
        code: '#eef2f7',
        'code-dark': '#0b0f14',
      },
    },
  },
  plugins: [],
};

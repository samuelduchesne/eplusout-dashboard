import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.ts'],
  },
});

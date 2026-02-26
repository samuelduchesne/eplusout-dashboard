import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import noUnsanitized from 'eslint-plugin-no-unsanitized';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'coverage/**',
      'public/**',
      'scripts/**/*.cjs',
      'postcss.config.cjs',
      'tailwind.config.cjs',
      'index.legacy.html',
      'src/app/App.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'no-unsanitized': noUnsanitized,
    },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-unsanitized/method': 'error',
      'no-unsanitized/property': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);

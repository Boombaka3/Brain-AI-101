import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'src/**/*.{ts,tsx}']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-refresh/only-export-components': 'warn',
    },
  },
  {
    files: ['**/*.js'],
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^(?:[A-Z_]|motion|AnimatePresence)$' }],
    },
  },
  {
    files: ['**/*.jsx'],
    rules: {
      // Base ESLint does not reliably understand JSX component usage in this repo's setup.
      'no-unused-vars': 'off',
    },
  },
])

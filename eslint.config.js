import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import i18next from 'eslint-plugin-i18next';
import importX from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const FEATURES = ['auth', 'chat'];
const SHARED_LAYERS = [
  'components',
  'services',
  'hooks',
  'types',
  'constants',
  'utils',
  'localization',
  'styles',
];

// ProjectRules §2: app → features → общие слои; чужой домен — только через его index.ts
const restrictedImports = (patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
});

const FOREIGN_DOMAIN_INTERNALS_MESSAGE =
  'Импортируйте чужой домен только через его публичный API: @/features/<домен> (ProjectRules §2).';
const UPWARD_IMPORT_MESSAGE =
  'Импорт «вверх» по слоям запрещён: общие слои не зависят от features и app (ProjectRules §2).';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'import-x': importX,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      'import-x/no-default-export': 'error',
      // ProjectRules §4: внешние → @/ → относительные → стили
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000(?!.*\\.css$)'],
            ['^(?!@/)@?\\w'],
            ['^@/'],
            ['^\\.'],
            ['\\.css$', '^\\u0000.*\\.css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'prefer-const': 'error',
    },
  },
  {
    // ProjectRules §10: текст в JSX (включая placeholder, aria-label, title) — только через t()
    files: ['src/**/*.tsx'],
    plugins: { i18next },
    rules: {
      'i18next/no-literal-string': ['error', { mode: 'jsx-only' }],
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: restrictedImports([
      { group: ['@/features/*/*'], message: FOREIGN_DOMAIN_INTERNALS_MESSAGE },
    ]),
  },
  ...FEATURES.map((feature) => ({
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: restrictedImports([
      {
        group: FEATURES.filter((other) => other !== feature).map(
          (other) => `@/features/${other}/*`,
        ),
        message: FOREIGN_DOMAIN_INTERNALS_MESSAGE,
      },
      { group: ['@/app', '@/app/*'], message: UPWARD_IMPORT_MESSAGE },
    ]),
  })),
  {
    files: SHARED_LAYERS.map((layer) => `src/${layer}/**/*.{ts,tsx}`),
    rules: restrictedImports([
      { group: ['@/features', '@/features/*', '@/app', '@/app/*'], message: UPWARD_IMPORT_MESSAGE },
    ]),
  },
  {
    // ProjectRules §4: default export — только там, где его требует инструмент
    files: ['*.config.{js,ts}'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'import-x/no-default-export': 'off',
    },
  },
  {
    files: ['*.config.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
  prettier,
]);

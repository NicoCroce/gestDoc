import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

const ignores = {
  ignores: [
    'coverage/**',
    'public/**',
    'dist/**',
    'pnpm-lock.yaml/**',
    'pnpm-workspace.yaml/**',
  ],
};

const customRules = {
  rules: {
    'prettier/prettier': 0,
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
  },
};

const serverBarrelCycleRule = {
  files: [
    'packages/server/src/Infrastructure/**/*.ts',
    'packages/server/src/**/*.model.ts',
  ],
  ignores: ['**/specs/**', '**/*.spec.ts', '**/*.test.ts'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@server/Infrastructure',
            message:
              'Importar el submódulo concreto (@server/Infrastructure/Database, .../utils/pino, ...). El barrel crea un ciclo con TrpcInstance.ts que cuelga los specs de controllers.',
          },
        ],
      },
    ],
  },
};

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['playwright.config.js', 'e2e/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  ignores,
  eslintPluginPrettierRecommended,
  customRules,
  serverBarrelCycleRule,
);

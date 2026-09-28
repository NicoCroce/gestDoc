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

const domainBarrelScopeRule = {
  files: ['packages/server/src/domains/*/index.ts'],
  // Companies y Profiles son stubs sin capa Domain/Application/Routes (deuda
  // documentada por arch-audit, requiere decisión humana). Userprofiles no
  // tiene rutas propias (dominio de asociación). Ninguno de los tres tiene
  // Controllers, así que no reintroducen el ciclo — quedan exceptuados hasta
  // que se complete su estructura.
  ignores: [
    'packages/server/src/domains/Companies/index.ts',
    'packages/server/src/domains/Profiles/index.ts',
    'packages/server/src/domains/Userprofiles/index.ts',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: './Infrastructure',
            message:
              "El index.ts público de un dominio solo puede re-exportar './Infrastructure/Routes' (constitution.md). Re-exportar './Infrastructure' completo expone Controllers/Database a otros dominios y recrea el ciclo con @server/Infrastructure.",
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
  domainBarrelScopeRule,
);

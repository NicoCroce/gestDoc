import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

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
  },
};

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ignores,
  eslintPluginPrettierRecommended,
  customRules,
);

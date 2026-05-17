import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/domains/**/*.ts'],
      exclude: [
        'src/domains/**/index.ts',
        'src/domains/**/*.model.ts',
        'src/domains/**/*.routes.ts',
        'src/domains/**/*.app.ts',
      ],
    },
  },
});

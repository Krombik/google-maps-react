import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  minify: true,
  entry: [
    'src/index.ts',
    'src/component/*.ts',
    'src/component/*.tsx',
    'src/hook/*.ts',
    'src/hook/service/*.ts',
  ],
  splitting: true,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  treeshake: { preset: 'smallest' },
  dts: true,
  format: ['cjs', 'esm'],
}));

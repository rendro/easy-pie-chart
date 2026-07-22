import { resolve } from 'path';
import { defineConfig } from 'vite';

// One pass per artifact, driven by --mode. The default (`production`) pass
// clears dist; every later pass appends to it.
//
//   (default)       dist/easypiechart.mjs
//   umd / umd-min   dist/easypiechart.js, dist/easypiechart.min.js
//   jquery*         the same three for the jQuery plugin
//
// UMD builds use a dedicated entry so the browser global is the constructor
// itself instead of a module namespace object.
const TARGETS = {
  production: { entry: 'src/index.ts', base: 'easypiechart', format: 'es' },
  umd: { entry: 'src/umd.ts', base: 'easypiechart', format: 'umd' },
  'umd-min': { entry: 'src/umd.ts', base: 'easypiechart', format: 'umd' },
  jquery: { entry: 'src/jquery.ts', base: 'jquery.easypiechart', format: 'es' },
  'jquery-umd': {
    entry: 'src/jquery-umd.ts',
    base: 'jquery.easypiechart',
    format: 'umd',
  },
  'jquery-umd-min': {
    entry: 'src/jquery-umd.ts',
    base: 'jquery.easypiechart',
    format: 'umd',
  },
} as const;

const test = {
  environment: 'jsdom',
  setupFiles: ['./test/setup.ts'],
} as const;

export default defineConfig(({ mode }) => {
  const target = TARGETS[mode as keyof typeof TARGETS];
  // vitest runs with mode "test" and needs no lib config
  if (!target) {
    return { test };
  }

  const min = mode.endsWith('min');
  const isEs = target.format === 'es';

  return {
    build: {
      emptyOutDir: mode === 'production',
      minify: min ? 'esbuild' : false,
      lib: {
        entry: resolve(__dirname, target.entry),
        name: target.base === 'easypiechart' ? 'EasyPieChart' : 'easyPieChartJQuery',
        formats: [target.format],
        fileName: () =>
          isEs ? `${target.base}.mjs` : `${target.base}.${min ? 'min.js' : 'js'}`,
      },
      rollupOptions: {
        // UMD gets a single default export so the global is the value itself
        output: isEs ? {} : { exports: 'default' },
      },
    },
    test,
  };
});

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Game404',
      fileName: (format) => format === 'es' ? '404game.js' : `404game.${format}.cjs`,
      formats: ['es', 'umd'],
    },
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});

import { defineConfig } from 'vite';

import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = import.meta.dirname;

export default defineConfig({
  build: {
    lib: {
      entry: resolve(root, 'src/index.ts'),
      name: 'Arclace',
      fileName: 'arclace',
      formats: ['es', 'umd']
    },
    sourcemap: true
  },
  plugins: [
    {
      // The stylesheet is optional, so it's shipped as a plain file instead of
      // being imported by the library code
      name: 'arc-copy-styles',
      apply: 'build',
      writeBundle() {
        copyFileSync(
          resolve(root, 'src/style.css'),
          resolve(root, 'dist/style.css')
        );
      }
    }
  ]
});

import { dts } from 'rollup-plugin-dts';

// Vite builds the JavaScript; this bundles the declarations tsc wrote to dts/
// into one file, so consumers never resolve relative imports between .d.ts
// files (which NodeNext can't do without .js extensions)
export default {
  input: './dts/index.d.ts',
  output: { file: './dist/connect-the-things.d.ts', format: 'es' },
  plugins: [dts()]
};

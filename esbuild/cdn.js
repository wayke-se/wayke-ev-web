import * as esbuild from 'esbuild';
import Common from './common.js';

// The build for cdn.wayke.se: dist-cdn/index.js, and the stylesheet it imports as
// dist-cdn/index.css, which the script adds to the page itself.
await esbuild.build({
  ...Common,
  entryPoints: { index: 'src/cdn.ts' },
  outdir: 'dist-cdn',
  minify: true,
  sourcemap: true,
});

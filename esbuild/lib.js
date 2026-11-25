import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import * as esbuild from 'esbuild';
import Common from './common.js';

// The npm package: dist/index.js (ESM) and dist/style.css, which the site imports itself.
await esbuild.build({
  ...Common,
  entryPoints: { index: 'src/index.ts', style: 'src/styles/index.scss' },
  outdir: 'dist',
  minify: true,
  sourcemap: true,
});

// One .d.ts per source file, with dist/index.d.ts as the entry point.
// Fail the build rather than publish a package without types.
try {
  execSync('npx tsc --project tsconfig.build.json', { stdio: 'inherit' });
} catch {
  console.error('Type generation failed, aborting build');
  process.exit(1);
}

if (!existsSync('dist/index.d.ts')) {
  console.error('Type generation produced no dist/index.d.ts, aborting build');
  process.exit(1);
}

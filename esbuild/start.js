import * as esbuild from 'esbuild';
import Common from './common.js';

// Development server, rebuilding on every request.
//
//   npm start                              http://localhost:5000
//   PORT=5050 npm start                    another port
//   WAYKE_API_KEY=<key> npm start          identify the page with a key instead of its origin
const port = Number(process.env.PORT) || 5000;

const ctx = await esbuild.context({
  ...Common,
  entryPoints: { dev: 'src/dev.ts' },
  outdir: 'www/build',
  sourcemap: true,
  define: {
    DEV_API_KEY: process.env.WAYKE_API_KEY
      ? JSON.stringify(process.env.WAYKE_API_KEY)
      : 'undefined',
  },
});

await ctx.serve({ servedir: 'www', port });
console.log(`Serving on http://localhost:${port}`);

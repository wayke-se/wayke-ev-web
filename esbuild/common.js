import { sassPlugin } from 'esbuild-sass-plugin';

// Shared by the library, CDN and dev builds. The widget has no runtime dependencies,
// so every build is self-contained.
const Common = {
  bundle: true,
  format: 'esm',
  target: 'es2022',
  logLevel: 'info',
  plugins: [sassPlugin()],
};

export default Common;

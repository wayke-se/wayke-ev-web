const fs = require('fs');
const { sassPlugin } = require('esbuild-sass-plugin');
const { build } = require('esbuild');

const shared = {
  entryPoints: ['src/cdn.ts'],
  bundle: true,
  minify: true,
  sourcemap: true,
  logLevel: 'info',
  loader: {
    '.js': 'jsx',
    '.woff': 'file',
    '.woff2': 'file',
    '.gif': 'file',
    '.svg': 'dataurl',
    '.png': 'dataurl',
  },
  plugins: [sassPlugin()],
};

/** Minifying can be risky. If js stops working or gets corrupted start the investigation by removing the minification*/
const minify = () => {
  // eslint-disable-next-line
  console.log('Custom regex replacement for whitespace, newline etc. This can be RISKY.');
  fs.readFile('dist-cdn/index.js', 'utf8', async (err, data) => {
    if (err) {
      // eslint-disable-next-line
      console.log('Error occured reading file for post proceesing', err);
      return;
    }

    const formattedData = data
      .replace(/(\r\n|\n|\r|\t)/gm, '')
      .replace(/ {2,}/g, ' ') // from "   " to " "
      .replace(/> *</g, '><')
      .replace(/> *`/g, '>`') // from "> `" to ">`"
      .replace(/` *</g, '`<'); // from "` <" to "`<"

    // eslint-disable-next-line
    console.log('Post processing done!');
    fs.writeFile('dist-cdn/index.js', formattedData, (err) => {
      if (err) {
        // eslint-disable-next-line
        console.log('Error occured writing post proceesing to file', err);
      }
      // eslint-disable-next-line
      console.log('Successfully written post processing to file!');
    });
  });
};

build({
  ...shared,
  outfile: 'dist-cdn/index.js',
  format: 'esm',
}).then(() => {
  // eslint-disable-next-line
  console.log('Post processing started...');
  minify();
});

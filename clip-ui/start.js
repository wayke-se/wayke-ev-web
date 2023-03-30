import clipUi from '@ourstudio/clip-ui';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
clipUi.serve({
  folder: `${__dirname}/components`,
  staticFolder: `${__dirname}/static`,
  containerClassName: 'waykeev-root',
  injectHead: [
    {
      tag: 'link',
      attributes: [
        { key: 'rel', value: 'stylesheet' },
        { key: 'href', value: '/static/styles.css' },
      ],
    },
  ],
});

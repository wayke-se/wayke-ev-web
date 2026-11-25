// The page served by `npm start` (www/index.html), against Wayke's test environment.
// The origin it is served on has to be registered there, or a key is passed with
// WAYKE_API_KEY (see esbuild/start.js).

import './styles/index.scss';
import { mount } from './mount.js';
import type { MountOptions } from './types.js';

declare const DEV_API_KEY: string | undefined;

const shared: MountOptions = { environment: 'test', apiKey: DEV_API_KEY };

const log =
  (name: string): MountOptions['onEvent'] =>
  (event) =>
    console.log(name, event);

// A Swedish electric car, fetched by id.
mount('#ev-se', {
  ...shared,
  id: '7dc82cf1-a019-4cb4-8e2e-ca6aa70a7aee',
  hash: true,
  onEvent: log('SE'),
});

// A Norwegian one with a theme.
mount('#ev-no', {
  ...shared,
  id: '01a0326e-0c39-7c36-927f-1d11c4805091',
  theme: { primaryColor: '#227a29', primaryColorForeground: '#fff', linkColor: '#19b52f' },
  onEvent: log('NO'),
});

// Figures passed in: no request, and no battery capacity or range.
mount('#ev-data', {
  data: { energyPer100Km: 15.5, costPerKm: 0.188, pricePerKwh: 1.21, marketCode: 'SE' },
  language: 'en',
  onEvent: log('data'),
});

// An id no vehicle has: nothing is shown, and the event says why.
mount('#ev-none', {
  ...shared,
  id: '00000000-0000-4000-8000-000000000000',
  onEvent: log('none'),
});

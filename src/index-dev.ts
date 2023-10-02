import WaykeEvWeb from './App';

window.addEventListener('DOMContentLoaded', (_) => {
  new WaykeEvWeb({
    rootId: 'custom-id',
    url: 'https://api.wayketech.se',
    id: '2dc53704-ae6d-44cc-b1d4-558cfc9a8338',
    theme: {
      primaryColor: '#227a29',
      primaryColorForeground: '#fff',
      linkColor: '#19b52f',
    },
    marketCode: 'NO',
    // eslint-disable-next-line
    onEvent: (a, b, c) => console.log(a, b, c),
  });
});

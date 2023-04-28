import WaykeEvWeb from './App';

window.addEventListener('DOMContentLoaded', (_) => {
  new WaykeEvWeb({
    rootId: 'custom-id',
    url: 'https://api.wayketech.se',
    id: '4a18e9a4-f7ee-458e-8bb4-9b6b8b778bbf',
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

# Wayke EV Web

A calculator that shows what it costs to charge an electric car from Wayke, per month. The visitor picks a yearly distance and can use their own electricity price. Made for the vehicle page of a dealer or partner website.

Upgrading from 0.x? See [Migrating from 0.x to 1.0](#migrating-from-0x-to-10).

## Quick start

Add this where the calculator should be shown, and replace `<vehicle id>` with the id of the vehicle's ad at Wayke:

```html
<div id="wayke-ev"></div>
<script type="module">
  import { mount } from 'https://cdn.wayke.se/public-assets/wayke-ev-web/1.0.0/index.js';

  mount('#wayke-ev', { id: '<vehicle id>' });
</script>
```

Two things to know:

* **Your domain has to be registered with Wayke.** Until it is, nothing is shown. Ask your contact at Wayke to register it.
* **Only battery-electric cars have a charging cost.** For any other vehicle nothing is shown, so the snippet can be on every vehicle page.

That is all most sites need. The rest of this page covers npm, the options and the details.

## With npm

```bash
npm install @wayke-se/ev-web
```

```ts
import { mount } from '@wayke-se/ev-web';
import '@wayke-se/ev-web/style.css';

const calculator = mount('#wayke-ev', { id: '<vehicle id>' });

// When the element goes away:
calculator.unmount();
```

The first argument is a CSS selector or an element. The package is ESM only, has no dependencies and comes with TypeScript types. It needs a browser, so call `mount` on the client.

<details>
<summary>In React</summary>

```tsx
import { useEffect, useRef } from 'react';
import { mount } from '@wayke-se/ev-web';
import '@wayke-se/ev-web/style.css';

export const ChargingCost = ({ id }: { id: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const calculator = mount(ref.current, { id });
    return () => calculator.unmount();
  }, [id]);

  return <div ref={ref} />;
};
```

</details>

## Options

Either `id` or `data` is required. Everything else is optional.

| Option | Default | |
|--------|---------|---|
| `id` | | The id of the vehicle's ad at Wayke. The calculator fetches the figures itself. |
| `data` | | The figures, when your page already has them. See [Passing the figures yourself](#passing-the-figures-yourself). |
| `environment` | `'production'` | `'test'` uses Wayke's test environment, see [Test environment](#test-environment). |
| `apiKey` | The origin of the page | Identifies the site instead of its domain. |
| `marketCode` | The market of the vehicle | `'SE'` or `'NO'`. Sweden counts the distance in mil, Norway in km. |
| `language` | `sv` in Sweden, `nb` in Norway | `'sv'`, `'nb'` or `'en'`. |
| `theme` | | Your colors, see [Colors and fonts](#colors-and-fonts). |
| `hash` | `false` | Adds `#wayke-ev` to the url while the calculator dialog is open, so the browser's back button closes it. Useful on mobile, where the dialog covers the screen. |
| `onEvent` | | See [Events](#events). |

`mount` returns `{ unmount }`. It throws if no element matches the target, or if neither `id` nor `data` is given. It never throws for a vehicle or a network problem: nothing is shown, and [`onEvent`](#events) tells you why.

## Colors and fonts

The calculator has no font of its own and inherits the font of your page. Its accents are turquoise until you set your own colors:

```js
mount('#wayke-ev', {
  id: '<vehicle id>',
  theme: {
    primaryColor: '#227a29', // slider and radio buttons
    primaryColorForeground: '#ffffff', // placed on top of primaryColor
    linkColor: '#19b52f',
  },
});
```

To change more, add your own CSS. All class names start with `waykeev-`, inside `.waykeev-root`, and a class selector of yours always wins over the calculator's own styles. The class names can change between versions, so check your CSS when you update.

## Events

`onEvent` is called with one object, and `type` tells the events apart.

| `type` | Other fields | When |
|--------|--------------|------|
| `ready` | `data` | The calculator is on the page. |
| `unavailable` | `reason` | Nothing is shown: the vehicle has no charging cost. |
| `error` | `reason` | Nothing is shown: the request failed. |
| `distance-change` | `distanceKm`, `control` | The visitor changed the yearly distance. In km in both markets. `control` is `'slider'` or `'select'`. |
| `modal-open`, `modal-close` | | The dialog for an own electricity price. |
| `price-option-change` | `priceOption` | `'standard'` or `'custom'`. |
| `custom-price-change` | `pricePerKwh` | The visitor's own price per kWh, in the market's currency: 1.5 for 150 öre. |

The calculator takes no space until it has figures to show, so your page keeps its layout. When nothing is shown, `reason` is one of:

| `type` | `reason` | Meaning |
|--------|----------|---------|
| `unavailable` | `no-charging-data` | The vehicle is not battery-electric, or Wayke lacks the data to estimate its cost. |
| `unavailable` | `not-found` | No published vehicle has this id in this environment. |
| `error` | `unauthorized` | The domain of the page, or `apiKey`, is not registered with Wayke in this environment. |
| `error` | `rate-limited`, `network`, `server` | The request did not succeed. |

To show a heading of your own only when there is a calculator, wait for `ready`:

```js
mount('#wayke-ev', {
  id: '<vehicle id>',
  onEvent: (event) => {
    if (event.type === 'ready') document.querySelector('#charging-heading').hidden = false;
  },
});
```

## Test environment

Set `environment: 'test'` while you develop, to work with Wayke's test vehicles:

```js
mount('#wayke-ev', { id: '<vehicle id>', environment: 'test' });
```

The domain has to be registered in the environment you use, so have `localhost` or your staging domain registered in test. A vehicle id belongs to one environment: an id from production is unknown in test.

## Passing the figures yourself

If your page already reads the vehicle from Wayke's GraphQL API, pass the figures as `data`. The calculator then makes no request and is on the page at once.

```ts
import { mount, type ChargingData } from '@wayke-se/ev-web';

const data: ChargingData = {
  energyPer100Km: 16.34, // kWh per 100 km, charging losses included
  costPerKm: 0.198, // at pricePerKwh, in the market's currency
  pricePerKwh: 1.21, // Wayke's template electricity price
  marketCode: 'SE',
  batteryCapacityKwh: 75, // optional
  rangeKm: 514, // optional
};

mount('#wayke-ev', { data });
```

<details>
<summary>Where the figures are in the GraphQL API</summary>

They are attributes of the vehicle. The three `charging*` attributes are `null` for a vehicle without a charging cost.

```graphql
query ($id: ID!) {
  ads {
    byAdId(ID: $id) {
      iteration {
        item {
          ... on Vehicle {
            attributes {
              chargingEnergyConsumption { floatValue }       # energyPer100Km
              chargingCostPerKilometer { floatValue unit }   # costPerKm, unit "SEK/km" or "NOK/km"
              chargingPricePerKwh { floatValue }             # pricePerKwh
              batteryCapacityNet { intValue }                # batteryCapacityKwh
              electricRangeWltp { minvalue }                 # rangeKm
            }
          }
        }
      }
    }
  }
}
```

</details>

## How the cost is calculated

```
cost per month = energy per km × price per kWh × distance per year / 12
```

* **Energy per km** comes from Wayke: the energy drawn from the socket, charging losses included, based on the car's WLTP figures.
* **Price per kWh** is Wayke's template price for the market, with energy tax and VAT included. The grid fee is not included. The visitor can enter their own price instead, which is calculated in the browser without a request.
* **Distance per year** is chosen by the visitor: 500 to 5 000 mil in Sweden, 5 000 to 50 000 km in Norway.

## CDN details

Every release is published to `https://cdn.wayke.se/public-assets/wayke-ev-web/<version>/index.js`. Use an exact version: its files never change, so your site only changes when you update the version in the snippet. The latest version is shown on [npm](https://www.npmjs.com/package/@wayke-se/ev-web).

The script adds its stylesheet, `index.css` in the same folder, to the top of `<head>`, so the styles of your site override it. To load the stylesheet yourself, add a `<link>` to it with the same URL, and the script does not add it again.

<details>
<summary>With a script tag instead of import</summary>

The script sets `window.WaykeEv` when it has loaded. Module scripts run after the page has been read, so wait for `DOMContentLoaded`. If the snippet is added after the page has loaded, for example by a tag manager, use the import in [Quick start](#quick-start) instead.

```html
<div id="wayke-ev"></div>
<script type="module" src="https://cdn.wayke.se/public-assets/wayke-ev-web/1.0.0/index.js"></script>
<script>
  window.addEventListener('DOMContentLoaded', () => {
    WaykeEv.mount('#wayke-ev', { id: '<vehicle id>' });
  });
</script>
```

Add `disablecssinjection` to the script tag to not load the stylesheet at all. The calculator is then unstyled.

</details>

## Migrating from 0.x to 1.0

1.0 is a rewrite. The calculator looks the same, is a fifth of the size, and no longer makes a request for an own electricity price.

```js
// 0.x
import WaykeEvWeb from '@wayke-se/ev-web';
import '@wayke-se/ev-web/dist/index.css';

new WaykeEvWeb({
  url: 'https://api.wayke.se',
  id: '4a18e9a4-f7ee-458e-8bb4-9b6b8b778bbf',
  rootId: 'custom-id',
  marketCode: 'SE',
});

// 1.0
import { mount } from '@wayke-se/ev-web';
import '@wayke-se/ev-web/style.css';

mount('#custom-id', { id: '4a18e9a4-f7ee-458e-8bb4-9b6b8b778bbf' });
```

| 0.x | 1.0 |
|-----|-----|
| `new WaykeEvWeb(options)` | `mount(target, options)` |
| `@wayke-se/ev-web/dist/index.css` | `@wayke-se/ev-web/style.css` |
| `window.WaykeEvWeb` (CDN) | `window.WaykeEv.mount`, or import `mount` from the script |
| `url: 'https://api.wayke.se'` | Remove it. Production is the default. |
| `url: 'https://api.wayketech.se'` | `environment: 'test'` |
| `rootId: 'custom-id'` | The first argument, `'#custom-id'`. It is required: the calculator is no longer added to `<body>` without it. |
| `marketCode` | Optional. The market follows the vehicle. |
| `theme`, `hash` | Unchanged. |
| `onEvent: (view, event, data) => ...` | `onEvent: (event) => ...`, with new names, see below. |

Events:

| 0.x | 1.0 |
|-----|-----|
| `INITIAL_REQUEST_SUCCEEDED` | `ready` |
| `INITIAL_REQUEST_FAILED` | `unavailable` or `error`, with a `reason` |
| `DISTANCE_SLIDER`, `DISTANCE_SELECT` | `distance-change` with `control` |
| `MODAL_OPENED`, `MODAL_CLOSED` | `modal-open`, `modal-close` |
| `TOGGLE_PRICE` | `price-option-change`, with `'standard'` or `'custom'` (was `'standardPrice'` or `'customPrice'`) |
| `CUSTOM_PRICE_CHANGE` | `custom-price-change`, with `pricePerKwh` in kronor (`customPrice` was in öre) |
| `INITIALIZED`, `INITIAL_REQUEST_PENDING`, `REQUEST_CUSTOM_PRICE_*` | Removed |

Also different:

* **A registration number is no longer accepted as `id`.** Use the id of the vehicle's ad at Wayke.
* **The fonts are gone.** 0.x came with Wayke's and Drive's fonts, 1.0 uses the font of your page.
* **More cars get a cost.** 0.x showed nothing for a car without a battery capacity at Wayke. 1.0 then uses the car's WLTP consumption.
* **The package is ESM only.** `require('@wayke-se/ev-web')` no longer works.
* **If nothing is shown after the upgrade**, `onEvent` gets `error` with the reason `unauthorized` when the domain is not registered. Ask your contact at Wayke to check the registration.

## Development

```bash
npm install
npm start       # the development page on http://localhost:5000, against Wayke's test environment
npm test        # lint, types, stylelint and unit tests
npm run build   # dist/ for npm and dist-cdn/ for the CDN
```

The origin of the development page has to be registered in Wayke's test environment. `PORT=5050 npm start` uses another port, and `WAYKE_API_KEY=<key> npm start` identifies the page with a key instead of its origin.

A push to `main` or `test` releases the version in `package.json` to the CDN and npm. A pre-release version, such as `1.1.0-beta.1`, gets the npm tag `next`, and so does everything released from `test`. Only a plain version on `main` becomes `latest`. A version that is already published is refused, so bump the version first. The release log prints the CDN url the files are served from.

# Wayke EV Web

A calculator that shows what it costs to charge an electric car from Wayke, per month. The visitor picks a yearly distance and can use their own electricity price. Made for the vehicle page of a dealer or partner website.

Upgrading from 0.x? See [Migrating from 0.x to 1.0](#migrating-from-0x-to-10).

## Quick start

Add this where the calculator should be shown, and replace `<vehicle id>` with the id of the vehicle's ad at Wayke, such as `4a18e9a4-f7ee-458e-8bb4-9b6b8b778bbf`:

```html
<div id="wayke-ev"></div>
<script type="module">
  import { mount } from 'https://cdn.wayke.se/public-assets/wayke-ev-web/1.0.0/index.js';

  mount('#wayke-ev', { id: '<vehicle id>' });
</script>
```

<details>
<summary>The same snippet for Wayke's test environment</summary>

For a staging site or `localhost`, registered in Wayke's test environment. See [Environments](#environments).

```html
<div id="wayke-ev"></div>
<script type="module">
  import { mount } from 'https://cdn.wayke.se/public-assets/wayke-ev-web/1.0.0/index.js';

  mount('#wayke-ev', { id: '<vehicle id>', environment: 'test' });
</script>
```

</details>

Three things to know:

* **Your domain has to be registered with Wayke.** Wayke recognizes the site by its domain. Until the domain is registered, nothing is shown. Ask your contact at Wayke to register it, and see [Environments](#environments) for development.
* **Only battery-electric cars have a charging cost.** For any other vehicle nothing is shown, so the snippet can be on every vehicle page. See [When nothing is shown](#when-nothing-is-shown).
* **The calculator uses the font of your page.** Set the colors to match your site, see [Colors and fonts](#colors-and-fonts).

## Contents

* [Add to your site](#add-to-your-site): [CDN](#cdn), [npm](#npm)
* [Environments](#environments)
* [Options](#options)
* [Passing the figures yourself](#passing-the-figures-yourself)
* [When nothing is shown](#when-nothing-is-shown)
* [Colors and fonts](#colors-and-fonts)
* [Events](#events)
* [How the cost is calculated](#how-the-cost-is-calculated)
* [Development](#development)
* [Migrating from 0.x to 1.0](#migrating-from-0x-to-10)

## Add to your site

| Your site | Use |
|-----------|-----|
| Any website, without a build step, such as a CMS or static HTML | [CDN](#cdn) |
| A website with its own bundler (Vite, webpack, Next.js, ...) | [npm](#npm) |

### CDN

Every release is published to the Wayke CDN. Nothing needs to be installed.

```
https://cdn.wayke.se/public-assets/wayke-ev-web/<version>/index.js
```

Use an exact version. The files of a version never change, so your site only changes when you update the version in the snippet. The latest version is shown on [npm](https://www.npmjs.com/package/@wayke-se/ev-web).

There are two ways to load the script. They show the same thing and take the same options.

**Option A: import** (recommended) is the snippet in [Quick start](#quick-start).

**Option B: script tag.** The script sets `window.WaykeEv` when it has loaded. Module scripts run after the page has been read, so wait for `DOMContentLoaded` before you use it. If the snippet is added after the page has loaded, for example by a tag manager, `DOMContentLoaded` has already happened, so use option A.

```html
<div id="wayke-ev"></div>
<script type="module" src="https://cdn.wayke.se/public-assets/wayke-ev-web/1.0.0/index.js"></script>
<script>
  window.addEventListener('DOMContentLoaded', () => {
    WaykeEv.mount('#wayke-ev', { id: '<vehicle id>' });
  });
</script>
```

#### Stylesheet

The script adds its stylesheet, `index.css` in the same folder, to the top of `<head>`, and shows the calculator when it has loaded. Since it is added first, the styles of your site override it.

To load the stylesheet yourself, add a `<link>` to it with the same URL. The script finds it and does not add it again.

```html
<link rel="stylesheet" href="https://cdn.wayke.se/public-assets/wayke-ev-web/1.0.0/index.css">
```

To not load the stylesheet at all, add `disablecssinjection` to the script tag in option B. The calculator is then unstyled.

### npm

```bash
npm install @wayke-se/ev-web
```

```ts
import { mount } from '@wayke-se/ev-web';
import '@wayke-se/ev-web/style.css';

const calculator = mount('#wayke-ev', { id: '<vehicle id>' });

// When the element goes away, for example when a component unmounts:
calculator.unmount();
```

The first argument is a CSS selector or an element. The package is ESM only, has no dependencies, and comes with TypeScript types. It needs a browser, so call `mount` on the client, for example in `useEffect` in React:

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

## Environments

| `environment` | Shows | Your domain is registered in |
|---------------|-------|------------------------------|
| `production` (default) | The vehicles on wayke.se and drive.no | Wayke's production environment |
| `test` | Test vehicles | Wayke's test environment |

A vehicle id belongs to one environment. An id from production is unknown in test, and the other way around.

Each environment recognizes the site by the domain the request comes from, so the domain has to be registered in that environment. To develop on `localhost` or a staging domain, have it registered in test. Instead of the domain, a site can be identified with `apiKey`, see [Options](#options).

## Options

```ts
mount(target, options);
```

Either `id` or `data` is required. Everything else is optional.

| Option | Type | Default | |
|--------|------|---------|---|
| `id` | `string` | | The id of the vehicle's ad at Wayke. The calculator fetches the figures itself. |
| `data` | [`ChargingData`](#passing-the-figures-yourself) | | The figures, when your page already has them. No request is made. |
| `environment` | `'production' \| 'test'` | `'production'` | See [Environments](#environments). |
| `apiKey` | `string` | The origin of the page | Identifies the site instead of its domain. |
| `marketCode` | `'SE' \| 'NO'` | The market of the vehicle | Sweden counts the distance in mil and Norway in km. |
| `language` | `'sv' \| 'nb' \| 'en'` | `sv` in Sweden, `nb` in Norway | |
| `theme` | `{ primaryColor?, primaryColorForeground?, linkColor? }` | | See [Colors and fonts](#colors-and-fonts). |
| `hash` | `boolean` | `false` | Adds `#wayke-ev` to the url while the calculator dialog is open, so the browser's back button closes it. Useful on mobile, where the dialog covers the screen. |
| `onEvent` | `(event) => void` | | See [Events](#events). |

`mount` returns `{ unmount }`. `unmount()` removes the calculator and everything it added to the page.

`mount` throws if no element matches `target`, or if neither `id` nor `data` is given. It never throws for a vehicle or a network problem: see [When nothing is shown](#when-nothing-is-shown).

## Passing the figures yourself

If your page already reads the vehicle from Wayke's GraphQL API, pass the figures as `data`. The calculator then makes no request, and is on the page at once.

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

The figures are attributes of the vehicle:

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

The three `charging*` attributes are `null` for a vehicle without a charging cost. Do not mount the calculator then.

## When nothing is shown

The calculator takes no space until it has figures to show, and stays empty when it has none. Your page keeps its layout, and `onEvent` tells you why:

| Event | `reason` | Meaning |
|-------|----------|---------|
| `unavailable` | `no-charging-data` | The vehicle is not battery-electric (petrol, diesel and plug-in hybrids have no charging cost), or Wayke lacks the data to estimate its cost. |
| `unavailable` | `not-found` | No published vehicle has this id in this environment. |
| `error` | `unauthorized` | The domain of the page, or `apiKey`, is not registered with Wayke in this environment. |
| `error` | `rate-limited` | Too many requests from the site in a short time. |
| `error` | `network` | The request did not reach Wayke. |
| `error` | `server` | Wayke answered with an error. |

To show a section heading only when there is a calculator, wait for `ready`:

```js
mount('#wayke-ev', {
  id,
  onEvent: (event) => {
    if (event.type === 'ready') document.querySelector('#charging-section').hidden = false;
  },
});
```

## Colors and fonts

The calculator has no font of its own and inherits the font of your page. Its accents are turquoise until you set your own colors:

```js
mount('#wayke-ev', {
  id,
  theme: {
    primaryColor: '#227a29', // slider and radio buttons
    primaryColorForeground: '#ffffff', // placed on top of primaryColor
    linkColor: '#19b52f',
  },
});
```

The theme is set per calculator, so two on the same page can differ.

To change more than the colors, add your own CSS. All class names start with `waykeev-`, and the calculator is wrapped in `.waykeev-root`. Its own element styles sit inside `:where()`, so a class selector of yours always wins:

```css
.waykeev-root .waykeev-heading {
  font-family: 'Your Heading Font', sans-serif;
}
```

The class names are not part of the public API and can change between versions, so check your CSS when you update.

The calculator never changes the styles of your page. Your page can change the calculator though: a rule on an element, such as `button { ... }` or `h2 { ... }`, also applies inside it. If something looks off, look for such a rule first.

## Events

`onEvent` is called with one object. `type` tells the events apart.

| `type` | Other fields | When |
|--------|--------------|------|
| `ready` | `data` | The calculator is on the page. `data` is the figures it shows. Like every event, it is delivered after `mount` has returned. |
| `unavailable` | `reason` | Nothing is shown, see [When nothing is shown](#when-nothing-is-shown). |
| `error` | `reason` | Nothing is shown, see [When nothing is shown](#when-nothing-is-shown). |
| `distance-change` | `distanceKm`, `control` | The visitor changed the yearly distance. `distanceKm` is in km in both markets, `control` is `'slider'` or `'select'`. |
| `modal-open` | | The visitor opened the dialog for their own electricity price. |
| `modal-close` | | The dialog was closed. |
| `price-option-change` | `priceOption` | `'standard'` or `'custom'`. |
| `custom-price-change` | `pricePerKwh` | The visitor entered their own price. In the market's currency per kWh, so 1.5 for 150 öre. |

```ts
import { mount, type EvEvent } from '@wayke-se/ev-web';

const onEvent = (event: EvEvent) => {
  if (event.type === 'distance-change') {
    analytics.track('charging_distance', { km: event.distanceKm });
  }
};

mount('#wayke-ev', { id, onEvent });
```

## How the cost is calculated

```
cost per month = energy per km × price per kWh × distance per year / 12
```

* **Energy per km** comes from Wayke. It is the energy drawn from the socket, with charging losses included, based on the car's WLTP figures: its battery capacity and range, or its WLTP consumption when Wayke lacks the capacity.
* **Price per kWh** is Wayke's template price for the market, with energy tax and VAT included. The grid fee is not included. In the dialog the visitor can enter their own price instead.
* **Distance per year** is chosen by the visitor: 500 to 5 000 mil in Sweden, 5 000 to 50 000 km in Norway.

An own price is calculated in the browser, without a request.

## Development

```bash
npm install
npm start       # the development page on http://localhost:5000, against Wayke's test environment
npm test        # lint, types, stylelint and unit tests
npm run build   # dist/ for npm and dist-cdn/ for the CDN
```

The origin of the development page has to be registered in Wayke's test environment. To use another port, run `PORT=5050 npm start`. To identify the page with a key instead of its origin, run `WAYKE_API_KEY=<key> npm start`.

A push to `main` or `test` releases the version in `package.json` to the CDN and npm. A pre-release version, such as `1.1.0-beta.1`, gets the npm tag `next`, and so does everything released from `test`. Only a plain version on `main` becomes `latest`. A version that is already published is refused, so bump the version first. The release log prints the CDN url the files are served from.

## Migrating from 0.x to 1.0

1.0 is a rewrite. The calculator looks the same, and has become smaller and faster: the package went from about 1 MB to about 200 kB, of which the browser loads 50 kB, and an own electricity price no longer needs a request.

### What to change

**1. `new WaykeEvWeb(...)` is now `mount(...)`.**

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

**2. Options.**

| 0.x | 1.0 |
|-----|-----|
| `url: 'https://api.wayke.se'` | Remove it. Production is the default. |
| `url: 'https://api.wayketech.se'` | `environment: 'test'` |
| `rootId: 'custom-id'` | The first argument: `mount('#custom-id', ...)`. It is required, the calculator is no longer added to `<body>` without it. |
| `marketCode` | Optional. The market follows the vehicle. |
| `theme`, `hash` | Unchanged. |
| `onEvent: (view, event, data) => ...` | `onEvent: (event) => ...`, see below. |

**3. The stylesheet** is imported from `@wayke-se/ev-web/style.css` instead of `@wayke-se/ev-web/dist/index.css`.

**4. CDN.** The script now exports `mount`, and `window.WaykeEvWeb` is replaced by `window.WaykeEv.mount`. See [CDN](#cdn).

**5. Events.**

| 0.x | 1.0 |
|-----|-----|
| `INITIALIZED`, `INITIAL_REQUEST_PENDING` | Removed. |
| `INITIAL_REQUEST_SUCCEEDED` | `ready` |
| `INITIAL_REQUEST_FAILED` | `unavailable` or `error`, with a `reason` |
| `DISTANCE_SLIDER`, `DISTANCE_SELECT` | `distance-change` with `control` |
| `MODAL_OPENED`, `MODAL_CLOSED` | `modal-open`, `modal-close` |
| `TOGGLE_PRICE` | `price-option-change`. `priceOption` is `'standard'` or `'custom'`, it was `'standardPrice'` or `'customPrice'`. |
| `CUSTOM_PRICE_CHANGE` | `custom-price-change`. `pricePerKwh` is in kronor, `customPrice` was in öre. |
| `REQUEST_CUSTOM_PRICE_PENDING`, `_SUCCEEDED`, `_FAILED` | Removed. An own price is calculated in the browser. |

### What else is different

* **The id is the id of the vehicle's ad at Wayke.** A registration number is no longer accepted as `id`.
* **The fonts are gone.** 0.x came with Wayke's and Drive's fonts. 1.0 uses the font of your page, see [Colors and fonts](#colors-and-fonts).
* **More cars get a cost.** 0.x showed nothing for a car without a battery capacity at Wayke. 1.0 then uses the car's WLTP consumption.
* **Your domain has to be registered with Wayke**, as before. If nothing is shown after the upgrade, `onEvent` gets `error` with the reason `unauthorized`: ask your contact at Wayke to check the registration.
* **The package is ESM only.** `require('@wayke-se/ev-web')` no longer works. Every current bundler handles ESM.
* **`unmount()`** removes the calculator. 0.x had no way to do that.
* **The figures can be passed in** as `data`, see [Passing the figures yourself](#passing-the-figures-yourself).

# Wayke EV Web

This is an embeddable widget used to calculate electric car charging costs.

## Getting started

__Using npm__

```bash
npm install @wayke-se/ev-web
```

```js
import WaykeEvWeb from "@wayke-se/ev-web";
import "@wayke-se/ev-web/dist/index.css";

const context = new WaykeEvWeb({
    url: 'https://api.wayke.se',
    id: '4a18e9a4-f7ee-458e-8bb4-9b6b8b778bbf',
});
```

__Using cdn__
The associated css is injected into head by default once a `new WaykeEvWeb(...)` is called. This can be turned off by adding `disablecssinjection` to the script tag.


```html
   <script
    type="module"
    src="https://cdn.wayke.se/public-assets/wayke-ev-web/x.x.x/index.js"
  ></script>

  <script>
    window.addEventListener("DOMContentLoaded", (_) => {
      var context = new WaykeEvWeb({
        url: 'https://api.wayke.se',
        id: '4a18e9a4-f7ee-458e-8bb4-9b6b8b778bbf',
      });
    });
  </script>
```

## Full configuration

```js
new WaykeEvWeb({
  url: 'https://api.wayke.se',
  id: '4a18e9a4-f7ee-458e-8bb4-9b6b8b778bbf',
  rootId: 'custom-id',
  theme: {
    primaryColor: '#227a29',
    primaryColorForeground: '#b8dbbb',
    linkColor: '#0000ff',
  },
  onEvent: (view, event, data) => console.log(view, event, data),
});
```

### Required
* `id` Id of the vehicle from Wayke or a swedish registration number
* `url` Should be one of the following urls below:

| Environment | Url |
| ----------- | --- |
| Test | https://test-ext-api.wayketech.se |
| Production | https://api.wayke.se |


### Optional
- `rootId` Choose the element, id, that WakeEvWeb should append to, by default it will be appended to the body.
- `hash` Enables hash in route. Will prevent the user from navigating to the previous page when using the back button. It's recommended to enable this option for a better experience in mobile as the modal takes up the whole screen.
- `onEvent` Listen to events. See [Events](#events) below.
- `theme.primaryColor` Override primary color. Defaults to `#00b6d3`
- `theme.primaryColorForeground` Override color placed on top of the primary color. Defaults to `#fff`
- `theme.linkColor` Override color of links. Defaults to `#00b6d3`

### Events

| View  | Event                          | data                                                                |
| ------|------------------------------- | ------------------------------------------------------------------- |
| MAIN  | INITIALIZED                    | `{ "id": string }`                                                  |
| MAIN  | INITIAL_REQUEST_PENDING        | `{ "id": string }`                                                  |
| MAIN  | INITIAL_REQUEST_SUCCEEDED      | `{ "id": string }`                                                  |
| MAIN  | INITIAL_REQUEST_FAILED         | `{ "id": string, "statusCode": number \| undefined }`               |
| MAIN  | MILEAGE_SLIDER                 | `{ "id": string }`                                                  |
| MAIN  | MILEAGE_SELECT                 | `{ "id": string }`                                                  |
| MAIN  | MODAL_OPENED                   | `{ "id": string }`                                                  |
| MODAL | MODAL_CLOSED                   | `{ "id": string }`                                                  |
| MODAL | REQUEST_CUSTOM_PRICE_PENDING   | `{ "id": string }`                                                  |
| MODAL | REQUEST_CUSTOM_PRICE_SUCCEEDED | `{ "id": string }`                                                  |
| MODAL | REQUEST_CUSTOM_PRICE_FAILED    | `{ "id": string, "statusCode": number \| undefined }`               |
| MODAL | TOGGLE_PRICE                   | `{ "id": string, "priceOption": 'standardPrice' \| 'customPrice' }` |
| MODAL | CUSTOM_PRICE_CHANGE            | `{ "id": string, "customPrice": number }`                           |
## CSS specificity

⚠️ **We can guarantee to not overwrite any of the host site CSS. But it is possible for the host site to overwrite the styling in _Wayke EV_. Read how to prevent such overwrites below.**

All CSS class names are prefixed using the namespace `.waykeev-*`. This will prevent this widget to overwrite any CSS applied to the website on which it is implemented on. However, we can not guarantee other CSS files won't overwrite the CSS in _Wayke EV_. This is due to it is impossible to protect against element selectors.

Reset styles and other necessary CSS targeting elements are selected using a nested selector based of the root element (`.waykeev-root`) placed inside a `:where()` to prevent higher specificity than class name selectors.

> Avoid using element selectors (div, a, span etc.) in you website's CSS. It is a good practice to only using classes as selectors. If you experience strange styling in the _Wayke EV_ widget, this is probably the case.

## Custom CSS

If you want to custommize any CSS we recommend you to include a separate CSS file with your styling using our selectors namespaced for higher specificity. I.e., `.you-company-name .waykeev-[COMPONENT_NAME] { };`.

The easiest way to add a namespace is to wrap the mounting element (`#custom-id`) with a div having this namespace set following the example below.

```html
<div class="your-company-name">
  <div id="custom-id"></div>
</div>
```

> **Important:** We can not guarantee our class names will stay the same or behave the same as they do at a specific time. Please understand that you may have to change the CSS continuously if you decide to add custom styling.

## Headings

To prevent multiple `h1` on your website, _Wayke EV_ does not include a `h1` as root heading level. Instead the headings starts from h2.
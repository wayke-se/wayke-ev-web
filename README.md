# Wayke EV Web

This is an embeddable widget used to calculate electric car charging costs.

## Getting started

Documentation goes here...

## Full configuration

### Optional

- `theme.primaryColor` Override primary color. Defaults to `#00b6d3`
- `theme.primaryColorForeground` Override color placed on top of the primary color. Defaults to `#fff`
- `theme.linkColor` Override color of links. Defaults to `#00b6d3`

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
// A minimal element builder. Everything the widget shows is created through it,
// with text set as text nodes, so nothing from the API or the options is ever
// parsed as HTML.

type Attributes = Record<string, string | number | boolean | undefined>;
type Child = Node | string | false | null | undefined;

const SVG_NS = 'http://www.w3.org/2000/svg';

const setAttributes = (element: Element, attributes: Attributes) => {
  for (const [name, value] of Object.entries(attributes)) {
    if (value === undefined || value === false) continue;
    element.setAttribute(name, value === true ? '' : String(value));
  }
};

export const h = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Attributes = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);
  setAttributes(element, attributes);
  for (const child of children) {
    if (child === false || child === null || child === undefined) continue;
    element.append(child);
  }
  return element;
};

/** A decorative icon: one path in a 16 × 16 viewBox. */
export const icon = (path: string) => {
  const svg = document.createElementNS(SVG_NS, 'svg');
  setAttributes(svg, {
    viewBox: '0 0 16 16',
    class: 'waykeev-icon',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  const shape = document.createElementNS(SVG_NS, 'path');
  shape.setAttribute('d', path);
  svg.append(shape);
  return svg;
};

export const ICONS = {
  bulb: 'M7 2V1c0-.6.4-1 1-1s1 .4 1 1v1c0 .6-.4 1-1 1s-1-.4-1-1zM2.3 4.7c.2.2.4.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4l-1-1c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l1 1zm12.4-1c.4-.4.4-1 0-1.4s-1-.4-1.4 0l-1 1c-.4.4-.4 1 0 1.4.2.2.4.3.7.3s.5-.1.7-.3l1-1zm-2.4 2.6c.5.7.7 1.5.7 2.4 0 .8-.2 1.6-.7 2.3-.3.5-.8 1-1.3 1.3V15c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-2.7c-.5-.3-1-.8-1.3-1.3-.5-.7-.7-1.5-.7-2.4 0-.8.2-1.6.7-2.3.4-.7 1.1-1.3 1.8-1.7C6.3 4.2 7.1 4 8 4c.9 0 1.7.2 2.5.6.7.4 1.4 1 1.8 1.7zM11 8.6c0-.4-.1-.9-.4-1.3-.2-.3-.6-.7-1.1-.9C9.1 6.1 8.6 6 8 6c-.5 0-1.1.1-1.5.4-.5.2-.9.5-1.1.9-.3.4-.4.9-.4 1.3s.1.9.4 1.3c.3.4.6.7 1.1 1 .3.2.5.5.5.9V14h2v-2.2c0-.4.2-.7.5-.9.5-.2.8-.6 1.1-1 .3-.4.4-.8.4-1.3zM15 7h-.5c-.6 0-1 .4-1 1s.4 1 1 1h.5c.6 0 1-.4 1-1s-.4-1-1-1zM1.5 7H1c-.6 0-1 .4-1 1s.4 1 1 1h.5c.6 0 1-.4 1-1s-.4-1-1-1z',
  close: 'M9.1 8l5.9 5.9-1.1 1.1L8 9.1 2.1 15 1 13.9 6.9 8 1 2.1 2.1 1 8 6.9 13.9 1 15 2.1 9.1 8z',
  help: 'M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm-1.4-3.8h1.9V12H6.6v-1.8zm3.8-3.4c0 1-.5 1.5-1.4 2l-.4.3c-.3.1-.3.2-.3.4v.1H6.7v-.3c0-.6.1-.9.8-1.3l.7-.4c.3-.2.6-.4.6-.8s-.3-.7-.7-.7c-.5 0-.8.3-.8.8v.3H5.7v-.4c0-1.2.8-2 2.3-2 1.5 0 2.4.7 2.4 2z',
  helpClose:
    'M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm3.5-8.1L9.4 8l2.1 2.1-1.4 1.4L8 9.4l-2.1 2.1-1.4-1.4L6.6 8 4.5 5.9l1.4-1.4L8 6.6l2.1-2.1 1.4 1.4z',
};

const DRIVE_SYMBOL =
  'M19.27 0H5.348L2.126 22.838h8.445l2.126-15.241h5.479c6.83 0 11.086 4.886 10.156 11.4a13.292 13.292 0 0 1-4.537 8.195 13.441 13.441 0 0 1-8.84 3.206H1.063L0 38h13.919c11.74 0 21.349-8.41 22.88-19.018C38.328 8.373 31.01 0 19.27 0Z';

// The Wayke symbol: fifteen dots as [cx, cy, r].
const WAYKE_SYMBOL: [number, number, number][] = [
  [4.25, 39.68, 4.25],
  [25.15, 68.03, 4.96],
  [46.04, 96.38, 6.38],
  [66.93, 68.03, 7.09],
  [87.82, 39.68, 8.5],
  [108.72, 68.03, 10.63],
  [129.61, 96.38, 12.76],
  [150.5, 68.03, 13.47],
  [171.4, 39.68, 14.17],
  [129.61, 39.68, 12.05],
  [66.93, 11.34, 7.09],
  [150.5, 11.34, 11.34],
  [108.72, 11.34, 10.63],
  [46.04, 39.68, 6.38],
  [25.15, 11.34, 4.96],
];

/** The brand symbol shown next to "Powered by". */
export const brandSymbol = (brand: string) => {
  const svg = document.createElementNS(SVG_NS, 'svg');
  setAttributes(svg, {
    class: 'waykeev-powered-by-wayke',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: brand === 'Drive' ? '0 0 37 38' : '0 0 185.57 109.13',
  });
  if (brand === 'Drive') {
    const shape = document.createElementNS(SVG_NS, 'path');
    shape.setAttribute('d', DRIVE_SYMBOL);
    svg.append(shape);
    return svg;
  }
  for (const [cx, cy, r] of WAYKE_SYMBOL) {
    const circle = document.createElementNS(SVG_NS, 'circle');
    setAttributes(circle, { cx, cy, r });
    svg.append(circle);
  }
  return svg;
};

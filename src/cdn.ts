// Entry point for the CDN build (dist-cdn/index.js). It adds its own stylesheet to
// the page, so a site needs one <script type="module"> and nothing else.

import './styles/index.scss';
import { mount as mountWidget } from './mount.js';
import type { EvInstance, MountOptions } from './types.js';

const cssHref = new URL('./index.css', import.meta.url).href;

const hasStylesheet = () =>
  Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).some(
    (link) => link.href === cssHref
  );

const isCssInjectionDisabled = () =>
  Array.from(document.querySelectorAll<HTMLScriptElement>('script[disablecssinjection]')).some(
    (script) => script.src === import.meta.url
  );

let cssLoaded: Promise<void> | undefined;

// Prepended to <head>, so the site's own stylesheets, loaded later, win over it.
const injectCss = () => {
  cssLoaded ??=
    hasStylesheet() || isCssInjectionDisabled()
      ? Promise.resolve()
      : new Promise((resolve) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = cssHref;
          link.onload = () => resolve();
          link.onerror = () => resolve();
          document.head.prepend(link);
        });
  return cssLoaded;
};

/** Same as the package's `mount`, but waits for the stylesheet so nothing shows unstyled. */
export const mount = (target: string | Element, options: MountOptions): EvInstance => {
  let instance: EvInstance | undefined;
  let unmounted = false;

  injectCss().then(() => {
    if (!unmounted) instance = mountWidget(target, options);
  });

  return {
    unmount: () => {
      unmounted = true;
      instance?.unmount();
    },
  };
};

const WaykeEv = { mount };

declare global {
  interface Window {
    WaykeEv: typeof WaykeEv;
  }
}

window.WaykeEv = WaykeEv;

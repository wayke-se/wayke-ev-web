import { version } from '../package.json';
import { ApiError, fetchChargingData } from './api.js';
import { isChargingData } from './chargingCost.js';
import { createTranslator, defaultLanguage } from './i18n.js';
import type { ChargingData, EvEvent, EvInstance, MountOptions, Theme } from './types.js';
import { renderWidget } from './widget.js';

const resolveTarget = (target: string | Element): Element => {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) throw new Error(`Wayke EV: no element matches "${target}"`);
  return element;
};

// Set on the widget's own root, so two widgets on a page can have different themes.
const applyTheme = (root: HTMLElement, theme: Theme | undefined) => {
  if (theme?.primaryColor) root.style.setProperty('--theme-primary-bg', theme.primaryColor);
  if (theme?.primaryColorForeground) {
    root.style.setProperty('--theme-primary-fg', theme.primaryColorForeground);
  }
  if (theme?.linkColor) root.style.setProperty('--theme-link-color', theme.linkColor);
};

/**
 * Shows the charging cost calculator for one vehicle inside `target`, a CSS selector
 * or an element.
 *
 * Nothing is shown while the figures load, or when the vehicle has no charging cost:
 * `onEvent` then gets `unavailable` or `error`, and the page keeps its layout.
 */
export const mount = (target: string | Element, options: MountOptions): EvInstance => {
  const element = resolveTarget(target);
  if (!options?.id && !options?.data) {
    throw new Error('Wayke EV: either "id" or "data" is required');
  }

  const controller = new AbortController();
  const root = document.createElement('div');
  root.className = 'waykeev-root';
  root.dataset.version = version;
  root.hidden = true;
  applyTheme(root, options.theme);
  element.append(root);

  // A listener that throws must not take the widget down with it.
  const emit = (event: EvEvent) => {
    if (controller.signal.aborted) return;
    try {
      options.onEvent?.(event);
    } catch (error) {
      setTimeout(() => {
        throw error;
      });
    }
  };

  const show = (data: ChargingData) => {
    const marketCode = options.marketCode ?? data.marketCode ?? 'SE';
    root.dataset.market = marketCode;
    renderWidget(root, {
      data,
      marketCode,
      t: createTranslator(options.language ?? defaultLanguage(marketCode)),
      hash: options.hash === true,
      poweredBy: options.poweredBy !== false,
      emit,
      signal: controller.signal,
    });
    root.hidden = false;
    // Always after mount() has returned, also when the figures were passed in, so a
    // listener can rely on having the instance.
    queueMicrotask(() => emit({ type: 'ready', data }));
  };

  if (options.data) {
    if (isChargingData(options.data)) show(options.data);
    else queueMicrotask(() => emit({ type: 'unavailable', reason: 'no-charging-data' }));
  } else if (options.id) {
    fetchChargingData({
      id: options.id,
      environment: options.environment ?? 'production',
      apiKey: options.apiKey,
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result.status === 'ok') show(result.data);
        else emit({ type: 'unavailable', reason: result.reason });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        emit({ type: 'error', reason: error instanceof ApiError ? error.reason : 'network' });
      });
  }

  return {
    unmount: () => {
      if (controller.signal.aborted) return;
      // Closing first lets the dialog undo the hash it added and report that it closed.
      root.querySelector<HTMLDialogElement>('dialog[open]')?.close();
      controller.abort();
      root.remove();
    },
  };
};

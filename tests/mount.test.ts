// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../src/mount';
import type { ChargingData, EvEvent } from '../src/types';

const DATA: ChargingData = {
  energyPer100Km: 20.36,
  costPerKm: 0.247,
  pricePerKwh: 1.21,
  marketCode: 'SE',
  batteryCapacityKwh: 76,
  rangeKm: 418,
};

const flush = () => new Promise((resolve) => setTimeout(resolve));

// Intl may use a non-breaking space as thousands separator.
const text = (element: Element | null | undefined) =>
  (element?.textContent ?? '').replace(/\s+/g, ' ').trim();

// Events are delivered after mount() has returned, so the helper waits for them.
const setup = async (data: ChargingData = DATA, options: Record<string, unknown> = {}) => {
  const events: EvEvent[] = [];
  const instance = mount('#target', { data, onEvent: (event) => events.push(event), ...options });
  const root = document.querySelector<HTMLElement>('.waykeev-root') as HTMLElement;
  const dialog = root.querySelector('dialog') as HTMLDialogElement;
  await flush();
  return { instance, events, root, dialog };
};

const change = (element: HTMLInputElement | HTMLSelectElement, value: string, type = 'change') => {
  element.value = value;
  element.dispatchEvent(new Event(type, { bubbles: true }));
};

describe('mount', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="target"></div>';
  });

  afterEach(() => vi.unstubAllGlobals());

  it('shows the monthly cost at the template price', async () => {
    const { root, events } = await setup();
    expect(root.hidden).toBe(false);
    expect(root.dataset.market).toBe('SE');
    // 0.247 kr/km × 15 000 km / 12
    expect(text(root.querySelector('.waykeev-balloon'))).toContain('309 kr/mån*');
    expect(text(root.querySelector('.waykeev-disclaimer'))).toContain('121 öre/kWh');
    expect(events).toEqual([{ type: 'ready', data: DATA }]);
  });

  it('is on the page when mount returns, and reports ready afterwards', async () => {
    const events: EvEvent[] = [];
    mount('#target', { data: DATA, onEvent: (event) => events.push(event) });
    expect(document.querySelector('.waykeev-balloon')).not.toBeNull();
    expect(events).toEqual([]);
    await flush();
    expect(events.map((event) => event.type)).toEqual(['ready']);
  });

  it('follows the distance, from the slider and the select alike', async () => {
    const { root, events } = await setup();
    const select = root.querySelector('select') as HTMLSelectElement;
    const range = root.querySelector('input[type="range"]') as HTMLInputElement;

    change(select, '3000');
    expect(text(root.querySelector('.waykeev-balloon'))).toContain('618 kr/mån*');
    expect(range.value).toBe('3000');

    change(range, '500', 'input');
    expect(text(root.querySelector('.waykeev-balloon'))).toContain('103 kr/mån*');
    expect(select.value).toBe('500');

    expect(events.slice(1)).toEqual([
      { type: 'distance-change', distanceKm: 30000, control: 'select' },
      { type: 'distance-change', distanceKm: 5000, control: 'slider' },
    ]);
  });

  it('counts in km and øre in Norway, in Norwegian', async () => {
    const { root } = await setup({
      energyPer100Km: 17.73,
      costPerKm: 0.13,
      pricePerKwh: 0.73,
      marketCode: 'NO',
    });
    expect(text(root.querySelector('.waykeev-balloon'))).toContain('163 kr/mnd*');
    expect(text(root.querySelector('.waykeev-disclaimer'))).toContain('73 øre/kWh');
    expect((root.querySelector('select') as HTMLSelectElement).value).toBe('15000');
    expect(text(root.querySelector('a'))).toBe('Drive');
  });

  it('prices an own electricity price in the dialog, without a request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { root, dialog, events } = await setup();
    const balloon = () => text(dialog.querySelector('.waykeev-balloon'));

    (root.querySelector('button[aria-haspopup="dialog"]') as HTMLButtonElement).click();
    expect(dialog.open).toBe(true);
    expect(balloon()).toContain('309 kr/mån*');

    const custom = dialog.querySelector('input[value="custom"]') as HTMLInputElement;
    custom.checked = true;
    custom.dispatchEvent(new Event('change', { bubbles: true }));
    const price = dialog.querySelector('input[name="custom-price"]') as HTMLInputElement;
    // The field starts at the template price, and so does the cost.
    expect(price.value).toBe('121');
    expect(balloon()).toContain('309 kr/mån*');

    // 0.2036 kWh/km × 2 kr × 15 000 km / 12
    change(price, '200', 'input');
    expect(balloon()).toContain('509 kr/mån*');
    change(price, '12,5', 'input');
    expect(balloon()).toContain('32 kr/mån*');
    change(price, '', 'input');
    expect(balloon()).toContain('Okänt');
    change(price, 'abc', 'input');
    expect(balloon()).toContain('Okänt');

    // The preview keeps the template price.
    expect(text(root.querySelector('.waykeev-balloon'))).toContain('309 kr/mån*');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(events.map((event) => event.type)).toEqual([
      'ready',
      'modal-open',
      'price-option-change',
    ]);
  });

  it('reports the own price when the visitor has entered it, in kronor', async () => {
    const { dialog, events } = await setup();
    const price = dialog.querySelector('input[name="custom-price"]') as HTMLInputElement;
    change(price, '150', 'input');
    change(price, '150', 'change');
    expect(events.at(-1)).toEqual({ type: 'custom-price-change', pricePerKwh: 1.5 });
  });

  it('lists what the figures are based on, and leaves out what the vehicle lacks', async () => {
    const rows = (dialog: HTMLDialogElement) =>
      Array.from(dialog.querySelectorAll('.waykeev-key-value-list__item'))
        .filter((row) => !(row as HTMLElement).hidden)
        .map((row) => text(row));

    const full = await setup();
    expect(rows(full.dialog)).toEqual([
      'Bilens batterikapacitet76 kWh',
      'Bilens räckvidd (WLTP)418 km',
      'Energiåtgång inkl. laddförluster20,4 kWh/100 km',
      'Angiven årlig körsträcka1 500 mil',
      'Elpris schablon, inkl. energiskatt och moms121 öre/kWh',
      'ElnätsavgiftInte inkluderad i beräkningen',
    ]);
    full.instance.unmount();

    const bare = await setup({ energyPer100Km: 15.5, costPerKm: 0.188, pricePerKwh: 1.21 });
    expect(rows(bare.dialog)[0]).toBe('Energiåtgång inkl. laddförluster15,5 kWh/100 km');
  });

  it('shows nothing and says why when the figures are missing', async () => {
    const { root, events } = await setup({ energyPer100Km: 0, costPerKm: 0, pricePerKwh: 1.21 });
    expect(root.hidden).toBe(true);
    expect(root.childElementCount).toBe(0);
    expect(events).toEqual([{ type: 'unavailable', reason: 'no-charging-data' }]);
  });

  it('fetches by id, and reports an unregistered site as an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"message":"Unauthorized"}', { status: 401 }))
    );
    const events: EvEvent[] = [];
    mount('#target', { id: 'some-id', onEvent: (event) => events.push(event) });
    await flush();
    expect(document.querySelector<HTMLElement>('.waykeev-root')?.hidden).toBe(true);
    expect(events).toEqual([{ type: 'error', reason: 'unauthorized' }]);
  });

  it('applies the theme to its own root, so two widgets can differ', async () => {
    const { root } = await setup(DATA, { theme: { primaryColor: '#227a29' } });
    expect(root.style.getPropertyValue('--theme-primary-bg')).toBe('#227a29');
    const second = mount('#target', { data: DATA });
    const roots = document.querySelectorAll<HTMLElement>('.waykeev-root');
    expect(roots).toHaveLength(2);
    expect((roots[1] as HTMLElement).style.getPropertyValue('--theme-primary-bg')).toBe('');
    second.unmount();
  });

  it('shows the brand line unless it is turned off', async () => {
    const shown = await setup();
    expect(shown.root.querySelectorAll('.waykeev-powered-by-wayke')).toHaveLength(2);
    expect(shown.dialog.querySelector('footer')).not.toBeNull();
    shown.instance.unmount();

    const hidden = await setup(DATA, { poweredBy: false });
    expect(hidden.root.querySelectorAll('.waykeev-powered-by-wayke')).toHaveLength(0);
    expect(hidden.root.querySelector('a')).toBeNull();
    expect(hidden.dialog.querySelector('footer')).toBeNull();
    // The calculator itself is unaffected.
    expect(text(hidden.root.querySelector('.waykeev-balloon'))).toContain('309 kr/mån*');
  });

  it('removes everything on unmount, and stops reporting', async () => {
    const { instance, events, root } = await setup();
    const select = root.querySelector('select') as HTMLSelectElement;
    instance.unmount();
    expect(document.querySelector('.waykeev-root')).toBeNull();
    change(select, '3000');
    expect(events).toHaveLength(1);
    // A second call is harmless.
    instance.unmount();
  });

  it('reports nothing when it is unmounted before the figures arrive', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"data":{"ads":{"byAdId":null}}}', { status: 200 }))
    );
    const events: EvEvent[] = [];
    mount('#target', { id: 'some-id', onEvent: (event) => events.push(event) }).unmount();
    await flush();
    expect(events).toEqual([]);
    expect(document.querySelector('.waykeev-root')).toBeNull();
  });

  it('needs a target and something to show', () => {
    expect(() => mount('#missing', { data: DATA })).toThrow(/no element matches/);
    expect(() => mount('#target', {})).toThrow(/"id" or "data"/);
  });
});

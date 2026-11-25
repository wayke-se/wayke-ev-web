// The calculator itself: a preview on the page with the cost at Wayke's template
// electricity price, and a dialog where the visitor can use their own price.
// All figures are computed in the browser from `data`; nothing is fetched here.

import {
  costPerKmAtPrice,
  DEFAULT_DISTANCE_KM,
  distanceScale,
  monthlyCost,
  toCents,
} from './chargingCost.js';
import { brandSymbol, h, ICONS, icon } from './dom.js';
import { brandOf, type Translator } from './i18n.js';
import type { ChargingData, EvEvent, MarketCode, PriceOption } from './types.js';

const HASH = '#wayke-ev';

let instances = 0;

export interface WidgetProps {
  data: ChargingData;
  marketCode: MarketCode;
  t: Translator;
  hash: boolean;
  emit: (event: EvEvent) => void;
  /** Aborted on unmount: every listener the widget adds is tied to it. */
  signal: AbortSignal;
}

/** "1,5" and "1.5" are both a price; anything else is no price. */
const parsePrice = (value: string): number | undefined => {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) return undefined;
  const price = Number.parseFloat(normalized);
  return price > 0 ? price : undefined;
};

export const renderWidget = (root: HTMLElement, props: WidgetProps) => {
  const { data, marketCode, t, emit, signal } = props;
  const uid = `waykeev-${++instances}`;
  const scale = distanceScale(marketCode);
  const brand = brandOf(marketCode);
  const templateCents = toCents(data.pricePerKwh);

  const state = {
    /** In the market's unit: mil in Sweden, km in Norway. */
    distance: DEFAULT_DISTANCE_KM / scale.kmPerUnit,
    priceOption: 'standard' as PriceOption,
    /** The visitor's own price in öre/øre per kWh. Undefined while the field is empty or invalid. */
    customCents: templateCents as number | undefined,
  };

  const distanceKm = () => state.distance * scale.kmPerUnit;
  const distanceLabel = (distance: number) => `${t.number(distance)} ${scale.unit}`;
  const priceLabel = (cents: number) => `${t.number(cents)} ${t('pricePerKwhUnit')}`;

  const costLabel = (priceOption: PriceOption) => {
    const costPerKm =
      priceOption === 'standard'
        ? data.costPerKm
        : costPerKmAtPrice(
            data,
            state.customCents === undefined ? undefined : state.customCents / 100
          );
    const cost = monthlyCost(costPerKm, distanceKm());
    return cost === undefined ? t('unknownCost') : `${t.number(cost)} ${t('costPerMonthUnit')}`;
  };

  // Each part of the page that shows a figure registers how to refresh itself.
  const refreshers: (() => void)[] = [];
  const refresh = () => {
    for (const run of refreshers) run();
  };

  const distanceControls = (idPrefix: string) => {
    const selectId = `${idPrefix}-distance`;
    const select = h(
      'select',
      { class: 'waykeev-select', id: selectId, name: 'distance' },
      ...scale.options.map((option) => h('option', { value: option }, distanceLabel(option)))
    );
    const range = h('input', {
      type: 'range',
      class: 'waykeev-input-range__input',
      name: 'distance',
      min: scale.min,
      max: scale.max,
      step: scale.step,
      'aria-label': t('yearlyDistance'),
    });

    const onChange = (control: 'slider' | 'select') => (event: Event) => {
      const value = Number.parseInt((event.currentTarget as HTMLInputElement).value, 10);
      if (Number.isNaN(value) || value === state.distance) return;
      state.distance = value;
      refresh();
      emit({ type: 'distance-change', distanceKm: distanceKm(), control });
    };
    select.addEventListener('change', onChange('select'), { signal });
    range.addEventListener('input', onChange('slider'), { signal });

    refreshers.push(() => {
      select.value = String(state.distance);
      range.value = String(state.distance);
      const percentage = Math.round(((state.distance - scale.min) / (scale.max - scale.min)) * 100);
      range.style.setProperty('--percentage', `${percentage}%`);
    });

    return [
      h(
        'div',
        { class: 'waykeev-stack waykeev-stack--2' },
        h(
          'div',
          { class: 'waykeev-input-label' },
          h('label', { class: 'waykeev-input-label__label', for: selectId }, t('yearlyDistance'))
        ),
        select
      ),
      h(
        'div',
        { class: 'waykeev-stack waykeev-stack--2' },
        h('div', { class: 'waykeev-input-range' }, range)
      ),
    ];
  };

  const poweredBy = () => [
    h(
      'div',
      { class: 'waykeev-hstack__item waykeev-hstack__item--no-shrink' },
      brandSymbol(brand.name)
    ),
    h(
      'div',
      {
        class:
          'waykeev-hstack__item waykeev-text waykeev-text--size-small waykeev-text--font-regular',
      },
      `${t('poweredBy')} `,
      h(
        'a',
        {
          href: brand.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          class:
            'waykeev-link waykeev-link--no-external-icon waykeev-link--current-color waykeev-link--underline',
        },
        brand.name
      )
    ),
  ];

  /** The highlighted box with the monthly cost and what it is based on. */
  const costBalloon = (priceOption: () => PriceOption, ...extra: Node[]) => {
    const cost = h('div', {
      class: 'waykeev-heading waykeev-heading--3 waykeev-no-margin',
      'aria-live': 'polite',
    });
    const disclaimer = h('div', { class: 'waykeev-disclaimer' });
    refreshers.push(() => {
      cost.textContent = `${costLabel(priceOption())}*`;
      disclaimer.textContent = `* ${
        priceOption() === 'standard'
          ? t('disclaimerStandard', { price: priceLabel(templateCents) })
          : t('disclaimerCustom')
      }`;
    });
    return h(
      'div',
      { class: 'waykeev-balloon' },
      h(
        'div',
        { class: 'waykeev-stack waykeev-stack--3' },
        h('div', { class: 'waykeev-stack waykeev-stack--1' }, cost),
        h('div', { class: 'waykeev-stack waykeev-stack--1' }, disclaimer)
      ),
      ...extra
    );
  };

  const detailRow = (label: string, value: string | (() => string)) => {
    const valueNode = h('div', { class: 'waykeev-key-value-list__value' });
    if (typeof value === 'string') {
      valueNode.textContent = value;
    } else {
      refreshers.push(() => {
        valueNode.textContent = value();
      });
    }
    return h(
      'li',
      { class: 'waykeev-key-value-list__item' },
      h('div', { class: 'waykeev-key-value-list__key' }, label),
      valueNode
    );
  };

  // ---- Dialog ----------------------------------------------------------------

  const titleId = `${uid}-modal-title`;
  const priceInputId = `${uid}-price`;
  const helpId = `${uid}-price-help`;

  const priceInput = h('input', {
    type: 'text',
    inputmode: 'decimal',
    autocomplete: 'off',
    id: priceInputId,
    name: 'custom-price',
    class: 'waykeev-input-text__input',
    value: templateCents,
  });
  priceInput.addEventListener(
    'input',
    () => {
      state.customCents = parsePrice(priceInput.value);
      refresh();
    },
    { signal }
  );
  priceInput.addEventListener(
    'change',
    () => {
      if (state.customCents !== undefined) {
        emit({ type: 'custom-price-change', pricePerKwh: state.customCents / 100 });
      }
    },
    { signal }
  );

  const help = h('div', { class: 'waykeev-input-label__foldout', id: helpId, hidden: true });
  help.textContent = t('yourPriceHelp');
  const helpLabel = h('span', { class: 'waykeev-sr-only' }, t('showHelp'));
  const helpButton = h(
    'button',
    {
      type: 'button',
      class: 'waykeev-input-label__help-btn',
      'aria-expanded': 'false',
      'aria-controls': helpId,
    },
    helpLabel,
    icon(ICONS.help)
  );
  helpButton.addEventListener(
    'click',
    () => {
      help.hidden = !help.hidden;
      helpButton.setAttribute('aria-expanded', String(!help.hidden));
      helpLabel.textContent = t(help.hidden ? 'showHelp' : 'hideHelp');
      helpButton
        .querySelector('svg')
        ?.replaceWith(icon(help.hidden ? ICONS.help : ICONS.helpClose));
    },
    { signal }
  );

  const priceField = h(
    'div',
    { class: 'waykeev-stack waykeev-stack--2' },
    h(
      'div',
      { class: 'waykeev-input-label' },
      h('label', { class: 'waykeev-input-label__label', for: priceInputId }, t('yourPrice')),
      h('div', { class: 'waykeev-input-label__help' }, helpButton),
      help
    ),
    h(
      'div',
      { class: 'waykeev-input-text' },
      priceInput,
      h('div', { class: 'waykeev-input-text__unit' }, t('pricePerKwhUnit'))
    )
  );

  const priceOptionRadio = (value: PriceOption, label: string) => {
    const id = `${uid}-price-${value}`;
    const input = h('input', {
      type: 'radio',
      id,
      name: `${uid}-price-option`,
      value,
      class: 'waykeev-input-selection__input',
      checked: value === state.priceOption,
    });
    input.addEventListener(
      'change',
      () => {
        if (!input.checked || state.priceOption === value) return;
        state.priceOption = value;
        refresh();
        emit({ type: 'price-option-change', priceOption: value });
      },
      { signal }
    );
    return h(
      'div',
      { class: 'waykeev-input-group__item' },
      h(
        'div',
        { class: 'waykeev-input-selection' },
        input,
        h(
          'div',
          { class: 'waykeev-input-selection__header' },
          h('label', { class: 'waykeev-input-selection__label', for: id }, label)
        )
      )
    );
  };

  // Shown for the template price only: with an own price they say nothing.
  const templatePriceRows = [
    detailRow(t('standardPriceRow'), priceLabel(templateCents)),
    detailRow(t('gridFee'), t('gridFeeValue')),
  ];

  refreshers.push(() => {
    const custom = state.priceOption === 'custom';
    priceField.hidden = !custom;
    for (const row of templatePriceRows) row.hidden = custom;
  });

  const closeButton = h(
    'button',
    { type: 'button', class: 'waykeev-modal__close-btn' },
    h('span', { class: 'waykeev-sr-only' }, t('closeModal')),
    icon(ICONS.close)
  );

  const dialog = h(
    'dialog',
    { class: 'waykeev-dialog', 'aria-labelledby': titleId },
    h(
      'div',
      { class: 'waykeev-modal' },
      h(
        'div',
        { class: 'waykeev-modal__container' },
        h(
          'div',
          { class: 'waykeev-modal__center' },
          h(
            'div',
            { class: 'waykeev-modal__dialog' },
            h('div', { class: 'waykeev-modal__close' }, closeButton),
            h(
              'div',
              { class: 'waykeev-modal__body' },
              h(
                'div',
                { class: 'waykeev-stack waykeev-stack--3' },
                h('h3', { class: 'waykeev-heading waykeev-heading--3', id: titleId }, t('title')),
                h(
                  'div',
                  { class: 'waykeev-content' },
                  h('p', { class: 'waykeev-content__p' }, t('modalDescription'))
                )
              ),
              h(
                'div',
                { class: 'waykeev-stack waykeev-stack--3' },
                ...distanceControls(`${uid}-modal`)
              ),
              h(
                'div',
                { class: 'waykeev-stack waykeev-stack--3' },
                h(
                  'div',
                  { class: 'waykeev-stack waykeev-stack--2' },
                  h(
                    'fieldset',
                    { class: 'waykeev-input-group' },
                    h(
                      'legend',
                      { class: 'waykeev-input-label' },
                      h('div', { class: 'waykeev-input-label__label' }, t('whichPrice'))
                    ),
                    priceOptionRadio('standard', t('standardPrice')),
                    priceOptionRadio('custom', t('customPrice'))
                  )
                ),
                priceField
              ),
              h(
                'div',
                { class: 'waykeev-stack waykeev-stack--3' },
                costBalloon(
                  () => state.priceOption,
                  h(
                    'div',
                    { class: 'waykeev-stack waykeev-stack--3' },
                    h(
                      'ul',
                      { class: 'waykeev-key-value-list' },
                      data.batteryCapacityKwh !== undefined &&
                        detailRow(
                          t('batteryCapacity'),
                          `${t.number(data.batteryCapacityKwh, 1)} kWh`
                        ),
                      data.rangeKm !== undefined &&
                        detailRow(t('range'), `${t.number(data.rangeKm)} km`),
                      detailRow(
                        t('energyUse'),
                        `${t.number(data.energyPer100Km, 1)} ${t('energyUnit')}`
                      ),
                      detailRow(t('statedDistance'), () => distanceLabel(state.distance)),
                      ...templatePriceRows
                    )
                  )
                )
              )
            ),
            h(
              'footer',
              { class: 'waykeev-modal__footer' },
              h(
                'div',
                { class: 'waykeev-hstack waykeev-hstack--spacing-1 waykeev-hstack--align-center' },
                ...poweredBy()
              )
            )
          )
        )
      )
    )
  );

  let pushedHash = false;

  const openDialog = () => {
    if (dialog.open) return;
    dialog.showModal();
    if (props.hash && window.location.hash !== HASH) {
      window.location.hash = HASH;
      pushedHash = true;
    }
    emit({ type: 'modal-open' });
  };

  closeButton.addEventListener('click', () => dialog.close(), { signal });

  // A click on the dimmed area around the dialog closes it, like Escape does.
  dialog.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement;
      if (target === dialog || target.matches('.waykeev-modal, .waykeev-modal__center')) {
        dialog.close();
      }
    },
    { signal }
  );

  // Fires for the close button, Escape and the back button alike.
  dialog.addEventListener(
    'close',
    () => {
      if (pushedHash && window.location.hash === HASH) window.history.back();
      pushedHash = false;
      emit({ type: 'modal-close' });
    },
    { signal }
  );

  if (props.hash) {
    window.addEventListener(
      'hashchange',
      () => {
        if (dialog.open && window.location.hash !== HASH) {
          pushedHash = false;
          dialog.close();
        }
      },
      { signal }
    );
  }

  // ---- Preview ---------------------------------------------------------------

  const openButton = h(
    'button',
    { type: 'button', class: 'waykeev-link', 'aria-haspopup': 'dialog' },
    h('span', { class: 'waykeev-link__content' }, t('openCalculator'))
  );
  openButton.addEventListener('click', openDialog, { signal });

  root.replaceChildren(
    h(
      'div',
      { class: 'waykeev-stack waykeev-stack--3' },
      h('h2', { class: 'waykeev-heading waykeev-heading--2' }, t('title')),
      h(
        'div',
        { class: 'waykeev-content' },
        h('p', { class: 'waykeev-content__p' }, t('description'))
      )
    ),
    h('div', { class: 'waykeev-stack waykeev-stack--3' }, ...distanceControls(uid)),
    h(
      'div',
      { class: 'waykeev-stack waykeev-stack--3' },
      costBalloon(() => 'standard')
    ),
    h(
      'div',
      { class: 'waykeev-stack waykeev-stack--3' },
      h(
        'div',
        { class: 'waykeev-hstack waykeev-hstack--spacing-2 waykeev-hstack--align-center' },
        h(
          'div',
          { class: 'waykeev-hstack__item waykeev-hstack__item--no-shrink', 'aria-hidden': 'true' },
          h(
            'div',
            {
              class:
                'waykeev-icon-backdrop waykeev-icon-backdrop--large waykeev-icon-backdrop--success',
            },
            icon(ICONS.bulb)
          )
        ),
        h(
          'div',
          { class: 'waykeev-hstack__item waykeev-hstack__item--grow' },
          h(
            'span',
            { class: 'waykeev-text waykeev-text--font-medium waykeev-text--bump-right' },
            t('adjustToYourPrice')
          ),
          openButton
        )
      )
    ),
    h(
      'div',
      { class: 'waykeev-stack waykeev-stack--3' },
      h(
        'div',
        {
          class:
            'waykeev-hstack waykeev-hstack--spacing-1 waykeev-hstack--align-center waykeev-hstack--justify-center',
        },
        ...poweredBy()
      )
    ),
    dialog
  );

  refresh();
};

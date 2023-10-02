import { MarketCode } from '../@types/MarketCode';
import i18next from '../Utils/i18n';
import { getSymbolLogotype } from './Logotype';

const PoweredByWayke = (market?: MarketCode) => `
    <div class="waykeev-hstack__item waykeev-hstack__item--no-shrink waykeev-hstack__item--hide-empty">${getSymbolLogotype(
      {
        market,
        className: 'waykeev-powered-by-wayke',
      }
    )}</div>
    <div class="waykeev-hstack__item waykeev-text waykeev-text--size-small waykeev-text--font-regular">
        ${i18next.t('poweredByBrand.label', {
          link: `
                <a
                    href="${i18next.t('poweredByBrand.linkUrl')}"
                    title="${
                      (i18next.t('poweredByBrand.title'),
                      {
                        website: i18next.t('poweredByBrand.linkUrl'),
                      })
                    }"
                    target="_blank"
                    rel="noopener noreferer"
                    class="waykeev-link waykeev-link--no-external-icon waykeev-link--current-color waykeev-link--underline"
                >
                    ${i18next.t('brandName')}
                </a>
            `,
          interpolation: { escapeValue: false },
        })}
    </div>
`;

export default PoweredByWayke;

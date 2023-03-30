import i18next from 'i18next';
import { MarketCode } from '../@types/MarketCode';
import { getLanguage } from './market';

const i18n = (marketCode?: MarketCode) => {
  const locale = getLanguage(marketCode);

  i18next.init({
    lng: locale || 'en-US',
    fallbackLng: 'en-US',
    debug: true,
    resources: {
      'sv-SE': {
        translation: {
          evTitle: 'Beräkna laddkostnad',
        },
      },
      'nb-NO': {
        translation: {
          evTitle: 'Beregn ladekostnad',
        },
      },
      'en-US': {
        translation: {
          evTitle: 'Calculate charging cost',
        },
      },
    },
  });
};

export default i18n;

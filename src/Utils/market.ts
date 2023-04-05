import { MarketCode } from '../@types/MarketCode';

export const getLanguage = (marketCode?: MarketCode) => {
  switch (marketCode) {
    case 'NO':
      return 'nb-NO';
    case 'SE':
    default:
      return 'sv-SE';
  }
};

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
          adjustCostToYourElectricityPrice: 'Vill du anpassa kostnaden efter ditt elpris?',
          anErrorHasOccured: 'Ett fel har inträffat.',
          brand: 'Wayke',
          closeModal: 'Stäng modalen',
          evTitle: 'Beräkna laddkostnad',
          evDescription:
            'Se vad det kostar att ladda denna elbil per månad. Du behöver bara ange din årliga körsträcka för att se fordonets uppskattade laddningskostnad.',
          popupTitle: 'Beräkna laddkostnad',
          popupDescription:
            'Har du funderat över vad det kostar att ladda en elbil? Här hittar du verktyget som visar dig den uppskattade laddningskostnaden för just den här bilen.',
          costPerMonth: 'kr/mån',
          costPerKwh: 'öre/kWh',
          costPerMonthDisclaimer: {
            templated:
              'Beräknat på fordonets batterikapacitet, räckvidd, den angivna årliga körsträckan samt en schablonkostnad på {{ costPerKwh }}.',
            statedPrice:
              'Beräknat på fordonets batterikapacitet, räckvidd, den angivna årliga körsträckan samt det egna angivna elpriset.',
          },
          electricityPriceTemplateIncVat: 'Elpris schablon, inkl. energiskatt och moms',
          electricGridFee: {
            key: 'Elnätsavgift',
            value: 'Inte inkluderad i beräkningen',
          },
          goToBrandSite: 'Gå till wayke.se',
          loading: 'Laddar',
          mileageUnit: 'mil',
          openCalculator: 'Öppna uträknaren',
          poweredBy: 'Powered by',
          selectPriceToCalculate: 'Vilket elpris vill du räkna på?',
          hideHelp: 'Stäng hjälp',
          showHelp: 'Visa hjälp',
          statedAnnualMileage: 'Angiven årlig körsträcka',
          stateYourTotalKwh: 'Ange ditt totala pris per kWh så som det står på din faktura.',
          standardPrice: 'Schablonpris',
          tryAgain: 'Försök igen',
          vehicleRange: 'Fordonets räckvidd',
          vehicleBatteryCapacity: 'Fordonets batterikapacitet räckvidd',
          yourElectricPrice: 'Ditt elpris',
          yourYearlyMileage: 'Din årliga körsträcka',
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

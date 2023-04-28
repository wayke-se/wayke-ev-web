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
          brandName: 'Wayke',
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
          statedPrice: 'Eget elpris',
          tryAgain: 'Försök igen',
          vehicleRange: 'Fordonets räckvidd',
          vehicleBatteryCapacity: 'Fordonets batterikapacitet räckvidd',
          yourElectricPrice: 'Ditt elpris',
          yourYearlyMileage: 'Din årliga körsträcka',
          poweredByBrand: {
            label: 'Powered by {{link}}',
            title: 'Go to {{website}}',
            linkUrl: 'https://www.wayke.se',
          },
        },
      },
      'nb-NO': {
        translation: {
          adjustCostToYourElectricityPrice: 'Vil du justere kostnaden til strømprisen din?',
          anErrorHasOccured: 'Det har oppstått en feil.',
          brandName: 'Drive',
          closeModal: 'Close the modal',
          evTitle: 'Beregn ladekostnad',
          evDescription:
            'Se hvor mye det koster å lade denne elbilen per måned. Du trenger bare å angi den årlige kjørelengden for å se kjøretøyets estimerte ladekostnad.',
          popupTitle: 'Beregn ladekostnad',
          popupDescription:
            'Har du tenkt på hvor mye det koster å lade en elbil? Her finner du verktøyet som viser deg estimert ladekostnad for akkurat denne bilen.',
          costPerMonth: 'kr/måned',
          costPerKwh: 'öre/kWh',
          costPerMonthDisclaimer: {
            templated:
              'Beregnet på kjøretøyets batterikapasitet, rekkevidde, oppgitt årlig kjørelengde og en standardkostnad på {{ costPerKwh }}.',
            statedPrice:
              'Beregnet på kjøretøyets batterikapasitet, rekkevidde, spesifisert årlig kjørelengde og egen spesifisert strømpris.',
          },
          electricityPriceTemplateIncVat:
            'Elektrisitetsprismal, inkl. energiavgift og merverdiavgift',
          electricGridFee: {
            key: 'Elektrisitetslading',
            value: 'Ikke inkludert i beregningen',
          },
          loading: 'Loading',
          mileageUnit: 'miles',
          openCalculator: 'Åpne kalkulatoren',
          poweredBy: 'Drevet av',
          selectPriceToCalculate: 'Hvilken strømpris vil du beregne?',
          hideHelp: 'Skjul hjelp',
          showHelp: 'Vis hjelp',
          statedAnnualMileage: 'Stated Annual Mileage',
          stateYourTotalKwh: 'Skriv inn totalprisen per kWh slik den vises på fakturaen din.',
          standardPrice: 'Standardpris',
          statedPrice: 'Egen strømpris',
          tryAgain: 'Prøv igjen',
          vehicleRange: 'Vehicle Range',
          vehicleBatteryCapacity: 'Batterikapasitetsområde for kjøretøy',
          yourElectricPrice: 'Din strømpris',
          yourYearlyMileage: 'Din årlige kjørelengde',
          poweredByBrand: {
            label: 'Powered by {{link}}',
            title: 'Gå til {{website}}',
            linkUrl: 'https://www.drive.no',
          },
        },
      },
      'en-US': {
        translation: {
          adjustCostToYourElectricityPrice:
            'Do you want to adjust the cost to your electricity price?',
          anErrorHasOccured: 'An error has occurred.',
          brandName: 'Wayke',
          closeModal: 'Close the modal',
          evTitle: 'Calculate charging cost',
          evDescription:
            "See how much it costs to charge this electric car per month. You only need to enter your annual mileage to see the vehicle's estimated charging cost.",
          popupTitle: 'Calculate charging cost',
          popupDescription:
            'Have you thought about how much it costs to charge an electric car? Here you will find the tool that will show you the estimated charging cost for this particular car.',
          costPerMonth: 'kr/month',
          costPerKwh: 'öre/kWh',
          costPerMonthDisclaimer: {
            templates:
              "Calculated on the vehicle's battery capacity, range, the stated annual mileage and a standard cost of {{ costPerKwh }}.",
            statedPrice:
              "Calculated on the vehicle's battery capacity, range, the specified annual mileage and the own specified electricity price.",
          },
          electricityPriceTemplateIncWhat: 'Electricity price template, incl. energy tax and VAT',
          electricGridFee: {
            key: 'Electricity charge',
            value: 'Not included in the calculation',
          },
          loading: 'Loading',
          mileageUnit: 'miles',
          openCalculator: 'Open the calculator',
          poweredBy: 'Powered by',
          selectPriceToCalculate: 'Which electricity price do you want to calculate?',
          hideHelp: 'Hide Help',
          showHelp: 'Show Help',
          statedAnnualMileage: 'Stated Annual Mileage',
          stateYourTotalKwh: 'Enter your total price per kWh as it appears on your invoice.',
          standardPrice: 'Standard price',
          statedPrice: 'Own electricity price',
          tryAgain: 'Try again',
          vehicleRange: 'Vehicle Range',
          vehicleBatteryCapacity: 'Vehicle battery capacity range',
          yourElectricPrice: 'Your electricity price',
          yourYearlyMileage: 'Your annual mileage',
          poweredByBrand: {
            label: 'Powered by {{link}}',
            title: 'Go to {{website}}',
            linkUrl: 'https://www.wayke.se',
          },
        },
      },
    },
  });
};

export default i18n;

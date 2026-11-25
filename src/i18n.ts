import type { Language, MarketCode } from './types.js';

const sv = {
  title: 'Beräkna laddkostnad',
  description:
    'Se vad det kostar att ladda den här elbilen per månad. Ange din årliga körsträcka för att se bilens uppskattade laddkostnad.',
  modalDescription:
    'Här ser du den uppskattade laddkostnaden för just den här bilen. Räkna på schablonpriset eller på ditt eget elpris.',
  yearlyDistance: 'Din årliga körsträcka',
  adjustToYourPrice: 'Vill du anpassa kostnaden efter ditt elpris?',
  openCalculator: 'Öppna uträknaren',
  closeModal: 'Stäng',
  costPerMonthUnit: 'kr/mån',
  pricePerKwhUnit: 'öre/kWh',
  energyUnit: 'kWh/100 km',
  unknownCost: 'Okänt',
  disclaimerStandard:
    'Beräknat på bilens energiåtgång utifrån WLTP-värden, inklusive laddförluster, den angivna årliga körsträckan och ett schablonpris på {price}.',
  disclaimerCustom:
    'Beräknat på bilens energiåtgång utifrån WLTP-värden, inklusive laddförluster, den angivna årliga körsträckan och ditt angivna elpris.',
  whichPrice: 'Vilket elpris vill du räkna på?',
  standardPrice: 'Schablonpris',
  customPrice: 'Eget elpris',
  yourPrice: 'Ditt elpris',
  yourPriceHelp: 'Ange ditt totala pris per kWh så som det står på din faktura.',
  showHelp: 'Visa hjälp',
  hideHelp: 'Dölj hjälp',
  batteryCapacity: 'Bilens batterikapacitet',
  range: 'Bilens räckvidd (WLTP)',
  energyUse: 'Energiåtgång inkl. laddförluster',
  statedDistance: 'Angiven årlig körsträcka',
  standardPriceRow: 'Elpris schablon, inkl. energiskatt och moms',
  gridFee: 'Elnätsavgift',
  gridFeeValue: 'Inte inkluderad i beräkningen',
  poweredBy: 'Powered by',
};

type Messages = typeof sv;

const nb: Messages = {
  title: 'Beregn ladekostnad',
  description:
    'Se hva det koster å lade denne elbilen per måned. Oppgi din årlige kjørelengde for å se bilens estimerte ladekostnad.',
  modalDescription:
    'Her ser du den estimerte ladekostnaden for akkurat denne bilen. Regn med sjablongprisen eller med din egen strømpris.',
  yearlyDistance: 'Din årlige kjørelengde',
  adjustToYourPrice: 'Vil du tilpasse kostnaden til din strømpris?',
  openCalculator: 'Åpne kalkulatoren',
  closeModal: 'Lukk',
  costPerMonthUnit: 'kr/mnd',
  pricePerKwhUnit: 'øre/kWh',
  energyUnit: 'kWh/100 km',
  unknownCost: 'Ukjent',
  disclaimerStandard:
    'Beregnet på bilens energiforbruk basert på WLTP-verdier, inkludert ladetap, den angitte årlige kjørelengden og en sjablongpris på {price}.',
  disclaimerCustom:
    'Beregnet på bilens energiforbruk basert på WLTP-verdier, inkludert ladetap, den angitte årlige kjørelengden og din angitte strømpris.',
  whichPrice: 'Hvilken strømpris vil du regne med?',
  standardPrice: 'Sjablongpris',
  customPrice: 'Egen strømpris',
  yourPrice: 'Din strømpris',
  yourPriceHelp: 'Oppgi din totale pris per kWh slik den står på fakturaen din.',
  showHelp: 'Vis hjelp',
  hideHelp: 'Skjul hjelp',
  batteryCapacity: 'Bilens batterikapasitet',
  range: 'Bilens rekkevidde (WLTP)',
  energyUse: 'Energiforbruk inkl. ladetap',
  statedDistance: 'Angitt årlig kjørelengde',
  standardPriceRow: 'Strømpris sjablong, inkl. avgifter og mva.',
  gridFee: 'Nettleie',
  gridFeeValue: 'Ikke inkludert i beregningen',
  poweredBy: 'Powered by',
};

const en: Messages = {
  title: 'Calculate charging cost',
  description:
    'See what it costs to charge this electric car per month. Enter your yearly distance to see the estimated charging cost.',
  modalDescription:
    'This is the estimated charging cost for this car. Use the standard electricity price or your own.',
  yearlyDistance: 'Your yearly distance',
  adjustToYourPrice: 'Want to use your own electricity price?',
  openCalculator: 'Open the calculator',
  closeModal: 'Close',
  costPerMonthUnit: 'kr/month',
  pricePerKwhUnit: 'öre/kWh',
  energyUnit: 'kWh/100 km',
  unknownCost: 'Unknown',
  disclaimerStandard:
    "Based on the car's energy use from WLTP figures, charging losses included, the yearly distance and a standard price of {price}.",
  disclaimerCustom:
    "Based on the car's energy use from WLTP figures, charging losses included, the yearly distance and your own electricity price.",
  whichPrice: 'Which electricity price do you want to use?',
  standardPrice: 'Standard price',
  customPrice: 'Own electricity price',
  yourPrice: 'Your electricity price',
  yourPriceHelp: 'Enter your total price per kWh as shown on your invoice.',
  showHelp: 'Show help',
  hideHelp: 'Hide help',
  batteryCapacity: 'Battery capacity',
  range: 'Range (WLTP)',
  energyUse: 'Energy use incl. charging losses',
  statedDistance: 'Yearly distance',
  standardPriceRow: 'Standard electricity price, incl. energy tax and VAT',
  gridFee: 'Grid fee',
  gridFeeValue: 'Not included in the calculation',
  poweredBy: 'Powered by',
};

const MESSAGES: Record<Language, Messages> = { sv, nb, en };

const LOCALES: Record<Language, string> = { sv: 'sv-SE', nb: 'nb-NO', en: 'en-GB' };

export type MessageKey = keyof Messages;

export interface Translator {
  (key: MessageKey, values?: Record<string, string>): string;
  /** Formats a number the way the language writes it, e.g. "1 500" and "20,4". */
  number: (value: number, maximumFractionDigits?: number) => string;
}

export const defaultLanguage = (marketCode: MarketCode): Language =>
  marketCode === 'NO' ? 'nb' : 'sv';

export const createTranslator = (language: Language): Translator => {
  const messages = MESSAGES[language] ?? sv;
  const locale = LOCALES[language] ?? LOCALES.sv;

  const t = ((key, values) => {
    const message = messages[key];
    if (!values) return message;
    return message.replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);
  }) as Translator;

  t.number = (value, maximumFractionDigits = 0) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);

  return t;
};

/** The brand behind the figures: Wayke in Sweden, Drive in Norway. */
export const brandOf = (marketCode: MarketCode) =>
  marketCode === 'NO'
    ? { name: 'Drive', url: 'https://www.drive.no' }
    : { name: 'Wayke', url: 'https://www.wayke.se' };

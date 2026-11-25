import type { ChargingData, MarketCode } from './types.js';

// Yearly distances the visitor can choose between, in km.
const DISTANCES_KM = [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000];

export const DEFAULT_DISTANCE_KM = 15000;

export interface DistanceScale {
  /** Sweden counts in Scandinavian miles (1 mil = 10 km), Norway in km. */
  unit: 'mil' | 'km';
  kmPerUnit: number;
  /** In the market's unit. */
  options: number[];
  min: number;
  max: number;
  step: number;
}

export const distanceScale = (marketCode: MarketCode): DistanceScale => {
  const kmPerUnit = marketCode === 'SE' ? 10 : 1;
  const options = DISTANCES_KM.map((km) => km / kmPerUnit);
  return {
    unit: marketCode === 'SE' ? 'mil' : 'km',
    kmPerUnit,
    options,
    min: options[0] as number,
    max: options[options.length - 1] as number,
    step: 5000 / kmPerUnit,
  };
};

/** The price in whole öre/øre, which is what the visitor sees and types. */
export const toCents = (pricePerKwh: number): number => Math.round(pricePerKwh * 100);

/**
 * Cost per km at the visitor's own price per kWh. Undefined for a missing or
 * invalid price.
 *
 * At the template price it is the template cost itself: Wayke computes that figure
 * from an unrounded price, so energy × the rounded price would land a krona or two
 * off per month and the two price options would disagree before anything is typed.
 */
export const costPerKmAtPrice = (
  data: ChargingData,
  pricePerKwh: number | undefined
): number | undefined => {
  if (typeof pricePerKwh !== 'number' || !(pricePerKwh > 0)) return undefined;
  if (toCents(pricePerKwh) === toCents(data.pricePerKwh)) return data.costPerKm;
  return (data.energyPer100Km / 100) * pricePerKwh;
};

/** Undefined when there is no cost per km. A cost that rounds to 0 is still a cost. */
export const monthlyCost = (
  costPerKm: number | undefined,
  distanceKmPerYear: number
): number | undefined => {
  if (costPerKm === undefined || Number.isNaN(costPerKm)) return undefined;
  return Math.round((costPerKm * distanceKmPerYear) / 12);
};

const isPositive = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

/** True when the figures are enough to show a calculator. */
export const isChargingData = (
  data: Partial<ChargingData> | null | undefined
): data is ChargingData =>
  !!data &&
  isPositive(data.energyPer100Km) &&
  isPositive(data.costPerKm) &&
  isPositive(data.pricePerKwh);

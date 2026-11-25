import { describe, expect, it } from 'vitest';
import {
  costPerKmAtPrice,
  distanceScale,
  isChargingData,
  monthlyCost,
  toCents,
} from '../src/chargingCost';
import type { ChargingData } from '../src/types';

// Volkswagen ID.4 GTX as Wayke's test environment returned it on 2026-11-25.
const ID4: ChargingData = { energyPer100Km: 17.21, costPerKm: 0.209, pricePerKwh: 1.21 };

describe('monthlyCost', () => {
  it('is the cost per km over a year, spread on twelve months', () => {
    expect(monthlyCost(0.209, 15000)).toBe(261);
    expect(monthlyCost(0.13, 15000)).toBe(163);
  });

  it('keeps a cost of zero apart from an unknown cost', () => {
    expect(monthlyCost(0.0001, 5000)).toBe(0);
    expect(monthlyCost(undefined, 5000)).toBeUndefined();
    expect(monthlyCost(Number.NaN, 5000)).toBeUndefined();
  });
});

describe('costPerKmAtPrice', () => {
  it('prices the energy at the given price per kWh', () => {
    expect(costPerKmAtPrice(ID4, 2)).toBeCloseTo(0.3442, 6);
  });

  it('is the template cost at the template price, so both price options start on the same figure', () => {
    // 0.1721 × 1.21 would be 0.2082: 260 instead of 261 kr a month at 1 500 mil.
    expect(costPerKmAtPrice(ID4, 1.21)).toBe(0.209);
    expect(monthlyCost(costPerKmAtPrice(ID4, 1.21), 15000)).toBe(monthlyCost(ID4.costPerKm, 15000));
    // One öre off the template price is an own price.
    expect(costPerKmAtPrice(ID4, 1.22)).toBeCloseTo(0.209962, 6);
  });

  it('has no cost for a missing or invalid price', () => {
    expect(costPerKmAtPrice(ID4, undefined)).toBeUndefined();
    expect(costPerKmAtPrice(ID4, Number.NaN)).toBeUndefined();
    expect(costPerKmAtPrice(ID4, 0)).toBeUndefined();
    expect(costPerKmAtPrice(ID4, -1)).toBeUndefined();
  });
});

describe('toCents', () => {
  it('rounds to whole öre', () => {
    expect(toCents(1.21)).toBe(121);
    expect(toCents(0.7279)).toBe(73);
  });
});

describe('distanceScale', () => {
  it('counts in Scandinavian miles in Sweden', () => {
    const scale = distanceScale('SE');
    expect(scale).toMatchObject({ unit: 'mil', kmPerUnit: 10, min: 500, max: 5000, step: 500 });
    expect(scale.options).toHaveLength(10);
  });

  it('counts in km in Norway', () => {
    expect(distanceScale('NO')).toMatchObject({
      unit: 'km',
      kmPerUnit: 1,
      min: 5000,
      max: 50000,
      step: 5000,
    });
  });
});

describe('isChargingData', () => {
  it('needs all three figures, and positive ones', () => {
    expect(isChargingData(ID4)).toBe(true);
    expect(isChargingData({ ...ID4, costPerKm: 0 })).toBe(false);
    expect(isChargingData({ energyPer100Km: 17.21, pricePerKwh: 1.21 })).toBe(false);
    expect(isChargingData({ ...ID4, energyPer100Km: Number.NaN })).toBe(false);
    expect(isChargingData(null)).toBe(false);
  });
});

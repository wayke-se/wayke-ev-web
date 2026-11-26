// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, fetchChargingData, toChargingData } from '../src/api';

// The shape Wayke's public GraphQL API returned on 2026-11-25.
const attributes = (overrides: Record<string, unknown> = {}) => ({
  chargingEnergyConsumption: { floatValue: 16.34 },
  chargingCostPerKilometer: { floatValue: 0.198, unit: 'SEK/km' },
  chargingPricePerKwh: { floatValue: 1.21 },
  batteryCapacityNet: { intValue: 75 },
  batteryCapacityGross: { intValue: 77 },
  electricRangeWltp: { minvalue: 514 },
  ...overrides,
});

const ad = (overrides: Record<string, unknown> = {}) => ({
  id: '01743b86-32d2-4e39-8a27-435feb7295f4',
  iteration: { item: { attributes: attributes(overrides) } },
});

describe('toChargingData', () => {
  it('reads the figures, the market from the currency and the net capacity', () => {
    expect(toChargingData(ad())).toEqual({
      status: 'ok',
      data: {
        energyPer100Km: 16.34,
        costPerKm: 0.198,
        pricePerKwh: 1.21,
        marketCode: 'SE',
        batteryCapacityKwh: 75,
        rangeKm: 514,
      },
    });
  });

  it('reads a Norwegian vehicle as NO', () => {
    const result = toChargingData(
      ad({ chargingCostPerKilometer: { floatValue: 0.13, unit: 'NOK/km' } })
    );
    expect(result).toMatchObject({ status: 'ok', data: { marketCode: 'NO' } });
  });

  it('falls back to the gross capacity, and leaves out what the vehicle lacks', () => {
    const gross = toChargingData(ad({ batteryCapacityNet: null }));
    expect(gross).toMatchObject({ status: 'ok', data: { batteryCapacityKwh: 77 } });

    const bare = toChargingData(
      ad({ batteryCapacityNet: null, batteryCapacityGross: null, electricRangeWltp: null })
    );
    expect(bare.status).toBe('ok');
    if (bare.status === 'ok') {
      expect(bare.data.batteryCapacityKwh).toBeUndefined();
      expect(bare.data.rangeKm).toBeUndefined();
    }
  });

  it('has no charging data for a vehicle without the three figures', () => {
    // A petrol car or a plug-in hybrid: the attributes are null.
    expect(
      toChargingData(
        ad({
          chargingEnergyConsumption: null,
          chargingCostPerKilometer: null,
          chargingPricePerKwh: null,
        })
      )
    ).toEqual({ status: 'unavailable', reason: 'no-charging-data' });
    // An electric car Wayke lacks data for still has the price.
    expect(
      toChargingData(ad({ chargingEnergyConsumption: null, chargingCostPerKilometer: null }))
    ).toEqual({ status: 'unavailable', reason: 'no-charging-data' });
    // Not a vehicle at all.
    expect(toChargingData({ id: 'x', iteration: { item: {} } })).toEqual({
      status: 'unavailable',
      reason: 'no-charging-data',
    });
  });

  it('is not found without an ad', () => {
    expect(toChargingData(null)).toEqual({ status: 'unavailable', reason: 'not-found' });
  });
});

describe('fetchChargingData', () => {
  afterEach(() => vi.unstubAllGlobals());

  const respond = (status: number, body: unknown) => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }));
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  };

  const request = (apiKey?: string) =>
    fetchChargingData({ id: 'some-id', environment: 'test', apiKey });

  it('asks the chosen environment, identified by the origin of the site', async () => {
    const fetchMock = respond(200, { data: { ads: { byAdId: ad() } } });
    const result = await request();

    expect(result.status).toBe('ok');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://public-test-api.wayke.com/graphql');
    const headers = init.headers as Record<string, string>;
    expect(headers['x-api-key']).toBe(window.location.origin);
    expect(headers['x-graphql-client-version']).toMatch(/^ev-web@\d/);
    expect(JSON.parse(init.body as string).variables).toEqual({ id: 'some-id' });
  });

  it('uses an explicit key when one is given', async () => {
    const fetchMock = respond(200, { data: { ads: { byAdId: ad() } } });
    await request('a-key-from-wayke');
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>)['x-api-key']).toBe('a-key-from-wayke');
  });

  it('resolves a legacy id through the iteration', async () => {
    respond(200, { data: { ads: { byAdId: null, byIterationId: { ads: [ad()] } } } });
    expect((await request()).status).toBe('ok');
  });

  it('is not found for an id no vehicle has, also when the API reports it as an error', async () => {
    respond(200, { data: { ads: { byAdId: null, byIterationId: { ads: null } } } });
    expect(await request()).toEqual({ status: 'unavailable', reason: 'not-found' });

    respond(200, {
      data: { ads: { byAdId: null } },
      errors: [{ message: 'invalid UUID length: 6' }],
    });
    expect(await request()).toEqual({ status: 'unavailable', reason: 'not-found' });
  });

  it('reports a site without the calculator as not enabled, not as a car without data', async () => {
    // The API nulls the three attributes and says why, as it did in test on 2026-11-26.
    respond(200, {
      data: {
        ads: {
          byAdId: ad({
            chargingEnergyConsumption: null,
            chargingCostPerKilometer: null,
            chargingPricePerKwh: null,
          }),
          byIterationId: null,
        },
      },
      errors: [
        {
          message: 'the charging cost calculator is not enabled for this api key',
          extensions: { code: 'CHARGING_COST_NOT_ENABLED', permission: 'EvCalculatorEnabled' },
        },
      ],
    });
    await expect(request()).rejects.toMatchObject({ reason: 'not-enabled' });

    // Any other error next to the data changes nothing.
    respond(200, {
      data: { ads: { byAdId: ad() } },
      errors: [{ message: 'something else', extensions: { code: 'DOWNSTREAM_SERVICE_ERROR' } }],
    });
    expect((await request()).status).toBe('ok');
  });

  it('tells an unregistered site, a rate limit, a server fault and no network apart', async () => {
    respond(401, { message: 'Unauthorized' });
    await expect(request()).rejects.toMatchObject({ reason: 'unauthorized' });

    respond(429, {});
    await expect(request()).rejects.toMatchObject({ reason: 'rate-limited' });

    respond(502, {});
    await expect(request()).rejects.toMatchObject({ reason: 'server' });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      })
    );
    await expect(request()).rejects.toBeInstanceOf(ApiError);
    await expect(request()).rejects.toMatchObject({ reason: 'network' });
  });
});

// Reads a vehicle's charging figures from Wayke's public GraphQL API. The site is
// identified by its own origin, which Wayke has registered, unless an explicit key
// is given (local development).

import { version } from '../package.json';
import { isChargingData } from './chargingCost.js';
import type {
  ChargingData,
  Environment,
  ErrorReason,
  MarketCode,
  UnavailableReason,
} from './types.js';

const API_URLS: Record<Environment, string> = {
  production: 'https://public-api.wayke.com/graphql',
  test: 'https://public-test-api.wayke.com/graphql',
};

/** Shows up in Wayke's traces, so it is visible which sites run which version. */
const CLIENT_VERSION = `ev-web@${version}`;

/** The GraphQL error code of a refused charging cost attribute. */
const NOT_ENABLED_CODE = 'CHARGING_COST_NOT_ENABLED';

const ATTRIBUTES = `
  chargingEnergyConsumption { floatValue }
  chargingCostPerKilometer { floatValue unit }
  chargingPricePerKwh { floatValue }
  batteryCapacityNet { intValue }
  batteryCapacityGross { intValue }
  electricRangeWltp { minvalue }
`;

const AD_FIELDS = `id iteration { item { ... on Vehicle { attributes { ${ATTRIBUTES} } } } }`;

// Older ads have a legacy id that differs from the ad's id, and sites that have
// stored those still pass them. byIterationId resolves such an id to the ad, so
// both are asked for in the one request.
const QUERY = `
query EvWebChargingData($id: ID!) {
  ads {
    byAdId(ID: $id) { ${AD_FIELDS} }
    byIterationId(iterationId: $id) { ads { ${AD_FIELDS} } }
  }
}`;

interface AdNode {
  id: string;
  iteration?: {
    item?: {
      attributes?: {
        chargingEnergyConsumption?: { floatValue?: number | null } | null;
        chargingCostPerKilometer?: { floatValue?: number | null; unit?: string | null } | null;
        chargingPricePerKwh?: { floatValue?: number | null } | null;
        batteryCapacityNet?: { intValue?: number | null } | null;
        batteryCapacityGross?: { intValue?: number | null } | null;
        electricRangeWltp?: { minvalue?: number | null } | null;
      } | null;
    } | null;
  } | null;
}

interface QueryResult {
  ads?: {
    byAdId?: AdNode | null;
    byIterationId?: { ads?: AdNode[] | null } | null;
  } | null;
}

export class ApiError extends Error {
  readonly reason: ErrorReason;

  constructor(reason: ErrorReason) {
    super(`Wayke EV: ${reason}`);
    this.name = 'ApiError';
    this.reason = reason;
  }
}

export type ChargingDataResult =
  | { status: 'ok'; data: ChargingData }
  | { status: 'unavailable'; reason: UnavailableReason };

const positive = (value: number | null | undefined): number | undefined =>
  typeof value === 'number' && value > 0 ? value : undefined;

// The cost's unit is "SEK/km" or "NOK/km": the currency tells the market.
const marketOfUnit = (unit: string | null | undefined): MarketCode | undefined => {
  if (unit?.startsWith('NOK')) return 'NO';
  if (unit?.startsWith('SEK')) return 'SE';
  return undefined;
};

/** Exported for the tests. */
export const toChargingData = (ad: AdNode | null | undefined): ChargingDataResult => {
  if (!ad) return { status: 'unavailable', reason: 'not-found' };
  const attributes = ad.iteration?.item?.attributes;
  const data: Partial<ChargingData> = {
    energyPer100Km: positive(attributes?.chargingEnergyConsumption?.floatValue),
    costPerKm: positive(attributes?.chargingCostPerKilometer?.floatValue),
    pricePerKwh: positive(attributes?.chargingPricePerKwh?.floatValue),
    marketCode: marketOfUnit(attributes?.chargingCostPerKilometer?.unit),
    batteryCapacityKwh:
      positive(attributes?.batteryCapacityNet?.intValue) ??
      positive(attributes?.batteryCapacityGross?.intValue),
    rangeKm: positive(attributes?.electricRangeWltp?.minvalue),
  };
  if (!isChargingData(data)) return { status: 'unavailable', reason: 'no-charging-data' };
  return { status: 'ok', data };
};

interface FetchOptions {
  id: string;
  environment: Environment;
  apiKey?: string;
  signal?: AbortSignal;
}

export const fetchChargingData = async ({
  id,
  environment,
  apiKey,
  signal,
}: FetchOptions): Promise<ChargingDataResult> => {
  let response: Response;
  try {
    response = await fetch(API_URLS[environment], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || window.location.origin,
        'x-graphql-client-version': CLIENT_VERSION,
      },
      body: JSON.stringify({ query: QUERY, variables: { id } }),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError('network');
  }

  if (response.status === 401 || response.status === 403) throw new ApiError('unauthorized');
  if (response.status === 429) throw new ApiError('rate-limited');

  const body = (await response.json().catch(() => null)) as {
    data?: QueryResult;
    errors?: { extensions?: { code?: string } }[];
  } | null;
  if (!response.ok || !body) throw new ApiError('server');

  // The API refuses the charging cost attributes to a site whose branch does not
  // have the charging cost calculator. The fields come back null with this code.
  if (body.errors?.some((error) => error.extensions?.code === NOT_ENABLED_CODE)) {
    throw new ApiError('not-enabled');
  }

  // An id that is not a GUID comes back as a GraphQL error next to null data;
  // to the site that is the same as an id no vehicle has.
  const ads = body.data?.ads;
  return toChargingData(ads?.byAdId ?? ads?.byIterationId?.ads?.[0]);
};

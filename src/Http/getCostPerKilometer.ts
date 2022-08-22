import { EvCalculationChargingPerKilometer } from '../@types/EvCalculation';
import { sendRequest } from './http';

const _cache: { [key: string]: EvCalculationChargingPerKilometer | undefined } = {};
const getCachedValue = (key: string) => _cache[key];
const setCachedValue = (key: string, value: EvCalculationChargingPerKilometer) => {
  _cache[key] = value;
};

const getCostPerKilometer = async (url: string, id: string, kwhCost?: number) => {
  const params = new URLSearchParams();
  if (kwhCost !== undefined) {
    params.set('kwhCost', `${kwhCost}`);
  }

  const paramsAsString = params.toString();
  const queryString = paramsAsString ? `?${paramsAsString}` : '';

  const fullUrl = `${url}/vehicle/charging/${id}/costPerKilometer${queryString}`;
  const cachedValue = getCachedValue(fullUrl);
  if (cachedValue) return cachedValue;

  const result = await sendRequest<EvCalculationChargingPerKilometer>({
    method: 'GET',
    url: fullUrl,
  });

  if (result) {
    setCachedValue(fullUrl, result);
  }

  return result;
};

export default getCostPerKilometer;

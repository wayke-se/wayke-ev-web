import { EvCalculationChargingPerKilometer } from '../@types/EvCalculation';
import { sendRequest } from './http';

const getCostPerKilometer = async (url: string, id: string, kwhCost?: number) => {
  const params = new URLSearchParams();
  if (kwhCost !== undefined) {
    params.set('kwhCost', `${kwhCost}`);
  }

  const paramsAsString = params.toString();
  const queryString = paramsAsString ? `?${paramsAsString}` : '';

  return await sendRequest<EvCalculationChargingPerKilometer>({
    method: 'GET',
    url: `${url}/vehicle/charging/${id}/costPerKilometer${queryString}`,
  });
};

export default getCostPerKilometer;

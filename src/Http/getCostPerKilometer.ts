import { EvCalculationChargingPerKilometer } from '../@types/EvCalculation';
import { sendRequest } from './http';

const getCostPerKilometer = async (url: string, id: string, kwhCost?: number) => {
  return await sendRequest<EvCalculationChargingPerKilometer>({
    method: 'GET',
    url: `${url}/ev-calculation-service/api/vehicle/charging/${id}/costPerKilometer${
      kwhCost ? `?kwhCost=${kwhCost}` : ''
    }`,
  });
};

export default getCostPerKilometer;

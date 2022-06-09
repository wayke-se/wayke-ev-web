import { EvCalculationChargingPerKilometer } from '../@types/EvCalculation';
import { sendRequest } from './http';

const getCostPerKilometer = async (url: string, id: string, kwhCost?: number) => {
  return new Promise<EvCalculationChargingPerKilometer>((resolve) => {
    resolve({
      vehicle: {
        manufacturer: 'BMW',
        salesName: 'iX xDrive40',
        batteryCapacity: {
          unit: 'kWh',
          value: 76.6,
        },
        electricalRangeWLTP: {
          unit: 'km',
          value: 327.0,
        },
      },
      description: {
        costPerKwh: {
          unit: 'SEK',
          value: 1.3,
        },
        costPerKilometer: {
          unit: 'SEK',
          value: 0.34,
        },
        vatIncluded: true,
        energyTaxIncluded: true,
      },
    });
  });

  return await sendRequest<EvCalculationChargingPerKilometer>({
    method: 'GET',
    url: `${url}/api/ev-calculation/vehicle/charging/${id}/costPerKilometer${
      kwhCost ? `?kwhCost=${kwhCost}` : ''
    }`,
  });
};

export default getCostPerKilometer;

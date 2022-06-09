export interface EvCalculationVehicle {
  manufacturer: string;
  salesName: string;
  batteryCapacity: EvCalculationCost;
  electricalRangeWLTP: EvCalculationCost;
}

export interface EvCalculationCost {
  unit: string;
  value: number;
}

export interface EvCalculationDescription {
  costPerKwh: EvCalculationCost;
  costPerKilometer: EvCalculationCost;
  vatIncluded: boolean;
  energyTaxIncluded: boolean;
}

export interface EvCalculationChargingPerKilometer {
  vehicle: EvCalculationVehicle;
  description: EvCalculationDescription;
}

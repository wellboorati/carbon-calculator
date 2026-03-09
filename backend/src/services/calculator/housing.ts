import type { HousingInput } from '../../types';

// EPA Emissions Factors for Greenhouse Gas Inventories
const FACTORS = {
  electricity: 0.386,  // kg CO2e/kWh
  naturalGas: 5.307,   // kg CO2e/therm
  heatingOil: 10.16,   // kg CO2e/gallon
  propane: 5.72,       // kg CO2e/gallon
};

const M3_TO_THERMS = 0.353147; // 1 m³ natural gas = 0.353147 therms

function calculateSingle(input: HousingInput): number {
  const annualConsumption = input.consumption * 12;
  let kgCO2e = 0;

  switch (input.energyType) {
    case 'electricity':
      kgCO2e = annualConsumption * FACTORS.electricity;
      break;
    case 'naturalGas': {
      const therms = input.unit === 'm3'
        ? annualConsumption * M3_TO_THERMS
        : annualConsumption;
      kgCO2e = therms * FACTORS.naturalGas;
      break;
    }
    case 'heatingOil':
      kgCO2e = annualConsumption * FACTORS.heatingOil;
      break;
    case 'propane':
      kgCO2e = annualConsumption * FACTORS.propane;
      break;
  }

  return kgCO2e / input.people / 1000;
}

export function calculateHousing(inputs: HousingInput[]): number {
  return inputs.reduce((sum, input) => sum + calculateSingle(input), 0);
}

import type { TransportationInput } from '../../types';
import { KM_PER_MILE } from '../../constants/units';

// EPA Emissions Factors for Greenhouse Gas Inventories
const VEHICLE_FACTORS: Record<string, number> = {
  gasoline: 8.887,  // kg CO2e/gallon
  diesel: 10.18,    // kg CO2e/gallon
};

const PUBLIC_FACTORS: Record<string, number> = {
  bus: 0.089,    // kg CO2e/passenger-km
  metro: 0.041,
  train: 0.041,
  taxi: 0.149,
};

const LITERS_PER_GALLON = 3.78541;

function toAnnualKm(distance: number, period: 'week' | 'month' | 'year', unit: 'km' | 'miles'): number {
  const inKm = unit === 'miles' ? distance * KM_PER_MILE : distance;
  if (period === 'week') return inKm * 52;
  if (period === 'month') return inKm * 12;
  return inKm;
}

export function calculateTransportation(inputs: TransportationInput[]): number {
  let totalKgCO2e = 0;

  for (const input of inputs) {
    if (input.kind === 'own') {
      const annualKm = toAnnualKm(input.distance, input.distancePeriod, input.distanceUnit);

      let annualGallons: number;
      if (input.efficiencyUnit === 'km_per_liter') {
        const annualLiters = annualKm / input.efficiency;
        annualGallons = annualLiters / LITERS_PER_GALLON;
      } else {
        // mpg: convert km to miles first
        const annualMiles = annualKm / KM_PER_MILE;
        annualGallons = annualMiles / input.efficiency;
      }

      totalKgCO2e += annualGallons * VEHICLE_FACTORS[input.fuelType];
    } else {
      const annualKm = toAnnualKm(input.distance, input.distancePeriod, input.distanceUnit);
      totalKgCO2e += annualKm * PUBLIC_FACTORS[input.transportType];
    }
  }

  return totalKgCO2e / 1000;
}

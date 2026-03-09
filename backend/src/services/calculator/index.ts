import type { CalculateRequest, CalculateResponse } from '../../types';
import { calculateHousing } from './housing';
import { calculateTransportation } from './transportation';
import { calculateFlights } from './flights';
import { calculateDiet } from './diet';
import { getAirportMap } from '../airports';

export function calculate(req: CalculateRequest): CalculateResponse {
  const breakdown: CalculateResponse['breakdown'] = {};

  if (req.housing && req.housing.length > 0) {
    breakdown.housing = calculateHousing(req.housing);
  }

  if (req.transportation && req.transportation.length > 0) {
    breakdown.transportation = calculateTransportation(req.transportation);
  }

  if (req.flights && req.flights.length > 0) {
    breakdown.flights = calculateFlights(req.flights, getAirportMap());
  }

  if (req.diet) {
    breakdown.diet = calculateDiet(req.diet);
  }

  const total = Object.values(breakdown).reduce((sum, v) => sum + (v ?? 0), 0);

  return { total: Math.round(total * 1000) / 1000, breakdown, unit: 'tCO2e/year' };
}

import type { HousingInput, PublicTransportInput, FlightInput, VehicleInput } from '../types';

export const CATEGORY_COLORS: Record<string, string> = {
  housing: '#2e7d32',
  transportation: '#1565c0',
  flights: '#e65100',
  diet: '#6a1b9a',
};

export const CATEGORY_LABELS: Record<string, string> = {
  housing: 'Housing',
  transportation: 'Transportation',
  flights: 'Flights',
  diet: 'Diet',
};

export const ENERGY_LABELS: Record<HousingInput['energyType'], string> = {
  electricity: 'Electricity',
  naturalGas: 'Natural Gas',
  heatingOil: 'Heating Oil',
  propane: 'Propane',
};

export const TRANSPORT_TYPE_LABELS: Record<PublicTransportInput['transportType'], string> = {
  bus: 'Bus',
  metro: 'Metro',
  train: 'Train',
  taxi: 'Taxi / Uber',
};

export const CLASS_LABELS: Record<FlightInput['travelClass'], string> = {
  economy: 'Economy',
  business: 'Business',
  first: 'First Class',
};

export const PERIOD_LABELS: Record<VehicleInput['distancePeriod'], string> = {
  week: 'week',
  month: 'month',
  year: 'year',
};

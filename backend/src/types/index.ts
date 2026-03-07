export interface HousingInput {
  energyType: 'electricity' | 'naturalGas' | 'heatingOil' | 'propane';
  consumption: number;
  unit: 'kWh' | 'm3' | 'therms' | 'gallons';
  people: number;
}

export interface VehicleInput {
  kind: 'own';
  vehicleType: 'car' | 'motorcycle';
  fuelType: 'gasoline' | 'diesel';
  distance: number;
  distancePeriod: 'week' | 'month' | 'year';
  distanceUnit: 'km' | 'miles';
  efficiency: number;
  efficiencyUnit: 'km_per_liter' | 'mpg';
}

export interface PublicTransportInput {
  kind: 'public';
  transportType: 'bus' | 'metro' | 'train' | 'taxi';
  distance: number;
  distancePeriod: 'week' | 'month' | 'year';
  distanceUnit: 'km' | 'miles';
}

export type TransportationInput = VehicleInput | PublicTransportInput;

export interface AirportFlightInput {
  mode: 'airports';
  departureIata: string;
  destinationIata: string;
  layoverIata?: string;
  travelClass: 'economy' | 'business' | 'first';
  tripType: 'oneway' | 'roundtrip';
}

export interface ManualFlightInput {
  mode: 'manual';
  distance: number;
  distanceUnit: 'km' | 'miles';
  travelClass: 'economy' | 'business' | 'first';
  tripType: 'oneway' | 'roundtrip';
}

export type FlightInput = AirportFlightInput | ManualFlightInput;

export interface CalculateRequest {
  housing: HousingInput | null;
  transportation: TransportationInput[] | null;
  flights: FlightInput[] | null;
}

export interface CalculateResponse {
  total: number;
  breakdown: {
    housing?: number;
    transportation?: number;
    flights?: number;
  };
  unit: 'tCO2e/year';
}

export interface Airport {
  iata: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

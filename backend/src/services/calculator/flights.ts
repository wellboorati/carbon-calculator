import { FlightInput, Airport } from '../../types';

const EARTH_RADIUS_KM = 6371;
const KM_PER_MILE = 1.60934;

// ICAO Carbon Emissions Calculator methodology (includes radiative forcing factor 2x)
const BASE_FACTOR_KG_PER_KM = 0.255;

const CLASS_MULTIPLIERS: Record<string, number> = {
  economy: 1.0,
  business: 1.5,
  first: 2.0,
};

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function calculateFlights(inputs: FlightInput[], airports: Map<string, Airport>): number {
  let totalKgCO2e = 0;

  for (const flight of inputs) {
    let distanceKm: number;

    if (flight.mode === 'airports') {
      const dep = airports.get(flight.departureIata.toUpperCase());
      const dest = airports.get(flight.destinationIata.toUpperCase());
      if (!dep || !dest) continue;

      if (flight.layoverIata) {
        const layover = airports.get(flight.layoverIata.toUpperCase());
        if (layover) {
          distanceKm =
            haversineDistance(dep.lat, dep.lon, layover.lat, layover.lon) +
            haversineDistance(layover.lat, layover.lon, dest.lat, dest.lon);
        } else {
          distanceKm = haversineDistance(dep.lat, dep.lon, dest.lat, dest.lon);
        }
      } else {
        distanceKm = haversineDistance(dep.lat, dep.lon, dest.lat, dest.lon);
      }
    } else {
      distanceKm = flight.distanceUnit === 'miles'
        ? flight.distance * KM_PER_MILE
        : flight.distance;
    }

    const classMultiplier = CLASS_MULTIPLIERS[flight.travelClass];
    const tripMultiplier = flight.tripType === 'roundtrip' ? 2 : 1;
    totalKgCO2e += distanceKm * BASE_FACTOR_KG_PER_KM * classMultiplier * tripMultiplier;
  }

  return totalKgCO2e / 1000;
}

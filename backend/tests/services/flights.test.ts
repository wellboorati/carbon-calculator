import { calculateFlights, haversineDistance } from '../../src/services/calculator/flights';
import { Airport } from '../../src/types';

const mockAirports = new Map<string, Airport>([
  ['JFK', { iata: 'JFK', name: 'John F Kennedy', country: 'USA', lat: 40.6398, lon: -73.7789 }],
  ['LHR', { iata: 'LHR', name: 'Heathrow', country: 'UK', lat: 51.4775, lon: -0.4614 }],
  ['MAD', { iata: 'MAD', name: 'Barajas', country: 'Spain', lat: 40.4719, lon: -3.5626 }],
]);

describe('haversineDistance', () => {
  it('calculates distance between JFK and LHR (~5539 km)', () => {
    const dist = haversineDistance(40.6398, -73.7789, 51.4775, -0.4614);
    expect(dist).toBeCloseTo(5539, -2); // within 100km
  });

  it('returns 0 for same point', () => {
    expect(haversineDistance(0, 0, 0, 0)).toBe(0);
  });
});

describe('calculateFlights', () => {
  it('calculates economy one-way flight by airports', () => {
    // JFK->LHR ~5539 km * 0.255 * 1.0 (economy) * 1 (oneway) / 1000 = 1.412 tCO2e
    const result = calculateFlights([{
      mode: 'airports',
      departureIata: 'JFK',
      destinationIata: 'LHR',
      travelClass: 'economy',
      tripType: 'oneway',
    }], mockAirports);
    expect(result).toBeCloseTo(1.412, 0);
  });

  it('doubles emissions for round trip', () => {
    const oneway = calculateFlights([{
      mode: 'airports', departureIata: 'JFK', destinationIata: 'LHR',
      travelClass: 'economy', tripType: 'oneway',
    }], mockAirports);
    const roundtrip = calculateFlights([{
      mode: 'airports', departureIata: 'JFK', destinationIata: 'LHR',
      travelClass: 'economy', tripType: 'roundtrip',
    }], mockAirports);
    expect(roundtrip).toBeCloseTo(oneway * 2, 5);
  });

  it('applies business class multiplier (1.5x)', () => {
    const economy = calculateFlights([{
      mode: 'airports', departureIata: 'JFK', destinationIata: 'LHR',
      travelClass: 'economy', tripType: 'oneway',
    }], mockAirports);
    const business = calculateFlights([{
      mode: 'airports', departureIata: 'JFK', destinationIata: 'LHR',
      travelClass: 'business', tripType: 'oneway',
    }], mockAirports);
    expect(business).toBeCloseTo(economy * 1.5, 5);
  });

  it('calculates manual distance in km', () => {
    // 1000 km * 0.255 * 1.0 / 1000 = 0.255 tCO2e
    const result = calculateFlights([{
      mode: 'manual',
      distance: 1000,
      distanceUnit: 'km',
      travelClass: 'economy',
      tripType: 'oneway',
    }], mockAirports);
    expect(result).toBeCloseTo(0.255, 3);
  });

  it('converts manual miles to km', () => {
    // 1000 miles = 1609.34 km * 0.255 / 1000 = 0.4104 tCO2e
    const result = calculateFlights([{
      mode: 'manual',
      distance: 1000,
      distanceUnit: 'miles',
      travelClass: 'economy',
      tripType: 'oneway',
    }], mockAirports);
    expect(result).toBeCloseTo(0.410, 2);
  });

  it('sums legs when layover is provided', () => {
    // JFK->MAD + MAD->LHR should be > JFK->LHR direct
    const direct = calculateFlights([{
      mode: 'airports', departureIata: 'JFK', destinationIata: 'LHR',
      travelClass: 'economy', tripType: 'oneway',
    }], mockAirports);
    const layover = calculateFlights([{
      mode: 'airports', departureIata: 'JFK', destinationIata: 'LHR',
      layoverIata: 'MAD',
      travelClass: 'economy', tripType: 'oneway',
    }], mockAirports);
    expect(layover).toBeGreaterThan(direct);
  });
});

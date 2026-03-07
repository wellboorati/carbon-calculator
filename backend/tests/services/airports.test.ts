import { loadAirports, searchAirports, getAirportByIata, getAirportMap } from '../../src/services/airports';

beforeAll(() => {
  loadAirports();
});

describe('loadAirports', () => {
  it('loads at least 5000 airports', () => {
    const map = getAirportMap();
    expect(map.size).toBeGreaterThan(5000);
  });

  it('loads GRU with correct coordinates', () => {
    const gru = getAirportByIata('GRU');
    expect(gru).toBeDefined();
    expect(gru!.name).toContain('Guarulhos');
    expect(gru!.lat).toBeCloseTo(-23.4, 0);
    expect(gru!.lon).toBeCloseTo(-46.4, 0);
  });
});

describe('searchAirports', () => {
  it('finds airports by IATA code', () => {
    const results = searchAirports('JFK');
    expect(results.some(a => a.iata === 'JFK')).toBe(true);
  });

  it('finds airports by name', () => {
    const results = searchAirports('heathrow');
    expect(results.some(a => a.iata === 'LHR')).toBe(true);
  });

  it('returns at most 10 results', () => {
    const results = searchAirports('a');
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it('returns empty array for empty query', () => {
    const results = searchAirports('');
    expect(results).toHaveLength(0);
  });
});

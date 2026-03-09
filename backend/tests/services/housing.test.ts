import { calculateHousing } from '../../src/services/calculator/housing';

const ELECTRICITY_KG_PER_KWH      = 0.386;
const NATURAL_GAS_KG_PER_THERM    = 5.307;
const HEATING_OIL_KG_PER_GALLON   = 10.16;
const PROPANE_KG_PER_GALLON       = 5.72;
const M3_TO_THERMS                = 0.353147;

describe('calculateHousing', () => {
  it('calculates electricity emissions correctly', () => {
    const result = calculateHousing([{
      energyType: 'electricity',
      consumption: 500,
      unit: 'kWh',
      people: 1,
    }]);
    expect(result).toBeCloseTo(500 * 12 * ELECTRICITY_KG_PER_KWH / 1000, 2);
  });

  it('divides by number of people', () => {
    const single = calculateHousing([{ energyType: 'electricity', consumption: 500, unit: 'kWh', people: 1 }]);
    const double = calculateHousing([{ energyType: 'electricity', consumption: 500, unit: 'kWh', people: 2 }]);
    expect(double).toBeCloseTo(single / 2, 5);
  });

  it('calculates natural gas in m3', () => {
    const result = calculateHousing([{
      energyType: 'naturalGas',
      consumption: 50,
      unit: 'm3',
      people: 1,
    }]);
    expect(result).toBeCloseTo(50 * 12 * M3_TO_THERMS * NATURAL_GAS_KG_PER_THERM / 1000, 2);
  });

  it('calculates natural gas in therms', () => {
    const result = calculateHousing([{
      energyType: 'naturalGas',
      consumption: 20,
      unit: 'therms',
      people: 1,
    }]);
    expect(result).toBeCloseTo(20 * 12 * NATURAL_GAS_KG_PER_THERM / 1000, 2);
  });

  it('calculates heating oil in gallons', () => {
    const result = calculateHousing([{
      energyType: 'heatingOil',
      consumption: 10,
      unit: 'gallons',
      people: 1,
    }]);
    expect(result).toBeCloseTo(10 * 12 * HEATING_OIL_KG_PER_GALLON / 1000, 2);
  });

  it('calculates propane in gallons', () => {
    const result = calculateHousing([{
      energyType: 'propane',
      consumption: 10,
      unit: 'gallons',
      people: 1,
    }]);
    expect(result).toBeCloseTo(10 * 12 * PROPANE_KG_PER_GALLON / 1000, 2);
  });

  it('sums multiple energy sources', () => {
    const result = calculateHousing([
      { energyType: 'electricity', consumption: 500, unit: 'kWh',     people: 1 },
      { energyType: 'propane',     consumption: 10,  unit: 'gallons', people: 1 },
    ]);
    const expected =
      500 * 12 * ELECTRICITY_KG_PER_KWH    / 1000 +
       10 * 12 * PROPANE_KG_PER_GALLON     / 1000;
    expect(result).toBeCloseTo(expected, 2);
  });
});

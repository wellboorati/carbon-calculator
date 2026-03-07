import { calculateHousing } from '../../src/services/calculator/housing';

describe('calculateHousing', () => {
  it('calculates electricity emissions correctly', () => {
    // 500 kWh/month, 1 person = 500*12*0.386/1000 = 2.316 tCO2e/year
    const result = calculateHousing({
      energyType: 'electricity',
      consumption: 500,
      unit: 'kWh',
      people: 1,
    });
    expect(result).toBeCloseTo(2.316, 2);
  });

  it('divides by number of people', () => {
    const single = calculateHousing({ energyType: 'electricity', consumption: 500, unit: 'kWh', people: 1 });
    const double = calculateHousing({ energyType: 'electricity', consumption: 500, unit: 'kWh', people: 2 });
    expect(double).toBeCloseTo(single / 2, 5);
  });

  it('calculates natural gas in m3', () => {
    // 50 m3/month, 1 person = 50*12 * 0.353147 therms/m3 * 5.307 kg/therm / 1000
    // = 600 * 0.353147 * 5.307 / 1000 = 1.1252 tCO2e/year
    const result = calculateHousing({
      energyType: 'naturalGas',
      consumption: 50,
      unit: 'm3',
      people: 1,
    });
    expect(result).toBeCloseTo(1.125, 2);
  });

  it('calculates natural gas in therms', () => {
    // 20 therms/month, 1 person = 20*12*5.307/1000 = 1.2737 tCO2e/year
    const result = calculateHousing({
      energyType: 'naturalGas',
      consumption: 20,
      unit: 'therms',
      people: 1,
    });
    expect(result).toBeCloseTo(1.274, 2);
  });

  it('calculates heating oil in gallons', () => {
    // 10 gallons/month, 1 person = 10*12*10.16/1000 = 1.219 tCO2e/year
    const result = calculateHousing({
      energyType: 'heatingOil',
      consumption: 10,
      unit: 'gallons',
      people: 1,
    });
    expect(result).toBeCloseTo(1.219, 2);
  });

  it('calculates propane in gallons', () => {
    // 10 gallons/month, 1 person = 10*12*5.72/1000 = 0.6864 tCO2e/year
    const result = calculateHousing({
      energyType: 'propane',
      consumption: 10,
      unit: 'gallons',
      people: 1,
    });
    expect(result).toBeCloseTo(0.686, 2);
  });
});

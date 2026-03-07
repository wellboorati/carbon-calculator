import { calculateTransportation } from '../../src/services/calculator/transportation';

describe('calculateTransportation', () => {
  it('calculates gasoline car in km/liter and weekly km', () => {
    // 200 km/week, 10 km/liter = 20 liters/week = 20*52 = 1040 L/year
    // 1040 / 3.78541 = 274.7 gallons * 8.887 = 2441.6 kg = 2.44 tCO2e
    const result = calculateTransportation([{
      kind: 'own',
      vehicleType: 'car',
      fuelType: 'gasoline',
      distance: 200,
      distancePeriod: 'week',
      distanceUnit: 'km',
      efficiency: 10,
      efficiencyUnit: 'km_per_liter',
    }]);
    expect(result).toBeCloseTo(2.442, 1);
  });

  it('calculates diesel car with MPG and annual miles', () => {
    // 10000 miles/year, 30 MPG = 333.3 gallons * 10.18 = 3393 kg = 3.39 tCO2e
    const result = calculateTransportation([{
      kind: 'own',
      vehicleType: 'car',
      fuelType: 'diesel',
      distance: 10000,
      distancePeriod: 'year',
      distanceUnit: 'miles',
      efficiency: 30,
      efficiencyUnit: 'mpg',
    }]);
    expect(result).toBeCloseTo(3.393, 1);
  });

  it('calculates bus transport', () => {
    // 100 km/week = 5200 km/year
    // 5200 * 0.089 = 462.8 kg = 0.463 tCO2e
    const result = calculateTransportation([{
      kind: 'public',
      transportType: 'bus',
      distance: 100,
      distancePeriod: 'week',
      distanceUnit: 'km',
    }]);
    expect(result).toBeCloseTo(0.463, 2);
  });

  it('sums multiple transport modes', () => {
    const car = calculateTransportation([{
      kind: 'own', vehicleType: 'car', fuelType: 'gasoline',
      distance: 200, distancePeriod: 'week', distanceUnit: 'km',
      efficiency: 10, efficiencyUnit: 'km_per_liter',
    }]);
    const bus = calculateTransportation([{
      kind: 'public', transportType: 'bus',
      distance: 100, distancePeriod: 'week', distanceUnit: 'km',
    }]);
    const both = calculateTransportation([
      {
        kind: 'own', vehicleType: 'car', fuelType: 'gasoline',
        distance: 200, distancePeriod: 'week', distanceUnit: 'km',
        efficiency: 10, efficiencyUnit: 'km_per_liter',
      },
      {
        kind: 'public', transportType: 'bus',
        distance: 100, distancePeriod: 'week', distanceUnit: 'km',
      },
    ]);
    expect(both).toBeCloseTo(car + bus, 5);
  });
});

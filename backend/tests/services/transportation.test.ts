import { calculateTransportation } from '../../src/services/calculator/transportation';

const GASOLINE_KG_PER_GALLON = 8.887;
const DIESEL_KG_PER_GALLON   = 10.18;
const BUS_KG_PER_KM          = 0.089;
const LITERS_PER_GALLON      = 3.78541;

describe('calculateTransportation', () => {
  it('calculates gasoline car in km/liter and weekly km', () => {
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
    const annualGallons = (200 * 52 / 10) / LITERS_PER_GALLON;
    expect(result).toBeCloseTo(annualGallons * GASOLINE_KG_PER_GALLON / 1000, 1);
  });

  it('calculates diesel car with MPG and annual miles', () => {
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
    const annualGallons = 10000 / 30;
    expect(result).toBeCloseTo(annualGallons * DIESEL_KG_PER_GALLON / 1000, 1);
  });

  it('calculates bus transport', () => {
    const result = calculateTransportation([{
      kind: 'public',
      transportType: 'bus',
      distance: 100,
      distancePeriod: 'week',
      distanceUnit: 'km',
    }]);
    expect(result).toBeCloseTo(100 * 52 * BUS_KG_PER_KM / 1000, 2);
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

import { calculateDiet } from '../../src/services/calculator/diet';

const PLANT_BASELINE          = 0.5;
const BEEF_PER_SERVING_WEEK   = (0.150 * 27.0 * 52) / 1000;
const OTHER_MEAT_PER_SERVING  = (0.150 *  6.5 * 52) / 1000;
const FISH_PER_SERVING        = (0.150 *  5.0 * 52) / 1000;
const DAIRY_PER_SERVING       = (0.200 *  3.0 * 52) / 1000;

const ZERO_DIET = {
  beefServingsPerWeek: 0,
  otherMeatServingsPerWeek: 0,
  fishServingsPerWeek: 0,
  dairyServingsPerWeek: 0,
};

describe('calculateDiet', () => {
  it('returns the plant-based baseline when all servings are zero', () => {
    expect(calculateDiet(ZERO_DIET)).toBeCloseTo(PLANT_BASELINE, 3);
  });

  it('adds beef emissions correctly', () => {
    const result = calculateDiet({ ...ZERO_DIET, beefServingsPerWeek: 1 });
    expect(result).toBeCloseTo(PLANT_BASELINE + BEEF_PER_SERVING_WEEK, 2);
  });

  it('adds other meat emissions correctly', () => {
    const result = calculateDiet({ ...ZERO_DIET, otherMeatServingsPerWeek: 1 });
    expect(result).toBeCloseTo(PLANT_BASELINE + OTHER_MEAT_PER_SERVING, 2);
  });

  it('adds fish emissions correctly', () => {
    const result = calculateDiet({ ...ZERO_DIET, fishServingsPerWeek: 1 });
    expect(result).toBeCloseTo(PLANT_BASELINE + FISH_PER_SERVING, 2);
  });

  it('adds dairy emissions correctly', () => {
    const result = calculateDiet({ ...ZERO_DIET, dairyServingsPerWeek: 1 });
    expect(result).toBeCloseTo(PLANT_BASELINE + DAIRY_PER_SERVING, 2);
  });

  it('sums all food groups', () => {
    const result = calculateDiet({
      beefServingsPerWeek: 1,
      otherMeatServingsPerWeek: 1,
      fishServingsPerWeek: 1,
      dairyServingsPerWeek: 1,
    });
    expect(result).toBeCloseTo(
      PLANT_BASELINE + BEEF_PER_SERVING_WEEK + OTHER_MEAT_PER_SERVING + FISH_PER_SERVING + DAIRY_PER_SERVING,
      2,
    );
  });

  it('scales linearly with multiple servings', () => {
    const one   = calculateDiet({ ...ZERO_DIET, beefServingsPerWeek: 1 });
    const three = calculateDiet({ ...ZERO_DIET, beefServingsPerWeek: 3 });
    expect(three - PLANT_BASELINE).toBeCloseTo((one - PLANT_BASELINE) * 3, 2);
  });
});

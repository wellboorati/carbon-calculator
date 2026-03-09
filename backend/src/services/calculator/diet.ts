import type { DietInput } from '../../types';

// Emission factors (tCO2e per serving per week, annualised)
// Serving = ~150 g meat/fish, ~200 g dairy
const BEEF_PER_SERVING_WEEK   = (0.150 * 27.0 * 52) / 1000; // 0.2106
const OTHER_MEAT_PER_SERVING  = (0.150 *  6.5 * 52) / 1000; // 0.0507
const FISH_PER_SERVING        = (0.150 *  5.0 * 52) / 1000; // 0.0390
const DAIRY_PER_SERVING       = (0.200 *  3.0 * 52) / 1000; // 0.0312

// Baseline for a fully plant-based diet (farming, transport, packaging)
const PLANT_BASELINE = 0.5;

export function calculateDiet(input: DietInput): number {
  const total =
    PLANT_BASELINE +
    input.beefServingsPerWeek    * BEEF_PER_SERVING_WEEK  +
    input.otherMeatServingsPerWeek * OTHER_MEAT_PER_SERVING +
    input.fishServingsPerWeek    * FISH_PER_SERVING        +
    input.dairyServingsPerWeek   * DAIRY_PER_SERVING;

  return Math.round(total * 1000) / 1000;
}

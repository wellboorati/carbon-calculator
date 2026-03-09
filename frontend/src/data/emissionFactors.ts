/**
 * Emission equivalency factors used to contextualise a CO₂ total for users.
 * Sources: EPA, ICAO, peer-reviewed forest carbon literature.
 */

/** tCO₂ absorbed per tree per year (~22 kg) */
export const TREE_ABSORPTION = 0.022;

/** tCO₂ emitted per km by an average gasoline car (~210 g/km) */
export const CAR_CO2_PER_KM = 0.00021;

/** tCO₂ emitted per passenger for a short-haul flight (~1,000 km) */
export const FLIGHT_CO2 = 0.255;

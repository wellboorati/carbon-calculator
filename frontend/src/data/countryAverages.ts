/**
 * Per-capita greenhouse gas emissions (tCO₂e/year) by country.
 * Source: Our World in Data / Global Carbon Project, ~2022 data.
 * These represent TOTAL per-capita emissions across all sectors.
 * The calculator covers housing, transportation, flights, and diet — national
 * averages also include industry, government, and agriculture beyond food.
 */
export const WORLD_AVERAGE = 4.7;

export interface CountryAverage {
  name: string;
  region: string;
  avg: number; // tCO₂e/year per capita
}

export const COUNTRY_AVERAGES: CountryAverage[] = [
  // North America
  { name: 'United States', region: 'North America', avg: 14.0 },
  { name: 'Canada', region: 'North America', avg: 13.5 },
  { name: 'Mexico', region: 'North America', avg: 3.7 },

  // South America
  { name: 'Brazil', region: 'South America', avg: 2.5 },
  { name: 'Argentina', region: 'South America', avg: 4.5 },
  { name: 'Chile', region: 'South America', avg: 4.7 },
  { name: 'Colombia', region: 'South America', avg: 2.2 },
  { name: 'Peru', region: 'South America', avg: 1.8 },

  // Europe
  { name: 'Germany', region: 'Europe', avg: 8.1 },
  { name: 'United Kingdom', region: 'Europe', avg: 5.5 },
  { name: 'France', region: 'Europe', avg: 4.6 },
  { name: 'Italy', region: 'Europe', avg: 5.7 },
  { name: 'Spain', region: 'Europe', avg: 5.2 },
  { name: 'Netherlands', region: 'Europe', avg: 7.9 },
  { name: 'Poland', region: 'Europe', avg: 8.3 },
  { name: 'Sweden', region: 'Europe', avg: 4.0 },
  { name: 'Norway', region: 'Europe', avg: 7.5 },
  { name: 'Switzerland', region: 'Europe', avg: 4.4 },
  { name: 'Portugal', region: 'Europe', avg: 4.5 },
  { name: 'Belgium', region: 'Europe', avg: 7.8 },
  { name: 'Austria', region: 'Europe', avg: 7.2 },
  { name: 'Turkey', region: 'Europe', avg: 6.1 },

  // Middle East
  { name: 'Saudi Arabia', region: 'Middle East', avg: 16.8 },
  { name: 'United Arab Emirates', region: 'Middle East', avg: 20.7 },
  { name: 'Qatar', region: 'Middle East', avg: 31.5 },
  { name: 'Kuwait', region: 'Middle East', avg: 22.9 },
  { name: 'Israel', region: 'Middle East', avg: 7.4 },

  // Asia
  { name: 'China', region: 'Asia', avg: 8.0 },
  { name: 'Japan', region: 'Asia', avg: 8.7 },
  { name: 'South Korea', region: 'Asia', avg: 11.6 },
  { name: 'India', region: 'Asia', avg: 2.0 },
  { name: 'Indonesia', region: 'Asia', avg: 2.8 },
  { name: 'Vietnam', region: 'Asia', avg: 3.5 },
  { name: 'Thailand', region: 'Asia', avg: 4.1 },
  { name: 'Malaysia', region: 'Asia', avg: 7.8 },
  { name: 'Philippines', region: 'Asia', avg: 1.3 },
  { name: 'Pakistan', region: 'Asia', avg: 0.9 },
  { name: 'Bangladesh', region: 'Asia', avg: 0.6 },

  // Oceania
  { name: 'Australia', region: 'Oceania', avg: 14.8 },
  { name: 'New Zealand', region: 'Oceania', avg: 7.0 },

  // Africa
  { name: 'South Africa', region: 'Africa', avg: 7.5 },
  { name: 'Egypt', region: 'Africa', avg: 2.9 },
  { name: 'Nigeria', region: 'Africa', avg: 0.7 },
  { name: 'Kenya', region: 'Africa', avg: 0.4 },
  { name: 'Ethiopia', region: 'Africa', avg: 0.2 },

  // CIS
  { name: 'Russia', region: 'CIS', avg: 11.3 },
  { name: 'Kazakhstan', region: 'CIS', avg: 13.4 },
  { name: 'Ukraine', region: 'CIS', avg: 4.2 },
].sort((a, b) => a.name.localeCompare(b.name));

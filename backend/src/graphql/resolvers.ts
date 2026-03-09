import { searchAirports } from '../services/airports';
import { calculate } from '../services/calculator';
import { generatePDF } from '../services/pdf';
import type { HousingInput, TransportationInput, FlightInput, DietInput, CalculateResponse } from '../types';

export const resolvers = {
  Query: {
    airports(_: unknown, { q }: { q: string }) {
      return searchAirports(q);
    },
  },

  Mutation: {
    calculate(
      _: unknown,
      {
        housing,
        transportation,
        flights,
        diet,
      }: {
        housing?: HousingInput[] | null;
        transportation?: TransportationInput[] | null;
        flights?: FlightInput[] | null;
        diet?: DietInput | null;
      },
    ) {
      return calculate({
        housing: housing ?? null,
        transportation: transportation ?? null,
        flights: flights ?? null,
        diet: diet ?? null,
      });
    },

    async generatePdf(
      _: unknown,
      args: {
        total: number;
        breakdown: CalculateResponse['breakdown'];
        unit: string;
        countryName?: string;
        countryAvg?: number;
        worldAvg: number;
      },
    ): Promise<string> {
      const buffer = await generatePDF(args);
      return buffer.toString('base64');
    },
  },
};

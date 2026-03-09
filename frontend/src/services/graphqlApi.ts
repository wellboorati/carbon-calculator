import client from '../graphql/client';
import { SEARCH_AIRPORTS, CALCULATE, GENERATE_PDF } from '../graphql/operations';
import type { CalculateRequest, CalculateResponse, Airport } from '../types';

interface CalculateMutationResult {
  calculate: {
    total: number;
    unit: string;
    breakdown: { housing: number | null; transportation: number | null; flights: number | null; diet: number | null };
  };
}

interface SearchAirportsQueryResult {
  airports: Airport[];
}

interface GeneratePdfMutationResult {
  generatePdf: string;
}

interface PdfCountryOptions {
  countryName?: string;
  countryAvg?: number;
  worldAvg: number;
}

export function extractErrorMessage(err: unknown): string {
  if (err != null && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    const gqlErrors = e['graphQLErrors'];
    if (Array.isArray(gqlErrors) && gqlErrors.length > 0) {
      const first = gqlErrors[0] as Record<string, unknown>;
      if (typeof first['message'] === 'string') return first['message'];
    }
    const networkError = e['networkError'];
    if (networkError != null && typeof networkError === 'object') {
      const ne = networkError as Record<string, unknown>;
      if (typeof ne['message'] === 'string') return `Network error: ${ne['message']}`;
    }
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function calculate(data: CalculateRequest): Promise<CalculateResponse> {
  const { data: res } = await client.mutate<CalculateMutationResult>({
    mutation: CALCULATE,
    variables: {
      housing: data.housing ?? undefined,
      transportation: data.transportation ?? undefined,
      flights: data.flights ?? undefined,
      diet: data.diet ?? undefined,
    },
  });
  if (!res) throw new Error('No data returned from calculate');
  const raw = res.calculate;
  return {
    total: Number(raw.total),
    unit: raw.unit as CalculateResponse['unit'],
    breakdown: {
      housing:        raw.breakdown.housing        != null ? Number(raw.breakdown.housing)        : undefined,
      transportation: raw.breakdown.transportation != null ? Number(raw.breakdown.transportation) : undefined,
      flights:        raw.breakdown.flights        != null ? Number(raw.breakdown.flights)        : undefined,
      diet:           raw.breakdown.diet           != null ? Number(raw.breakdown.diet)           : undefined,
    },
  } satisfies CalculateResponse;
}

export async function searchAirports(query: string): Promise<Airport[]> {
  if (!query.trim()) return [];
  const { data: res } = await client.query<SearchAirportsQueryResult>({
    query: SEARCH_AIRPORTS,
    variables: { q: query },
    fetchPolicy: 'no-cache',
  });
  return res?.airports ?? [];
}

export async function downloadPDF(result: CalculateResponse, countryOptions: PdfCountryOptions): Promise<void> {
  const { data: res } = await client.mutate<GeneratePdfMutationResult>({
    mutation: GENERATE_PDF,
    variables: {
      total: result.total,
      breakdown: result.breakdown,
      unit: result.unit,
      countryName: countryOptions.countryName,
      countryAvg: countryOptions.countryAvg,
      worldAvg: countryOptions.worldAvg,
    },
  });
  if (!res) throw new Error('No data returned from generatePdf');

  const base64 = res.generatePdf;
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'carbon-footprint.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

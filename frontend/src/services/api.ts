import axios from 'axios';
import type { CalculateRequest, CalculateResponse, Airport } from '../types';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export async function calculate(data: CalculateRequest): Promise<CalculateResponse> {
  const res = await api.post<CalculateResponse>('/calculate', data);
  return res.data;
}

export async function searchAirports(query: string): Promise<Airport[]> {
  if (!query.trim()) return [];
  const res = await api.get<Airport[]>('/airports', { params: { q: query } });
  return res.data;
}

export async function downloadPDF(result: CalculateResponse): Promise<void> {
  const res = await api.post('/generate-pdf', result, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'carbon-footprint.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

import fs from 'fs';
import path from 'path';
import { Airport } from '../types';

let airportMap: Map<string, Airport> = new Map();
let airportList: Airport[] = [];

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function loadAirports(): void {
  airportMap = new Map();
  airportList = [];

  const dataPath = path.join(__dirname, '../data/airports.dat');
  const content = fs.readFileSync(dataPath, 'utf-8');

  for (const line of content.split('\n')) {
    if (!line.trim()) continue;

    const fields = parseCSVLine(line);
    if (fields.length < 8) continue;

    const iata = fields[4].trim();
    if (!iata || iata === '\\N' || iata.length !== 3) continue;

    const lat = parseFloat(fields[6]);
    const lon = parseFloat(fields[7]);
    if (isNaN(lat) || isNaN(lon)) continue;

    const airport: Airport = {
      iata,
      name: fields[1].trim(),
      country: fields[3].trim(),
      lat,
      lon,
    };

    airportMap.set(iata, airport);
    airportList.push(airport);
  }
}

export function searchAirports(query: string): Airport[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return airportList
    .filter(
      (a) =>
        a.iata.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
    )
    .slice(0, 10);
}

export function getAirportByIata(iata: string): Airport | undefined {
  return airportMap.get(iata.toUpperCase());
}

export function getAirportMap(): Map<string, Airport> {
  return airportMap;
}

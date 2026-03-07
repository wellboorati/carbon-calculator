# Carbon Calculator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a stateless carbon footprint calculator with a React+Vite+MUI frontend and a Node+Express backend, running on separate ports.

**Architecture:** Frontend (port 5173) collects form data via a 3-step stepper and sends it to the backend (port 3001) for calculation. All emission logic lives in the backend. Airport data is loaded from a static OpenFlights file into memory at startup.

**Tech Stack:** TypeScript, React, Vite, Material UI, React Router v6, Node.js, Express, pdfkit, Jest, Vitest

---

## Phase 1 — Backend

---

### Task 1: Scaffold backend project

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.env`
- Create: `backend/.gitignore`

**Step 1: Initialize backend directory and package.json**

```bash
mkdir -p backend && cd backend && npm init -y
```

**Step 2: Install production dependencies**

```bash
cd backend && npm install express cors dotenv pdfkit
```

**Step 3: Install dev dependencies**

```bash
cd backend && npm install -D typescript ts-node-dev @types/express @types/node @types/cors @types/pdfkit jest ts-jest @types/jest supertest @types/supertest
```

**Step 4: Write tsconfig.json**

`backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 5: Update package.json scripts**

Edit `backend/package.json` to add:
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "testMatch": ["**/tests/**/*.test.ts"]
  }
}
```

**Step 6: Create .env**

`backend/.env`:
```
PORT=3001
```

**Step 7: Create .gitignore**

`backend/.gitignore`:
```
node_modules/
dist/
.env
```

**Step 8: Commit**

```bash
cd backend && git add . && git commit -m "feat: scaffold backend project"
```

---

### Task 2: Define backend types

**Files:**
- Create: `backend/src/types/index.ts`

**Step 1: Write all shared TypeScript interfaces**

`backend/src/types/index.ts`:
```typescript
export interface HousingInput {
  energyType: 'electricity' | 'naturalGas' | 'heatingOil' | 'propane';
  consumption: number;
  unit: 'kWh' | 'm3' | 'therms' | 'gallons';
  people: number;
}

export interface VehicleInput {
  kind: 'own';
  vehicleType: 'car' | 'motorcycle';
  fuelType: 'gasoline' | 'diesel';
  distance: number;
  distancePeriod: 'week' | 'month' | 'year';
  distanceUnit: 'km' | 'miles';
  efficiency: number;
  efficiencyUnit: 'km_per_liter' | 'mpg';
}

export interface PublicTransportInput {
  kind: 'public';
  transportType: 'bus' | 'metro' | 'train' | 'taxi';
  distance: number;
  distancePeriod: 'week' | 'month' | 'year';
  distanceUnit: 'km' | 'miles';
}

export type TransportationInput = VehicleInput | PublicTransportInput;

export interface AirportFlightInput {
  mode: 'airports';
  departureIata: string;
  destinationIata: string;
  layoverIata?: string;
  travelClass: 'economy' | 'business' | 'first';
  tripType: 'oneway' | 'roundtrip';
}

export interface ManualFlightInput {
  mode: 'manual';
  distance: number;
  distanceUnit: 'km' | 'miles';
  travelClass: 'economy' | 'business' | 'first';
  tripType: 'oneway' | 'roundtrip';
}

export type FlightInput = AirportFlightInput | ManualFlightInput;

export interface CalculateRequest {
  housing: HousingInput | null;
  transportation: TransportationInput[] | null;
  flights: FlightInput[] | null;
}

export interface CalculateResponse {
  total: number;
  breakdown: {
    housing?: number;
    transportation?: number;
    flights?: number;
  };
  unit: 'tCO2e/year';
}

export interface Airport {
  iata: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}
```

**Step 2: Commit**

```bash
cd backend && git add src/types/index.ts && git commit -m "feat: add backend type definitions"
```

---

### Task 3: Airport data and service

**Files:**
- Create: `backend/src/data/` (directory)
- Create: `backend/src/services/airports.ts`
- Create: `backend/tests/services/airports.test.ts`

**Step 1: Download OpenFlights airports.dat**

```bash
mkdir -p backend/src/data
curl -o backend/src/data/airports.dat \
  "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat"
```

Verify it downloaded (should have ~14,000+ lines):
```bash
wc -l backend/src/data/airports.dat
```

**Step 2: Write failing test**

`backend/tests/services/airports.test.ts`:
```typescript
import { loadAirports, searchAirports, getAirportByIata, getAirportMap } from '../../src/services/airports';

beforeAll(() => {
  loadAirports();
});

describe('loadAirports', () => {
  it('loads at least 5000 airports', () => {
    const map = getAirportMap();
    expect(map.size).toBeGreaterThan(5000);
  });

  it('loads GRU with correct coordinates', () => {
    const gru = getAirportByIata('GRU');
    expect(gru).toBeDefined();
    expect(gru!.name).toContain('Guarulhos');
    expect(gru!.lat).toBeCloseTo(-23.4, 0);
    expect(gru!.lon).toBeCloseTo(-46.4, 0);
  });
});

describe('searchAirports', () => {
  it('finds airports by IATA code', () => {
    const results = searchAirports('JFK');
    expect(results.some(a => a.iata === 'JFK')).toBe(true);
  });

  it('finds airports by name', () => {
    const results = searchAirports('heathrow');
    expect(results.some(a => a.iata === 'LHR')).toBe(true);
  });

  it('returns at most 10 results', () => {
    const results = searchAirports('a');
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it('returns empty array for empty query', () => {
    const results = searchAirports('');
    expect(results).toHaveLength(0);
  });
});
```

**Step 3: Run test to verify it fails**

```bash
cd backend && npm test -- --testPathPattern=airports
```
Expected: FAIL — "Cannot find module"

**Step 4: Implement airports service**

`backend/src/services/airports.ts`:
```typescript
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
```

**Step 5: Run tests to verify they pass**

```bash
cd backend && npm test -- --testPathPattern=airports
```
Expected: PASS (all 4 tests)

**Step 6: Commit**

```bash
cd backend && git add src/services/airports.ts src/data/airports.dat tests/services/airports.test.ts \
  && git commit -m "feat: add airport data loading and search service"
```

---

### Task 4: Housing calculator service

**Files:**
- Create: `backend/src/services/calculator/housing.ts`
- Create: `backend/tests/services/housing.test.ts`

**Step 1: Write failing test**

`backend/tests/services/housing.test.ts`:
```typescript
import { calculateHousing } from '../../src/services/calculator/housing';

describe('calculateHousing', () => {
  it('calculates electricity emissions correctly', () => {
    // 500 kWh/month, 1 person = 500*12*0.386/1000 = 2.316 tCO2e/year
    const result = calculateHousing({
      energyType: 'electricity',
      consumption: 500,
      unit: 'kWh',
      people: 1,
    });
    expect(result).toBeCloseTo(2.316, 2);
  });

  it('divides by number of people', () => {
    const single = calculateHousing({ energyType: 'electricity', consumption: 500, unit: 'kWh', people: 1 });
    const double = calculateHousing({ energyType: 'electricity', consumption: 500, unit: 'kWh', people: 2 });
    expect(double).toBeCloseTo(single / 2, 5);
  });

  it('calculates natural gas in m3', () => {
    // 50 m3/month, 1 person = 50*12 * 0.353147 therms/m3 * 5.307 kg/therm / 1000
    // = 600 * 0.353147 * 5.307 / 1000 = 1.1252 tCO2e/year
    const result = calculateHousing({
      energyType: 'naturalGas',
      consumption: 50,
      unit: 'm3',
      people: 1,
    });
    expect(result).toBeCloseTo(1.125, 2);
  });

  it('calculates natural gas in therms', () => {
    // 20 therms/month, 1 person = 20*12*5.307/1000 = 1.2737 tCO2e/year
    const result = calculateHousing({
      energyType: 'naturalGas',
      consumption: 20,
      unit: 'therms',
      people: 1,
    });
    expect(result).toBeCloseTo(1.274, 2);
  });

  it('calculates heating oil in gallons', () => {
    // 10 gallons/month, 1 person = 10*12*10.16/1000 = 1.219 tCO2e/year
    const result = calculateHousing({
      energyType: 'heatingOil',
      consumption: 10,
      unit: 'gallons',
      people: 1,
    });
    expect(result).toBeCloseTo(1.219, 2);
  });

  it('calculates propane in gallons', () => {
    // 10 gallons/month, 1 person = 10*12*5.72/1000 = 0.6864 tCO2e/year
    const result = calculateHousing({
      energyType: 'propane',
      consumption: 10,
      unit: 'gallons',
      people: 1,
    });
    expect(result).toBeCloseTo(0.686, 2);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd backend && npm test -- --testPathPattern=housing
```
Expected: FAIL — "Cannot find module"

**Step 3: Implement housing calculator**

`backend/src/services/calculator/housing.ts`:
```typescript
import { HousingInput } from '../../types';

const FACTORS = {
  electricity: 0.386,  // kg CO2e/kWh (EPA)
  naturalGas: 5.307,   // kg CO2e/therm (EPA)
  heatingOil: 10.16,   // kg CO2e/gallon (EPA)
  propane: 5.72,       // kg CO2e/gallon (EPA)
};

const M3_TO_THERMS = 0.353147; // 1 m³ natural gas = 0.353147 therms

export function calculateHousing(input: HousingInput): number {
  const annualConsumption = input.consumption * 12;
  let kgCO2e = 0;

  switch (input.energyType) {
    case 'electricity':
      kgCO2e = annualConsumption * FACTORS.electricity;
      break;
    case 'naturalGas': {
      const therms = input.unit === 'm3'
        ? annualConsumption * M3_TO_THERMS
        : annualConsumption;
      kgCO2e = therms * FACTORS.naturalGas;
      break;
    }
    case 'heatingOil':
      kgCO2e = annualConsumption * FACTORS.heatingOil;
      break;
    case 'propane':
      kgCO2e = annualConsumption * FACTORS.propane;
      break;
  }

  return kgCO2e / input.people / 1000;
}
```

**Step 4: Run tests to verify they pass**

```bash
cd backend && npm test -- --testPathPattern=housing
```
Expected: PASS (6 tests)

**Step 5: Commit**

```bash
cd backend && git add src/services/calculator/housing.ts tests/services/housing.test.ts \
  && git commit -m "feat: add housing emission calculator"
```

---

### Task 5: Transportation calculator service

**Files:**
- Create: `backend/src/services/calculator/transportation.ts`
- Create: `backend/tests/services/transportation.test.ts`

**Step 1: Write failing test**

`backend/tests/services/transportation.test.ts`:
```typescript
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
    // 20 km/day * 5 days = 100 km/week = 5200 km/year
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
```

**Step 2: Run test to verify it fails**

```bash
cd backend && npm test -- --testPathPattern=transportation
```
Expected: FAIL — "Cannot find module"

**Step 3: Implement transportation calculator**

`backend/src/services/calculator/transportation.ts`:
```typescript
import { TransportationInput } from '../../types';

const VEHICLE_FACTORS: Record<string, number> = {
  gasoline: 8.887,  // kg CO2e/gallon (EPA)
  diesel: 10.18,    // kg CO2e/gallon (EPA)
};

const PUBLIC_FACTORS: Record<string, number> = {
  bus: 0.089,    // kg CO2e/passenger-km (EPA)
  metro: 0.041,
  train: 0.041,
  taxi: 0.149,
};

const LITERS_PER_GALLON = 3.78541;
const KM_PER_MILE = 1.60934;

function toAnnualKm(distance: number, period: 'week' | 'month' | 'year', unit: 'km' | 'miles'): number {
  const inKm = unit === 'miles' ? distance * KM_PER_MILE : distance;
  if (period === 'week') return inKm * 52;
  if (period === 'month') return inKm * 12;
  return inKm;
}

export function calculateTransportation(inputs: TransportationInput[]): number {
  let totalKgCO2e = 0;

  for (const input of inputs) {
    if (input.kind === 'own') {
      const annualKm = toAnnualKm(input.distance, input.distancePeriod, input.distanceUnit);

      let annualGallons: number;
      if (input.efficiencyUnit === 'km_per_liter') {
        const annualLiters = annualKm / input.efficiency;
        annualGallons = annualLiters / LITERS_PER_GALLON;
      } else {
        const annualMiles = annualKm / KM_PER_MILE;
        annualGallons = annualMiles / input.efficiency;
      }

      totalKgCO2e += annualGallons * VEHICLE_FACTORS[input.fuelType];
    } else {
      const annualKm = toAnnualKm(input.distance, input.distancePeriod, input.distanceUnit);
      totalKgCO2e += annualKm * PUBLIC_FACTORS[input.transportType];
    }
  }

  return totalKgCO2e / 1000;
}
```

**Step 4: Run tests to verify they pass**

```bash
cd backend && npm test -- --testPathPattern=transportation
```
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
cd backend && git add src/services/calculator/transportation.ts tests/services/transportation.test.ts \
  && git commit -m "feat: add transportation emission calculator"
```

---

### Task 6: Flights calculator service

**Files:**
- Create: `backend/src/services/calculator/flights.ts`
- Create: `backend/tests/services/flights.test.ts`

**Step 1: Write failing test**

`backend/tests/services/flights.test.ts`:
```typescript
import { calculateFlights, haversineDistance } from '../../src/services/calculator/flights';
import { Airport } from '../../src/types';

const mockAirports = new Map<string, Airport>([
  ['JFK', { iata: 'JFK', name: 'John F Kennedy', country: 'USA', lat: 40.6398, lon: -73.7789 }],
  ['LHR', { iata: 'LHR', name: 'Heathrow', country: 'UK', lat: 51.4775, lon: -0.4614 }],
  ['MAD', { iata: 'MAD', name: 'Barajas', country: 'Spain', lat: 40.4719, lon: -3.5626 }],
]);

describe('haversineDistance', () => {
  it('calculates distance between JFK and LHR (~5539 km)', () => {
    const dist = haversineDistance(40.6398, -73.7789, 51.4775, -0.4614);
    expect(dist).toBeCloseTo(5539, -2); // within 100km
  });

  it('returns 0 for same point', () => {
    expect(haversineDistance(0, 0, 0, 0)).toBe(0);
  });
});

describe('calculateFlights', () => {
  it('calculates economy one-way flight by airports', () => {
    // JFK->LHR ~5539 km * 0.255 * 1.0 (economy) * 1 (oneway) / 1000 = 1.412 tCO2e
    const result = calculateFlights([{
      mode: 'airports',
      departureIata: 'JFK',
      destinationIata: 'LHR',
      travelClass: 'economy',
      tripType: 'oneway',
    }], mockAirports);
    expect(result).toBeCloseTo(1.412, 0);
  });

  it('doubles emissions for round trip', () => {
    const oneway = calculateFlights([{
      mode: 'airports', departureIata: 'JFK', destinationIata: 'LHR',
      travelClass: 'economy', tripType: 'oneway',
    }], mockAirports);
    const roundtrip = calculateFlights([{
      mode: 'airports', departureIata: 'JFK', destinationIata: 'LHR',
      travelClass: 'economy', tripType: 'roundtrip',
    }], mockAirports);
    expect(roundtrip).toBeCloseTo(oneway * 2, 5);
  });

  it('applies business class multiplier (1.5x)', () => {
    const economy = calculateFlights([{
      mode: 'airports', departureIata: 'JFK', destinationIata: 'LHR',
      travelClass: 'economy', tripType: 'oneway',
    }], mockAirports);
    const business = calculateFlights([{
      mode: 'airports', departureIata: 'JFK', destinationIata: 'LHR',
      travelClass: 'business', tripType: 'oneway',
    }], mockAirports);
    expect(business).toBeCloseTo(economy * 1.5, 5);
  });

  it('calculates manual distance in km', () => {
    // 1000 km * 0.255 * 1.0 / 1000 = 0.255 tCO2e
    const result = calculateFlights([{
      mode: 'manual',
      distance: 1000,
      distanceUnit: 'km',
      travelClass: 'economy',
      tripType: 'oneway',
    }], mockAirports);
    expect(result).toBeCloseTo(0.255, 3);
  });

  it('converts manual miles to km', () => {
    // 1000 miles = 1609.34 km * 0.255 / 1000 = 0.4104 tCO2e
    const result = calculateFlights([{
      mode: 'manual',
      distance: 1000,
      distanceUnit: 'miles',
      travelClass: 'economy',
      tripType: 'oneway',
    }], mockAirports);
    expect(result).toBeCloseTo(0.410, 2);
  });

  it('sums legs when layover is provided', () => {
    // JFK->MAD + MAD->LHR should be > JFK->LHR direct
    const direct = calculateFlights([{
      mode: 'airports', departureIata: 'JFK', destinationIata: 'LHR',
      travelClass: 'economy', tripType: 'oneway',
    }], mockAirports);
    const layover = calculateFlights([{
      mode: 'airports', departureIata: 'JFK', destinationIata: 'LHR',
      layoverIata: 'MAD',
      travelClass: 'economy', tripType: 'oneway',
    }], mockAirports);
    expect(layover).toBeGreaterThan(direct);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd backend && npm test -- --testPathPattern=flights
```
Expected: FAIL — "Cannot find module"

**Step 3: Implement flights calculator**

`backend/src/services/calculator/flights.ts`:
```typescript
import { FlightInput, Airport } from '../../types';

const EARTH_RADIUS_KM = 6371;
const KM_PER_MILE = 1.60934;
const BASE_FACTOR_KG_PER_KM = 0.255; // ICAO (includes radiative forcing 2x)

const CLASS_MULTIPLIERS: Record<string, number> = {
  economy: 1.0,
  business: 1.5,
  first: 2.0,
};

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function calculateFlights(inputs: FlightInput[], airports: Map<string, Airport>): number {
  let totalKgCO2e = 0;

  for (const flight of inputs) {
    let distanceKm: number;

    if (flight.mode === 'airports') {
      const dep = airports.get(flight.departureIata.toUpperCase());
      const dest = airports.get(flight.destinationIata.toUpperCase());
      if (!dep || !dest) continue;

      if (flight.layoverIata) {
        const layover = airports.get(flight.layoverIata.toUpperCase());
        if (layover) {
          distanceKm =
            haversineDistance(dep.lat, dep.lon, layover.lat, layover.lon) +
            haversineDistance(layover.lat, layover.lon, dest.lat, dest.lon);
        } else {
          distanceKm = haversineDistance(dep.lat, dep.lon, dest.lat, dest.lon);
        }
      } else {
        distanceKm = haversineDistance(dep.lat, dep.lon, dest.lat, dest.lon);
      }
    } else {
      distanceKm = flight.distanceUnit === 'miles'
        ? flight.distance * KM_PER_MILE
        : flight.distance;
    }

    const classMultiplier = CLASS_MULTIPLIERS[flight.travelClass];
    const tripMultiplier = flight.tripType === 'roundtrip' ? 2 : 1;
    totalKgCO2e += distanceKm * BASE_FACTOR_KG_PER_KM * classMultiplier * tripMultiplier;
  }

  return totalKgCO2e / 1000;
}
```

**Step 4: Run tests to verify they pass**

```bash
cd backend && npm test -- --testPathPattern=flights
```
Expected: PASS (8 tests)

**Step 5: Commit**

```bash
cd backend && git add src/services/calculator/flights.ts tests/services/flights.test.ts \
  && git commit -m "feat: add flights emission calculator with Haversine"
```

---

### Task 7: Calculate endpoint

**Files:**
- Create: `backend/src/services/calculator/index.ts`
- Create: `backend/src/controllers/calculateController.ts`
- Create: `backend/src/routes/calculate.ts`
- Create: `backend/tests/routes/calculate.test.ts`

**Step 1: Write failing test**

`backend/tests/routes/calculate.test.ts`:
```typescript
import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('POST /calculate', () => {
  it('returns 400 if body is missing', async () => {
    const res = await request(app).post('/calculate').send({});
    expect(res.status).toBe(400);
  });

  it('calculates with only housing', async () => {
    const res = await request(app).post('/calculate').send({
      housing: { energyType: 'electricity', consumption: 500, unit: 'kWh', people: 1 },
      transportation: null,
      flights: null,
    });
    expect(res.status).toBe(200);
    expect(res.body.total).toBeCloseTo(2.316, 1);
    expect(res.body.breakdown.housing).toBeCloseTo(2.316, 1);
    expect(res.body.breakdown.transportation).toBeUndefined();
    expect(res.body.unit).toBe('tCO2e/year');
  });

  it('calculates with only flights (manual)', async () => {
    const res = await request(app).post('/calculate').send({
      housing: null,
      transportation: null,
      flights: [{ mode: 'manual', distance: 1000, distanceUnit: 'km', travelClass: 'economy', tripType: 'oneway' }],
    });
    expect(res.status).toBe(200);
    expect(res.body.total).toBeCloseTo(0.255, 2);
    expect(res.body.breakdown.flights).toBeCloseTo(0.255, 2);
  });

  it('sums all categories', async () => {
    const res = await request(app).post('/calculate').send({
      housing: { energyType: 'electricity', consumption: 500, unit: 'kWh', people: 1 },
      transportation: [{ kind: 'public', transportType: 'bus', distance: 100, distancePeriod: 'week', distanceUnit: 'km' }],
      flights: [{ mode: 'manual', distance: 1000, distanceUnit: 'km', travelClass: 'economy', tripType: 'oneway' }],
    });
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
    expect(Object.keys(res.body.breakdown)).toHaveLength(3);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd backend && npm test -- --testPathPattern=calculate
```
Expected: FAIL — "Cannot find module"

**Step 3: Create calculator index service**

`backend/src/services/calculator/index.ts`:
```typescript
import { CalculateRequest, CalculateResponse } from '../../types';
import { calculateHousing } from './housing';
import { calculateTransportation } from './transportation';
import { calculateFlights } from './flights';
import { getAirportMap } from '../airports';

export function calculate(req: CalculateRequest): CalculateResponse {
  const breakdown: CalculateResponse['breakdown'] = {};

  if (req.housing) {
    breakdown.housing = calculateHousing(req.housing);
  }

  if (req.transportation && req.transportation.length > 0) {
    breakdown.transportation = calculateTransportation(req.transportation);
  }

  if (req.flights && req.flights.length > 0) {
    breakdown.flights = calculateFlights(req.flights, getAirportMap());
  }

  const total = Object.values(breakdown).reduce((sum, v) => sum + (v ?? 0), 0);

  return { total: Math.round(total * 1000) / 1000, breakdown, unit: 'tCO2e/year' };
}
```

**Step 4: Create controller**

`backend/src/controllers/calculateController.ts`:
```typescript
import { Request, Response } from 'express';
import { calculate } from '../services/calculator';
import { CalculateRequest } from '../types';

export function handleCalculate(req: Request, res: Response): void {
  const body = req.body as Partial<CalculateRequest>;

  if (body.housing === undefined && body.transportation === undefined && body.flights === undefined) {
    res.status(400).json({ error: 'Request body must include at least one of: housing, transportation, flights' });
    return;
  }

  const input: CalculateRequest = {
    housing: body.housing ?? null,
    transportation: body.transportation ?? null,
    flights: body.flights ?? null,
  };

  const result = calculate(input);
  res.json(result);
}
```

**Step 5: Create route**

`backend/src/routes/calculate.ts`:
```typescript
import { Router } from 'express';
import { handleCalculate } from '../controllers/calculateController';

const router = Router();
router.post('/', handleCalculate);
export default router;
```

**Step 6: Create app.ts (Express app factory for testing)**

`backend/src/app.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import calculateRouter from './routes/calculate';
import airportsRouter from './routes/airports';
import pdfRouter from './routes/pdf';

export function createApp() {
  const app = express();
  app.use(cors({ origin: 'http://localhost:5173' }));
  app.use(express.json());

  app.use('/calculate', calculateRouter);
  app.use('/airports', airportsRouter);
  app.use('/generate-pdf', pdfRouter);

  return app;
}
```

**Step 7: Run tests to verify they pass**

```bash
cd backend && npm test -- --testPathPattern=calculate
```
Expected: PASS (4 tests)

**Step 8: Commit**

```bash
cd backend && git add src/services/calculator/index.ts src/controllers/calculateController.ts \
  src/routes/calculate.ts src/app.ts tests/routes/calculate.test.ts \
  && git commit -m "feat: add /calculate endpoint"
```

---

### Task 8: Airports endpoint

**Files:**
- Create: `backend/src/controllers/airportsController.ts`
- Create: `backend/src/routes/airports.ts`
- Create: `backend/tests/routes/airports.test.ts`

**Step 1: Write failing test**

`backend/tests/routes/airports.test.ts`:
```typescript
import request from 'supertest';
import { createApp } from '../../src/app';
import { loadAirports } from '../../src/services/airports';

beforeAll(() => loadAirports());

const app = createApp();

describe('GET /airports', () => {
  it('returns 400 if q is missing', async () => {
    const res = await request(app).get('/airports');
    expect(res.status).toBe(400);
  });

  it('returns airports matching IATA code', async () => {
    const res = await request(app).get('/airports?q=JFK');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((a: { iata: string }) => a.iata === 'JFK')).toBe(true);
  });

  it('returns at most 10 results', async () => {
    const res = await request(app).get('/airports?q=air');
    expect(res.body.length).toBeLessThanOrEqual(10);
  });

  it('each result has required fields', async () => {
    const res = await request(app).get('/airports?q=LHR');
    const airport = res.body[0];
    expect(airport).toHaveProperty('iata');
    expect(airport).toHaveProperty('name');
    expect(airport).toHaveProperty('country');
    expect(airport).toHaveProperty('lat');
    expect(airport).toHaveProperty('lon');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd backend && npm test -- --testPathPattern=routes/airports
```
Expected: FAIL — "Cannot find module"

**Step 3: Create controller and route**

`backend/src/controllers/airportsController.ts`:
```typescript
import { Request, Response } from 'express';
import { searchAirports } from '../services/airports';

export function handleAirportSearch(req: Request, res: Response): void {
  const q = req.query.q as string | undefined;

  if (!q) {
    res.status(400).json({ error: 'Query parameter "q" is required' });
    return;
  }

  const results = searchAirports(q);
  res.json(results);
}
```

`backend/src/routes/airports.ts`:
```typescript
import { Router } from 'express';
import { handleAirportSearch } from '../controllers/airportsController';

const router = Router();
router.get('/', handleAirportSearch);
export default router;
```

**Step 4: Run tests to verify they pass**

```bash
cd backend && npm test -- --testPathPattern=routes/airports
```
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
cd backend && git add src/controllers/airportsController.ts src/routes/airports.ts \
  tests/routes/airports.test.ts && git commit -m "feat: add /airports search endpoint"
```

---

### Task 9: PDF service and endpoint

**Files:**
- Create: `backend/src/services/pdf.ts`
- Create: `backend/src/controllers/pdfController.ts`
- Create: `backend/src/routes/pdf.ts`

**Step 1: Implement PDF service**

`backend/src/services/pdf.ts`:
```typescript
import PDFDocument from 'pdfkit';
import { CalculateResponse } from '../types';

export function generatePDF(result: CalculateResponse): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Title
    doc.fontSize(22).font('Helvetica-Bold').text('Carbon Calculator Results', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666666')
      .text(`Generated on ${new Date().toLocaleDateString('en-US')}`, { align: 'center' });
    doc.moveDown(1.5);

    // Total
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000')
      .text(`Total Footprint: ${result.total.toFixed(2)} tCO\u2082e/year`);
    doc.moveDown(1);

    // Breakdown
    doc.fontSize(13).font('Helvetica-Bold').text('Breakdown by Category:');
    doc.moveDown(0.5);

    const labels: Record<string, string> = {
      housing: 'Housing / Home Energy',
      transportation: 'Transportation',
      flights: 'Flights',
    };

    for (const [key, label] of Object.entries(labels)) {
      const value = result.breakdown[key as keyof typeof result.breakdown];
      if (value !== undefined) {
        doc.fontSize(12).font('Helvetica')
          .text(`  \u2022  ${label}: ${value.toFixed(2)} tCO\u2082e/year`);
      }
    }

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#999999').font('Helvetica')
      .text('Carbon Calculator — Individual Carbon Footprint Estimator', { align: 'center' });

    doc.end();
  });
}
```

**Step 2: Create controller**

`backend/src/controllers/pdfController.ts`:
```typescript
import { Request, Response } from 'express';
import { generatePDF } from '../services/pdf';
import { CalculateResponse } from '../types';

export async function handleGeneratePDF(req: Request, res: Response): Promise<void> {
  const body = req.body as CalculateResponse;

  if (body.total === undefined || !body.breakdown) {
    res.status(400).json({ error: 'Invalid calculation result' });
    return;
  }

  const pdfBuffer = await generatePDF(body);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="carbon-footprint.pdf"');
  res.send(pdfBuffer);
}
```

**Step 3: Create route**

`backend/src/routes/pdf.ts`:
```typescript
import { Router } from 'express';
import { handleGeneratePDF } from '../controllers/pdfController';

const router = Router();
router.post('/', handleGeneratePDF);
export default router;
```

**Step 4: Commit**

```bash
cd backend && git add src/services/pdf.ts src/controllers/pdfController.ts src/routes/pdf.ts \
  && git commit -m "feat: add PDF generation endpoint"
```

---

### Task 10: Backend entry point (index.ts)

**Files:**
- Create: `backend/src/index.ts`

**Step 1: Write index.ts**

`backend/src/index.ts`:
```typescript
import dotenv from 'dotenv';
dotenv.config();

import { loadAirports } from './services/airports';
import { createApp } from './app';

const PORT = process.env.PORT ?? 3001;

loadAirports();
console.log('Airport data loaded.');

const app = createApp();

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
```

**Step 2: Run all backend tests**

```bash
cd backend && npm test
```
Expected: All tests pass.

**Step 3: Start the backend to verify it runs**

```bash
cd backend && npm run dev
```
Expected: "Airport data loaded." and "Backend running at http://localhost:3001"

**Step 4: Commit**

```bash
cd backend && git add src/index.ts && git commit -m "feat: complete backend — all endpoints wired"
```

---

## Phase 2 — Frontend

---

### Task 11: Scaffold frontend project

**Files:**
- Create: `frontend/` (via Vite scaffold)

**Step 1: Scaffold with Vite**

```bash
cd /path/to/carbon-calculator && npm create vite@latest frontend -- --template react-ts
```

**Step 2: Install dependencies**

```bash
cd frontend && npm install
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/x-charts
npm install react-router-dom axios
```

**Step 3: Install dev dependencies**

```bash
cd frontend && npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Step 4: Update vite.config.ts to add test config**

`frontend/vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

**Step 5: Create test setup file**

`frontend/src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

**Step 6: Update package.json scripts**

Edit `frontend/package.json` to add:
```json
"test": "vitest"
```

**Step 7: Create .env**

`frontend/.env`:
```
VITE_API_URL=http://localhost:3001
```

**Step 8: Delete boilerplate**

Delete `frontend/src/App.css`, `frontend/src/assets/react.svg`, and replace `frontend/src/index.css` with:
```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Roboto, sans-serif; }
```

**Step 9: Commit**

```bash
cd frontend && git add . && git commit -m "feat: scaffold frontend with Vite + MUI + React Router"
```

---

### Task 12: Frontend types and API service

**Files:**
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/services/api.ts`

**Step 1: Mirror backend types in frontend**

`frontend/src/types/index.ts`:
```typescript
export interface HousingInput {
  energyType: 'electricity' | 'naturalGas' | 'heatingOil' | 'propane';
  consumption: number;
  unit: 'kWh' | 'm3' | 'therms' | 'gallons';
  people: number;
}

export interface VehicleInput {
  kind: 'own';
  vehicleType: 'car' | 'motorcycle';
  fuelType: 'gasoline' | 'diesel';
  distance: number;
  distancePeriod: 'week' | 'month' | 'year';
  distanceUnit: 'km' | 'miles';
  efficiency: number;
  efficiencyUnit: 'km_per_liter' | 'mpg';
}

export interface PublicTransportInput {
  kind: 'public';
  transportType: 'bus' | 'metro' | 'train' | 'taxi';
  distance: number;
  distancePeriod: 'week' | 'month' | 'year';
  distanceUnit: 'km' | 'miles';
}

export type TransportationInput = VehicleInput | PublicTransportInput;

export interface AirportFlightInput {
  mode: 'airports';
  departureIata: string;
  destinationIata: string;
  layoverIata?: string;
  travelClass: 'economy' | 'business' | 'first';
  tripType: 'oneway' | 'roundtrip';
}

export interface ManualFlightInput {
  mode: 'manual';
  distance: number;
  distanceUnit: 'km' | 'miles';
  travelClass: 'economy' | 'business' | 'first';
  tripType: 'oneway' | 'roundtrip';
}

export type FlightInput = AirportFlightInput | ManualFlightInput;

export interface CalculateRequest {
  housing: HousingInput | null;
  transportation: TransportationInput[] | null;
  flights: FlightInput[] | null;
}

export interface CalculateResponse {
  total: number;
  breakdown: {
    housing?: number;
    transportation?: number;
    flights?: number;
  };
  unit: 'tCO2e/year';
}

export interface Airport {
  iata: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}
```

**Step 2: Create API service**

`frontend/src/services/api.ts`:
```typescript
import axios from 'axios';
import { CalculateRequest, CalculateResponse, Airport } from '../types';

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
  link.click();
  window.URL.revokeObjectURL(url);
}
```

**Step 3: Commit**

```bash
cd frontend && git add src/types/index.ts src/services/api.ts \
  && git commit -m "feat: add frontend types and API service"
```

---

### Task 13: Layout and routing

**Files:**
- Create: `frontend/src/components/Layout/Navbar.tsx`
- Create: `frontend/src/components/Layout/Layout.tsx`
- Create: `frontend/src/App.tsx`

**Step 1: Create Navbar**

`frontend/src/components/Layout/Navbar.tsx`:
```tsx
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Calculator', path: '/calculator' },
  { label: 'Tips', path: '/tips' },
  { label: 'FAQ', path: '/faq' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Carbon Calculator
        </Typography>
        {NAV_LINKS.map((link) => (
          <Button
            key={link.path}
            color="inherit"
            onClick={() => navigate(link.path)}
            sx={{ fontWeight: location.pathname === link.path ? 700 : 400 }}
          >
            {link.label}
          </Button>
        ))}
      </Toolbar>
    </AppBar>
  );
}
```

**Step 2: Create Layout**

`frontend/src/components/Layout/Layout.tsx`:
```tsx
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
```

**Step 3: Create App.tsx with router**

`frontend/src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Results from './pages/Results';
import Tips from './pages/Tips';
import FAQ from './pages/FAQ';

const theme = createTheme({
  palette: {
    primary: { main: '#2e7d32' },
    secondary: { main: '#ff8f00' },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/results" element={<Results />} />
            <Route path="/tips" element={<Tips />} />
            <Route path="/faq" element={<FAQ />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
```

**Step 4: Update main.tsx**

`frontend/src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 5: Create placeholder pages to unblock routing**

Create `frontend/src/pages/Home.tsx`, `Calculator.tsx`, `Results.tsx`, `Tips.tsx`, `FAQ.tsx` each with a placeholder:

```tsx
// Each file — replace PageName accordingly
export default function PageName() {
  return <div>PageName</div>;
}
```

**Step 6: Run dev to verify routing works**

```bash
cd frontend && npm run dev
```
Open http://localhost:5173 — navbar should show and all routes load without error.

**Step 7: Commit**

```bash
cd frontend && git add src/ && git commit -m "feat: add layout, navbar and routing"
```

---

### Task 14: Home page

**Files:**
- Modify: `frontend/src/pages/Home.tsx`

**Step 1: Implement Home page**

`frontend/src/pages/Home.tsx`:
```tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import NatureIcon from '@mui/icons-material/Nature';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <NatureIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Carbon Footprint Calculator
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
        Measure your individual carbon emissions from home energy, transportation, and flights.
        Get your annual CO₂ estimate in minutes.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/calculator')}
        sx={{ px: 5, py: 1.5, fontSize: '1.1rem', borderRadius: 3 }}
      >
        Start Calculation
      </Button>

      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 8, flexWrap: 'wrap' }}>
        {[
          { title: 'Home Energy', desc: 'Electricity, gas, heating oil, propane' },
          { title: 'Transportation', desc: 'Car, motorcycle, bus, metro, train' },
          { title: 'Flights', desc: 'Domestic and international air travel' },
        ].map((card) => (
          <Paper key={card.title} elevation={2} sx={{ p: 3, width: 200, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight={700}>{card.title}</Typography>
            <Typography variant="body2" color="text.secondary">{card.desc}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
```

**Step 2: Commit**

```bash
cd frontend && git add src/pages/Home.tsx && git commit -m "feat: add Home page"
```

---

### Task 15: Housing step component

**Files:**
- Create: `frontend/src/components/calculator/steps/HousingStep.tsx`

**Step 1: Implement HousingStep**

`frontend/src/components/calculator/steps/HousingStep.tsx`:
```tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { HousingInput } from '../../../types';

interface Props {
  value: HousingInput;
  onChange: (v: HousingInput) => void;
}

const ENERGY_UNITS: Record<HousingInput['energyType'], HousingInput['unit'][]> = {
  electricity: ['kWh'],
  naturalGas: ['m3', 'therms'],
  heatingOil: ['gallons'],
  propane: ['gallons'],
};

export default function HousingStep({ value, onChange }: Props) {
  const availableUnits = ENERGY_UNITS[value.energyType];

  function handleEnergyTypeChange(energyType: HousingInput['energyType']) {
    const unit = ENERGY_UNITS[energyType][0];
    onChange({ ...value, energyType, unit });
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6">Housing / Home Energy</Typography>

      <FormControl fullWidth>
        <InputLabel>Energy Type</InputLabel>
        <Select
          value={value.energyType}
          label="Energy Type"
          onChange={(e) => handleEnergyTypeChange(e.target.value as HousingInput['energyType'])}
        >
          <MenuItem value="electricity">Electricity</MenuItem>
          <MenuItem value="naturalGas">Natural Gas</MenuItem>
          <MenuItem value="heatingOil">Heating Oil</MenuItem>
          <MenuItem value="propane">Propane</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Monthly Consumption"
          type="number"
          value={value.consumption || ''}
          onChange={(e) => onChange({ ...value, consumption: parseFloat(e.target.value) || 0 })}
          inputProps={{ min: 0 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Unit</InputLabel>
          <Select
            value={value.unit}
            label="Unit"
            onChange={(e) => onChange({ ...value, unit: e.target.value as HousingInput['unit'] })}
          >
            {availableUnits.map((u) => (
              <MenuItem key={u} value={u}>{u}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TextField
        fullWidth
        label="Number of people in household"
        type="number"
        value={value.people || ''}
        onChange={(e) => onChange({ ...value, people: parseInt(e.target.value) || 1 })}
        inputProps={{ min: 1 }}
        helperText="Emissions will be divided by the number of people"
      />
    </Box>
  );
}
```

**Step 2: Commit**

```bash
cd frontend && git add src/components/calculator/steps/HousingStep.tsx \
  && git commit -m "feat: add HousingStep component"
```

---

### Task 16: Transportation step component

**Files:**
- Create: `frontend/src/components/calculator/steps/TransportationStep.tsx`

**Step 1: Implement TransportationStep**

`frontend/src/components/calculator/steps/TransportationStep.tsx`:
```tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { TransportationInput, VehicleInput, PublicTransportInput } from '../../../types';

interface Props {
  value: TransportationInput[];
  onChange: (v: TransportationInput[]) => void;
}

const DEFAULT_VEHICLE: VehicleInput = {
  kind: 'own', vehicleType: 'car', fuelType: 'gasoline',
  distance: 0, distancePeriod: 'week', distanceUnit: 'km',
  efficiency: 0, efficiencyUnit: 'km_per_liter',
};

const DEFAULT_PUBLIC: PublicTransportInput = {
  kind: 'public', transportType: 'bus',
  distance: 0, distancePeriod: 'week', distanceUnit: 'km',
};

export default function TransportationStep({ value, onChange }: Props) {
  function add(kind: 'own' | 'public') {
    onChange([...value, kind === 'own' ? { ...DEFAULT_VEHICLE } : { ...DEFAULT_PUBLIC }]);
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function update(i: number, updated: TransportationInput) {
    onChange(value.map((item, idx) => (idx === i ? updated : item)));
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Transportation</Typography>

      {value.map((item, i) => (
        <Card key={i} variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {item.kind === 'own' ? 'Own Vehicle' : 'Public Transport'} #{i + 1}
              </Typography>
              <IconButton size="small" onClick={() => remove(i)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>

            {item.kind === 'own' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Vehicle Type</InputLabel>
                    <Select value={item.vehicleType} label="Vehicle Type"
                      onChange={(e) => update(i, { ...item, vehicleType: e.target.value as VehicleInput['vehicleType'] })}>
                      <MenuItem value="car">Car</MenuItem>
                      <MenuItem value="motorcycle">Motorcycle</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Fuel Type</InputLabel>
                    <Select value={item.fuelType} label="Fuel Type"
                      onChange={(e) => update(i, { ...item, fuelType: e.target.value as VehicleInput['fuelType'] })}>
                      <MenuItem value="gasoline">Gasoline</MenuItem>
                      <MenuItem value="diesel">Diesel</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField fullWidth label="Distance" type="number" value={item.distance || ''}
                    onChange={(e) => update(i, { ...item, distance: parseFloat(e.target.value) || 0 })}
                    inputProps={{ min: 0 }} />
                  <FormControl sx={{ minWidth: 100 }}>
                    <InputLabel>Unit</InputLabel>
                    <Select value={item.distanceUnit} label="Unit"
                      onChange={(e) => update(i, { ...item, distanceUnit: e.target.value as 'km' | 'miles' })}>
                      <MenuItem value="km">km</MenuItem>
                      <MenuItem value="miles">miles</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Per</InputLabel>
                    <Select value={item.distancePeriod} label="Per"
                      onChange={(e) => update(i, { ...item, distancePeriod: e.target.value as VehicleInput['distancePeriod'] })}>
                      <MenuItem value="week">Week</MenuItem>
                      <MenuItem value="month">Month</MenuItem>
                      <MenuItem value="year">Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField fullWidth label="Fuel Efficiency" type="number" value={item.efficiency || ''}
                    onChange={(e) => update(i, { ...item, efficiency: parseFloat(e.target.value) || 0 })}
                    inputProps={{ min: 0 }} />
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Efficiency Unit</InputLabel>
                    <Select value={item.efficiencyUnit} label="Efficiency Unit"
                      onChange={(e) => update(i, { ...item, efficiencyUnit: e.target.value as VehicleInput['efficiencyUnit'] })}>
                      <MenuItem value="km_per_liter">km / liter</MenuItem>
                      <MenuItem value="mpg">MPG</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            )}

            {item.kind === 'public' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Transport Type</InputLabel>
                  <Select value={item.transportType} label="Transport Type"
                    onChange={(e) => update(i, { ...item, transportType: e.target.value as PublicTransportInput['transportType'] })}>
                    <MenuItem value="bus">Bus</MenuItem>
                    <MenuItem value="metro">Metro</MenuItem>
                    <MenuItem value="train">Train</MenuItem>
                    <MenuItem value="taxi">Taxi / Uber</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField fullWidth label="Distance" type="number" value={item.distance || ''}
                    onChange={(e) => update(i, { ...item, distance: parseFloat(e.target.value) || 0 })}
                    inputProps={{ min: 0 }} />
                  <FormControl sx={{ minWidth: 100 }}>
                    <InputLabel>Unit</InputLabel>
                    <Select value={item.distanceUnit} label="Unit"
                      onChange={(e) => update(i, { ...item, distanceUnit: e.target.value as 'km' | 'miles' })}>
                      <MenuItem value="km">km</MenuItem>
                      <MenuItem value="miles">miles</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Per</InputLabel>
                    <Select value={item.distancePeriod} label="Per"
                      onChange={(e) => update(i, { ...item, distancePeriod: e.target.value as PublicTransportInput['distancePeriod'] })}>
                      <MenuItem value="week">Week</MenuItem>
                      <MenuItem value="month">Month</MenuItem>
                      <MenuItem value="year">Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => add('own')}>
          Add Own Vehicle
        </Button>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => add('public')}>
          Add Public Transport
        </Button>
      </Box>
    </Box>
  );
}
```

**Step 2: Commit**

```bash
cd frontend && git add src/components/calculator/steps/TransportationStep.tsx \
  && git commit -m "feat: add TransportationStep component"
```

---

### Task 17: Flights step component

**Files:**
- Create: `frontend/src/components/calculator/steps/FlightsStep.tsx`

**Step 1: Implement FlightsStep**

`frontend/src/components/calculator/steps/FlightsStep.tsx`:
```tsx
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FlightInput, AirportFlightInput, ManualFlightInput, Airport } from '../../../types';
import { searchAirports } from '../../../services/api';

interface Props {
  value: FlightInput[];
  onChange: (v: FlightInput[]) => void;
}

const DEFAULT_AIRPORT_FLIGHT: AirportFlightInput = {
  mode: 'airports', departureIata: '', destinationIata: '',
  travelClass: 'economy', tripType: 'oneway',
};

const DEFAULT_MANUAL_FLIGHT: ManualFlightInput = {
  mode: 'manual', distance: 0, distanceUnit: 'km',
  travelClass: 'economy', tripType: 'oneway',
};

function AirportSelect({ label, value, onChange }: { label: string; value: string; onChange: (iata: string) => void }) {
  const [options, setOptions] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(query: string) {
    if (query.length < 2) { setOptions([]); return; }
    setLoading(true);
    const results = await searchAirports(query);
    setOptions(results);
    setLoading(false);
  }

  return (
    <Autocomplete
      fullWidth
      options={options}
      getOptionLabel={(o) => `${o.iata} — ${o.name} (${o.country})`}
      filterOptions={(x) => x}
      onInputChange={(_, v) => handleSearch(v)}
      onChange={(_, o) => onChange(o ? o.iata : '')}
      loading={loading}
      renderInput={(params) => (
        <TextField {...params} label={label}
          InputProps={{ ...params.InputProps, endAdornment: (<>{loading ? <CircularProgress size={16} /> : null}{params.InputProps.endAdornment}</>) }}
        />
      )}
    />
  );
}

export default function FlightsStep({ value, onChange }: Props) {
  function add(mode: 'airports' | 'manual') {
    onChange([...value, mode === 'airports' ? { ...DEFAULT_AIRPORT_FLIGHT } : { ...DEFAULT_MANUAL_FLIGHT }]);
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function update(i: number, updated: FlightInput) {
    onChange(value.map((item, idx) => (idx === i ? updated : item)));
  }

  function toggleMode(i: number, mode: 'airports' | 'manual') {
    onChange(value.map((item, idx) =>
      idx === i ? (mode === 'airports' ? { ...DEFAULT_AIRPORT_FLIGHT } : { ...DEFAULT_MANUAL_FLIGHT }) : item
    ));
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Flights</Typography>

      {value.map((item, i) => (
        <Card key={i} variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <ToggleButtonGroup
                exclusive size="small" value={item.mode}
                onChange={(_, v) => v && toggleMode(i, v)}
              >
                <ToggleButton value="airports">Select Airports</ToggleButton>
                <ToggleButton value="manual">Manual Distance</ToggleButton>
              </ToggleButtonGroup>
              <IconButton size="small" onClick={() => remove(i)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>

            {item.mode === 'airports' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AirportSelect label="Departure Airport"
                  value={(item as AirportFlightInput).departureIata}
                  onChange={(iata) => update(i, { ...item, departureIata: iata } as AirportFlightInput)} />
                <AirportSelect label="Destination Airport"
                  value={(item as AirportFlightInput).destinationIata}
                  onChange={(iata) => update(i, { ...item, destinationIata: iata } as AirportFlightInput)} />
                <AirportSelect label="Layover Airport (optional)"
                  value={(item as AirportFlightInput).layoverIata ?? ''}
                  onChange={(iata) => update(i, { ...item, layoverIata: iata || undefined } as AirportFlightInput)} />
              </Box>
            )}

            {item.mode === 'manual' && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField fullWidth label="Distance" type="number"
                  value={(item as ManualFlightInput).distance || ''}
                  onChange={(e) => update(i, { ...item, distance: parseFloat(e.target.value) || 0 } as ManualFlightInput)}
                  inputProps={{ min: 0 }} />
                <FormControl sx={{ minWidth: 100 }}>
                  <InputLabel>Unit</InputLabel>
                  <Select value={(item as ManualFlightInput).distanceUnit} label="Unit"
                    onChange={(e) => update(i, { ...item, distanceUnit: e.target.value as 'km' | 'miles' } as ManualFlightInput)}>
                    <MenuItem value="km">km</MenuItem>
                    <MenuItem value="miles">miles</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Travel Class</InputLabel>
                <Select value={item.travelClass} label="Travel Class"
                  onChange={(e) => update(i, { ...item, travelClass: e.target.value as FlightInput['travelClass'] })}>
                  <MenuItem value="economy">Economy</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                  <MenuItem value="first">First Class</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Trip Type</InputLabel>
                <Select value={item.tripType} label="Trip Type"
                  onChange={(e) => update(i, { ...item, tripType: e.target.value as FlightInput['tripType'] })}>
                  <MenuItem value="oneway">One Way</MenuItem>
                  <MenuItem value="roundtrip">Round Trip</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => add('airports')}>
          Add Flight (Airports)
        </Button>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => add('manual')}>
          Add Flight (Manual Distance)
        </Button>
      </Box>
    </Box>
  );
}
```

**Step 2: Commit**

```bash
cd frontend && git add src/components/calculator/steps/FlightsStep.tsx \
  && git commit -m "feat: add FlightsStep component with airport autocomplete"
```

---

### Task 18: Calculator page (Stepper)

**Files:**
- Modify: `frontend/src/pages/Calculator.tsx`

**Step 1: Implement Calculator page**

`frontend/src/pages/Calculator.tsx`:
```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import HousingStep from '../components/calculator/steps/HousingStep';
import TransportationStep from '../components/calculator/steps/TransportationStep';
import FlightsStep from '../components/calculator/steps/FlightsStep';
import { HousingInput, TransportationInput, FlightInput } from '../types';
import { calculate } from '../services/api';

const STEPS = ['Housing / Home Energy', 'Transportation', 'Flights'];

const DEFAULT_HOUSING: HousingInput = {
  energyType: 'electricity', consumption: 0, unit: 'kWh', people: 1,
};

export default function Calculator() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [housing, setHousing] = useState<HousingInput | null>(null);
  const [housingDraft, setHousingDraft] = useState<HousingInput>({ ...DEFAULT_HOUSING });

  const [transportation, setTransportation] = useState<TransportationInput[] | null>(null);
  const [transportDraft, setTransportDraft] = useState<TransportationInput[]>([]);

  const [flights, setFlights] = useState<FlightInput[] | null>(null);
  const [flightsDraft, setFlightsDraft] = useState<FlightInput[]>([]);

  function handleNext() {
    if (activeStep === 0) setHousing(housingDraft.consumption > 0 ? housingDraft : null);
    if (activeStep === 1) setTransportation(transportDraft.length > 0 ? transportDraft : null);
    if (activeStep === 2) {
      setFlights(flightsDraft.length > 0 ? flightsDraft : null);
    }
    if (activeStep < STEPS.length - 1) {
      setActiveStep((s) => s + 1);
    }
  }

  function handleSkip() {
    if (activeStep === 0) setHousing(null);
    if (activeStep === 1) setTransportation(null);
    if (activeStep === 2) setFlights(null);
    if (activeStep < STEPS.length - 1) {
      setActiveStep((s) => s + 1);
    }
  }

  async function handleSubmit() {
    const finalFlights = flightsDraft.length > 0 ? flightsDraft : null;
    setLoading(true);
    setError(null);
    try {
      const result = await calculate({
        housing,
        transportation,
        flights: finalFlights,
      });
      navigate('/results', { state: { result } });
    } catch {
      setError('Failed to calculate. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  const isLastStep = activeStep === STEPS.length - 1;

  return (
    <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: 300 }}>
        {activeStep === 0 && <HousingStep value={housingDraft} onChange={setHousingDraft} />}
        {activeStep === 1 && <TransportationStep value={transportDraft} onChange={setTransportDraft} />}
        {activeStep === 2 && <FlightsStep value={flightsDraft} onChange={setFlightsDraft} />}
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={() => setActiveStep((s) => s - 1)} disabled={activeStep === 0}>
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={handleSkip}>
            Skip
          </Button>
          {isLastStep ? (
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Calculate'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
```

**Step 2: Commit**

```bash
cd frontend && git add src/pages/Calculator.tsx && git commit -m "feat: add Calculator page with stepper"
```

---

### Task 19: Results page

**Files:**
- Modify: `frontend/src/pages/Results.tsx`
- Create: `frontend/src/components/results/EmissionsBreakdown.tsx`

**Step 1: Create EmissionsBreakdown component**

`frontend/src/components/results/EmissionsBreakdown.tsx`:
```tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PieChart } from '@mui/x-charts/PieChart';
import { CalculateResponse } from '../../types';

const COLORS: Record<string, string> = {
  housing: '#2e7d32',
  transportation: '#1565c0',
  flights: '#e65100',
};

const LABELS: Record<string, string> = {
  housing: 'Housing',
  transportation: 'Transportation',
  flights: 'Flights',
};

interface Props {
  result: CalculateResponse;
}

export default function EmissionsBreakdown({ result }: Props) {
  const data = Object.entries(result.breakdown)
    .filter(([, v]) => v !== undefined)
    .map(([key, value]) => ({
      id: key,
      label: LABELS[key],
      value: value as number,
      color: COLORS[key],
    }));

  return (
    <Box>
      <PieChart
        series={[{ data, highlightScope: { fade: 'global', highlight: 'item' }, valueFormatter: (v) => `${v.value.toFixed(2)} tCO₂e/yr` }]}
        height={280}
      />
      <Box sx={{ mt: 2 }}>
        {data.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
              <Typography>{item.label}</Typography>
            </Box>
            <Typography fontWeight={600}>{item.value.toFixed(2)} tCO₂e/yr</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
```

**Step 2: Implement Results page**

`frontend/src/pages/Results.tsx`:
```tsx
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EmissionsBreakdown from '../components/results/EmissionsBreakdown';
import { downloadPDF } from '../services/api';
import { CalculateResponse } from '../types';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as CalculateResponse | undefined;
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  if (!result) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h6" gutterBottom>No results yet.</Typography>
        <Button variant="contained" onClick={() => navigate('/calculator')}>Start Calculation</Button>
      </Box>
    );
  }

  async function handleDownload() {
    setPdfLoading(true);
    setPdfError(null);
    try {
      await downloadPDF(result!);
    } catch {
      setPdfError('Failed to generate PDF. Make sure the backend is running.');
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 4, borderRadius: 3, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
        Your Carbon Footprint
      </Typography>
      <Typography variant="h3" fontWeight={800} color="primary.main" textAlign="center" sx={{ mb: 4 }}>
        {result.total.toFixed(2)} tCO₂e/year
      </Typography>

      <EmissionsBreakdown result={result} />

      {pdfError && <Alert severity="error" sx={{ mt: 2 }}>{pdfError}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained" startIcon={<DownloadIcon />}
          onClick={handleDownload} disabled={pdfLoading}
        >
          {pdfLoading ? 'Generating...' : 'Download PDF'}
        </Button>
        <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={() => navigate('/calculator')}>
          Recalculate
        </Button>
      </Box>
    </Paper>
  );
}
```

**Step 3: Commit**

```bash
cd frontend && git add src/pages/Results.tsx src/components/results/EmissionsBreakdown.tsx \
  && git commit -m "feat: add Results page with breakdown chart and PDF download"
```

---

### Task 20: Tips page

**Files:**
- Modify: `frontend/src/pages/Tips.tsx`

**Step 1: Implement Tips page**

`frontend/src/pages/Tips.tsx`:
```tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FlightIcon from '@mui/icons-material/Flight';

const TIPS = [
  {
    icon: <HomeIcon fontSize="large" color="primary" />,
    category: 'Housing / Home Energy',
    items: [
      'Switch to LED lighting throughout your home.',
      'Improve insulation to reduce heating and cooling needs.',
      'Set your thermostat 2°C lower in winter and higher in summer.',
      'Use a smart power strip to eliminate phantom loads.',
      'Consider switching to a renewable energy plan with your utility provider.',
      'Replace old appliances with ENERGY STAR certified models.',
    ],
  },
  {
    icon: <DirectionsCarIcon fontSize="large" color="primary" />,
    category: 'Transportation',
    items: [
      'Walk or bike for trips under 5 km when possible.',
      'Use public transit instead of driving for commutes.',
      'Carpool with colleagues or neighbors.',
      'Keep your tires properly inflated — improves fuel efficiency by up to 3%.',
      'Combine errands into a single trip.',
      'Consider an electric or hybrid vehicle for your next purchase.',
    ],
  },
  {
    icon: <FlightIcon fontSize="large" color="primary" />,
    category: 'Flights',
    items: [
      'Choose direct flights over connecting ones — takeoff and landing produce the most emissions.',
      'Fly economy class — business class emits ~3x more per passenger.',
      'Offset your flight emissions through certified carbon offset programs.',
      'Replace short domestic flights with train or bus when feasible.',
      'Bundle multiple trips into fewer, longer journeys.',
    ],
  },
];

export default function Tips() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        How to Reduce Your Carbon Footprint
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Small changes in daily habits can significantly reduce your annual CO₂ emissions.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {TIPS.map((section) => (
          <Card key={section.category} variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                {section.icon}
                <Typography variant="h6" fontWeight={700}>{section.category}</Typography>
              </Box>
              <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                {section.items.map((tip) => (
                  <Box component="li" key={tip} sx={{ mb: 0.5 }}>
                    <Typography variant="body2">{tip}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
```

**Step 2: Commit**

```bash
cd frontend && git add src/pages/Tips.tsx && git commit -m "feat: add Tips page"
```

---

### Task 21: FAQ page

**Files:**
- Modify: `frontend/src/pages/FAQ.tsx`

**Step 1: Implement FAQ page with accordion structure**

`frontend/src/pages/FAQ.tsx`:
```tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Add questions and answers here when content is ready
const FAQ_ITEMS: { question: string; answer: string }[] = [];

export default function FAQ() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Frequently Asked Questions
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Find answers to common questions about the Carbon Calculator.
      </Typography>

      {FAQ_ITEMS.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          FAQ content coming soon.
        </Typography>
      ) : (
        FAQ_ITEMS.map((item, i) => (
          <Accordion key={i} sx={{ borderRadius: 2, mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>{item.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{item.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}
```

**Step 2: Run frontend dev to verify everything renders**

```bash
cd frontend && npm run dev
```
Navigate all pages — no console errors expected.

**Step 3: Commit**

```bash
cd frontend && git add src/pages/FAQ.tsx && git commit -m "feat: add FAQ page with accordion structure"
```

---

## Final Verification

**Step 1: Run all backend tests**

```bash
cd backend && npm test
```
Expected: All tests pass.

**Step 2: Start both servers**

Terminal 1:
```bash
cd backend && npm run dev
```

Terminal 2:
```bash
cd frontend && npm run dev
```

**Step 3: Smoke test the full flow**

1. Open http://localhost:5173
2. Click "Start Calculation"
3. Fill Housing with: Electricity, 500 kWh, 2 people → Next
4. Add a car: Gasoline, 200 km/week, 10 km/liter → Next
5. Add a flight: JFK → LHR, Economy, One-way → Calculate
6. Verify Results page shows total and breakdown
7. Click "Download PDF" — verify PDF downloads
8. Navigate to Tips and FAQ pages

**Step 4: Final commit**

```bash
git add . && git commit -m "feat: complete carbon calculator — frontend and backend"
```

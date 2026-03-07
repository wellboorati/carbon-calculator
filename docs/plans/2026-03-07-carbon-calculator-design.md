# Carbon Calculator — Design Document

**Date:** 2026-03-07
**Status:** Approved

---

## Overview

Individual carbon footprint calculator targeting the US market (with international support via ICAO for flights). No database — all calculations are stateless. Frontend and backend run separately on different ports.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | TypeScript, React, Vite, Material UI |
| Backend | TypeScript, Node.js, Express |
| Airport Data | OpenFlights static dataset (in-memory) |
| Emission Factors | EPA (housing, transportation), ICAO (flights) |
| PDF Export | Backend (pdfkit or puppeteer) |

- Frontend port: `5173`
- Backend port: `3001`

---

## Navigation

Fixed top navigation bar with links to:

- **Home** — landing page with project description and "Start Calculation" button
- **Calculator** — multi-step carbon calculator
- **Tips** — ways to reduce carbon emissions
- **FAQ** — structure ready, content to be filled later

---

## Pages

### Home

Landing page presenting the calculator purpose with a prominent "Start Calculation" CTA button that navigates to the Calculator page.

---

### Calculator (Stepper)

MUI `Stepper` component with 3 steps. Each step is **optional** — user can skip any step and only filled steps contribute to the result. A "Skip" button is present on every step.

#### Step 1 — Housing / Home Energy

Questions (intermediate level):
- Energy type: electricity, natural gas, heating oil, propane
- Monthly consumption with unit selection (kWh, m³, gallons)
- Number of people in the household (to normalize per-person emissions)

Emission factors: EPA Emissions Factors for Greenhouse Gas Inventories.

#### Step 2 — Transportation

User can add multiple transport modes. For each:

**Own vehicle (car or motorcycle):**
- Vehicle type: car or motorcycle
- Fuel type: gasoline or diesel
- Unit preference: liters or gallons
- Average distance traveled: value + period (per week / month / year)
- Fuel efficiency: km/liter or MPG

**Public transport (one or more):**
- Type: bus, metro, train, taxi/Uber
- Average distance traveled: value + period (per week / month / year)

Emission factors: EPA Emissions Factors for Greenhouse Gas Inventories.

#### Step 3 — Flights

User can add multiple flights. For each flight, two input modes:

**Mode A — Airport selection:**
- Departure airport (search by name or IATA code)
- Destination airport (search by name or IATA code)
- Layover airport (optional)
- Distance calculated via Haversine formula using OpenFlights coordinates

**Mode B — Manual distance:**
- Distance value + unit (km or miles)

**Common fields for both modes:**
- Travel class: Economy, Business, First
- Trip type: One-way or Round trip

Emission factors: ICAO Carbon Emissions Calculator methodology.

---

### Results

Displayed after the user completes/skips all steps:

- Total carbon footprint in **tons of CO₂ per year**
- Breakdown by category (only filled categories shown):
  - Visual chart (MUI — pie chart or bar chart)
  - Per-category values in tons of CO₂/year
- **"Download PDF"** button — generates and downloads a PDF summary via backend

---

### Tips

Static page with actionable suggestions to reduce carbon emissions across categories (housing, transportation, flights). Content written manually.

---

### FAQ

Static page with accordion-style Q&A layout. Structure ready, content to be added later.

---

## Backend API

### `POST /calculate`

Receives the filled form data (only filled sections), returns calculated emissions.

**Request body:**
```json
{
  "housing": { ... } | null,
  "transportation": [ ... ] | null,
  "flights": [ ... ] | null
}
```

**Response:**
```json
{
  "total": 8.4,
  "breakdown": {
    "housing": 2.1,
    "transportation": 3.5,
    "flights": 2.8
  },
  "unit": "tCO2e/year"
}
```

### `POST /generate-pdf`

Receives the calculation result, returns a downloadable PDF file.

### `GET /airports?q=<query>`

Searches airports by name or IATA code from the in-memory OpenFlights dataset.

**Response:**
```json
[
  { "iata": "GRU", "name": "São Paulo/Guarulhos International", "country": "Brazil", "lat": -23.432, "lon": -46.469 }
]
```

---

## Emission Factors Reference

### Housing (EPA)

| Energy Type | Factor |
|---|---|
| Electricity (US average) | 0.386 kg CO₂e/kWh |
| Natural Gas | 5.307 kg CO₂e/therm |
| Heating Oil | 10.16 kg CO₂e/gallon |
| Propane | 5.72 kg CO₂e/gallon |

### Transportation (EPA)

| Mode | Factor |
|---|---|
| Car (gasoline) | 8.887 kg CO₂e/gallon |
| Car (diesel) | 10.18 kg CO₂e/gallon |
| Motorcycle (gasoline) | 8.887 kg CO₂e/gallon |
| Bus | 0.089 kg CO₂e/passenger-km |
| Metro/Rail | 0.041 kg CO₂e/passenger-km |
| Taxi/Uber | 0.149 kg CO₂e/passenger-km |

### Flights (ICAO)

| Class | Multiplier |
|---|---|
| Economy | 1.0x |
| Business | 1.5x |
| First | 2.0x |

Base factor: ~0.255 kg CO₂e/passenger-km (includes radiative forcing multiplier of 2x).

---

## Airport Data

Source: [OpenFlights airports.dat](https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat)

- ~7,500 airports worldwide
- Loaded into backend memory at startup
- Fields used: IATA code, airport name, country, latitude, longitude
- Distance calculation: Haversine formula

---

## Project Structure

```
carbon-calculator/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Calculator.tsx
│   │   │   ├── Results.tsx
│   │   │   ├── Tips.tsx
│   │   │   └── FAQ.tsx
│   │   ├── services/      # API calls to backend
│   │   └── types/
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── calculator.ts
│   │   │   ├── airports.ts
│   │   │   └── pdf.ts
│   │   ├── data/
│   │   │   └── airports.dat
│   │   └── index.ts
└── docs/
    └── plans/
```

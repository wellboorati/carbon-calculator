# Carbon Calculator

A carbon footprint calculator that estimates annual CO₂ emissions based on home energy, transportation, flights, and diet. Generates a PDF report comparing the result with national and world averages.

## Architecture

```
carbon-calculator/
├── backend/    # Node.js + Express + GraphQL (Apollo Server)
├── frontend/   # React + Vite + Material UI
├── e2e/        # End-to-end tests with Playwright
└── docker-compose.yml
```

The frontend communicates with the backend exclusively via GraphQL. There is no database — all calculations are stateless.

---

## Prerequisites

- Node.js 18+
- npm

---

## Development mode

Run each service in a separate terminal:

```bash
# Backend → http://localhost:3002
cd backend
npm install
npm run dev

# Frontend → http://localhost:5173
cd frontend
npm install
npm run dev
```

Default environment variables are already configured for local development. If needed, create `.env` files:

```bash
# backend/.env
PORT=3002
FRONTEND_URL=http://localhost:5173

# frontend/.env
VITE_API_URL=http://localhost:3002
```

---

## Docker mode

```bash
docker compose up --build
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:8080  |
| Backend  | http://localhost:3003  |

In Docker, the frontend's nginx proxies `/graphql` requests to the backend container internally — the backend does not need to be accessed directly by the browser.

---

## Unit tests

### Backend (Jest)

```bash
cd backend
npm test
```

Covers the calculation services: housing, transportation, flights, and diet.

### Frontend (Vitest)

```bash
cd frontend
npm test
```

---

## End-to-end tests (Playwright)

E2E tests automatically start the backend and frontend before running.

```bash
cd e2e
npm install
npx playwright install chromium
npx playwright test
```

To view the report after the run:

```bash
npx playwright show-report
```

---

## Calculation categories

| Category       | Inputs                                                        |
|----------------|---------------------------------------------------------------|
| Home energy    | Electricity, natural gas, heating oil, propane                |
| Transportation | Personal vehicle (gasoline/diesel) and public transport       |
| Flights        | Search by airport or manual distance, cabin class             |
| Diet           | Weekly servings of beef, other meat, fish, and dairy          |

Results are expressed in tonnes of CO₂ per year and compared against country-level and world averages.

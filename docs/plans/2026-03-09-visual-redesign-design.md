# Visual Redesign — Warm Teal

**Date:** 2026-03-09
**Goal:** Replace the default MUI AI-looking design with a humanized, friendly aesthetic using a teal base palette, warm off-white backgrounds, and Plus Jakarta Sans typography.

---

## 1. Theme Foundation (`App.tsx`)

### Palette — Light Mode
| Token | Value | Usage |
|---|---|---|
| `primary.main` | `#0f4c5c` | Navbar text, primary buttons, active states |
| `primary.light` | `#1a6b7e` | Hover states |
| `secondary.main` | `#16a34a` | Emission numbers, result CTAs |
| `error.main` | `#c2410c` | Alerts, high-emission indicators |
| `background.default` | `#f7f5f0` | Page background (warm off-white) |
| `background.paper` | `#ffffff` | Cards, containers |
| `text.primary` | `#1c1917` | Body text (near-black, not pure black) |

### Palette — Dark Mode
| Token | Value |
|---|---|
| `primary.main` | `#2dd4bf` (light teal for contrast) |
| `secondary.main` | `#4ade80` |
| `background.default` | `#0f1117` |
| `background.paper` | `#1a1f2e` |
| `text.primary` | `#f1f5f9` |

### Typography
- **Family:** `Plus Jakarta Sans` (Google Fonts) — replaces Roboto
- Load via `<link>` in `index.html`
- Update `index.css`: `font-family: 'Plus Jakarta Sans', sans-serif`
- `MuiTypography` theme overrides:
  - `h3`–`h6`: `fontWeight: 700`, `letterSpacing: -0.5px`
  - All data numbers (emission totals, breakdowns): `fontVariantNumeric: tabular-nums`, `fontWeight: 800`

### Shape
- `shape.borderRadius: 10` (MUI default is 4)

---

## 2. Navbar (`components/Layout/Navbar.tsx`)

- Replace `<AppBar color="primary">` with `<AppBar color="transparent" elevation={0}>` + `sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}`
- Logo: `color: 'primary.main'`, `fontWeight: 800`
- Nav links: `color: 'text.secondary'`, active link `color: 'text.primary'` + `fontWeight: 700` + bottom border underline (`borderBottom: '2px solid'`)
- Dark/light toggle: `IconButton` with `color: 'text.secondary'`

---

## 3. Home (`pages/Home.tsx`)

- Remove `<NatureIcon sx={{ fontSize: 80 }} />` — replace with small inline emoji per category card (🏠 🚗 ✈️ 🥗)
- Increase top spacing and line-height on subtitle for more breathing room
- CTA button uses `primary.main` (teal) — no change needed if theme is set correctly
- Category cards: `border: '1px solid'`, `borderColor: 'divider'`, remove `elevation={2}` → `elevation={0}`; add emoji icon above title inside each card

---

## 4. Calculator (`pages/Calculator.tsx`)

- Wrapper: `Paper elevation={0}` + `sx={{ border: '1px solid', borderColor: 'divider' }}`
- Stepper: active step color inherits from `primary.main` (teal) automatically via theme
- Buttons: no change needed — inherit theme colors

---

## 5. Results (`pages/Results.tsx`)

- `AnimatedTotal`: `color: 'secondary.main'` (green `#16a34a`) — the single prominent use of green
- Wrapper: `Paper elevation={0}` + `sx={{ border: '1px solid', borderColor: 'divider' }}`
- Action buttons row: remove icon from "Copy result" and "Recalculate" — keep only Download icon

---

## Out of Scope

- No layout restructuring of Calculator steps (HousingStep, TransportationStep, etc.)
- No changes to backend
- No new pages or routes
- No animation changes beyond existing `useCountUp`

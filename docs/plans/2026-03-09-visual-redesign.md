# Visual Redesign — Warm Teal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the default MUI AI-looking design with a humanized Warm Teal aesthetic across the entire frontend.

**Architecture:** All changes are purely frontend — `App.tsx` (theme), `index.html` + `index.css` (font), and 4 component/page files. No backend or routing changes. Each task is independent and self-contained.

**Tech Stack:** React, MUI v5 (`createTheme`), Plus Jakarta Sans (Google Fonts), TypeScript

**Design doc:** `docs/plans/2026-03-09-visual-redesign-design.md`

---

### Task 1: Load Plus Jakarta Sans font

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/src/index.css`

**Step 1: Add Google Fonts link to `index.html`**

In `frontend/index.html`, inside `<head>`, add after the existing `<title>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap"
  rel="stylesheet"
/>
```

**Step 2: Update `index.css` body font**

Replace:
```css
body { font-family: Roboto, sans-serif; }
```
With:
```css
body { font-family: 'Plus Jakarta Sans', sans-serif; }
```

**Step 3: Start dev server and verify font loads**

```bash
cd frontend && npm run dev
```

Open browser → DevTools → Network tab → filter "jakarta" → confirm font file loads with 200.

**Step 4: Commit**

```bash
git add frontend/index.html frontend/src/index.css
git commit -m "feat: load Plus Jakarta Sans font"
```

---

### Task 2: Update MUI theme (palette + typography + shape)

**Files:**
- Modify: `frontend/src/App.tsx`

**Step 1: Replace the `createTheme` call**

Find the existing `createTheme` block (lines 20–26) and replace it entirely:

```tsx
const theme = useMemo(() => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#2dd4bf' : '#0f4c5c',
      light: mode === 'dark' ? '#5eead4' : '#1a6b7e',
    },
    secondary: {
      main: mode === 'dark' ? '#4ade80' : '#16a34a',
    },
    error: {
      main: '#c2410c',
    },
    background: {
      default: mode === 'dark' ? '#0f1117' : '#f7f5f0',
      paper:   mode === 'dark' ? '#1a1f2e' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#f1f5f9' : '#1c1917',
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    h3: { fontWeight: 700, letterSpacing: '-0.5px' },
    h4: { fontWeight: 700, letterSpacing: '-0.5px' },
    h5: { fontWeight: 700, letterSpacing: '-0.5px' },
    h6: { fontWeight: 700, letterSpacing: '-0.5px' },
  },
  shape: {
    borderRadius: 10,
  },
}), [mode]);
```

**Step 2: Verify in browser**

Run dev server. Navigate to `/` — background should be warm off-white `#f7f5f0`, navbar should be teal `#0f4c5c`, font should be Plus Jakarta Sans. Toggle dark mode — background should become `#0f1117`, primary should become teal light `#2dd4bf`.

**Step 3: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: update MUI theme to Warm Teal palette"
```

---

### Task 3: Redesign Navbar

**Files:**
- Modify: `frontend/src/components/Layout/Navbar.tsx`

**Step 1: Replace AppBar implementation**

Replace the entire return statement with:

```tsx
return (
  <AppBar
    position="sticky"
    elevation={0}
    sx={{
      bgcolor: 'background.paper',
      borderBottom: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Toolbar>
      <Typography
        variant="h6"
        sx={{ flexGrow: 1, fontWeight: 800, color: 'primary.main' }}
      >
        Carbon Calculator
      </Typography>
      {NAV_LINKS.map((link) => (
        <Button
          key={link.path}
          onClick={() => navigate(link.path)}
          sx={{
            color: location.pathname === link.path ? 'text.primary' : 'text.secondary',
            fontWeight: location.pathname === link.path ? 700 : 400,
            borderBottom: location.pathname === link.path ? '2px solid' : '2px solid transparent',
            borderColor: location.pathname === link.path ? 'primary.main' : 'transparent',
            borderRadius: 0,
            px: 1.5,
          }}
        >
          {link.label}
        </Button>
      ))}
      <Tooltip title={theme.palette.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
        <IconButton onClick={toggleColorMode} sx={{ ml: 1, color: 'text.secondary' }}>
          {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>
    </Toolbar>
  </AppBar>
);
```

**Step 2: Verify in browser**

Navbar should have white/off-white background with subtle bottom border, teal logo, text-colored nav links with underline on active route.

**Step 3: Commit**

```bash
git add frontend/src/components/Layout/Navbar.tsx
git commit -m "feat: redesign Navbar with border style and teal logo"
```

---

### Task 4: Redesign Home page

**Files:**
- Modify: `frontend/src/pages/Home.tsx`

**Step 1: Replace entire Home component**

```tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { emoji: '🏠', title: 'Home Energy',    desc: 'Electricity, gas, heating oil, propane' },
  { emoji: '🚗', title: 'Transportation', desc: 'Car, motorcycle, bus, metro, train' },
  { emoji: '✈️', title: 'Flights',        desc: 'Domestic and international air travel' },
  { emoji: '🥗', title: 'Diet',           desc: 'Beef, meat, fish, and dairy consumption' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', mt: 10, px: 2 }}>
      <Typography variant="h3" fontWeight={800} sx={{ mb: 2, letterSpacing: '-1px' }}>
        Carbon Footprint<br />Calculator
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 5, fontWeight: 400, lineHeight: 1.7 }}>
        Measure your individual carbon emissions from home energy,
        transportation, flights, and diet. Get your annual CO₂ estimate in minutes.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/calculator')}
        sx={{ px: 5, py: 1.5, fontSize: '1rem', fontWeight: 700, mb: 8 }}
      >
        Start Calculation
      </Button>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {CATEGORIES.map((card) => (
          <Box
            key={card.title}
            sx={{
              flex: '1 1 140px',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              p: 2.5,
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', mb: 1 }}>{card.emoji}</Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
              {card.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {card.desc}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
```

**Step 2: Verify in browser**

Home should have left-aligned two-line title, subtitle with good line-height, teal CTA button, and 4 cards with emoji icons, border style (no shadow), no giant leaf icon.

**Step 3: Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: redesign Home page layout and remove AI-looking elements"
```

---

### Task 5: Update Calculator wrapper

**Files:**
- Modify: `frontend/src/pages/Calculator.tsx`

**Step 1: Replace Paper wrapper style**

Find line:
```tsx
<Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
```
Replace with:
```tsx
<Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
```

**Step 2: Verify in browser**

Calculator page should have a flat bordered container instead of a shadowed card.

**Step 3: Commit**

```bash
git add frontend/src/pages/Calculator.tsx
git commit -m "feat: update Calculator wrapper to flat bordered style"
```

---

### Task 6: Update Results page

**Files:**
- Modify: `frontend/src/pages/Results.tsx`

**Step 1: Update `AnimatedTotal` color**

Find:
```tsx
<Typography variant="h3" fontWeight={800} color="primary.main" textAlign="center" sx={{ mb: 4 }}>
```
Replace with:
```tsx
<Typography variant="h3" fontWeight={800} color="secondary.main" textAlign="center" sx={{ mb: 4, fontVariantNumeric: 'tabular-nums' }}>
```

**Step 2: Replace Paper wrapper style**

Find:
```tsx
<Paper elevation={2} sx={{ p: 4, borderRadius: 3, maxWidth: 700, mx: 'auto' }}>
```
Replace with:
```tsx
<Paper elevation={0} sx={{ p: 4, maxWidth: 700, mx: 'auto', border: '1px solid', borderColor: 'divider' }}>
```

**Step 3: Simplify action buttons (remove icons from secondary actions)**

Find the action buttons block and replace:
```tsx
<Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
  <Button
    variant="contained" startIcon={<DownloadIcon />}
    onClick={handleDownload} disabled={pdfLoading}
  >
    {pdfLoading ? 'Generating...' : 'Download PDF'}
  </Button>
  <Button variant="outlined" onClick={handleShare}>
    Copy result
  </Button>
  <Button variant="outlined" onClick={() => navigate('/calculator')}>
    Recalculate
  </Button>
</Box>
```

Remove unused imports: `ShareIcon`, `RestartAltIcon` (keep `DownloadIcon`).

**Step 4: Update "no results" empty state**

Find `<CalculateIcon sx={{ fontSize: 80, color: 'text.disabled' }} />` and replace with a text-only empty state (remove the giant icon):
```tsx
<Box sx={{ textAlign: 'center', mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
  <Typography variant="h5" fontWeight={700}>No results yet</Typography>
  <Typography variant="body1" color="text.secondary" maxWidth={360}>
    Fill in your housing, transport, and flight information to calculate your personal carbon footprint.
  </Typography>
  <Button variant="contained" size="large" onClick={() => navigate('/calculator')} sx={{ mt: 1 }}>
    Start Calculation
  </Button>
</Box>
```

Also remove `CalculateIcon` from imports.

**Step 5: Verify in browser**

Results page: emission total in green (`secondary.main`), flat bordered container, simplified button row.

**Step 6: Commit**

```bash
git add frontend/src/pages/Results.tsx
git commit -m "feat: update Results page styles and emission total color"
```

import { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ColorModeContext } from './contexts/ColorModeContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Results from './pages/Results';
import Tips from './pages/Tips';
import FAQ from './pages/FAQ';

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const colorMode = useMemo(() => ({
    toggleColorMode: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
  }), []);

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

  return (
    <ColorModeContext.Provider value={colorMode}>
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
    </ColorModeContext.Provider>
  );
}

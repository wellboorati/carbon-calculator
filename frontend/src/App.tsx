import { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ColorModeContext } from './contexts/ColorModeContext';
import { createAppTheme } from './theme';
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

  const theme = useMemo(() => createAppTheme(mode), [mode]);

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

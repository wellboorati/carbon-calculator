import { createTheme } from '@mui/material/styles';

export function createAppTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      primary: {
        main:  mode === 'dark' ? '#2dd4bf' : '#0f4c5c',
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
  });
}

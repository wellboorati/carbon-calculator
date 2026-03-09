import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useState } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import EmissionsBreakdown from '../components/results/EmissionsBreakdown';
import CountryComparison from '../components/results/CountryComparison';
import EquivalenciesCard from '../components/results/EquivalenciesCard';
import RecommendationsCard from '../components/results/RecommendationsCard';
import { downloadPDF } from '../services/graphqlApi';
import { useCountUp } from '../hooks/useCountUp';
import { COUNTRY_AVERAGES, WORLD_AVERAGE } from '../data/countryAverages';
import type { CalculateResponse, CalculateRequest } from '../types';

function AnimatedTotal({ total }: { total: number }) {
  const value = useCountUp(total);
  return (
    <Typography variant="h3" fontWeight={800} color="secondary.main" textAlign="center" sx={{ mb: 4, fontVariantNumeric: 'tabular-nums' }}>
      {value.toFixed(2)} tCO₂e/year
    </Typography>
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as CalculateResponse | undefined;
  const inputs = location.state?.inputs as CalculateRequest | undefined;
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>('United States');

  if (!result) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>No results yet</Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={360}>
          Fill in your housing, transport, and flight information to calculate your personal carbon footprint.
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/calculator')} sx={{ mt: 1 }}>
          Start Calculation
        </Button>
      </Box>
    );
  }

  async function handleDownload() {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const country = COUNTRY_AVERAGES.find((c) => c.name === selectedCountry);
      await downloadPDF(result!, {
        countryName: selectedCountry ?? undefined,
        countryAvg: country?.avg,
        worldAvg: WORLD_AVERAGE,
      });
    } catch {
      setPdfError('Failed to generate PDF. Make sure the backend is running.');
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleShare() {
    const text =
      `My carbon footprint: ${result!.total.toFixed(2)} tCO₂e/year\n` +
      Object.entries(result!.breakdown)
        .filter(([, v]) => v != null)
        .map(([k, v]) => `  ${k.charAt(0).toUpperCase() + k.slice(1)}: ${(v as number).toFixed(2)} tCO₂e/yr`)
        .join('\n') +
      '\n\nCalculated with Carbon Calculator.';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // clipboard not available — silently ignore
    }
  }

  return (
    <Paper elevation={0} sx={{ p: 4, maxWidth: 700, mx: 'auto', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
        Your Carbon Footprint
      </Typography>
      <AnimatedTotal total={result.total} />

      <EmissionsBreakdown result={result} inputs={inputs} />
      <EquivalenciesCard total={result.total} />
      <CountryComparison userTotal={result.total} selected={selectedCountry} onSelect={setSelectedCountry} />
      <RecommendationsCard result={result} inputs={inputs} />

      {pdfError && <Alert severity="error" sx={{ mt: 2 }}>{pdfError}</Alert>}

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

      <Snackbar
        open={copied}
        autoHideDuration={2500}
        onClose={() => setCopied(false)}
        message="Result copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  );
}

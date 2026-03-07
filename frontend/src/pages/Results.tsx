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
import type { CalculateResponse } from '../types';

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

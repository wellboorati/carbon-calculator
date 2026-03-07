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
import type { HousingInput, TransportationInput, FlightInput } from '../types';
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

  const [flightsDraft, setFlightsDraft] = useState<FlightInput[]>([]);

  const isLastStep = activeStep === STEPS.length - 1;

  function handleNext() {
    if (activeStep === 0) setHousing(housingDraft.consumption > 0 ? housingDraft : null);
    if (activeStep === 1) setTransportation(transportDraft.length > 0 ? transportDraft : null);
    if (activeStep < STEPS.length - 1) {
      setActiveStep((s) => s + 1);
    }
  }

  async function handleSkip() {
    if (activeStep === 0) setHousing(null);
    if (activeStep === 1) setTransportation(null);
    if (isLastStep) {
      setLoading(true);
      setError(null);
      try {
        const result = await calculate({
          housing,
          transportation,
          flights: null,
        });
        navigate('/results', { state: { result } });
      } catch {
        setError('Failed to calculate. Make sure the backend is running on port 3001.');
      } finally {
        setLoading(false);
      }
      return;
    }
    setActiveStep((s) => s + 1);
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
      setError('Failed to calculate. Make sure the backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  }

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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HousingStep from '../components/calculator/steps/HousingStep';
import TransportationStep from '../components/calculator/steps/TransportationStep';
import FlightsStep from '../components/calculator/steps/FlightsStep';
import DietStep from '../components/calculator/steps/DietStep';
import type { HousingInput, TransportationInput, FlightInput, DietInput } from '../types';
import { calculate, extractErrorMessage } from '../services/graphqlApi';
import { useDraft } from '../hooks/useDraft';

const STEPS = ['Housing / Home Energy', 'Transportation', 'Flights', 'Diet'];

export default function Calculator() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    housingDraft, setHousingDraft,
    transportDraft, setTransportDraft,
    flightsDraft, setFlightsDraft,
    dietDraft, setDietDraft,
    hasDraft,
    clearDraft,
  } = useDraft();

  const [housing, setHousing] = useState<HousingInput[] | null>(null);
  const [transportation, setTransportation] = useState<TransportationInput[] | null>(null);
  const [flights, setFlights] = useState<FlightInput[] | null>(null);

  const isLastStep = activeStep === STEPS.length - 1;

  function handleNext() {
    setError(null);
    if (activeStep === 0) { const filled = housingDraft.filter((e) => e.consumption > 0); setHousing(filled.length > 0 ? filled : null); }
    if (activeStep === 1) { const filled = transportDraft.filter((e) => e.distance > 0); setTransportation(filled.length > 0 ? filled : null); }
    if (activeStep === 2) setFlights(flightsDraft.length > 0 ? flightsDraft : null);
    if (activeStep < STEPS.length - 1) {
      setActiveStep((s) => s + 1);
    }
  }

  async function handleSkip() {
    const skippedHousing = activeStep === 0 ? null : housing;
    const skippedTransport = activeStep === 1 ? null : transportation;
    const skippedFlights = activeStep === 2 ? null : flights;
    if (activeStep === 0) setHousing(null);
    if (activeStep === 1) setTransportation(null);
    if (activeStep === 2) setFlights(null);
    if (isLastStep) {
      const finalDiet: DietInput | null = null;
      if (skippedHousing === null && skippedTransport === null && skippedFlights === null) {
        setError('Please fill in at least one section — housing, transportation, or flights — before calculating.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await calculate({ housing: skippedHousing, transportation: skippedTransport, flights: skippedFlights, diet: finalDiet });
        clearDraft();
        navigate('/results', { state: { result, inputs: { housing: skippedHousing, transportation: skippedTransport, flights: skippedFlights, diet: finalDiet } } });
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }
    setError(null);
    setActiveStep((s) => s + 1);
  }

  async function handleSubmit() {
    const finalDiet: DietInput = dietDraft;
    const dietIsEmpty = Object.values(finalDiet).every((v) => v === 0);
    if (housing === null && transportation === null && flights === null && dietIsEmpty) {
      setError('Please fill in at least one section before calculating.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await calculate({ housing, transportation, flights, diet: finalDiet });
      clearDraft();
      navigate('/results', { state: { result, inputs: { housing, transportation, flights, diet: finalDiet } } });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleClearDraft() {
    clearDraft();
    setActiveStep(0);
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 3 }}>
        <CircularProgress size={64} />
        <Typography variant="h6" color="text.secondary">Calculating your carbon footprint…</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Stepper activeStep={activeStep} sx={{ flex: 1 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {hasDraft && (
          <Tooltip title="Clear saved progress and start over">
            <Button
              size="small"
              color="inherit"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleClearDraft}
              sx={{ ml: 2, color: 'text.secondary', flexShrink: 0 }}
            >
              Clear
            </Button>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ minHeight: 300 }}>
        {activeStep === 0 && <HousingStep value={housingDraft} onChange={setHousingDraft} />}
        {activeStep === 1 && <TransportationStep value={transportDraft} onChange={setTransportDraft} />}
        {activeStep === 2 && <FlightsStep value={flightsDraft} onChange={setFlightsDraft} />}
        {activeStep === 3 && <DietStep value={dietDraft} onChange={setDietDraft} />}
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={() => { setError(null); setActiveStep((s) => s - 1); }} disabled={activeStep === 0}>
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={handleSkip}>
            Skip
          </Button>
          {isLastStep ? (
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              Calculate
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

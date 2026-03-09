import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { FlightInput, AirportFlightInput, ManualFlightInput, Airport } from '../../../types';
import { searchAirports } from '../../../services/graphqlApi';

interface Props {
  value: FlightInput[];
  onChange: (v: FlightInput[]) => void;
}

const DEFAULT_AIRPORT_FLIGHT: AirportFlightInput = {
  mode: 'airports', departureIata: '', destinationIata: '',
  travelClass: 'economy', tripType: 'oneway',
};

const DEFAULT_MANUAL_FLIGHT: ManualFlightInput = {
  mode: 'manual', distance: 0, distanceUnit: 'km',
  travelClass: 'economy', tripType: 'oneway',
};

function AirportSelect({ label, onChange }: { label: string; value: string; onChange: (iata: string) => void }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(query: string) {
    if (query.length < 2) { setOptions([]); return; }
    setLoading(true);
    try {
      const results = await searchAirports(query);
      setOptions(results);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Autocomplete
      fullWidth
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      getOptionLabel={(o) => `${o.iata} — ${o.name} (${o.country})`}
      filterOptions={(x) => x}
      onInputChange={(_, v, reason) => { if (reason === 'input') handleSearch(v); }}
      onChange={(_, o) => onChange(o ? o.iata : '')}
      loading={loading}
      noOptionsText="Type at least 2 characters to search"
      renderInput={(params) => (
        <TextField {...params} label={label}
          InputProps={{ ...params.InputProps, endAdornment: (<>{loading ? <CircularProgress size={16} /> : null}{params.InputProps.endAdornment}</>) }}
        />
      )}
    />
  );
}

export default function FlightsStep({ value, onChange }: Props) {
  function add(mode: 'airports' | 'manual') {
    onChange([...value, mode === 'airports' ? { ...DEFAULT_AIRPORT_FLIGHT } : { ...DEFAULT_MANUAL_FLIGHT }]);
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function update(i: number, updated: FlightInput) {
    onChange(value.map((item, idx) => (idx === i ? updated : item)));
  }

  function toggleMode(i: number, mode: 'airports' | 'manual') {
    onChange(value.map((item, idx) =>
      idx === i ? (mode === 'airports' ? { ...DEFAULT_AIRPORT_FLIGHT } : { ...DEFAULT_MANUAL_FLIGHT }) : item
    ));
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="h6">Flights</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Add each flight you took in the past year. Search by airport or enter the distance manually.
        </Typography>
      </Box>

      {value.map((item, i) => (
        <Card key={i} variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <ToggleButtonGroup
                exclusive size="small" value={item.mode}
                onChange={(_, v) => v && toggleMode(i, v)}
              >
                <ToggleButton value="airports">Select Airports</ToggleButton>
                <ToggleButton value="manual">Manual Distance</ToggleButton>
              </ToggleButtonGroup>
              <IconButton size="small" onClick={() => remove(i)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>

            {item.mode === 'airports' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AirportSelect label="Departure Airport"
                  value={(item as AirportFlightInput).departureIata}
                  onChange={(iata) => update(i, { ...item, departureIata: iata } as AirportFlightInput)} />
                <AirportSelect label="Destination Airport"
                  value={(item as AirportFlightInput).destinationIata}
                  onChange={(iata) => update(i, { ...item, destinationIata: iata } as AirportFlightInput)} />
                <AirportSelect label="Layover Airport (optional)"
                  value={(item as AirportFlightInput).layoverIata ?? ''}
                  onChange={(iata) => update(i, { ...item, layoverIata: iata || undefined } as AirportFlightInput)} />
              </Box>
            )}

            {item.mode === 'manual' && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField fullWidth label="Distance" type="number"
                  value={(item as ManualFlightInput).distance || ''}
                  onChange={(e) => update(i, { ...item, distance: parseFloat(e.target.value) || 0 } as ManualFlightInput)}
                  slotProps={{ htmlInput: { min: 0 } }}
                  helperText="e.g. London–NY ≈ 5,500 km; Paris–Rome ≈ 1,100 km" />
                <FormControl sx={{ minWidth: 100 }}>
                  <InputLabel>Unit</InputLabel>
                  <Select value={(item as ManualFlightInput).distanceUnit} label="Unit"
                    onChange={(e) => update(i, { ...item, distanceUnit: e.target.value as 'km' | 'miles' } as ManualFlightInput)}>
                    <MenuItem value="km">km</MenuItem>
                    <MenuItem value="miles">miles</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Travel Class</InputLabel>
                <Select value={item.travelClass} label="Travel Class"
                  onChange={(e) => update(i, { ...item, travelClass: e.target.value as FlightInput['travelClass'] })}>
                  <MenuItem value="economy">Economy</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                  <MenuItem value="first">First Class</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Trip Type</InputLabel>
                <Select value={item.tripType} label="Trip Type"
                  onChange={(e) => update(i, { ...item, tripType: e.target.value as FlightInput['tripType'] })}>
                  <MenuItem value="oneway">One Way</MenuItem>
                  <MenuItem value="roundtrip">Round Trip</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => add('airports')}>
          Add Flight (Airports)
        </Button>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => add('manual')}>
          Add Flight (Manual Distance)
        </Button>
      </Box>
    </Box>
  );
}

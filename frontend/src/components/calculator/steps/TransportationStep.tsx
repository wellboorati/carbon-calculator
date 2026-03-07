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
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { TransportationInput, VehicleInput, PublicTransportInput } from '../../../types';

interface Props {
  value: TransportationInput[];
  onChange: (v: TransportationInput[]) => void;
}

const DEFAULT_VEHICLE: VehicleInput = {
  kind: 'own', vehicleType: 'car', fuelType: 'gasoline',
  distance: 0, distancePeriod: 'week', distanceUnit: 'km',
  efficiency: 0, efficiencyUnit: 'km_per_liter',
};

const DEFAULT_PUBLIC: PublicTransportInput = {
  kind: 'public', transportType: 'bus',
  distance: 0, distancePeriod: 'week', distanceUnit: 'km',
};

export default function TransportationStep({ value, onChange }: Props) {
  function add(kind: 'own' | 'public') {
    onChange([...value, kind === 'own' ? { ...DEFAULT_VEHICLE } : { ...DEFAULT_PUBLIC }]);
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function update(i: number, updated: TransportationInput) {
    onChange(value.map((item, idx) => (idx === i ? updated : item)));
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Transportation</Typography>

      {value.map((item, i) => (
        <Card key={i} variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {item.kind === 'own' ? 'Own Vehicle' : 'Public Transport'} #{i + 1}
              </Typography>
              <IconButton size="small" onClick={() => remove(i)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>

            {item.kind === 'own' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Vehicle Type</InputLabel>
                    <Select value={item.vehicleType} label="Vehicle Type"
                      onChange={(e) => update(i, { ...item, vehicleType: e.target.value as VehicleInput['vehicleType'] })}>
                      <MenuItem value="car">Car</MenuItem>
                      <MenuItem value="motorcycle">Motorcycle</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Fuel Type</InputLabel>
                    <Select value={item.fuelType} label="Fuel Type"
                      onChange={(e) => update(i, { ...item, fuelType: e.target.value as VehicleInput['fuelType'] })}>
                      <MenuItem value="gasoline">Gasoline</MenuItem>
                      <MenuItem value="diesel">Diesel</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField fullWidth label="Distance" type="number" value={item.distance || ''}
                    onChange={(e) => update(i, { ...item, distance: parseFloat(e.target.value) || 0 })}
                    inputProps={{ min: 0 }} />
                  <FormControl sx={{ minWidth: 100 }}>
                    <InputLabel>Unit</InputLabel>
                    <Select value={item.distanceUnit} label="Unit"
                      onChange={(e) => update(i, { ...item, distanceUnit: e.target.value as 'km' | 'miles' })}>
                      <MenuItem value="km">km</MenuItem>
                      <MenuItem value="miles">miles</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Per</InputLabel>
                    <Select value={item.distancePeriod} label="Per"
                      onChange={(e) => update(i, { ...item, distancePeriod: e.target.value as VehicleInput['distancePeriod'] })}>
                      <MenuItem value="week">Week</MenuItem>
                      <MenuItem value="month">Month</MenuItem>
                      <MenuItem value="year">Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField fullWidth label="Fuel Efficiency" type="number" value={item.efficiency || ''}
                    onChange={(e) => update(i, { ...item, efficiency: parseFloat(e.target.value) || 0 })}
                    inputProps={{ min: 0 }} />
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Efficiency Unit</InputLabel>
                    <Select value={item.efficiencyUnit} label="Efficiency Unit"
                      onChange={(e) => update(i, { ...item, efficiencyUnit: e.target.value as VehicleInput['efficiencyUnit'] })}>
                      <MenuItem value="km_per_liter">km / liter</MenuItem>
                      <MenuItem value="mpg">MPG</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            )}

            {item.kind === 'public' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Transport Type</InputLabel>
                  <Select value={item.transportType} label="Transport Type"
                    onChange={(e) => update(i, { ...item, transportType: e.target.value as PublicTransportInput['transportType'] })}>
                    <MenuItem value="bus">Bus</MenuItem>
                    <MenuItem value="metro">Metro</MenuItem>
                    <MenuItem value="train">Train</MenuItem>
                    <MenuItem value="taxi">Taxi / Uber</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField fullWidth label="Distance" type="number" value={item.distance || ''}
                    onChange={(e) => update(i, { ...item, distance: parseFloat(e.target.value) || 0 })}
                    inputProps={{ min: 0 }} />
                  <FormControl sx={{ minWidth: 100 }}>
                    <InputLabel>Unit</InputLabel>
                    <Select value={item.distanceUnit} label="Unit"
                      onChange={(e) => update(i, { ...item, distanceUnit: e.target.value as 'km' | 'miles' })}>
                      <MenuItem value="km">km</MenuItem>
                      <MenuItem value="miles">miles</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Per</InputLabel>
                    <Select value={item.distancePeriod} label="Per"
                      onChange={(e) => update(i, { ...item, distancePeriod: e.target.value as PublicTransportInput['distancePeriod'] })}>
                      <MenuItem value="week">Week</MenuItem>
                      <MenuItem value="month">Month</MenuItem>
                      <MenuItem value="year">Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => add('own')}>
          Add Own Vehicle
        </Button>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => add('public')}>
          Add Public Transport
        </Button>
      </Box>
    </Box>
  );
}

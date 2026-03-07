import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import type { HousingInput } from '../../../types';

interface Props {
  value: HousingInput;
  onChange: (v: HousingInput) => void;
}

const ENERGY_UNITS: Record<HousingInput['energyType'], HousingInput['unit'][]> = {
  electricity: ['kWh'],
  naturalGas: ['m3', 'therms'],
  heatingOil: ['gallons'],
  propane: ['gallons'],
};

export default function HousingStep({ value, onChange }: Props) {
  const availableUnits = ENERGY_UNITS[value.energyType];

  function handleEnergyTypeChange(energyType: HousingInput['energyType']) {
    const unit = ENERGY_UNITS[energyType][0];
    onChange({ ...value, energyType, unit });
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6">Housing / Home Energy</Typography>

      <FormControl fullWidth>
        <InputLabel>Energy Type</InputLabel>
        <Select
          value={value.energyType}
          label="Energy Type"
          onChange={(e) => handleEnergyTypeChange(e.target.value as HousingInput['energyType'])}
        >
          <MenuItem value="electricity">Electricity</MenuItem>
          <MenuItem value="naturalGas">Natural Gas</MenuItem>
          <MenuItem value="heatingOil">Heating Oil</MenuItem>
          <MenuItem value="propane">Propane</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Monthly Consumption"
          type="number"
          value={value.consumption || ''}
          onChange={(e) => onChange({ ...value, consumption: parseFloat(e.target.value) || 0 })}
          inputProps={{ min: 0 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Unit</InputLabel>
          <Select
            value={value.unit}
            label="Unit"
            onChange={(e) => onChange({ ...value, unit: e.target.value as HousingInput['unit'] })}
          >
            {availableUnits.map((u) => (
              <MenuItem key={u} value={u}>{u}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TextField
        fullWidth
        label="Number of people in household"
        type="number"
        value={value.people || ''}
        onChange={(e) => onChange({ ...value, people: parseInt(e.target.value) || 1 })}
        inputProps={{ min: 1 }}
        helperText="Emissions will be divided by the number of people"
      />
    </Box>
  );
}

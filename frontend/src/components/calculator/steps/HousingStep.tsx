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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { HousingInput } from '../../../types';
import { ENERGY_LABELS } from '../../../constants/categories';

interface Props {
  value: HousingInput[];
  onChange: (v: HousingInput[]) => void;
}

const ENERGY_UNITS: Record<HousingInput['energyType'], HousingInput['unit'][]> = {
  electricity: ['kWh'],
  naturalGas: ['m3', 'therms'],
  heatingOil: ['gallons'],
  propane: ['gallons'],
};

const DEFAULT_ENTRY = (people: number): HousingInput => ({
  energyType: 'electricity', consumption: 0, unit: 'kWh', people,
});

export default function HousingStep({ value, onChange }: Props) {
  const people = value[0]?.people ?? 1;

  function handlePeopleChange(n: number) {
    onChange(value.map((e) => ({ ...e, people: n })));
  }

  function handleAdd() {
    onChange([...value, DEFAULT_ENTRY(people)]);
  }

  function handleRemove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function handleUpdate(i: number, updated: HousingInput) {
    onChange(value.map((item, idx) => (idx === i ? updated : item)));
  }

  function handleEnergyTypeChange(i: number, energyType: HousingInput['energyType']) {
    const unit = ENERGY_UNITS[energyType][0];
    handleUpdate(i, { ...value[i], energyType, unit });
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h6">Housing / Home Energy</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Enter your monthly energy usage. You can find these values on your utility bills.
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="Number of people in household"
        type="number"
        value={people}
        onChange={(e) => handlePeopleChange(parseInt(e.target.value) || 1)}
        slotProps={{ htmlInput: { min: 1 } }}
        helperText="Emissions will be divided by the number of people"
      />

      {value.map((item, i) => (
        <Card key={i} variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2">{ENERGY_LABELS[item.energyType]}</Typography>
              <IconButton size="small" onClick={() => handleRemove(i)} color="error" disabled={value.length === 1}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Energy Type</InputLabel>
                <Select
                  value={item.energyType}
                  label="Energy Type"
                  onChange={(e) => handleEnergyTypeChange(i, e.target.value as HousingInput['energyType'])}
                >
                  <MenuItem value="electricity">Electricity</MenuItem>
                  <MenuItem value="naturalGas">Natural Gas</MenuItem>
                  <MenuItem value="heatingOil">Heating Oil</MenuItem>
                  <MenuItem value="propane">Propane</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Monthly Consumption"
                type="number"
                value={item.consumption || ''}
                onChange={(e) => handleUpdate(i, { ...item, consumption: parseFloat(e.target.value) || 0 })}
                slotProps={{ htmlInput: { min: 0 } }}
                helperText="From your monthly utility bill"
              />

              <FormControl sx={{ minWidth: 110 }}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={item.unit}
                  label="Unit"
                  onChange={(e) => handleUpdate(i, { ...item, unit: e.target.value as HousingInput['unit'] })}
                >
                  {ENERGY_UNITS[item.energyType].map((u) => (
                    <MenuItem key={u} value={u}>{u}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAdd}>
        Add Energy Source
      </Button>
    </Box>
  );
}

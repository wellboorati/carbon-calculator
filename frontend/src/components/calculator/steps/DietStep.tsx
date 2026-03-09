import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import type { DietInput } from '../../../types';

interface Props {
  value: DietInput;
  onChange: (v: DietInput) => void;
}

const ITEMS: { key: keyof DietInput; label: string; description: string; max: number }[] = [
  {
    key: 'beefServingsPerWeek',
    label: 'Beef / Lamb',
    description: 'Servings per week (~150 g each)',
    max: 21,
  },
  {
    key: 'otherMeatServingsPerWeek',
    label: 'Other Meat (pork, chicken, etc.)',
    description: 'Servings per week (~150 g each)',
    max: 21,
  },
  {
    key: 'fishServingsPerWeek',
    label: 'Fish / Seafood',
    description: 'Servings per week (~150 g each)',
    max: 21,
  },
  {
    key: 'dairyServingsPerWeek',
    label: 'Dairy (milk, cheese, yoghurt)',
    description: 'Servings per week (~200 g / 200 ml each)',
    max: 35,
  },
];

export default function DietStep({ value, onChange }: Props) {
  function handleChange(key: keyof DietInput, v: number) {
    onChange({ ...value, [key]: v });
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Diet</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Adjust the sliders to reflect how many servings of each food type you consume per week.
        A plant-based baseline of 0.5 tCO₂e/year is always included.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {ITEMS.map(({ key, label, description, max }) => (
          <Box key={key}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Typography variant="body1" fontWeight={500}>{label}</Typography>
              <Typography variant="body2" color="text.secondary">
                {value[key]} {value[key] === 1 ? 'serving' : 'servings'}/week
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">{description}</Typography>
            <Slider
              value={value[key]}
              onChange={(_, v) => handleChange(key, v as number)}
              min={0}
              max={max}
              step={1}
              marks={[
                { value: 0, label: '0' },
                { value: Math.round(max / 2), label: String(Math.round(max / 2)) },
                { value: max, label: String(max) },
              ]}
              sx={{ mt: 1 }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

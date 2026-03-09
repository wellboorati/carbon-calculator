import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { COUNTRY_AVERAGES, WORLD_AVERAGE } from '../../data/countryAverages';

interface Props {
  userTotal: number;
  selected: string | null;
  onSelect: (value: string | null) => void;
}

function ComparisonBar({ label, value, max, color, userValue }: {
  label: string;
  value: number;
  max: number;
  color: string;
  userValue: number;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const isUser = label === 'Your footprint';
  const diff = userValue - value;
  const diffLabel = isUser
    ? null
    : diff < 0
      ? `${Math.abs(diff).toFixed(1)} tCO₂e below`
      : `${diff.toFixed(1)} tCO₂e above`;

  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" fontWeight={isUser ? 700 : 400}>{label}</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {diffLabel && (
            <Typography variant="caption" color={diff < 0 ? 'success.main' : 'error.main'}>
              {diffLabel}
            </Typography>
          )}
          <Typography variant="body2" fontWeight={isUser ? 700 : 400}>{value.toFixed(1)} tCO₂e/yr</Typography>
        </Box>
      </Box>
      <Box sx={{ height: 10, bgcolor: 'grey.100', borderRadius: 5, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: color, borderRadius: 5, transition: 'width 0.4s ease' }} />
      </Box>
    </Box>
  );
}

export default function CountryComparison({ userTotal, selected, onSelect }: Props) {
  const country = COUNTRY_AVERAGES.find((c) => c.name === selected);
  const countryAvg = country?.avg ?? null;
  const max = Math.max(userTotal, countryAvg ?? 0, WORLD_AVERAGE) * 1.15;

  const userColor = userTotal <= WORLD_AVERAGE ? '#2e7d32' : userTotal <= (countryAvg ?? Infinity) ? '#f57c00' : '#c62828';

  return (
    <Box sx={{ mt: 3, p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>How do you compare?</Typography>
        <Tooltip title="Country averages represent total per-capita emissions across all sectors. This calculator covers housing, transportation, flights, and diet — national averages also include industry, government, and agriculture beyond food, so your result may still be lower than the full average." arrow>
          <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'pointer' }} />
        </Tooltip>
      </Box>

      <Autocomplete
        size="small"
        options={COUNTRY_AVERAGES.map((c) => c.name)}
        value={selected}
        onChange={(_, v) => onSelect(v)}
        renderInput={(params) => <TextField {...params} label="Select your country" />}
        sx={{ mb: 2.5 }}
      />

      <ComparisonBar label="Your footprint" value={userTotal} max={max} color={userColor} userValue={userTotal} />
      {countryAvg !== null && (
        <ComparisonBar label={`${selected} average`} value={countryAvg} max={max} color="#1565c0" userValue={userTotal} />
      )}
      <ComparisonBar label="World average" value={WORLD_AVERAGE} max={max} color="#757575" userValue={userTotal} />
    </Box>
  );
}

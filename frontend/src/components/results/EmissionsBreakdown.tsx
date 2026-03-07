import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PieChart } from '@mui/x-charts/PieChart';
import { CalculateResponse } from '../../types';

const COLORS: Record<string, string> = {
  housing: '#2e7d32',
  transportation: '#1565c0',
  flights: '#e65100',
};

const LABELS: Record<string, string> = {
  housing: 'Housing',
  transportation: 'Transportation',
  flights: 'Flights',
};

interface Props {
  result: CalculateResponse;
}

export default function EmissionsBreakdown({ result }: Props) {
  const data = Object.entries(result.breakdown)
    .filter(([, v]) => v !== undefined)
    .map(([key, value]) => ({
      id: key,
      label: LABELS[key],
      value: value as number,
      color: COLORS[key],
    }));

  return (
    <Box>
      <PieChart
        series={[{
          data,
          highlightScope: { fade: 'global', highlight: 'item' },
          valueFormatter: (v) => `${v.value.toFixed(2)} tCO₂e/yr`,
        }]}
        height={280}
      />
      <Box sx={{ mt: 2 }}>
        {data.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
              <Typography>{item.label}</Typography>
            </Box>
            <Typography fontWeight={600}>{item.value.toFixed(2)} tCO₂e/yr</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

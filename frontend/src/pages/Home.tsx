import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { emoji: '🏠', title: 'Home Energy',    desc: 'Electricity, gas, heating oil, propane' },
  { emoji: '🚗', title: 'Transportation', desc: 'Car, motorcycle, bus, metro, train' },
  { emoji: '✈️', title: 'Flights',        desc: 'Domestic and international air travel' },
  { emoji: '🥗', title: 'Diet',           desc: 'Beef, meat, fish, and dairy consumption' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', mt: 10, px: 2 }}>
      <Typography variant="h3" fontWeight={800} sx={{ mb: 2, letterSpacing: '-1px' }}>
        Carbon Footprint<br />Calculator
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 5, fontWeight: 400, lineHeight: 1.7 }}>
        Measure your individual carbon emissions from home energy,
        transportation, flights, and diet. Get your annual CO₂ estimate in minutes.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/calculator')}
        sx={{ px: 5, py: 1.5, fontSize: '1rem', fontWeight: 700, mb: 8 }}
      >
        Start Calculation
      </Button>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {CATEGORIES.map((card) => (
          <Box
            key={card.title}
            sx={{
              flex: '1 1 140px',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              p: 2.5,
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', mb: 1 }}>{card.emoji}</Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
              {card.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {card.desc}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

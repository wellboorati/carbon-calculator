import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import NatureIcon from '@mui/icons-material/Nature';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <NatureIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Carbon Footprint Calculator
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
        Measure your individual carbon emissions from home energy, transportation, and flights.
        Get your annual CO₂ estimate in minutes.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/calculator')}
        sx={{ px: 5, py: 1.5, fontSize: '1.1rem', borderRadius: 3 }}
      >
        Start Calculation
      </Button>

      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 8, flexWrap: 'wrap' }}>
        {[
          { title: 'Home Energy', desc: 'Electricity, gas, heating oil, propane' },
          { title: 'Transportation', desc: 'Car, motorcycle, bus, metro, train' },
          { title: 'Flights', desc: 'Domestic and international air travel' },
        ].map((card) => (
          <Paper key={card.title} elevation={2} sx={{ p: 3, width: 200, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight={700}>{card.title}</Typography>
            <Typography variant="body2" color="text.secondary">{card.desc}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

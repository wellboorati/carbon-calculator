import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FlightIcon from '@mui/icons-material/Flight';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const TIPS = [
  {
    icon: <HomeIcon fontSize="large" color="primary" />,
    category: 'Housing / Home Energy',
    items: [
      'Switch to LED lighting throughout your home.',
      'Improve insulation to reduce heating and cooling needs.',
      'Set your thermostat 2°C lower in winter and higher in summer.',
      'Use a smart power strip to eliminate phantom loads.',
      'Consider switching to a renewable energy plan with your utility provider.',
      'Replace old appliances with ENERGY STAR certified models.',
    ],
  },
  {
    icon: <DirectionsCarIcon fontSize="large" color="primary" />,
    category: 'Transportation',
    items: [
      'Walk or bike for trips under 5 km when possible.',
      'Use public transit instead of driving for commutes.',
      'Carpool with colleagues or neighbors.',
      'Keep your tires properly inflated — improves fuel efficiency by up to 3%.',
      'Combine errands into a single trip.',
      'Consider an electric or hybrid vehicle for your next purchase.',
    ],
  },
  {
    icon: <FlightIcon fontSize="large" color="primary" />,
    category: 'Flights',
    items: [
      'Choose direct flights over connecting ones — takeoff and landing produce the most emissions.',
      'Fly economy class — business class emits ~3x more per passenger.',
      'Offset your flight emissions through certified carbon offset programs.',
      'Replace short domestic flights with train or bus when feasible.',
      'Bundle multiple trips into fewer, longer journeys.',
    ],
  },
  {
    icon: <RestaurantIcon fontSize="large" color="primary" />,
    category: 'Diet',
    items: [
      'Reduce beef and lamb consumption — they generate up to 20× more emissions than plant proteins.',
      'Try one or two plant-based days per week to meaningfully cut your dietary footprint.',
      'Swap beef for chicken or fish when eating meat — their emissions are 4–5× lower per serving.',
      'Choose locally sourced and seasonal produce to reduce transport and cold-storage emissions.',
      'Swap dairy milk for oat or soy milk — plant-based alternatives emit up to 70% less CO₂.',
      'Reduce food waste: roughly a third of all food produced globally is wasted, with a large carbon cost.',
    ],
  },
];

export default function Tips() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        How to Reduce Your Carbon Footprint
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Small changes in daily habits can significantly reduce your annual CO₂ emissions.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {TIPS.map((section) => (
          <Card key={section.category} variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                {section.icon}
                <Typography variant="h6" fontWeight={700}>{section.category}</Typography>
              </Box>
              <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                {section.items.map((tip) => (
                  <Box component="li" key={tip} sx={{ mb: 0.5 }}>
                    <Typography variant="body2">{tip}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

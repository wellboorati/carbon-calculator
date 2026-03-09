import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FlightIcon from '@mui/icons-material/Flight';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import type { CalculateResponse, CalculateRequest } from '../../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../constants/categories';
import { HOUSING_TIPS, TRANSPORT_TIPS, FLIGHTS_TIPS, DIET_TIPS } from '../../data/recommendations';

interface Props {
  result: CalculateResponse;
  inputs?: CalculateRequest;
}

const ECONOMY_CLASS_TIP = 'Fly economy class; business class has a 3× larger per-seat footprint.';

export default function RecommendationsCard({ result, inputs }: Props) {
  const breakdown = result.breakdown;

  const allFlightsEconomy = inputs?.flights != null &&
    inputs.flights.length > 0 &&
    inputs.flights.every((f) => f.travelClass === 'economy');

  const flightsTips = allFlightsEconomy
    ? FLIGHTS_TIPS.filter((t) => t !== ECONOMY_CLASS_TIP)
    : FLIGHTS_TIPS;

  const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string; tips: string[] }> = {
    housing: { label: CATEGORY_LABELS.housing, icon: <HomeIcon />, color: CATEGORY_COLORS.housing, tips: HOUSING_TIPS },
    transportation: { label: CATEGORY_LABELS.transportation, icon: <DirectionsCarIcon />, color: CATEGORY_COLORS.transportation, tips: TRANSPORT_TIPS },
    flights: { label: CATEGORY_LABELS.flights, icon: <FlightIcon />, color: CATEGORY_COLORS.flights, tips: flightsTips },
    diet: { label: CATEGORY_LABELS.diet, icon: <RestaurantIcon />, color: CATEGORY_COLORS.diet, tips: DIET_TIPS },
  };

  const ranked = (Object.entries(breakdown) as [string, number | undefined][])
    .filter(([, v]) => v != null && v > 0)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 2)
    .map(([key]) => key);

  if (ranked.length === 0) return null;

  return (
    <Box sx={{ mt: 3, p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <TipsAndUpdatesIcon sx={{ color: 'warning.main' }} />
        <Typography variant="subtitle1" fontWeight={700}>
          Personalised tips for you
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Based on your highest-impact categories:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ranked.map((key) => {
          const meta = CATEGORY_META[key];
          if (!meta) return null;
          return (
            <Box key={key}>
              <Chip
                icon={meta.icon as React.ReactElement}
                label={meta.label}
                size="small"
                sx={{
                  mb: 1, bgcolor: `${meta.color}18`, color: meta.color, fontWeight: 600,
                  '& .MuiChip-icon': { color: meta.color }
                }}
              />
              <List dense disablePadding>
                {meta.tips.slice(0, 3).map((tip, i) => (
                  <ListItem key={i} disableGutters alignItems="flex-start" sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 20, mt: 0.3 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: meta.color, flexShrink: 0 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={tip}
                      slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

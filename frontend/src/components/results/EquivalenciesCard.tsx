import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import ForestIcon from '@mui/icons-material/Forest';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FlightIcon from '@mui/icons-material/Flight';
import { CATEGORY_COLORS } from '../../constants/categories';
import { TREE_ABSORPTION, CAR_CO2_PER_KM, FLIGHT_CO2 } from '../../data/emissionFactors';

interface Props {
  total: number;
}

function EquivItem({
  icon,
  value,
  label,
  tooltip,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tooltip: string;
  color: string;
}) {
  return (
    <Tooltip title={tooltip} arrow>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.75,
          p: 2,
          borderRadius: 2,
          bgcolor: 'action.hover',
          cursor: 'default',
          textAlign: 'center',
        }}
      >
        <Box sx={{ color, fontSize: 36, lineHeight: 1, display: 'flex' }}>{icon}</Box>
        <Typography variant="h6" fontWeight={700} lineHeight={1.1}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" lineHeight={1.3}>
          {label}
        </Typography>
      </Box>
    </Tooltip>
  );
}

export default function EquivalenciesCard({ total }: Props) {
  const trees = Math.ceil(total / TREE_ABSORPTION);
  const carKm = Math.round(total / CAR_CO2_PER_KM);
  const flights = (total / FLIGHT_CO2).toFixed(1);

  return (
    <Box sx={{ mt: 3, p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        What does this mean?
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <EquivItem
          icon={<ForestIcon fontSize="inherit" />}
          value={trees.toLocaleString()}
          label="trees needed 1 year to absorb this"
          tooltip="Based on ~22 kg CO₂ absorbed per tree per year"
          color={CATEGORY_COLORS.housing}
        />
        <EquivItem
          icon={<DirectionsCarIcon fontSize="inherit" />}
          value={`${carKm.toLocaleString()} km`}
          label="driven by an average car"
          tooltip="Based on 210 g CO₂ per km for an average gasoline car"
          color={CATEGORY_COLORS.transportation}
        />
        <EquivItem
          icon={<FlightIcon fontSize="inherit" />}
          value={flights}
          label="short-haul flights (~1,000 km)"
          tooltip="Based on ~255 kg CO₂ per passenger for a ~1,000 km flight"
          color={CATEGORY_COLORS.flights}
        />
      </Box>
    </Box>
  );
}

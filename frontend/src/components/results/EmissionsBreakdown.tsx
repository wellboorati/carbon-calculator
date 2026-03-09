import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Divider from '@mui/material/Divider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PieChart } from '@mui/x-charts/PieChart';
import type {
  CalculateResponse, CalculateRequest,
  HousingInput, TransportationInput, FlightInput, DietInput,
  AirportFlightInput, ManualFlightInput,
} from '../../types';
import {
  CATEGORY_COLORS, CATEGORY_LABELS,
  ENERGY_LABELS, TRANSPORT_TYPE_LABELS, CLASS_LABELS, PERIOD_LABELS,
} from '../../constants/categories';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, px: 1, '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' } }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Box>
  );
}

function HousingDetails({ entries }: { entries: HousingInput[] }) {
  const people = entries[0]?.people ?? 1;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
        Shared by {people} {people === 1 ? 'person' : 'people'}
      </Typography>
      {entries.map((e, i) => (
        <Box key={i} sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? 'grey.800' : 'grey.50', borderRadius: 1, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? 'grey.700' : 'grey.100', px: 1, py: 0.5 }}>
            <Typography variant="body2" fontWeight={600}>{ENERGY_LABELS[e.energyType]}</Typography>
          </Box>
          <DetailRow label="Monthly consumption" value={`${e.consumption} ${e.unit}`} />
        </Box>
      ))}
    </Box>
  );
}

function TransportationDetails({ entries }: { entries: TransportationInput[] }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {entries.map((e, i) => (
        <Box key={i} sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? 'grey.800' : 'grey.50', borderRadius: 1, overflow: 'hidden' }}>
          {e.kind === 'own' ? (
            <>
              <Box sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? 'grey.700' : 'grey.100', px: 1, py: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {e.vehicleType === 'car' ? 'Car' : 'Motorcycle'} · {e.fuelType === 'gasoline' ? 'Gasoline' : 'Diesel'}
                </Typography>
              </Box>
              <DetailRow label="Distance" value={`${e.distance} ${e.distanceUnit}/${PERIOD_LABELS[e.distancePeriod]}`} />
              <DetailRow label="Efficiency" value={e.efficiencyUnit === 'km_per_liter' ? `${e.efficiency} km/L` : `${e.efficiency} MPG`} />
            </>
          ) : (
            <>
              <Box sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? 'grey.700' : 'grey.100', px: 1, py: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>{TRANSPORT_TYPE_LABELS[e.transportType]}</Typography>
              </Box>
              <DetailRow label="Distance" value={`${e.distance} ${e.distanceUnit}/${PERIOD_LABELS[e.distancePeriod]}`} />
            </>
          )}
        </Box>
      ))}
    </Box>
  );
}

function DietDetails({ diet }: { diet: DietInput }) {
  return (
    <Box sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? 'grey.800' : 'grey.50', borderRadius: 1, overflow: 'hidden' }}>
      <DetailRow label="Beef / Lamb" value={`${diet.beefServingsPerWeek} servings/week`} />
      <DetailRow label="Other Meat" value={`${diet.otherMeatServingsPerWeek} servings/week`} />
      <DetailRow label="Fish / Seafood" value={`${diet.fishServingsPerWeek} servings/week`} />
      <DetailRow label="Dairy" value={`${diet.dairyServingsPerWeek} servings/week`} />
    </Box>
  );
}

function FlightsDetails({ entries }: { entries: FlightInput[] }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {entries.map((e, i) => (
        <Box key={i} sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? 'grey.800' : 'grey.50', borderRadius: 1, overflow: 'hidden' }}>
          {e.mode === 'airports' ? (
            <>
              <Box sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? 'grey.700' : 'grey.100', px: 1, py: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {(e as AirportFlightInput).departureIata} → {(e as AirportFlightInput).destinationIata}
                  {(e as AirportFlightInput).layoverIata ? ` via ${(e as AirportFlightInput).layoverIata}` : ''}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? 'grey.700' : 'grey.100', px: 1, py: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {(e as ManualFlightInput).distance} {(e as ManualFlightInput).distanceUnit}
                </Typography>
              </Box>
            </>
          )}
          <DetailRow label="Class" value={CLASS_LABELS[e.travelClass]} />
          <DetailRow label="Trip" value={e.tripType === 'roundtrip' ? 'Round Trip' : 'One Way'} />
        </Box>
      ))}
    </Box>
  );
}

interface Props {
  result: CalculateResponse;
  inputs?: CalculateRequest;
}

export default function EmissionsBreakdown({ result, inputs }: Props) {
  const data = Object.entries(result.breakdown)
    .filter(([, v]) => v != null)
    .map(([key, value]) => ({
      id: key,
      label: CATEGORY_LABELS[key],
      value: value as number,
      color: CATEGORY_COLORS[key],
    }));

  function getDetails(id: string) {
    if (!inputs) return null;
    if (id === 'housing' && inputs.housing?.length) return <HousingDetails entries={inputs.housing} />;
    if (id === 'transportation' && inputs.transportation?.length) return <TransportationDetails entries={inputs.transportation} />;
    if (id === 'flights' && inputs.flights?.length) return <FlightsDetails entries={inputs.flights} />;
    if (id === 'diet' && inputs.diet) return <DietDetails diet={inputs.diet} />;
    return null;
  }

  return (
    <Box>
      <PieChart
        series={[{
          data,
          highlightScope: { fade: 'global', highlight: 'item' },
          valueFormatter: (v) => `${Number(v.value).toFixed(2)} tCO₂e/yr`,
        }]}
        height={280}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
        {data.map((item) => {
          const details = getDetails(item.id);
          return (
            <Accordion
              key={item.id}
              disableGutters
              elevation={0}
              disabled={!details}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
                '&.Mui-disabled': { bgcolor: 'background.paper', opacity: 1 },
              }}
            >
              <AccordionSummary expandIcon={details ? <ExpandMoreIcon /> : null} sx={{ minHeight: 48 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0, bgcolor: item.color }} />
                  <Typography fontWeight={500}>{item.label}</Typography>
                </Box>
                <Typography fontWeight={700} sx={{ mr: details ? 0 : 1.5 }}>
                  {item.value.toFixed(2)} tCO₂e/yr
                </Typography>
              </AccordionSummary>
              {details && (
                <AccordionDetails sx={{ pt: 0 }}>
                  <Divider sx={{ mb: 1.5 }} />
                  {details}
                </AccordionDetails>
              )}
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
}

import { useState, useEffect } from 'react';
import type { HousingInput, TransportationInput, FlightInput, DietInput } from '../types';

const STORAGE_KEY = 'carbon_calculator_draft';

const DEFAULT_HOUSING: HousingInput[] = [
  { energyType: 'electricity', consumption: 0, unit: 'kWh', people: 1 },
];

const DEFAULT_DIET: DietInput = {
  beefServingsPerWeek: 0,
  otherMeatServingsPerWeek: 0,
  fishServingsPerWeek: 0,
  dairyServingsPerWeek: 0,
};

interface DraftState {
  housingDraft: HousingInput[];
  transportDraft: TransportationInput[];
  flightsDraft: FlightInput[];
  dietDraft: DietInput;
}

function loadDraft(): DraftState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useDraft() {
  const saved = loadDraft();
  const [housingDraft, setHousingDraft] = useState<HousingInput[]>(saved?.housingDraft ?? [...DEFAULT_HOUSING]);
  const [transportDraft, setTransportDraft] = useState<TransportationInput[]>(saved?.transportDraft ?? []);
  const [flightsDraft, setFlightsDraft] = useState<FlightInput[]>(saved?.flightsDraft ?? []);
  const [dietDraft, setDietDraft] = useState<DietInput>(saved?.dietDraft ?? { ...DEFAULT_DIET });

  const hasDraft =
    housingDraft.some((e) => e.consumption > 0) ||
    transportDraft.length > 0 ||
    flightsDraft.length > 0 ||
    Object.values(dietDraft).some((v) => v > 0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ housingDraft, transportDraft, flightsDraft, dietDraft }));
    } catch {
      // storage full or unavailable — ignore
    }
  }, [housingDraft, transportDraft, flightsDraft, dietDraft]);

  function clearDraft() {
    localStorage.removeItem(STORAGE_KEY);
    setHousingDraft([...DEFAULT_HOUSING]);
    setTransportDraft([]);
    setFlightsDraft([]);
    setDietDraft({ ...DEFAULT_DIET });
  }

  return {
    housingDraft,
    setHousingDraft,
    transportDraft,
    setTransportDraft,
    flightsDraft,
    setFlightsDraft,
    dietDraft,
    setDietDraft,
    hasDraft,
    clearDraft,
  };
}

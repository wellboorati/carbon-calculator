import { gql } from '@apollo/client';

export const SEARCH_AIRPORTS = gql`
  query SearchAirports($q: String!) {
    airports(q: $q) {
      iata
      name
      country
      lat
      lon
    }
  }
`;

export const CALCULATE = gql`
  mutation Calculate(
    $housing: [HousingInputType]
    $transportation: [TransportationInputType]
    $flights: [FlightInputType]
    $diet: DietInputType
  ) {
    calculate(housing: $housing, transportation: $transportation, flights: $flights, diet: $diet) {
      total
      breakdown {
        housing
        transportation
        flights
        diet
      }
      unit
    }
  }
`;

export const GENERATE_PDF = gql`
  mutation GeneratePdf(
    $total: Float!
    $breakdown: BreakdownInput!
    $unit: String!
    $countryName: String
    $countryAvg: Float
    $worldAvg: Float!
  ) {
    generatePdf(
      total: $total
      breakdown: $breakdown
      unit: $unit
      countryName: $countryName
      countryAvg: $countryAvg
      worldAvg: $worldAvg
    )
  }
`;

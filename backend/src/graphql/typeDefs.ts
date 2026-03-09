export const typeDefs = `#graphql
  type Airport {
    iata: String!
    name: String!
    country: String!
    lat: Float!
    lon: Float!
  }

  type BreakdownResult {
    housing: Float
    transportation: Float
    flights: Float
    diet: Float
  }

  type CalculationResult {
    total: Float!
    breakdown: BreakdownResult!
    unit: String!
  }

  input HousingInputType {
    energyType: String!
    consumption: Float!
    unit: String!
    people: Int!
  }

  # GraphQL does not support union input types, so vehicle and public transport
  # fields are merged with nullable fields and discriminated by 'kind'.
  input TransportationInputType {
    kind: String!
    vehicleType: String
    fuelType: String
    efficiency: Float
    efficiencyUnit: String
    transportType: String
    distance: Float!
    distancePeriod: String!
    distanceUnit: String!
  }

  # Airport mode and manual mode fields merged; discriminated by 'mode'.
  input FlightInputType {
    mode: String!
    departureIata: String
    destinationIata: String
    layoverIata: String
    distance: Float
    distanceUnit: String
    travelClass: String!
    tripType: String!
  }

  input DietInputType {
    beefServingsPerWeek: Float!
    otherMeatServingsPerWeek: Float!
    fishServingsPerWeek: Float!
    dairyServingsPerWeek: Float!
  }

  input BreakdownInput {
    housing: Float
    transportation: Float
    flights: Float
    diet: Float
  }

  type Query {
    airports(q: String!): [Airport!]!
  }

  type Mutation {
    calculate(
      housing: [HousingInputType]
      transportation: [TransportationInputType]
      flights: [FlightInputType]
      diet: DietInputType
    ): CalculationResult!

    generatePdf(
      total: Float!
      breakdown: BreakdownInput!
      unit: String!
      countryName: String
      countryAvg: Float
      worldAvg: Float!
    ): String!
  }
`;

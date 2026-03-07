import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('POST /calculate', () => {
  it('returns 400 if body is missing all fields', async () => {
    const res = await request(app).post('/calculate').send({});
    expect(res.status).toBe(400);
  });

  it('calculates with only housing', async () => {
    const res = await request(app).post('/calculate').send({
      housing: { energyType: 'electricity', consumption: 500, unit: 'kWh', people: 1 },
      transportation: null,
      flights: null,
    });
    expect(res.status).toBe(200);
    expect(res.body.total).toBeCloseTo(2.316, 1);
    expect(res.body.breakdown.housing).toBeCloseTo(2.316, 1);
    expect(res.body.breakdown.transportation).toBeUndefined();
    expect(res.body.unit).toBe('tCO2e/year');
  });

  it('calculates with only flights (manual)', async () => {
    const res = await request(app).post('/calculate').send({
      housing: null,
      transportation: null,
      flights: [{ mode: 'manual', distance: 1000, distanceUnit: 'km', travelClass: 'economy', tripType: 'oneway' }],
    });
    expect(res.status).toBe(200);
    expect(res.body.total).toBeCloseTo(0.255, 2);
    expect(res.body.breakdown.flights).toBeCloseTo(0.255, 2);
  });

  it('sums all categories', async () => {
    const res = await request(app).post('/calculate').send({
      housing: { energyType: 'electricity', consumption: 500, unit: 'kWh', people: 1 },
      transportation: [{ kind: 'public', transportType: 'bus', distance: 100, distancePeriod: 'week', distanceUnit: 'km' }],
      flights: [{ mode: 'manual', distance: 1000, distanceUnit: 'km', travelClass: 'economy', tripType: 'oneway' }],
    });
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
    expect(Object.keys(res.body.breakdown)).toHaveLength(3);
  });
});

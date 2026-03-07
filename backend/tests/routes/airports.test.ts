import request from 'supertest';
import { createApp } from '../../src/app';
import { loadAirports } from '../../src/services/airports';

beforeAll(() => loadAirports());

const app = createApp();

describe('GET /airports', () => {
  it('returns 400 if q is missing', async () => {
    const res = await request(app).get('/airports');
    expect(res.status).toBe(400);
  });

  it('returns airports matching IATA code', async () => {
    const res = await request(app).get('/airports?q=JFK');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((a: { iata: string }) => a.iata === 'JFK')).toBe(true);
  });

  it('returns at most 10 results', async () => {
    const res = await request(app).get('/airports?q=air');
    expect(res.body.length).toBeLessThanOrEqual(10);
  });

  it('each result has required fields', async () => {
    const res = await request(app).get('/airports?q=LHR');
    const airport = res.body[0];
    expect(airport).toHaveProperty('iata');
    expect(airport).toHaveProperty('name');
    expect(airport).toHaveProperty('country');
    expect(airport).toHaveProperty('lat');
    expect(airport).toHaveProperty('lon');
  });
});

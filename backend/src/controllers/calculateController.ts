import { Request, Response } from 'express';
import { calculate } from '../services/calculator';
import { CalculateRequest } from '../types';

export function handleCalculate(req: Request, res: Response): void {
  const body = req.body as Partial<CalculateRequest>;

  if (body.housing === undefined && body.transportation === undefined && body.flights === undefined) {
    res.status(400).json({ error: 'Request body must include at least one of: housing, transportation, flights' });
    return;
  }

  const input: CalculateRequest = {
    housing: body.housing ?? null,
    transportation: body.transportation ?? null,
    flights: body.flights ?? null,
  };

  const result = calculate(input);
  res.json(result);
}

import { Request, Response } from 'express';
import { searchAirports } from '../services/airports';

export function handleAirportSearch(req: Request, res: Response): void {
  const q = req.query.q as string | undefined;

  if (!q) {
    res.status(400).json({ error: 'Query parameter "q" is required' });
    return;
  }

  const results = searchAirports(q);
  res.json(results);
}

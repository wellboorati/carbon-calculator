import express from 'express';
import cors from 'cors';
import calculateRouter from './routes/calculate';
import airportsRouter from './routes/airports';

export function createApp() {
  const app = express();
  app.use(cors({ origin: 'http://localhost:5173' }));
  app.use(express.json());

  app.use('/calculate', calculateRouter);
  app.use('/airports', airportsRouter);

  return app;
}

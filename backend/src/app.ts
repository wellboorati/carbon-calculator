import express from 'express';
import cors from 'cors';
import calculateRouter from './routes/calculate';

export function createApp() {
  const app = express();
  app.use(cors({ origin: 'http://localhost:5173' }));
  app.use(express.json());

  app.use('/calculate', calculateRouter);

  return app;
}

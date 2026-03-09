import express from 'express';
import cors from 'cors';
import calculateRouter from './routes/calculate';
import airportsRouter from './routes/airports';
import pdfRouter from './routes/pdf';

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }));
  app.use(express.json());

  app.use('/calculate', calculateRouter);
  app.use('/airports', airportsRouter);
  app.use('/generate-pdf', pdfRouter);

  return app;
}

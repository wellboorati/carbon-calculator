import dotenv from 'dotenv';
dotenv.config();

import { loadAirports } from './services/airports';
import { createApp } from './app';

const PORT = process.env.PORT ?? 3001;

loadAirports();
console.log('Airport data loaded.');

const app = createApp();

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

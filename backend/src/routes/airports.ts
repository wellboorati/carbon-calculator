import { Router } from 'express';
import { handleAirportSearch } from '../controllers/airportsController';

const router = Router();
router.get('/', handleAirportSearch);
export default router;

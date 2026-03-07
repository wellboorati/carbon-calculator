import { Router } from 'express';
import { handleCalculate } from '../controllers/calculateController';

const router = Router();
router.post('/', handleCalculate);
export default router;

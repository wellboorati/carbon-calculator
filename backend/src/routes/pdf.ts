import { Router } from 'express';
import { handleGeneratePDF } from '../controllers/pdfController';

const router = Router();
router.post('/', handleGeneratePDF);
export default router;

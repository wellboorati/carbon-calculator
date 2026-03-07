import { Request, Response } from 'express';
import { generatePDF } from '../services/pdf';
import { CalculateResponse } from '../types';

export async function handleGeneratePDF(req: Request, res: Response): Promise<void> {
  const body = req.body as CalculateResponse;

  if (body.total === undefined || !body.breakdown) {
    res.status(400).json({ error: 'Invalid calculation result' });
    return;
  }

  const pdfBuffer = await generatePDF(body);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="carbon-footprint.pdf"');
  res.send(pdfBuffer);
}

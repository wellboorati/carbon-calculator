import PDFDocument from 'pdfkit';
import { CalculateResponse } from '../types';

export function generatePDF(result: CalculateResponse): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Title
    doc.fontSize(22).font('Helvetica-Bold').text('Carbon Calculator Results', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666666')
      .text(`Generated on ${new Date().toLocaleDateString('en-US')}`, { align: 'center' });
    doc.moveDown(1.5);

    // Total
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000')
      .text(`Total Footprint: ${result.total.toFixed(2)} tCO2e/year`);
    doc.moveDown(1);

    // Breakdown
    doc.fontSize(13).font('Helvetica-Bold').text('Breakdown by Category:');
    doc.moveDown(0.5);

    const labels: Record<string, string> = {
      housing: 'Housing / Home Energy',
      transportation: 'Transportation',
      flights: 'Flights',
    };

    for (const [key, label] of Object.entries(labels)) {
      const value = result.breakdown[key as keyof typeof result.breakdown];
      if (value !== undefined) {
        doc.fontSize(12).font('Helvetica')
          .text(`  \u2022  ${label}: ${value.toFixed(2)} tCO2e/year`);
      }
    }

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#999999').font('Helvetica')
      .text('Carbon Calculator — Individual Carbon Footprint Estimator', { align: 'center' });

    doc.end();
  });
}

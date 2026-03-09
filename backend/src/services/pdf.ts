import PDFDocument from 'pdfkit';
import type { CalculateResponse } from '../types';

const TREE_ABSORPTION = 0.022;      // tCO2 per tree per year
const CAR_CO2_PER_KM = 0.00021;    // tCO2 per km
const FLIGHT_CO2 = 0.255;          // tCO2 per short-haul flight (~1,000 km)

const CATEGORY_LABELS: Record<string, string> = {
  housing: 'Housing / Home Energy',
  transportation: 'Transportation',
  flights: 'Flights',
  diet: 'Diet',
};

const CATEGORY_TIPS: Record<string, string[]> = {
  housing: [
    'Switch to a renewable energy plan from your utility provider.',
    'Improve home insulation to reduce heating and cooling needs.',
    'Replace old appliances with energy-efficient (A+++) models.',
  ],
  transportation: [
    'Consider switching to an electric or hybrid vehicle.',
    'Use public transport, cycling or walking for short trips.',
    'Try carpooling with colleagues or neighbours.',
  ],
  flights: [
    'Choose direct routes — takeoff and landing consume the most fuel.',
    'Fly economy class; business class has a 3\u00d7 larger per-seat footprint.',
    'Replace short flights with train journeys where possible.',
  ],
  diet: [
    'Reduce beef and lamb consumption — they have the highest carbon footprint per serving.',
    'Try plant-based meals a few days a week to lower your dietary emissions.',
    'Choose locally sourced and seasonal produce when possible.',
  ],
};

interface PdfInput {
  total: number;
  breakdown: CalculateResponse['breakdown'];
  unit: string;
  countryName?: string;
  countryAvg?: number;
  worldAvg?: number;
}

export function generatePDF(input: PdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const { total, breakdown, countryName, countryAvg, worldAvg } = input;
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Title ─────────────────────────────────────────────────────────────────
    doc.fontSize(22).font('Helvetica-Bold').text('Carbon Footprint Report', { align: 'center' });
    doc.moveDown(0.4);
    doc.fontSize(10).font('Helvetica').fillColor('#666666')
      .text(`Generated on ${new Date().toLocaleDateString('en-US')}`, { align: 'center' });
    doc.moveDown(1.5);

    // ── Total ─────────────────────────────────────────────────────────────────
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000')
      .text(`Total Footprint: ${total.toFixed(2)} tCO\u2082e/year`);
    doc.moveDown(1);

    // ── Breakdown ─────────────────────────────────────────────────────────────
    doc.fontSize(13).font('Helvetica-Bold').text('Breakdown by Category');
    doc.moveDown(0.4);
    for (const [key, label] of Object.entries(CATEGORY_LABELS)) {
      const value = breakdown[key as keyof typeof breakdown];
      if (value != null) {
        doc.fontSize(11).font('Helvetica').fillColor('#333333')
          .text(`  \u2022  ${label}: ${value.toFixed(2)} tCO\u2082e/year`);
      }
    }
    doc.moveDown(1.2);

    // ── Equivalencies ─────────────────────────────────────────────────────────
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#000000').text('What Does This Mean?');
    doc.moveDown(0.4);
    const trees = Math.round(total / TREE_ABSORPTION);
    const carKm = Math.round(total / CAR_CO2_PER_KM);
    const flights = Math.round(total / FLIGHT_CO2);
    doc.fontSize(11).font('Helvetica').fillColor('#333333');
    doc.text(`  \u2022  Equivalent to ${trees.toLocaleString()} trees needed to absorb your emissions for one year`);
    doc.text(`  \u2022  Equivalent to driving ${carKm.toLocaleString()} km in an average gasoline car`);
    doc.text(`  \u2022  Equivalent to ${flights} short-haul flights (~1,000 km each)`);
    doc.moveDown(1.2);

    // ── Country Comparison ────────────────────────────────────────────────────
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#000000').text('How Do You Compare?');
    doc.moveDown(0.4);
    doc.fontSize(11).font('Helvetica').fillColor('#333333');
    doc.text(`  \u2022  Your footprint:    ${total.toFixed(1)} tCO\u2082e/year`);
    if (countryName && countryAvg != null) {
      const diff = total - countryAvg;
      const diffLabel = diff < 0
        ? `${Math.abs(diff).toFixed(1)} tCO\u2082e below average`
        : `${diff.toFixed(1)} tCO\u2082e above average`;
      doc.text(`  \u2022  ${countryName} average: ${countryAvg.toFixed(1)} tCO\u2082e/year  (${diffLabel})`);
    }
    if (worldAvg != null) {
      const worldDiff = total - worldAvg;
      const worldDiffLabel = worldDiff < 0
        ? `${Math.abs(worldDiff).toFixed(1)} tCO\u2082e below average`
        : `${worldDiff.toFixed(1)} tCO\u2082e above average`;
      doc.text(`  \u2022  World average:    ${worldAvg.toFixed(1)} tCO\u2082e/year  (${worldDiffLabel})`);
    }
    doc.moveDown(0.6);
    doc.fontSize(9).fillColor('#888888')
      .text(
        'Note: Country averages represent total per-capita emissions across all sectors. ' +
        'This calculator covers housing, transportation, flights, and diet — so your result may be lower than the full national average.',
      );
    doc.moveDown(1.2);

    // ── Recommendations ───────────────────────────────────────────────────────
    const ranked = (Object.entries(breakdown) as [string, number | undefined][])
      .filter(([, v]) => v != null && v > 0)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 2)
      .map(([key]) => key);

    if (ranked.length > 0) {
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#000000').text('Personalised Tips for You');
      doc.moveDown(0.4);
      for (const key of ranked) {
        const label = CATEGORY_LABELS[key];
        const tips = CATEGORY_TIPS[key];
        if (!label || !tips) continue;
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#333333').text(label + ':');
        for (const tip of tips) {
          doc.fontSize(11).font('Helvetica').fillColor('#333333')
            .text(`  \u2022  ${tip}`);
        }
        doc.moveDown(0.6);
      }
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.moveDown(1);
    doc.fontSize(9).fillColor('#999999').font('Helvetica')
      .text('Carbon Calculator \u2014 Individual Carbon Footprint Estimator', { align: 'center' });

    doc.end();
  });
}

import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../auth/middleware';
import { db } from '../db/database';
import { ReportGenerator } from '../reports/reportGenerator';

export const reportsRouter = Router();
reportsRouter.use(authenticate, requireRole('inspector', 'admin'));

reportsRouter.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inspection = db.getInspectionById(id);

    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    const pdfBuffer = await ReportGenerator.generatePdf(inspection);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Inspection_Report_${inspection.inspectionNumber}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (err: any) {
    console.error('Report generation error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

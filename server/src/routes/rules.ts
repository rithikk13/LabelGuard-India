import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, requireRole } from '../auth/middleware';

export const rulesRouter = Router();

rulesRouter.get('/versions', (req: Request, res: Response) => {
  const versions = db.getRegulationVersions();
  return res.json({
    success: true,
    versions,
    disclaimer: 'Prototype rule dataset — requires official verification.'
  });
});

rulesRouter.get('/categories', (req: Request, res: Response) => {
  const categories = db.getCategories();
  return res.json({ success: true, categories });
});

rulesRouter.get('/requirements', (req: Request, res: Response) => {
  const { versionId } = req.query;
  const requirements = versionId && typeof versionId === 'string'
    ? db.getRequirementsByVersion(versionId)
    : db.getAllRequirements();

  return res.json({
    success: true,
    total: requirements.length,
    requirements,
    disclaimer: 'Prototype rule dataset — requires official verification.'
  });
});

// Admin creates amendment or new requirement
rulesRouter.post('/requirements', authenticate, requireRole('admin'), (req: Request, res: Response) => {
  try {
    const body = req.body;
    const newReq = {
      id: uuidv4(),
      versionId: body.versionId || 'ver-2021-usp',
      ruleClause: body.ruleClause || 'Rule 6(1)',
      title: body.title,
      fieldKey: body.fieldKey,
      description: body.description,
      isMandatory: body.isMandatory !== undefined ? body.isMandatory : true,
      validationType: body.validationType || 'presence',
      minNumeralHeightMm: body.minNumeralHeightMm || 2.0,
      applicableCategories: body.applicableCategories || [],
      exceptionNotes: body.exceptionNotes || '',
      sourceReference: body.sourceReference || 'Legal Metrology (Packaged Commodities) Rules, 2011'
    };

    db.getAllRequirements().push(newReq);
    db.logAudit('requirement', newReq.id, 'CREATE', body.adminUserId || 'usr-admin-201', null, newReq);
    db.save();

    return res.status(201).json({ success: true, requirement: newReq });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

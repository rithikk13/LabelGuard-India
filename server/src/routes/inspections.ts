import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../auth/middleware';
import { db, Inspection } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export const inspectionsRouter = Router();
inspectionsRouter.use(authenticate, requireRole('inspector', 'admin'));

// GET all inspections with filters
inspectionsRouter.get('/', (req: Request, res: Response) => {
  let inspections = db.getInspections();
  const { status, categoryId, search, role } = req.query;

  if (status) {
    inspections = inspections.filter(i => i.status === status || i.overallAssessment === status);
  }

  if (categoryId) {
    inspections = inspections.filter(i => i.categoryId === categoryId);
  }

  if (role) {
    inspections = inspections.filter(i => i.role === role);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    inspections = inspections.filter(
      i =>
        i.inspectionNumber.toLowerCase().includes(q) ||
        i.productName.toLowerCase().includes(q) ||
        i.manufacturerName.toLowerCase().includes(q) ||
        (i.storeName && i.storeName.toLowerCase().includes(q))
    );
  }

  return res.json({
    success: true,
    total: inspections.length,
    inspections
  });
});

// GET inspection by ID
inspectionsRouter.get('/:id', (req: Request, res: Response) => {
  const inspection = db.getInspectionById(req.params.id);
  if (!inspection) {
    return res.status(404).json({ success: false, message: 'Inspection record not found' });
  }
  return res.json({ success: true, inspection });
});

// CREATE inspection
inspectionsRouter.post('/', (req: Request, res: Response) => {
  try {
    const body = req.body;
    const count = db.getInspections().length + 1;
    const year = new Date().getFullYear();
    const inspectionNumber = `LM-${year}-${String(count).padStart(5, '0')}`;

    const newInspection: Inspection = {
      id: uuidv4(),
      inspectionNumber,
      userId: body.userId || 'usr-insp-101',
      role: body.role || 'inspector',
      productName: body.productName || 'Packaged Commodity',
      categoryId: body.categoryId || 'cat-food-staples',
      categoryName: body.categoryName || 'Packaged Food Staples',
      manufacturerName: body.manufacturerName || 'Unknown Manufacturer',
      storeName: body.storeName || 'Local Retail Outlet',
      storeAddress: body.storeAddress || 'Connaught Place, New Delhi',
      latitude: body.latitude || 28.6315,
      longitude: body.longitude || 77.2167,
      timestamp: body.timestamp || new Date().toISOString(),
      status: body.status || 'PRELIMINARY',
      overallAssessment: body.overallAssessment || 'NEEDS_VERIFICATION',
      ruleVersionId: body.ruleVersionId || 'ver-2021-usp',
      ruleVersionCode: body.ruleVersionCode || 'LMR-2021-USP',
      notes: body.notes || '',
      images: body.images || [],
      extractedFields: body.extractedFields || [],
      complianceChecks: body.complianceChecks || [],
      conflicts: body.conflicts || [],
      evidence: body.evidence || [],
      verification: body.verification,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = db.createInspection(newInspection);
    return res.status(201).json({ success: true, inspection: created });
  } catch (err: any) {
    console.error('Create inspection error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Human-in-the-loop verification
inspectionsRouter.post('/:id/verify', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { inspectorId, decision, inspectorNotes, findingSummary } = req.body;

    const existing = db.getInspectionById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    const inspector = db.getUserById(inspectorId) || { fullName: 'Officer Ramesh Sharma', id: 'usr-insp-101' };

    const verificationRecord = {
      id: uuidv4(),
      inspectionId: id,
      inspectorId: inspector.id,
      inspectorName: inspector.fullName,
      decision: decision || 'CONFIRM',
      findingSummary: findingSummary || 'Inspector reviewed compliance evidence and confirmed findings.',
      inspectorNotes: inspectorNotes || '',
      verifiedAt: new Date().toISOString()
    };

    let newStatus: Inspection['status'] = 'PENDING_VERIFICATION';
    if (decision === 'CONFIRM') {
      newStatus = existing.overallAssessment === 'APPEARS_COMPLIANT' ? 'VERIFIED_COMPLIANT' : 'VERIFIED_POTENTIAL_ISSUE';
    } else if (decision === 'REJECT') {
      newStatus = 'REJECTED';
    }

    const updated = db.updateInspection(
      id,
      {
        status: newStatus,
        verification: verificationRecord
      },
      inspector.id
    );

    return res.json({
      success: true,
      inspection: updated,
      verification: verificationRecord
    });
  } catch (err: any) {
    console.error('Verification error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Category Manual Override with Audit Log
inspectionsRouter.patch('/:id/category', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { categoryId, userId } = req.body;

    const category = db.getCategoryById(categoryId);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }

    const existing = db.getInspectionById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    const updated = db.updateInspection(
      id,
      {
        categoryId: category.id,
        categoryName: category.name
      },
      userId || 'usr-insp-101'
    );

    return res.json({
      success: true,
      message: 'Product category manually updated by inspector',
      inspection: updated
    });
  } catch (err: any) {
    console.error('Category override error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

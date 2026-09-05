import { Router, Request, Response } from 'express';
import { DEMO_PRODUCTS } from '../ocr/demoDataset';
import { db, Inspection } from '../db/database';
import { ComplianceEngine } from '../engine/complianceEngine';
import { ConflictEngine } from '../engine/conflictEngine';
import { v4 as uuidv4 } from 'uuid';

export const demoRouter = Router();

demoRouter.get('/products', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    products: DEMO_PRODUCTS
  });
});

demoRouter.get('/products/:id', (req: Request, res: Response) => {
  const prod = DEMO_PRODUCTS.find(p => p.id === req.params.id);
  if (!prod) {
    return res.status(404).json({ success: false, message: 'Demo product not found' });
  }
  return res.json({ success: true, product: prod });
});

// Seed Initial Inspections based on Demo Products
demoRouter.post('/seed', (_req: Request, res: Response) => {
  const categories = db.getCategories();
  const requirements = db.getRequirementsByVersion('ver-2021-usp');

  // Seed 4 inspections corresponding to our 4 demo products
  const sampleLocations = [
    { name: 'Kailash Supermarket, Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167 },
    { name: 'Nature Basket, Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
    { name: 'HyperCity Retail, Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245 },
    { name: 'Nilgiris Store, T. Nagar, Chennai', lat: 13.0418, lng: 80.2341 }
  ];

  const seeded: Inspection[] = [];

  DEMO_PRODUCTS.forEach((demoProd, index) => {
    const loc = sampleLocations[index % sampleLocations.length];
    const category = categories.find(c => c.id === demoProd.categoryId) || categories[0];

    // Build fields by face
    const fieldsByFace: Record<string, any> = {};
    for (const face of demoProd.faces) {
      fieldsByFace[face.face] = {};
      for (const bbox of face.boundingBoxes) {
        fieldsByFace[face.face][bbox.fieldKey] = {
          fieldKey: bbox.fieldKey,
          rawValue: bbox.text,
          normalizedValue: bbox.text,
          confidence: bbox.confidence,
          sourceFace: face.face,
          boundingBox: bbox.box
        };
      }
    }

    const aggregated: Record<string, any> = {};
    for (const [k, v] of Object.entries(demoProd.extractedFields)) {
      aggregated[k] = {
        fieldKey: k,
        rawValue: v.value,
        normalizedValue: v.value,
        confidence: v.confidence,
        sourceFace: v.face,
        boundingBox: v.box
      };
    }
    const checks = ComplianceEngine.evaluate(category, aggregated as any, requirements);
    const { conflicts, conflictEvidence } = ConflictEngine.detectConflicts(fieldsByFace);
    const overall = ComplianceEngine.computeOverallAssessment(checks, conflicts.length);

    const year = 2026;
    const inspNum = `LM-${year}-${String(index + 1).padStart(5, '0')}`;

    const inspection: Inspection = {
      id: `seed-insp-${index + 1}`,
      inspectionNumber: inspNum,
      userId: 'usr-insp-101',
      role: 'inspector',
      productName: demoProd.name,
      categoryId: category.id,
      categoryName: category.name,
      manufacturerName: demoProd.extractedFields['manufacturer']?.value || demoProd.brand,
      storeName: loc.name.split(',')[0],
      storeAddress: loc.name,
      latitude: loc.lat,
      longitude: loc.lng,
      timestamp: new Date(Date.now() - (index * 86400000 * 2)).toISOString(),
      status: overall === 'APPEARS_COMPLIANT' ? 'VERIFIED_COMPLIANT' : 'PENDING_VERIFICATION',
      overallAssessment: overall,
      ruleVersionId: 'ver-2021-usp',
      ruleVersionCode: 'LMR-2021-USP',
      notes: `Field screening of ${demoProd.name} at ${loc.name}.`,
      images: demoProd.faces.map((f, fIdx) => ({
        id: `img-${index + 1}-${fIdx}`,
        inspectionId: `seed-insp-${index + 1}`,
        face: f.face,
        imagePath: f.imageSvg,
        qualityScore: 0.95,
        qualityChecks: { blur: 'pass', lighting: 'pass', crop: 'pass', resolution: '1280x720' },
        capturedAt: new Date().toISOString()
      })),
      extractedFields: Object.entries(demoProd.extractedFields).map(([key, f]) => ({
        id: uuidv4(),
        inspectionId: `seed-insp-${index + 1}`,
        fieldKey: key,
        extractedValue: f.value,
        confidence: f.confidence,
        sourceFace: f.face,
        boundingBox: f.box,
        createdAt: new Date().toISOString()
      })),
      complianceChecks: checks.map(c => ({
        id: c.id,
        inspectionId: `seed-insp-${index + 1}`,
        requirementId: c.requirementId,
        fieldKey: c.fieldKey,
        ruleClause: c.ruleClause,
        result: c.result,
        summary: c.summary,
        details: c.details,
        severity: c.severity,
        createdAt: new Date().toISOString()
      })),
      conflicts,
      evidence: conflictEvidence,
      verification: overall === 'APPEARS_COMPLIANT' ? {
        id: uuidv4(),
        inspectionId: `seed-insp-${index + 1}`,
        inspectorId: 'usr-insp-101',
        inspectorName: 'Ramesh Sharma (LM-DEL-2024-88)',
        decision: 'CONFIRM',
        findingSummary: 'Visual verification confirmed complete conformance with Rule 6 and Unit Sale Price amendments.',
        inspectorNotes: 'Label declarations legible, prominent, and verified.',
        verifiedAt: new Date().toISOString()
      } : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Replace if exists or add
    const existingIdx = db.getInspections().findIndex(i => i.id === inspection.id);
    if (existingIdx !== -1) {
      db.getInspections()[existingIdx] = inspection;
    } else {
      db.getInspections().push(inspection);
    }
    seeded.push(inspection);
  });

  db.save();
  return res.json({ success: true, count: seeded.length, seeded });
});

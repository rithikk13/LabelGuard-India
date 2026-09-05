import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { inspectionsRouter } from './routes/inspections';
import { analysisRouter } from './routes/analysis';
import { complianceRouter } from './routes/compliance';
import { rulesRouter } from './routes/rules';
import { reportsRouter } from './routes/reports';
import { syncRouter } from './routes/sync';
import { dashboardRouter } from './routes/dashboard';
import { demoRouter } from './routes/demo';
import { db } from './db/database';
import { DEMO_PRODUCTS } from './ocr/demoDataset';
import { ComplianceEngine } from './engine/complianceEngine';
import { ConflictEngine } from './engine/conflictEngine';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'LabelGuard India Backend API',
    tagline: 'Scan. Understand. Verify.',
    act: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/inspections', inspectionsRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/compliance', complianceRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/sync', syncRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/demo', demoRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message || err
  });
});

// Auto-seed initial inspections on startup if empty
function autoSeedIfEmpty() {
  if (db.getInspections().length === 0) {
    console.log('📦 Seeding initial realistic Legal Metrology field inspections for SIH 2026 demo...');
    const categories = db.getCategories();
    const requirements = db.getRequirementsByVersion('ver-2021-usp');

    const sampleLocations = [
      { name: 'Kailash Supermarket, Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167 },
      { name: 'Nature Basket, Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
      { name: 'HyperCity Retail, Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245 },
      { name: 'Nilgiris Store, T. Nagar, Chennai', lat: 13.0418, lng: 80.2341 }
    ];

    DEMO_PRODUCTS.forEach((demoProd, index) => {
      const loc = sampleLocations[index % sampleLocations.length];
      const category = categories.find(c => c.id === demoProd.categoryId) || categories[0];

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

      const inspection = {
        id: `seed-insp-${index + 1}`,
        inspectionNumber: `LM-2026-${String(index + 1).padStart(5, '0')}`,
        userId: 'usr-insp-101',
        role: 'inspector' as const,
        productName: demoProd.name,
        categoryId: category.id,
        categoryName: category.name,
        manufacturerName: demoProd.extractedFields['manufacturer']?.value || demoProd.brand,
        storeName: loc.name.split(',')[0],
        storeAddress: loc.name,
        latitude: loc.lat,
        longitude: loc.lng,
        timestamp: new Date(Date.now() - (index * 86400000 * 2)).toISOString(),
        status: overall === 'APPEARS_COMPLIANT' ? ('VERIFIED_COMPLIANT' as const) : ('PENDING_VERIFICATION' as const),
        overallAssessment: overall,
        ruleVersionId: 'ver-2021-usp',
        ruleVersionCode: 'LMR-2021-USP',
        notes: `Routine market inspection of ${demoProd.name}.`,
        images: demoProd.faces.map((f, fIdx) => ({
          id: `img-${index + 1}-${fIdx}`,
          inspectionId: `seed-insp-${index + 1}`,
          face: f.face,
          imagePath: f.imageSvg,
          qualityScore: 0.95,
          qualityChecks: { blur: 'pass' as const, lighting: 'pass' as const, crop: 'pass' as const, resolution: '1280x720' },
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
          decision: 'CONFIRM' as const,
          findingSummary: 'Physical verification confirmed compliance with Rule 6 and 2021 USP amendments.',
          inspectorNotes: 'Label declarations legible and verified on sample.',
          verifiedAt: new Date().toISOString()
        } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.createInspection(inspection as any);
    });
    console.log('✅ 4 Initial Legal Metrology inspection records seeded successfully.');
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🛡️  LabelGuard India API Server Running on port ${PORT}`);
  console.log(`⚖️  Legal Metrology (Packaged Commodities) Rules, 2011`);
  console.log(`🔍  Evidence-based Compliance & Inspection Engine`);
  console.log(`=======================================================`);
  autoSeedIfEmpty();
});

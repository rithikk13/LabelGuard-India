import { Router, Request, Response } from 'express';
import { authenticate } from '../auth/middleware';
import { ComplianceEngine } from '../engine/complianceEngine';
import { ConflictEngine } from '../engine/conflictEngine';
import { db, EvidenceItem } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export const complianceRouter = Router();
complianceRouter.use(authenticate);

complianceRouter.post('/check', (req: Request, res: Response) => {
  try {
    const { categoryId, fieldsByFace, flatFields, versionId } = req.body;

    // 1. Get Category
    const category = db.getCategoryById(categoryId) || db.getCategories()[0];

    // 2. Get Requirements for selected rule version
    const selectedVersionId = versionId || 'ver-2021-usp';
    const requirements = db.getRequirementsByVersion(selectedVersionId);
    const version = db.getRegulationVersionById(selectedVersionId);

    // 3. Aggregate fields across faces (favoring back for mfg/mrp if available, or combining)
    const aggregatedFields = { ...(flatFields || {}) };
    if (fieldsByFace) {
      for (const face of Object.keys(fieldsByFace)) {
        for (const [key, fieldObj] of Object.entries(fieldsByFace[face])) {
          if (!aggregatedFields[key] || face === 'back') {
            aggregatedFields[key] = fieldObj;
          }
        }
      }
    }

    // 4. Run Deterministic Compliance Engine
    const checks = ComplianceEngine.evaluate(category, aggregatedFields, requirements);

    // 5. Run Cross-Face Conflict Engine
    const { conflicts, conflictEvidence } = fieldsByFace 
      ? ConflictEngine.detectConflicts(fieldsByFace)
      : { conflicts: [], conflictEvidence: [] };

    // 6. Build Evidence Items for compliance checks
    const checkEvidence: EvidenceItem[] = [];
    for (const check of checks) {
      if (check.boundingBox && check.sourceFace) {
        checkEvidence.push({
          id: uuidv4(),
          checkId: check.id,
          face: check.sourceFace,
          label: `${check.ruleClause}: ${check.title}`,
          boundingBox: check.boundingBox,
          extractedSnippet: check.extractedSnippet || '',
          uncertaintyLevel: check.result === 'PASS' ? 'LOW' : check.result === 'REVIEW' ? 'MODERATE' : 'HIGH',
          reason: check.details,
          ruleClause: check.ruleClause
        });
      }
    }

    const allEvidence = [...checkEvidence, ...conflictEvidence];

    // 7. Overall Assessment
    const overallAssessment = ComplianceEngine.computeOverallAssessment(checks, conflicts.length);

    return res.json({
      success: true,
      ruleVersion: version,
      category,
      checks,
      conflicts,
      evidence: allEvidence,
      overallAssessment,
      disclaimer: version?.officialDisclaimer || 'Prototype rule dataset — requires official verification.'
    });
  } catch (err: any) {
    console.error('Compliance evaluation error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

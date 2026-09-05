import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../auth/middleware';
import { db } from '../db/database';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate, requireRole('admin'));

dashboardRouter.get('/summary', (req: Request, res: Response) => {
  const inspections = db.getInspections();
  const categories = db.getCategories();

  const total = inspections.length;
  const compliant = inspections.filter(i => i.overallAssessment === 'APPEARS_COMPLIANT').length;
  const needsVerification = inspections.filter(i => i.overallAssessment === 'NEEDS_VERIFICATION').length;
  const potentialIssues = inspections.filter(i => i.overallAssessment === 'POTENTIAL_ISSUE').length;
  const pendingVerification = inspections.filter(i => i.status === 'PENDING_VERIFICATION' || i.status === 'PRELIMINARY').length;
  const verified = inspections.filter(i => i.status === 'VERIFIED_COMPLIANT' || i.status === 'VERIFIED_POTENTIAL_ISSUE').length;

  // Breakdown by Category
  const byCategory: Record<string, { total: number; potentialIssues: number; name: string }> = {};
  for (const cat of categories) {
    byCategory[cat.id] = { total: 0, potentialIssues: 0, name: cat.name };
  }

  for (const i of inspections) {
    if (byCategory[i.categoryId]) {
      byCategory[i.categoryId].total += 1;
      if (i.overallAssessment === 'POTENTIAL_ISSUE') {
        byCategory[i.categoryId].potentialIssues += 1;
      }
    }
  }

  // Issue Types Frequency
  const issueTypes: Record<string, number> = {
    'Unit Sale Price Missing / Non-Compliant': 0,
    'Conflicting MRP Declaration across Faces': 0,
    'Incomplete Consumer Care Contact': 0,
    'Mandatory Tax Inclusivity Missing on MRP': 0,
    'Country of Origin Missing (Imported)': 0,
    'Non-standard Net Quantity Units': 0
  };

  for (const i of inspections) {
    if (i.conflicts && i.conflicts.length > 0) {
      issueTypes['Conflicting MRP Declaration across Faces'] += i.conflicts.length;
    }
    for (const c of i.complianceChecks) {
      if (c.result === 'FAIL' || c.result === 'REVIEW') {
        if (c.fieldKey === 'unit_sale_price') issueTypes['Unit Sale Price Missing / Non-Compliant'] += 1;
        if (c.fieldKey === 'consumer_care') issueTypes['Incomplete Consumer Care Contact'] += 1;
        if (c.fieldKey === 'mrp') issueTypes['Mandatory Tax Inclusivity Missing on MRP'] += 1;
        if (c.fieldKey === 'country_of_origin') issueTypes['Country of Origin Missing (Imported)'] += 1;
        if (c.fieldKey === 'net_quantity') issueTypes['Non-standard Net Quantity Units'] += 1;
      }
    }
  }

  // Repeat Manufacturer Observations (Neutral wording)
  const mfgCounts: Record<string, { total: number; potentialIssues: number }> = {};
  for (const i of inspections) {
    const mfg = i.manufacturerName || 'Unspecified';
    if (!mfgCounts[mfg]) mfgCounts[mfg] = { total: 0, potentialIssues: 0 };
    mfgCounts[mfg].total += 1;
    if (i.overallAssessment === 'POTENTIAL_ISSUE') {
      mfgCounts[mfg].potentialIssues += 1;
    }
  }

  const repeatObservations = Object.entries(mfgCounts)
    .filter(([_, data]) => data.total >= 1)
    .map(([manufacturer, data]) => ({
      manufacturer,
      totalInspections: data.total,
      potentialFindingsCount: data.potentialIssues,
      statusNote: data.potentialIssues > 0 ? 'Repeated potential findings under review' : 'No adverse findings recorded'
    }))
    .sort((a, b) => b.potentialFindingsCount - a.potentialFindingsCount)
    .slice(0, 5);

  // Geospatial Map Pins
  const mapLocations = inspections
    .filter(i => i.latitude && i.longitude)
    .map(i => ({
      id: i.id,
      inspectionNumber: i.inspectionNumber,
      productName: i.productName,
      storeName: i.storeName || 'Field Site',
      latitude: i.latitude,
      longitude: i.longitude,
      assessment: i.overallAssessment,
      status: i.status,
      timestamp: i.timestamp
    }));

  return res.json({
    success: true,
    kpi: {
      totalInspections: total,
      appearsCompliant: compliant,
      needsVerification,
      potentialIssues,
      pendingVerification,
      verified
    },
    byCategory: Object.values(byCategory),
    issueTypes,
    repeatObservations,
    mapLocations,
    auditLogs: db.getAuditLogs(15)
  });
});

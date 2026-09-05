export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'consumer' | 'inspector' | 'admin';
  badgeNumber?: string;
  jurisdiction?: string;
  createdAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  isFoodCommodity: boolean;
  isImportedCommodity: boolean;
  requiresUnitSalePrice: boolean;
}

export interface RegulationVersion {
  id: string;
  code: string;
  title: string;
  effectiveFrom: string;
  effectiveTo?: string;
  amendmentSummary: string;
  isActive: boolean;
  isPrototype: boolean;
  officialDisclaimer: string;
}

export interface RuleRequirement {
  id: string;
  versionId: string;
  ruleClause: string;
  title: string;
  fieldKey: string;
  description: string;
  isMandatory: boolean;
  validationType: 'presence' | 'format' | 'standard_unit' | 'unit_sale_price' | 'contact_info' | 'date_format';
  applicableCategories?: string[];
  minNumeralHeightMm?: number;
  exceptionNotes?: string;
  sourceReference: string;
}

export interface InspectionImage {
  id: string;
  inspectionId: string;
  face: 'front' | 'back' | 'side' | 'top' | 'reference_board';
  imagePath: string; // SVG or base64 or URL
  qualityScore: number;
  qualityChecks: {
    blur: 'pass' | 'warning' | 'fail';
    lighting: 'pass' | 'warning' | 'fail';
    crop: 'pass' | 'warning' | 'fail';
    resolution: string;
  };
  capturedAt: string;
}

export interface ExtractedField {
  id: string;
  inspectionId: string;
  fieldKey: string;
  extractedValue: string;
  confidence: number;
  sourceFace: string;
  boundingBox: [number, number, number, number]; // [x, y, w, h] %
  createdAt: string;
}

export interface ComplianceCheck {
  id: string;
  inspectionId: string;
  requirementId: string;
  fieldKey?: string;
  ruleClause: string;
  result: 'PASS' | 'FAIL' | 'REVIEW' | 'NOT_APPLICABLE' | 'NOT_DETECTED';
  summary: string;
  details: string;
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  extractedSnippet?: string;
  sourceFace?: string;
  boundingBox?: [number, number, number, number];
  createdAt: string;
}

export interface ConflictItem {
  id: string;
  inspectionId: string;
  fieldKey: string;
  face1: string;
  value1: string;
  bbox1: [number, number, number, number];
  face2: string;
  value2: string;
  bbox2: [number, number, number, number];
  description: string;
  createdAt: string;
}

export interface EvidenceItem {
  id: string;
  checkId?: string;
  conflictId?: string;
  face: string;
  label: string;
  boundingBox: [number, number, number, number];
  extractedSnippet: string;
  uncertaintyLevel: 'LOW' | 'MODERATE' | 'HIGH';
  reason: string;
  ruleClause: string;
}

export interface VerificationRecord {
  id: string;
  inspectionId: string;
  inspectorId: string;
  inspectorName: string;
  decision: 'CONFIRM' | 'REJECT' | 'RE_CHECK';
  findingSummary: string;
  inspectorNotes?: string;
  verifiedAt: string;
}

export interface Inspection {
  id: string;
  inspectionNumber: string;
  userId: string;
  role: 'consumer' | 'inspector' | 'admin';
  productName: string;
  categoryId: string;
  categoryName: string;
  manufacturerName: string;
  storeName?: string;
  storeAddress?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  status: 'DRAFT' | 'PRELIMINARY' | 'PENDING_VERIFICATION' | 'VERIFIED_COMPLIANT' | 'VERIFIED_POTENTIAL_ISSUE' | 'REJECTED';
  overallAssessment: 'APPEARS_COMPLIANT' | 'NEEDS_VERIFICATION' | 'POTENTIAL_ISSUE';
  ruleVersionId: string;
  ruleVersionCode: string;
  notes?: string;
  images: InspectionImage[];
  extractedFields: ExtractedField[];
  complianceChecks: ComplianceCheck[];
  conflicts: ConflictItem[];
  evidence: EvidenceItem[];
  verification?: VerificationRecord;
  createdAt: string;
  updatedAt: string;
}

export interface DemoProduct {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  barcode: string;
  scenarioDescription: string;
  expectedOutcome: 'APPEARS_COMPLIANT' | 'NEEDS_VERIFICATION' | 'POTENTIAL_ISSUE';
  expectedFindings: string[];
  faces: {
    face: 'front' | 'back' | 'side';
    title: string;
    imageSvg: string;
    rawOcrText: string;
    detectedLanguage: string;
    ocrConfidence: number;
    boundingBoxes: Array<{
      fieldKey: string;
      text: string;
      box: [number, number, number, number];
      confidence: number;
    }>;
  }[];
  extractedFields: Record<string, {
    value: string;
    face: string;
    box: [number, number, number, number];
    confidence: number;
  }>;
}

export type OcrSource = 'REAL_OCR' | 'DEMO_OCR' | 'DEMO_OCR_FALLBACK';

export interface ImageQualityResult {
  overallScore: number;
  isAcceptable: boolean;
  checks: {
    blur: 'pass' | 'warning' | 'fail';
    lighting: 'pass' | 'warning' | 'fail';
    crop: 'pass' | 'warning' | 'fail';
    resolution: string;
  };
  recommendation: string;
}

export interface DashboardSummary {
  kpi: {
    totalInspections: number;
    appearsCompliant: number;
    needsVerification: number;
    potentialIssues: number;
    pendingVerification: number;
    verified: number;
  };
  byCategory: Array<{ total: number; potentialIssues: number; name: string }>;
  issueTypes: Record<string, number>;
  repeatObservations: Array<{
    manufacturer: string;
    totalInspections: number;
    potentialFindingsCount: number;
    statusNote: string;
  }>;
  mapLocations: Array<{
    id: string;
    inspectionNumber: string;
    productName: string;
    storeName: string;
    latitude: number;
    longitude: number;
    assessment: string;
    status: string;
    timestamp: string;
  }>;
  auditLogs: Array<{
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    userId?: string;
    previousState?: any;
    newState?: any;
    timestamp: string;
  }>;
}

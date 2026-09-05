import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  REGULATION_VERSIONS,
  RULE_REQUIREMENTS,
  PRODUCT_CATEGORIES,
  RegulationVersion,
  RuleRequirement,
  ProductCategory
} from '../regulatory/ruleDefinitions';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'consumer' | 'inspector' | 'admin';
  badgeNumber?: string;
  jurisdiction?: string;
  createdAt: string;
  passwordHash?: string;
}

export interface InspectionImage {
  id: string;
  inspectionId: string;
  face: 'front' | 'back' | 'side' | 'top' | 'reference_board';
  imagePath: string;
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
  imageId?: string;
  fieldKey: string;
  extractedValue: string;
  normalizedValue?: string;
  confidence: number;
  sourceFace: string;
  boundingBox: [number, number, number, number]; // [x, y, w, h] in normalized % 0-100
  isMultilingual?: boolean;
  detectedLanguage?: string;
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

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId?: string;
  previousState?: any;
  newState?: any;
  timestamp: string;
}

export interface SyncQueueItem {
  id: string;
  inspectionId: string;
  payload: any;
  idempotencyKey: string;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  retryCount: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseState {
  users: User[];
  productCategories: ProductCategory[];
  regulationVersions: RegulationVersion[];
  requirements: RuleRequirement[];
  inspections: Inspection[];
  auditLogs: AuditLog[];
  syncQueue: SyncQueueItem[];
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class RelationalDatabase {
  private state: DatabaseState;

  constructor() {
    this.ensureDirectory();
    this.state = this.loadDatabase();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private getDefaultState(): DatabaseState {
    const defaultUsers: User[] = [
      {
        id: 'usr-insp-101',
        username: 'inspector.ramesh',
        fullName: 'Ramesh Sharma',
        email: 'ramesh.sharma@legalmetrology.gov.in',
        role: 'inspector',
        badgeNumber: 'LM-DEL-2024-88',
        jurisdiction: 'New Delhi Central District',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-admin-201',
        username: 'admin.mukherjee',
        fullName: 'Dr. S. Mukherjee',
        email: 's.mukherjee@consumeraffairs.gov.in',
        role: 'admin',
        badgeNumber: 'LM-HQ-ADMIN-01',
        jurisdiction: 'National Directorate',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-consumer-301',
        username: 'consumer.priya',
        fullName: 'Priya Nair',
        email: 'priya.nair@example.com',
        role: 'consumer',
        createdAt: new Date().toISOString()
      }
    ];

    return {
      users: defaultUsers,
      productCategories: PRODUCT_CATEGORIES,
      regulationVersions: REGULATION_VERSIONS,
      requirements: RULE_REQUIREMENTS,
      inspections: [],
      auditLogs: [],
      syncQueue: []
    };
  }

  private loadDatabase(): DatabaseState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure standard reference catalogs stay synced
        parsed.productCategories = PRODUCT_CATEGORIES;
        parsed.regulationVersions = REGULATION_VERSIONS;
        parsed.requirements = RULE_REQUIREMENTS;
        return parsed;
      }
    } catch (err) {
      console.warn('Could not read existing db.json, creating initial state:', err);
    }
    const fresh = this.getDefaultState();
    this.saveState(fresh);
    return fresh;
  }

  public save(): void {
    this.saveState(this.state);
  }

  private saveState(state: DatabaseState): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  // Users
  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public getUserByUsername(username: string): User | undefined {
    return this.state.users.find(u => u.username === username);
  }

  // Categories
  public getCategories(): ProductCategory[] {
    return this.state.productCategories;
  }

  public getCategoryById(id: string): ProductCategory | undefined {
    return this.state.productCategories.find(c => c.id === id);
  }

  // Regulations & Requirements
  public getRegulationVersions(): RegulationVersion[] {
    return this.state.regulationVersions;
  }

  public getRegulationVersionById(id: string): RegulationVersion | undefined {
    return this.state.regulationVersions.find(v => v.id === id);
  }

  public getRequirementsByVersion(versionId: string): RuleRequirement[] {
    return this.state.requirements.filter(r => r.versionId === versionId);
  }

  public getAllRequirements(): RuleRequirement[] {
    return this.state.requirements;
  }

  // Inspections
  public getInspections(): Inspection[] {
    return this.state.inspections;
  }

  public getInspectionById(id: string): Inspection | undefined {
    return this.state.inspections.find(i => i.id === id);
  }

  public createInspection(inspection: Inspection): Inspection {
    this.state.inspections.unshift(inspection);
    this.logAudit('inspection', inspection.id, 'CREATE', inspection.userId, null, inspection.status);
    this.save();
    return inspection;
  }

  public updateInspection(id: string, updates: Partial<Inspection>, userId?: string): Inspection | undefined {
    const index = this.state.inspections.findIndex(i => i.id === id);
    if (index === -1) return undefined;
    const prev = this.state.inspections[index];
    const updated = {
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.state.inspections[index] = updated;
    this.logAudit('inspection', id, 'UPDATE', userId, prev.status, updated.status);
    this.save();
    return updated;
  }

  // Audit Logs
  public logAudit(entityType: string, entityId: string, action: string, userId?: string, previousState?: any, newState?: any): void {
    const entry: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entityType,
      entityId,
      action,
      userId,
      previousState,
      newState,
      timestamp: new Date().toISOString()
    };
    this.state.auditLogs.unshift(entry);
    if (this.state.auditLogs.length > 2000) {
      this.state.auditLogs.pop();
    }
  }

  public getAuditLogs(limit: number = 100): AuditLog[] {
    return this.state.auditLogs.slice(0, limit);
  }

  // Sync Queue
  public enqueueSync(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'updatedAt' | 'retryCount'>): SyncQueueItem {
    const existing = this.state.syncQueue.find(s => s.idempotencyKey === item.idempotencyKey);
    if (existing) return existing;

    const queued: SyncQueueItem = {
      id: uuidv4(),
      ...item,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.state.syncQueue.push(queued);
    this.save();
    return queued;
  }

  public updateSyncStatus(id: string, status: SyncQueueItem['status'], lastError?: string): void {
    const item = this.state.syncQueue.find(s => s.id === id);
    if (item) {
      item.status = status;
      item.lastError = lastError;
      item.updatedAt = new Date().toISOString();
      if (status === 'FAILED') item.retryCount += 1;
      this.save();
    }
  }

  public getSyncQueue(): SyncQueueItem[] {
    return this.state.syncQueue;
  }
}

export const db = new RelationalDatabase();

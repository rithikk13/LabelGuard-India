import {
  Inspection,
  ProductCategory,
  RegulationVersion,
  RuleRequirement,
  DemoProduct,
  DashboardSummary,
  ImageQualityResult
} from '../types';

const API_BASE = 'https://labelguard-india.onrender.com/api';

export class ApiService {
  private static getToken(): string | null {
    try { return localStorage.getItem('labelguard_auth_token'); } catch { return null; }
  }

  private static headers(extra: Record<string, string> = {}): Record<string, string> {
    const token = this.getToken();
    return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
  }

  // Health
  public static async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  }

  // Auth
  public static async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  }

  public static async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: this.headers() });
    return res.json();
  }

  // Inspections
  public static async getInspections(params?: { status?: string; categoryId?: string; search?: string; role?: string }) {
    const url = new URL(`${window.location.origin}${API_BASE}/inspections`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) url.searchParams.append(k, v);
      });
    }
    const res = await fetch(url.toString(), { headers: this.headers() });
    return res.json();
  }

  public static async getInspectionById(id: string): Promise<{ success: boolean; inspection: Inspection }> {
    const res = await fetch(`${API_BASE}/inspections/${id}`, { headers: this.headers() });
    return res.json();
  }

  public static async createInspection(data: Partial<Inspection>): Promise<{ success: boolean; inspection: Inspection }> {
    const res = await fetch(`${API_BASE}/inspections`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    return res.json();
  }

  public static async verifyInspection(id: string, decision: 'CONFIRM' | 'REJECT' | 'RE_CHECK', inspectorNotes: string, inspectorId?: string) {
    const res = await fetch(`${API_BASE}/inspections/${id}/verify`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ decision, inspectorNotes, inspectorId })
    });
    return res.json();
  }

  public static async overrideCategory(id: string, categoryId: string, userId?: string) {
    const res = await fetch(`${API_BASE}/inspections/${id}/category`, {
      method: 'PATCH',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ categoryId, userId })
    });
    return res.json();
  }

  // OCR & Analysis
  public static async runOcr(payload: {
    imageContent: string;
    face?: string;
    demoProductId?: string;
    fileSizeKb?: number;
    width?: number;
    height?: number;
  }) {
    const res = await fetch(`${API_BASE}/analysis/ocr`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  // Compliance Engine
  public static async checkCompliance(payload: {
    categoryId: string;
    fieldsByFace?: Record<string, any>;
    flatFields?: Record<string, any>;
    versionId?: string;
  }) {
    const res = await fetch(`${API_BASE}/compliance/check`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  // Rules
  public static async getRuleVersions(): Promise<{ success: boolean; versions: RegulationVersion[]; disclaimer: string }> {
    const res = await fetch(`${API_BASE}/rules/versions`, { headers: this.headers() });
    return res.json();
  }

  public static async getCategories(): Promise<{ success: boolean; categories: ProductCategory[] }> {
    const res = await fetch(`${API_BASE}/rules/categories`, { headers: this.headers() });
    return res.json();
  }

  public static async getRequirements(versionId?: string): Promise<{ success: boolean; requirements: RuleRequirement[]; disclaimer: string }> {
    const url = versionId ? `${API_BASE}/rules/requirements?versionId=${versionId}` : `${API_BASE}/rules/requirements`;
    const res = await fetch(url, { headers: this.headers() });
    return res.json();
  }

  // Dashboard
  public static async getDashboardSummary(): Promise<{ success: boolean } & DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard/summary`, { headers: this.headers() });
    return res.json();
  }

  // Demo
  public static async getDemoProducts(): Promise<{ success: boolean; products: DemoProduct[] }> {
    const res = await fetch(`${API_BASE}/demo/products`, { headers: this.headers() });
    return res.json();
  }

  public static async seedDemo(): Promise<{ success: boolean; count: number; seeded: Inspection[] }> {
    const res = await fetch(`${API_BASE}/demo/seed`, { method: 'POST', headers: this.headers() });
    return res.json();
  }

  // Sync
  public static async syncBatch(items: Array<{ idempotencyKey: string; inspectionData: any }>) {
    const res = await fetch(`${API_BASE}/sync/batch`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ items })
    });
    return res.json();
  }

  // Reports
  public static getReportPdfUrl(inspectionId: string): string {
    return `${API_BASE}/reports/${inspectionId}/pdf`;
  }
}

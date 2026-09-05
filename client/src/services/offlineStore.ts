import { Inspection } from '../types';
import { ApiService } from './api';

export type SyncState = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNCED' | 'SYNC_FAILED';

export interface OfflineItem {
  idempotencyKey: string;
  inspection: Partial<Inspection>;
  timestamp: string;
  status: 'QUEUED' | 'SYNCING' | 'SYNCED' | 'FAILED';
  lastError?: string;
}

const STORAGE_KEY = 'labelguard_offline_queue';

export class OfflineStore {
  public static getQueue(): OfflineItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static enqueue(inspection: Partial<Inspection>): OfflineItem {
    const queue = this.getQueue();
    const item: OfflineItem = {
      idempotencyKey: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      inspection,
      timestamp: new Date().toISOString(),
      status: 'QUEUED'
    };
    queue.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    return item;
  }

  public static remove(idempotencyKey: string): void {
    const queue = this.getQueue().filter(i => i.idempotencyKey !== idempotencyKey);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  }

  public static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  public static async syncAll(): Promise<{ synced: number; failed: number }> {
    const queue = this.getQueue().filter(i => i.status === 'QUEUED' || i.status === 'FAILED');
    if (queue.length === 0) return { synced: 0, failed: 0 };

    const payload = queue.map(q => ({
      idempotencyKey: q.idempotencyKey,
      inspectionData: q.inspection
    }));

    try {
      const response = await ApiService.syncBatch(payload);
      if (response.success && Array.isArray(response.results)) {
        let synced = 0;
        let failed = 0;
        for (const res of response.results) {
          if (res.status === 'SUCCESS' || res.status === 'ALREADY_SYNCED') {
            this.remove(res.idempotencyKey);
            synced++;
          } else {
            failed++;
          }
        }
        return { synced, failed };
      }
      return { synced: 0, failed: queue.length };
    } catch {
      return { synced: 0, failed: queue.length };
    }
  }
}

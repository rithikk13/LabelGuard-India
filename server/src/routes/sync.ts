import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../auth/middleware';
import { db, Inspection } from '../db/database';

export const syncRouter = Router();
syncRouter.use(authenticate, requireRole('inspector', 'admin'));

syncRouter.post('/batch', (req: Request, res: Response) => {
  try {
    const { items } = req.body; // Array of { idempotencyKey, inspectionData }

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Invalid sync payload' });
    }

    const results = [];

    for (const item of items) {
      const { idempotencyKey, inspectionData } = item;

      // Check if already synced
      const existingInspection = db.getInspections().find(
        i => i.id === inspectionData.id || (i as any).idempotencyKey === idempotencyKey
      );

      if (existingInspection) {
        results.push({
          idempotencyKey,
          status: 'ALREADY_SYNCED',
          inspectionId: existingInspection.id
        });
        continue;
      }

      // Enqueue and save
      const queued = db.enqueueSync({
        inspectionId: inspectionData.id,
        payload: inspectionData,
        idempotencyKey,
        status: 'SYNCED'
      });

      // Insert inspection
      const created = db.createInspection({
        ...inspectionData,
        syncedAt: new Date().toISOString()
      } as Inspection);

      results.push({
        idempotencyKey,
        status: 'SUCCESS',
        inspectionId: created.id
      });
    }

    return res.json({
      success: true,
      processed: results.length,
      results
    });
  } catch (err: any) {
    console.error('Sync batch error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

syncRouter.get('/queue', (req: Request, res: Response) => {
  const queue = db.getSyncQueue();
  return res.json({ success: true, total: queue.length, queue });
});

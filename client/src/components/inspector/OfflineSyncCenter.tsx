import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { OfflineStore, OfflineItem, SyncState } from '../../services/offlineStore';

export const OfflineSyncCenter: React.FC = () => {
  const [queue, setQueue] = useState<OfflineItem[]>([]);
  const [syncState, setSyncState] = useState<SyncState>(navigator.onLine ? 'ONLINE' : 'OFFLINE');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ synced: number; failed: number } | null>(null);

  const loadQueue = () => {
    setQueue(OfflineStore.getQueue());
  };

  useEffect(() => {
    loadQueue();

    const handleOnline = () => setSyncState('ONLINE');
    const handleOffline = () => setSyncState('OFFLINE');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualSync = async () => {
    if (!navigator.onLine) {
      alert('Cannot synchronize: Network connection offline. Synchronization will resume when connection is re-established.');
      return;
    }

    setIsSyncing(true);
    setSyncState('SYNCING');

    const result = await OfflineStore.syncAll();
    setIsSyncing(false);
    setLastSyncResult(result);
    setSyncState(result.failed > 0 ? 'SYNC_FAILED' : 'SYNCED');
    loadQueue();

    setTimeout(() => {
      setSyncState(navigator.onLine ? 'ONLINE' : 'OFFLINE');
    }, 4000);
  };

  const handleSimulateOfflineScan = () => {
    OfflineStore.enqueue({
      id: `offline-insp-${Date.now()}`,
      productName: 'Sample Packaged Tea 250g (Offline Capture)',
      categoryName: 'Packaged Food Staples',
      storeName: 'Rural Mandi Trader, Narela',
      timestamp: new Date().toISOString(),
      status: 'PENDING_VERIFICATION',
      overallAssessment: 'NEEDS_VERIFICATION'
    });
    loadQueue();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
              OFFLINE-FIRST
            </span>
            <span className="text-xs text-slate-500 font-semibold">Field Synchronization Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Inspection Sync Center
          </h1>
        </div>

        {/* Sync Status Pill */}
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            syncState === 'ONLINE' || syncState === 'SYNCED'
              ? 'bg-emerald-100 text-emerald-800'
              : syncState === 'SYNCING'
              ? 'bg-sky-100 text-sky-800'
              : syncState === 'OFFLINE'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-rose-100 text-rose-800'
          }`}>
            {syncState === 'ONLINE' || syncState === 'SYNCED' ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            ) : syncState === 'SYNCING' ? (
              <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>Status: {syncState}</span>
          </span>
        </div>
      </div>

      {/* Action Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900">
              Pending Offline Inspection Queue ({queue.length})
            </h2>
            <p className="text-xs text-slate-500">
              Field inspections captured in remote areas are stored locally and synced with conflict-free idempotency protection.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSimulateOfflineScan}
              className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              + Add Simulated Offline Scan
            </button>
            <button
              onClick={handleManualSync}
              disabled={isSyncing || queue.length === 0}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync All ({queue.length})</span>
            </button>
          </div>
        </div>

        {lastSyncResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Synchronization complete: {lastSyncResult.synced} inspection(s) successfully recorded in central registry.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Queue List */}
      <div className="space-y-3">
        {queue.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">All Field Records Synchronized</h3>
            <p className="text-xs text-slate-500">
              There are no pending offline inspections awaiting upload to the Directorate database.
            </p>
          </div>
        ) : (
          queue.map((item) => (
            <div
              key={item.idempotencyKey}
              className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-900">
                    {item.inspection.productName}
                  </span>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {item.inspection.categoryName}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{new Date(item.timestamp).toLocaleTimeString('en-IN')}</span>
                  </span>
                  <span>•</span>
                  <span>Location: {item.inspection.storeName}</span>
                  <span>•</span>
                  <span className="font-mono text-[10px] text-slate-400">Key: {item.idempotencyKey.substring(0, 16)}...</span>
                </div>
              </div>

              <span className="self-start sm:self-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                Queued Locally
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

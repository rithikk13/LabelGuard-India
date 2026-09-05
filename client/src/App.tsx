import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { LoginScreen } from './components/common/LoginScreen';
import { ConsumerScan } from './components/consumer/ConsumerScan';
import { ConsumerResult } from './components/consumer/ConsumerResult';
import { ConsumerHistory } from './components/consumer/ConsumerHistory';
import { NewInspection } from './components/inspector/NewInspection';
import { EvidenceViewer } from './components/inspector/EvidenceViewer';
import { CalibrationBoard } from './components/inspector/CalibrationBoard';
import { OfflineSyncCenter } from './components/inspector/OfflineSyncCenter';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DemoShowcase } from './components/demo/DemoShowcase';
import { ApiService } from './services/api';
import { OfflineStore } from './services/offlineStore';
import { User, ProductCategory, RegulationVersion, DemoProduct, Inspection } from './types';
import { Ruler, Wifi, Plus, History as HistoryIcon, Layers } from 'lucide-react';

export function App() {
  const [currentMode, setCurrentMode] = useState<'consumer' | 'inspector' | 'admin' | 'demo'>('consumer');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try { const raw = localStorage.getItem('labelguard_auth_user'); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Catalogs
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [versions, setVersions] = useState<RegulationVersion[]>([]);
  const [demoProducts, setDemoProducts] = useState<DemoProduct[]>([]);

  // Consumer Sub-state
  const [consumerTab, setConsumerTab] = useState<'scan' | 'result' | 'history'>('scan');
  const [consumerResultData, setConsumerResultData] = useState<any>(null);
  const [consumerHistory, setConsumerHistory] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('labelguard_consumer_history');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Inspector Sub-state
  const [inspectorTab, setInspectorTab] = useState<'new' | 'evidence' | 'calibration' | 'sync'>('new');
  const [inspectedItem, setInspectedItem] = useState<Inspection | null>(null);

  // Load catalogs on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        const [catRes, verRes, demoRes] = await Promise.all([
          ApiService.getCategories(),
          ApiService.getRuleVersions(),
          ApiService.getDemoProducts()
        ]);

        if (catRes.success) setCategories(catRes.categories);
        if (verRes.success) setVersions(verRes.versions);
        if (demoRes.success) setDemoProducts(demoRes.products);
        // The login screen establishes the authenticated session; do not silently log in a demo user.

        setPendingSyncCount(OfflineStore.getQueue().length);
      } catch (err) {
        console.error('Failed to initialize app state:', err);
      }
    };

    if (localStorage.getItem('labelguard_auth_token')) {
      ApiService.getCurrentUser().then((res) => {
        if (!res.success) {
          localStorage.removeItem('labelguard_auth_token');
          localStorage.removeItem('labelguard_auth_user');
          setCurrentUser(null);
        } else {
          setCurrentUser(res.user);
        }
      }).catch(() => {
        // Keep cached session during temporary network failures.
      });
    }

    if (currentUser) initApp();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  // Save consumer history to local storage
  const handleSaveConsumerHistory = (item: any) => {
    const updated = [item, ...consumerHistory];
    setConsumerHistory(updated);
    localStorage.setItem('labelguard_consumer_history', JSON.stringify(updated));
  };

  const handleClearConsumerHistory = () => {
    setConsumerHistory([]);
    localStorage.removeItem('labelguard_consumer_history');
  };

  const handleSelectMode = (mode: 'consumer' | 'inspector' | 'admin' | 'demo') => {
    if (!currentUser) return;
    if (mode === 'inspector' && !['inspector', 'admin'].includes(currentUser.role)) return;
    if (mode === 'admin' && currentUser.role !== 'admin') return;
    setCurrentMode(mode);
    if (mode === 'consumer') setConsumerTab('scan');
  };

  const handleLogout = () => {
    localStorage.removeItem('labelguard_auth_token');
    localStorage.removeItem('labelguard_auth_user');
    setCurrentUser(null);
    setCurrentMode('consumer');
  };

  if (!currentUser) {
    return <LoginScreen onLogin={(user) => { setCurrentUser(user); setCurrentMode(user.role === 'admin' ? 'admin' : user.role === 'inspector' ? 'inspector' : 'consumer'); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Universal Navigation Header */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        currentUser={currentUser}
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onLogout={handleLogout}
      />

      {/* Sub-Navigation for Consumer Mode */}
      {currentMode === 'consumer' && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 flex justify-between items-center h-11 text-xs font-bold">
            <div className="flex space-x-4">
              <button
                onClick={() => setConsumerTab('scan')}
                className={`py-3 border-b-2 transition ${
                  consumerTab === 'scan' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Scan Product
              </button>
              {consumerResultData && (
                <button
                  onClick={() => setConsumerTab('result')}
                  className={`py-3 border-b-2 transition ${
                    consumerTab === 'result' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Current Result
                </button>
              )}
              <button
                onClick={() => setConsumerTab('history')}
                className={`py-3 border-b-2 transition flex items-center space-x-1 ${
                  consumerTab === 'history' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <HistoryIcon className="w-3.5 h-3.5" />
                <span>Scan History ({consumerHistory.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Navigation for Inspector Mode */}
      {currentMode === 'inspector' && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 flex justify-between items-center h-11 text-xs font-bold">
            <div className="flex space-x-4">
              <button
                onClick={() => setInspectorTab('new')}
                className={`py-3 border-b-2 transition flex items-center space-x-1 ${
                  inspectorTab === 'new' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Inspection</span>
              </button>

              {inspectedItem && (
                <button
                  onClick={() => setInspectorTab('evidence')}
                  className={`py-3 border-b-2 transition flex items-center space-x-1 ${
                    inspectorTab === 'evidence' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Evidence Studio</span>
                </button>
              )}

              <button
                onClick={() => setInspectorTab('calibration')}
                className={`py-3 border-b-2 transition flex items-center space-x-1 ${
                  inspectorTab === 'calibration' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Ruler className="w-3.5 h-3.5 text-sky-600" />
                <span>Rule 7 Calibration Tool</span>
              </button>

              <button
                onClick={() => setInspectorTab('sync')}
                className={`py-3 border-b-2 transition flex items-center space-x-1 ${
                  inspectorTab === 'sync' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sync Center</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Mode View Routing */}
      <main className="flex-1">
        {currentMode === 'consumer' && (
          <>
            {consumerTab === 'scan' && (
              <ConsumerScan
                demoProducts={demoProducts}
                onScanComplete={(result) => {
                  setConsumerResultData(result);
                  setConsumerTab('result');
                }}
              />
            )}
            {consumerTab === 'result' && consumerResultData && (
              <ConsumerResult
                data={consumerResultData}
                onBack={() => setConsumerTab('scan')}
                onSaveHistory={handleSaveConsumerHistory}
              />
            )}
            {consumerTab === 'history' && (
              <ConsumerHistory
                history={consumerHistory}
                onClearHistory={handleClearConsumerHistory}
                onNewScan={() => setConsumerTab('scan')}
              />
            )}
          </>
        )}

        {currentMode === 'inspector' && (
          <>
            {inspectorTab === 'new' && (
              <NewInspection
                categories={categories}
                demoProducts={demoProducts}
                onInspectionCreated={(created) => {
                  setInspectedItem(created);
                  setInspectorTab('evidence');
                }}
                onOpenEvidenceViewer={(item) => {
                  setInspectedItem(item);
                  setInspectorTab('evidence');
                }}
              />
            )}

            {inspectorTab === 'evidence' && inspectedItem && (
              <EvidenceViewer
                inspection={inspectedItem}
                onBack={() => setInspectorTab('new')}
              />
            )}

            {inspectorTab === 'calibration' && (
              <CalibrationBoard />
            )}

            {inspectorTab === 'sync' && (
              <OfflineSyncCenter />
            )}
          </>
        )}

        {currentMode === 'admin' && (
          <AdminDashboard
            categories={categories}
            versions={versions}
            onInspectEvidence={(inspection) => {
              setInspectedItem(inspection);
              setCurrentMode('inspector');
              setInspectorTab('evidence');
            }}
          />
        )}

        {currentMode === 'demo' && (
          <DemoShowcase
            demoProducts={demoProducts}
            onOpenInspectorMode={() => {
              setCurrentMode('inspector');
              setInspectorTab('new');
            }}
            onOpenAdminDashboard={() => {
              setCurrentMode('admin');
            }}
            onOpenConsumerScan={() => {
              setCurrentMode('consumer');
              setConsumerTab('scan');
            }}
          />
        )}
      </main>

      {/* Official Government Prototype Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="font-bold text-slate-200">
              LabelGuard India — Smart Legal Metrology Compliance Platform
            </div>
            <p className="text-[11px] text-slate-400">
              Designed for Smart India Hackathon 2026 (SIH26034) • Ministry of Consumer Affairs, Food & Public Distribution
            </p>
          </div>
          <div className="text-[11px] text-slate-500">
            Prototype Evaluation Dataset • Conforms with Legal Metrology (Packaged Commodities) Rules, 2011 & GSR 779(E)
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

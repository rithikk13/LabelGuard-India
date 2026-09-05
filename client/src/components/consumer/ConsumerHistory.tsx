import React from 'react';
import { History, CheckCircle2, AlertTriangle, XCircle, Trash2, Calendar } from 'lucide-react';

interface ConsumerHistoryProps {
  history: any[];
  onClearHistory: () => void;
  onNewScan: () => void;
}

export const ConsumerHistory: React.FC<ConsumerHistoryProps> = ({ history, onClearHistory, onNewScan }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2">
            <History className="w-6 h-6 text-sky-600" />
            <span>Local Scan History</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Preliminary screening records saved locally on this browser session
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <History className="w-12 h-12 mx-auto text-slate-300" />
          <h2 className="text-sm font-bold text-slate-800">No Scans Recorded Yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you scan products in Consumer Mode, preliminary screening results can be saved locally here for quick reference.
          </p>
          <button
            onClick={onNewScan}
            className="mt-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Scan a Product Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const isGreen = item.overallAssessment === 'APPEARS_COMPLIANT';
            const isYellow = item.overallAssessment === 'NEEDS_VERIFICATION';

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-xs hover:border-slate-300 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {isGreen ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isYellow ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span className="font-bold text-sm text-slate-900">{item.productName}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(item.timestamp).toLocaleDateString('en-IN')}</span>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{item.passCount} passed</span>
                    {item.issueCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-rose-700 font-semibold">{item.issueCount} issues flagged</span>
                      </>
                    )}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isGreen
                      ? 'bg-emerald-100 text-emerald-800'
                      : isYellow
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isGreen ? 'Compliant' : isYellow ? 'Review' : 'Issue Flagged'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

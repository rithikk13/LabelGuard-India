import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowLeft, BookmarkCheck, PhoneCall, ShieldAlert, Sparkles, Eye, Scale } from 'lucide-react';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

interface ConsumerResultProps {
  data: any;
  onBack: () => void;
  onSaveHistory: (item: any) => void;
}

export const ConsumerResult: React.FC<ConsumerResultProps> = ({ data, onBack, onSaveHistory }) => {
  const { product, complianceResult, ocrResult } = data;
  const { overallAssessment, checks = [], conflicts = [], evidence = [] } = complianceResult;

  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'raw_ocr'>('overview');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(evidence[0]?.id || null);
  const [isSaved, setIsSaved] = useState(false);

  // Status mapping
  const isGreen = overallAssessment === 'APPEARS_COMPLIANT';
  const isYellow = overallAssessment === 'NEEDS_VERIFICATION';
  const isRed = overallAssessment === 'POTENTIAL_ISSUE';

  const statusTitle = isGreen 
    ? 'Appears Compliant'
    : isYellow
    ? 'Needs Manual Verification'
    : 'Potential Compliance Issue Detected';

  const statusBg = isGreen
    ? 'bg-emerald-600 text-white'
    : isYellow
    ? 'bg-amber-500 text-slate-950'
    : 'bg-rose-600 text-white';

  const passCount = checks.filter((c: any) => c.result === 'PASS').length;
  const reviewCount = checks.filter((c: any) => c.result === 'REVIEW' || c.result === 'NOT_DETECTED').length;
  const failCount = checks.filter((c: any) => c.result === 'FAIL').length;
  const conflictCount = conflicts.length;

  const handleSave = () => {
    onSaveHistory({
      id: `scan-${Date.now()}`,
      productName: product.name,
      overallAssessment,
      timestamp: new Date().toISOString(),
      passCount,
      issueCount: failCount + conflictCount
    });
    setIsSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Back & Save Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Scan Another Product</span>
        </button>

        <button
          onClick={handleSave}
          disabled={isSaved}
          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            isSaved
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>{isSaved ? 'Saved to Scan History' : 'Save Result Locally'}</span>
        </button>
      </div>

      {/* Main Status Hero */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className={`p-5 sm:p-6 ${statusBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {isGreen ? (
                  <CheckCircle2 className="w-6 h-6 text-white" />
                ) : isYellow ? (
                  <AlertTriangle className="w-6 h-6 text-slate-950" />
                ) : (
                  <XCircle className="w-6 h-6 text-white" />
                )}
                <span className="text-xl sm:text-2xl font-black tracking-tight">{statusTitle}</span>
              </div>
              <p className="text-xs sm:text-sm opacity-90">
                Preliminary evaluation under Legal Metrology (Packaged Commodities) Rules, 2011
              </p>
            </div>

            {/* Metric Pills */}
            <div className="flex items-center space-x-2 bg-black/20 p-2 rounded-xl backdrop-blur-xs text-xs font-bold">
              <span className="text-emerald-300">{passCount} Passed</span>
              <span className="opacity-40">•</span>
              <span className="text-amber-300">{reviewCount} Review</span>
              <span className="opacity-40">•</span>
              <span className="text-rose-300">{failCount + conflictCount} Issues</span>
            </div>
          </div>
        </div>

        {/* Product Meta Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Identified</span>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">{product.name}</h2>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rule Version</span>
            <div className="text-xs font-mono font-semibold text-sky-700">LMR-2021-USP (Amendment Rules)</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 px-4 flex space-x-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'overview' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Compliance Checklist ({checks.length})
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'evidence' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Highlighted Evidence ({evidence.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('raw_ocr')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'raw_ocr' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Raw OCR Text
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Conflict Alert Banner if any */}
          {conflicts && conflicts.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Conflicting Declaration Detected Across Package Faces!</span>
              </div>
              {conflicts.map((c: any, idx: number) => (
                <div key={idx} className="text-xs text-rose-800 bg-white/70 p-3 rounded-lg border border-rose-200 space-y-1">
                  <p className="font-semibold">{c.description}</p>
                  <div className="grid grid-cols-2 gap-2 mt-1 text-[11px]">
                    <div className="bg-rose-100/60 p-1.5 rounded">
                      <span className="font-bold">{c.face1.toUpperCase()} Face: </span>
                      <span>{c.value1}</span>
                    </div>
                    <div className="bg-rose-100/60 p-1.5 rounded">
                      <span className="font-bold">{c.face2.toUpperCase()} Face: </span>
                      <span>{c.value2}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-3">
              {checks.map((check: any) => {
                const isPass = check.result === 'PASS';
                const isFail = check.result === 'FAIL';
                const isRev = check.result === 'REVIEW' || check.result === 'NOT_DETECTED';

                return (
                  <div
                    key={check.id}
                    className={`p-3.5 rounded-xl border text-xs transition-all ${
                      isPass
                        ? 'bg-emerald-50/50 border-emerald-200/80'
                        : isFail
                        ? 'bg-rose-50/80 border-rose-300'
                        : 'bg-amber-50/60 border-amber-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {check.ruleClause}
                          </span>
                          <span className="font-bold text-slate-900">{check.title}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{check.summary}</p>
                        {check.details && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">{check.details}</p>
                        )}
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0 ${
                          isPass
                            ? 'bg-emerald-200 text-emerald-900'
                            : isFail
                            ? 'bg-rose-200 text-rose-900'
                            : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {check.result}
                      </span>
                    </div>

                    {check.extractedSnippet && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] font-mono text-slate-600 bg-white/50 px-2 py-1 rounded">
                        <span className="text-slate-400">Detected Snippet: </span>
                        <span className="font-semibold text-slate-800">{check.extractedSnippet}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Click any evidence marker to inspect the exact region identified on the product packaging:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Evidence List */}
                <div className="space-y-2">
                  {evidence.map((ev: any) => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvidenceId(ev.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                        selectedEvidenceId === ev.id
                          ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300/30'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{ev.label}</span>
                        <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded capitalize">
                          {ev.face} Face
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1">{ev.reason}</p>
                      <div className="mt-1 text-[10px] text-slate-400 font-mono">
                        Rule: {ev.ruleClause}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Evidence Package Graphic with Highlighted Coordinate */}
                <div className="relative rounded-xl border border-slate-300 bg-slate-900/5 aspect-[3/4] flex items-center justify-center overflow-hidden p-2">
                  {product.faces && product.faces[0]?.imageSvg ? (
                    <div
                      className="w-full h-full flex items-center justify-center relative"
                      dangerouslySetInnerHTML={{ __html: product.faces[0].imageSvg }}
                    />
                  ) : (
                    <div className="text-xs text-slate-400">Packaging image visual unavailable</div>
                  )}

                  {/* Active Highlight Overlay */}
                  {selectedEvidenceId && (() => {
                    const activeItem = evidence.find((e: any) => e.id === selectedEvidenceId);
                    if (!activeItem || !activeItem.boundingBox) return null;
                    const [x, y, w, h] = activeItem.boundingBox;

                    return (
                      <div
                        className="absolute border-2 border-rose-600 bg-rose-500/20 rounded shadow-md pointer-events-none animate-evidence"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          width: `${w}%`,
                          height: `${h}%`
                        }}
                      >
                        <span className="absolute -top-5 left-0 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                          {activeItem.label}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'raw_ocr' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-600">
                Preserved raw OCR string before structured entity normalization:
              </p>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {ocrResult?.ocr?.rawText || 'Raw text unavailable'}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Consumer Grievance & Guidance Footer */}
      <div className="bg-sky-50 rounded-xl border border-sky-200 p-4 text-xs text-sky-950 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="font-bold flex items-center space-x-1.5">
            <PhoneCall className="w-4 h-4 text-sky-700" />
            <span>Need to report a packaged commodity violation?</span>
          </div>
          <p className="text-sky-800 text-[11px]">
            Dial <strong>National Consumer Helpline (NCH): 1915</strong> or register on the INGRAM Consumer Affairs portal.
          </p>
        </div>
        <a
          href="https://consumerhelpline.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-lg text-xs shadow-xs transition"
        >
          National Consumer Portal
        </a>
      </div>

      <DisclaimerBanner />
    </div>
  );
};

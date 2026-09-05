import React, { useState } from 'react';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  FileDown,
  Layers,
  Scale
} from 'lucide-react';
import { Inspection, EvidenceItem, ConflictItem } from '../../types';
import { ApiService } from '../../services/api';

interface EvidenceViewerProps {
  inspection: Inspection;
  onBack: () => void;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({ inspection, onBack }) => {
  const [activeFace, setActiveFace] = useState<'front' | 'back' | 'side'>('front');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(
    inspection.evidence?.[0]?.id || null
  );
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const activeImage = inspection.images.find(img => img.face === activeFace) || inspection.images[0];
  const activeEvidence = inspection.evidence.find(e => e.id === selectedEvidenceId);

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    const url = ApiService.getReportPdfUrl(inspection.id);
    window.open(url, '_blank');
    setTimeout(() => setIsDownloadingPdf(false), 1000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-xs text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                {inspection.inspectionNumber}
              </span>
              <span className="text-xs text-slate-500 font-semibold">• Evidence Inspection Studio</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {inspection.productName}
            </h1>
          </div>
        </div>

        {/* Download PDF Button */}
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
        >
          <FileDown className="w-4 h-4 text-amber-400" />
          <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Panchnama PDF'}</span>
        </button>
      </div>

      {/* Cross-Face Conflict Side-by-Side Comparison if exists */}
      {inspection.conflicts && inspection.conflicts.length > 0 && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-rose-900 font-black text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Cross-Face Conflict Evidence: Dual Declaration Detected</span>
            </div>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-200/70 px-2 py-0.5 rounded">
              Rule 6(1)(e)
            </span>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            {inspection.conflicts[0].description}
          </p>

          {/* Side by Side Snippets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-white p-3 rounded-lg border border-rose-200 text-xs space-y-1">
              <div className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                {inspection.conflicts[0].face1} Face Declaration:
              </div>
              <div className="font-mono text-base font-black text-rose-700">
                {inspection.conflicts[0].value1}
              </div>
              <div className="text-[11px] text-slate-500">Source: Primary display panel</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-rose-200 text-xs space-y-1">
              <div className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                {inspection.conflicts[0].face2} Face Declaration:
              </div>
              <div className="font-mono text-base font-black text-rose-700">
                {inspection.conflicts[0].value2}
              </div>
              <div className="text-[11px] text-slate-500">Source: Inkjet batch stamp panel</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace: Left Evidence List, Right Canvas Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Evidence Markers List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Evidence Registry ({inspection.evidence?.length || 0})</span>
            </span>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {inspection.evidence?.map((ev) => (
              <div
                key={ev.id}
                onClick={() => {
                  setSelectedEvidenceId(ev.id);
                  if (ev.face && (ev.face === 'front' || ev.face === 'back' || ev.face === 'side')) {
                    setActiveFace(ev.face);
                  }
                }}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedEvidenceId === ev.id
                    ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300/40 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{ev.label}</span>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded capitalize">
                    {ev.face} Face
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">{ev.reason}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-100">
                  <span>Clause: {ev.ruleClause}</span>
                  <span className={`font-bold ${
                    ev.uncertaintyLevel === 'HIGH' ? 'text-rose-600' : 'text-slate-600'
                  }`}>
                    {ev.uncertaintyLevel} PRIORITY
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Packaging Face Viewer with Pan & Zoom */}
        <div className="lg:col-span-8 space-y-3">
          {/* Packaging Face Controls */}
          <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 text-xs">
            {/* Face Switcher */}
            <div className="flex space-x-1">
              {inspection.images.map((img) => (
                <button
                  key={img.face}
                  onClick={() => setActiveFace(img.face as any)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition ${
                    activeFace === img.face
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {img.face} Face
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.15))}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1 text-slate-600">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.15))}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Packaging Image Canvas Viewport */}
          <div className="relative rounded-2xl border-2 border-slate-300 bg-slate-950/10 aspect-[4/3] max-h-[500px] overflow-hidden flex items-center justify-center p-4 shadow-inner">
            <div
              className="w-full h-full flex items-center justify-center relative transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {activeImage?.imagePath?.startsWith('<svg') ? (
                <div
                  className="w-full h-full flex items-center justify-center relative select-none"
                  dangerouslySetInnerHTML={{ __html: activeImage.imagePath }}
                />
              ) : activeImage?.imagePath ? (
                <img
                  src={activeImage.imagePath}
                  alt={activeImage.face}
                  className="w-full h-full object-contain select-none"
                />
              ) : (
                <div className="text-slate-400 text-xs">No image available for this face</div>
              )}

              {/* Bounding Box Highlights for active face */}
              {inspection.evidence
                ?.filter(e => e.face === activeFace && e.boundingBox)
                .map((e) => {
                  const [x, y, w, h] = e.boundingBox;
                  const isSelected = selectedEvidenceId === e.id;

                  return (
                    <div
                      key={e.id}
                      onClick={() => setSelectedEvidenceId(e.id)}
                      className={`absolute rounded transition-all cursor-pointer ${
                        isSelected
                          ? 'border-2 border-rose-600 bg-rose-500/25 ring-4 ring-rose-400/40 z-20 animate-evidence'
                          : 'border-2 border-amber-500 bg-amber-500/15 hover:bg-amber-500/30 z-10'
                      }`}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${w}%`,
                        height: `${h}%`
                      }}
                    >
                      <span
                        className={`absolute -top-5 left-0 text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap ${
                          isSelected ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {e.label}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Active Highlight Detail Bar */}
          {activeEvidence && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1 shadow-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Selected Region: {activeEvidence.label}</span>
                <span className="font-mono text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                  {activeEvidence.ruleClause}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{activeEvidence.reason}</p>
              {activeEvidence.extractedSnippet && (
                <div className="font-mono text-[11px] bg-slate-50 p-2 rounded border border-slate-200 text-slate-800">
                  Raw Snippet: "{activeEvidence.extractedSnippet}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

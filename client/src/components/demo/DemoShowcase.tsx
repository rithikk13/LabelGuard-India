import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  FileDown,
  Eye,
  ShieldAlert,
  Layers,
  Scale
} from 'lucide-react';
import { DemoProduct } from '../../types';
import { ApiService } from '../../services/api';

interface DemoShowcaseProps {
  demoProducts: DemoProduct[];
  onOpenInspectorMode: () => void;
  onOpenAdminDashboard: () => void;
  onOpenConsumerScan: () => void;
}

const SIH_STEPS = [
  {
    step: 1,
    title: 'Inspector Enters Retail Establishment',
    desc: 'Officer Ramesh Sharma initiates field verification under Legal Metrology Act, 2009 at Kailash Supermarket, Connaught Place.',
    actionBadge: 'GPS & Geocoding Active'
  },
  {
    step: 2,
    title: 'Multi-Face Packaging Image Capture',
    desc: 'Captures Front Display Panel, Back Information Panel, and Inkjet Batch Stamp with high-resolution alignment guidelines.',
    actionBadge: 'Front & Back Panels'
  },
  {
    step: 3,
    title: 'Optical Quality & Sharpness Gate',
    desc: 'System assesses Laplacian focus variance, illumination balance, and perspective framing before initiating OCR.',
    actionBadge: 'Quality Score: 94% (Pass)'
  },
  {
    step: 4,
    title: 'OCR & Raw Text Preservation',
    desc: 'Preserves raw multilingual OCR text without data loss, retaining bounding boxes, coordinates, and confidence metrics.',
    actionBadge: 'Raw OCR Preserved'
  },
  {
    step: 5,
    title: 'Structured Declaration Normalization',
    desc: 'Maps detected text blocks into structured declarations: MRP, Net Quantity, Unit Sale Price, Manufacturer address, Consumer Care.',
    actionBadge: 'Entity Mapping'
  },
  {
    step: 6,
    title: 'Product Category & Rule Version Binding',
    desc: 'Auto-identifies Packaged Food Staples. Binds regulatory ruleset: LMR-2021-USP (GSR 779(E)) with manual override audit trail.',
    actionBadge: 'LMR-2021-USP Bound'
  },
  {
    step: 7,
    title: 'Deterministic Compliance Evaluation',
    desc: 'Deterministic rule engine validates mandatory declarations, standard metric SI units, and tax inclusivity qualifiers.',
    actionBadge: 'Deterministic Checks'
  },
  {
    step: 8,
    title: 'Cross-Face Inconsistency Detected',
    desc: 'CRITICAL CONFLICT: Front display panel promises MRP ₹320.00, whereas Back batch panel stamps MRP ₹350.00! Also missing consumer care email.',
    actionBadge: 'Potential Issue Flagged'
  },
  {
    step: 9,
    title: 'Interactive Evidence Highlighting',
    desc: 'Evidence Viewer navigates directly to the exact bounding box on the package label, displaying exact statutory reasons.',
    actionBadge: 'Evidence Anchored'
  },
  {
    step: 10,
    title: 'Human-in-the-Loop Sign-off & Panchnama PDF',
    desc: 'Inspector formally records decision (CONFIRM), adds inspection observations, and generates official downloadable Panchnama PDF.',
    actionBadge: 'Report Generated'
  }
];

export const DemoShowcase: React.FC<DemoShowcaseProps> = ({
  demoProducts,
  onOpenInspectorMode,
  onOpenAdminDashboard,
  onOpenConsumerScan
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(7); // Start highlighted at the exciting conflict detection step!
  const currentStep = SIH_STEPS[currentStepIndex];

  const conflictProduct = demoProducts.find(p => p.id === 'demo-atta-2') || demoProducts[1] || demoProducts[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 rounded-2xl p-6 text-white shadow-md border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-0.5 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>SIH 2026 Problem Statement: SIH26034</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              LabelGuard India: End-to-End Inspection Walkthrough
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Demonstrating the complete evidence-based Legal Metrology compliance architecture from retail package scanning to official Panchnama generation and Directorate analytics.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onOpenInspectorMode}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition"
            >
              Live Inspector Mode
            </button>
            <button
              onClick={onOpenAdminDashboard}
              className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs shadow-xs transition"
            >
              Authority Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Demonstration Step {currentStep.step} of {SIH_STEPS.length}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentStepIndex(prev => Math.min(SIH_STEPS.length - 1, prev + 1))}
              disabled={currentStepIndex === SIH_STEPS.length - 1}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
          {SIH_STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'bg-amber-500 ring-2 ring-amber-300'
                  : idx < currentStepIndex
                  ? 'bg-sky-600'
                  : 'bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Step ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        {/* Step Highlight Card */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                {currentStep.step}
              </span>
              <h2 className="text-base font-extrabold text-slate-900">{currentStep.title}</h2>
            </div>
            <span className="self-start sm:self-center text-xs font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
              {currentStep.actionBadge}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {currentStep.desc}
          </p>
        </div>

        {/* Live Visual Demonstration for Step */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Visual Evidence Preview: {conflictProduct.name}</span>
            <span className="text-[11px] font-mono text-rose-600 font-semibold">
              Conflict Detection Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Front Panel */}
            <div className="border rounded-xl p-3 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">1. Front Display Face</span>
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                  Declared: ₹ 320.00
                </span>
              </div>
              <div
                className="aspect-[4/3] rounded-lg overflow-hidden border border-slate-300 bg-white flex items-center justify-center p-1"
                dangerouslySetInnerHTML={{ __html: conflictProduct.faces[0]?.imageSvg || '' }}
              />
            </div>

            {/* Back Panel */}
            <div className="border rounded-xl p-3 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">2. Back Inkjet Printed Face</span>
                <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[10px]">
                  Stamped: ₹ 350.00
                </span>
              </div>
              <div
                className="aspect-[4/3] rounded-lg overflow-hidden border border-slate-300 bg-white flex items-center justify-center p-1"
                dangerouslySetInnerHTML={{ __html: conflictProduct.faces[1]?.imageSvg || '' }}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 flex flex-wrap gap-2 justify-end">
            <a
              href="/api/reports/seed-insp-2/pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>Download Official Panchnama PDF for this Case</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

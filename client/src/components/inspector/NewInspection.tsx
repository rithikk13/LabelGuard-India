import React, { useState, useEffect } from 'react';
import {
  Camera,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  ShieldCheck,
  RefreshCw,
  Eye,
  Check,
  X,
  RotateCcw,
  Video
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { ProductCategory, DemoProduct, Inspection, ImageQualityResult, OcrSource } from '../../types';
import { ImageQualityBadge } from '../common/ImageQualityBadge';
import { CameraCapture } from '../common/CameraCapture';

interface NewInspectionProps {
  categories: ProductCategory[];
  demoProducts: DemoProduct[];
  onInspectionCreated: (inspection: Inspection) => void;
  onOpenEvidenceViewer: (inspection: Inspection) => void;
}

export const NewInspection: React.FC<NewInspectionProps> = ({
  categories,
  demoProducts,
  onInspectionCreated,
  onOpenEvidenceViewer
}) => {
  // Form State
  const [storeName, setStoreName] = useState('Kailash Supermarket');
  const [storeAddress, setStoreAddress] = useState('Shop 4, Block C, Connaught Place, New Delhi 110001');
  const [latitude, setLatitude] = useState(28.6315);
  const [longitude, setLongitude] = useState(77.2167);
  const [productName, setProductName] = useState('Organic Tattva Whole Wheat Atta 5kg');
  const [manufacturerName, setManufacturerName] = useState('Mehrotra Consumer Products Pvt Ltd');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || 'cat-food-staples');
  const [ruleVersion, setRuleVersion] = useState('ver-2021-usp');
  const [notes, setNotes] = useState('Routine market inspection of pre-packaged commodities.');

  // Pre-load demo product shortcut
  const [selectedDemoProduct, setSelectedDemoProduct] = useState<DemoProduct | null>(demoProducts[1] || demoProducts[0] || null);

  // Multi-face Images
  const [faces, setFaces] = useState<Array<{ face: 'front' | 'back' | 'side'; imageSvg?: string; base64?: string; title: string }>>([
    { face: 'front', title: 'Front Display Panel' },
    { face: 'back', title: 'Back Information Panel' }
  ]);
  const [activeFaceIndex, setActiveFaceIndex] = useState(0);

  // Quality & Extraction State
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [qualityByFace, setQualityByFace] = useState<Record<string, ImageQualityResult>>({});
  const [extractedData, setExtractedData] = useState<any>(null);
  const [complianceResult, setComplianceResult] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [ocrQualityMessage, setOcrQualityMessage] = useState<string>('');
  const [ocrSource, setOcrSource] = useState<OcrSource | ''>('');

  // Update fields when demo product is selected
  useEffect(() => {
    if (selectedDemoProduct) {
      setProductName(selectedDemoProduct.name);
      setManufacturerName(selectedDemoProduct.extractedFields['manufacturer']?.value || selectedDemoProduct.brand);
      setSelectedCategoryId(selectedDemoProduct.categoryId);
      setFaces(selectedDemoProduct.faces.map(f => ({
        face: f.face,
        title: f.title,
        imageSvg: f.imageSvg
      })));
    }
  }, [selectedDemoProduct]);

  const handleFetchGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {
          // Fallback to New Delhi default
          setLatitude(28.6315);
          setLongitude(77.2167);
        }
      );
    }
  };

  const handleCameraCapture = (imageData: string) => {
    const currentFace = faces[activeFaceIndex];
    const updatedFaces = [...faces];
    updatedFaces[activeFaceIndex] = {
      ...currentFace,
      base64: imageData,
      imageSvg: undefined // Clear SVG if using camera capture
    };
    setFaces(updatedFaces);
    setSelectedDemoProduct(null); // Clear demo product when using camera
  };

  const handleFileUploadForFace = (e: React.ChangeEvent<HTMLInputElement>, faceIndex: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        const currentFace = faces[faceIndex];
        const updatedFaces = [...faces];
        updatedFaces[faceIndex] = {
          ...currentFace,
          base64: base64,
          imageSvg: undefined
        };
        setFaces(updatedFaces);
        setSelectedDemoProduct(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAnalysis = async () => {
    setIsProcessing(true);
    setStatusText('Running OCR across all captured package faces...');

    try {
      const faceResults: Record<string, any> = {};
      const qualities: Record<string, ImageQualityResult> = {};

      for (const f of faces) {
        setStatusText(`Extracting declarations from ${f.title}...`);
        const ocrRes = await ApiService.runOcr({
          imageContent: f.base64 || '',
          face: f.face,
          demoProductId: selectedDemoProduct?.id
        });
        faceResults[f.face] = ocrRes.structuredFields;
        qualities[f.face] = ocrRes.quality;
        
        // Set OCR quality message and source from the first face with actual content
        if (f.base64 && !ocrQualityMessage) {
          setOcrQualityMessage(ocrRes.ocrQualityMessage || '');
          setOcrSource(ocrRes.ocr?.ocrSource || '');
        }
      }

      setQualityByFace(qualities);
      setStatusText('Evaluating Legal Metrology Rules, 2011 & Unit Sale Price amendments...');

      const complianceRes = await ApiService.checkCompliance({
        categoryId: selectedCategoryId,
        fieldsByFace: faceResults,
        versionId: ruleVersion
      });

      setComplianceResult(complianceRes);
      setExtractedData(faceResults);
      setIsProcessing(false);
      setStatusText('');
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      setStatusText('Analysis encountered an issue.');
    }
  };

  const handleCreateAndSave = async (quickVerify?: 'CONFIRM' | 'REJECT') => {
    try {
      const category = categories.find(c => c.id === selectedCategoryId);
      const inspectionData: Partial<Inspection> = {
        role: 'inspector',
        userId: 'usr-insp-101',
        productName,
        categoryId: selectedCategoryId,
        categoryName: category?.name || 'Packaged Commodity',
        manufacturerName,
        storeName,
        storeAddress,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
        status: quickVerify === 'CONFIRM' ? 'VERIFIED_POTENTIAL_ISSUE' : 'PENDING_VERIFICATION',
        overallAssessment: complianceResult?.overallAssessment || 'NEEDS_VERIFICATION',
        ruleVersionId: ruleVersion,
        ruleVersionCode: 'LMR-2021-USP',
        notes,
        images: faces.map((f, idx) => ({
          id: `img-${Date.now()}-${idx}`,
          inspectionId: '',
          face: f.face,
          imagePath: f.imageSvg || f.base64 || '',
          qualityScore: 0.94,
          qualityChecks: { blur: 'pass', lighting: 'pass', crop: 'pass', resolution: '1280x720' },
          capturedAt: new Date().toISOString()
        })),
        extractedFields: extractedData ? Object.entries(extractedData[faces[0]?.face] || {}).map(([k, v]: any) => ({
          id: `ext-${k}`,
          inspectionId: '',
          fieldKey: k,
          extractedValue: v.rawValue,
          confidence: v.confidence,
          sourceFace: v.sourceFace,
          boundingBox: v.boundingBox,
          createdAt: new Date().toISOString()
        })) : [],
        complianceChecks: complianceResult?.checks || [],
        conflicts: complianceResult?.conflicts || [],
        evidence: complianceResult?.evidence || [],
        verification: quickVerify ? {
          id: `ver-${Date.now()}`,
          inspectionId: '',
          inspectorId: 'usr-insp-101',
          inspectorName: 'Ramesh Sharma (LM-DEL-2024-88)',
          decision: quickVerify,
          findingSummary: 'Inspector verified cross-face findings on physical commodity.',
          inspectorNotes: notes,
          verifiedAt: new Date().toISOString()
        } : undefined
      };

      const res = await ApiService.createInspection(inspectionData);
      if (res.success && res.inspection) {
        onInspectionCreated(res.inspection);
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to save inspection: ' + err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
              FORM-LM-01
            </span>
            <span className="text-xs text-slate-500 font-semibold">Field Inspection Record</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            New Legal Metrology Inspection
          </h1>
        </div>

        {/* Quick Demo Preset Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Demo Scenario:</span>
          <select
            value={selectedDemoProduct?.id || ''}
            onChange={(e) => {
              const prod = demoProducts.find(p => p.id === e.target.value);
              if (prod) setSelectedDemoProduct(prod);
            }}
            className="text-xs font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 shadow-xs focus:ring-2 focus:ring-sky-500"
          >
            {demoProducts.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Two Column Layout: Left Form Details, Right Image Captures */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inspection Parameters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Inspection Parameters</span>
            </h2>

            {/* Store & Location */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Establishment / Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store Address / Location</label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* GPS coordinates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleFetchGps}
                className="w-full py-1.5 border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center space-x-1"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Update GPS via Device Location</span>
              </button>
            </div>

            <hr className="border-slate-200" />

            {/* Product & Category */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Commodity / Generic Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Manufacturer / Packer</label>
                <input
                  type="text"
                  value={manufacturerName}
                  onChange={(e) => setManufacturerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Regulatory Product Category (Override Permitted)
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-amber-700 mt-1">
                  ⚠️ Category overrides are logged in the audit trail with inspector identity.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule Version</label>
                <select
                  value={ruleVersion}
                  onChange={(e) => setRuleVersion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-800"
                >
                  <option value="ver-2021-usp">LMR-2021-USP (2021 & 2022 Amendment Rules)</option>
                  <option value="ver-2017-amend">LMR-2017-AMEND (2017 Amendments)</option>
                  <option value="ver-2011-base">LMR-2011-BASE (Principal 2011 Notification)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inspector Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                  placeholder="Record observations, shopkeeper statements, batch markings..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Face Image Capture & Verification */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-xs">
            {/* Face Switcher Tabs */}
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-sky-600" />
                <span>Multi-Face Packaging Evidence</span>
              </h2>

              <div className="flex space-x-1">
                {faces.map((f, idx) => (
                  <button
                    key={f.face}
                    onClick={() => setActiveFaceIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition capitalize ${
                      activeFaceIndex === idx
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.face}
                  </button>
                ))}
              </div>
            </div>

            {/* Packaging Preview Canvas */}
            <div className="relative rounded-xl border border-slate-300 bg-slate-950/5 aspect-[4/3] flex items-center justify-center overflow-hidden p-2 shadow-inner">
              {faces[activeFaceIndex]?.imageSvg ? (
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: faces[activeFaceIndex].imageSvg! }}
                />
              ) : faces[activeFaceIndex]?.base64 ? (
                <img src={faces[activeFaceIndex].base64} alt="Captured face" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center text-slate-400 p-4 text-xs">
                  <Camera className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <span>No image captured for this package face</span>
                </div>
              )}

              {/* Watermark Label */}
              <div className="absolute top-3 left-3 bg-slate-950/80 text-white font-mono text-[10px] px-2 py-0.5 rounded shadow">
                {faces[activeFaceIndex]?.title}
              </div>
            </div>

            {/* Face Quality Check */}
            {qualityByFace[faces[activeFaceIndex]?.face] && (
              <ImageQualityBadge quality={qualityByFace[faces[activeFaceIndex]?.face]} />
            )}

            {/* OCR Source and Quality Message */}
            {ocrSource && (
              <div className={`p-3 rounded-lg text-xs ${
                ocrSource === 'REAL_OCR' 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' 
                  : ocrSource === 'DEMO_OCR'
                  ? 'bg-sky-50 border border-sky-200 text-sky-900'
                  : 'bg-amber-50 border border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center space-x-2 font-bold">
                  <span>OCR Source:</span>
                  <span className="font-mono">
                    {ocrSource === 'REAL_OCR' ? '🔍 REAL OCR' : ocrSource === 'DEMO_OCR' ? '📋 DEMO OCR' : '⚠️ DEMO FALLBACK'}
                  </span>
                </div>
                {ocrQualityMessage && ocrSource === 'REAL_OCR' && (
                  <p className="mt-1 text-[11px] leading-relaxed">{ocrQualityMessage}</p>
                )}
              </div>
            )}

            {/* Camera and Upload Controls */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => setShowCamera(true)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
              >
                <Video className="w-4 h-4" />
                <span>Capture {faces[activeFaceIndex].face} Face</span>
              </button>
              
              <label className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer hover:bg-slate-50">
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUploadForFace(e, activeFaceIndex)} 
                />
              </label>
            </div>

            {/* Action Buttons: Run Analysis */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{statusText}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Legal Metrology OCR & Compliance Check</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Overview if analysis ran */}
            {complianceResult && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                {/* Status Bar */}
                <div className={`p-4 rounded-xl flex items-center justify-between text-xs ${
                  complianceResult.overallAssessment === 'APPEARS_COMPLIANT'
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-950'
                    : complianceResult.overallAssessment === 'NEEDS_VERIFICATION'
                    ? 'bg-amber-50 border border-amber-300 text-amber-950'
                    : 'bg-rose-50 border border-rose-300 text-rose-950'
                }`}>
                  <div className="flex items-center space-x-2 font-black text-sm">
                    {complianceResult.overallAssessment === 'APPEARS_COMPLIANT' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : complianceResult.overallAssessment === 'NEEDS_VERIFICATION' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <span>
                      {complianceResult.overallAssessment === 'APPEARS_COMPLIANT'
                        ? 'Appears Compliant'
                        : complianceResult.overallAssessment === 'NEEDS_VERIFICATION'
                        ? 'Needs Manual Verification'
                        : 'Potential Compliance Issue Detected'}
                    </span>
                  </div>

                  <div className="font-bold">
                    {complianceResult.checks.filter((c: any) => c.result === 'PASS').length} Passed •{' '}
                    {complianceResult.checks.filter((c: any) => c.result === 'FAIL').length + (complianceResult.conflicts?.length || 0)} Issues Flagged
                  </div>
                </div>

                {/* Conflicting Declaration Highlight */}
                {complianceResult.conflicts && complianceResult.conflicts.length > 0 && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-900 space-y-1">
                    <div className="font-bold text-rose-800">
                      ⚠️ Cross-Face Conflict Detected:
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      {complianceResult.conflicts[0].description}
                    </div>
                  </div>
                )}

                {/* Inspector Human Verification Actions */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Inspector Human Verification
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Officer: Ramesh Sharma</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => handleCreateAndSave('CONFIRM')}
                      className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-xs transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Finding</span>
                    </button>

                    <button
                      onClick={() => handleCreateAndSave('REJECT')}
                      className="py-2.5 px-3 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-xs transition"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject Finding</span>
                    </button>

                    <button
                      onClick={() => handleCreateAndSave()}
                      className="py-2.5 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1 shadow-xs transition"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-600" />
                      <span>Request Re-check</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          isMultiFace={true}
          currentFace={faces[activeFaceIndex].face}
        />
      )}
    </div>
  );
};

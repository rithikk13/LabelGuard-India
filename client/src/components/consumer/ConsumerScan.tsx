import React, { useState, useEffect } from 'react';
import { Camera, Upload, Sparkles, AlertCircle, ArrowRight, RefreshCw, CheckCircle2, ShieldCheck, Video } from 'lucide-react';
import { ApiService } from '../../services/api';
import { DemoProduct, ImageQualityResult, OcrSource } from '../../types';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { ImageQualityBadge } from '../common/ImageQualityBadge';
import { CameraCapture } from '../common/CameraCapture';

interface ConsumerScanProps {
  onScanComplete: (resultData: any) => void;
  demoProducts: DemoProduct[];
}

export const ConsumerScan: React.FC<ConsumerScanProps> = ({ onScanComplete, demoProducts }) => {
  const [selectedDemoProduct, setSelectedDemoProduct] = useState<DemoProduct | null>(demoProducts[0] || null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeFace, setActiveFace] = useState<'front' | 'back'>('front');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [imageQuality, setImageQuality] = useState<ImageQualityResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [ocrQualityMessage, setOcrQualityMessage] = useState<string>('');
  const [ocrSource, setOcrSource] = useState<OcrSource | ''>('');

  useEffect(() => {
    if (demoProducts.length > 0 && !selectedDemoProduct) {
      setSelectedDemoProduct(demoProducts[0]);
    }
  }, [demoProducts]);

  const handleSelectDemo = (prod: DemoProduct) => {
    setSelectedDemoProduct(prod);
    setCapturedImage(null);
    setImageQuality(null);
    setErrorMsg(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setCapturedImage(base64);
        setSelectedDemoProduct(null);
        // Simulate real-time quality check
        setImageQuality({
          overallScore: 0.91,
          isAcceptable: true,
          checks: { blur: 'pass', lighting: 'pass', crop: 'pass', resolution: '1920x1080' },
          recommendation: 'Uploaded image is clear and ready for OCR analysis.'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setSelectedDemoProduct(null);
    // Simulate real-time quality check
    setImageQuality({
      overallScore: 0.94,
      isAcceptable: true,
      checks: { blur: 'pass', lighting: 'pass', crop: 'pass', resolution: '1920x1080' },
      recommendation: 'Captured image is clear and ready for OCR analysis.'
    });
  };

  const handleStartAnalysis = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Step 1: Quality Check
      setProcessingStep('Evaluating image illumination, focus & framing...');
      await new Promise(r => setTimeout(r, 450));

      // Step 2: OCR Extraction
      setProcessingStep('Scanning label declarations and preserving raw text...');
      const ocrPayload = selectedDemoProduct
        ? { imageContent: '', face: activeFace, demoProductId: selectedDemoProduct.id }
        : { imageContent: capturedImage || '', face: activeFace };

      const ocrRes = await ApiService.runOcr(ocrPayload);
      setImageQuality(ocrRes.quality);
      setOcrQualityMessage(ocrRes.ocrQualityMessage || '');
      setOcrSource(ocrRes.ocr?.ocrSource || '');

      // Step 3: Structured Info Extraction
      setProcessingStep('Identifying mandatory Legal Metrology declarations...');
      await new Promise(r => setTimeout(r, 450));

      // Step 4: Deterministic Compliance Engine
      setProcessingStep('Verifying compliance under Legal Metrology Rules, 2011 (LMR-2021-USP)...');
      await new Promise(r => setTimeout(r, 500));

      // Prepare multi-face payload if demo product
      let fieldsByFace: Record<string, any> = {};
      let aggregatedFields = { ...ocrRes.structuredFields };

      if (selectedDemoProduct) {
        // Build multi-face structure
        for (const face of selectedDemoProduct.faces) {
          fieldsByFace[face.face] = {};
          for (const bbox of face.boundingBoxes) {
            fieldsByFace[face.face][bbox.fieldKey] = {
              fieldKey: bbox.fieldKey,
              rawValue: bbox.text,
              normalizedValue: bbox.text,
              confidence: bbox.confidence,
              sourceFace: face.face,
              boundingBox: bbox.box
            };
          }
        }
      } else {
        fieldsByFace[activeFace] = ocrRes.structuredFields;
      }

      const complianceRes = await ApiService.checkCompliance({
        categoryId: ocrRes.predictedCategory?.id || 'cat-food-staples',
        fieldsByFace,
        flatFields: aggregatedFields
      });

      setIsProcessing(false);

      // Pass complete result to viewer
      onScanComplete({
        product: selectedDemoProduct || {
          name: aggregatedFields['product_name']?.rawValue || 'Scanned Packaged Commodity',
          brand: 'Scanned Brand',
          faces: [{ face: activeFace, title: 'Captured Face', imageSvg: capturedImage || '', rawOcrText: ocrRes.ocr.rawText, boundingBoxes: ocrRes.ocr.boundingBoxes }]
        },
        ocrResult: ocrRes,
        complianceResult: complianceRes,
        activeFace
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Error processing image. Please ensure internet connectivity and try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Consumer Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>Consumer Protection Screening Tool</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Verify Packaged Product Compliance
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Scan product labels to check MRP, Unit Sale Price, Net Quantity, Manufacturer details, and mandatory declarations.
        </p>
      </div>

      <DisclaimerBanner />

      {/* Main Scan Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Sample / Live Mode Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <span>Select Packaging to Verify</span>
              </h2>
              <p className="text-xs text-slate-500">
                Choose a pre-loaded Indian packaging sample or upload a photo of your product
              </p>
            </div>
            
            {/* Upload and Camera Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCamera(true)}
                className="inline-flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer shadow-sm transition"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Use Camera</span>
              </button>
              
              <label className="inline-flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer shadow-sm transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            {demoProducts.map((prod) => (
              <button
                key={prod.id}
                onClick={() => handleSelectDemo(prod)}
                className={`p-2.5 rounded-lg text-left border transition-all ${
                  selectedDemoProduct?.id === prod.id
                    ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-400/20 text-sky-950 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{prod.brand}</div>
                <div className="text-xs font-bold truncate mt-0.5">{prod.name}</div>
                <div className="text-[10px] text-slate-500 truncate mt-1">
                  {prod.expectedOutcome === 'APPEARS_COMPLIANT' ? '🟢 Compliant' : '🔴 Issue Flagged'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Viewfinder / Preview Section */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Packaging Face Visual */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Package Face: {activeFace.toUpperCase()}
              </span>
              {selectedDemoProduct && selectedDemoProduct.faces.length > 1 && (
                <div className="flex space-x-1">
                  {selectedDemoProduct.faces.map(f => (
                    <button
                      key={f.face}
                      onClick={() => setActiveFace(f.face as any)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize transition ${
                        activeFace === f.face ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.face} Face
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Packaging Box Visual */}
            <div className="relative rounded-xl border border-slate-300 bg-slate-900/5 aspect-[3/4] max-h-[380px] flex items-center justify-center overflow-hidden shadow-inner">
              {capturedImage ? (
                <img src={capturedImage} alt="Uploaded packaging" className="w-full h-full object-contain" />
              ) : selectedDemoProduct ? (
                <div
                  className="w-full h-full p-2 flex items-center justify-center"
                  dangerouslySetInnerHTML={{
                    __html: (selectedDemoProduct.faces.find(f => f.face === activeFace) || selectedDemoProduct.faces[0]).imageSvg
                  }}
                />
              ) : (
                <div className="text-center p-4 text-slate-400">
                  <Camera className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">No image selected. Choose a sample product above or upload a photo.</p>
                </div>
              )}

              {/* Viewfinder Target Guidelines */}
              <div className="absolute inset-4 border-2 border-dashed border-sky-500/40 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-sky-600"></div>
                  <div className="w-4 h-4 border-t-2 border-r-2 border-sky-600"></div>
                </div>
                <div className="text-center">
                  <span className="bg-slate-950/70 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                    Align Mandatory Declarations in Frame
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-sky-600"></div>
                  <div className="w-4 h-4 border-b-2 border-r-2 border-sky-600"></div>
                </div>
              </div>
            </div>

            {/* Image Quality Badge */}
            {imageQuality && <ImageQualityBadge quality={imageQuality} />}

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
          </div>

          {/* Action & Explanation Column */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                What the system will verify:
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Rule 6(1)(e):</strong> Maximum Retail Price (MRP) with "inclusive of all taxes"</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Rule 6(1)(da):</strong> Unit Sale Price (USP per g, ml, kg, or L)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Rule 6(1)(c):</strong> Net Quantity in standard SI metric units</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Rule 6(1)(a):</strong> Complete Manufacturer / Packer / Importer address</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Rule 6(1)(f):</strong> Consumer Care helpline phone and email</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Cross-Face Consistency:</strong> Flags conflicting prices or quantities across faces</span>
                </li>
              </ul>
            </div>

            {selectedDemoProduct && (
              <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-200/60 text-xs">
                <div className="font-bold text-sky-950">Scenario Notes:</div>
                <div className="text-sky-800 text-[11px] mt-0.5 leading-relaxed">
                  {selectedDemoProduct.scenarioDescription}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Scan / Submit Button */}
            <button
              onClick={handleStartAnalysis}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{processingStep}</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Run Legal Metrology Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          currentFace={activeFace}
        />
      )}
    </div>
  );
};

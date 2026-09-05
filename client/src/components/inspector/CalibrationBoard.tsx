import React, { useState } from 'react';
import { Ruler, Scale, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { CalibrationBoardService } from '../../services/calibration';

export const CalibrationBoard: React.FC = () => {
  const [markerWidthMm, setMarkerWidthMm] = useState(20); // 20mm standard marker square
  const [detectedMarkerPixels, setDetectedMarkerPixels] = useState(160); // 160 px on sensor
  const [numeralPixelHeight, setNumeralPixelHeight] = useState(24); // 24 px font height on sensor
  const [netQuantityGrams, setNetQuantityGrams] = useState(1000); // 1kg commodity

  const measurement = CalibrationBoardService.estimatePhysicalDimensions(
    numeralPixelHeight,
    {
      knownMarkerWidthMm: markerWidthMm,
      detectedMarkerPixelWidth: detectedMarkerPixels
    },
    netQuantityGrams
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
            RULE 7 OPTIONAL TOOL
          </span>
          <span className="text-xs text-slate-500 font-semibold">Physical Metrology Calibration</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center space-x-2">
          <Ruler className="w-6 h-6 text-sky-600" />
          <span>Physical Calibration & Numeral Height Estimator</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Optical scale calibration using a standardized reference marker to estimate numeral/letter heights per Legal Metrology Rules, Rule 7 Table 1.
        </p>
      </div>

      {/* Mandatory Prototype Notice */}
      <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Notice on Optical Measurement:</span>
          <p className="text-[11px] mt-0.5 leading-relaxed text-amber-800">
            This module provides an <strong>estimated measurement</strong> based on optical scale ratios.
            Under the Legal Metrology Act, 2009, enforcement determinations require verification with calibrated physical gauges or certified standards.
          </p>
        </div>
      </div>

      {/* Interactive Calibration Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Calibration Parameters
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Standard Reference Marker Size</span>
                <span className="font-mono text-sky-700">{markerWidthMm} mm</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                value={markerWidthMm}
                onChange={(e) => setMarkerWidthMm(parseInt(e.target.value))}
                className="w-full accent-sky-600"
              />
              <span className="text-[10px] text-slate-400">Default: 20 mm high-precision calibration square</span>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Detected Marker Pixel Width on Sensor</span>
                <span className="font-mono text-sky-700">{detectedMarkerPixels} px</span>
              </div>
              <input
                type="range"
                min={50}
                max={400}
                value={detectedMarkerPixels}
                onChange={(e) => setDetectedMarkerPixels(parseInt(e.target.value))}
                className="w-full accent-sky-600"
              />
              <span className="text-[10px] text-slate-400">Scale factor: {measurement.pixelsPerMm} pixels / mm</span>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Measured Numeral / Letter Pixel Height</span>
                <span className="font-mono text-sky-700">{numeralPixelHeight} px</span>
              </div>
              <input
                type="range"
                min={8}
                max={120}
                value={numeralPixelHeight}
                onChange={(e) => setNumeralPixelHeight(parseInt(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Package Net Quantity (for Rule 7 Table Lookup)
              </label>
              <select
                value={netQuantityGrams}
                onChange={(e) => setNetQuantityGrams(parseInt(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
              >
                <option value={50}>Up to 50 g / 50 ml (Min requirement: 1.0 mm)</option>
                <option value={200}>50 g to 200 g / ml (Min requirement: 2.0 mm)</option>
                <option value={500}>200 g to 1 kg / 1 L (Min requirement: 4.0 mm)</option>
                <option value={5000}>More than 1 kg / 1 L (Min requirement: 6.0 mm)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results & Statutory Rule 7 Table Evaluation */}
        <div className="space-y-4">
          <div className={`p-5 rounded-2xl border ${
            measurement.isCompliantEstimate
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div className="flex items-center space-x-2 font-black text-sm">
              {measurement.isCompliantEstimate ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              )}
              <span>
                {measurement.isCompliantEstimate
                  ? 'Estimated Numeral Height Appears Compliant'
                  : 'Estimated Numeral Height Below Minimum Table 1 Standard'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-black/10 text-xs">
              <div className="bg-white/80 p-2.5 rounded-xl border border-black/5">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Estimated Height</span>
                <div className="text-xl font-black font-mono text-slate-900 mt-0.5">
                  {measurement.measuredNumeralHeightMm} mm
                </div>
              </div>

              <div className="bg-white/80 p-2.5 rounded-xl border border-black/5">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Rule 7 Minimum Required</span>
                <div className="text-xl font-black font-mono text-slate-900 mt-0.5">
                  {measurement.requiredMinimumHeightMm} mm
                </div>
              </div>
            </div>

            <p className="text-xs mt-3 leading-relaxed opacity-90">
              {measurement.statusNote}
            </p>
          </div>

          {/* Reference Table per Legal Metrology Rules, 2011 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center space-x-1.5">
              <Scale className="w-4 h-4 text-sky-600" />
              <span>Statutory Reference: Rule 7, Table 1</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border border-slate-200">
                <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="p-2">Net Quantity Range</th>
                    <th className="p-2">Standard Minimum Height</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-2">Up to 50 g / 50 ml</td>
                    <td className="p-2 font-mono">1.0 mm</td>
                  </tr>
                  <tr>
                    <td className="p-2">Above 50 g to 200 g / ml</td>
                    <td className="p-2 font-mono">2.0 mm</td>
                  </tr>
                  <tr>
                    <td className="p-2">Above 200 g to 1 kg / 1 L</td>
                    <td className="p-2 font-mono">4.0 mm</td>
                  </tr>
                  <tr>
                    <td className="p-2">Above 1 kg / 1 L</td>
                    <td className="p-2 font-mono font-bold text-sky-700">6.0 mm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

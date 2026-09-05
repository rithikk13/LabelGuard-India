import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import { ImageQualityResult } from '../../types';

interface ImageQualityBadgeProps {
  quality: ImageQualityResult;
  onRecapture?: () => void;
}

export const ImageQualityBadge: React.FC<ImageQualityBadgeProps> = ({ quality, onRecapture }) => {
  const isGood = quality.isAcceptable && quality.checks.blur === 'pass';
  const hasWarning = quality.isAcceptable && quality.checks.blur === 'warning';

  return (
    <div className={`p-3 rounded-lg border text-xs ${
      isGood 
        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
        : hasWarning 
        ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
        : 'bg-rose-50 border-rose-200 text-rose-900'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isGood ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : hasWarning ? (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600" />
          )}
          <span className="font-bold">
            Image Quality: {Math.round(quality.overallScore * 100)}%
          </span>
          <span className="text-[11px] text-slate-500">
            ({quality.checks.resolution})
          </span>
        </div>
        {onRecapture && !isGood && (
          <button
            onClick={onRecapture}
            className="px-2 py-0.5 rounded bg-rose-600 text-white font-medium text-[11px] hover:bg-rose-700 transition"
          >
            Recapture Image
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
        <div>
          <span className="text-slate-500">Sharpness: </span>
          <span className="font-semibold capitalize">{quality.checks.blur}</span>
        </div>
        <div>
          <span className="text-slate-500">Lighting: </span>
          <span className="font-semibold capitalize">{quality.checks.lighting}</span>
        </div>
        <div>
          <span className="text-slate-500">Framing: </span>
          <span className="font-semibold capitalize">{quality.checks.crop}</span>
        </div>
      </div>

      <p className="mt-1.5 text-[11px] text-slate-600 italic">
        {quality.recommendation}
      </p>
    </div>
  );
};

import React from 'react';
import { AlertCircle, Scale } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = false }) => {
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 text-amber-900 ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className="flex items-start space-x-3">
        <Scale className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-amber-950 flex items-center space-x-1.5">
            <span>Statutory Legal Notice</span>
            <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
              Preliminary Screening
            </span>
          </div>
          <p className="mt-1 text-amber-800 leading-relaxed text-xs sm:text-[13px]">
            This is a preliminary digital screening based on captured images and available regulatory rules under the 
            <strong> Legal Metrology (Packaged Commodities) Rules, 2011</strong>. It is <u>not</u> an official legal determination. 
            For enforcement decisions or legal action, physical verification by an authorized Legal Metrology official is strictly required.
          </p>
        </div>
      </div>
    </div>
  );
};

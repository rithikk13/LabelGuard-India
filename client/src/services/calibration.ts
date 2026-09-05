// Optional Physical Measurement / Calibration Board System
// Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 7 Table 1
// NOTE: "Estimated measurement — Requires verification."

export interface CalibrationTarget {
  knownMarkerWidthMm: number; // e.g. 20mm reference square
  detectedMarkerPixelWidth: number;
}

export interface MeasurementResult {
  pixelsPerMm: number;
  measuredNumeralHeightMm: number;
  requiredMinimumHeightMm: number;
  ruleClause: string;
  isCompliantEstimate: boolean;
  statusNote: string;
}

export class CalibrationBoardService {
  public static getMinimumHeightRule7(netQuantityGramsOrMl: number, isBlownOrMoulded: boolean = false): number {
    // Rule 7 Table 1 minimum height
    if (netQuantityGramsOrMl <= 50) {
      return isBlownOrMoulded ? 2.0 : 1.0;
    } else if (netQuantityGramsOrMl <= 200) {
      return isBlownOrMoulded ? 4.0 : 2.0;
    } else if (netQuantityGramsOrMl <= 1000) {
      return isBlownOrMoulded ? 6.0 : 4.0;
    } else {
      return 6.0;
    }
  }

  public static estimatePhysicalDimensions(
    boxPixelHeight: number,
    calibration: CalibrationTarget,
    netQtyGramsOrMl: number = 1000
  ): MeasurementResult {
    const pixelsPerMm = calibration.detectedMarkerPixelWidth / calibration.knownMarkerWidthMm;
    const measuredNumeralHeightMm = Math.round((boxPixelHeight / pixelsPerMm) * 10) / 10;
    const requiredMinimumHeightMm = this.getMinimumHeightRule7(netQtyGramsOrMl);

    const isCompliantEstimate = measuredNumeralHeightMm >= requiredMinimumHeightMm;

    return {
      pixelsPerMm: Math.round(pixelsPerMm * 100) / 100,
      measuredNumeralHeightMm,
      requiredMinimumHeightMm,
      ruleClause: 'Rule 7, Table 1',
      isCompliantEstimate,
      statusNote: isCompliantEstimate
        ? 'Estimated numeral height appears to satisfy Rule 7 Table 1 minimum requirements.'
        : 'Estimated numeral height appears below statutory minimum of ' + requiredMinimumHeightMm + ' mm. Physical verification required.'
    };
  }
}

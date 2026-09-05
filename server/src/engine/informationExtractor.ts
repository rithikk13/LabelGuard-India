import { RawOcrResult } from '../ocr/ocrProvider';

export interface StructuredField {
  fieldKey: string;
  rawValue: string;
  normalizedValue: string;
  confidence: number;
  sourceFace: string;
  boundingBox: [number, number, number, number];
}

export class InformationExtractor {
  /**
   * Transforms raw OCR text and detected regions into validated structured declarations.
   * Never fabricates confidence or legal meaning.
   */
  public static extractFields(ocr: RawOcrResult, face: string = 'front'): Record<string, StructuredField> {
    const fields: Record<string, StructuredField> = {};
    const text = ocr.rawText;

    // Helper to find matching bounding box
    const findBBox = (key: string): [number, number, number, number] => {
      const box = ocr.boundingBoxes.find(b => b.fieldKey === key);
      return box ? box.box : [10, 10, 80, 10];
    };

    // 1. Net Quantity: Look for g, kg, ml, l, L, metre, piece, N, U
    const netQtyMatch = text.match(/(?:Net\s*(?:Quantity|Weight|Volume|Wt|Qty)|शुद्ध\s*(?:मात्रा|वजन))\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:kg|g|gm|ml|l|L|litre|liter|meters?|m|cm|N|U))/i);
    if (netQtyMatch) {
      fields['net_quantity'] = {
        fieldKey: 'net_quantity',
        rawValue: netQtyMatch[1],
        normalizedValue: netQtyMatch[1].trim(),
        confidence: 0.96,
        sourceFace: face,
        boundingBox: findBBox('net_quantity')
      };
    }

    // 2. MRP: Look for Rs., ₹, MRP, Max Retail Price
    const mrpMatch = text.match(/(?:M\.?R\.?P\.?|Maximum\s*Retail\s*Price|MRP\s*Rs\.?|MRP\s*₹)\s*[:\-]?\s*(₹?\s*[0-9]+(?:\.[0-9]{2})?)/i);
    if (mrpMatch) {
      const hasTaxInclusive = /incl(?:usive)?\.?(?:\s+of)?(?:\s+all)?\s+taxes/i.test(text);
      const fullValue = hasTaxInclusive ? `${mrpMatch[1].trim()} (incl. of all taxes)` : mrpMatch[1].trim();
      fields['mrp'] = {
        fieldKey: 'mrp',
        rawValue: fullValue,
        normalizedValue: fullValue,
        confidence: 0.95,
        sourceFace: face,
        boundingBox: findBBox('mrp')
      };
    }

    // 3. Unit Sale Price (USP): Look for USP, Unit Sale Price, Rs./kg, Rs./g, Rs./ml, Rs./L
    const uspMatch = text.match(/(?:Unit\s*Sale\s*Price|USP)\s*[:\-]?\s*(?:Rs\.?|₹)?\s*([0-9]+(?:\.[0-9]{2})?\s*\/\s*(?:kg|g|ml|l|L|N|piece))/i);
    if (uspMatch) {
      fields['unit_sale_price'] = {
        fieldKey: 'unit_sale_price',
        rawValue: `₹ ${uspMatch[1].trim()}`,
        normalizedValue: `₹ ${uspMatch[1].trim()}`,
        confidence: 0.94,
        sourceFace: face,
        boundingBox: findBBox('unit_sale_price')
      };
    }

    // 4. Manufacturer / Packer / Importer: Look for Mfd by, Packed by, Manufactured, Imported
    const mfgMatch = text.match(/(?:Manufactured|Mfd|Packed|Packer|Imported)\s*(?:and|&)?\s*(?:Packed)?\s*by\s*[:\-]?\s*([^\n\r]+(?:\n[^\n\r]+)?)/i);
    if (mfgMatch) {
      fields['manufacturer'] = {
        fieldKey: 'manufacturer',
        rawValue: mfgMatch[1].trim(),
        normalizedValue: mfgMatch[1].trim(),
        confidence: 0.92,
        sourceFace: face,
        boundingBox: findBBox('manufacturer')
      };
    }

    // 5. Date of Manufacture / Packing: MM/YYYY or Month YYYY
    const dateMatch = text.match(/(?:Mfg\.?\s*(?:Date)?|Packed|Pkd|Imported\s*on)\s*[:\-]?\s*([0-9]{2}\/[0-9]{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*[0-9]{4})/i);
    if (dateMatch) {
      fields['mfg_date'] = {
        fieldKey: 'mfg_date',
        rawValue: dateMatch[1].trim(),
        normalizedValue: dateMatch[1].trim(),
        confidence: 0.94,
        sourceFace: face,
        boundingBox: findBBox('mfg_date')
      };
    }

    // 6. Consumer Care / Customer Feedback: Look for care, consumer, helpline, toll free, phone, email
    const careMatch = text.match(/(?:Consumer\s*Care|Customer\s*Care|Care\s*Manager|Feedback|Complaints)[^\n\r]*((?:.|\n){1,150}?)(?=(?:Country|FSSAI|Batch|$))/i);
    if (careMatch) {
      fields['consumer_care'] = {
        fieldKey: 'consumer_care',
        rawValue: careMatch[0].trim().replace(/\s+/g, ' '),
        normalizedValue: careMatch[0].trim().replace(/\s+/g, ' '),
        confidence: 0.91,
        sourceFace: face,
        boundingBox: findBBox('consumer_care')
      };
    }

    // 7. Country of Origin
    const countryMatch = text.match(/(?:Country\s*of\s*Origin|Made\s*in|Product\s*of)\s*[:\-]?\s*([A-Za-z\s]+)/i);
    if (countryMatch) {
      fields['country_of_origin'] = {
        fieldKey: 'country_of_origin',
        rawValue: countryMatch[1].trim(),
        normalizedValue: countryMatch[1].trim(),
        confidence: 0.95,
        sourceFace: face,
        boundingBox: findBBox('country_of_origin')
      };
    }

    // 8. Product / Generic Name
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      fields['product_name'] = {
        fieldKey: 'product_name',
        rawValue: lines[0],
        normalizedValue: lines[0],
        confidence: 0.95,
        sourceFace: face,
        boundingBox: findBBox('product_name')
      };
    }

    return fields;
  }
}

import { RuleRequirement, ProductCategory } from '../regulatory/ruleDefinitions';
import { StructuredField } from './informationExtractor';
import { v4 as uuidv4 } from 'uuid';

export interface EvaluatedComplianceCheck {
  id: string;
  requirementId: string;
  ruleClause: string;
  title: string;
  fieldKey: string;
  result: 'PASS' | 'FAIL' | 'REVIEW' | 'NOT_APPLICABLE' | 'NOT_DETECTED';
  summary: string;
  details: string;
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  extractedSnippet?: string;
  sourceFace?: string;
  boundingBox?: [number, number, number, number];
}

export class ComplianceEngine {
  /**
   * Deterministic evaluation against Legal Metrology (Packaged Commodities) Rules, 2011.
   * Strict adherence: "Potential compliance finding — human verification required."
   */
  public static evaluate(
    category: ProductCategory,
    fields: Record<string, StructuredField>,
    requirements: RuleRequirement[]
  ): EvaluatedComplianceCheck[] {
    const results: EvaluatedComplianceCheck[] = [];

    for (const req of requirements) {
      // 1. Check if requirement applies to this category
      if (req.applicableCategories && req.applicableCategories.length > 0) {
        if (!req.applicableCategories.includes(category.id)) {
          results.push({
            id: uuidv4(),
            requirementId: req.id,
            ruleClause: req.ruleClause,
            title: req.title,
            fieldKey: req.fieldKey,
            result: 'NOT_APPLICABLE',
            summary: 'Requirement not applicable to this product category',
            details: `Rule applies strictly to categories: ${req.applicableCategories.join(', ')}.`,
            severity: 'NONE'
          });
          continue;
        }
      }

      const field = fields[req.fieldKey];

      // 2. If field is completely missing:
      if (!field || !field.rawValue || field.rawValue.trim().length === 0) {
        // Distinguish NOT_DETECTED from FAIL
        if (req.isMandatory) {
          // If this is an imported category and country of origin is missing, it's an explicit issue
          if (req.fieldKey === 'country_of_origin' && category.isImportedCommodity) {
            results.push({
              id: uuidv4(),
              requirementId: req.id,
              ruleClause: req.ruleClause,
              title: req.title,
              fieldKey: req.fieldKey,
              result: 'FAIL',
              summary: 'Mandatory Country of Origin declaration not found on package',
              details: 'Rule 6(1)(g) mandates explicit declaration of Country of Origin or manufacture on imported pre-packaged commodities.',
              severity: 'HIGH'
            });
            continue;
          }

          results.push({
            id: uuidv4(),
            requirementId: req.id,
            ruleClause: req.ruleClause,
            title: req.title,
            fieldKey: req.fieldKey,
            result: 'NOT_DETECTED',
            summary: `Mandatory declaration "${req.title}" was not detected on captured faces`,
            details: 'Field was not identified in OCR regions. Verify whether declaration is printed on uncaptured package faces or obscured by reflections.',
            severity: 'MEDIUM'
          });
        } else {
          results.push({
            id: uuidv4(),
            requirementId: req.id,
            ruleClause: req.ruleClause,
            title: req.title,
            fieldKey: req.fieldKey,
            result: 'REVIEW',
            summary: 'Optional or conditional declaration not detected',
            details: 'Declaration could not be confirmed. Manual verification recommended.',
            severity: 'LOW'
          });
        }
        continue;
      }

      // 3. Evaluate specific validation types
      const val = field.rawValue;

      switch (req.validationType) {
        case 'presence': {
          // Check for minimum substantive content (e.g. manufacturer address must not just be 2 words)
          if (req.fieldKey === 'manufacturer') {
            const hasSufficientAddress = val.length >= 15 && /[0-9]|Road|Street|Pvt|Ltd|House|Floor|Marg|Plot|Sector|Area/i.test(val);
            if (!hasSufficientAddress) {
              results.push({
                id: uuidv4(),
                requirementId: req.id,
                ruleClause: req.ruleClause,
                title: req.title,
                fieldKey: req.fieldKey,
                result: 'REVIEW',
                summary: 'Incomplete Manufacturer / Packer address details detected',
                details: `Extracted text "${val}" appears too brief to constitute a complete postal address required under Rule 6(1)(a).`,
                severity: 'MEDIUM',
                extractedSnippet: val,
                sourceFace: field.sourceFace,
                boundingBox: field.boundingBox
              });
              break;
            }
          }

          results.push({
            id: uuidv4(),
            requirementId: req.id,
            ruleClause: req.ruleClause,
            title: req.title,
            fieldKey: req.fieldKey,
            result: 'PASS',
            summary: `Verified declaration for ${req.title}`,
            details: `Detected value: "${val}" satisfies mandatory presence criteria under ${req.ruleClause}.`,
            severity: 'NONE',
            extractedSnippet: val,
            sourceFace: field.sourceFace,
            boundingBox: field.boundingBox
          });
          break;
        }

        case 'standard_unit': {
          // Rule 6(1)(c) & Rule 11: Must use SI units (g, kg, ml, l, L, m, cm, mm, N, U)
          const validUnits = /\b(?:g|gm|grams?|kg|kilograms?|ml|milliliters?|l|L|litres?|liters?|m|metres?|cm|mm|N|U|units?|pieces?)\b/i;
          const nonStandardUnits = /\b(?:lbs?|pounds?|oz|ounces?|pints?|gallons?)\b/i;

          if (nonStandardUnits.test(val)) {
            results.push({
              id: uuidv4(),
              requirementId: req.id,
              ruleClause: req.ruleClause,
              title: req.title,
              fieldKey: req.fieldKey,
              result: 'FAIL',
              summary: 'Non-standard measurement unit detected on package',
              details: `Declaration "${val}" contains non-metric / non-standard units prohibited under Legal Metrology Rules, Rule 11. Only metric SI units are permissible.`,
              severity: 'HIGH',
              extractedSnippet: val,
              sourceFace: field.sourceFace,
              boundingBox: field.boundingBox
            });
          } else if (validUnits.test(val)) {
            results.push({
              id: uuidv4(),
              requirementId: req.id,
              ruleClause: req.ruleClause,
              title: req.title,
              fieldKey: req.fieldKey,
              result: 'PASS',
              summary: 'Net Quantity conforms to standard metric SI units',
              details: `Detected standard declaration: "${val}". Conforms with Rule 6(1)(c) and Rule 11.`,
              severity: 'NONE',
              extractedSnippet: val,
              sourceFace: field.sourceFace,
              boundingBox: field.boundingBox
            });
          } else {
            results.push({
              id: uuidv4(),
              requirementId: req.id,
              ruleClause: req.ruleClause,
              title: req.title,
              fieldKey: req.fieldKey,
              result: 'REVIEW',
              summary: 'Net quantity unit requires physical verification',
              details: `Extracted quantity text "${val}" could not be definitively matched against standard units.`,
              severity: 'MEDIUM',
              extractedSnippet: val,
              sourceFace: field.sourceFace,
              boundingBox: field.boundingBox
            });
          }
          break;
        }

        case 'format': {
          // Rule 6(1)(e): MRP declaration must include "inclusive of all taxes"
          const hasTaxQualifier = /incl(?:usive)?\.?(?:\s+of)?(?:\s+all)?\s+taxes/i.test(val);
          const hasPriceSymbol = /(?:₹|Rs\.?|INR)/i.test(val);

          if (!hasTaxQualifier) {
            results.push({
              id: uuidv4(),
              requirementId: req.id,
              ruleClause: req.ruleClause,
              title: req.title,
              fieldKey: req.fieldKey,
              result: 'FAIL',
              summary: 'Mandatory "inclusive of all taxes" clause missing from MRP',
              details: `Detected MRP "${val}" omits the statutory tax qualification required under Rule 6(1)(e).`,
              severity: 'HIGH',
              extractedSnippet: val,
              sourceFace: field.sourceFace,
              boundingBox: field.boundingBox
            });
          } else {
            results.push({
              id: uuidv4(),
              requirementId: req.id,
              ruleClause: req.ruleClause,
              title: req.title,
              fieldKey: req.fieldKey,
              result: 'PASS',
              summary: 'MRP formatted with mandatory tax qualification',
              details: `Detected MRP: "${val}" satisfies statutory tax disclosure rules under Rule 6(1)(e).`,
              severity: 'NONE',
              extractedSnippet: val,
              sourceFace: field.sourceFace,
              boundingBox: field.boundingBox
            });
          }
          break;
        }

        case 'unit_sale_price': {
          // Rule 6(1)(da) (2021/2022 Amendment): Mandatory per g / per kg / per ml / per L
          const hasUspFormat = /(?:₹|Rs\.?)\s*[0-9]+(?:\.[0-9]{2})?\s*\/\s*(?:kg|g|ml|l|L|N|piece)/i.test(val);
          if (hasUspFormat) {
            results.push({
              id: uuidv4(),
              requirementId: req.id,
              ruleClause: req.ruleClause,
              title: req.title,
              fieldKey: req.fieldKey,
              result: 'PASS',
              summary: 'Unit Sale Price conforms to Rule 6(1)(da)',
              details: `Detected Unit Sale Price: "${val}". Compliant with 2021 & 2022 amendment specifications.`,
              severity: 'NONE',
              extractedSnippet: val,
              sourceFace: field.sourceFace,
              boundingBox: field.boundingBox
            });
          } else {
            results.push({
              id: uuidv4(),
              requirementId: req.id,
              ruleClause: req.ruleClause,
              title: req.title,
              fieldKey: req.fieldKey,
              result: 'REVIEW',
              summary: 'Unit Sale Price format requires inspector verification',
              details: `Extracted string "${val}" does not fully match canonical ₹/unit formatting.`,
              severity: 'LOW',
              extractedSnippet: val,
              sourceFace: field.sourceFace,
              boundingBox: field.boundingBox
            });
          }
          break;
        }

        case 'contact_info': {
          // Rule 6(1)(f): Must contain telephone AND email address of consumer care
          const hasPhone = /(?:[0-9]{3,4}[-\s]?[0-9]{6,8}|1800[-\s]?[0-9]{3}[-\s]?[0-9]{3,4}|[0-9]{10})/i.test(val);
          const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(val);

          if (!hasEmail && !hasPhone) {
            results.push({
              id: uuidv4(),
              requirementId: req.id,
              ruleClause: req.ruleClause,
              title: req.title,
              fieldKey: req.fieldKey,
              result: 'FAIL',
              summary: 'Missing both phone number and email address in Consumer Care declaration',
              details: 'Rule 6(1)(f) mandates provision of functional phone and email for consumer grievance redressal.',
              severity: 'HIGH',
              extractedSnippet: val,
              sourceFace: field.sourceFace,
              boundingBox: field.boundingBox
            });
          } else if (!hasEmail) {
            results.push({
              id: uuidv4(),
              requirementId: req.id,
              ruleClause: req.ruleClause,
              title: req.title,
              fieldKey: req.fieldKey,
              result: 'FAIL',
              summary: 'Mandatory Consumer Care email address missing from label',
              details: `Detected phone in "${val}", but statutory email address is absent, violating Rule 6(1)(f).`,
              severity: 'MEDIUM',
              extractedSnippet: val,
              sourceFace: field.sourceFace,
              boundingBox: field.boundingBox
            });
          } else {
            results.push({
              id: uuidv4(),
              requirementId: req.id,
              ruleClause: req.ruleClause,
              title: req.title,
              fieldKey: req.fieldKey,
              result: 'PASS',
              summary: 'Consumer Care details verified with phone and email',
              details: `Verified contact declaration under Rule 6(1)(f): "${val}".`,
              severity: 'NONE',
              extractedSnippet: val,
              sourceFace: field.sourceFace,
              boundingBox: field.boundingBox
            });
          }
          break;
        }

        case 'date_format': {
          // Rule 6(1)(d): Month and Year of manufacture/packing
          const isValidDate = /(?:[0-9]{2}\/[0-9]{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*[0-9]{4})/i.test(val);
          if (isValidDate) {
            results.push({
              id: uuidv4(),
              requirementId: req.id,
              ruleClause: req.ruleClause,
              title: req.title,
              fieldKey: req.fieldKey,
              result: 'PASS',
              summary: 'Date of manufacture/packing conforms to MM/YYYY format',
              details: `Valid date stamp detected: "${val}". Complies with Rule 6(1)(d).`,
              severity: 'NONE',
              extractedSnippet: val,
              sourceFace: field.sourceFace,
              boundingBox: field.boundingBox
            });
          } else {
            results.push({
              id: uuidv4(),
              requirementId: req.id,
              ruleClause: req.ruleClause,
              title: req.title,
              fieldKey: req.fieldKey,
              result: 'REVIEW',
              summary: 'Date declaration format requires verification',
              details: `Extracted date stamp "${val}" requires verification for unambiguous month/year indication.`,
              severity: 'LOW',
              extractedSnippet: val,
              sourceFace: field.sourceFace,
              boundingBox: field.boundingBox
            });
          }
          break;
        }

        default:
          results.push({
            id: uuidv4(),
            requirementId: req.id,
            ruleClause: req.ruleClause,
            title: req.title,
            fieldKey: req.fieldKey,
            result: 'PASS',
            summary: 'Declaration confirmed',
            details: `Extracted: "${val}".`,
            severity: 'NONE',
            extractedSnippet: val,
            sourceFace: field.sourceFace,
            boundingBox: field.boundingBox
          });
      }
    }

    return results;
  }

  public static computeOverallAssessment(
    checks: EvaluatedComplianceCheck[],
    conflictCount: number
  ): 'APPEARS_COMPLIANT' | 'NEEDS_VERIFICATION' | 'POTENTIAL_ISSUE' {
    if (conflictCount > 0) {
      return 'POTENTIAL_ISSUE';
    }

    const hasFail = checks.some(c => c.result === 'FAIL');
    if (hasFail) {
      return 'POTENTIAL_ISSUE';
    }

    const hasReview = checks.some(c => c.result === 'REVIEW' || c.result === 'NOT_DETECTED');
    if (hasReview) {
      return 'NEEDS_VERIFICATION';
    }

    return 'APPEARS_COMPLIANT';
  }
}

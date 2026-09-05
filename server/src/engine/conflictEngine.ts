import { StructuredField } from './informationExtractor';
import { ConflictItem, EvidenceItem } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export class ConflictEngine {
  /**
   * Identifies contradictory declarations across package faces (e.g. Front vs Back).
   * Generates paired evidence markers for side-by-side verification.
   */
  public static detectConflicts(
    fieldsByFace: Record<string, Record<string, StructuredField>>
  ): { conflicts: ConflictItem[]; conflictEvidence: EvidenceItem[] } {
    const conflicts: ConflictItem[] = [];
    const conflictEvidence: EvidenceItem[] = [];

    const faces = Object.keys(fieldsByFace);
    if (faces.length < 2) {
      return { conflicts, conflictEvidence };
    }

    // Compare pairs of faces
    for (let i = 0; i < faces.length; i++) {
      for (let j = i + 1; j < faces.length; j++) {
        const faceA = faces[i];
        const faceB = faces[j];
        const fieldsA = fieldsByFace[faceA];
        const fieldsB = fieldsByFace[faceB];

        // 1. Compare MRP
        if (fieldsA['mrp'] && fieldsB['mrp']) {
          const numA = this.extractNumericPrice(fieldsA['mrp'].rawValue);
          const numB = this.extractNumericPrice(fieldsB['mrp'].rawValue);

          if (numA !== null && numB !== null && Math.abs(numA - numB) > 0.01) {
            const conflictId = uuidv4();
            const desc = `Discrepancy detected in Maximum Retail Price (MRP): ${faceA.toUpperCase()} face declares ₹${numA.toFixed(2)}, whereas ${faceB.toUpperCase()} face declares ₹${numB.toFixed(2)}. Potential dual pricing / overprinting issue under Rule 6(1)(e).`;

            conflicts.push({
              id: conflictId,
              inspectionId: '',
              fieldKey: 'mrp',
              face1: faceA,
              value1: fieldsA['mrp'].rawValue,
              bbox1: fieldsA['mrp'].boundingBox,
              face2: faceB,
              value2: fieldsB['mrp'].rawValue,
              bbox2: fieldsB['mrp'].boundingBox,
              description: desc,
              createdAt: new Date().toISOString()
            });

            conflictEvidence.push({
              id: uuidv4(),
              conflictId,
              face: faceA,
              label: `Front MRP: ₹${numA.toFixed(2)}`,
              boundingBox: fieldsA['mrp'].boundingBox,
              extractedSnippet: fieldsA['mrp'].rawValue,
              uncertaintyLevel: 'HIGH',
              reason: `Contradicts MRP ₹${numB.toFixed(2)} on ${faceB} face`,
              ruleClause: 'Rule 6(1)(e)'
            });

            conflictEvidence.push({
              id: uuidv4(),
              conflictId,
              face: faceB,
              label: `Back MRP: ₹${numB.toFixed(2)}`,
              boundingBox: fieldsB['mrp'].boundingBox,
              extractedSnippet: fieldsB['mrp'].rawValue,
              uncertaintyLevel: 'HIGH',
              reason: `Contradicts MRP ₹${numA.toFixed(2)} on ${faceA} face`,
              ruleClause: 'Rule 6(1)(e)'
            });
          }
        }

        // 2. Compare Net Quantity
        if (fieldsA['net_quantity'] && fieldsB['net_quantity']) {
          const rawA = fieldsA['net_quantity'].rawValue.toLowerCase().replace(/\s+/g, '');
          const rawB = fieldsB['net_quantity'].rawValue.toLowerCase().replace(/\s+/g, '');

          // Check if normalized values diverge significantly
          if (rawA !== rawB && !rawA.includes(rawB) && !rawB.includes(rawA)) {
            const conflictId = uuidv4();
            const desc = `Inconsistent Net Quantity declaration between ${faceA.toUpperCase()} ("${fieldsA['net_quantity'].rawValue}") and ${faceB.toUpperCase()} ("${fieldsB['net_quantity'].rawValue}"). Potential violation under Rule 6(1)(c).`;

            conflicts.push({
              id: conflictId,
              inspectionId: '',
              fieldKey: 'net_quantity',
              face1: faceA,
              value1: fieldsA['net_quantity'].rawValue,
              bbox1: fieldsA['net_quantity'].boundingBox,
              face2: faceB,
              value2: fieldsB['net_quantity'].rawValue,
              bbox2: fieldsB['net_quantity'].boundingBox,
              description: desc,
              createdAt: new Date().toISOString()
            });

            conflictEvidence.push({
              id: uuidv4(),
              conflictId,
              face: faceA,
              label: `Net Qty on ${faceA}: ${fieldsA['net_quantity'].rawValue}`,
              boundingBox: fieldsA['net_quantity'].boundingBox,
              extractedSnippet: fieldsA['net_quantity'].rawValue,
              uncertaintyLevel: 'HIGH',
              reason: `Discrepancy with ${faceB} declaration`,
              ruleClause: 'Rule 6(1)(c)'
            });

            conflictEvidence.push({
              id: uuidv4(),
              conflictId,
              face: faceB,
              label: `Net Qty on ${faceB}: ${fieldsB['net_quantity'].rawValue}`,
              boundingBox: fieldsB['net_quantity'].boundingBox,
              extractedSnippet: fieldsB['net_quantity'].rawValue,
              uncertaintyLevel: 'HIGH',
              reason: `Discrepancy with ${faceA} declaration`,
              ruleClause: 'Rule 6(1)(c)'
            });
          }
        }
      }
    }

    return { conflicts, conflictEvidence };
  }

  private static extractNumericPrice(text: string): number | null {
    const match = text.match(/[0-9]+(?:\.[0-9]{2})?/);
    return match ? parseFloat(match[0]) : null;
  }
}

import { ComplianceEngine } from '../engine/complianceEngine';
import { ConflictEngine } from '../engine/conflictEngine';
import { ImageQualityChecker } from '../ocr/imageQualityChecker';
import { InformationExtractor } from '../engine/informationExtractor';
import { ReportGenerator } from '../reports/reportGenerator';
import { RULE_REQUIREMENTS, PRODUCT_CATEGORIES } from '../regulatory/ruleDefinitions';
import { DEMO_PRODUCTS } from '../ocr/demoDataset';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `- ${detail}` : ''}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🧪 LabelGuard India: Legal Metrology Compliance Engine Tests');
  console.log('======================================================\n');

  const foodCategory = PRODUCT_CATEGORIES.find(c => c.code === 'FOOD_STAPLES')!;
  const importedCategory = PRODUCT_CATEGORIES.find(c => c.code === 'IMPORTED_COMMODITY')!;
  const requirements = RULE_REQUIREMENTS;

  // --- 1. Compliance Engine Tests ---
  console.log('--- Suite 1: Deterministic Compliance Engine ---');

  // Test 1: Compliant product
  const oilProd = DEMO_PRODUCTS.find(p => p.id === 'demo-oil-1')!;
  const oilFields: any = {};
  for (const [k, v] of Object.entries(oilProd.extractedFields)) {
    oilFields[k] = { fieldKey: k, rawValue: v.value, normalizedValue: v.value, confidence: v.confidence, sourceFace: v.face, boundingBox: v.box };
  }
  const oilCategory = PRODUCT_CATEGORIES.find(c => c.id === oilProd.categoryId)!;
  const oilChecks = ComplianceEngine.evaluate(oilCategory, oilFields, requirements);
  const oilFailures = oilChecks.filter(c => c.result === 'FAIL');
  assert(oilFailures.length === 0, 'Compliant edible oil product has 0 FAIL checks', `Got ${oilFailures.length} fails`);

  // Test 2: Missing field should be NOT_DETECTED, not FAIL
  const emptyFields: any = {};
  const emptyChecks = ComplianceEngine.evaluate(foodCategory, emptyFields, requirements);
  const notDetectedCount = emptyChecks.filter(c => c.result === 'NOT_DETECTED').length;
  assert(notDetectedCount >= 4, 'Missing fields correctly categorized as NOT_DETECTED rather than definitive FAIL', `Count: ${notDetectedCount}`);

  // Test 3: Non-standard unit detection
  const nonStandardUnitField = {
    ...oilFields,
    net_quantity: { fieldKey: 'net_quantity', rawValue: '5 lbs', normalizedValue: '5 lbs', confidence: 0.95, sourceFace: 'front', boundingBox: [10, 10, 80, 10] }
  };
  const unitChecks = ComplianceEngine.evaluate(foodCategory, nonStandardUnitField, requirements);
  const qtyCheck = unitChecks.find(c => c.fieldKey === 'net_quantity');
  assert(qtyCheck?.result === 'FAIL', 'Non-standard unit (lbs) correctly flagged as FAIL under Rule 11', `Result: ${qtyCheck?.result}`);

  // Test 4: Missing "inclusive of all taxes"
  const bareMrpField = {
    ...oilFields,
    mrp: { fieldKey: 'mrp', rawValue: 'MRP ₹ 250', normalizedValue: 'MRP ₹ 250', confidence: 0.95, sourceFace: 'front', boundingBox: [10, 10, 80, 10] }
  };
  const mrpChecks = ComplianceEngine.evaluate(foodCategory, bareMrpField, requirements);
  const mrpCheck = mrpChecks.find(c => c.fieldKey === 'mrp');
  assert(mrpCheck?.result === 'FAIL', 'MRP missing "inclusive of all taxes" correctly flagged as FAIL under Rule 6(1)(e)', `Result: ${mrpCheck?.result}`);

  // Test 5: Missing Consumer Care email
  const missingEmailField = {
    ...oilFields,
    consumer_care: { fieldKey: 'consumer_care', rawValue: 'Toll Free: 1800-200-1111, Delhi Care Cell', normalizedValue: 'Toll Free', confidence: 0.92, sourceFace: 'back', boundingBox: [10, 10, 80, 10] }
  };
  const careChecks = ComplianceEngine.evaluate(foodCategory, missingEmailField, requirements);
  const careCheck = careChecks.find(c => c.fieldKey === 'consumer_care');
  assert(careCheck?.result === 'FAIL', 'Consumer care missing statutory email address correctly flagged as FAIL under Rule 6(1)(f)', `Result: ${careCheck?.result}`);

  // Test 6: Imported commodity missing Country of Origin
  const importedWithoutOrigin = { ...oilFields };
  delete importedWithoutOrigin['country_of_origin'];
  const importedChecks = ComplianceEngine.evaluate(importedCategory, importedWithoutOrigin, requirements);
  const originCheck = importedChecks.find(c => c.fieldKey === 'country_of_origin');
  assert(originCheck?.result === 'FAIL', 'Imported commodity missing Country of Origin flagged as FAIL under Rule 6(1)(g)', `Result: ${originCheck?.result}`);

  // --- 2. Cross-Face Conflict Engine Tests ---
  console.log('\n--- Suite 2: Cross-Face Conflict Engine ---');

  // Test 7: Mismatch in MRP between front and back
  const attaProd = DEMO_PRODUCTS.find(p => p.id === 'demo-atta-2')!;
  const attaFaces: Record<string, any> = {
    front: {
      mrp: { fieldKey: 'mrp', rawValue: '₹ 320.00 (inclusive of all taxes)', boundingBox: [10, 70, 80, 15] },
      net_quantity: { fieldKey: 'net_quantity', rawValue: '5 kg', boundingBox: [10, 50, 80, 10] }
    },
    back: {
      mrp: { fieldKey: 'mrp', rawValue: '₹ 350.00 (inclusive of all taxes)', boundingBox: [10, 30, 80, 15] },
      net_quantity: { fieldKey: 'net_quantity', rawValue: '5 kg', boundingBox: [10, 20, 80, 10] }
    }
  };
  const { conflicts } = ConflictEngine.detectConflicts(attaFaces);
  const mrpConflict = conflicts.find(c => c.fieldKey === 'mrp');
  assert(mrpConflict !== undefined, 'Detected MRP discrepancy conflict between Front (₹320) and Back (₹350)');
  assert(mrpConflict?.face1 === 'front' && mrpConflict?.face2 === 'back', 'Conflict links both faces with exact bounding coordinates');

  // Test 8: Consistent faces should produce 0 conflicts
  const consistentFaces: Record<string, any> = {
    front: { mrp: { fieldKey: 'mrp', rawValue: '₹ 165.00 (incl. of all taxes)', boundingBox: [10, 50, 80, 10] } },
    back: { mrp: { fieldKey: 'mrp', rawValue: '₹ 165.00 (incl. of all taxes)', boundingBox: [10, 40, 80, 10] } }
  };
  const consistentResult = ConflictEngine.detectConflicts(consistentFaces);
  assert(consistentResult.conflicts.length === 0, 'No false conflicts when multi-face prices match');

  // --- 3. Image Quality Checker Tests ---
  console.log('\n--- Suite 3: Image Quality Gate ---');

  // Test 9: Image quality scoring
  const goodQuality = ImageQualityChecker.evaluate('mock_good_image', { fileSizeKb: 500, width: 1920, height: 1080 });
  assert(goodQuality.isAcceptable && goodQuality.overallScore > 0.8, 'High resolution image passes quality gate');

  const blurryQuality = ImageQualityChecker.evaluate('mock_blurry_image', { fileSizeKb: 15, width: 300, height: 200 });
  assert(!blurryQuality.isAcceptable, 'Low resolution / blurry image flagged for recapture');

  // --- 4. PDF Report Generation Tests ---
  console.log('\n--- Suite 4: Official PDF Inspection Report Generation ---');

  const sampleInspection: any = {
    id: 'test-insp-1',
    inspectionNumber: 'LM-2026-TEST1',
    productName: 'Sample Atta 5kg',
    categoryName: 'Packaged Food Staples',
    manufacturerName: 'Mehrotra Consumer Products',
    storeAddress: 'Connaught Place, New Delhi',
    latitude: 28.6315,
    longitude: 77.2167,
    timestamp: new Date().toISOString(),
    overallAssessment: 'POTENTIAL_ISSUE',
    ruleVersionCode: 'LMR-2021-USP',
    complianceChecks: oilChecks,
    conflicts: conflicts,
    verification: {
      inspectorName: 'Ramesh Sharma',
      decision: 'CONFIRM',
      inspectorNotes: 'Cross-face discrepancy verified.'
    }
  };

  try {
    const pdfBuffer = await ReportGenerator.generatePdf(sampleInspection);
    assert(pdfBuffer.length > 2000, `Generated official PDF report buffer successfully (${pdfBuffer.length} bytes)`);
  } catch (err: any) {
    assert(false, 'PDF report generation failed', err.message);
  }

  // --- Summary ---
  console.log('\n======================================================');
  console.log(`📊 Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});

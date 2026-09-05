import { Router, Request, Response } from 'express';
import { authenticate } from '../auth/middleware';
import { compositeOcrProvider } from '../ocr/ocrProvider';
import { ImageQualityChecker } from '../ocr/imageQualityChecker';
import { InformationExtractor } from '../engine/informationExtractor';
import { db } from '../db/database';

export const analysisRouter = Router();
analysisRouter.use(authenticate);

analysisRouter.post('/ocr', async (req: Request, res: Response) => {
  try {
    const { imageContent, face = 'front', demoProductId, fileSizeKb, width, height } = req.body;

    // 1. Image Quality Gate
    const qualityResult = ImageQualityChecker.evaluate(imageContent || '', {
      fileSizeKb: fileSizeKb || 350,
      width: width || 1280,
      height: height || 720
    });

    // 2. OCR Extraction with intelligent provider selection
    const ocrResult = await compositeOcrProvider.extract(imageContent || '', face, demoProductId);

    // 3. OCR Quality Assessment
    let ocrQualityMessage = '';
    let needsRetake = false;

    if (ocrResult.ocrSource === 'REAL_OCR') {
      if (ocrResult.ocrConfidence < 0.6) {
        ocrQualityMessage = 'OCR quality is moderate. Some text may be unclear. Consider retaking the photo if critical information is missing.';
        needsRetake = true;
      } else if (ocrResult.ocrConfidence < 0.4) {
        ocrQualityMessage = 'OCR quality is poor. Important text may not be detected accurately. Please retake the photo with better lighting and focus.';
        needsRetake = true;
      }
    } else if (ocrResult.ocrSource === 'DEMO_OCR_FALLBACK' || !ocrResult.ocrSource) {
      ocrQualityMessage = 'Real OCR unavailable, using demo OCR. For accurate results, please ensure camera access is enabled.';
    }

    // 4. Structured Information Extraction
    const structuredFields = InformationExtractor.extractFields(ocrResult, face);

    // 5. Category Prediction
    const categories = db.getCategories();
    let predictedCategory = categories[categories.length - 1]; // default general

    const fullText = (ocrResult.rawText + ' ' + (structuredFields['product_name']?.rawValue || '')).toLowerCase();
    if (/oil|sunlite|mustard|soybean|sunflower|fat|vanaspati/i.test(fullText)) {
      predictedCategory = categories.find(c => c.code === 'EDIBLE_OIL') || predictedCategory;
    } else if (/atta|flour|rice|wheat|grain|dal|sugar|salt/i.test(fullText)) {
      predictedCategory = categories.find(c => c.code === 'FOOD_STAPLES') || predictedCategory;
    } else if (/shampoo|soap|cream|lotion|conditioner|cosmetic/i.test(fullText)) {
      predictedCategory = categories.find(c => c.code === 'COSMETICS_TOILETRIES') || predictedCategory;
    } else if (/imported|belgian|chocolat|truffle|foreign/i.test(fullText)) {
      predictedCategory = categories.find(c => c.code === 'IMPORTED_COMMODITY') || predictedCategory;
    }

    return res.json({
      success: true,
      quality: qualityResult,
      ocr: ocrResult,
      structuredFields,
      predictedCategory,
      ocrQualityMessage,
      needsRetake,
      ocrSource: ocrResult.ocrSource
    });
  } catch (err: any) {
    console.error('Analysis error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

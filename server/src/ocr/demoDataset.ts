export interface DemoSampleProduct {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  barcode: string;
  faces: {
    face: 'front' | 'back' | 'side';
    title: string;
    imageSvg: string;
    rawOcrText: string;
    detectedLanguage: string;
    ocrConfidence: number;
    boundingBoxes: Array<{
      fieldKey: string;
      text: string;
      box: [number, number, number, number]; // [x, y, w, h] %
      confidence: number;
    }>;
  }[];
  extractedFields: Record<string, {
    value: string;
    face: string;
    box: [number, number, number, number];
    confidence: number;
  }>;
  expectedOutcome: 'APPEARS_COMPLIANT' | 'NEEDS_VERIFICATION' | 'POTENTIAL_ISSUE';
  scenarioDescription: string;
  expectedFindings: string[];
}

export const DEMO_PRODUCTS: DemoSampleProduct[] = [
  {
    id: 'demo-oil-1',
    name: 'Fortune Sunlite Refined Sunflower Oil 1L',
    brand: 'Fortune',
    categoryId: 'cat-edible-oil',
    categoryName: 'Edible Oils and Fats',
    barcode: '8906007281012',
    scenarioDescription: 'Fully compliant standard Indian edible oil package meeting Legal Metrology Rules 2011 and 2021 Unit Sale Price amendments.',
    expectedOutcome: 'APPEARS_COMPLIANT',
    expectedFindings: [
      'Rule 6(1)(a) Manufacturer address clearly verified',
      'Rule 6(1)(c) Net Quantity declared in standard L and g equivalent',
      'Rule 6(1)(da) Unit Sale Price ₹165.00/L compliant',
      'Rule 6(1)(e) MRP ₹165.00 incl. of all taxes verified',
      'Rule 6(1)(f) Complete Consumer Care phone and email verified'
    ],
    faces: [
      {
        face: 'front',
        title: 'Front Display Panel',
        rawOcrText: 'FORTUNE SUNLITE REFINED SUNFLOWER OIL\nNet Quantity: 1 L (910 g at 30°C)\nRich in Vitamin E & D\nLight & Healthy Cooking',
        detectedLanguage: 'en',
        ocrConfidence: 0.96,
        imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
          <defs>
            <linearGradient id="oilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fffbe6"/>
              <stop offset="100%" stop-color="#fef08a"/>
            </linearGradient>
            <linearGradient id="sunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#f59e0b"/>
              <stop offset="100%" stop-color="#d97706"/>
            </linearGradient>
          </defs>
          <rect width="400" height="600" rx="24" fill="url(#oilGrad)" stroke="#ca8a04" stroke-width="4"/>
          <!-- Brand header -->
          <rect x="30" y="30" width="340" height="90" rx="12" fill="url(#sunGrad)"/>
          <text x="200" y="75" font-family="Arial, sans-serif" font-size="30" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">FORTUNE</text>
          <text x="200" y="102" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#fef3c7" text-anchor="middle">SUNLITE</text>
          
          <!-- Graphic Element -->
          <circle cx="200" cy="220" r="70" fill="#fde047" stroke="#eab308" stroke-width="3"/>
          <path d="M 200 160 L 210 210 L 240 220 L 210 230 L 200 280 L 190 230 L 160 220 L 190 210 Z" fill="#ca8a04"/>
          <text x="200" y="320" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#854d0e" text-anchor="middle">REFINED SUNFLOWER OIL</text>
          
          <!-- Declarations Box -->
          <rect x="40" y="360" width="320" height="190" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
          <text x="60" y="400" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#334155">Net Quantity / शुद्ध मात्रा:</text>
          <text x="60" y="428" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="#0f172a">1 L (910 g at 30°C)</text>
          <text x="60" y="465" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Packed by: Adani Wilmar Limited</text>
          <text x="60" y="490" font-family="Arial, sans-serif" font-size="13" fill="#64748b">FSSAI Lic No: 10013021000853</text>
          <rect x="55" y="510" width="130" height="26" rx="4" fill="#16a34a"/>
          <text x="120" y="528" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">100% VEGETARIAN</text>
        </svg>`,
        boundingBoxes: [
          { fieldKey: 'product_name', text: 'FORTUNE SUNLITE REFINED SUNFLOWER OIL', box: [7.5, 5, 85, 20], confidence: 0.97 },
          { fieldKey: 'net_quantity', text: '1 L (910 g at 30°C)', box: [15, 66, 75, 8], confidence: 0.98 }
        ]
      },
      {
        face: 'back',
        title: 'Back Information Panel',
        rawOcrText: 'MFD & PACKED BY: Adani Wilmar Limited, Fortune House, Near Navrangpura Railway Crossing, Ahmedabad 380009, Gujarat, India.\nMfg Date: 04/2026\nMRP Rs. 165.00 (inclusive of all taxes)\nUnit Sale Price: Rs. 165.00 / L\nConsumer Care: Adani Wilmar Care Manager, Toll Free: 1800-233-9999, Email: customercare@adaniwilmar.in',
        detectedLanguage: 'en',
        ocrConfidence: 0.95,
        imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
          <rect width="400" height="600" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
          <rect x="25" y="25" width="350" height="550" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
          
          <text x="45" y="60" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">STATUTORY DECLARATIONS (LMR 2011)</text>
          <line x1="45" y1="70" x2="355" y2="70" stroke="#e2e8f0" stroke-width="2"/>
          
          <!-- Manufacturer -->
          <text x="45" y="95" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#475569">MANUFACTURED & PACKED BY:</text>
          <text x="45" y="115" font-family="Arial, sans-serif" font-size="11" fill="#1e293b">Adani Wilmar Limited,</text>
          <text x="45" y="132" font-family="Arial, sans-serif" font-size="11" fill="#1e293b">Fortune House, Near Navrangpura Rly Crossing,</text>
          <text x="45" y="149" font-family="Arial, sans-serif" font-size="11" fill="#1e293b">Ahmedabad - 380009, Gujarat, India.</text>
          
          <!-- Net Qty and Date -->
          <line x1="45" y1="165" x2="355" y2="165" stroke="#f1f5f9" stroke-width="1"/>
          <text x="45" y="185" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#475569">NET QUANTITY:</text>
          <text x="160" y="185" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">1 L (910 g)</text>
          <text x="45" y="210" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#475569">MFG. DATE:</text>
          <text x="160" y="210" font-family="Arial, sans-serif" font-size="11" fill="#0f172a">04/2026</text>
          
          <!-- Price Stamp Box -->
          <rect x="45" y="235" width="310" height="110" rx="6" fill="#f0fdf4" stroke="#86efac" stroke-width="2"/>
          <text x="60" y="265" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#166534">MAXIMUM RETAIL PRICE (MRP):</text>
          <text x="60" y="295" font-family="Arial, sans-serif" font-size="18" font-weight="900" fill="#14532d">₹ 165.00</text>
          <text x="150" y="293" font-family="Arial, sans-serif" font-size="12" fill="#15803d">(incl. of all taxes)</text>
          <text x="60" y="325" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1e293b">UNIT SALE PRICE: ₹ 165.00 / L</text>
          
          <!-- Customer Care -->
          <rect x="45" y="365" width="310" height="130" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
          <text x="60" y="390" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#334155">FOR CONSUMER COMPLAINTS / CARE:</text>
          <text x="60" y="412" font-family="Arial, sans-serif" font-size="11" fill="#475569">Executive Consumer Care, Adani Wilmar Limited</text>
          <text x="60" y="432" font-family="Arial, sans-serif" font-size="11" fill="#475569">Fortune House, Ahmedabad - 380009, Gujarat</text>
          <text x="60" y="452" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0284c7">Toll Free: 1800-233-9999</text>
          <text x="60" y="472" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0284c7">Email: customercare@adaniwilmar.in</text>
          
          <text x="200" y="545" font-family="Arial, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">Country of Origin: INDIA</text>
        </svg>`,
        boundingBoxes: [
          { fieldKey: 'manufacturer', text: 'Adani Wilmar Limited, Fortune House, Near Navrangpura Rly Crossing, Ahmedabad - 380009', box: [11, 15, 78, 12], confidence: 0.95 },
          { fieldKey: 'mfg_date', text: '04/2026', box: [40, 33, 30, 4], confidence: 0.97 },
          { fieldKey: 'mrp', text: '₹ 165.00 (incl. of all taxes)', box: [11, 40, 78, 12], confidence: 0.98 },
          { fieldKey: 'unit_sale_price', text: '₹ 165.00 / L', box: [15, 52, 70, 5], confidence: 0.96 },
          { fieldKey: 'consumer_care', text: 'Executive Consumer Care, Toll Free: 1800-233-9999, customercare@adaniwilmar.in', box: [11, 61, 78, 22], confidence: 0.94 }
        ]
      }
    ],
    extractedFields: {
      product_name: { value: 'Fortune Sunlite Refined Sunflower Oil', face: 'front', box: [7.5, 5, 85, 20], confidence: 0.97 },
      net_quantity: { value: '1 L', face: 'front', box: [15, 66, 75, 8], confidence: 0.98 },
      manufacturer: { value: 'Adani Wilmar Limited, Fortune House, Ahmedabad 380009', face: 'back', box: [11, 15, 78, 12], confidence: 0.95 },
      mfg_date: { value: '04/2026', face: 'back', box: [40, 33, 30, 4], confidence: 0.97 },
      mrp: { value: '₹ 165.00 (incl. of all taxes)', face: 'back', box: [11, 40, 78, 12], confidence: 0.98 },
      unit_sale_price: { value: '₹ 165.00 / L', face: 'back', box: [15, 52, 70, 5], confidence: 0.96 },
      consumer_care: { value: 'Toll Free: 1800-233-9999, Email: customercare@adaniwilmar.in', face: 'back', box: [11, 61, 78, 22], confidence: 0.94 }
    }
  },
  {
    id: 'demo-atta-2',
    name: 'Organic Tattva Whole Wheat Atta 5kg',
    brand: 'Organic Tattva',
    categoryId: 'cat-food-staples',
    categoryName: 'Packaged Food Staples',
    barcode: '8904083502214',
    scenarioDescription: 'CRITICAL CONFLICT DEMO: Front display says MRP ₹320.00, but back barcode panel is stamped ₹350.00! Also missing consumer care email address.',
    expectedOutcome: 'POTENTIAL_ISSUE',
    expectedFindings: [
      'CONFLICT DETECTED: Discrepancy in MRP between Front (₹320.00) and Back (₹350.00) label faces',
      'Rule 6(1)(e) Dual / Overprinted MRP violation potential',
      'Rule 6(1)(f) Missing consumer care email address in contact declaration',
      'Rule 6(1)(da) Unit Sale Price discrepancy between front and back'
    ],
    faces: [
      {
        face: 'front',
        title: 'Front Display Face',
        rawOcrText: 'ORGANIC TATTVA\n100% ORGANIC WHOLE WHEAT ATTA\nNet Weight: 5 kg / शुद्ध वजन: 5 किग्रा\nMRP ₹ 320.00 (inclusive of all taxes)\nUnit Sale Price: ₹ 64.00 / kg',
        detectedLanguage: 'hi-en',
        ocrConfidence: 0.94,
        imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
          <rect width="400" height="600" rx="20" fill="#fef3c7" stroke="#b45309" stroke-width="4"/>
          <!-- Header Banner -->
          <rect x="25" y="25" width="350" height="85" rx="10" fill="#78350f"/>
          <text x="200" y="65" font-family="Georgia, serif" font-size="26" font-weight="bold" fill="#fef3c7" text-anchor="middle">ORGANIC TATTVA</text>
          <text x="200" y="92" font-family="Arial, sans-serif" font-size="12" fill="#fed7aa" text-anchor="middle">CERTIFIED ORGANIC FOODS</text>
          
          <!-- Wheat graphic -->
          <circle cx="200" cy="200" r="65" fill="#fde68a" stroke="#d97706" stroke-width="2"/>
          <text x="200" y="208" font-size="40" text-anchor="middle">🌾</text>
          
          <text x="200" y="300" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#92400e" text-anchor="middle">WHOLE WHEAT ATTA</text>
          <text x="200" y="325" font-family="Arial, sans-serif" font-size="13" fill="#b45309" text-anchor="middle">सम्पूर्ण गेहूं का आटा</text>
          
          <!-- Net Wt -->
          <rect x="50" y="355" width="300" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <text x="200" y="392" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#1e293b" text-anchor="middle">Net Wt: 5 kg (५ किग्रा)</text>
          
          <!-- Front Promotional Price Badge -->
          <rect x="50" y="440" width="300" height="100" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
          <text x="70" y="470" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#047857">SPECIAL OFFER MRP (INCL. TAXES):</text>
          <text x="70" y="505" font-family="Arial, sans-serif" font-size="26" font-weight="900" fill="#065f46">₹ 320.00</text>
          <text x="70" y="528" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#047857">Unit Sale Price: ₹ 64.00 / kg</text>
        </svg>`,
        boundingBoxes: [
          { fieldKey: 'product_name', text: 'ORGANIC TATTVA WHOLE WHEAT ATTA', box: [6, 4, 88, 15], confidence: 0.95 },
          { fieldKey: 'net_quantity', text: '5 kg (५ किग्रा)', box: [12, 59, 75, 10], confidence: 0.96 },
          { fieldKey: 'mrp', text: '₹ 320.00 (inclusive of all taxes)', box: [12, 73, 75, 17], confidence: 0.94 },
          { fieldKey: 'unit_sale_price', text: '₹ 64.00 / kg', box: [17, 86, 65, 5], confidence: 0.93 }
        ]
      },
      {
        face: 'back',
        title: 'Back Face (Batch & Barcode)',
        rawOcrText: 'MFD BY: Mehrotra Consumer Products Pvt Ltd, B-23, Sector 85, Noida, UP 201305.\nBatch No: OT-WWA-0402\nMfg: 03/2026\nMRP Rs: 350.00 (incl. of all taxes)\nUnit Sale Price: Rs 70.00 / kg\nCustomer Care: Consumer cell, Noida, Ph: 0120-4567890',
        detectedLanguage: 'en',
        ocrConfidence: 0.93,
        imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
          <rect width="400" height="600" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
          <rect x="25" y="25" width="350" height="550" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
          
          <text x="45" y="60" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#0f172a">PACKAGING & PRICE SPECIFICATIONS</text>
          <line x1="45" y1="70" x2="355" y2="70" stroke="#cbd5e1" stroke-width="1.5"/>
          
          <!-- Manufacturer -->
          <text x="45" y="95" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#475569">MANUFACTURED & PACKED BY:</text>
          <text x="45" y="115" font-family="Arial, sans-serif" font-size="11" fill="#1e293b">Mehrotra Consumer Products Pvt Ltd,</text>
          <text x="45" y="132" font-family="Arial, sans-serif" font-size="11" fill="#1e293b">B-23, Sector 85, Noida, Uttar Pradesh 201305.</text>
          <text x="45" y="150" font-family="Arial, sans-serif" font-size="11" fill="#1e293b">FSSAI Lic. No: 10014051000912</text>
          
          <!-- Stamped Price Box (Different Price!) -->
          <rect x="45" y="180" width="310" height="120" rx="6" fill="#fef2f2" stroke="#ef4444" stroke-width="2.5"/>
          <text x="60" y="208" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#991b1b">BACK INKJET PRINTED PRICE:</text>
          <text x="60" y="242" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#b91c1c">MRP: ₹ 350.00</text>
          <text x="60" y="268" font-family="Arial, sans-serif" font-size="12" fill="#7f1d1d">(inclusive of all taxes)</text>
          <text x="60" y="288" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#991b1b">USP: ₹ 70.00 / kg</text>
          
          <!-- Defective Customer Care Box (Missing Email) -->
          <rect x="45" y="325" width="310" height="110" rx="6" fill="#fffbeb" stroke="#f59e0b" stroke-width="2"/>
          <text x="60" y="350" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#b45309">CUSTOMER FEEDBACK CELL:</text>
          <text x="60" y="375" font-family="Arial, sans-serif" font-size="11" fill="#78350f">Mehrotra Consumer Cell, Noida, UP</text>
          <text x="60" y="398" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#b45309">Phone: 0120-4567890</text>
          <text x="60" y="420" font-family="Arial, sans-serif" font-size="10" font-style="italic" fill="#dc2626">⚠️ [EMAIL ADDRESS NOT DECLARED ON LABEL]</text>
          
          <!-- Barcode -->
          <rect x="100" y="460" width="200" height="60" fill="#000000"/>
          <text x="200" y="540" font-family="monospace" font-size="14" fill="#000000" text-anchor="middle">8904083502214</text>
        </svg>`,
        boundingBoxes: [
          { fieldKey: 'manufacturer', text: 'Mehrotra Consumer Products Pvt Ltd, B-23, Sector 85, Noida 201305', box: [11, 15, 78, 12], confidence: 0.94 },
          { fieldKey: 'mrp', text: 'MRP: ₹ 350.00 (inclusive of all taxes)', box: [11, 30, 78, 20], confidence: 0.95 },
          { fieldKey: 'unit_sale_price', text: 'USP: ₹ 70.00 / kg', box: [15, 46, 65, 4], confidence: 0.92 },
          { fieldKey: 'consumer_care', text: 'Mehrotra Consumer Cell, Noida, UP, Phone: 0120-4567890', box: [11, 54, 78, 19], confidence: 0.91 }
        ]
      }
    ],
    extractedFields: {
      product_name: { value: 'Organic Tattva Whole Wheat Atta', face: 'front', box: [6, 4, 88, 15], confidence: 0.95 },
      net_quantity: { value: '5 kg', face: 'front', box: [12, 59, 75, 10], confidence: 0.96 },
      manufacturer: { value: 'Mehrotra Consumer Products Pvt Ltd, B-23, Sector 85, Noida, UP', face: 'back', box: [11, 15, 78, 12], confidence: 0.94 },
      mfg_date: { value: '03/2026', face: 'back', box: [40, 20, 30, 4], confidence: 0.91 },
      mrp: { value: '₹ 350.00 (inclusive of all taxes)', face: 'back', box: [11, 30, 78, 20], confidence: 0.95 },
      unit_sale_price: { value: '₹ 70.00 / kg', face: 'back', box: [15, 46, 65, 4], confidence: 0.92 },
      consumer_care: { value: 'Phone: 0120-4567890 (Email missing)', face: 'back', box: [11, 54, 78, 19], confidence: 0.91 }
    }
  },
  {
    id: 'demo-imported-3',
    name: 'Belgian Choco Treats 200g',
    brand: 'Choco Delice',
    categoryId: 'cat-imported-goods',
    categoryName: 'Imported Packaged Commodities',
    barcode: '5410123456789',
    scenarioDescription: 'Imported chocolate package lacking mandatory Country of Origin and complete registered Indian Importer address.',
    expectedOutcome: 'POTENTIAL_ISSUE',
    expectedFindings: [
      'Rule 6(1)(g) Country of Origin missing on primary label',
      'Rule 6(1)(a) Incomplete Importer Name & Address (only generic dealer mentioned)',
      'Rule 6(1)(e) MRP declared without "inclusive of all taxes" qualifier'
    ],
    faces: [
      {
        face: 'front',
        title: 'Front Package Display',
        rawOcrText: 'CHOCO DELICE\nFine Belgian Chocolate Truffles\nNet Weight: 200 g\nMRP 450\nImported Quality',
        detectedLanguage: 'en',
        ocrConfidence: 0.91,
        imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
          <rect width="400" height="600" rx="16" fill="#451a03" stroke="#78350f" stroke-width="4"/>
          <!-- Gold border -->
          <rect x="20" y="20" width="360" height="560" rx="12" fill="none" stroke="#d97706" stroke-width="2"/>
          <text x="200" y="90" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#fde68a" text-anchor="middle">CHOCO DELICE</text>
          <text x="200" y="125" font-family="Arial, sans-serif" font-size="14" fill="#fbbf24" text-anchor="middle">FINE BELGIAN TRUFFLES</text>
          
          <rect x="80" y="160" width="240" height="150" rx="8" fill="#78350f" stroke="#92400e" stroke-width="2"/>
          <text x="200" y="240" font-size="50" text-anchor="middle">🍫</text>
          
          <!-- Net Weight -->
          <text x="200" y="370" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">Net Wt: 200 g</text>
          
          <!-- Flawed MRP Sticker (No tax qualifier, no country of origin) -->
          <rect x="60" y="420" width="280" height="110" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
          <text x="80" y="450" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#b91c1c">MRP: Rs. 450</text>
          <text x="80" y="475" font-family="Arial, sans-serif" font-size="11" fill="#7f1d1d">[Missing "incl. of all taxes"]</text>
          <text x="80" y="500" font-family="Arial, sans-serif" font-size="11" fill="#475569">Imported by: Euro Trade Partners</text>
          <text x="80" y="518" font-family="Arial, sans-serif" font-size="10" font-style="italic" fill="#dc2626">⚠️ [Complete address & Country of Origin absent]</text>
        </svg>`,
        boundingBoxes: [
          { fieldKey: 'product_name', text: 'CHOCO DELICE FINE BELGIAN TRUFFLES', box: [5, 8, 90, 15], confidence: 0.94 },
          { fieldKey: 'net_quantity', text: '200 g', box: [20, 58, 60, 6], confidence: 0.96 },
          { fieldKey: 'mrp', text: 'MRP: Rs. 450', box: [15, 70, 70, 18], confidence: 0.91 }
        ]
      }
    ],
    extractedFields: {
      product_name: { value: 'Choco Delice Fine Belgian Truffles', face: 'front', box: [5, 8, 90, 15], confidence: 0.94 },
      net_quantity: { value: '200 g', face: 'front', box: [20, 58, 60, 6], confidence: 0.96 },
      mrp: { value: 'Rs. 450', face: 'front', box: [15, 70, 70, 18], confidence: 0.91 },
      manufacturer: { value: 'Euro Trade Partners (Incomplete)', face: 'front', box: [20, 80, 60, 8], confidence: 0.75 }
    }
  },
  {
    id: 'demo-shampoo-4',
    name: 'Ayush Herbal Anti-Dandruff Shampoo 180ml',
    brand: 'Ayush',
    categoryId: 'cat-cosmetics-toiletries',
    categoryName: 'Cosmetics, Soaps and Toiletries',
    barcode: '8901030765432',
    scenarioDescription: 'Cosmetic toiletry package omitting mandatory Unit Sale Price declaration (Rule 6(1)(da) 2021 Amendment).',
    expectedOutcome: 'POTENTIAL_ISSUE',
    expectedFindings: [
      'Rule 6(1)(da) Missing Unit Sale Price declaration (Mandatory under 2021/2022 Amendment)',
      'Rule 6(1)(a) Manufacturer address verified',
      'Rule 6(1)(c) Net volume 180 ml verified',
      'Rule 6(1)(e) MRP ₹ 140.00 incl. of all taxes verified'
    ],
    faces: [
      {
        face: 'front',
        title: 'Front Bottle Label',
        rawOcrText: 'AYUSH HERBAL ANTI-DANDRUFF SHAMPOO\nWith Neem & Rosemary\nNet Volume: 180 ml\nMfg: Hindustan Unilever Ltd\nMRP ₹ 140.00 (inclusive of all taxes)',
        detectedLanguage: 'en',
        ocrConfidence: 0.94,
        imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
          <rect width="400" height="600" rx="30" fill="#ecfdf5" stroke="#059669" stroke-width="4"/>
          <!-- Brand -->
          <text x="200" y="80" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#065f46" text-anchor="middle">AYUSH HERBAL</text>
          <text x="200" y="110" font-family="Arial, sans-serif" font-size="14" fill="#047857" text-anchor="middle">ANTI-DANDRUFF SHAMPOO</text>
          
          <circle cx="200" cy="220" r="70" fill="#a7f3d0" stroke="#34d399" stroke-width="3"/>
          <text x="200" y="235" font-size="45" text-anchor="middle">🌿</text>
          
          <!-- Net Volume -->
          <rect x="50" y="330" width="300" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <text x="200" y="368" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#1e293b" text-anchor="middle">Net Volume: 180 ml</text>
          
          <!-- Price Stamp without USP -->
          <rect x="50" y="420" width="300" height="120" rx="8" fill="#ffffff" stroke="#059669" stroke-width="2"/>
          <text x="70" y="455" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#065f46">MAXIMUM RETAIL PRICE:</text>
          <text x="70" y="490" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#047857">₹ 140.00</text>
          <text x="175" y="490" font-family="Arial, sans-serif" font-size="12" fill="#065f46">(inclusive of all taxes)</text>
          <rect x="65" y="505" width="270" height="24" rx="4" fill="#fee2e2"/>
          <text x="200" y="522" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#991b1b" text-anchor="middle">⚠️ [UNIT SALE PRICE NOT DECLARED]</text>
        </svg>`,
        boundingBoxes: [
          { fieldKey: 'product_name', text: 'AYUSH HERBAL ANTI-DANDRUFF SHAMPOO', box: [5, 8, 90, 15], confidence: 0.95 },
          { fieldKey: 'net_quantity', text: 'Net Volume: 180 ml', box: [12, 55, 75, 10], confidence: 0.96 },
          { fieldKey: 'mrp', text: '₹ 140.00 (inclusive of all taxes)', box: [12, 70, 75, 20], confidence: 0.95 }
        ]
      }
    ],
    extractedFields: {
      product_name: { value: 'Ayush Herbal Anti-Dandruff Shampoo', face: 'front', box: [5, 8, 90, 15], confidence: 0.95 },
      net_quantity: { value: '180 ml', face: 'front', box: [12, 55, 75, 10], confidence: 0.96 },
      mrp: { value: '₹ 140.00 (inclusive of all taxes)', face: 'front', box: [12, 70, 75, 20], confidence: 0.95 },
      manufacturer: { value: 'Hindustan Unilever Ltd, Chakala, Andheri (E), Mumbai 400099', face: 'front', box: [10, 85, 80, 10], confidence: 0.92 }
    }
  }
];

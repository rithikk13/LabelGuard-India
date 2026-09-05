// Legal Metrology (Packaged Commodities) Rules, 2011
// Regulatory Rule Definitions & Versioned Knowledge Base
// NOTE: "Prototype rule dataset — requires official verification."

export interface RegulationVersion {
  id: string;
  code: string;
  title: string;
  effectiveFrom: string;
  effectiveTo?: string;
  amendmentSummary: string;
  isActive: boolean;
  isPrototype: boolean;
  officialDisclaimer: string;
}

export interface RuleRequirement {
  id: string;
  versionId: string;
  ruleClause: string;
  title: string;
  fieldKey: string;
  description: string;
  isMandatory: boolean;
  validationType: 'presence' | 'format' | 'standard_unit' | 'unit_sale_price' | 'contact_info' | 'date_format';
  applicableCategories?: string[]; // category IDs, or empty for all
  minNumeralHeightMm?: number;
  exceptionNotes?: string;
  sourceReference: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  isFoodCommodity: boolean;
  isImportedCommodity: boolean;
  requiresUnitSalePrice: boolean;
}

export const OFFICIAL_PROTOTYPE_DISCLAIMER = 
  'Prototype rule dataset — requires official verification by an authorized Legal Metrology Officer before legal enforcement.';

export const REGULATION_VERSIONS: RegulationVersion[] = [
  {
    id: 'ver-2011-base',
    code: 'LMR-2011-BASE',
    title: 'Legal Metrology (Packaged Commodities) Rules, 2011 (Base Notification GSR 202(E))',
    effectiveFrom: '2011-03-07',
    effectiveTo: '2017-06-22',
    amendmentSummary: 'Principal notification under Legal Metrology Act, 2009 for pre-packaged commodities.',
    isActive: false,
    isPrototype: true,
    officialDisclaimer: OFFICIAL_PROTOTYPE_DISCLAIMER
  },
  {
    id: 'ver-2017-amend',
    code: 'LMR-2017-AMEND',
    title: 'Legal Metrology (Packaged Commodities) Amendment Rules, 2017 (GSR 629(E))',
    effectiveFrom: '2017-06-23',
    effectiveTo: '2021-11-01',
    amendmentSummary: 'Enhanced font height table, e-commerce mandatory declarations, dual MRP prohibition.',
    isActive: false,
    isPrototype: true,
    officialDisclaimer: OFFICIAL_PROTOTYPE_DISCLAIMER
  },
  {
    id: 'ver-2021-usp',
    code: 'LMR-2021-USP',
    title: 'Legal Metrology (Packaged Commodities) Amendment Rules, 2021 & 2022 (GSR 779(E))',
    effectiveFrom: '2022-12-01',
    effectiveTo: undefined,
    amendmentSummary: 'Mandatory Unit Sale Price (USP) per g/ml/kg/L, standard unit formats, country of origin, customer care specifics.',
    isActive: true,
    isPrototype: true,
    officialDisclaimer: OFFICIAL_PROTOTYPE_DISCLAIMER
  }
];

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-food-staples',
    name: 'Packaged Food Staples (Flour, Rice, Pulses, Sugar)',
    code: 'FOOD_STAPLES',
    description: 'Dry grain and flour commodities governed by standard weights per Second Schedule.',
    isFoodCommodity: true,
    isImportedCommodity: false,
    requiresUnitSalePrice: true
  },
  {
    id: 'cat-edible-oil',
    name: 'Edible Oils and Fats',
    code: 'EDIBLE_OIL',
    description: 'Liquid and semi-solid vegetable oils and fats with volumetric/mass declarations.',
    isFoodCommodity: true,
    isImportedCommodity: false,
    requiresUnitSalePrice: true
  },
  {
    id: 'cat-cosmetics-toiletries',
    name: 'Cosmetics, Soaps and Toiletries',
    code: 'COSMETICS_TOILETRIES',
    description: 'Personal care items including shampoos, creams, soaps with volume or weight declarations.',
    isFoodCommodity: false,
    isImportedCommodity: false,
    requiresUnitSalePrice: true
  },
  {
    id: 'cat-imported-goods',
    name: 'Imported Packaged Commodities',
    code: 'IMPORTED_COMMODITY',
    description: 'Any packaged product imported into India requiring Country of Origin and Importer address.',
    isFoodCommodity: false,
    isImportedCommodity: true,
    requiresUnitSalePrice: true
  },
  {
    id: 'cat-general-merchandise',
    name: 'General Packaged Commodities',
    code: 'GENERAL_PACKAGED',
    description: 'Non-food general packaged articles sold by measure, weight or unit count.',
    isFoodCommodity: false,
    isImportedCommodity: false,
    requiresUnitSalePrice: true
  }
];

export const RULE_REQUIREMENTS: RuleRequirement[] = [
  {
    id: 'req-mfg-name-addr',
    versionId: 'ver-2021-usp',
    ruleClause: 'Rule 6(1)(a)',
    title: 'Manufacturer / Packer / Importer Name & Address',
    fieldKey: 'manufacturer',
    description: 'Name and complete address of the manufacturer, or where manufacturer is not packer, both manufacturer & packer; for imported goods, complete name & address of importer.',
    isMandatory: true,
    validationType: 'presence',
    minNumeralHeightMm: 2.0,
    sourceReference: 'Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(a)'
  },
  {
    id: 'req-generic-name',
    versionId: 'ver-2021-usp',
    ruleClause: 'Rule 6(1)(b)',
    title: 'Generic or Common Name of Commodity',
    fieldKey: 'product_name',
    description: 'The common or generic name of the commodity contained in the package must be clearly stated.',
    isMandatory: true,
    validationType: 'presence',
    minNumeralHeightMm: 2.0,
    sourceReference: 'Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(b)'
  },
  {
    id: 'req-net-quantity',
    versionId: 'ver-2021-usp',
    ruleClause: 'Rule 6(1)(c) & Rule 11/12',
    title: 'Net Quantity in Standard SI Units',
    fieldKey: 'net_quantity',
    description: 'Net quantity in terms of standard unit of weight (g, kg), volume (ml, L), length (m, cm), or number (N / U). Non-standard units (e.g., lbs, oz, bottles) are prohibited.',
    isMandatory: true,
    validationType: 'standard_unit',
    minNumeralHeightMm: 4.0,
    sourceReference: 'Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(c) read with Rule 11'
  },
  {
    id: 'req-mfg-date',
    versionId: 'ver-2021-usp',
    ruleClause: 'Rule 6(1)(d)',
    title: 'Month and Year of Manufacture / Packing / Import',
    fieldKey: 'mfg_date',
    description: 'The month and year in which the commodity is manufactured or pre-packed or imported in MM/YYYY or Month Year format.',
    isMandatory: true,
    validationType: 'date_format',
    minNumeralHeightMm: 2.0,
    sourceReference: 'Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(d)'
  },
  {
    id: 'req-unit-sale-price',
    versionId: 'ver-2021-usp',
    ruleClause: 'Rule 6(1)(da)',
    title: 'Unit Sale Price (USP) Declaration',
    fieldKey: 'unit_sale_price',
    description: 'Unit sale price in rupees rounded to two decimal places: per g/ml when net quantity is under 1kg/1L, or per kg/L when above 1kg/1L.',
    isMandatory: true,
    validationType: 'unit_sale_price',
    minNumeralHeightMm: 2.0,
    exceptionNotes: 'Exempt for packages where net content equals exactly 1 unit or under special exemptions.',
    sourceReference: 'Legal Metrology (Packaged Commodities) Amendment Rules, 2021, GSR 779(E)'
  },
  {
    id: 'req-mrp',
    versionId: 'ver-2021-usp',
    ruleClause: 'Rule 6(1)(e)',
    title: 'Maximum Retail Price (MRP) with All Taxes',
    fieldKey: 'mrp',
    description: 'MRP in Indian Rupees, clearly stating "inclusive of all taxes" or "(incl. of all taxes)". Dual pricing or overwriting is prohibited.',
    isMandatory: true,
    validationType: 'format',
    minNumeralHeightMm: 4.0,
    sourceReference: 'Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(e)'
  },
  {
    id: 'req-consumer-care',
    versionId: 'ver-2021-usp',
    ruleClause: 'Rule 6(1)(f)',
    title: 'Consumer Care Contact Details',
    fieldKey: 'consumer_care',
    description: 'Name, address, telephone number, and email address of the designated consumer care representative or department.',
    isMandatory: true,
    validationType: 'contact_info',
    minNumeralHeightMm: 2.0,
    sourceReference: 'Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(f)'
  },
  {
    id: 'req-country-of-origin',
    versionId: 'ver-2021-usp',
    ruleClause: 'Rule 6(1)(g)',
    title: 'Country of Origin for Imported Goods',
    fieldKey: 'country_of_origin',
    description: 'Name of the country of origin or manufacture or assembly in the case of imported products.',
    isMandatory: true,
    validationType: 'presence',
    applicableCategories: ['cat-imported-goods'],
    minNumeralHeightMm: 2.0,
    exceptionNotes: 'Mandatory specifically for imported packages under Rule 6(1)(g).',
    sourceReference: 'Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(g)'
  }
];

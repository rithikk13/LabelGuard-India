-- LabelGuard India: Relational Database Schema
-- Legal Metrology (Packaged Commodities) Rules, 2011 Compliance System

-- 1. Users & Roles
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    role_id TEXT NOT NULL REFERENCES roles(id),
    badge_number TEXT,
    jurisdiction TEXT,
    created_at TEXT NOT NULL
);

-- 2. Product Master & Categories
CREATE TABLE IF NOT EXISTS product_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    is_food_commodity BOOLEAN DEFAULT FALSE,
    is_imported_commodity BOOLEAN DEFAULT FALSE,
    requires_unit_sale_price BOOLEAN DEFAULT TRUE,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS manufacturers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    gstin TEXT,
    country TEXT DEFAULT 'India',
    consumer_care_email TEXT,
    consumer_care_phone TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES product_categories(id),
    manufacturer_id TEXT REFERENCES manufacturers(id),
    brand_name TEXT,
    generic_name TEXT,
    standard_quantity TEXT,
    barcode TEXT,
    created_at TEXT NOT NULL
);

-- 3. Regulations & Versioned Rules
CREATE TABLE IF NOT EXISTS regulations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    short_code TEXT NOT NULL UNIQUE,
    ministry TEXT NOT NULL,
    act_reference TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS regulation_versions (
    id TEXT PRIMARY KEY,
    regulation_id TEXT NOT NULL REFERENCES regulations(id),
    version_code TEXT NOT NULL UNIQUE,
    effective_from TEXT NOT NULL,
    effective_to TEXT,
    amendment_summary TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_prototype BOOLEAN DEFAULT FALSE,
    official_disclaimer TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS requirements (
    id TEXT PRIMARY KEY,
    version_id TEXT NOT NULL REFERENCES regulation_versions(id),
    rule_clause TEXT NOT NULL,
    title TEXT NOT NULL,
    field_key TEXT NOT NULL,
    description TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    validation_type TEXT NOT NULL, -- 'presence', 'format', 'standard_unit', 'unit_sale_price', 'contrast'
    min_numeral_height_mm REAL,
    applicable_category_id TEXT REFERENCES product_categories(id),
    exception_notes TEXT
);

-- 4. Inspections & Images
CREATE TABLE IF NOT EXISTS inspections (
    id TEXT PRIMARY KEY,
    inspection_number TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL REFERENCES users(id),
    role TEXT NOT NULL, -- 'consumer', 'inspector', 'admin'
    product_name TEXT,
    category_id TEXT REFERENCES product_categories(id),
    manufacturer_name TEXT,
    store_name TEXT,
    store_address TEXT,
    latitude REAL,
    longitude REAL,
    timestamp TEXT NOT NULL,
    status TEXT NOT NULL, -- 'DRAFT', 'PRELIMINARY', 'PENDING_VERIFICATION', 'VERIFIED_COMPLIANT', 'VERIFIED_POTENTIAL_ISSUE', 'REJECTED'
    rule_version_id TEXT NOT NULL REFERENCES regulation_versions(id),
    notes TEXT,
    synced_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inspection_images (
    id TEXT PRIMARY KEY,
    inspection_id TEXT NOT NULL REFERENCES inspections(id),
    face TEXT NOT NULL, -- 'front', 'back', 'side', 'top', 'bottom', 'reference_board'
    image_path TEXT NOT NULL,
    quality_score REAL NOT NULL, -- 0.0 to 1.0
    quality_checks TEXT NOT NULL, -- JSON: { blur: 'pass', lighting: 'pass', crop: 'pass' }
    resolution TEXT,
    captured_at TEXT NOT NULL
);

-- 5. OCR & AI Extracted Declarations
CREATE TABLE IF NOT EXISTS ocr_results (
    id TEXT PRIMARY KEY,
    image_id TEXT NOT NULL REFERENCES inspection_images(id),
    raw_text TEXT NOT NULL,
    language_detected TEXT DEFAULT 'en',
    ocr_confidence REAL,
    bounding_boxes TEXT NOT NULL, -- JSON: array of { text, box: [x,y,w,h], confidence }
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS extracted_fields (
    id TEXT PRIMARY KEY,
    inspection_id TEXT NOT NULL REFERENCES inspections(id),
    image_id TEXT REFERENCES inspection_images(id),
    field_key TEXT NOT NULL, -- 'product_name', 'manufacturer', 'net_quantity', 'mrp', 'unit_sale_price', 'mfg_date', 'consumer_care', 'country_of_origin'
    extracted_value TEXT,
    normalized_value TEXT,
    confidence REAL,
    source_face TEXT,
    bounding_box TEXT, -- JSON: [x, y, w, h]
    is_multilingual BOOLEAN DEFAULT FALSE,
    detected_language TEXT,
    created_at TEXT NOT NULL
);

-- 6. Compliance Checks, Conflicts & Evidence
CREATE TABLE IF NOT EXISTS compliance_checks (
    id TEXT PRIMARY KEY,
    inspection_id TEXT NOT NULL REFERENCES inspections(id),
    requirement_id TEXT NOT NULL REFERENCES requirements(id),
    result TEXT NOT NULL, -- 'PASS', 'FAIL', 'REVIEW', 'NOT_APPLICABLE', 'NOT_DETECTED'
    summary TEXT NOT NULL,
    details TEXT,
    severity TEXT NOT NULL, -- 'NONE', 'LOW', 'MEDIUM', 'HIGH'
    rule_clause TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS conflicts (
    id TEXT PRIMARY KEY,
    inspection_id TEXT NOT NULL REFERENCES inspections(id),
    field_key TEXT NOT NULL,
    face_1 TEXT NOT NULL,
    value_1 TEXT NOT NULL,
    bbox_1 TEXT,
    face_2 TEXT NOT NULL,
    value_2 TEXT NOT NULL,
    bbox_2 TEXT,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence_items (
    id TEXT PRIMARY KEY,
    compliance_check_id TEXT REFERENCES compliance_checks(id),
    conflict_id TEXT REFERENCES conflicts(id),
    image_id TEXT NOT NULL REFERENCES inspection_images(id),
    label TEXT NOT NULL,
    bounding_box TEXT NOT NULL, -- JSON: [x, y, w, h]
    extracted_snippet TEXT,
    uncertainty_level TEXT, -- 'LOW', 'MODERATE', 'HIGH'
    created_at TEXT NOT NULL
);

-- 7. Human-in-the-Loop Verifications & Audits
CREATE TABLE IF NOT EXISTS verifications (
    id TEXT PRIMARY KEY,
    inspection_id TEXT NOT NULL REFERENCES inspections(id),
    inspector_id TEXT NOT NULL REFERENCES users(id),
    decision TEXT NOT NULL, -- 'CONFIRM', 'REJECT', 'RE_CHECK'
    finding_summary TEXT NOT NULL,
    inspector_notes TEXT,
    verified_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    user_id TEXT REFERENCES users(id),
    previous_state TEXT,
    new_state TEXT,
    timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    inspection_id TEXT NOT NULL,
    payload TEXT NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL, -- 'PENDING', 'SYNCING', 'SYNCED', 'FAILED'
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

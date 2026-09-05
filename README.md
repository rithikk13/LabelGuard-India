# LabelGuard India (SIH26034)
**Smart Legal Metrology Compliance Assistance & Inspection Platform for Packaged Commodities**  
*Ministry of Consumer Affairs, Food & Public Distribution | Smart India Hackathon 2026*

> **Tagline:** *Scan. Understand. Verify.*  
> **Core Principle:** Evidence-based Legal Metrology compliance assistance. AI assists and structures; human inspectors verify; deterministic rule engines evaluate.  
> **Statutory Notice:** *"Potential compliance finding — human verification required."*

---

## 1. Executive Summary

In India's retail economy, pre-packaged commodities are governed by the **Legal Metrology (Packaged Commodities) Rules, 2011** and its amendments (notably the 2017 & 2021/2022 Unit Sale Price amendments). Enforcement officers frequently encounter challenges with:
1. Dual pricing & conflicting declarations between front and back label faces.
2. Missing or obscured mandatory declarations (e.g. Unit Sale Price, Consumer Care email, Country of Origin).
3. Non-standard metric units and font legibility violations under Rule 7 Table 1.
4. Remote market inspections with poor or intermittent internet connectivity.

**LabelGuard India** resolves these challenges through a phone-first, evidence-anchored architecture that strictly separates:
- **Image Quality Understanding** (blur, lighting, and framing gates before OCR).
- **OCR & Layout Detection** (preserves raw multilingual text and bounding boxes).
- **Structured Information Extraction** (maps declarations into normalized parameters).
- **Product Category Intelligence** (predicts category with an audited inspector manual override).
- **Versioned Regulatory Knowledge Layer** (`LMR-2011-BASE`, `LMR-2017-AMEND`, `LMR-2021-USP`).
- **Deterministic Compliance Engine** (strictly distinguishes "Not detected" from "Definitely absent").
- **Cross-Face Conflict Engine** (flags price or quantity discrepancies across package faces).
- **Interactive Evidence Annotation** (anchors findings to exact physical coordinates).
- **Human-in-the-Loop Verification** (audited Confirm/Reject/Re-check workflows).
- **Official Panchnama-style PDF Reports** (cryptographically verifiable inspection summaries).

---

## 2. Platform Architecture

```
                                  USER ROLES
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
      Consumer Mode             Inspector Mode             Admin Dashboard
      (Phone-First Scan)        (Field Inspection)        (Directorate KPI & Map)
            │                         │                         │
            └─────────────────────────┼─────────────────────────┘
                                      ▼
                        Image Quality Gate (Blur/Glare)
                                      ▼
                       OCR & Raw Text Preservation
                                      ▼
                       Structured Entity Extraction
                                      ▼
                      Product Category Classification
                                      ▼
                  Versioned Regulatory Rules (LMR-2011 / 2021)
                                      ▼
                        Deterministic Rule Engine
                  (PASS / FAIL / REVIEW / NOT_DETECTED)
                                      ▼
                      Cross-Face Conflict Detection
                     (e.g., Front ₹320 vs Back ₹350)
                                      ▼
                      Interactive Evidence Annotation
                                      ▼
                      Human Verification Sign-off
                                      ▼
                   PDF Panchnama / Inspection Report
```

---

## 3. Key Regulatory Coverage

Governed by the **Legal Metrology (Packaged Commodities) Rules, 2011**:
- **Rule 6(1)(a):** Complete Name & Postal Address of Manufacturer / Packer / Importer.
- **Rule 6(1)(b):** Generic or Common Name of Commodity.
- **Rule 6(1)(c) & Rule 11/12:** Net Quantity in standard SI metric units (`g`, `kg`, `ml`, `L`, `m`, `cm`, `N`, `U`). Prohibits non-metric units (`lbs`, `oz`).
- **Rule 6(1)(d):** Month and Year of Manufacture / Packing / Import (`MM/YYYY`).
- **Rule 6(1)(da) (2021/2022 Amendment GSR 779(E)):** Mandatory Unit Sale Price (USP in ₹ per g/ml for commodities under 1kg/1L, or ₹ per kg/L for commodities above 1kg/1L).
- **Rule 6(1)(e):** Maximum Retail Price (MRP) in format: `MRP Rs. ... incl. of all taxes` or `MRP ₹ ... (inclusive of all taxes)`. Dual pricing prohibited.
- **Rule 6(1)(f):** Complete Consumer Care Details (Designation, Address, Phone, and Email address).
- **Rule 6(1)(g):** Country of Origin for imported pre-packaged commodities.
- **Rule 7 & Table 1:** Minimum height of numerals and letters based on net quantity.

---

## 4. User Modes

### A. Consumer Mode
- Quick packaging scan via camera or photo upload.
- Immediate preliminary screening traffic-light:
  - 🟢 **Appears compliant**
  - 🟡 **Needs manual verification**
  - 🔴 **Potential compliance issue detected** (never labels products as "illegal").
- Interactive highlighted evidence explaining why any declaration was flagged.
- Prominent statutory disclaimer banner.
- Local device scan history.

### B. Inspector Mode
- Field inspection setup with GPS coordinates, establishment name, and real-time timestamp.
- Multi-face image capture (Front Display, Back Info Panel, Inkjet Batch Stamp).
- Image Quality Gate checking focus, illumination, and resolution with retake prompt.
- Category auto-detection with audited inspector manual override.
- Automated compliance check and cross-face conflict detection.
- Interactive Evidence Viewer: Pan, zoom, click any finding to highlight the exact packaging region.
- Human-in-the-loop decision recording: `[Confirm]`, `[Reject]`, `[Re-check]` with officer notes.
- Downloadable official Panchnama-style PDF inspection report.
- Optional Rule 7 Physical Calibration Board tool.
- Offline Sync Center with status indicators (`ONLINE`, `OFFLINE`, `SYNCING`, `SYNCED`).

### C. Admin / Authority Dashboard
- Executive KPIs (Total inspections, Pass rate, Review queue, Flagged issues, Verified panchnamas).
- Interactive Geospatial Map (Leaflet) showing inspection distribution across markets.
- Statutory issues breakdown and category distribution charts.
- Repeat manufacturer observations using neutral regulatory language.
- Versioned Regulation and Rule Amendment manager with immutable audit trails.

### D. SIH 2026 Presentation Demo Mode
- 1-Click Guided Walkthrough following the exact hackathon demonstration narrative:
  1. Inspector enters shop -> 2. Captures front & back -> 3. Quality check passes -> 4. OCR extracts -> 5. Category bound -> 6. Rules evaluated -> 7. Detects cross-face MRP mismatch (₹320 vs ₹350) -> 8. Evidence anchors -> 9. Inspector confirms -> 10. Panchnama PDF generated -> 11. Directorate map updates.

---

## 5. Quick Start & Execution

### Prerequisites
- Node.js v18+ (Node.js v20 LTS included and pre-configured)
- npm v9+

### Starting Backend & Frontend

#### Terminal 1: Backend API
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

#### Terminal 2: Frontend Web Client
```bash
cd client
npm run dev
# Frontend runs on http://localhost:3000
```

### Running Automated Test Suite
```bash
cd server
npm test
# Executes 12 automated unit and integration tests covering compliance evaluation,
# cross-face conflict detection, quality checks, and PDF report generation.
```

---

## 6. Project Directory Structure

```
android app/
├── server/                          # Backend API & Compliance Engine
│   ├── src/
│   │   ├── db/                      # Relational database schema & persistence
│   │   ├── regulatory/              # Legal Metrology 2011 rule definitions
│   │   ├── engine/                  # Deterministic compliance & conflict engines
│   │   ├── ocr/                     # Quality checker, demo dataset, provider abstraction
│   │   ├── reports/                 # PDF Panchnama report generator
│   │   ├── routes/                  # Express REST route handlers
│   │   ├── tests/                   # Automated compliance test suite
│   │   └── index.ts                 # Server bootstrap & seeding
│   ├── package.json
│   └── tsconfig.json
├── client/                          # React + TypeScript + Tailwind Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Navbar, DisclaimerBanner, ImageQualityBadge
│   │   │   ├── consumer/            # ConsumerScan, ConsumerResult, ConsumerHistory
│   │   │   ├── inspector/           # NewInspection, EvidenceViewer, Calibration, OfflineSync
│   │   │   ├── admin/               # AdminDashboard, GeospatialMap, RuleManagement
│   │   │   └── demo/                # DemoShowcase SIH walkthrough
│   │   ├── services/                # api.ts, offlineStore.ts, calibration.ts
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── App.tsx                  # Master application router
│   │   ├── index.css                # Tailwind base styles
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

*LabelGuard India — Developed for Smart India Hackathon 2026.*

## Prototype authentication

The prototype now uses JWT authentication with bcrypt password verification and role-based API protection. Seeded demo accounts share the prototype password `LabelGuard@2026`:

- `inspector.ramesh` — Inspector
- `admin.mukherjee` — Admin
- `consumer.priya` — Consumer

These credentials are for the SIH prototype only and must be replaced by managed identity provisioning before production deployment.

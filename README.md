# VerticalMap 3D

> **From 2D Land Parcels to 3D Property Intelligence**  
> Prototype Decision-Support & Vertical Property Mapping System for **Smart India Hackathon 2026** (**SIH26011**).  
> **Organization**: Ministry of Rural Development • **Department**: Department of Land Resources (DoLR) • **Theme**: Space Technology • **Category**: Software

---

## Problem Statement

Traditional land records represent properties solely as 2D surface parcels on cadastral maps. However, modern urban settlements in India feature complex vertical properties:
- Multi-storey apartment complexes
- Individual residential floors and apartment units
- Basements, mechanical spaces, and underground utility vaults
- Multi-level automated parking facilities
- Elevated skywalks and mixed-use towers

A conventional 2D surface parcel (and 14-digit standard 2D ULPIN / Bhu-Aadhaar) cannot uniquely distinguish or legally delimit these vertically stacked spatial ownership units. 

## Solution

**VerticalMap 3D** extends conventional 2D land parcel cadastral boundaries into true 3D volumetric property representations. By synthesizing multi-source geospatial data:
- 2D Cadastral GIS parcels & survey numbers
- High-resolution drone photogrammetry & orthomosaics
- Simulated LiDAR point-cloud elevation data
- Architectural floor plans & vertical horizons
- Survey of India CORS GNSS coordinates
- DEM (Digital Elevation Model) & DSM (Digital Surface Model) data

VerticalMap 3D deterministically generates **Proposed 3D ULPINs** (Candidate Vertical Spatial Identifiers), validates spatial geometry via an 8-point topology audit, renders interactive 3D visualizations, and generates official-format digital 3D Property Passports with field-scannable QR codes.

---

## Key Features

1. **Interactive 2D Cadastral GIS Map**: Vector parcel boundaries, survey number demarcation, building footprint overlays, and Survey of India CORS benchmark pins.
2. **Three.js 3D Building & Parcel Visualizer**: Volumetric 3D building models showing structural slabs, underground basement cutaways, color-coded property units (Residential, Commercial, Parking, Common Area, Utility), and floor-explosion stacking sliders.
3. **Vertical Level & Floor Inspector**: Slices and isolates individual building levels from Basement (-3.2m) to Penthouse (+20.2m) with exact elevation (Z) metrics.
4. **Candidate Unit Delineation**: Volumetric bounding extents (`minX, maxX, minY, maxY, minZ, maxZ`) and area calculation for individual apartments and suites.
5. **Deterministic 3D ULPIN Generator**: Formats candidate vertical identifiers (e.g., `IN-MH-PUN-P001-B01-F03-U02`) and extended Bhu-Aadhaar formats (`MH2748002A0001/Z+10.2/B01/F03/U02`).
6. **8-Point Topology Validation Engine**: Automated geometric checks for parcel boundary closure, building containment, slab continuity, interior unit overlaps, and coordinate precision.
7. **AI Validation Explanations**: Explains spatial boundary intersections in plain language and advises survey reconciliation steps.
8. **3D Property Passport & QR Code**: Official-style digital cadastral dossier with real QR code containing cryptographic spatial metadata for mobile field verification.
9. **Simulated LiDAR Point Cloud Viewer**: Interactive 3D point-cloud viewer (3,500+ points) with elevation colormapping and layer toggles (Show Building, Floors, Units, Parcel).
10. **Simulated AI Building Extraction**: Demonstrates automated footprint extraction, floor height estimation, and unit delineation from drone imagery.
11. **VerticalMap Assistant**: Integrated conversational assistant powered by Google Gemini 3.8 Flash to explain 3D coordinates, ULPIN codes, and validation warnings.
12. **Automated SIH Demo Mode**: 10-step guided 1-2 minute walkthrough covering the entire problem statement workflow.

---

## How It Works

```text
2D Cadastral Parcel (Survey No. 48/2A, Baner, Pune)
       ↓
3D Building Extrusion (Tower A - Sahyadri Heights)
       ↓
Vertical Floor Segmentation (Basement to Floor 5, Z: -3.2m to +20.2m)
       ↓
Unit Demarcation (Unit 302, 1,250 sq.ft, Elev: +10.2m)
       ↓
Proposed 3D ULPIN Generation (IN-MH-PUN-P001-B01-F03-U02)
       ↓
8-Point Topology Validation (Cadastral containment & non-penetration)
       ↓
3D Property Passport & Field QR Code
       ↓
Export Official Cadastral Report
```

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Motion
- **3D Visualization**: Three.js (WebGL rendering, orbital camera physics, volumetric geometries, raycasting selection)
- **QR Code Engine**: `qrcode` (real PNG data URL generation)
- **Backend**: Node.js, Express, TypeScript (`tsx`)
- **AI / LLM Integration**: Google Gemini API via `@google/genai` TypeScript SDK (`gemini-3.8-flash`) with server-side proxy
- **Geospatial & Cadastral Formats**: GeoJSON, WGS84 / UTM Zone 43N, CORS GNSS, DEM/DSM elevation data

---

## System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│  React 19 SPA • Tailwind CSS • Three.js 3D WebGL Canvas     │
│  2D Cadastral SVG Map • QR Generator • Reports Print Engine │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API
┌──────────────────────────────▼──────────────────────────────┐
│                    Express Backend Server                   │
│                                                             │
│  ├─ /api/parcels & /api/buildings (Cadastral Records)       │
│  ├─ /api/ulpin/generate (Deterministic 3D ULPIN Algorithm)  │
│  ├─ /api/validation/run (8-Point Topology Audit Engine)     │
│  ├─ /api/ai/extract (Simulated AI Building Extraction)      │
│  └─ /api/ai/chat (Gemini 3.8 Flash via @google/genai)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                   Geospatial Data Store                     │
│  Cadastral Parcels • Building Footprints • Vertical Slabs   │
│  LiDAR Point Clouds • Drone Orthomosaics • CORS Reference   │
└─────────────────────────────────────────────────────────────┘
```

---

## SIH Demo Mode

To evaluate the complete workflow during hackathon presentations:
1. Click the amber **"RUN SIH DEMO"** button in the header.
2. The system executes a 10-step guided walkthrough with auto-play or manual controls:
   - Select 2D parcel
   - Open 3D building
   - Inspect vertical floors
   - Delineate unit
   - Run AI extraction
   - Generate 3D ULPIN
   - Validate geometry
   - Display property passport
   - Generate QR code
   - Export official cadastral dossier

---

## Installation & Running

### Prerequisites
- Node.js (v20+ recommended)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `GEMINI_API_KEY` is configured if using live AI assistant capabilities (the application also features an intelligent cadastral fallback engine if offline).

### 3. Run Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## Project Structure

```text
/
├── server.ts                       # Express backend server with Vite middleware integration
├── server/
│   └── services/
│       ├── geminiService.ts        # Gemini 3.8 Flash SDK service for VerticalMap Assistant
│       ├── ulpinGenerator.ts       # Deterministic 3D ULPIN generation engine
│       └── validationService.ts    # 8-Point spatial topology validation engine
├── src/
│   ├── App.tsx                     # Main layout router
│   ├── main.tsx                    # React client entry point
│   ├── index.css                   # Global Tailwind CSS & print media styling
│   ├── types.ts                    # Full TypeScript schema for cadastral 3D entities
│   ├── context/
│   │   └── AppContext.tsx          # Central state management
│   ├── data/
│   │   └── mockData.ts             # Realistic cadastral survey datasets (Pune, Mumbai, Delhi)
│   └── components/
│       ├── Navbar.tsx              # Government & DoLR header with 8 navigation items
│       ├── Dashboard.tsx           # High-level KPIs, workflow diagram, quick actions
│       ├── PropertyMap.tsx         # 2D GIS Cadastral parcel viewer with satellite/ortho layers
│       ├── ThreeDPropertyViewer.tsx# Interactive Three.js 3D building visualizer
│       ├── UlpinGenerator.tsx      # Configurable 3D ULPIN generator and QR viewer
│       ├── TopologyValidation.tsx  # 8-Point geometric validation with AI explanations
│       ├── PropertyPassport.tsx    # Digital 3D Property Passport with QR code
│       ├── PropertyRecords.tsx     # Filterable cadastral property registry
│       ├── ReportsView.tsx         # Printable official DoLR dossiers
│       ├── SettingsView.tsx        # Geodetic datum and ULPIN configuration
│       ├── AIAssistantDrawer.tsx   # VerticalMap AI Assistant slide-over drawer
│       ├── SIHDemoModal.tsx        # 10-step automated SIH 2026 demo modal
│       ├── PointCloudViewer.tsx    # 3D LiDAR point-cloud viewer
│       └── AIExtractionModal.tsx   # Simulated AI building & floor extraction modal
├── metadata.json                   # Applet metadata
├── package.json                    # Project scripts and dependencies
├── SECURITY.md                     # Secret handling and security documentation
└── README.md                       # Comprehensive system documentation
```

---

## Security

- All API keys (e.g. Gemini API) are handled server-side only and never leaked to client bundles.
- Safe HTTP security headers are enforced.
- `.gitignore` strictly protects sensitive environment files and logs.
- See [SECURITY.md](./SECURITY.md) for full security and secret-handling guidelines.

---

## Limitations

- **Prototype System**: This software is developed as a prototype decision-support tool for Smart India Hackathon 2026.
- **Proposed 3D ULPIN**: Generated identifiers are candidate spatial codes and do **not** legally replace state-issued land title records or registered sale deeds.
- **Simulated Geospatial Data**: High-density LiDAR and drone photogrammetry are synthetic demo datasets formatted to match real cadastral surveying standards.

---

## Future Scope

1. Direct integration with state **BhuNaksha** and **BhuAadhaar** central databases.
2. Direct ingestion of LAS/LAZ point clouds from airborne LiDAR drones.
3. Computer vision pipelines for automated floor plan vectorization from scanned blueprint PDFs.
4. City-scale CityGML / 3D Tiles streaming for multi-parcel district models.

---

## SIH 2026 Relevance

This prototype directly addresses **SIH26011** (Ministry of Rural Development, Department of Land Resources) by demonstrating how conventional 2D surface parcels can be systematically extended into unambiguous 3D vertical property units, resolving boundary ambiguities in high-density urban Indian real estate.

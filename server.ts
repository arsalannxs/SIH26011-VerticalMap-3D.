import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEMO_PARCELS, DEMO_DRONE_SURVEYS, DEMO_POINT_CLOUDS, DEMO_VALIDATION_REPORTS } from './src/data/mockData';
import { generateProposed3DUlpin } from './server/services/ulpinGenerator';
import { runTopologyValidation } from './server/services/validationService';
import { askVerticalMapAssistant } from './server/services/geminiService';
import { Parcel, Building, Floor, PropertyUnit, AppDashboardStats } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Standard safe security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// In-Memory Database store
let parcelsState: Parcel[] = JSON.parse(JSON.stringify(DEMO_PARCELS));
let generatedUlpinsRecord: Record<string, any> = {};

// Helper: Find Unit across all parcels
function findUnit(unitId: string): { parcel: Parcel; building: Building; floor: Floor; unit: PropertyUnit } | null {
  for (const parcel of parcelsState) {
    for (const building of parcel.buildings) {
      for (const floor of building.floors) {
        for (const unit of floor.units) {
          if (unit.id === unitId) {
            return { parcel, building, floor, unit };
          }
        }
      }
    }
  }
  return null;
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// 1. Dashboard Stats
app.get('/api/stats', (req: Request, res: Response) => {
  let propertiesCount = 0;
  let floorsCount = 0;
  let ulpinsCount = 0;

  for (const p of parcelsState) {
    for (const b of p.buildings) {
      floorsCount += b.floors.length;
      for (const f of b.floors) {
        propertiesCount += f.units.length;
        ulpinsCount += f.units.filter(u => u.ulpinStatus === 'Validated' || u.ulpinStatus === 'Generated').length;
      }
    }
  }

  const stats: AppDashboardStats = {
    parcelsMapped: parcelsState.length,
    properties3D: propertiesCount,
    floorsDetected: floorsCount,
    ulpinsGenerated: ulpinsCount,
    validationPassRate: 98.4
  };

  res.json({ success: true, data: stats, isDemoData: true });
});

// 2. Parcels
app.get('/api/parcels', (req: Request, res: Response) => {
  res.json({ success: true, data: parcelsState });
});

app.get('/api/parcels/:id', (req: Request, res: Response) => {
  const parcel = parcelsState.find(p => p.id === req.params.id);
  if (!parcel) {
    return res.status(404).json({ success: false, message: 'Parcel not found' });
  }
  res.json({ success: true, data: parcel });
});

// 3. Buildings
app.get('/api/buildings', (req: Request, res: Response) => {
  const buildings: Building[] = [];
  parcelsState.forEach(p => buildings.push(...p.buildings));
  res.json({ success: true, data: buildings });
});

app.get('/api/buildings/:id', (req: Request, res: Response) => {
  for (const parcel of parcelsState) {
    const building = parcel.buildings.find(b => b.id === req.params.id);
    if (building) {
      return res.json({ success: true, data: building, parcelId: parcel.id });
    }
  }
  res.status(404).json({ success: false, message: 'Building not found' });
});

app.get('/api/buildings/:id/floors', (req: Request, res: Response) => {
  for (const parcel of parcelsState) {
    const building = parcel.buildings.find(b => b.id === req.params.id);
    if (building) {
      return res.json({ success: true, data: building.floors });
    }
  }
  res.status(404).json({ success: false, message: 'Building not found' });
});

// 4. Properties / Units
app.get('/api/properties', (req: Request, res: Response) => {
  const units: PropertyUnit[] = [];
  parcelsState.forEach(p => {
    p.buildings.forEach(b => {
      b.floors.forEach(f => {
        units.push(...f.units);
      });
    });
  });
  res.json({ success: true, data: units });
});

app.get('/api/properties/:id', (req: Request, res: Response) => {
  const item = findUnit(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Property unit not found' });
  }
  res.json({ success: true, data: item });
});

// 5. 3D ULPIN Generation
app.post('/api/ulpin/generate', (req: Request, res: Response) => {
  const { unitId, config } = req.body;
  if (!unitId) {
    return res.status(400).json({ success: false, message: 'unitId is required' });
  }

  const item = findUnit(unitId);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Property unit not found' });
  }

  const proposed = generateProposed3DUlpin(item.parcel, item.building, item.floor, item.unit, config);

  // Update in-memory unit
  item.unit.candidateUlpin = proposed.ulpin3D;
  item.unit.ulpinStatus = 'Validated';
  item.unit.lastUpdated = proposed.generationDate;
  generatedUlpinsRecord[proposed.ulpin3D] = proposed;

  res.json({
    success: true,
    data: proposed,
    message: 'Proposed 3D ULPIN generated successfully (Prototype Spatial Identifier)'
  });
});

// 6. Topology Validation
app.post('/api/validation/run', (req: Request, res: Response) => {
  const { parcelId, buildingId } = req.body;
  const pId = parcelId || 'P001';
  const bId = buildingId || 'B01';

  const parcel = parcelsState.find(p => p.id === pId);
  if (!parcel) {
    return res.status(404).json({ success: false, message: 'Parcel not found' });
  }

  const building = parcel.buildings.find(b => b.id === bId);
  if (!building) {
    return res.status(404).json({ success: false, message: 'Building not found' });
  }

  const report = runTopologyValidation(parcel, building);
  res.json({ success: true, data: report });
});

// 7. AI Extraction Simulation
app.post('/api/ai/extract', (req: Request, res: Response) => {
  const { parcelId, inputType } = req.body;
  const parcel = parcelsState.find(p => p.id === (parcelId || 'P003'));

  if (!parcel) {
    return res.status(404).json({ success: false, message: 'Parcel not found' });
  }

  // Simulated AI building & floor extraction pipeline
  const extractedBuilding: Building = {
    id: `B0${parcel.buildings.length + 1}`,
    name: 'Extracted Residence - Block 1',
    parcelId: parcel.id,
    buildingCode: `B0${parcel.buildings.length + 1}`,
    totalFloors: 3,
    basementCount: 0,
    heightM: 10.5,
    footprintAreaSqM: 380.0,
    builtUpAreaSqM: 1140.0,
    structureType: 'RCC Frame',
    demGroundElevationM: parcel.coordinates.elevation,
    dsmTopElevationM: parcel.coordinates.elevation + 10.5,
    centerCoordinates: { ...parcel.coordinates },
    footprintPolygon: [
      [-10, -8],
      [10, -8],
      [10, 8],
      [-10, 8]
    ],
    floors: [
      {
        id: `F-${parcel.id}-G`,
        buildingId: `B0${parcel.buildings.length + 1}`,
        floorNumber: 0,
        floorName: 'Ground Floor',
        heightM: 3.5,
        elevationBaseM: 0.0,
        areaSqFt: 4090,
        areaSqM: 380,
        usage: 'Residential',
        unitCount: 2,
        detectionConfidence: 0.98,
        units: [
          {
            id: `U-${parcel.id}-B1-F00-U01`,
            unitNumber: 'G01',
            floorId: `F-${parcel.id}-G`,
            buildingId: `B0${parcel.buildings.length + 1}`,
            parcelId: parcel.id,
            floorNumber: 0,
            floorName: 'Ground Floor',
            usage: 'Residential',
            areaSqFt: 1950,
            areaSqM: 181.1,
            heightM: 3.5,
            elevationM: 0.0,
            bounds3D: { minX: -10, maxX: 0, minY: -8, maxY: 8, minZ: 0.0, maxZ: 3.5, height: 3.5 },
            ownerName: 'Identified Unit G01',
            candidateUlpin: `IN-${parcel.stateCode}-${parcel.districtCode}-${parcel.id}-B01-F00-U01`,
            ulpinStatus: 'Generated',
            topologyStatus: 'Valid',
            lastUpdated: new Date().toISOString().split('T')[0]
          },
          {
            id: `U-${parcel.id}-B1-F00-U02`,
            unitNumber: 'G02',
            floorId: `F-${parcel.id}-G`,
            buildingId: `B0${parcel.buildings.length + 1}`,
            parcelId: parcel.id,
            floorNumber: 0,
            floorName: 'Ground Floor',
            usage: 'Residential',
            areaSqFt: 1950,
            areaSqM: 181.1,
            heightM: 3.5,
            elevationM: 0.0,
            bounds3D: { minX: 0, maxX: 10, minY: -8, maxY: 8, minZ: 0.0, maxZ: 3.5, height: 3.5 },
            ownerName: 'Identified Unit G02',
            candidateUlpin: `IN-${parcel.stateCode}-${parcel.districtCode}-${parcel.id}-B01-F00-U02`,
            ulpinStatus: 'Generated',
            topologyStatus: 'Valid',
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        ]
      }
    ]
  };

  if (parcel.buildings.length === 0) {
    parcel.buildings.push(extractedBuilding);
    parcel.mappingStatus = '3D Extracted';
  }

  res.json({
    success: true,
    message: 'AI Building Extraction completed (Simulated Demonstration)',
    inputType: inputType || 'Drone Orthophoto / DEM',
    confidence: 0.965,
    data: extractedBuilding
  });
});

// 8. AI Assistant Chat (VerticalMap Assistant)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { prompt, history, context } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, message: 'prompt is required' });
  }

  try {
    const answer = await askVerticalMapAssistant(prompt, history, context);
    res.json({ success: true, answer });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Assistant error' });
  }
});

// 9. Drone Survey Data
app.get('/api/drone-surveys/:id', (req: Request, res: Response) => {
  const survey = DEMO_DRONE_SURVEYS[req.params.id];
  if (!survey) {
    return res.status(404).json({ success: false, message: 'Drone survey not found' });
  }
  res.json({ success: true, data: survey });
});

// 10. Point Cloud Sample
app.get('/api/point-clouds/:parcelId', (req: Request, res: Response) => {
  const pc = DEMO_POINT_CLOUDS[req.params.parcelId] || DEMO_POINT_CLOUDS['P001'];
  res.json({ success: true, data: pc });
});

// 11. Reports List
app.get('/api/reports', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        id: 'REP-2026-001',
        title: '3D Cadastral & Vertical ULPIN Verification Dossier',
        parcelId: 'P001',
        surveyNumber: 'Survey No. 48/2A',
        generatedAt: '2026-03-12 14:45:00',
        unitsCount: 22,
        status: 'Validated with 1 Topology Warning'
      },
      {
        id: 'REP-2026-002',
        title: 'High-Density Commercial Vertical Parcel Dossier',
        parcelId: 'P002',
        surveyNumber: 'Plot C-59, G-Block, BKC',
        generatedAt: '2026-03-10 11:20:00',
        unitsCount: 5,
        status: 'Fully Validated'
      }
    ]
  });
});

// 12. Reset Demo Data
app.post('/api/reset-demo', (req: Request, res: Response) => {
  parcelsState = JSON.parse(JSON.stringify(DEMO_PARCELS));
  generatedUlpinsRecord = {};
  res.json({ success: true, message: 'Demo cadastral records restored to baseline.' });
});

// ----------------------------------------------------
// FRONTEND INTEGRATION (Vite dev middlewares or static)
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[VerticalMap 3D] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

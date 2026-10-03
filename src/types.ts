export interface SpatialCoordinate {
  latitude: number;
  longitude: number;
  elevation: number; // Ground level elevation (m above MSL)
  source: 'GNSS/CORS' | 'Total Station' | 'Drone Photogrammetry' | 'LiDAR';
  accuracy: string; // e.g. "±0.03 m"
  datum: string; // "WGS84 / UTM Zone 43N"
}

export interface BoundingBox3D {
  minX: number; // relative meters or UTM Easting
  maxX: number;
  minY: number; // relative meters or UTM Northing
  maxY: number;
  minZ: number; // relative floor bottom elevation (m)
  maxZ: number; // relative floor top elevation (m)
  height: number; // m
}

export interface PropertyUnit {
  id: string; // e.g. "U-P001-B01-F03-U02"
  unitNumber: string; // "U02" or "302"
  floorId: string;
  buildingId: string;
  parcelId: string;
  floorNumber: number; // e.g. 3 (-1 for basement)
  floorName: string; // "Floor 3"
  usage: 'Residential' | 'Commercial' | 'Office' | 'Parking' | 'Common Area' | 'Utility';
  areaSqFt: number;
  areaSqM: number;
  heightM: number;
  elevationM: number; // Z-axis elevation from datum
  bounds3D: BoundingBox3D;
  ownerName?: string;
  candidateUlpin?: string;
  ulpinStatus: 'Pending' | 'Generated' | 'Validated';
  topologyStatus: 'Valid' | 'Warning' | 'Invalid';
  topologyNotes?: string;
  lastUpdated: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  floorNumber: number; // -1: Basement, 0: Ground, 1..N
  floorName: string; // "Basement", "Ground Floor", "Floor 1", etc.
  heightM: number;
  elevationBaseM: number; // Bottom of floor relative to ground datum (0m)
  areaSqFt: number;
  areaSqM: number;
  usage: 'Residential' | 'Commercial' | 'Office' | 'Mixed' | 'Parking' | 'Services';
  unitCount: number;
  units: PropertyUnit[];
  detectionConfidence?: number; // e.g. 0.96 for AI/LiDAR extraction
}

export interface Building {
  id: string; // "B01"
  name: string; // "Tower A - Sahyadri Heights"
  parcelId: string;
  buildingCode: string; // "B01"
  totalFloors: number; // Above ground
  basementCount: number;
  heightM: number;
  footprintAreaSqM: number;
  builtUpAreaSqM: number;
  structureType: 'RCC Frame' | 'Steel Composite' | 'Masonry';
  floors: Floor[];
  footprintPolygon: [number, number][]; // Relative coordinates [x, y] in meters from parcel centroid
  centerCoordinates: SpatialCoordinate;
  demGroundElevationM: number; // e.g. 560.2 m
  dsmTopElevationM: number; // e.g. 582.6 m
}

export interface Parcel {
  id: string; // "P001"
  surveyNumber: string; // "Survey No. 48/2A"
  ulpin2D: string; // 14-character standard 2D ULPIN, e.g. "MH2748002A0001"
  state: string; // "Maharashtra"
  stateCode: string; // "MH"
  district: string; // "Pune"
  districtCode: string; // "PUN"
  tehsil: string; // "Haveli"
  village: string; // "Baner"
  areaSqM: number;
  areaSqFt: number;
  landUse: 'Urban Residential' | 'Commercial' | 'Mixed Use' | 'Institutional';
  coordinates: SpatialCoordinate;
  boundaryGeoJson: {
    type: 'Polygon';
    coordinates: number[][][]; // [lng, lat]
  };
  buildings: Building[];
  mappingStatus: '2D Parcel Only' | '3D Extracted' | '3D Mapped & Validated';
  droneSurveyId?: string;
  lidarSurveyId?: string;
}

export interface DroneSurveyData {
  surveyId: string;
  parcelId: string;
  surveyDate: string;
  flightAltitudeM: number;
  imageCount: number;
  groundSampleDistanceCm: number; // GSD
  overlapForwardPercent: number;
  overlapSidePercent: number;
  processingStatus: 'Completed' | 'Processing' | 'Pending';
  orthophotoResolution: string;
  sensorModel: string;
}

export interface PointCloudSample {
  id: string;
  parcelId: string;
  buildingId: string;
  totalPoints: number;
  densityPointsPerSqM: number;
  source: 'Airborne LiDAR (Simulated)' | 'Terrestrial LiDAR' | 'Dense Photogrammetric Cloud';
  bounds: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number };
  samplePoints: { x: number; y: number; z: number; classification: 'ground' | 'facade' | 'roof' | 'vegetation' }[];
}

export interface ValidationCheck {
  id: string;
  category: 'Parcel Boundary' | 'Building Footprint' | 'Floor Overlap' | 'Unit Overlap' | 'Vertical Gaps' | 'Vertical Overlaps' | 'Geometry Bounds' | 'Coordinate Accuracy';
  name: string;
  status: 'VALID' | 'WARNING' | 'INVALID';
  message: string;
  details?: string;
  affectedUnitId?: string;
  affectedFloorId?: string;
  aiExplanation?: string;
  suggestedAction?: string;
}

export interface TopologyValidationReport {
  parcelId: string;
  buildingId: string;
  overallStatus: 'VALID' | 'WARNING' | 'INVALID';
  validCount: number;
  warningCount: number;
  invalidCount: number;
  checks: ValidationCheck[];
  timestamp: string;
  aiSummary: string;
}

export interface Ulpin3DConfig {
  countryCode: string; // "IN"
  stateCode: string; // "MH"
  districtCode: string; // "MUM" or "PUN"
  parcelCode: string; // "P001"
  buildingCode: string; // "B01"
  floorCode: string; // "F03"
  unitCode: string; // "U02"
  elevationZ: number; // +9.6
  separator: string; // "-"
}

export interface ProposedUlpin3D {
  ulpin3D: string; // "IN-MH-PUN-P001-B01-F03-U02"
  standardExtendedUlpin: string; // "MH2748002A0001/Z+09.6/B01/F03/U02"
  unitId: string;
  parcelId: string;
  buildingId: string;
  floorId: string;
  unitNumber: string;
  floorName: string;
  elevationM: number;
  areaSqFt: number;
  areaSqM: number;
  usage: string;
  coordinates: SpatialCoordinate;
  bounds3D: BoundingBox3D;
  generationDate: string;
  validationStatus: 'Validated' | 'Warning' | 'Pending';
  disclaimer: string;
  qrPayload: string;
}

export interface PropertyPassportData {
  passportId: string;
  proposedUlpin3D: string;
  standard2DUlpin: string;
  parcelId: string;
  surveyNumber: string;
  buildingName: string;
  floorName: string;
  unitNumber: string;
  usage: string;
  areaSqFt: number;
  areaSqM: number;
  elevationM: number;
  heightM: number;
  coordinates: SpatialCoordinate;
  spatialExtents: BoundingBox3D;
  validationStatus: string;
  demGroundElevationM: number;
  dsmTopElevationM: number;
  gnssSource: string;
  gnssAccuracy: string;
  droneSurveyDate: string;
  issuedBy: string;
  issueDate: string;
  legalNotice: string;
}

export interface AppDashboardStats {
  parcelsMapped: number;
  properties3D: number;
  floorsDetected: number;
  ulpinsGenerated: number;
  validationPassRate: number;
}

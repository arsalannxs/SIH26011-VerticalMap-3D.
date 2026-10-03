import { Parcel, Building, Floor, PropertyUnit, ProposedUlpin3D, Ulpin3DConfig } from '../../src/types';

export const DEFAULT_ULPIN_CONFIG: Ulpin3DConfig = {
  countryCode: 'IN',
  stateCode: 'MH',
  districtCode: 'PUN',
  parcelCode: 'P001',
  buildingCode: 'B01',
  floorCode: 'F03',
  unitCode: 'U02',
  elevationZ: 10.2,
  separator: '-'
};

export function generateProposed3DUlpin(
  parcel: Parcel,
  building: Building,
  floor: Floor,
  unit: PropertyUnit,
  customConfig?: Partial<Ulpin3DConfig>
): ProposedUlpin3D {
  const sep = customConfig?.separator ?? '-';
  const country = customConfig?.countryCode ?? 'IN';
  const state = customConfig?.stateCode ?? parcel.stateCode;
  const district = customConfig?.districtCode ?? parcel.districtCode;
  const parcelCode = customConfig?.parcelCode ?? parcel.id;
  const buildingCode = customConfig?.buildingCode ?? building.buildingCode;
  
  // Format floor code (e.g., F-1 for basement -> FB1, F00 for ground -> F00, F01, F02, etc.)
  let floorStr = `F${floor.floorNumber < 0 ? `B${Math.abs(floor.floorNumber)}` : String(floor.floorNumber).padStart(2, '0')}`;
  if (customConfig?.floorCode) {
    floorStr = customConfig.floorCode;
  }

  // Format unit code (e.g., U01, U02, or direct unit number)
  let unitStr = unit.unitNumber.startsWith('U') ? unit.unitNumber : `U${unit.unitNumber}`;
  if (customConfig?.unitCode) {
    unitStr = customConfig.unitCode;
  }

  // Proposed 3D ULPIN Prototype String:
  // e.g. IN-MH-PUN-P001-B01-F03-U02
  const ulpin3D = [country, state, district, parcelCode, buildingCode, floorStr, unitStr].join(sep);

  // Standard BhuAadhaar 14-digit compatible extended vertical format:
  // e.g. MH2748002A0001/Z+10.2/B01/F03/U02
  const zSign = unit.elevationM >= 0 ? '+' : '';
  const zStr = `${zSign}${unit.elevationM.toFixed(1)}`;
  const standardExtendedUlpin = `${parcel.ulpin2D}/Z${zStr}/${buildingCode}/${floorStr}/${unitStr}`;

  // QR Code Payload (structured JSON payload for field verification)
  const qrPayload = JSON.stringify({
    system: 'VerticalMap 3D (DoLR SIH26011 Prototype)',
    type: 'Proposed 3D ULPIN',
    code: ulpin3D,
    extended: standardExtendedUlpin,
    parcel: parcel.id,
    surveyNo: parcel.surveyNumber,
    building: building.name,
    floor: floor.floorName,
    unit: unit.unitNumber,
    elevationMSL: (parcel.coordinates.elevation + unit.elevationM).toFixed(1) + ' m',
    relativeZ: zStr + ' m',
    areaSqM: unit.areaSqM,
    accuracy: parcel.coordinates.accuracy,
    issued: new Date().toISOString().split('T')[0],
    notice: 'Candidate Vertical Spatial Identifier - Prototype Only'
  });

  return {
    ulpin3D,
    standardExtendedUlpin,
    unitId: unit.id,
    parcelId: parcel.id,
    buildingId: building.id,
    floorId: floor.id,
    unitNumber: unit.unitNumber,
    floorName: floor.floorName,
    elevationM: unit.elevationM,
    areaSqFt: unit.areaSqFt,
    areaSqM: unit.areaSqM,
    usage: unit.usage,
    coordinates: {
      ...parcel.coordinates,
      elevation: parcel.coordinates.elevation + unit.elevationM
    },
    bounds3D: unit.bounds3D,
    generationDate: new Date().toISOString().split('T')[0],
    validationStatus: unit.topologyStatus === 'Valid' ? 'Validated' : (unit.topologyStatus === 'Warning' ? 'Warning' : 'Pending'),
    disclaimer: 'PROPOSED 3D ULPIN — PROTOTYPE. Prototype spatial identifier generated for SIH26011 decision-support testing. Not a legal replacement for state-issued land title records or ULPIN.',
    qrPayload
  };
}

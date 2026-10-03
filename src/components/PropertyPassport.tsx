import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyUnit } from '../types';
import { 
  Building2, 
  MapPin, 
  QrCode, 
  ShieldCheck, 
  Printer, 
  Download, 
  Info,
  CheckCircle2,
  ExternalLink,
  Layers
} from 'lucide-react';
import QRCode from 'qrcode';

export const PropertyPassport: React.FC<{ unitOverride?: PropertyUnit | null; onClose?: () => void }> = ({ unitOverride, onClose }) => {
  const { 
    selectedParcel, 
    selectedBuilding, 
    selectedFloor, 
    selectedUnit,
    proposedUlpins,
    generateUlpinForUnit
  } = useApp();

  const unit = unitOverride || selectedUnit || selectedFloor.units[0];
  const proposed = proposedUlpins[unit?.id] || (unit ? generateUlpinForUnit(unit) : null);

  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (proposed?.qrPayload) {
      QRCode.toDataURL(proposed.qrPayload, {
        width: 240,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }).then(setQrUrl).catch(console.error);
    }
  }, [proposed]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action bar */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-bold uppercase tracking-wider">
            Prototype Property Passport
          </span>
          <span className="text-xs text-slate-500">
            SIH26011 Decision-Support Cadastral Dossier
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Passport
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Official Passport Card Body */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md p-8 relative overflow-hidden print:border-none print:shadow-none print:p-0">
        {/* Subtle Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none select-none">
          <span className="text-8xl font-black rotate-[-25deg] text-slate-900 tracking-widest">
            PROTOTYPE
          </span>
        </div>

        {/* Passport Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Department of Land Resources (DoLR) • Ministry of Rural Development
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                3D Property Passport
              </h2>
              <p className="text-xs text-slate-500">
                Candidate 3D Vertical Spatial Identifier Certificate
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              STATUS: VALIDATED
            </span>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              Ref: PASSPORT-{unit?.id || 'P001-B01'}
            </div>
          </div>
        </div>

        {/* Big Proposed 3D ULPIN banner */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Proposed 3D ULPIN (Spatial Identifier)
            </span>
            <div className="font-mono text-xl sm:text-2xl font-black text-blue-700 tracking-wide break-all">
              {proposed?.ulpin3D}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              Extended Bhu-Aadhaar: <strong className="text-slate-800">{proposed?.standardExtendedUlpin}</strong>
            </div>
          </div>

          {/* QR Code */}
          {qrUrl && (
            <div className="shrink-0 text-center">
              <img src={qrUrl} alt="3D ULPIN QR Code" className="w-24 h-24 border border-slate-200 rounded-lg p-1 bg-white mx-auto shadow-2xs" />
              <span className="text-[9px] text-slate-400 font-mono block mt-0.5">Field QR Scan</span>
            </div>
          )}
        </div>

        {/* Passport Two-Column Spatial Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6">
          {/* Left Column: Cadastral & Building Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
              Cadastral Surface Land Record
            </h4>
            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">2D Survey / Plot Number:</span>
                <strong className="text-slate-900">{selectedParcel.surveyNumber}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Official 2D ULPIN:</span>
                <span className="font-mono font-bold text-slate-900">{selectedParcel.ulpin2D}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cadastral Location:</span>
                <span className="text-slate-900 font-medium">{selectedParcel.village}, {selectedParcel.district}, {selectedParcel.state}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Parcel Surface Area:</span>
                <strong className="text-slate-900">{selectedParcel.areaSqM.toLocaleString()} m² ({selectedParcel.areaSqFt.toLocaleString()} sq.ft)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Building Structure:</span>
                <strong className="text-slate-900">{selectedBuilding.name} ({selectedBuilding.buildingCode})</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Structural Type:</span>
                <span className="text-slate-900">{selectedBuilding.structureType} ({selectedBuilding.totalFloors} Storeys + {selectedBuilding.basementCount} Basement)</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Unit & Vertical Geospatial Extents */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
              Vertical Property Demarcation
            </h4>
            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Vertical Level:</span>
                <strong className="text-slate-900">{unit?.floorName} (Floor {unit?.floorNumber})</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Unit Identification:</span>
                <strong className="text-blue-700">Unit {unit?.unitNumber}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Demarcated Area:</span>
                <strong className="text-slate-900">{unit?.areaSqFt.toLocaleString()} sq.ft ({unit?.areaSqM} m²)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Vertical Elevation (Z):</span>
                <strong className="text-blue-800">+{unit?.elevationM} m (MSL: {(selectedParcel.coordinates.elevation + (unit?.elevationM || 0)).toFixed(1)} m)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Primary Usage:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{unit?.usage}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">GNSS/CORS Source:</span>
                <span className="text-slate-900">{selectedParcel.coordinates.source} ({selectedParcel.coordinates.accuracy})</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Bounding Extents Table */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs mb-6">
          <span className="font-bold text-slate-800 block mb-1">
            Volumetric Extents (3D Spatial Bounding Coordinates):
          </span>
          <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-700">
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-400 block text-[9px]">X Coordinates (East-West)</span>
              <strong>{unit?.bounds3D.minX}m to {unit?.bounds3D.maxX}m</strong>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-400 block text-[9px]">Y Coordinates (North-South)</span>
              <strong>{unit?.bounds3D.minY}m to {unit?.bounds3D.maxY}m</strong>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-400 block text-[9px]">Z Coordinates (Vertical Slab)</span>
              <strong>{unit?.bounds3D.minZ}m to {unit?.bounds3D.maxZ}m</strong>
            </div>
          </div>
        </div>

        {/* Official Statutory Disclaimer & Sign-Off */}
        <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10px] text-slate-500">
          <div className="max-w-md space-y-0.5">
            <p className="font-semibold text-slate-700">PROTOTYPE SPATIAL IDENTIFIER DISCLAIMER</p>
            <p>
              This 3D Property Passport is generated by the VerticalMap 3D prototype for SIH26011 decision-support testing. It does not replace registered land titles or official government deeds.
            </p>
          </div>

          <div className="text-right sm:text-right shrink-0">
            <div className="font-mono text-slate-400">ISSUED: {new Date().toISOString().split('T')[0]}</div>
            <div className="text-slate-800 font-bold mt-1">Survey of India / DoLR Pilot Node</div>
          </div>
        </div>
      </div>
    </div>
  );
};

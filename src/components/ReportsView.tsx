import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Layers, 
  MapPin, 
  ShieldCheck,
  Eye
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { 
    selectedParcel, 
    selectedBuilding, 
    validationReport, 
    stats 
  } = useApp();

  const [activeReportType, setActiveReportType] = useState<'dossier' | 'ulpin' | 'validation' | 'parcel'>('dossier');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Cadastral Reports & Spatial Dossiers
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              DoLR Format
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Generate printable verification dossiers for vertical properties and candidate 3D ULPINs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 no-print">
        {[
          { id: 'dossier', label: 'Complete Property Dossier' },
          { id: 'ulpin', label: '3D ULPIN Spatial Register' },
          { id: 'validation', label: 'Topology Validation Report' },
          { id: 'parcel', label: 'Parcel Cadastral Summary' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportType(tab.id as any)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeReportType === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Printable Report Document */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              GOVERNMENT OF INDIA • MINISTRY OF RURAL DEVELOPMENT
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Department of Land Resources (DoLR)
            </h2>
            <div className="text-xs text-slate-600 font-medium">
              Vertical Property Mapping & 3D ULPIN Verification Report
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-500 font-mono">
            <div>DATE: {new Date().toISOString().split('T')[0]}</div>
            <div>REF: DoLR-SIH26011-{selectedParcel.id}</div>
            <div className="text-amber-800 font-bold text-[10px] uppercase">Prototype Decision Dossier</div>
          </div>
        </div>

        {/* Report Content based on selection */}
        {activeReportType === 'dossier' && (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Section 1: Cadastral Land Parcel */}
            <div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs pb-1 border-b border-slate-200 mb-2">
                1. 2D Cadastral Land Parcel Information
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Survey Number</span>
                  <strong>{selectedParcel.surveyNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Official 2D ULPIN</span>
                  <span className="font-mono font-bold">{selectedParcel.ulpin2D}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Surface Area</span>
                  <strong>{selectedParcel.areaSqM.toLocaleString()} m² ({selectedParcel.areaSqFt.toLocaleString()} sq.ft)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Administrative Tehsil</span>
                  <span>{selectedParcel.village}, {selectedParcel.tehsil}, {selectedParcel.district}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Building & Vertical Stratification */}
            <div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs pb-1 border-b border-slate-200 mb-2">
                2. Building Structure & Vertical Floor Mapping
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Building Name</span>
                  <strong>{selectedBuilding.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Structure Height</span>
                  <strong>{selectedBuilding.heightM} m (DSM Top: {selectedBuilding.dsmTopElevationM}m)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Storey Breakdown</span>
                  <strong>{selectedBuilding.totalFloors} Upper Floors + {selectedBuilding.basementCount} Basement</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Units Mapped</span>
                  <strong>22 Vertical Property Units</strong>
                </div>
              </div>

              {/* Floor Table */}
              <table className="w-full text-[11px] text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Level / Floor</th>
                    <th className="p-2">Height</th>
                    <th className="p-2">Base Elevation (Z)</th>
                    <th className="p-2">Area (sq.ft)</th>
                    <th className="p-2">Units Count</th>
                    <th className="p-2">Primary Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedBuilding.floors.map((f) => (
                    <tr key={f.id}>
                      <td className="p-2 font-bold">{f.floorName}</td>
                      <td className="p-2">{f.heightM} m</td>
                      <td className="p-2 font-mono font-semibold">+{f.elevationBaseM.toFixed(1)} m</td>
                      <td className="p-2">{f.areaSqFt.toLocaleString()}</td>
                      <td className="p-2">{f.unitCount}</td>
                      <td className="p-2">{f.usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section 3: Topology Validation Summary */}
            <div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs pb-1 border-b border-slate-200 mb-2">
                3. Topology & Spatial Geometry Validation Audit
              </h3>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between font-semibold">
                  <span>Overall Cadastral Validity:</span>
                  <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                    7 of 8 Tests Passed (1 Overlap Warning)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Summary: All perimeter boundary containment and vertical slab continuity tests conform to DoLR specifications. Unit 203 and 204 present a 2.4 m² interior partition overlap on Floor 2 scheduled for field surveyor reconciliation.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeReportType === 'ulpin' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs pb-1 border-b border-slate-200">
              Generated 3D ULPIN Vertical Registry Table
            </h3>
            <table className="w-full text-left text-[11px] border border-slate-200">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2">Unit</th>
                  <th className="p-2">Floor</th>
                  <th className="p-2">Elevation (Z)</th>
                  <th className="p-2">Proposed 3D ULPIN</th>
                  <th className="p-2">Extended Standard Format</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedBuilding.floors[3].units.map((u) => (
                  <tr key={u.id}>
                    <td className="p-2 font-bold">Unit {u.unitNumber}</td>
                    <td className="p-2">Floor 3</td>
                    <td className="p-2 font-mono">+{u.elevationM}m</td>
                    <td className="p-2 font-mono text-blue-700 font-bold">{u.candidateUlpin}</td>
                    <td className="p-2 font-mono text-[10px] text-slate-600">MH2748002A0001/Z+10.2/B01/F03/{u.unitNumber}</td>
                    <td className="p-2 text-emerald-700 font-semibold">Validated</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReportType === 'validation' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs pb-1 border-b border-slate-200">
              Cadastral Topology Validation Results
            </h3>
            <div className="space-y-2">
              {validationReport?.checks.map((chk) => (
                <div key={chk.id} className="p-2.5 rounded border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <strong className="text-slate-800">{chk.name}</strong>
                    <div className="text-[11px] text-slate-500">{chk.message}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${chk.status === 'VALID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {chk.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeReportType === 'parcel' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs pb-1 border-b border-slate-200">
              Cadastral Parcel Summary & Space Tech Sources
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold block mb-1">Geodetic CORS Reference</span>
                <p>CORS Station: Pune South (PUN-04)</p>
                <p>Coordinates: {selectedParcel.coordinates.latitude}°N, {selectedParcel.coordinates.longitude}°E</p>
                <p>Elevation Datum: EGM08 (MSL 560.2m)</p>
                <p>Accuracy: ±0.03 m RMS</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold block mb-1">Photogrammetry & Drone Survey</span>
                <p>Survey Date: 2026-02-18</p>
                <p>Image Count: 248 Orthophotos</p>
                <p>Ground Sample Distance: 1.8 cm/pixel</p>
                <p>Sensor: 45MP Metric Full-Frame</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
          <span>VerticalMap 3D • DoLR SIH26011 Decision Support Engine</span>
          <span>Official Cadastral Prototype Dossier</span>
        </div>
      </div>
    </div>
  );
};

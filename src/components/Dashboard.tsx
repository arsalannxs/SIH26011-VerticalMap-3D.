import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Layers, 
  Map, 
  QrCode, 
  ShieldCheck, 
  ArrowRight, 
  Boxes, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  FileText,
  Activity,
  Sparkles,
  Database
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    stats, 
    setActiveTab, 
    setSelectedParcel, 
    setSelectedFloor, 
    setSelectedUnit,
    parcels,
    setIsDemoMode,
    setIsAiAssistantOpen,
    setIsExtractModalOpen,
    setIsPointCloudModalOpen
  } = useApp();

  const workflowSteps = [
    { num: 1, label: 'SELECT PARCEL', tab: 'map' },
    { num: 2, label: 'VIEW 3D PROPERTY', tab: '3d-view' },
    { num: 3, label: 'DETECT / SELECT BUILDING', tab: '3d-view' },
    { num: 4, label: 'IDENTIFY FLOORS / UNITS', tab: '3d-view' },
    { num: 5, label: 'GENERATE 3D ULPIN', tab: 'ulpin' },
    { num: 6, label: 'VALIDATE GEOMETRY', tab: 'validation' },
    { num: 7, label: 'VIEW PROPERTY DETAILS', tab: 'records' },
    { num: 8, label: 'EXPORT PROPERTY RECORD', tab: 'reports' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">VerticalMap 3D</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              DEMO DATA
            </span>
          </div>
          <p className="text-slate-600 text-sm font-medium">
            3D Property & ULPIN Intelligence • Smart India Hackathon 2026 Problem Statement SIH26011
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('3d-view')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4" />
            GENERATE 3D PROPERTY
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsDemoMode(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 shadow-xs transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            RUN SIH DEMO
          </button>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Parcels Mapped */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Parcels Mapped</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Map className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.parcelsMapped}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cadastral boundaries verified via GNSS/CORS
          </p>
        </div>

        {/* Card 2: 3D Properties */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">3D Properties</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.properties3D}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Identifiable vertical units & parking slots
          </p>
        </div>

        {/* Card 3: Floors Detected */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Floors Detected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.floorsDetected}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Including basements & terraces segmented
          </p>
        </div>

        {/* Card 4: ULPINs Generated */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">ULPINs Generated</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.ulpinsGenerated}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Candidate 3D vertical spatial identifiers
          </p>
        </div>
      </div>

      {/* Simple User Workflow Progress Bar / Diagram */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Simple User Workflow
            </h3>
            <p className="text-xs text-slate-500">
              Clear end-to-end path from 2D surface cadastral parcel to 3D ULPIN property passport
            </p>
          </div>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            One-Click Guided Path
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {workflowSteps.map((step, idx) => (
            <button
              key={step.num}
              onClick={() => setActiveTab(step.tab as any)}
              className="flex flex-col items-center text-center p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 transition-all group"
            >
              <span className="w-6 h-6 rounded-full bg-slate-200 group-hover:bg-blue-600 group-hover:text-white text-slate-700 font-bold text-xs flex items-center justify-center mb-1.5 transition-colors">
                {step.num}
              </span>
              <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                {step.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Recent Vertical Properties & Multi-source Geospatial Layers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sample Vertical Parcels Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-600" />
              Candidate Vertical Property Units (Demo Data)
            </h3>
            <button
              onClick={() => setActiveTab('records')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All Records <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Parcel / Survey No</th>
                  <th className="py-2.5 px-3">Floor & Unit</th>
                  <th className="py-2.5 px-3">Elevation (Z)</th>
                  <th className="py-2.5 px-3">Proposed 3D ULPIN</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parcels[0].buildings[0].floors[3].units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-900">
                      <div>Survey No. 48/2A</div>
                      <span className="text-[10px] text-slate-400">P001 • Baner, Pune</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">Unit {unit.unitNumber}</div>
                      <span className="text-[10px] text-slate-500">Floor 3 • {unit.usage}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                      +{unit.elevationM} m
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-blue-700">
                      {unit.candidateUlpin}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Validated
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedParcel(parcels[0]);
                          setSelectedFloor(parcels[0].buildings[0].floors[3]);
                          setSelectedUnit(unit);
                          setActiveTab('3d-view');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-600 hover:text-white font-medium text-[11px] text-slate-700 transition-colors"
                      >
                        Inspect 3D
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Multi-Source Space & Spatial Tech Status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Integrated Geospatial Data
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Complies with SIH26011 multi-sensor space technology requirements:
            </p>

            <div className="space-y-3 text-xs">
              {/* Drone Imagery */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800">Drone Photogrammetry</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">248 Images</span>
                </div>
                <p className="text-[11px] text-slate-500">GSD: 1.8 cm/px • Zenmuse P1 45MP Metric Camera</p>
              </div>

              {/* LiDAR / Point Cloud */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800">LiDAR Point Cloud</span>
                  <button 
                    onClick={() => setIsPointCloudModalOpen(true)}
                    className="text-[10px] text-blue-600 font-bold hover:underline"
                  >
                    Open Viewer
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">125,000 Points • 85 pts/m² • Elevation heat classification</p>
              </div>

              {/* GNSS / CORS */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800">GNSS / CORS Station</span>
                  <span className="text-[10px] text-slate-600 font-mono font-bold">±0.03 m Accuracy</span>
                </div>
                <p className="text-[11px] text-slate-500">Survey of India CORS Network Station PUN-04</p>
              </div>

              {/* DEM / DSM */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800">DEM / DSM Elevation</span>
                  <span className="text-[10px] text-slate-600 font-mono font-bold">Z: 560.2m → 582.6m</span>
                </div>
                <p className="text-[11px] text-slate-500">Relative Floor Heights: 3.2m • Ground Datum: MSL</p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsExtractModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Simulate AI Building Extraction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

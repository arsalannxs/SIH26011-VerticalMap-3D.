import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Parcel } from '../types';
import { 
  MapPin, 
  Layers, 
  Building, 
  ExternalLink, 
  Compass, 
  CheckCircle, 
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

export const PropertyMap: React.FC = () => {
  const { 
    parcels, 
    selectedParcel, 
    setSelectedParcel, 
    setSelectedBuilding, 
    setActiveTab,
    setIsExtractModalOpen
  } = useApp();

  const [mapLayer, setMapLayer] = useState<'cadastral' | 'satellite' | 'ortho'>('cadastral');
  const [showFootprints, setShowFootprints] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleSelectParcel = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    if (parcel.buildings.length > 0) {
      setSelectedBuilding(parcel.buildings[0]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[640px] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Map Toolbar */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-600" />
            Cadastral Property Map (2D GIS Boundary Viewer)
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            CORS Datum: WGS84 / UTM 43N
          </span>
        </div>

        {/* Map Layers & Zoom */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5">
            <button
              onClick={() => setMapLayer('cadastral')}
              className={`px-3 py-1 rounded font-medium transition-colors ${mapLayer === 'cadastral' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Cadastral Vector
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-3 py-1 rounded font-medium transition-colors ${mapLayer === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Hybrid Satellite
            </button>
            <button
              onClick={() => setMapLayer('ortho')}
              className={`px-3 py-1 rounded font-medium transition-colors ${mapLayer === 'ortho' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Drone Orthomosaic
            </button>
          </div>

          <button
            onClick={() => setShowFootprints(!showFootprints)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${showFootprints ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200'}`}
          >
            Building Footprints
          </button>

          <div className="flex items-center bg-white rounded-lg border border-slate-200">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
              className="p-1.5 hover:bg-slate-100 text-slate-600"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
              className="p-1.5 hover:bg-slate-100 text-slate-600 border-l border-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Content & Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visual Map Canvas (SVG Vector Map with Real Cadastral Geometries) */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center p-6 select-none">
          {/* Background grid */}
          <div 
            className="absolute inset-0 opacity-40" 
            style={{
              backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Satellite or Ortho Underlay Simulation */}
          {mapLayer !== 'cadastral' && (
            <div 
              className={`absolute inset-0 transition-opacity ${mapLayer === 'satellite' ? 'bg-emerald-950/20' : 'bg-amber-950/15'}`}
            />
          )}

          {/* Interactive Scalable Cadastral Map Canvas */}
          <svg
            viewBox="0 0 900 600"
            className="w-full h-full max-w-4xl transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <defs>
              <pattern id="parcelPattern" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 0 16 L 16 0 M 0 0 L 16 16" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* Roads & Cadastral Surrounding Context */}
            <path
              d="M 50 120 L 850 140"
              stroke="#94a3b8"
              strokeWidth="24"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            <text x="70" y="112" fill="#64748b" fontSize="11" fontWeight="600">
              Baner-Pashan Main Link Road (30m DP)
            </text>

            <path
              d="M 380 40 L 410 560"
              stroke="#94a3b8"
              strokeWidth="18"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
            <text x="420" y="80" fill="#64748b" fontSize="10" fontWeight="500">
              Internal 12m Access Avenue
            </text>

            {/* Adjacent Non-Mapped Parcels */}
            <polygon
              points="80,180 340,190 330,360 90,340"
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <text x="140" y="270" fill="#94a3b8" fontSize="12" fontWeight="500">
              Survey No. 48/1 (Adjacent)
            </text>

            {/* PARCEL 1: P001 (Survey No. 48/2A, Baner, Pune) */}
            <g 
              onClick={() => handleSelectParcel(parcels[0])}
              className="cursor-pointer group"
            >
              <polygon
                points="450,180 820,200 790,520 440,490"
                fill={selectedParcel.id === 'P001' ? '#dbeafe' : '#f8fafc'}
                stroke={selectedParcel.id === 'P001' ? '#2563eb' : '#64748b'}
                strokeWidth={selectedParcel.id === 'P001' ? '4' : '2'}
                className="transition-colors"
              />

              {/* Building B01 Footprint */}
              {showFootprints && (
                <g>
                  <polygon
                    points="500,240 680,250 670,410 490,400"
                    fill="#3b82f6"
                    fillOpacity="0.85"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                  />
                  <text x="520" y="325" fill="#ffffff" fontSize="12" fontWeight="bold">
                    Tower A (7 Levels)
                  </text>
                  <text x="520" y="345" fill="#e0e7ff" fontSize="10">
                    22 Units Mapped
                  </text>

                  {/* Building B02 Footprint (Clubhouse) */}
                  <polygon
                    points="710,270 770,275 765,340 705,335"
                    fill="#8b5cf6"
                    fillOpacity="0.85"
                    stroke="#6d28d9"
                    strokeWidth="1.5"
                  />
                  <text x="715" y="310" fill="#ffffff" fontSize="9" fontWeight="bold">
                    Clubhouse
                  </text>
                </g>
              )}

              {/* Parcel Label */}
              <rect x="470" y="200" width="165" height="26" rx="4" fill="#1e293b" />
              <text x="480" y="217" fill="#ffffff" fontSize="11" fontWeight="bold">
                Survey No. 48/2A [P001]
              </text>
              <circle cx="450" cy="180" r="4" fill="#2563eb" />
              <circle cx="820" cy="200" r="4" fill="#2563eb" />
              <circle cx="790" cy="520" r="4" fill="#2563eb" />
              <circle cx="440" cy="490" r="4" fill="#2563eb" />
            </g>

            {/* PARCEL 2: P002 (Bandra Kurla Complex Plot C-59) */}
            <g 
              onClick={() => handleSelectParcel(parcels[1])}
              className="cursor-pointer group"
            >
              <polygon
                points="100,380 340,395 325,540 90,520"
                fill={selectedParcel.id === 'P002' ? '#dbeafe' : '#f8fafc'}
                stroke={selectedParcel.id === 'P002' ? '#2563eb' : '#64748b'}
                strokeWidth={selectedParcel.id === 'P002' ? '4' : '2'}
                className="transition-colors"
              />

              {showFootprints && (
                <g>
                  <polygon
                    points="140,415 300,425 290,505 130,495"
                    fill="#0284c7"
                    fillOpacity="0.85"
                    stroke="#0369a1"
                    strokeWidth="2"
                  />
                  <text x="150" y="460" fill="#ffffff" fontSize="11" fontWeight="bold">
                    Cyber Horizon [B01]
                  </text>
                </g>
              )}

              <rect x="110" y="395" width="135" height="22" rx="4" fill="#1e293b" />
              <text x="120" y="410" fill="#ffffff" fontSize="10" fontWeight="bold">
                Plot C-59 [P002] BKC
              </text>
            </g>

            {/* CORS Station benchmark pin */}
            <g transform="translate(410, 115)">
              <circle cx="0" cy="0" r="8" fill="#ef4444" fillOpacity="0.2" className="animate-ping" />
              <circle cx="0" cy="0" r="4" fill="#dc2626" />
              <text x="8" y="4" fill="#991b1b" fontSize="10" fontWeight="bold">
                SoI CORS Pune Base
              </text>
            </g>
          </svg>

          {/* Map Scale & CRS Overlay */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 shadow-xs flex items-center gap-3">
            <span>Projection: <strong>UTM Zone 43N</strong></span>
            <span>•</span>
            <span>Scale: <strong>1:500 Cadastral</strong></span>
            <span>•</span>
            <span>Elevation Datum: <strong>EGM08 (MSL)</strong></span>
          </div>
        </div>

        {/* Selected Parcel Right Sidebar */}
        <div className="w-88 border-l border-slate-200 bg-white flex flex-col p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Selected Parcel</span>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
              selectedParcel.mappingStatus === '3D Mapped & Validated' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {selectedParcel.mappingStatus}
            </span>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">{selectedParcel.surveyNumber}</h3>
            <p className="text-xs text-slate-500">{selectedParcel.village}, {selectedParcel.tehsil}, {selectedParcel.district}, {selectedParcel.state}</p>
          </div>

          {/* 2D ULPIN Pill */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Official 2D ULPIN (Bhu-Aadhaar)</span>
            <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">{selectedParcel.ulpin2D}</span>
          </div>

          {/* Key Attributes */}
          <div className="space-y-2.5 text-xs mb-6">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Parcel ID:</span>
              <strong className="text-slate-800">{selectedParcel.id}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Cadastral Area:</span>
              <strong className="text-slate-800">{selectedParcel.areaSqM.toLocaleString()} m² ({selectedParcel.areaSqFt.toLocaleString()} sq.ft)</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Land Use Category:</span>
              <strong className="text-slate-800">{selectedParcel.landUse}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Buildings Detected:</span>
              <strong className="text-slate-800">{selectedParcel.buildings.length} Structures</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">GNSS Coordinates:</span>
              <span className="font-mono text-slate-800 text-[11px]">{selectedParcel.coordinates.latitude}°N, {selectedParcel.coordinates.longitude}°E</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Ground Elevation (DEM):</span>
              <strong className="text-slate-800">+{selectedParcel.coordinates.elevation} m MSL</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Survey Method:</span>
              <span className="text-slate-800 font-medium">{selectedParcel.coordinates.source} ({selectedParcel.coordinates.accuracy})</span>
            </div>
          </div>

          {/* Primary Action Button requested by prompt */}
          <button
            onClick={() => setActiveTab('3d-view')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-bold tracking-wide uppercase bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors mb-2.5"
          >
            <Layers className="w-4 h-4" />
            OPEN 3D PROPERTY
          </button>

          {/* AI Building Extraction trigger if parcel has 0 buildings (like P003) */}
          {selectedParcel.buildings.length === 0 && (
            <button
              onClick={() => setIsExtractModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              RUN AI BUILDING EXTRACTION
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

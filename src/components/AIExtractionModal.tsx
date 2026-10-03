import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  X, 
  Upload, 
  Layers, 
  Building2, 
  CheckCircle2, 
  Camera, 
  FileCode, 
  Activity,
  ArrowRight
} from 'lucide-react';

export const AIExtractionModal: React.FC = () => {
  const { 
    isExtractModalOpen, 
    setIsExtractModalOpen, 
    triggerAIBuildingExtraction,
    setActiveTab,
    selectedParcel
  } = useApp();

  const [selectedInputType, setSelectedInputType] = useState<string>('drone');
  const [extracting, setExtracting] = useState<boolean>(false);
  const [extractedResult, setExtractedResult] = useState<any>(null);

  const inputOptions = [
    { id: 'drone', label: 'Drone Orthophoto (2.0 cm/px)', icon: <Camera className="w-4 h-4 text-blue-600" />, desc: 'Zenmuse P1 45MP high-resolution photogrammetric survey' },
    { id: 'lidar', label: 'Sample LiDAR Point Cloud', icon: <Activity className="w-4 h-4 text-emerald-600" />, desc: '85 pts/m² airborne laser scanning' },
    { id: 'cad', label: 'Architectural CAD Floor Plan', icon: <FileCode className="w-4 h-4 text-amber-600" />, desc: '2D DXF/DWG vector boundary layout' },
    { id: 'dsm', label: 'Satellite DEM / DSM Elevation', icon: <Layers className="w-4 h-4 text-purple-600" />, desc: 'CartoDEM & World3D digital surface model' }
  ];

  const handleRunExtraction = async () => {
    setExtracting(true);
    try {
      await triggerAIBuildingExtraction();
      setExtractedResult({
        buildingDetected: "Identified Residential Structure (Block 1)",
        footprintAreaSqM: 380.0,
        heightM: 10.5,
        detectedFloors: [
          { name: "Ground Floor", height: "3.5m", area: "380 m²", units: 2, confidence: "98.2%" },
          { name: "Floor 1", height: "3.5m", area: "380 m²", units: 2, confidence: "96.4%" },
          { name: "Floor 2", height: "3.5m", area: "380 m²", units: 2, confidence: "94.8%" }
        ],
        modelConfidence: "96.5%",
        potentialUnits: 6
      });
    } catch (e) {
      console.error(e);
    } finally {
      setExtracting(false);
    }
  };

  if (!isExtractModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">AI Building & Floor Extraction</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  DEMO AI EXTRACTION
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Automated building envelope, floor slicing & unit delineation simulation
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExtractModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Source Selector */}
        {!extractedResult ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Geospatial Input Dataset for Extraction:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {inputOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedInputType(opt.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                      selectedInputType === opt.id
                        ? 'border-blue-600 bg-blue-50/70 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                      {opt.icon}
                      {opt.label}
                    </div>
                    <p className="text-[11px] text-slate-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
              <span>Target Cadastral Parcel:</span>
              <strong className="text-slate-900">{selectedParcel.id} ({selectedParcel.surveyNumber})</strong>
            </div>

            <button
              onClick={handleRunExtraction}
              disabled={extracting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-bold tracking-wide uppercase bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${extracting ? 'animate-spin' : ''}`} />
              {extracting ? 'PROCESSING GEOSPATIAL EXTRACTION...' : 'RUN AI BUILDING EXTRACTION'}
            </button>
          </div>
        ) : (
          /* Extraction Results Display */
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Building & Floor Extraction Successful
              </span>
              <span className="font-semibold text-emerald-800">
                Model Confidence: {extractedResult.modelConfidence}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Structure</span>
                <strong className="text-slate-800">{extractedResult.buildingDetected}</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Footprint</span>
                <strong className="text-slate-800">{extractedResult.footprintAreaSqM} m²</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Height</span>
                <strong className="text-slate-800">{extractedResult.heightM} m</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Candidate Units</span>
                <strong className="text-slate-800">{extractedResult.potentialUnits} Units</strong>
              </div>
            </div>

            {/* Detected Floors Table */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">Segmented Floor Horizons:</span>
              <table className="w-full text-[11px] border border-slate-200 rounded-lg overflow-hidden text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Detected Floor</th>
                    <th className="p-2">Height</th>
                    <th className="p-2">Area</th>
                    <th className="p-2">Units</th>
                    <th className="p-2 text-right">Model Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {extractedResult.detectedFloors.map((f: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-2 font-bold">{f.name}</td>
                      <td className="p-2">{f.height}</td>
                      <td className="p-2">{f.area}</td>
                      <td className="p-2">{f.units}</td>
                      <td className="p-2 text-right text-emerald-700 font-semibold">{f.confidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setIsExtractModalOpen(false);
                  setActiveTab('3d-view');
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors"
              >
                Inspect Extracted Building in 3D View
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setExtractedResult(null)}
                className="px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
              >
                New Extraction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

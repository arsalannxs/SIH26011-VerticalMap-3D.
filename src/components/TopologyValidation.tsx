import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Sparkles, 
  Info,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const TopologyValidation: React.FC = () => {
  const { 
    validationReport, 
    runValidation, 
    isValidating, 
    selectedParcel, 
    selectedBuilding,
    setActiveTab,
    setSelectedFloor,
    setSelectedUnit
  } = useApp();

  const getStatusBadge = (status: 'VALID' | 'WARNING' | 'INVALID') => {
    switch (status) {
      case 'VALID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            VALID
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            WARNING
          </span>
        );
      case 'INVALID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            INVALID
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              3D Cadastral & Topology Validation Engine
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              8 Automated Tests
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Ensures non-overlapping 3D unit volumes, structural slab continuity, and cadastral containment
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={runValidation}
          disabled={isValidating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
          {isValidating ? 'RUNNING VALIDATION...' : 'VALIDATE PROPERTY'}
        </button>
      </div>

      {/* Summary Score Banner */}
      {validationReport && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Overall Status</span>
            <div className="mt-1">
              {getStatusBadge(validationReport.overallStatus)}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              {validationReport.overallStatus === 'VALID' ? 'Fully Compliant' : 'Review Recommended'}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Passed Checks</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {validationReport.validCount} / {validationReport.checks.length}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">Strict geometric conformance</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Cadastral Warnings</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {validationReport.warningCount}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">Non-blocking overlap advisory</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Fatal Violations</span>
            <div className="text-2xl font-extrabold text-slate-400 mt-1">
              {validationReport.invalidCount}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">Zero illegal gaps or unbounds</span>
          </div>
        </div>
      )}

      {/* AI Validation Explanation Card (Highlighted prominently as requested in prompt) */}
      {validationReport && validationReport.warningCount > 0 && (
        <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-700" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  AI Validation Explanation & Survey Recommendation
                </h3>
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                  Automated Cadastral Advisory
                </span>
              </div>

              <p className="text-xs text-amber-950 leading-relaxed font-medium">
                "Unit 203 overlaps with Unit 204 by approximately 2.4 m² along X=0.6m interior partition coordinate."
              </p>
              
              <div className="bg-white/80 p-3 rounded-lg border border-amber-200 text-xs text-slate-700 space-y-1">
                <p>
                  <strong>Survey Analysis:</strong> The demarcation between candidate unit 203 and unit 204 shows a 60 cm horizontal intersection. This is typical when an architectural partition wall thickness or terrace expansion is double-counted in preliminary CAD vectorization.
                </p>
                <p className="text-blue-700 font-semibold pt-1">
                  <strong>Suggested Action:</strong> Review the floor plan or adjust the unit boundary in the cadastral survey editor before issuing candidate 3D ULPIN.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => {
                    const f2 = selectedBuilding.floors.find(f => f.floorNumber === 2);
                    if (f2) {
                      setSelectedFloor(f2);
                      const u203 = f2.units.find(u => u.unitNumber === '203');
                      if (u203) setSelectedUnit(u203);
                      setActiveTab('3d-view');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-2xs"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Inspect Floor 2 in 3D View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Validation Checks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Executed Cadastral Topology Protocols
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {selectedBuilding.name} • {selectedParcel.surveyNumber}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {validationReport?.checks.map((check) => (
            <div key={check.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-xs text-slate-900">{check.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    {check.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-normal">
                  {check.message}
                </p>
                {check.details && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 font-mono">
                    {check.details}
                  </p>
                )}
              </div>

              <div className="shrink-0 pt-0.5">
                {getStatusBadge(check.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle2, 
  Layers, 
  MapPin, 
  QrCode, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface DemoStep {
  stepNum: number;
  title: string;
  description: string;
  tab: any;
  actionSummary: string;
  highlightTag: string;
}

export const SIHDemoModal: React.FC = () => {
  const { 
    isDemoMode, 
    setIsDemoMode, 
    setActiveTab, 
    parcels, 
    setSelectedParcel, 
    setSelectedFloor, 
    setSelectedUnit,
    runValidation,
    generateUlpinForUnit
  } = useApp();

  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const demoSteps: DemoStep[] = [
    {
      stepNum: 1,
      title: "1. Select 2D Cadastral Land Parcel",
      description: "Land record official selects cadastral parcel Survey No. 48/2A (Baner, Pune, MH). Surface boundaries are verified with Survey of India CORS datum.",
      tab: 'map',
      actionSummary: "Parcel P001 selected on 2D cadastral map.",
      highlightTag: "2D Cadastral Layer"
    },
    {
      stepNum: 2,
      title: "2. Open Interactive 3D Property Building",
      description: "Extends conventional 2D surface geometry into a full 3D spatial building model (Tower A, 7 vertical levels).",
      tab: '3d-view',
      actionSummary: "Interactive 3D building loaded with ground plane.",
      highlightTag: "3D Volumetric Extrusion"
    },
    {
      stepNum: 3,
      title: "3. Show Building Floors & Stratification",
      description: "Inspects individual vertical floors from Basement Level (-3.2m) to Penthouse Terrace (+20.2m). Floor height: 3.2m, slab continuity verified.",
      tab: '3d-view',
      actionSummary: "Vertical level hierarchy displayed with elevation (Z).",
      highlightTag: "Vertical Slicing"
    },
    {
      stepNum: 4,
      title: "4. Delineate Individual Property Units",
      description: "Selects Unit 302 on Floor 3 (1,250 sq.ft residential unit at elevation +10.2m MSL). Each unit has defined 3D coordinate bounding boxes.",
      tab: '3d-view',
      actionSummary: "Unit 302 boundary highlighted in 3D scene.",
      highlightTag: "Candidate Unit Mapping"
    },
    {
      stepNum: 5,
      title: "5. Run AI / Demo Floor Segmentation",
      description: "Simulates AI/ML floor detection from drone photogrammetry and point-cloud elevation histograms. Model confidence: 96.5%.",
      tab: '3d-view',
      actionSummary: "Floor elevation profile & unit boundaries segmented.",
      highlightTag: "AI/ML Extraction"
    },
    {
      stepNum: 6,
      title: "6. Generate Proposed 3D ULPIN",
      description: "Generates deterministic prototype spatial identifier: IN-MH-PUN-P001-B01-F03-U02 and extended BhuAadhaar code MH2748002A0001/Z+10.2/B01/F03/U02.",
      tab: 'ulpin',
      actionSummary: "Proposed 3D ULPIN registered for Unit 302.",
      highlightTag: "3D ULPIN Algorithm"
    },
    {
      stepNum: 7,
      title: "7. Run Topology & Spatial Validation",
      description: "Executes 8-point geometric audit (cadastral boundary, vertical continuity, non-penetration). Highlights 2.4 m² partition warning on Floor 2.",
      tab: 'validation',
      actionSummary: "Validation engine executed: 7 Valid, 1 Warning advisory.",
      highlightTag: "Topology Audit"
    },
    {
      stepNum: 8,
      title: "8. Display 3D Property Passport",
      description: "Creates comprehensive digital property passport dossier summarizing parcel, building, floor, unit, area, elevation, and CORS geodetic reference.",
      tab: 'records',
      actionSummary: "Digital 3D Property Passport generated.",
      highlightTag: "Property Passport"
    },
    {
      stepNum: 9,
      title: "9. Generate Field Verification QR Code",
      description: "Generates tamper-evident 2D QR code encoding spatial bounds, elevation Z, and candidate 3D ULPIN for mobile field survey verification.",
      tab: 'ulpin',
      actionSummary: "Scannable QR code generated.",
      highlightTag: "QR Code Generation"
    },
    {
      stepNum: 10,
      title: "10. Export Official Cadastral Report",
      description: "Prepares official DoLR printable report dossier with all spatial dimensions, validation certificates, and spatial disclaimers.",
      tab: 'reports',
      actionSummary: "Complete verification dossier ready for export.",
      highlightTag: "Final Dossier"
    }
  ];

  // Apply state changes when step changes
  useEffect(() => {
    if (!isDemoMode) return;
    const step = demoSteps[currentStepIdx];
    setActiveTab(step.tab);

    const p1 = parcels[0];
    const b1 = p1.buildings[0];
    const f3 = b1.floors[3]; // Floor 3
    const u302 = f3.units[1]; // Unit 302

    setSelectedParcel(p1);
    setSelectedFloor(f3);
    setSelectedUnit(u302);

    if (step.stepNum === 6) {
      generateUlpinForUnit(u302);
    }
    if (step.stepNum === 7) {
      runValidation();
    }
  }, [currentStepIdx, isDemoMode]);

  // Auto-play timer (approx 6 seconds per step = ~1 minute demo)
  useEffect(() => {
    if (!isDemoMode || !isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStepIdx(prev => {
        if (prev < demoSteps.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [isDemoMode, isPlaying]);

  if (!isDemoMode) return null;

  const currentStep = demoSteps[currentStepIdx];
  const progressPercent = Math.round(((currentStepIdx + 1) / demoSteps.length) * 100);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-lg w-full bg-white rounded-2xl border-2 border-amber-400 shadow-2xl p-5 animate-in slide-in-from-bottom-5 duration-200">
      {/* Simulation Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
          <span className="font-bold text-xs uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
            SIH DEMO / SIMULATION MODE
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Step {currentStepIdx + 1} of 10
          </span>
        </div>

        <button
          onClick={() => setIsDemoMode(false)}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          title="Exit SIH Demo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3">
        <div
          className="bg-amber-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900">{currentStep.title}</h4>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {currentStep.highlightTag}
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {currentStep.description}
        </p>
        <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-medium">
          ✓ {currentStep.actionSummary}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isPlaying ? 'Pause Demo' : 'Auto Play'}
          </button>
          <button
            onClick={() => {
              setCurrentStepIdx(0);
              setIsPlaying(true);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700"
            title="Restart Demo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentStepIdx === 0}
            onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>

          <button
            onClick={() => {
              if (currentStepIdx < demoSteps.length - 1) {
                setCurrentStepIdx(prev => prev + 1);
              } else {
                setIsDemoMode(false);
              }
            }}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors"
          >
            {currentStepIdx < demoSteps.length - 1 ? 'Next Step' : 'Finish Demo'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

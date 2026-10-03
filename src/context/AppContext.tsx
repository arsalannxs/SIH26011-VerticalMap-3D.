import React, { createContext, useContext, useState, useEffect } from 'react';
import { Parcel, Building, Floor, PropertyUnit, ProposedUlpin3D, TopologyValidationReport, AppDashboardStats } from '../types';
import { DEMO_PARCELS, DEMO_VALIDATION_REPORTS } from '../data/mockData';
import { generateProposed3DUlpin } from '../../server/services/ulpinGenerator';

export type NavTab = 'dashboard' | 'map' | '3d-view' | 'ulpin' | 'validation' | 'records' | 'reports' | 'settings';

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  parcels: Parcel[];
  selectedParcel: Parcel;
  setSelectedParcel: (p: Parcel) => void;
  selectedBuilding: Building;
  setSelectedBuilding: (b: Building) => void;
  selectedFloor: Floor;
  setSelectedFloor: (f: Floor) => void;
  selectedUnit: PropertyUnit | null;
  setSelectedUnit: (u: PropertyUnit | null) => void;
  proposedUlpins: Record<string, ProposedUlpin3D>;
  generateUlpinForUnit: (unit: PropertyUnit) => ProposedUlpin3D;
  validationReport: TopologyValidationReport | null;
  runValidation: () => Promise<void>;
  isValidating: boolean;
  stats: AppDashboardStats;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  isAiAssistantOpen: boolean;
  setIsAiAssistantOpen: (val: boolean) => void;
  isExtractModalOpen: boolean;
  setIsExtractModalOpen: (val: boolean) => void;
  isPointCloudModalOpen: boolean;
  setIsPointCloudModalOpen: (val: boolean) => void;
  triggerAIBuildingExtraction: () => Promise<void>;
  resetToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [parcels, setParcels] = useState<Parcel[]>(DEMO_PARCELS);
  const [selectedParcel, setSelectedParcel] = useState<Parcel>(DEMO_PARCELS[0]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building>(DEMO_PARCELS[0].buildings[0]);
  const [selectedFloor, setSelectedFloor] = useState<Floor>(DEMO_PARCELS[0].buildings[0].floors[3]); // Floor 3 default
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(DEMO_PARCELS[0].buildings[0].floors[3].units[1]); // Unit 302 default
  
  const [proposedUlpins, setProposedUlpins] = useState<Record<string, ProposedUlpin3D>>({});
  const [validationReport, setValidationReport] = useState<TopologyValidationReport | null>(DEMO_VALIDATION_REPORTS['P001-B01']);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [isExtractModalOpen, setIsExtractModalOpen] = useState<boolean>(false);
  const [isPointCloudModalOpen, setIsPointCloudModalOpen] = useState<boolean>(false);

  // Initialize pre-generated ULPINs
  useEffect(() => {
    const initialMap: Record<string, ProposedUlpin3D> = {};
    for (const p of DEMO_PARCELS) {
      for (const b of p.buildings) {
        for (const f of b.floors) {
          for (const u of f.units) {
            const prop = generateProposed3DUlpin(p, b, f, u);
            initialMap[u.id] = prop;
          }
        }
      }
    }
    setProposedUlpins(initialMap);
  }, []);

  // Compute stats
  let totalProperties = 0;
  let totalFloors = 0;
  let totalUlpins = 0;
  for (const p of parcels) {
    for (const b of p.buildings) {
      totalFloors += b.floors.length;
      for (const f of b.floors) {
        totalProperties += f.units.length;
        totalUlpins += f.units.filter(u => u.ulpinStatus === 'Validated' || u.ulpinStatus === 'Generated').length;
      }
    }
  }

  const stats: AppDashboardStats = {
    parcelsMapped: parcels.length,
    properties3D: totalProperties,
    floorsDetected: totalFloors,
    ulpinsGenerated: totalUlpins,
    validationPassRate: 98.4
  };

  const generateUlpinForUnit = (unit: PropertyUnit): ProposedUlpin3D => {
    const generated = generateProposed3DUlpin(selectedParcel, selectedBuilding, selectedFloor, unit);
    setProposedUlpins(prev => ({
      ...prev,
      [unit.id]: generated
    }));
    return generated;
  };

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const res = await fetch('/api/validation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parcelId: selectedParcel.id, buildingId: selectedBuilding.id })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setValidationReport(data.data);
      } else {
        setValidationReport(DEMO_VALIDATION_REPORTS['P001-B01']);
      }
    } catch {
      setValidationReport(DEMO_VALIDATION_REPORTS['P001-B01']);
    } finally {
      setTimeout(() => setIsValidating(false), 500);
    }
  };

  const triggerAIBuildingExtraction = async () => {
    try {
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parcelId: 'P003', inputType: 'Drone Photogrammetry & DSM' })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setParcels(prev => prev.map(p => {
          if (p.id === 'P003' && p.buildings.length === 0) {
            return {
              ...p,
              mappingStatus: '3D Extracted',
              buildings: [data.data]
            };
          }
          return p;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetToDefault = () => {
    setParcels(JSON.parse(JSON.stringify(DEMO_PARCELS)));
    setSelectedParcel(DEMO_PARCELS[0]);
    setSelectedBuilding(DEMO_PARCELS[0].buildings[0]);
    setSelectedFloor(DEMO_PARCELS[0].buildings[0].floors[3]);
    setSelectedUnit(DEMO_PARCELS[0].buildings[0].floors[3].units[1]);
    setValidationReport(DEMO_VALIDATION_REPORTS['P001-B01']);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        parcels,
        selectedParcel,
        setSelectedParcel,
        selectedBuilding,
        setSelectedBuilding,
        selectedFloor,
        setSelectedFloor,
        selectedUnit,
        setSelectedUnit,
        proposedUlpins,
        generateUlpinForUnit,
        validationReport,
        runValidation,
        isValidating,
        stats,
        isDemoMode,
        setIsDemoMode,
        isAiAssistantOpen,
        setIsAiAssistantOpen,
        isExtractModalOpen,
        setIsExtractModalOpen,
        isPointCloudModalOpen,
        setIsPointCloudModalOpen,
        triggerAIBuildingExtraction,
        resetToDefault
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

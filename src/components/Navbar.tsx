import React from 'react';
import { useApp, NavTab } from '../context/AppContext';
import { 
  Building2, 
  Map, 
  Layers, 
  QrCode, 
  ShieldCheck, 
  FileText, 
  FileSpreadsheet, 
  Settings, 
  Play, 
  Sparkles,
  ChevronRight,
  Boxes
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsDemoMode, 
    setIsAiAssistantOpen,
    selectedParcel,
    selectedBuilding
  } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Boxes className="w-4 h-4" /> },
    { id: 'map', label: 'Property Map', icon: <Map className="w-4 h-4" /> },
    { id: '3d-view', label: '3D View', icon: <Layers className="w-4 h-4" /> },
    { id: 'ulpin', label: 'ULPIN Generator', icon: <QrCode className="w-4 h-4" /> },
    { id: 'validation', label: 'Validation', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'records', label: 'Property Records', icon: <FileText className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Government & SIH Info Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-900 text-blue-200 border border-blue-700">
            SIH 2026: SIH26011
          </span>
          <span className="text-slate-400">|</span>
          <span className="font-medium text-slate-200">Department of Land Resources (DoLR)</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Ministry of Rural Development, Govt. of India</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            PROTOTYPE DECISION-SUPPORT SYSTEM
          </span>
          <span className="text-slate-400 text-[11px]">
            Active: <strong className="text-white">{selectedParcel.id}</strong> ({selectedBuilding.name})
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">VerticalMap 3D</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  DoLR v2.6
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">From 2D Land Parcels to 3D Property Intelligence</p>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex items-center gap-2.5">
            {/* Primary Action Button requested by prompt */}
            <button
              onClick={() => setActiveTab('3d-view')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              <Layers className="w-4 h-4" />
              GENERATE 3D PROPERTY
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Run SIH Demo Button */}
            <button
              onClick={() => setIsDemoMode(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 shadow-xs transition-colors"
              title="Launch 10-step SIH26011 automated walkthrough"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              RUN SIH DEMO
            </button>

            {/* VerticalMap Assistant Trigger */}
            <button
              onClick={() => setIsAiAssistantOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Assistant
            </button>
          </div>
        </div>

        {/* Minimal Navigation Bar (Only 8 Items) */}
        <nav className="flex space-x-1 border-t border-slate-100 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

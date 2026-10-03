import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { PropertyMap } from './components/PropertyMap';
import { ThreeDPropertyViewer } from './components/ThreeDPropertyViewer';
import { UlpinGenerator } from './components/UlpinGenerator';
import { TopologyValidation } from './components/TopologyValidation';
import { PropertyRecords } from './components/PropertyRecords';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { SIHDemoModal } from './components/SIHDemoModal';
import { PointCloudViewer } from './components/PointCloudViewer';
import { AIExtractionModal } from './components/AIExtractionModal';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'map' && <PropertyMap />}
      {activeTab === '3d-view' && <ThreeDPropertyViewer />}
      {activeTab === 'ulpin' && <UlpinGenerator />}
      {activeTab === 'validation' && <TopologyValidation />}
      {activeTab === 'records' && <PropertyRecords />}
      {activeTab === 'reports' && <ReportsView />}
      {activeTab === 'settings' && <SettingsView />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>

        {/* Global Modals & Drawers */}
        <AIAssistantDrawer />
        <SIHDemoModal />
        <PointCloudViewer />
        <AIExtractionModal />

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-12 py-6 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">
                VerticalMap 3D • Smart India Hackathon 2026 (SIH26011)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Department of Land Resources (DoLR), Ministry of Rural Development, Government of India • Theme: Space Technology
              </p>
            </div>
            <div className="text-right sm:text-right">
              <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                Decision-Support Prototype • Not an official land title record
              </span>
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}

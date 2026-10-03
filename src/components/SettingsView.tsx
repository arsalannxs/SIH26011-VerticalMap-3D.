import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, RotateCcw, Shield, Database, Save, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { resetToDefault } = useApp();
  const [saved, setSaved] = useState<boolean>(false);
  const [resetDone, setResetDone] = useState<boolean>(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = async () => {
    try {
      await fetch('/api/reset-demo', { method: 'POST' });
    } catch {}
    resetToDefault();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-blue-600" />
          System & Spatial Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure 3D ULPIN vertical spatial formatting, geodetic datums, and demo datasets
        </p>
      </div>

      {/* Settings Sections */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6 text-xs text-slate-700">
        {/* Section 1: ULPIN Format Structure */}
        <div>
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs pb-2 border-b border-slate-200 mb-3">
            3D ULPIN Format Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Country Prefix</label>
              <input
                type="text"
                defaultValue="IN"
                disabled
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-500"
              />
              <span className="text-[10px] text-slate-400">ISO 3166-1 alpha-2 standard</span>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Vertical Delimiter</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-800">
                <option value="-">Hyphen (-)</option>
                <option value="/">Forward Slash (/)</option>
                <option value=".">Period (.)</option>
              </select>
              <span className="text-[10px] text-slate-400">e.g. IN-MH-PUN-P001-B01-F03-U02</span>
            </div>
          </div>
        </div>

        {/* Section 2: Spatial Reference System */}
        <div>
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs pb-2 border-b border-slate-200 mb-3">
            Geodetic Datum & Coordinate System
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Horizontal Datum</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800">
                <option value="WGS84">WGS 84 / UTM Zone 43N (EPSG:32643)</option>
                <option value="Everest1956">Everest 1956 / India Zone II</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Vertical Datum (Z Axis)</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800">
                <option value="EGM08">EGM2008 Geoid (Mean Sea Level MSL)</option>
                <option value="RelativeGround">Relative Finished Floor Height (AGL)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Reset Demo Data */}
        <div>
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs pb-2 border-b border-slate-200 mb-3 flex items-center gap-1.5 text-rose-700">
            <RotateCcw className="w-4 h-4" />
            Reset Demo Cadastral Data
          </h3>
          <p className="text-slate-500 mb-3">
            Reverts all parcels, vertical property units, 3D ULPIN candidates, and topology validation reports back to initial SIH26011 baseline data.
          </p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
          >
            {resetDone ? <Check className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
            {resetDone ? 'Demo Baseline Restored!' : 'Reset All Demo Data'}
          </button>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? 'Settings Saved' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

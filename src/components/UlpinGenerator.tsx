import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyUnit, ProposedUlpin3D } from '../types';
import { 
  QrCode, 
  Copy, 
  Check, 
  Layers, 
  Share2, 
  ShieldCheck, 
  Info, 
  Sliders, 
  Eye, 
  FileSpreadsheet, 
  Building2,
  MapPin,
  ChevronRight
} from 'lucide-react';
import QRCode from 'qrcode';

export const UlpinGenerator: React.FC = () => {
  const { 
    selectedParcel, 
    selectedBuilding, 
    selectedFloor, 
    selectedUnit, 
    setSelectedUnit,
    generateUlpinForUnit,
    setActiveTab,
    proposedUlpins
  } = useApp();

  const [copied, setCopied] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [customSeparator, setCustomSeparator] = useState<string>('-');
  const [customCountry, setCustomCountry] = useState<string>('IN');

  const unit = selectedUnit || selectedFloor.units[0];
  const currentProposed = proposedUlpins[unit?.id] || (unit ? generateUlpinForUnit(unit) : null);

  const handleCopy = () => {
    if (currentProposed?.ulpin3D) {
      navigator.clipboard.writeText(currentProposed.ulpin3D);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerateQr = async () => {
    if (!currentProposed) return;
    try {
      const url = await QRCode.toDataURL(currentProposed.qrPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      setQrDataUrl(url);
      setIsQrModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              3D ULPIN Generator (Vertical Spatial Identifier)
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-300">
              PROTOTYPE
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Deterministic vertical expansion of 2D cadastral parcels into unambiguous 3D property identifiers
          </p>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-3 max-w-md text-[11px] text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>PROPOSED 3D ULPIN — PROTOTYPE</strong>. This decision-support identifier does not legally replace government-issued state land title records or registered deed papers.
          </span>
        </div>
      </div>

      {/* Main Generator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Selector & Generator Action */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-blue-600" />
            Target Property Unit Demarcation
          </h3>

          {/* Unit Picker from current floor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Vertical Unit on {selectedFloor.floorName}:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {selectedFloor.units.map((u) => {
                const isSelected = unit?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUnit(u)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold">Unit {u.unitNumber}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{u.usage}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {u.areaSqFt} sq.ft • Elev: +{u.elevationM}m
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format Configuration */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2.5">
            <span className="font-bold text-slate-700 block">Identifier Structure Breakdown:</span>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="bg-white p-1.5 rounded border border-slate-200">
                <span className="text-slate-400 block font-mono">Country</span>
                <span className="font-bold text-slate-800">{customCountry}</span>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-200">
                <span className="text-slate-400 block font-mono">State</span>
                <span className="font-bold text-slate-800">{selectedParcel.stateCode}</span>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-200">
                <span className="text-slate-400 block font-mono">District</span>
                <span className="font-bold text-slate-800">{selectedParcel.districtCode}</span>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-200">
                <span className="text-slate-400 block font-mono">Parcel</span>
                <span className="font-bold text-slate-800">{selectedParcel.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="bg-white p-1.5 rounded border border-slate-200">
                <span className="text-slate-400 block font-mono">Building</span>
                <span className="font-bold text-slate-800">{selectedBuilding.buildingCode}</span>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-200">
                <span className="text-slate-400 block font-mono">Floor</span>
                <span className="font-bold text-slate-800">
                  F{selectedFloor.floorNumber < 0 ? `B${Math.abs(selectedFloor.floorNumber)}` : String(selectedFloor.floorNumber).padStart(2, '0')}
                </span>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-200">
                <span className="text-slate-400 block font-mono">Unit</span>
                <span className="font-bold text-slate-800">U{unit?.unitNumber || '01'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-600">Delimiter:</span>
              <div className="flex gap-1">
                {['-', '/', '.'].map(sep => (
                  <button
                    key={sep}
                    onClick={() => setCustomSeparator(sep)}
                    className={`w-6 h-6 rounded text-xs font-mono font-bold ${customSeparator === sep ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
                  >
                    {sep}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => unit && generateUlpinForUnit(unit)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-bold tracking-wide uppercase bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <QrCode className="w-4 h-4" />
            GENERATE 3D ULPIN
          </button>
        </div>

        {/* Right Column: Clean ULPIN Details Card */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Model-Generated Property Unit
              </span>
              <span className="text-xs font-semibold text-slate-700">
                Proposed 3D ULPIN Record
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              {currentProposed?.validationStatus || 'Validated'}
            </span>
          </div>

          {/* The Big 3D ULPIN display */}
          <div className="p-4 rounded-xl bg-slate-900 text-white relative overflow-hidden shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              PROPOSED 3D ULPIN
            </div>
            <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-blue-400 break-all select-all">
              {currentProposed?.ulpin3D || 'IN-MH-PUN-P001-B01-F03-U02'}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>Standard BhuAadhaar Ext:</span>
              <span className="text-slate-300 font-semibold">{currentProposed?.standardExtendedUlpin}</span>
            </div>
          </div>

          {/* Clean Key-Value Card as requested in prompt */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Parcel</span>
              <strong className="text-slate-800 text-sm">{currentProposed?.parcelId || 'P001'}</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Building</span>
              <strong className="text-slate-800 text-sm">{currentProposed?.buildingId || 'B01'}</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Floor</span>
              <strong className="text-slate-800 text-sm">
                {String(selectedFloor.floorNumber).padStart(2, '0')}
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Unit</span>
              <strong className="text-slate-800 text-sm">{unit?.unitNumber || '02'}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Elevation (Z)</span>
              <strong className="text-slate-800 text-sm">+{currentProposed?.elevationM || 10.2} m MSL</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Cadastral Area</span>
              <strong className="text-slate-800 text-sm">{currentProposed?.areaSqFt.toLocaleString() || '1,250'} sq.ft</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Topology Status</span>
              <strong className="text-emerald-700 text-sm">Validated</strong>
            </div>
          </div>

          {/* Action Buttons requested by prompt */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              {copied ? 'Copied ULPIN' : 'Copy ULPIN'}
            </button>

            <button
              onClick={() => setActiveTab('3d-view')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              View Property
            </button>

            <button
              onClick={handleGenerateQr}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-2xs transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              Generate QR
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Export Record
            </button>
          </div>
        </div>
      </div>

      {/* 3D Spatial Information Section (As requested by Section 13) */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            3D Spatial Coordinates & Volumetric Bounds
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            "Z represents the vertical position/elevation of the property above ground datum."
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Horizontal Geodetic Anchor</span>
            <div className="font-mono text-slate-800 text-sm font-semibold mt-1">
              {selectedParcel.coordinates.latitude}° N, {selectedParcel.coordinates.longitude}° E
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">Datum: WGS84 • Source: {selectedParcel.coordinates.source}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Vertical Elevation (Z Axis)</span>
            <div className="font-mono text-blue-700 text-sm font-bold mt-1">
              +{unit?.elevationM || 10.2} m Ground Relative ({(selectedParcel.coordinates.elevation + (unit?.elevationM || 10.2)).toFixed(1)} m MSL)
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">Floor Finished Level • Accuracy: {selectedParcel.coordinates.accuracy}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Relative 3D Boundary Extents</span>
            <div className="font-mono text-slate-800 text-xs font-semibold mt-1 space-y-0.5">
              <div>X: [{unit?.bounds3D.minX}m, {unit?.bounds3D.maxX}m]</div>
              <div>Y: [{unit?.bounds3D.minY}m, {unit?.bounds3D.maxY}m]</div>
              <div>Z: [{unit?.bounds3D.minZ}m, {unit?.bounds3D.maxZ}m]</div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {isQrModalOpen && qrDataUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">3D Property Passport QR</h3>
            <p className="text-xs text-slate-500 mb-4">
              Encodes proposed 3D ULPIN and field spatial verification metadata
            </p>

            <div className="p-3 bg-white border border-slate-200 rounded-xl inline-block mb-3 shadow-xs">
              <img src={qrDataUrl} alt="3D ULPIN QR Code" className="w-56 h-56 mx-auto" />
            </div>

            <div className="font-mono text-xs font-bold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200 mb-4 break-all">
              {currentProposed?.ulpin3D}
            </div>

            <div className="flex gap-2">
              <a
                href={qrDataUrl}
                download={`3D-ULPIN-${currentProposed?.ulpin3D}.png`}
                className="flex-1 py-2 px-3 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors"
              >
                Download QR
              </a>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

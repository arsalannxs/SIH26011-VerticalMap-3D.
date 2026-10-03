import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PropertyUnit } from '../types';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  QrCode, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  Layers,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { PropertyPassport } from './PropertyPassport';

export const PropertyRecords: React.FC = () => {
  const { 
    parcels, 
    selectedParcel, 
    setSelectedParcel, 
    setSelectedFloor, 
    setSelectedUnit, 
    setActiveTab 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [usageFilter, setUsageFilter] = useState<string>('all');
  const [passportUnit, setPassportUnit] = useState<PropertyUnit | null>(null);

  // Flatten all property units in selected parcel
  const allUnits: { unit: PropertyUnit; buildingName: string; floorName: string }[] = [];
  selectedParcel.buildings.forEach(b => {
    b.floors.forEach(f => {
      f.units.forEach(u => {
        allUnits.push({ unit: u, buildingName: b.name, floorName: f.floorName });
      });
    });
  });

  const filtered = allUnits.filter(({ unit }) => {
    const matchesSearch = 
      unit.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (unit.candidateUlpin && unit.candidateUlpin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (unit.ownerName && unit.ownerName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFloor = floorFilter === 'all' || String(unit.floorNumber) === floorFilter;
    const matchesUsage = usageFilter === 'all' || unit.usage === usageFilter;

    return matchesSearch && matchesFloor && matchesUsage;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Cadastral Property Records (Vertical Parcels)
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {filtered.length} Units Listed
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Digital 3D land title register for {selectedParcel.surveyNumber} • {selectedParcel.village}, {selectedParcel.district}
          </p>
        </div>

        <button
          onClick={() => {
            const csvContent = "data:text/csv;charset=utf-8," 
              + ["Unit ID,Unit No,Floor,Usage,Area SqFt,Elevation (m),Proposed 3D ULPIN,Status"]
              .concat(filtered.map(({ unit, floorName }) => 
                `"${unit.id}","${unit.unitNumber}","${floorName}","${unit.usage}",${unit.areaSqFt},${unit.elevationM},"${unit.candidateUlpin || ''}","${unit.topologyStatus}"`
              )).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Cadastral_Records_${selectedParcel.id}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          Export CSV Registry
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Unit No, 3D ULPIN, or Owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Floor Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Floor:</span>
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="-1">Basement (-1)</option>
            <option value="0">Ground (0)</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
            <option value="4">Floor 4</option>
            <option value="5">Floor 5</option>
          </select>
        </div>

        {/* Usage Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Usage:</span>
          <select
            value={usageFilter}
            onChange={(e) => setUsageFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Parking">Parking</option>
            <option value="Common Area">Common Area</option>
            <option value="Utility">Utility</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Unit Identification</th>
                <th className="py-3 px-4">Building & Level</th>
                <th className="py-3 px-4">Cadastral Area</th>
                <th className="py-3 px-4">Elevation (Z)</th>
                <th className="py-3 px-4">Proposed 3D ULPIN</th>
                <th className="py-3 px-4">Validation Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(({ unit, buildingName, floorName }) => (
                <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm">Unit {unit.unitNumber}</div>
                    <div className="text-[11px] text-slate-500">{unit.ownerName || 'Identified Demarcation'}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">{floorName}</div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {unit.usage}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div>{unit.areaSqFt.toLocaleString()} sq.ft</div>
                    <div className="text-[10px] text-slate-400 font-normal">{unit.areaSqM} m²</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                    +{unit.elevationM} m MSL
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] font-semibold text-slate-800 block">
                      {unit.candidateUlpin || 'Pending'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Parcel: {unit.parcelId} • Bldg: {unit.buildingId}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {unit.topologyStatus === 'Valid' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Warning
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPassportUnit(unit)}
                        className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Open 3D Property Passport"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Passport
                      </button>

                      <button
                        onClick={() => {
                          const targetFloor = selectedParcel.buildings[0].floors.find(f => f.id === unit.floorId);
                          if (targetFloor) setSelectedFloor(targetFloor);
                          setSelectedUnit(unit);
                          setActiveTab('3d-view');
                        }}
                        className="px-2.5 py-1.5 rounded bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Inspect in 3D View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        3D
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Passport Modal when clicked from table */}
      {passportUnit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <PropertyPassport unitOverride={passportUnit} onClose={() => setPassportUnit(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

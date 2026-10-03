import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useApp } from '../context/AppContext';
import { PropertyUnit, Floor } from '../types';
import { 
  Maximize2, 
  RotateCcw, 
  Layers, 
  Eye, 
  Sliders, 
  CheckCircle2, 
  Info,
  MapPin,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const ThreeDPropertyViewer: React.FC = () => {
  const { 
    selectedParcel, 
    selectedBuilding, 
    selectedFloor, 
    setSelectedFloor, 
    selectedUnit, 
    setSelectedUnit,
    setActiveTab
  } = useApp();

  const mountRef = useRef<HTMLDivElement>(null);
  const [explodeGap, setExplodeGap] = useState<number>(0);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [showParcelPlane, setShowParcelPlane] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<'isometric' | 'top' | 'front' | 'basement'>('isometric');

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const floorGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const unitMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // Mouse orbit state
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 45 });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 8, 0));

  // Usage Colors
  const getUsageColor = (usage: string, isSelected: boolean) => {
    if (isSelected) return 0x2563eb; // Royal blue highlight
    switch (usage) {
      case 'Commercial': return 0xf59e0b; // Amber
      case 'Office': return 0x0284c7; // Sky blue
      case 'Parking': return 0x64748b; // Slate gray
      case 'Common Area': return 0x8b5cf6; // Purple
      case 'Utility': return 0x0d9488; // Teal
      case 'Residential':
      default: return 0x3b82f6; // Blue
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf8fafc); // Light clean gray slate-50

    // Subtle atmospheric fog for spatial depth
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.012);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(30, 50, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    const d = 35;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0xe2e8f0, 0x94a3b8, 0.4);
    scene.add(hemiLight);

    // Ground Grid & Cadastral Parcel Polygon
    const grid = new THREE.GridHelper(80, 40, 0x94a3b8, 0xe2e8f0);
    grid.position.y = -0.05;
    scene.add(grid);

    // Update Camera position based on angles
    const updateCamera = () => {
      const { theta, phi, radius } = cameraAngleRef.current;
      const target = targetLookAtRef.current;
      camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = target.y + radius * Math.cos(phi);
      camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(target);
    };
    updateCamera();

    // Mouse Controls
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDraggingRef.current = true;
      if (e.button === 2) isRightDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      if (isDraggingRef.current) {
        cameraAngleRef.current.theta -= deltaX * 0.008;
        cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, cameraAngleRef.current.phi - deltaY * 0.008));
        updateCamera();
      } else if (isRightDraggingRef.current) {
        // Pan
        targetLookAtRef.current.x -= deltaX * 0.05;
        targetLookAtRef.current.z -= deltaY * 0.05;
        updateCamera();
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      isRightDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraAngleRef.current.radius = Math.max(10, Math.min(90, cameraAngleRef.current.radius + e.deltaY * 0.05));
      updateCamera();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    // Click Raycasting for Floor/Unit selection
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = dom.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const meshes: THREE.Mesh[] = Array.from(unitMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const unitData = hitMesh.userData.unit as PropertyUnit;
        const floorData = hitMesh.userData.floor as Floor;
        if (unitData && floorData) {
          setSelectedFloor(floorData);
          setSelectedUnit(unitData);
        }
      }
    };
    dom.addEventListener('click', handleClick);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Preset Camera Views
  useEffect(() => {
    if (!cameraRef.current) return;
    if (cameraPreset === 'isometric') {
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3.2, radius: 45 };
      targetLookAtRef.current.set(0, 8, 0);
    } else if (cameraPreset === 'top') {
      cameraAngleRef.current = { theta: 0, phi: 0.15, radius: 42 };
      targetLookAtRef.current.set(0, 6, 0);
    } else if (cameraPreset === 'front') {
      cameraAngleRef.current = { theta: 0, phi: Math.PI / 2.3, radius: 48 };
      targetLookAtRef.current.set(0, 10, 0);
    } else if (cameraPreset === 'basement') {
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 2.1, radius: 36 };
      targetLookAtRef.current.set(0, -1, 0);
    }

    const { theta, phi, radius } = cameraAngleRef.current;
    const target = targetLookAtRef.current;
    cameraRef.current.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = target.y + radius * Math.cos(phi);
    cameraRef.current.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(target);
  }, [cameraPreset]);

  // Build / Rebuild 3D Meshes for Selected Building, Floors & Units
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old building elements
    floorGroupsRef.current.forEach(g => scene.remove(g));
    floorGroupsRef.current.clear();
    unitMeshesRef.current.clear();

    // 1. Cadastral Parcel Polygon Boundary (Ground)
    const parcelGroup = new THREE.Group();
    parcelGroup.name = 'parcelGroup';

    // Remove any existing parcelGroup
    const existing = scene.getObjectByName('parcelGroup');
    if (existing) scene.remove(existing);

    if (showParcelPlane) {
      // 2D parcel outline (representing Survey No. 48/2A)
      const parcelShape = new THREE.Shape();
      parcelShape.moveTo(-28, -26);
      parcelShape.lineTo(26, -26);
      parcelShape.lineTo(24, 26);
      parcelShape.lineTo(-26, 24);
      parcelShape.closePath();

      const parcelGeo = new THREE.ShapeGeometry(parcelShape);
      const parcelMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide
      });
      const parcelMesh = new THREE.Mesh(parcelGeo, parcelMat);
      parcelMesh.rotation.x = -Math.PI / 2;
      parcelMesh.position.y = -0.02;
      parcelMesh.receiveShadow = true;
      parcelGroup.add(parcelMesh);

      // Cadastral boundary line (blue-slate dashed line)
      const points = [
        new THREE.Vector3(-28, 0.05, -26),
        new THREE.Vector3(26, 0.05, -26),
        new THREE.Vector3(24, 0.05, 26),
        new THREE.Vector3(-26, 0.05, 24),
        new THREE.Vector3(-28, 0.05, -26)
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x2563eb, linewidth: 2 });
      const borderLine = new THREE.Line(lineGeo, lineMat);
      parcelGroup.add(borderLine);
    }
    scene.add(parcelGroup);

    // 2. Iterate through each floor in selected building
    const sortedFloors = [...selectedBuilding.floors].sort((a, b) => a.elevationBaseM - b.elevationBaseM);

    sortedFloors.forEach((floor, idx) => {
      const floorGroup = new THREE.Group();
      floorGroup.name = `floor-${floor.id}`;

      // Vertical position with explosion offset
      const floorOffset = idx * explodeGap * 2.5;
      const baseElevation = floor.elevationBaseM + floorOffset;

      const isCurrentFloor = selectedFloor.id === floor.id;

      // Slab Floor Plate (thin concrete slab)
      const fp = selectedBuilding.footprintPolygon;
      const slabShape = new THREE.Shape();
      slabShape.moveTo(fp[0][0], fp[0][1]);
      for (let i = 1; i < fp.length; i++) {
        slabShape.lineTo(fp[i][0], fp[i][1]);
      }
      slabShape.closePath();

      const slabGeo = new THREE.BoxGeometry(
        Math.abs(fp[1][0] - fp[0][0]) + 0.4,
        0.2,
        Math.abs(fp[2][1] - fp[1][1]) + 0.4
      );
      const slabMat = new THREE.MeshStandardMaterial({
        color: floor.floorNumber < 0 ? 0x94a3b8 : (isCurrentFloor ? 0x60a5fa : 0xcfd8dc),
        roughness: 0.6,
        wireframe: wireframeMode
      });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.set(1, baseElevation, 1);
      slabMesh.receiveShadow = true;
      floorGroup.add(slabMesh);

      // Individual Property Units on this floor
      floor.units.forEach((unit) => {
        const b = unit.bounds3D;
        const width = Math.max(0.5, b.maxX - b.minX);
        const depth = Math.max(0.5, b.maxY - b.minY);
        const height = Math.max(0.5, b.height);

        const centerX = (b.minX + b.maxX) / 2;
        const centerY = baseElevation + height / 2;
        const centerZ = (b.minY + b.maxY) / 2;

        const isUnitSelected = selectedUnit?.id === unit.id;
        const unitGeo = new THREE.BoxGeometry(width - 0.25, height - 0.25, depth - 0.25);
        
        const unitMat = new THREE.MeshStandardMaterial({
          color: getUsageColor(unit.usage, isUnitSelected),
          roughness: 0.35,
          metalness: 0.15,
          transparent: true,
          opacity: isUnitSelected ? 0.95 : (isCurrentFloor ? 0.8 : 0.6),
          wireframe: wireframeMode
        });

        const unitMesh = new THREE.Mesh(unitGeo, unitMat);
        unitMesh.position.set(centerX, centerY, centerZ);
        unitMesh.castShadow = true;
        unitMesh.receiveShadow = true;
        unitMesh.userData = { unit, floor };

        // Wireframe edges on selected unit
        if (isUnitSelected) {
          const edges = new THREE.EdgesGeometry(unitGeo);
          const edgeLine = new THREE.LineSegments(
            edges, 
            new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
          );
          unitMesh.add(edgeLine);
        }

        unitMeshesRef.current.set(unit.id, unitMesh);
        floorGroup.add(unitMesh);
      });

      floorGroupsRef.current.set(floor.id, floorGroup);
      scene.add(floorGroup);
    });

  }, [selectedBuilding, selectedFloor, selectedUnit, explodeGap, wireframeMode, showParcelPlane]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[640px] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* 3D Viewer Toolbar */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            3D Building & Vertical Parcel Model
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
            {selectedBuilding.name}
          </span>
          <span className="text-xs text-slate-500">
            (DEM Ground: {selectedBuilding.demGroundElevationM}m | DSM Height: {selectedBuilding.heightM}m)
          </span>
        </div>

        {/* View Controls & Explosion Slider */}
        <div className="flex items-center gap-3">
          {/* Explode Floors Slider */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-medium">Vertical Stack / Explode:</span>
            <input
              type="range"
              min="0"
              max="2.5"
              step="0.1"
              value={explodeGap}
              onChange={(e) => setExplodeGap(parseFloat(e.target.value))}
              className="w-24 accent-blue-600 cursor-pointer"
            />
            <span className="text-slate-800 font-bold w-7 text-right">
              {explodeGap > 0 ? `${explodeGap.toFixed(1)}x` : '0x'}
            </span>
          </div>

          {/* Camera View Presets */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 text-xs">
            <button
              onClick={() => setCameraPreset('isometric')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${cameraPreset === 'isometric' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Isometric
            </button>
            <button
              onClick={() => setCameraPreset('top')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${cameraPreset === 'top' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Top Plan
            </button>
            <button
              onClick={() => setCameraPreset('front')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${cameraPreset === 'front' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Elevation
            </button>
            <button
              onClick={() => setCameraPreset('basement')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${cameraPreset === 'basement' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Basement Focus
            </button>
          </div>

          {/* Toggles */}
          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${wireframeMode ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            title="Toggle Wireframe Mode"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowParcelPlane(!showParcelPlane)}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${showParcelPlane ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            title="Toggle Cadastral Ground Plane"
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas with Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Three.js Canvas */}
        <div ref={mountRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing bg-slate-50 relative">
          {/* Floating Instructions Pill */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 text-xs shadow-xs pointer-events-none flex items-center gap-2">
            <span className="font-semibold text-slate-800">Rotate:</span> Left Drag
            <span className="text-slate-300">•</span>
            <span className="font-semibold text-slate-800">Pan:</span> Right Drag
            <span className="text-slate-300">•</span>
            <span className="font-semibold text-slate-800">Zoom:</span> Scroll
            <span className="text-slate-300">•</span>
            <span className="text-blue-600 font-semibold">Click any unit to select</span>
          </div>

          {/* Color Legend */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 shadow-xs text-xs flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-700">Usage:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
              <span className="text-slate-600">Residential</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
              <span className="text-slate-600">Commercial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-500"></span>
              <span className="text-slate-600">Parking / Basement</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-purple-500"></span>
              <span className="text-slate-600">Common Area</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-teal-500"></span>
              <span className="text-slate-600">Utility</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Floor & Unit Inspector */}
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col overflow-y-auto">
          {/* Active Level Selector */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Vertical Levels</h4>
            <div className="space-y-1">
              {[...selectedBuilding.floors].reverse().map((floor) => {
                const isSelected = selectedFloor.id === floor.id;
                return (
                  <button
                    key={floor.id}
                    onClick={() => {
                      setSelectedFloor(floor);
                      setSelectedUnit(floor.units[0] || null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isSelected 
                        ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                        : 'text-slate-700 hover:bg-slate-100 bg-white border border-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${floor.floorNumber < 0 ? 'bg-slate-400' : 'bg-emerald-400'}`}></span>
                      {floor.floorName}
                    </span>
                    <span className={`text-[11px] font-mono ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      Z: {floor.elevationBaseM >= 0 ? `+${floor.elevationBaseM.toFixed(1)}m` : `${floor.elevationBaseM.toFixed(1)}m`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Floor Specs */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Floor Details</h4>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Confidence: {Math.round((selectedFloor.detectionConfidence || 0.98) * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Floor Height</span>
                <span className="font-bold text-slate-800 text-sm">{selectedFloor.heightM} m</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Floor Area</span>
                <span className="font-bold text-slate-800 text-sm">{selectedFloor.areaSqFt.toLocaleString()} sq.ft</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Units Identified</span>
                <span className="font-bold text-slate-800 text-sm">{selectedFloor.unitCount} Units</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Primary Usage</span>
                <span className="font-bold text-slate-800 text-sm">{selectedFloor.usage}</span>
              </div>
            </div>
          </div>

          {/* Units on this Floor */}
          <div className="p-4 flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Units on {selectedFloor.floorName}
            </h4>
            <div className="space-y-2">
              {selectedFloor.units.map((unit) => {
                const isSelected = selectedUnit?.id === unit.id;
                return (
                  <div
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        Unit {unit.unitNumber}
                        {unit.topologyStatus === 'Warning' && (
                          <span className="text-amber-600" title="Topology Warning: Minor partition intersection">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {unit.usage}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between mb-2">
                      <span>Area: <strong className="text-slate-700">{unit.areaSqFt} sq.ft</strong></span>
                      <span className="font-mono">Elev: +{unit.elevationM}m</span>
                    </div>

                    {unit.candidateUlpin && (
                      <div className="mt-1 p-1.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-blue-700 break-all">
                        {unit.candidateUlpin}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => setActiveTab('ulpin')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              GENERATE 3D ULPIN FOR UNIT
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

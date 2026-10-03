import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useApp } from '../context/AppContext';
import { X, Layers, Box, Eye, Info, RotateCcw } from 'lucide-react';

export const PointCloudViewer: React.FC = () => {
  const { isPointCloudModalOpen, setIsPointCloudModalOpen } = useApp();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [showBuilding, setShowBuilding] = useState<boolean>(true);
  const [showFloors, setShowFloors] = useState<boolean>(true);
  const [showUnits, setShowUnits] = useState<boolean>(true);
  const [showParcel, setShowParcel] = useState<boolean>(true);
  const [colorMode, setColorMode] = useState<'elevation' | 'classification'>('elevation');

  useEffect(() => {
    if (!isPointCloudModalOpen || !canvasRef.current) return;
    const container = canvasRef.current;
    const width = container.clientWidth || 700;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Dark slate for point cloud visibility

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(28, 25, 32);
    camera.lookAt(0, 8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.replaceChildren(renderer.domElement);

    // Generate Synthetic Building LiDAR Point Cloud (3,500 points)
    const pointsGeo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    // Helper: color by elevation
    const getElevColor = (z: number) => {
      const t = Math.max(0, Math.min(1, (z + 3) / 25));
      const color = new THREE.Color();
      color.setHSL(0.65 - t * 0.65, 0.9, 0.55); // Blue -> Cyan -> Green -> Yellow -> Red
      return color;
    };

    // 1. Parcel Ground Points (Z = 0)
    if (showParcel) {
      for (let i = 0; i < 900; i++) {
        const x = (Math.random() - 0.5) * 45;
        const y = (Math.random() - 0.05) * 0.2;
        const z = (Math.random() - 0.5) * 45;
        positions.push(x, y, z);

        const col = colorMode === 'elevation' ? getElevColor(y) : new THREE.Color(0x10b981); // Emerald for ground
        colors.push(col.r, col.g, col.b);
      }
    }

    // 2. Building Facade & Interior Slabs (Z: -3.2 to 22.4m)
    if (showBuilding) {
      const fpWidth = 24;
      const fpDepth = 22;
      const totalH = 22;

      // Facade perimeter points
      for (let i = 0; i < 1800; i++) {
        const h = Math.random() * totalH - 3.2; // vertical
        const side = Math.floor(Math.random() * 4);
        let x = 0, z = 0;
        if (side === 0) {
          x = (Math.random() - 0.5) * fpWidth;
          z = -fpDepth / 2;
        } else if (side === 1) {
          x = (Math.random() - 0.5) * fpWidth;
          z = fpDepth / 2;
        } else if (side === 2) {
          x = -fpWidth / 2;
          z = (Math.random() - 0.5) * fpDepth;
        } else {
          x = fpWidth / 2;
          z = (Math.random() - 0.5) * fpDepth;
        }

        // Add slight measurement noise
        x += (Math.random() - 0.5) * 0.15;
        z += (Math.random() - 0.5) * 0.15;

        positions.push(x, h, z);
        const col = colorMode === 'elevation' ? getElevColor(h) : new THREE.Color(0x38bdf8); // Sky blue for facade
        colors.push(col.r, col.g, col.b);
      }

      // Roof points
      for (let i = 0; i < 500; i++) {
        const x = (Math.random() - 0.5) * fpWidth;
        const z = (Math.random() - 0.5) * fpDepth;
        const h = totalH + (Math.random() - 0.5) * 0.2;
        positions.push(x, h, z);
        const col = colorMode === 'elevation' ? getElevColor(h) : new THREE.Color(0xf59e0b); // Amber for roof
        colors.push(col.r, col.g, col.b);
      }
    }

    // 3. Floor Slabs & Unit Partitions
    if (showFloors || showUnits) {
      const floorLevels = [-3.2, 0, 3.8, 7.0, 10.2, 13.4, 16.6];
      floorLevels.forEach((fl) => {
        for (let i = 0; i < 150; i++) {
          const x = (Math.random() - 0.5) * 22;
          const z = (Math.random() - 0.5) * 20;
          positions.push(x, fl, z);
          const col = colorMode === 'elevation' ? getElevColor(fl) : new THREE.Color(0xa855f7); // Purple for slab
          colors.push(col.r, col.g, col.b);
        }
      });
    }

    pointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    pointsGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const pointsMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });

    const pointCloud = new THREE.Points(pointsGeo, pointsMat);
    scene.add(pointCloud);

    // Grid helper
    const grid = new THREE.GridHelper(50, 25, 0x334155, 0x1e293b);
    grid.position.y = -0.1;
    scene.add(grid);

    // Orbit Dragging
    let isDown = false;
    let prevX = 0, prevY = 0;
    let angleTheta = Math.PI / 4, anglePhi = Math.PI / 3.5, radius = 45;

    const updateCam = () => {
      camera.position.x = radius * Math.sin(anglePhi) * Math.sin(angleTheta);
      camera.position.y = radius * Math.cos(anglePhi);
      camera.position.z = radius * Math.sin(anglePhi) * Math.cos(angleTheta);
      camera.lookAt(0, 8, 0);
    };
    updateCam();

    const dom = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      angleTheta -= dx * 0.008;
      anglePhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, anglePhi - dy * 0.008));
      updateCam();
    };
    const onMouseUp = () => { isDown = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(12, Math.min(80, radius + e.deltaY * 0.05));
      updateCam();
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [isPointCloudModalOpen, showBuilding, showFloors, showUnits, showParcel, colorMode]);

  if (!isPointCloudModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">LiDAR Point Cloud Viewer</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  SIMULATED LiDAR / POINT-CLOUD DATA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                125,000 Points • Density: 85 pts/m² • Tower A - Sahyadri Heights
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPointCloudModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-2.5 rounded-lg mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Layers:</span>
            <button
              onClick={() => setShowParcel(!showParcel)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${showParcel ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              Show Parcel
            </button>
            <button
              onClick={() => setShowBuilding(!showBuilding)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${showBuilding ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              Show Building
            </button>
            <button
              onClick={() => setShowFloors(!showFloors)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${showFloors ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              Show Floors
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Colormap:</span>
            <button
              onClick={() => setColorMode('elevation')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${colorMode === 'elevation' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              Elevation (Z)
            </button>
            <button
              onClick={() => setColorMode('classification')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${colorMode === 'classification' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              Classification
            </button>
          </div>
        </div>

        {/* 3D Canvas */}
        <div ref={canvasRef} className="w-full h-96 rounded-xl overflow-hidden relative cursor-grab active:cursor-grabbing border border-slate-800">
          <div className="absolute bottom-3 left-3 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-slate-300 pointer-events-none">
            Rotate: Left Drag • Zoom: Wheel
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 text-right">
          <button
            onClick={() => setIsPointCloudModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

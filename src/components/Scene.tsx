import React, { useRef, useState, useCallback, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import { EffectComposer, N8AO, Bloom } from '@react-three/postprocessing';
import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { Building } from './Building';

// The realistic environment loads an HDR from a remote CDN at runtime. If it
// is slow or fails (offline, CDN down), the canvas used to suspend/blank with
// no recourse; now the Environment sits behind Suspense + this boundary and
// the scene degrades to its lights alone.
class EnvironmentBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function EnvironmentSetup({ mode, intensity }: { mode: 'abstract' | 'realistic', intensity: number }) {
  if (mode === 'realistic') {
    return (
      <>
        <EnvironmentBoundary>
          <Suspense fallback={null}>
            <Environment preset="dawn" background />
          </Suspense>
        </EnvironmentBoundary>
        <directionalLight
          castShadow
          position={[50, 50, 50]}
          intensity={intensity}
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0005}
        >
          <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50, 1, 200]} />
        </directionalLight>
      </>
    );
  }

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        castShadow
        position={[50, 50, 50]}
        intensity={intensity}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      >
        <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50, 1, 200]} />
      </directionalLight>
      <fog attach="fog" args={['#080808', 20, 150]} />
    </>
  );
}

export function Scene() {
  // useShallow: subscribing to the whole store re-rendered the scene (and
  // reconciled the whole building list) on every store change, e.g. each
  // tick of the light-intensity slider.
  const {
    buildings,
    selectedId,
    selectBuilding,
    recordHistory,
    moveBuilding,
    environmentMode,
    lightIntensity,
    cameraMode
  } = useStore(useShallow((state) => ({
    buildings: state.buildings,
    selectedId: state.selectedId,
    selectBuilding: state.selectBuilding,
    recordHistory: state.recordHistory,
    moveBuilding: state.moveBuilding,
    environmentMode: state.environmentMode,
    lightIntensity: state.lightIntensity,
    cameraMode: state.cameraMode
  })));

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const orbitRef = useRef<any>(null);
  // Set on pointer-down; the history snapshot is taken only when the drag
  // actually moves, so plain selection clicks don't consume undo entries.
  const pendingHistoryRef = useRef<string | null>(null);

  const handlePointerDown = useCallback((id: string, e: any) => {
    e.stopPropagation();
    selectBuilding(id);
    pendingHistoryRef.current = id;
    setDraggingId(id);
    if (orbitRef.current) orbitRef.current.enabled = false;
  }, [selectBuilding]);

  const handlePointerUp = useCallback(() => {
    pendingHistoryRef.current = null;
    setDraggingId(null);
    if (orbitRef.current) orbitRef.current.enabled = true;
  }, []);

  // Releasing the pointer outside the canvas never reaches the Canvas onPointerUp;
  // without this, the drag (and disabled OrbitControls) stuck forever.
  useEffect(() => {
    if (!draggingId) return;
    const up = () => handlePointerUp();
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, [draggingId, handlePointerUp]);

  const handlePointerMove = useCallback((e: any) => {
    if (draggingId) {
      if (pendingHistoryRef.current === draggingId) {
        // First actual movement of this drag: snapshot the pre-drag state.
        recordHistory();
        pendingHistoryRef.current = null;
      }
      moveBuilding(draggingId, e.point.x, e.point.z);
    }
  }, [draggingId, moveBuilding, recordHistory]);

  const handleFloorClick = useCallback((e: any) => {
    e.stopPropagation();
    selectBuilding(null);
  }, [selectBuilding]);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ powerPreference: 'high-performance', antialias: false }}
      onPointerUp={handlePointerUp}
      onPointerMissed={handlePointerUp}
    >
      <React.Suspense fallback={null}>
        {cameraMode === 'perspective' && (
          <PerspectiveCamera makeDefault position={[20, 20, 30]} fov={45} />
        )}
        {cameraMode === 'topdown' && (
          <OrthographicCamera makeDefault position={[0, 100, 0]} rotation={[-Math.PI / 2, 0, 0]} zoom={20} />
        )}
        <EnvironmentSetup mode={environmentMode} intensity={lightIntensity} />
        
        {/* Ground */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.01, 0]} 
          receiveShadow 
          onPointerDown={handleFloorClick}
        >
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
        </mesh>

        {/* Grid */}
        <gridHelper args={[200, 200, '#444', '#333']} position={[0, 0, 0]} />

        {/* Drag Plane */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]} 
          visible={false}
          onPointerMove={handlePointerMove}
        >
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {buildings.map(b => (
          <Building 
            key={b.id} 
            data={b} 
            isSelected={b.id === selectedId} 
            onPointerDown={(e) => handlePointerDown(b.id, e)}
          />
        ))}

        <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={50} blur={1.5} far={10} resolution={512} />
        
        <EffectComposer multisampling={0}>
          <N8AO distanceFalloff={0.2} aoRadius={2} intensity={2} color="#000000" />
          <Bloom luminanceThreshold={0.8} mipmapBlur intensity={0.5} />
        </EffectComposer>

        <OrbitControls 
          ref={orbitRef} 
          makeDefault 
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 2 - 0.05} 
          enableRotate={cameraMode === 'perspective'}
        />
      </React.Suspense>
    </Canvas>
  );
}

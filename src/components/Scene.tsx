import React, { useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import { EffectComposer, N8AO, Bloom } from '@react-three/postprocessing';
import { useStore } from '../store';
import { Building } from './Building';

function EnvironmentSetup({ mode, intensity }: { mode: 'abstract' | 'realistic', intensity: number }) {
  if (mode === 'realistic') {
    return (
      <>
        <Environment preset="dawn" background />
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
  const { 
    buildings, 
    selectedId, 
    selectBuilding, 
    recordHistory, 
    moveBuilding, 
    environmentMode, 
    lightIntensity, 
    cameraMode 
  } = useStore();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const orbitRef = useRef<any>(null);

  const handlePointerDown = useCallback((id: string, e: any) => {
    e.stopPropagation();
    selectBuilding(id);
    recordHistory();
    setDraggingId(id);
    if (orbitRef.current) orbitRef.current.enabled = false;
  }, [selectBuilding, recordHistory]);

  const handlePointerUp = useCallback(() => {
    setDraggingId(null);
    if (orbitRef.current) orbitRef.current.enabled = true;
  }, []);

  const handlePointerMove = useCallback((e: any) => {
    if (draggingId) {
      moveBuilding(draggingId, e.point.x, e.point.z);
    }
  }, [draggingId, moveBuilding]);

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

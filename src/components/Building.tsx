import React, { useMemo, useEffect, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { BuildingData } from '../types';
import { generateBlocks } from '../utils/generator';
import { useStore } from '../store';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface Props {
  data: BuildingData;
  isSelected: boolean;
  onPointerDown: (e: any) => void;
}

const TEXTURE_PATH = `${(import.meta as any).env?.BASE_URL || '/'}concrete.jpg`.replace(/\/\//g, '/');
useTexture.preload(TEXTURE_PATH);

// Shared window material across all buildings to reduce draw-state switches and memory
const sharedWindowMaterial = new THREE.MeshStandardMaterial({
  color: '#1a1a1a',
  roughness: 0.2,
  metalness: 0.8
});

function BuildingComponent({ data, isSelected, onPointerDown }: Props) {
  const concreteTexture = useTexture(TEXTURE_PATH);
  const { weathering } = useStore();
  
  // Configure texture repeat once
  useMemo(() => {
    if (concreteTexture) {
      concreteTexture.wrapS = THREE.RepeatWrapping;
      concreteTexture.wrapT = THREE.RepeatWrapping;
      concreteTexture.repeat.set(1, 1);
      concreteTexture.needsUpdate = true;
    }
  }, [concreteTexture]);

  // Merge geometries for maximum draw-call efficiency:
  // Instead of 30-90 individual meshes per building, we create:
  // 1 merged concrete geometry + 1 merged window geometry.
  // Recomputed ONLY when geometry dimensions/style change, NOT on position (x, z) or rotation updates!
  const { concreteGeometry, windowGeometry } = useMemo(() => {
    const blocks = generateBlocks(data);
    const concreteGeos: THREE.BufferGeometry[] = [];
    const windowGeos: THREE.BufferGeometry[] = [];

    for (const b of blocks) {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      geo.translate(b.x || 0, b.y, b.z || 0);
      if (b.type === 'window') {
        windowGeos.push(geo);
      } else {
        concreteGeos.push(geo);
      }
    }

    const mergedConcrete = concreteGeos.length > 0 ? mergeGeometries(concreteGeos) : null;
    const mergedWindow = windowGeos.length > 0 ? mergeGeometries(windowGeos) : null;

    // Dispose unmerged intermediate geometries immediately to avoid memory leaks
    concreteGeos.forEach(g => g.dispose());
    windowGeos.forEach(g => g.dispose());

    return { concreteGeometry: mergedConcrete, windowGeometry: mergedWindow };
  }, [data.seed, data.baseWidth, data.baseDepth, data.floors, data.coreHeight, data.style]);

  // Clean up merged geometries when geometry updates or building unmounts
  useEffect(() => {
    return () => {
      concreteGeometry?.dispose();
      windowGeometry?.dispose();
    };
  }, [concreteGeometry, windowGeometry]);

  // Stable material instance per building with shared compiled program key.
  // Three.js will compile the GLSL program ONCE and reuse it for all buildings.
  const concreteMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: concreteTexture,
      color: '#a0a0a0',
      roughness: 0.9,
      metalness: 0.1,
    });

    const uniforms = {
      uWeathering: { value: weathering ? 1.0 : 0.0 },
      uTextureSeed: { value: data.textureSeed || 0.0 },
      uTextureType: { 
        value: data.textureType === 'weathered' ? 1.0 : 
               data.textureType === 'exposed' ? 2.0 : 0.0
      }
    };
    mat.userData.uniforms = uniforms;

    // Unified cache key ensures Three.js compiles the shader program ONCE across all buildings
    mat.customProgramCacheKey = () => 'brutalist_concrete_shader_v1';

    mat.onBeforeCompile = (shader: any) => {
      shader.uniforms.uWeathering = uniforms.uWeathering;
      shader.uniforms.uTextureSeed = uniforms.uTextureSeed;
      shader.uniforms.uTextureType = uniforms.uTextureType;
      mat.userData.shader = shader;

      shader.vertexShader = `
        varying vec3 vWorldPosition;
        uniform float uTextureSeed;
        ${shader.vertexShader}
      `.replace(
        `#include <worldpos_vertex>`,
        `
        #include <worldpos_vertex>
        vWorldPosition = worldPosition.xyz;
        `
      ).replace(
        `#include <uv_vertex>`,
        `
        #include <uv_vertex>
        #ifdef USE_MAP
          if (abs(normal.x) > 0.5) {
            vMapUv = vec2(position.z, position.y);
          } else if (abs(normal.y) > 0.5) {
            vMapUv = vec2(position.x, position.z);
          } else {
            vMapUv = vec2(position.x, position.y);
          }
          vMapUv = vMapUv * 0.5 + vec2(uTextureSeed * 0.1, uTextureSeed * 0.2);
        #endif
        `
      );

      shader.fragmentShader = `
        varying vec3 vWorldPosition;
        uniform float uWeathering;
        uniform float uTextureSeed;
        uniform float uTextureType;
        
        float random(vec2 p) {
          return fract(sin(dot(p.xy, vec2(12.9898,78.233))) * 43758.5453123 + uTextureSeed * 0.1);
        }
        
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        ${shader.fragmentShader}
      `.replace(
        `#include <color_fragment>`,
        `
        #include <color_fragment>
        
        if (uTextureType == 0.0) {
          // Smooth: lighter, clean concrete
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.8), 0.5);
        } else if (uTextureType == 1.0) {
          // Weathered: darker, high contrast streaks
          diffuseColor.rgb *= 0.8;
          float typeStreakNoise = noise(vec2(vWorldPosition.x * 3.0 + vWorldPosition.z * 3.0 + uTextureSeed * 5.0, vWorldPosition.y * 0.3));
          float typeStreaks = smoothstep(0.3, 0.9, typeStreakNoise) * 0.5;
          diffuseColor.rgb -= typeStreaks;
        } else if (uTextureType == 2.0) {
          // Exposed Aggregate: grainy, tactile aggregate texture
          float grain = noise(vWorldPosition.xz * 20.0 + vWorldPosition.y * 20.0);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.6, 0.55, 0.5), 0.6);
          diffuseColor.rgb -= grain * 0.15;
        }

        if (uWeathering > 0.5) {
          // Dark streaks simulating water stains running down
          float streakNoise = noise(vec2(vWorldPosition.x * 2.0 + vWorldPosition.z * 2.0 + uTextureSeed * 5.0, vWorldPosition.y * 0.2));
          float streaks = smoothstep(0.4, 0.8, streakNoise) * 0.4;
          diffuseColor.rgb -= streaks;
          
          // Subtle moss on surfaces near ground
          if (vWorldPosition.y < 3.0) {
            float mossNoise = noise(vWorldPosition.xz * 4.0 + uTextureSeed * 10.0);
            float moss = smoothstep(0.3, 0.7, mossNoise) * max(0.0, 3.0 - vWorldPosition.y) * 0.4;
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.2, 0.35, 0.15), moss);
          }
        }
        `
      );
    };

    return mat;
  }, [concreteTexture]);

  // Clean up material when building is removed
  useEffect(() => {
    return () => {
      concreteMaterial.dispose();
    };
  }, [concreteMaterial]);

  // Dynamic uniform updates without triggering expensive GPU shader recompilation
  useEffect(() => {
    if (concreteMaterial.userData.uniforms) {
      concreteMaterial.userData.uniforms.uWeathering.value = weathering ? 1.0 : 0.0;
      concreteMaterial.userData.uniforms.uTextureSeed.value = data.textureSeed || 0.0;
      concreteMaterial.userData.uniforms.uTextureType.value = 
        data.textureType === 'weathered' ? 1.0 : 
        data.textureType === 'exposed' ? 2.0 : 0.0;
    }
  }, [concreteMaterial, weathering, data.textureSeed, data.textureType]);

  const selectionRadius = useMemo(() => {
    return Math.max(data.baseWidth, data.baseDepth) * 0.8;
  }, [data.baseWidth, data.baseDepth]);

  return (
    <group 
      position={[data.x, 0, data.z]} 
      rotation={[0, ((data.rotationY || 0) * Math.PI) / 180, 0]}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDown(e);
      }}
    >
      {/* Selection outline indicator */}
      {isSelected && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[selectionRadius, selectionRadius + 0.2, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
        </mesh>
      )}

      {concreteGeometry && (
        <mesh geometry={concreteGeometry} material={concreteMaterial} castShadow receiveShadow />
      )}

      {windowGeometry && (
        <mesh geometry={windowGeometry} material={sharedWindowMaterial} castShadow receiveShadow />
      )}
    </group>
  );
}

// Wrap in React.memo to prevent re-rendering untouched buildings when one building moves
export const Building = React.memo(BuildingComponent, (prev, next) => {
  return (
    prev.isSelected === next.isSelected &&
    prev.data.id === next.data.id &&
    prev.data.x === next.data.x &&
    prev.data.z === next.data.z &&
    prev.data.rotationY === next.data.rotationY &&
    prev.data.floors === next.data.floors &&
    prev.data.baseWidth === next.data.baseWidth &&
    prev.data.baseDepth === next.data.baseDepth &&
    prev.data.coreHeight === next.data.coreHeight &&
    prev.data.style === next.data.style &&
    prev.data.seed === next.data.seed &&
    prev.data.textureSeed === next.data.textureSeed &&
    prev.data.textureType === next.data.textureType
  );
});

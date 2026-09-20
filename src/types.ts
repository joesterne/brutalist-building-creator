export interface BuildingData {
  id: string;
  x: number;
  z: number;
  seed: number;
  textureSeed?: number;
  floors: number;
  baseWidth: number;
  baseDepth: number;
  coreHeight: number;
  style: 'monolith' | 'stacked' | 'tower' | 'podium' | 'cantilever' | 'slab';
  rotationY: number;
  textureType?: 'smooth' | 'weathered' | 'exposed';
}

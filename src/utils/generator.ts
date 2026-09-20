import { BuildingData } from '../types';
import { seededRandom } from './random';

export interface BlockData {
  w: number;
  h: number;
  d: number;
  x: number;
  y: number;
  z: number;
  type: 'floor' | 'window' | 'core' | 'column';
}

export function generateBlocks(data: BuildingData): BlockData[] {
  let currentSeed = data.seed;
  const rng = () => seededRandom(currentSeed++);
  
  const floorHeight = 1.2;
  const blocks: BlockData[] = [];
  
  // Base core
  const coreW = data.baseWidth * 0.4;
  const coreD = data.baseDepth * 0.4;
  const coreH = data.floors * floorHeight + data.coreHeight;
  blocks.push({
    w: coreW, h: coreH, d: coreD,
    x: 0, y: coreH / 2, z: 0,
    type: 'core'
  });

  if (data.style === 'stacked') {
    for (let i = 0; i < data.floors; i++) {
      const w = data.baseWidth * (0.8 + rng() * 0.4);
      const d = data.baseDepth * (0.8 + rng() * 0.4);
      const isOverhang = rng() > 0.8;
      const finalW = isOverhang ? w * 1.5 : w;
      const finalD = isOverhang ? d * 1.5 : d;
      
      blocks.push({ w: finalW, h: floorHeight * 0.8, d: finalD, x: 0, y: i * floorHeight + floorHeight / 2, z: 0, type: 'floor' });
      blocks.push({ w: finalW * 0.9, h: floorHeight, d: finalD * 0.9, x: 0, y: i * floorHeight + floorHeight / 2, z: 0, type: 'window' });
    }
  } else if (data.style === 'monolith' || (data.style as any) === 'monolithic') {
    const numBlocks = Math.max(2, Math.floor(data.floors / 4));
    let currentY = 0;
    for (let i = 0; i < numBlocks; i++) {
      const blockFloors = Math.floor(data.floors / numBlocks);
      const bh = blockFloors * floorHeight;
      const bw = data.baseWidth * (1 - (i * 0.1));
      const bd = data.baseDepth * (1 - (i * 0.1));
      
      blocks.push({ w: bw, h: bh * 0.9, d: bd, x: 0, y: currentY + (bh * 0.9) / 2, z: 0, type: 'floor' });
      blocks.push({ w: bw * 0.95, h: bh, d: bd * 0.95, x: 0, y: currentY + bh / 2, z: 0, type: 'window' });
      
      const numFins = Math.floor(bw * 2);
      for (let j = 0; j <= numFins; j++) {
        blocks.push({
          w: 0.1, h: bh * 0.9, d: bd * 1.05,
          x: -bw/2 + (j/numFins) * bw, y: currentY + (bh * 0.9) / 2, z: 0,
          type: 'floor'
        });
      }
      currentY += bh;
    }
  } else if (data.style === 'tower') {
    const w = data.baseWidth;
    const d = data.baseDepth;
    blocks.push({ w, h: data.floors * floorHeight, d, x: 0, y: (data.floors * floorHeight)/2, z: 0, type: 'floor' });
    for (let i = 0; i < data.floors; i++) {
      blocks.push({ w: w * 1.02, h: 0.2, d: d * 1.02, x: 0, y: i * floorHeight, z: 0, type: 'floor' });
    }
    const numFins = Math.floor(w * 1.5);
    for (let j = 0; j <= numFins; j++) {
      blocks.push({ w: 0.2, h: data.floors * floorHeight, d: d * 1.02, x: -w/2 + (j/numFins) * w, y: (data.floors * floorHeight)/2, z: 0, type: 'floor' });
    }
  } else if (data.style === 'podium') {
    // Large base, smaller tower on top
    const podiumFloors = Math.max(1, Math.floor(data.floors * 0.3));
    const towerFloors = data.floors - podiumFloors;
    const pw = data.baseWidth * 1.5;
    const pd = data.baseDepth * 1.5;
    const ph = podiumFloors * floorHeight;
    
    // Podium
    blocks.push({ w: pw, h: ph * 0.8, d: pd, x: 0, y: ph / 2, z: 0, type: 'floor' });
    blocks.push({ w: pw * 0.95, h: ph, d: pd * 0.95, x: 0, y: ph / 2, z: 0, type: 'window' });
    
    // Tower
    const tw = data.baseWidth * 0.6;
    const td = data.baseDepth * 0.6;
    const th = towerFloors * floorHeight;
    blocks.push({ w: tw, h: th * 0.9, d: td, x: 0, y: ph + th / 2, z: 0, type: 'floor' });
    blocks.push({ w: tw * 0.95, h: th, d: td * 0.95, x: 0, y: ph + th / 2, z: 0, type: 'window' });

    // Tower ribs
    for (let i=0; i<towerFloors; i+=2) {
      blocks.push({ w: tw * 1.1, h: 0.3, d: td * 1.1, x: 0, y: ph + i * floorHeight, z: 0, type: 'floor' });
    }

  } else if (data.style === 'cantilever') {
    // Alternating offset boxes
    for (let i = 0; i < data.floors; i += 2) {
      const isOffsetX = rng() > 0.5;
      const offsetAmt = (rng() * 0.6 + 0.2) * (rng() > 0.5 ? 1 : -1);
      
      const w = data.baseWidth;
      const d = data.baseDepth;
      const h = floorHeight * 2;
      
      const offsetX = isOffsetX ? offsetAmt * w : 0;
      const offsetZ = !isOffsetX ? offsetAmt * d : 0;
      
      const y = i * floorHeight + h / 2;
      
      blocks.push({ w, h: h * 0.8, d, x: offsetX, y, z: offsetZ, type: 'floor' });
      blocks.push({ w: w * 0.9, h, d: d * 0.9, x: offsetX, y, z: offsetZ, type: 'window' });
    }
  } else if (data.style === 'slab') {
    // Very wide, not very deep
    const w = data.baseWidth * 2;
    const d = data.baseDepth * 0.4;
    
    // Main slab
    blocks.push({ w, h: data.floors * floorHeight, d, x: 0, y: (data.floors * floorHeight)/2, z: 0, type: 'floor' });
    blocks.push({ w: w * 0.98, h: data.floors * floorHeight * 0.95, d: d * 1.1, x: 0, y: (data.floors * floorHeight)/2, z: 0, type: 'window' });
    
    // Support columns
    const numCols = Math.floor(w / 3);
    for(let i=0; i<=numCols; i++) {
       const colX = -w/2 + (i/numCols) * w;
       blocks.push({ w: 0.8, h: floorHeight * 2, d: d * 1.2, x: colX, y: floorHeight, z: 0, type: 'column' });
    }
    
    // Balconies
    for(let i=2; i<data.floors; i++) {
       if (rng() > 0.3) {
          blocks.push({ w: w * 0.8, h: 0.2, d: d * 1.4, x: 0, y: i * floorHeight, z: 0, type: 'floor' });
       }
    }
  }
  
  return blocks;
}

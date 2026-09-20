import React from 'react';
import { useStore } from '../store';
import { Plus, Trash2, Undo2, Redo2 } from 'lucide-react';

export function LeftSidebar() {
  const { buildings, selectedId, addBuilding, updateBuilding, deleteBuilding, generateCityBlock, undo, redo, past, future } = useStore();
  const selectedBuilding = buildings.find(b => b.id === selectedId);

  return (
    <aside className="w-64 border-r border-white/5 flex flex-col p-6 bg-[#0a0a0a] z-10">
      <div className="mb-6">
        <label className="text-[10px] font-black uppercase text-orange-500 mb-4 block tracking-widest">Global Actions</label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button 
            onClick={undo}
            disabled={past.length === 0}
            className="h-8 bg-zinc-900 border border-white/10 flex items-center justify-center gap-2 hover:bg-orange-600/20 hover:border-orange-600 disabled:opacity-30 disabled:hover:bg-zinc-900 disabled:hover:border-white/10 transition-all"
          >
            <Undo2 size={12} className="text-zinc-400" />
            <span className="text-[9px] uppercase font-bold text-white">Undo</span>
          </button>
          <button 
            onClick={redo}
            disabled={future.length === 0}
            className="h-8 bg-zinc-900 border border-white/10 flex items-center justify-center gap-2 hover:bg-orange-600/20 hover:border-orange-600 disabled:opacity-30 disabled:hover:bg-zinc-900 disabled:hover:border-white/10 transition-all"
          >
            <Redo2 size={12} className="text-zinc-400" />
            <span className="text-[9px] uppercase font-bold text-white">Redo</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => addBuilding(0, 0)}
            className="h-16 bg-zinc-900 border border-white/10 flex flex-col items-center justify-center gap-1 hover:bg-orange-600/20 hover:border-orange-600 transition-all col-span-2"
          >
            <Plus size={16} className="text-zinc-400" />
            <span className="text-[9px] uppercase font-bold text-white">Add Random Entity</span>
          </button>
          <button 
            onClick={generateCityBlock}
            className="h-8 bg-zinc-900 border border-white/10 flex items-center justify-center gap-1 hover:bg-orange-600/20 hover:border-orange-600 transition-all col-span-2"
          >
            <span className="text-[9px] uppercase font-bold text-white">Gen City Block</span>
          </button>
        </div>
      </div>

      <div className="mb-6 border-t border-white/5 pt-6">
        <label className="text-[10px] font-black uppercase text-orange-500 mb-4 block tracking-widest">Brutalist Presets</label>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => addBuilding(0, 0, { style: 'monolith', baseWidth: 8, baseDepth: 8, floors: 10, coreHeight: 1 })}
            className="h-12 bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-orange-600/20 hover:border-orange-600 transition-all"
          >
            <span className="text-[9px] uppercase font-bold text-white text-center">Monolith</span>
          </button>
          <button 
            onClick={() => addBuilding(0, 0, { style: 'stacked', baseWidth: 6, baseDepth: 6, floors: 16, coreHeight: 2 })}
            className="h-12 bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-orange-600/20 hover:border-orange-600 transition-all"
          >
            <span className="text-[9px] uppercase font-bold text-white text-center">Stacked<br/>Blocks</span>
          </button>
          <button 
            onClick={() => addBuilding(0, 0, { style: 'cantilever', baseWidth: 5, baseDepth: 5, floors: 12, coreHeight: 3 })}
            className="h-12 bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-orange-600/20 hover:border-orange-600 transition-all"
          >
            <span className="text-[9px] uppercase font-bold text-white text-center">Cantilevered</span>
          </button>
          <button 
            onClick={() => addBuilding(0, 0, { style: 'tower', baseWidth: 4, baseDepth: 4, floors: 25, coreHeight: 2 })}
            className="h-12 bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-orange-600/20 hover:border-orange-600 transition-all"
          >
            <span className="text-[9px] uppercase font-bold text-white text-center">High<br/>Tower</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 border-t border-white/5 pt-6 overflow-y-auto pr-2 custom-scrollbar">
        <label className="text-[10px] font-black uppercase text-zinc-500 mb-4 block tracking-widest">Entity Properties</label>
        
        {selectedBuilding ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-1 mb-4">
              {(['monolith', 'slab', 'tower', 'podium', 'cantilever', 'stacked'] as const).map(style => (
                <button
                  key={style}
                  onClick={() => updateBuilding(selectedBuilding.id, { style })}
                  className={`h-10 flex flex-col items-center justify-center transition-all ${
                    selectedBuilding.style === style 
                      ? 'bg-zinc-800 border border-orange-600' 
                      : 'bg-zinc-900 border border-white/10 hover:bg-orange-600/20 hover:border-orange-600'
                  }`}
                  title={style}
                >
                  <div className={`border-2 ${selectedBuilding.style === style ? 'border-zinc-100' : 'border-zinc-400'} ${
                    style === 'stacked' || style === 'slab' ? 'w-4 h-2' : 
                    style === 'monolith' || style === 'podium' ? 'w-4 h-4' : 
                    'w-1.5 h-4'
                  }`}></div>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase opacity-60 font-bold">
                <span>Floors</span>
                <span>{selectedBuilding.floors}</span>
              </div>
              <input 
                type="range" min="5" max="40" step="1" 
                value={selectedBuilding.floors}
                onChange={e => updateBuilding(selectedBuilding.id, { floors: parseInt(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-full appearance-none outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase opacity-60 font-bold">
                <span>Base Width</span>
                <span>{selectedBuilding.baseWidth.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="2" max="15" step="0.5" 
                value={selectedBuilding.baseWidth}
                onChange={e => updateBuilding(selectedBuilding.id, { baseWidth: parseFloat(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-full appearance-none outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase opacity-60 font-bold">
                <span>Base Depth</span>
                <span>{selectedBuilding.baseDepth.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="2" max="15" step="0.5" 
                value={selectedBuilding.baseDepth}
                onChange={e => updateBuilding(selectedBuilding.id, { baseDepth: parseFloat(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-full appearance-none outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase opacity-60 font-bold">
                <span>Rotation</span>
                <span>{selectedBuilding.rotationY || 0}&deg;</span>
              </div>
              <input 
                type="range" min="0" max="360" step="1" 
                value={selectedBuilding.rotationY || 0}
                onChange={e => updateBuilding(selectedBuilding.id, { rotationY: parseInt(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-full appearance-none outline-none"
              />
            </div>
            
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 block tracking-widest">Random Seed</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={selectedBuilding.seed}
                  onChange={e => updateBuilding(selectedBuilding.id, { seed: parseInt(e.target.value) || 0 })}
                  className="w-full bg-zinc-900 border border-white/10 px-3 py-2 text-[10px] font-mono text-zinc-300 outline-none focus:border-orange-500 transition-colors"
                />
                <button 
                  onClick={() => updateBuilding(selectedBuilding.id, { seed: Math.floor(Math.random() * 10000) })}
                  className="px-3 py-2 bg-zinc-800 border border-white/10 hover:border-orange-500 hover:text-white text-[10px] uppercase font-bold transition-colors"
                >
                  Roll
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 block tracking-widest">Texture Finish</label>
              <select 
                value={selectedBuilding.textureType || 'smooth'}
                onChange={(e) => updateBuilding(selectedBuilding.id, { textureType: e.target.value as any })}
                className="w-full bg-zinc-900 border border-white/10 px-3 py-2 text-[10px] uppercase font-bold text-zinc-300 outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="smooth">Smooth</option>
                <option value="weathered">Weathered</option>
                <option value="exposed">Exposed Aggregate</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <button 
                onClick={() => updateBuilding(selectedBuilding.id, { textureSeed: Math.floor(Math.random() * 1000) })}
                className="w-full py-2 bg-zinc-800 border border-white/10 hover:border-orange-500 hover:bg-orange-600/10 text-white text-[10px] uppercase font-bold transition-colors"
              >
                Randomize Texture
              </button>
            </div>

            <div className="pt-4 border-t border-white/10 mt-4">
              <button 
                onClick={() => deleteBuilding(selectedBuilding.id)}
                className="w-full py-3 bg-red-950/30 border border-red-500/30 text-red-500 font-black uppercase text-xs hover:bg-red-900/50 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                Delete Entity
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 bg-zinc-900/50 gap-2 h-32">
            <span className="text-[10px] uppercase font-bold text-zinc-500">NO_SELECTION</span>
          </div>
        )}
      </div>
    </aside>
  );
}

import React, { useEffect, useState } from 'react';
import { useStore } from '../store';

export function Sidebar() {
  const { buildings, selectedId, environmentMode, toggleEnvironmentMode, weathering, toggleWeathering, lightIntensity, setLightIntensity } = useStore();
  const selectedBuilding = buildings.find(b => b.id === selectedId);
  const [logs, setLogs] = useState<{time: string, msg: string, type: string}[]>([
    {time: '08:22:11', msg: 'INITIALIZING VOXEL_ENGINE...', type: 'text-zinc-500'},
    {time: '08:22:12', msg: 'PHYSICS_LOADED: GRAVITY 9.81', type: 'text-green-500'},
  ]);

  useEffect(() => {
    if (selectedBuilding) {
      const d = new Date();
      const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
      setLogs(prev => [...prev, {time, msg: `SELECTED: ENTITY_${selectedBuilding.id.substring(0, 4).toUpperCase()}`, type: 'text-zinc-300'}].slice(-7));
    }
  }, [selectedBuilding]);

  return (
    <aside className="w-72 border-l border-white/5 bg-[#0a0a0a] p-6 flex flex-col z-10">
      <h2 className="text-[10px] font-black uppercase text-zinc-500 mb-6 tracking-widest">Simulation Log</h2>
      <div className="font-mono text-[9px] space-y-3 opacity-80 overflow-hidden flex-1">
        {logs.map((log, i) => (
          <p key={i} className={log.type}>[{log.time}] {log.msg}</p>
        ))}
        <p className="text-zinc-500 animate-pulse">[_]</p>
      </div>
      
      <div className="mt-12 space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase text-zinc-500 mb-4 block tracking-widest">Environment</label>
          <div className="space-y-2">
            <button 
              onClick={toggleEnvironmentMode}
              className={`w-full py-3 border text-[10px] font-black uppercase transition-colors flex items-center justify-center gap-2 ${
                environmentMode === 'realistic' 
                  ? 'bg-orange-600/20 border-orange-600 text-white' 
                  : 'bg-zinc-900 border-white/10 text-zinc-400 hover:border-orange-500 hover:text-white'
              }`}
            >
              HDRI Skybox: {environmentMode === 'realistic' ? 'ON' : 'OFF'}
            </button>
            <button 
              onClick={toggleWeathering}
              className={`w-full py-3 border text-[10px] font-black uppercase transition-colors flex items-center justify-center gap-2 ${
                weathering
                  ? 'bg-orange-600/20 border-orange-600 text-white' 
                  : 'bg-zinc-900 border-white/10 text-zinc-400 hover:border-orange-500 hover:text-white'
              }`}
            >
              Weathering Effects: {weathering ? 'ON' : 'OFF'}
            </button>
            
            <div className="pt-2">
              <div className="flex justify-between text-[10px] uppercase opacity-60 font-bold mb-2">
                <span>Volumetric Light</span>
                <span>{lightIntensity.toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0" max="5" step="0.1" 
                value={lightIntensity}
                onChange={e => setLightIntensity(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-full appearance-none outline-none"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="text-[10px] font-black uppercase text-zinc-500 mb-4 block tracking-widest">Export State</label>
          <button className="w-full py-4 bg-zinc-900 border border-white/10 text-white font-black uppercase text-xs hover:bg-white hover:text-black transition-colors">
            Render Blueprint
          </button>
        </div>
      </div>
    </aside>
  );
}


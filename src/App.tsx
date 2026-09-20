/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Scene } from './components/Scene';
import { Sidebar } from './components/Sidebar';
import { LeftSidebar } from './components/LeftSidebar';
import { useStore } from './store';

export default function App() {
  const lightIntensity = useStore(state => state.lightIntensity);
  const undo = useStore(state => state.undo);
  const redo = useStore(state => state.redo);
  const cameraMode = useStore(state => state.cameraMode);
  const toggleCameraMode = useStore(state => state.toggleCameraMode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-screen w-full bg-[#080808] text-zinc-300 font-sans flex flex-col overflow-hidden">
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0c0c0c] shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-orange-600 rounded-full animate-pulse"></div>
          <h1 className="font-black uppercase tracking-tighter text-xl text-white">BRUTALIST.BUILDER <span className="font-normal opacity-40 text-xs tracking-widest ml-2">V 0.8.2 ALPHA</span></h1>
        </div>
        <div className="flex gap-6 text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">
          <span>PROJECT: CEMENT_CITY_01</span>
          <span>RENDER: REALTIME_VOLUMETRIC</span>
          <span>DRAG TO SNAP: ON</span>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        
        <section className="flex-1 relative bg-[radial-gradient(circle_at_40%_40%,_#1a1a1a_0%,_#080808_100%)] viewport-grid flex items-center justify-center">
          <div className="absolute inset-0 volumetric-light" style={{ opacity: lightIntensity / 1.5 }}></div>
          <div className="absolute inset-0 z-0">
            <Scene />
          </div>
          
          <div className="absolute bottom-8 right-8 flex flex-col gap-2 items-end z-10">
            <div className="bg-black/80 backdrop-blur p-4 border border-white/10 flex gap-4 items-center">
              <button 
                onClick={toggleCameraMode}
                className={`w-12 h-10 border flex items-center justify-center text-[10px] uppercase font-bold transition-all ${
                  cameraMode === 'topdown' 
                    ? 'border-orange-500 text-orange-500 bg-orange-500/10' 
                    : 'border-white/20 text-white/40 hover:text-white hover:border-white/40'
                }`}
                title="Toggle Top-Down View"
              >
                {cameraMode === 'topdown' ? 'TOP' : '3D'}
              </button>
              <div className="pointer-events-none">
                <div className="text-[10px] font-bold opacity-40 uppercase">Drag to move</div>
                <div className="text-[10px] font-bold opacity-40 uppercase">Click to select</div>
              </div>
            </div>
          </div>
        </section>
        
        <Sidebar />
      </main>

      <footer className="h-12 bg-orange-600 flex items-center px-6 justify-between text-black shrink-0">
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
          <span>FPS: 144</span>
          <span>MODE: EDIT</span>
        </div>
        <div className="flex items-center gap-4 font-black uppercase text-[10px]">
          <span>Scale: 1:200</span>
          <div className="w-24 h-1 bg-black/20 relative">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-black"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}


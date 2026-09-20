# Brutalist Building Creator (Brutalist.Builder)

A procedural 3D brutalist architecture and urban composition studio built with React 18, Three.js, React Three Fiber (R3F), and custom GLSL shaders.

---

## Overview

**Brutalist Building Creator** allows architects, 3D artists, and game designers to generate, customize, and compose modular brutalist structures in real time. The application pairs procedural volumetric massing algorithms with custom GLSL triplanar concrete shaders, interactive spatial transformation controls, dynamic lighting atmospheres, and an intuitive dual-mode viewport (3D perspective & 2D top-down orthographic).

---

## Key Features

### 1. Procedural Architecture Generation
- **6 Architectural Archetypes:**
  - **Monolith:** Massive single-block brutalist forms with recessed bands and heavy cornices.
  - **Stacked:** Iterative vertically staggered volumes creating stepped terraces.
  - **Tower:** Slender high-density cores with rhythmically repeating fenestrations and cantilevered levels.
  - **Podium:** Expansive ground-level plinths supporting set-back upper towers.
  - **Cantilever:** Asymmetrical, gravity-defying horizontal overhangs and heavy suspended blocks.
  - **Slab:** Linear mid-rise housing and civic slabs with rhythmically extruded balconies.
- **Parametric Massing:** Dynamically tweak floor counts (1 to 60), base width, base depth, core height, and style classification on any selected structure.
- **One-Click Urban Grid (City Block):** Instantly populate a 4×4 urban layout with 16 procedurally generated buildings with randomized styles, heights, and massing.

### 2. Advanced Concrete Shaders & Finishes
- **Triplanar UV Projection:** Custom GLSL vertex and fragment shader modifications eliminate texture stretching across variable rectangular dimensions.
- **3 Selectable Surface Finishes:**
  - **Smooth:** Clean, low-contrast cast concrete with high reflectance and minimal surface irregularities.
  - **Weathered:** Darkened, high-contrast concrete with vertical water-runoff streaks and environmental discoloration.
  - **Exposed Aggregate:** Grainy, tactile surface finish with embedded gravel flecks and warm stone undertones.
- **Global Weathering Engine:** Toggle global environmental wear across all structures to simulate decades of atmospheric decay, rain staining, and surface patinas.
- **Per-Block Texture Seeds:** Randomize surface imperfections, streak alignments, and aggregate distributions per building entity.

### 3. Interactive Viewport & Controls
- **Dual Camera Systems:**
  - **3D Perspective Camera:** Orbital 3D navigation with azimuth/elevation rotation, smooth panning, and responsive zoom.
  - **Top-Down Orthographic Camera:** 2D architectural site plan view locked perpendicular to the ground plane for urban planning and footprint alignment.
- **Direct Manipulation:** Click and drag any building entity seamlessly across the ground plane with real-time shadow updates.
- **Precision Rotation:** Numeric and slider-based Y-axis rotation controls (0° to 360°).
- **Undo / Redo History:** Full state rollback and roll-forward for additions, deletions, moves, and parameter updates with standard keyboard shortcuts.

### 4. Lighting, Atmosphere & Post-Processing
- **Environment Modes:**
  - **Abstract Mode:** High-contrast architectural studio lighting with deep cast shadows.
  - **Realistic Mode (HDRI Skybox):** High dynamic range atmospheric skybox providing natural ambient reflections and soft bounce lighting.
- **Volumetric Light Intensity:** Continuous slider control (0.0 to 5.0) for fine-tuning directional and key light exposure.
- **Post-Processing Pipeline:**
  - **N8AO:** Screen-space ambient occlusion delivering accurate contact shadows in architectural crevices, overhangs, and corners.
  - **Bloom:** Subtle highlight glow for intense specular reflections and daylight rims.
  - **Contact Shadows:** Dynamic ground-plane contact shadows anchoring structures to the terrain.

### 5. Diagnostics & Interface
- **Simulation Console:** Real-time HUD log recording entity selections, physics engine events, and geometry regenerations.
- **Minimalist Brutalist UI:** High-contrast dark-mode interface built with Tailwind CSS, monospace tracking, and zero clutter.

---

## Controls & Keyboard Shortcuts

| Action | Control / Shortcut |
| :--- | :--- |
| **Select Building** | Left-Click on building mesh |
| **Deselect All** | Left-Click on ground plane |
| **Move Building** | Left-Click & Drag building across ground plane |
| **Orbit Camera** | Left-Click & Drag on empty canvas (3D mode) |
| **Pan Camera** | Right-Click & Drag / Two-finger trackpad drag |
| **Zoom In / Out** | Scroll Wheel / Pinch gesture |
| **Toggle Camera (3D / Plan)** | Click **3D / TOP** badge in viewport bottom-right |
| **Undo** | `Ctrl + Z` / `Cmd + Z` |
| **Redo** | `Ctrl + Shift + Z` / `Cmd + Shift + Z` or `Ctrl + Y` / `Cmd + Y` |
| **Delete Selected** | Click **Delete Entity** button in Left Sidebar |

---

## Tech Stack & Architecture

- **Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server:** [Vite](https://vitejs.dev/)
- **3D Graphics:** [Three.js](https://threejs.org/) + [@react-three/fiber (R3F)](https://docs.pmnd.rs/react-three-fiber/)
- **3D Helpers & Shaders:** [@react-three/drei](https://github.com/pmndrs/drei) + [@react-three/postprocessing](https://github.com/pmndrs/postprocessing)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (with immutable past/future undo/redo stacks)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## Project Structure

```text
├── public/
│   └── concrete.jpg           # 1024x1024 seamless architectural concrete base map
├── src/
│   ├── components/
│   │   ├── Building.tsx       # Procedural mesh generation, custom GLSL shaders & finish logic
│   │   ├── LeftSidebar.tsx   # Entity generator, dimension sliders, rotation & texture selector
│   │   ├── Sidebar.tsx       # Simulation log, environment toggles, light intensity slider
│   │   └── Scene.tsx          # 3D Canvas, camera rigs, drag planes, post-processing stack
│   ├── utils/
│   │   └── generator.ts       # Algorithmic massing generators for all 6 brutalist styles
│   ├── store.ts               # Zustand application store with history management
│   ├── types.ts               # TypeScript schemas for buildings, styles, and finishes
│   ├── App.tsx                # Main viewport layout, HUD overlays, keyboard listeners
│   ├── main.tsx               # Application bootstrap
│   └── index.css              # Global styles and Tailwind imports
├── metadata.json              # Applet configuration and permissions
├── package.json               # Dependencies and build scripts
├── tsconfig.json              # TypeScript compiler configuration
└── vite.config.ts             # Vite build and plugin configuration
```

---

## Getting Started

### Prerequisites
- **Node.js** 18.0 or newer
- **npm** or **yarn**

### Installation
1. Clone or download the repository.
2. Install project dependencies:
   ```bash
   npm install
   ```

### Development
Start the local development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### Type Checking & Linting
Validate TypeScript types across the codebase:
```bash
npm run lint
```

### Production Build
Compile the optimized production assets:
```bash
npm run build
```
Static production files will be output to the `dist/` directory.

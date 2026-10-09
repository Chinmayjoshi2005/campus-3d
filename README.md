# Campus Guide 3D

Production-ready web-based digital twin of the college campus. Students, visitors, faculty, and administrators can search locations, explore the campus in 3D, and play the interactive game mode — all inside the browser.

## Project Structure

```
CampusGuide3D/
├── blender/              # Source of truth — campus 3D models originate here
├── UnityWebGL/           # WebGL build with Blender campus model (Game & Explore modes)
├── data/                 # Standard JSON datasets (rooms, departments, faculty, navigation)
├── database/scripts/     # Data import and utility scripts
├── docs/                 # Architecture & system design documentation
└── web-platform/         # Next.js 15 production web application
```

## 3D Engine & Asset Pipeline

```
Blender Campus Model → Unity (Physics, Colliders, Player Controller, Cameras) → Unity WebGL → Next.js Web Platform
```

- **Explore Mode:** Cinematic 3D camera exploration of the college campus.
- **Game Mode:** Third-person playable character navigation with physics, collision detection, and jumping.
- **Campus Directory:** Live searchable database of rooms, departments, and faculty with entrance-to-room pathfinding.

## Run the Complete Campus Guide

The complete experience runs together in the browser: the Next.js app serves the home page and directory, and also loads the included Unity WebGL build for Explore and Game modes. The campus directory/navigation data is bundled with the app as JSON. You do not need to separately launch Blender, the Unity Editor, or MongoDB for the standard local run.

```bash
git clone --recurse-submodules https://github.com/Chinmayjoshi2005/Campus-Guide-3D.git
cd Campus-Guide-3D/web-platform
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). From the home page, choose Explore, Game, or Directory. Keep the terminal running while using the app; press `Ctrl+C` to stop it.

The `web-platform` folder is a Git submodule, so clone with `--recurse-submodules`. The Unity WebGL files used by the app are already under `web-platform/public/unity`; they are served by the same local server, not launched as another application. Blender and Unity authoring projects are only needed to edit/rebuild campus assets. See [requirements.txt](requirements.txt) for the complete setup and production commands.

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · Framer Motion · Lucide Icons · Unity WebGL (Brotli Wasm)

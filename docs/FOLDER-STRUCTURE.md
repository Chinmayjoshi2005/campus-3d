# Folder Structure — Campus Guide 3D

Complete file inventory for `/Users/chinmayjoshi/Desktop/Campus Guide 3D/`

```
CampusGuide3D/
│
├── README.md                          # Project overview & quick start
├── .gitignore
├── .husky/
│   └── pre-commit                     # lint-staged hook
│
├── blender/
│   └── README.md                      # Blender → GLB export workflow (source of truth)
│
├── unity-prototype/
│   └── README.md                      # Unity reference (NOT deployment target)
│
├── docs/                              # Architecture & design (READ BEFORE CODING)
│   ├── README.md                      # Documentation index
│   ├── IMPLEMENTATION-BLUEPRINT.md    # ★ Master blueprint — start here
│   ├── DATA-ANALYSIS.md               # Faculty data.json analysis
│   ├── DATA-FLOW.md                   # End-to-end data flow diagrams
│   ├── FOLDER-STRUCTURE.md            # This file
│   ├── architecture.md                # System layers & module boundaries
│   ├── database-schema.md             # MongoDB collections & indexes
│   ├── state-management.md            # Zustand store architecture
│   ├── navigation-system.md           # Pathfinding & route visualization
│   ├── security.md                    # Auth, RBAC, validation
│   ├── rendering.md                   # R3F, cameras, physics
│   ├── api.md                         # REST & Server Actions
│   └── deployment.md                  # Vercel + MongoDB Atlas
│
├── data/                              # Seed & import datasets
│   ├── Faculty data.json              # ★ 242 timetable rows (Smartracker source)
│   ├── faculty-profiles.json          # 22 faculty profile records
│   ├── faculty.json                   # 9 normalized faculty with 3D positions
│   ├── faculty-raw-export.json        # Raw SQLite backup export
│   ├── rooms.json                     # 15 rooms with meshName bindings
│   ├── departments.json               # 6 departments
│   ├── navigation-nodes.json          # 9 navigation graph nodes
│   └── navigation-edges.json          # 8 navigation graph edges
│
├── database/
│   └── scripts/
│       ├── import-seed.ts             # MongoDB seed from data/*.json
│       └── create-indexes.ts          # MongoDB index creation
│
└── web-platform/                      # Next.js 15 production application
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── next-env.d.ts
    ├── postcss.config.mjs
    ├── eslint.config.mjs
    ├── .prettierrc
    ├── .gitignore
    ├── .env.example
    ├── vercel.json
    │
    ├── public/
    │   ├── models/
    │   │   └── campus.glb             # ★ Authoritative campus model (893KB)
    │   ├── textures/                  # (empty — populate from Blender)
    │   ├── audio/                     # (empty — ambient sounds)
    │   └── draco/                     # (empty — Draco WASM decoder)
    │
    └── src/
        ├── app/                       # Next.js App Router
        │   ├── layout.tsx
        │   ├── page.tsx               # Landing page
        │   ├── globals.css
        │   ├── campus/
        │   │   └── page.tsx           # 3D experience
        │   ├── login/
        │   │   └── page.tsx
        │   ├── admin/
        │   │   ├── layout.tsx
        │   │   ├── page.tsx           # Dashboard
        │   │   ├── faculty/
        │   │   │   └── page.tsx
        │   │   └── import/
        │   │       └── page.tsx
        │   └── api/
        │       ├── auth/[...nextauth]/route.ts
        │       ├── search/route.ts
        │       └── navigation/path/route.ts
        │
        ├── components/
        │   ├── 3d/
        │   │   ├── campus-canvas.tsx
        │   │   ├── campus-model.tsx
        │   │   ├── lighting-rig.tsx
        │   │   └── scene-loader.tsx
        │   ├── neo-brutal/
        │   │   ├── neo-button.tsx
        │   │   └── neo-card.tsx
        │   ├── ui/                    # (shadcn — to be added)
        │   └── layout/                # (shell components — to be added)
        │
        ├── features/
        │   ├── explore/
        │   │   ├── campus-experience.tsx
        │   │   ├── campus-world.tsx
        │   │   ├── cinematic-camera.tsx
        │   │   └── mode-switcher.tsx
        │   ├── game/
        │   │   └── game-player.tsx
        │   ├── search/
        │   │   └── search-panel.tsx
        │   ├── navigation/
        │   │   └── route-visualizer.tsx
        │   └── admin/                 # (CRUD panels — to be built)
        │
        ├── hooks/                     # (custom hooks — to be added)
        │
        ├── lib/
        │   ├── auth/
        │   │   ├── auth.config.ts
        │   │   └── session.ts
        │   ├── db/
        │   │   └── mongodb.ts
        │   ├── security/
        │   │   └── utils.ts
        │   ├── validation/
        │   │   └── schemas.ts
        │   ├── campus/
        │   │   └── room-mesh-map.ts
        │   ├── data/
        │   │   ├── seed-search.ts
        │   │   └── seed-navigation.ts
        │   ├── env.ts
        │   └── utils.ts
        │
        ├── services/
        │   ├── search.service.ts
        │   └── navigation.service.ts
        │
        ├── store/
        │   ├── index.ts
        │   ├── use-app-store.ts
        │   ├── use-world-store.ts
        │   ├── use-search-store.ts
        │   └── use-navigation-store.ts
        │
        ├── types/
        │   ├── index.ts
        │   ├── common.ts
        │   ├── faculty.ts
        │   ├── room.ts
        │   ├── department.ts
        │   ├── navigation.ts
        │   └── next-auth.d.ts
        │
        └── middleware.ts
```

## Layer Rules

| Directory | May Import From | Must NOT Import |
|-----------|----------------|-----------------|
| `components/3d/`, `features/explore/`, `features/game/` | `store/`, `types/`, `lib/campus/` | `services/`, `lib/db/` |
| `features/search/`, `features/navigation/` | `store/`, `services/`, `types/` | `components/3d/` |
| `services/` | `lib/`, `types/` | `store/`, `components/` |
| `app/api/` | `services/`, `lib/` | `store/`, `components/3d/` |
| `app/admin/` | `services/`, `lib/`, `components/` | `components/3d/` |

## External References (Not Copied)

| Asset | Location |
|-------|----------|
| Smartracker Django prototype | `~/Desktop/Smartracker-main/` |
| Unity prototype | `~/Documents/Unity project/Campus Guide/` |
| Unity campus GLB (alternate) | `~/Documents/Unity project/Campus Guide/Assets/Models/clg_model_v1.glb` |
| Unity WebGL build | `~/Desktop/CampusGuideWebBuild/` |

## File Count

| Category | Files |
|----------|-------|
| Documentation | 13 |
| Data JSON | 8 |
| Database scripts | 2 |
| Web platform source | ~55 |
| 3D assets | 1 (campus.glb) |
| **Total** | **~81** |

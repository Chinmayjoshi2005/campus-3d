# Campus Guide 3D — Implementation Blueprint

> **Status:** Architecture v1.0 — Approved for implementation  
> **Prerequisite:** Read this document fully before writing feature code.  
> **Data source:** `data/Faculty data.json` (242 timetable rows, 22 faculty)

---

## Table of Contents

1. [Product Summary](#1-product-summary)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Folder Structure](#4-folder-structure)
5. [Database Schema](#5-database-schema)
6. [Data Flow](#6-data-flow)
7. [State Management](#7-state-management)
8. [Security Model](#8-security-model)
9. [Rendering Architecture](#9-rendering-architecture)
10. [Navigation System](#10-navigation-system)
11. [API Design](#11-api-design)
12. [UI/UX Design System](#12-uiux-design-system)
13. [Data Import Strategy](#13-data-import-strategy)
14. [Implementation Phases](#14-implementation-phases)
15. [Deployment](#15-deployment)

---

## 1. Product Summary

**Campus Guide 3D** is a browser-based digital twin of the college campus.

### Two Modes — One World

| Mode | Purpose | Player | Camera | UI Style |
|------|---------|--------|--------|----------|
| **Explore** | Cinematic campus tour | Hidden | Spline cinematic | Minimal, premium |
| **Game** | Interactive navigation | ecctrl character | Third-person follow | Neo-brutal HUD |

### Core User Journeys

```
Search "Prof. Kamlesh Patidar"
  → View Location    (cinematic camera focus)
  → Explore Location (explore mode + highlight)
  → Navigate         (game mode + pathfinding route)
```

### Asset Authority

```
Blender (source of truth)
  → campus.glb (Draco, <5MB)
  → React Three Fiber
  → Vercel CDN
```

Unity prototype = reference only. Smartracker = legacy data source.

---

## 2. Technology Stack

| Layer | Technology | Non-negotiable |
|-------|-----------|----------------|
| Framework | Next.js 15 App Router | ✓ |
| Language | TypeScript | ✓ |
| Styling | Tailwind CSS + shadcn/ui | ✓ |
| Animation | Framer Motion | ✓ |
| 3D | React Three Fiber + Three.js + Drei | ✓ |
| Physics | Rapier (@react-three/rapier) | ✓ |
| Character | ecctrl | ✓ |
| State | Zustand | ✓ |
| Backend | Route Handlers + Server Actions | ✓ |
| Database | MongoDB Atlas | ✓ |
| Auth | NextAuth | ✓ |
| Validation | Zod | ✓ |
| Storage | Cloudinary | ✓ |
| Deploy | Vercel | ✓ |
| Quality | ESLint + Prettier + Husky | ✓ |

---

## 3. System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ PRESENTATION     app/ · components/ · neo-brutal/ · shadcn  │
├─────────────────────────────────────────────────────────────┤
│ APPLICATION      features/ · hooks/ · store/                 │
├─────────────────────────────────────────────────────────────┤
│ SERVICE          services/ (search, navigation, faculty)    │
├─────────────────────────────────────────────────────────────┤
│ DATA             lib/db/ · lib/validation/ · MongoDB       │
├─────────────────────────────────────────────────────────────┤
│ 3D ENGINE        components/3d/ · features/explore|game    │
│ (ISOLATED)       No imports from services or db             │
└─────────────────────────────────────────────────────────────┘
```

### Module Boundary Rules

1. **3D layer** communicates only via Zustand stores
2. **Services** are stateless — no React imports
3. **API routes** validate → authorize → delegate to services
4. **Server Actions** for admin form mutations only
5. **Single GLB** — no duplicate campus models

### Scene Graph (Single World)

```
<Canvas>                          ssr: false, dynamic import
  <CampusWorld mode={explore|game}>
    <LightingRig />               shared
    <CampusModel />               shared — ONE instance
    {explore && <CinematicCamera />}
    {explore && <HotspotManager />}
    {game && <Physics><EcctrlPlayer /></Physics>}
    {game && <RouteVisualizer />}
  </CampusWorld>
</Canvas>
```

---

## 4. Folder Structure

See [`FOLDER-STRUCTURE.md`](./FOLDER-STRUCTURE.md) for complete 81-file inventory.

```
CampusGuide3D/
├── blender/           # Source of truth
├── unity-prototype/   # Reference only
├── docs/              # This blueprint + 12 design docs
├── data/              # Faculty data.json + seed JSON
├── database/scripts/  # import-seed.ts, create-indexes.ts
└── web-platform/      # Next.js 15 app
    └── src/
        ├── app/           # Routes + API
        ├── components/    # UI + 3D primitives
        ├── features/      # Domain workflows
        ├── services/      # Business logic
        ├── store/         # Zustand
        ├── lib/           # DB, auth, validation
        └── types/         # TypeScript contracts
```

---

## 5. Database Schema

**Database:** `campusguide` on MongoDB Atlas

### Core Collections

| Collection | Key Fields | Indexes |
|------------|-----------|---------|
| `users` | email, role, passwordHash | email unique |
| `faculty` | name, department, roomNumber, position, status | text(name, dept), roomNumber |
| `rooms` | roomNumber, meshName, position, roomType, floor | roomNumber unique, meshName unique |
| `departments` | slug, name, position, color | slug unique, text(name) |
| `timetables` | facultyId, dayOfWeek, startTime, endTime, roomNumber | compound(facultyId, day, start) |
| `navigation_nodes` | nodeId, nodeType, position, roomNumber | nodeId unique |
| `navigation_edges` | fromNodeId, toNodeId, weight | compound unique |
| `notices` | title, content, type, isPublished | publishedAt |
| `documents` | title, fileUrl, category | — |
| `audit_logs` | userId, action, resource, timestamp | userId + timestamp |
| `analytics_events` | event, sessionId, payload | timestamp |

### Faculty Document (Target Shape)

```typescript
{
  _id: ObjectId,
  slug: "prof-kamlesh-patidar",
  name: "Prof. Kamlesh Patidar",
  department: "Computer Science",
  designation: "HOD - CSE",
  roomNumber: "C-205",
  floor: 1,
  position: { x: 8, y: 3, z: -4 },  // REQUIRED for 3D
  meshNames: ["room_205"],             // GLB binding
  status: "available" | "in_class" | "in_meeting" | "offline",
  contact: "7509108861",
  photoUrl: "https://res.cloudinary.com/...",
  createdAt: Date,
  updatedAt: Date
}
```

Full ERD: [`database-schema.md`](./database-schema.md)

---

## 6. Data Flow

See [`DATA-FLOW.md`](./DATA-FLOW.md) for sequence diagrams.

### Critical Paths

| Flow | Entry | Exit |
|------|-------|------|
| Search → 3D | `/api/search` | `useWorldStore.focusTarget()` |
| Search → Navigate | `/api/navigation/path` | `useNavigationStore.setRoute()` |
| Import | `data/Faculty data.json` | MongoDB via `import-seed.ts` |
| Asset | `blender/` | `public/models/campus.glb` |

---

## 7. State Management

**Library:** Zustand with domain-scoped stores

| Store | Responsibility |
|-------|---------------|
| `useAppStore` | mode (explore/game), sceneReady, activePanel |
| `useWorldStore` | 3D bridge: highlights, camera commands, focus targets |
| `useSearchStore` | query, results, selectedResult, recentSearches |
| `useNavigationStore` | origin, destination, activeRoute, waypoint index |
| `usePlayerStore` | position, spawn, sprint state |

### Bridge Pattern (Search → 3D)

```typescript
// features/search/search-panel.tsx
focusTarget({
  position: result.position,
  entityType: "faculty",
  entityId: result.id,
  meshNames: result.meshNames,
});

// features/explore/cinematic-camera.tsx
const cmd = useWorldStore(s => s.cameraCommand);
// animates camera toward cmd.target
```

Full spec: [`state-management.md`](./state-management.md)

---

## 8. Security Model

### Defense in Depth

```
Layer 1: Middleware        → route protection (/admin/*)
Layer 2: API guards        → requireRole("admin")
Layer 3: Server Actions    → requireAuth + Zod
Layer 4: DB scoping        → department filter for faculty role
Layer 5: Output filtering  → never expose passwordHash
```

### RBAC Roles

| Role | Access |
|------|--------|
| `visitor` | Search, explore, navigate (no auth) |
| `student` | + preferences |
| `faculty` | + own profile/status |
| `admin` | + CRUD, import, notices |
| `superadmin` | + users, audit logs |

### Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/auth/*` | 10/min/IP |
| `/api/search` | 60/min/IP |
| `/api/admin/*` | 30/min/user |
| Mutations | 20/min/user |

### Validation

Every input passes Zod schemas in `lib/validation/schemas.ts`.  
HTML content sanitized via `sanitize-html`.  
Uploads: MIME whitelist + 10MB max + Cloudinary.

Full spec: [`security.md`](./security.md)

---

## 9. Rendering Architecture

### Stack

| Component | Library |
|-----------|---------|
| Canvas | @react-three/fiber |
| Loaders | @react-three/drei (useGLTF, Environment) |
| Physics | @react-three/rapier |
| Character | ecctrl |
| Camera tween | @react-spring/three |

### Performance Budget

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 90 |
| Frame rate (desktop) | 60 fps |
| Frame rate (mobile) | 30 fps |
| GLB load (4G) | < 3s |
| Draw calls | < 200 |

### Optimization Checklist

- [ ] `dynamic(() => import('./CampusCanvas'), { ssr: false })`
- [ ] `useGLTF.preload('/models/campus.glb')`
- [ ] Draco decoder in `public/draco/`
- [ ] `dpr={[1, 1.5]}` on mobile
- [ ] `frameloop="demand"` in explore idle state
- [ ] Texture max 2048px

### Highlighting

```typescript
// Match mesh.name from GLB against highlightSet
scene.traverse(child => {
  if (child.isMesh && highlightSet.has(child.name)) {
    child.material.emissive.set('#ffe600');
  }
});
```

Full spec: [`rendering.md`](./rendering.md)

---

## 10. Navigation System

### Graph Model

```
NavigationNode ←→ NavigationEdge (weighted, bidirectional)
     ↓
  roomNumber (optional link to room)
  position { x, y, z }
```

### Algorithm

**Dijkstra** on sparse indoor graph (<500 nodes).  
Walking speed: 1.4 m/s for time estimation.  
Stair edges: weight × 1.5 vertical penalty.

### Resolution Chain

```
faculty_id → faculty.roomNumber → navNode(roomNumber)
           → Dijkstra(entrance, target)
           → PathWaypoint[] with 3D coords
           → RouteVisualizer (drei Line)
```

### Spawn Points

| Node | Position | Use |
|------|----------|-----|
| N-ENT-01 | (0, 0, 10) | Default player spawn |

Full spec: [`navigation-system.md`](./navigation-system.md)

---

## 11. API Design

### Public

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/search?q=&type=` | Unified search |
| POST | `/api/navigation/path` | Path generation |
| GET | `/api/faculty` | Faculty list |
| GET | `/api/rooms` | Room list |
| GET | `/api/departments` | Department list |
| GET | `/api/notices` | Published notices |

### Admin (RBAC)

| Method | Path | Purpose |
|--------|------|---------|
| CRUD | `/api/admin/faculty` | Faculty management |
| CRUD | `/api/admin/rooms` | Room management |
| POST | `/api/admin/import/json` | Bulk import |
| GET | `/api/admin/export/json` | Export |
| POST | `/api/upload` | Cloudinary upload |

### Response Envelope

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "...", "message": "..." } }
```

Full spec: [`api.md`](./api.md)

---

## 12. UI/UX Design System

### Hybrid Language

| Context | Style | Traits |
|---------|-------|--------|
| 3D world | Realistic architectural | Clean, immersive, modern |
| Explore UI | Cinematic minimal | Elegant, premium, low chrome |
| Functional UI | Neo-brutalism | Thick borders, hard shadows, bold type |

### Neo-Brutalism Applies To

- Search panel ✓
- Faculty cards
- Navigation HUD ✓
- Admin dashboard ✓
- Analytics
- Notifications
- Data panels

### Neo-Brutalism Does NOT Apply To

- Campus 3D model
- Explore mode cinematic overlays

### CSS Tokens (globals.css)

```css
--color-neo-yellow: #ffe600;
--color-neo-pink: #ff6b9d;
--color-neo-blue: #4ecdc4;
.neo-shadow { box-shadow: 4px 4px 0 0 #0a0a0a; }
.neo-border { border: 3px solid #0a0a0a; }
```

---

## 13. Data Import Strategy

### Source Files (in `data/`)

| File | Records | Role |
|------|---------|------|
| **`Faculty data.json`** | **242** | **Primary timetable import** |
| `faculty-profiles.json` | 22 | Profile enrichment |
| `rooms.json` | 15 | Room catalog + 3D positions |
| `departments.json` | 6 | Department catalog |
| `navigation-*.json` | 17 | Nav graph seed |

### Import Steps

```bash
# 1. Configure MongoDB
cp web-platform/.env.example web-platform/.env.local

# 2. Seed database
cd web-platform && npm run db:seed

# 3. Create indexes
npm run db:indexes
```

### Data Gaps (from analysis)

| Gap | Priority | Resolution |
|-----|----------|------------|
| 13 faculty missing 3D position | P0 | Admin coordinate tool |
| Room aliases (150, 221 → mesh) | P0 | Create `room-aliases.json` |
| Navigation graph incomplete | P0 | Admin node editor |
| Character GLB missing | P1 | Blender export |
| DIP wing not in GLB | P2 | Blender model update |

Full analysis: [`DATA-ANALYSIS.md`](./DATA-ANALYSIS.md)

---

## 14. Implementation Phases

### Phase 0 — Architecture ✅ (Current)

- [x] Complete architecture documentation
- [x] Folder structure scaffolded
- [x] Faculty data.json imported (242 rows)
- [x] Campus GLB placed (`public/models/campus.glb`)
- [x] Seed JSON datasets created
- [x] Database scripts written

### Phase 1 — Foundation (Week 1–2)

- [ ] `npm install` + verify build
- [ ] MongoDB Atlas connection
- [ ] Run `db:seed` + `db:indexes`
- [ ] Create `room-aliases.json` from timetable analysis
- [ ] Enrich all 22 faculty with 3D positions
- [ ] shadcn/ui component install
- [ ] Session provider wrapper

### Phase 2 — Core 3D (Week 2–3)

- [ ] Draco decoder setup
- [ ] Room mesh click detection (raycasting)
- [ ] Hotspot system for explore mode
- [ ] Cinematic scroll sequences
- [ ] Department/room highlight materials
- [ ] Character GLB + ecctrl animations
- [ ] Rapier trimesh colliders from collision mesh

### Phase 3 — Search & Navigation (Week 3–4)

- [ ] Full-text search with MongoDB
- [ ] View / Explore / Navigate actions (wired)
- [ ] Complete navigation graph (all floors)
- [ ] Waypoint proximity triggers
- [ ] Turn-by-turn instruction panel
- [ ] Timetable → live status engine

### Phase 4 — Admin Panel (Week 4–5)

- [ ] Faculty CRUD + photo upload (Cloudinary)
- [ ] Room CRUD + coordinate picker (3D click)
- [ ] Department management
- [ ] Notice/event management
- [ ] Navigation node editor
- [ ] JSON import/export UI
- [ ] Analytics dashboard

### Phase 5 — Production (Week 5–6)

- [ ] Lighthouse audit (target 90+)
- [ ] Mobile virtual joystick
- [ ] Rate limiting (Upstash Redis)
- [ ] Audit logging verification
- [ ] Vercel production deploy
- [ ] Custom domain + SSL
- [ ] Load testing

---

## 15. Deployment

| Component | Platform |
|-----------|----------|
| App | Vercel (region: bom1) |
| Database | MongoDB Atlas (M10+, ap-south-1) |
| Media | Cloudinary CDN |
| 3D assets | Vercel Edge CDN (1yr immutable cache) |

```bash
# Production deploy
vercel --prod
```

Full checklist: [`deployment.md`](./deployment.md)

---

## Approval Gate

Before writing feature code, confirm:

- [ ] Architecture layers understood
- [ ] Faculty data.json analyzed (242 rows, 22 faculty)
- [ ] Single GLB authority accepted
- [ ] Dual-mode single-world approach accepted
- [ ] MongoDB schema reviewed
- [ ] Security model reviewed
- [ ] Phase plan agreed

**Once approved → begin Phase 1 implementation.**

---

## Related Documents

| Doc | Topic |
|-----|-------|
| [DATA-ANALYSIS.md](./DATA-ANALYSIS.md) | Faculty data.json deep analysis |
| [DATA-FLOW.md](./DATA-FLOW.md) | Sequence & state diagrams |
| [FOLDER-STRUCTURE.md](./FOLDER-STRUCTURE.md) | Complete file inventory |
| [architecture.md](./architecture.md) | System layers |
| [database-schema.md](./database-schema.md) | MongoDB ERD |
| [security.md](./security.md) | Auth & RBAC |
| [rendering.md](./rendering.md) | 3D engine |
| [navigation-system.md](./navigation-system.md) | Pathfinding |
| [api.md](./api.md) | Endpoints |
| [deployment.md](./deployment.md) | Vercel setup |

# Data Flow Architecture — Campus Guide 3D

## 1. Asset Pipeline (Blender → Browser)

```mermaid
flowchart LR
    A[blender/campus.blend] -->|Draco GLB export| B[public/models/campus.glb]
    B -->|CDN cache 1yr| C[Vercel Edge]
    C -->|useGLTF preload| D[R3F CampusModel]
    D -->|mesh.name| E[room-mesh-map.ts]
    E -->|bind| F[MongoDB rooms.meshName]
```

**Rule:** Campus geometry changes ONLY in Blender. Never edit GLB directly.

---

## 2. Data Import Pipeline

```mermaid
flowchart TD
    A[Faculty data.json<br/>242 timetable rows] --> D[import-seed.ts]
    B[faculty-profiles.json<br/>22 profiles] --> D
    C[rooms.json + departments.json<br/>navigation-*.json] --> D
    E[room-aliases.json<br/>TO BE CREATED] --> D
    D -->|validate Zod| F{Valid?}
    F -->|No| G[Reject + log errors]
    F -->|Yes| H[MongoDB Atlas]
    H --> I[faculty collection]
    H --> J[timetables collection]
    H --> K[rooms collection]
    H --> L[navigation_nodes/edges]
```

### Faculty Position Resolution

```
faculty-profiles.cabin_number
    → CABIN_TO_MESH map
    → rooms.json position
    → faculty.position { x, y, z }

IF no cabin:
    → most frequent room in Faculty data.json
    → room-aliases.json
    → rooms.json position
```

---

## 3. Search Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as SearchPanel
    participant API as /api/search
    participant SVC as SearchService
    participant DB as MongoDB
    participant SEED as data/*.json fallback
    participant WS as useWorldStore

    U->>UI: types "Kamlesh"
    UI->>UI: debounce 300ms
    UI->>API: GET /api/search?q=Kamlesh
    API->>API: rate limit + Zod validate
    API->>SVC: search({ query, type })
    alt MongoDB available
        SVC->>DB: text/regex query
        DB-->>SVC: faculty + rooms + departments
    else MongoDB unavailable
        SVC->>SEED: searchSeedData()
        SEED-->>SVC: results from JSON
    end
    SVC-->>API: SearchResult[]
    API-->>UI: { success, data }
    UI->>UI: render result cards

    U->>UI: click "View Location"
    UI->>WS: focusTarget({ position, meshNames })
    WS->>WS: highlightMeshes + cameraCommand
    Note over WS: CinematicCamera animates
```

---

## 4. Navigation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as SearchPanel
    participant APP as useAppStore
    participant API as /api/navigation/path
    participant NAV as NavigationService
    participant NS as useNavigationStore
    participant PS as usePlayerStore
    participant RV as RouteVisualizer

    U->>UI: click "Navigate"
    UI->>APP: setMode('game')
    UI->>PS: setSpawnPoint(DEFAULT_SPAWN)
    UI->>API: POST { from: N-ENT-01, to: faculty_id }
    API->>NAV: generatePath()
    NAV->>NAV: resolve faculty → room → navNode
    NAV->>NAV: Dijkstra(start, end)
    NAV-->>API: NavigationRoute
    API-->>UI: path + instructions
    UI->>NS: setRoute() + startNavigation()
    NS->>RV: render route line in 3D
```

---

## 5. Dual Mode Interaction Flow

```mermaid
stateDiagram-v2
    [*] --> Explore: default /campus load
    Explore --> Game: setMode('game') / Navigate
    Game --> Explore: setMode('explore') / ModeSwitcher

    state Explore {
        [*] --> CinematicCamera
        CinematicCamera --> HotspotClick: user clicks room
        HotspotClick --> InfoCard: show context
        SearchFocus --> CinematicCamera: focusTarget()
    }

    state Game {
        [*] --> EcctrlPlayer
        EcctrlPlayer --> Physics: Rapier colliders
        EcctrlPlayer --> FollowCamera: third-person
        RouteActive --> RouteVisualizer: waypoints
    }

    note right of Explore
        No player visible
        Scroll/click interactions
        Premium cinematic UI
    end note

    note right of Game
        WASD + sprint + jump
        Collision + stairs
        Neo-brutal HUD
    end note
```

**Critical:** Both states share the same `<CampusModel />` instance. No page reload, no scene duplication.

---

## 6. Admin Data Flow

```mermaid
flowchart TD
    A[Admin Panel] -->|Server Action| B[Zod Validation]
    B --> C[requireRole admin]
    C --> D[Service Layer CRUD]
    D --> E[MongoDB Write]
    E --> F[audit_logs insert]
    F --> G[revalidatePath]
    
    H[JSON Upload] --> I[/api/admin/import/json]
    I --> B
    
    J[Coordinate Tool] -->|click in 3D admin view| K[Update room.position]
    K --> D
```

---

## 7. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant L as /login
    participant NA as NextAuth
    participant MW as middleware
    participant AD as /admin/*

    U->>L: email + password
    L->>NA: signIn(credentials)
    NA->>NA: bcrypt verify
    NA-->>L: JWT session (24h)
    U->>AD: access admin
    AD->>MW: check token.role
    alt role = admin|superadmin
        MW-->>AD: allow
    else
        MW-->>U: redirect /login
    end
```

---

## 8. Timetable → Live Status Flow

```mermaid
flowchart LR
    A[Faculty data.json] --> B[timetables collection]
    C[Current datetime] --> D[StatusEngine]
    B --> D
    D --> E{Active slot?}
    E -->|Yes| F[in_class + room]
    E -->|Has slots today| G[available]
    E -->|No slots| H[offline]
    F --> I[SearchResult.status]
    G --> I
    H --> I
```

---

## 9. Client State Flow (Zustand)

```
User Action
    ↓
Feature Component (search-panel, mode-switcher)
    ↓
Store Action (useWorldStore.focusTarget)
    ↓
3D Component subscribes (CinematicCamera, CampusModel)
    ↓
Visual update (highlight, camera move, route line)
```

**No prop drilling** across UI ↔ 3D boundary. Stores are the bridge.

---

## 10. Deployment Data Flow

```
git push → Vercel Build
    ├── Static: public/models/campus.glb → CDN (immutable)
    ├── SSR: app/page.tsx → Edge
    ├── API: app/api/* → Serverless Functions
    └── Env: MONGODB_URI, NEXTAUTH_SECRET → Vercel dashboard

MongoDB Atlas ← connection pool ← getDb() singleton
Cloudinary ← signed uploads ← /api/upload
```

# State Management Architecture

**Library:** Zustand  
**Pattern:** Domain-scoped stores with selector hooks  
**Server state:** React Server Components + Server Actions (no React Query for MVP)

## Store Topology

```
┌──────────────────────────────────────────────────────────┐
│                    useAppStore                            │
│  mode: 'explore' | 'game'                                │
│  isSceneReady: boolean                                   │
│  activePanel: string | null                              │
└────────────────────┬─────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┬──────────────────┐
     ▼               ▼               ▼                  ▼
useWorldStore  useSearchStore  useNavigationStore  useUIStore
```

## Stores

### `useAppStore` — Global Application State

```typescript
interface AppState {
  mode: InteractionMode;
  previousMode: InteractionMode | null;
  isSceneReady: boolean;
  isLoading: boolean;
  activePanel: 'search' | 'info' | 'navigation' | null;

  setMode: (mode: InteractionMode) => void;
  setSceneReady: (ready: boolean) => void;
  togglePanel: (panel: AppState['activePanel']) => void;
}
```

**Rules:**
- Mode transitions are atomic — `setMode` saves `previousMode`
- Never duplicate scene state here — only interaction mode

### `useWorldStore` — 3D World Bridge

```typescript
interface WorldState {
  campusModelLoaded: boolean;
  highlightedMeshNames: string[];
  focusedTarget: FocusTarget | null;
  cameraCommand: CameraCommand | null;
  hotspots: Hotspot[];

  setCampusLoaded: () => void;
  highlightMeshes: (names: string[]) => void;
  clearHighlights: () => void;
  focusTarget: (target: FocusTarget) => void;
  dispatchCamera: (cmd: CameraCommand) => void;
  clearCameraCommand: () => void;
}
```

**Isolation:** Consumed by 3D components and search/navigation features only.

### `useSearchStore` — Search UI State

```typescript
interface SearchState {
  query: string;
  results: SearchResult[];
  selectedResult: SearchResult | null;
  isSearching: boolean;
  recentSearches: string[];

  setQuery: (q: string) => void;
  setResults: (r: SearchResult[]) => void;
  selectResult: (r: SearchResult) => void;
  addRecentSearch: (q: string) => void;
}
```

Server-side search runs via API; store holds client presentation state.

### `useNavigationStore` — Pathfinding & Routes

```typescript
interface NavigationState {
  origin: NavPoint | null;
  destination: NavPoint | null;
  activeRoute: Route | null;
  isNavigating: boolean;
  currentWaypointIndex: number;
  instructions: string[];

  setDestination: (point: NavPoint) => void;
  setRoute: (route: Route) => void;
  startNavigation: () => void;
  stopNavigation: () => void;
  advanceWaypoint: () => void;
}
```

### `usePlayerStore` — Game Mode Player

```typescript
interface PlayerState {
  position: Vector3Tuple;
  rotation: number;
  isGrounded: boolean;
  isSprinting: boolean;
  spawnPoint: Vector3Tuple | null;

  setPosition: (pos: Vector3Tuple) => void;
  setSpawnPoint: (pos: Vector3Tuple) => void;
  reset: () => void;
}
```

Updated by ecctrl controller callbacks — read by navigation overlay.

### `useUIStore` — Transient UI

```typescript
interface UIState {
  toasts: Toast[];
  modals: Record<string, boolean>;
  sidebarOpen: boolean;

  showToast: (toast: ToastInput) => void;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
}
```

## Data Flow Patterns

### Search → View Location

```
User types query
  → debounced API call (/api/search)
  → useSearchStore.setResults()
  → User clicks "View Location"
  → useWorldStore.focusTarget({ position, meshNames })
  → CinematicCamera reads focusTarget, animates
```

### Search → Navigate

```
User clicks "Navigate"
  → useAppStore.setMode('game')
  → API /api/navigation/path
  → useNavigationStore.setRoute()
  → usePlayerStore.setSpawnPoint(entrance)
  → RouteVisualizer renders path in 3D
```

## Server vs Client State

| Data | Location | Refresh |
|------|----------|---------|
| Faculty list (admin) | RSC + Server Action | revalidatePath |
| Search results | API route (client fetch) | on demand |
| User session | NextAuth JWT | middleware |
| 3D world state | Zustand (client only) | — |
| Navigation graph | API + optional client cache | stale 5min |

## Performance

- Use **shallow selectors** — `useWorldStore(s => s.highlightedMeshNames)`
- Split stores to prevent unnecessary 3D re-renders
- `subscribeWithSelector` middleware for camera system
- Persist `recentSearches` to `localStorage` via zustand/persist

## Anti-Patterns (Forbidden)

- ❌ Storing MongoDB documents in Zustand
- ❌ Importing services inside 3D components
- ❌ Single monolithic store
- ❌ Mutating state outside store actions

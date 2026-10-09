# Navigation System Architecture

## Overview

Indoor navigation uses a **weighted directed graph** of navigation nodes. Pathfinding runs server-side (authoritative) and client-side (visualization).

## Graph Model

```
NavigationNode ──NavigationEdge──▶ NavigationNode
       │                                    │
       └──────── roomNumber (optional) ─────┘
```

### Node Types

| Type | Purpose | Floor Change |
|------|---------|--------------|
| `entrance` | Campus spawn points | — |
| `room` | Room doorway | — |
| `corridor` | Hallway waypoint | — |
| `junction` | Intersection | — |
| `stairs` | Staircase landing | Yes |
| `elevator` | Lift | Yes |

### Edge Weights

Default: **Euclidean 3D distance** between node positions.

```typescript
weight = √((x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²)
```

Stair edges include vertical penalty factor: `weight *= 1.5`

## Pathfinding Algorithm

**Primary:** Dijkstra (non-negative weights, sparse campus graph <500 nodes)

```typescript
function dijkstra(
  adjacency: Map<string, Array<{ to: string; weight: number }>>,
  startId: string,
  endId: string
): { path: string[]; distance: number } | null
```

**Future:** A* with floor heuristic for multi-building expansion.

## Resolution Pipeline

```
1. User selects destination (faculty/room/department)
2. Resolve destination → roomNumber → NavigationNode (type=room)
3. Resolve origin:
   - Game mode: nearest node to player position (spatial query)
   - Explore mode: default entrance node "N-ENT-01"
4. Run Dijkstra(start, end)
5. Return path with 3D coordinates + instructions
```

### Room → Node Mapping

```typescript
// Primary: explicit roomNumber on node
const node = await nodes.findOne({ roomNumber, nodeType: 'room' });

// Fallback: room document links to nearest corridor node
const fallback = await findNearestNode(room.position);
```

## API Contract

### `POST /api/navigation/path`

```json
{
  "from": { "type": "position", "x": 0, "y": 0, "z": 0 },
  "to": { "type": "faculty", "id": "faculty_001" }
}
```

Response:

```json
{
  "found": true,
  "path": [
    { "nodeId": "N-GF-01", "position": { "x": 0, "y": 0, "z": 0 }, "floor": 0, "type": "entrance" }
  ],
  "totalDistance": 42.5,
  "estimatedTimeSeconds": 30,
  "floorChanges": 1,
  "instructions": ["Start at Main Entrance", "Take stairs up to 1st Floor", "Arrive at C-205"]
}
```

## 3D Visualization

### Route Line

`RouteVisualizer` component renders:
- **Tube geometry** along waypoints (drei `<Line>`)
- **Pulsing destination marker** at final node
- **Floor transition indicators** at stair nodes

### Game Mode Guidance

- Waypoint proximity trigger (1.5m radius) advances `currentWaypointIndex`
- On-screen instruction panel shows next turn
- Optional minimap overlay (future)

## Spawn Points

| Node ID | Location | Use |
|---------|----------|-----|
| `N-ENT-01` | Main entrance | Default player spawn |
| `N-ENT-02` | Side entrance | Alternate |

Spawn triggered when user selects "Navigate" from search.

## Admin: Node Management

Admin panel provides:
- Visual node placement (click in 3D admin view)
- Edge creation between selected nodes
- Auto-weight calculation
- Graph validation (orphan detection, disconnected components)
- JSON import/export

## Campus Boundary Enforcement

Game mode uses Rapier **static trimesh colliders** from campus GLB + invisible boundary box matching `building.bounds`.

Player cannot exit bounds — ecctrl blocked by colliders.

## Performance

- Graph cached in memory (server) with 5-minute TTL
- Client receives only active route (not full graph)
- Spatial nearest-node query uses floor-filtered subset

## Seeding Strategy

Phase 1: Manual node placement via admin for critical paths (entrance → major departments)

Phase 2: Blender empties exported as node positions in GLB metadata

Phase 3: Automated corridor graph generation from floor plans

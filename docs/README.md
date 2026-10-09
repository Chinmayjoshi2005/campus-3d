# Architecture Documentation

> **Start here:** [`IMPLEMENTATION-BLUEPRINT.md`](./IMPLEMENTATION-BLUEPRINT.md)

## Document Index

| # | Document | Description |
|---|----------|-------------|
| ★ | [**IMPLEMENTATION-BLUEPRINT.md**](./IMPLEMENTATION-BLUEPRINT.md) | **Master blueprint — read before coding** |
| | [DATA-ANALYSIS.md](./DATA-ANALYSIS.md) | Faculty data.json analysis (242 rows, 22 faculty) |
| | [DATA-FLOW.md](./DATA-FLOW.md) | End-to-end data flow with diagrams |
| | [FOLDER-STRUCTURE.md](./FOLDER-STRUCTURE.md) | Complete 81-file inventory |
| | [architecture.md](./architecture.md) | System layers & module boundaries |
| | [database-schema.md](./database-schema.md) | MongoDB collections, indexes, ERD |
| | [state-management.md](./state-management.md) | Zustand stores & bridge pattern |
| | [navigation-system.md](./navigation-system.md) | Graph model, Dijkstra, 3D routes |
| | [security.md](./security.md) | NextAuth, RBAC, Zod, rate limiting |
| | [rendering.md](./rendering.md) | R3F scene graph, cameras, Rapier, ecctrl |
| | [api.md](./api.md) | REST endpoints & Server Actions |
| | [deployment.md](./deployment.md) | Vercel + MongoDB Atlas + CI/CD |

## Data Files

| File | Records |
|------|---------|
| `data/Faculty data.json` | 242 timetable rows |
| `data/faculty-profiles.json` | 22 faculty profiles |
| `data/faculty.json` | 9 with 3D coordinates |
| `data/rooms.json` | 15 rooms |
| `data/departments.json` | 6 departments |

## Status

**Phase 0 complete** — Architecture approved. Awaiting Phase 1 implementation.

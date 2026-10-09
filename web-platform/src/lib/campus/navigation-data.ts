import type { FloorConfig, Destination, NavNode, NavEdge, Room, Department, FacultyMember } from "./types";
import { CampusPathfinder } from "./pathfinder";

import roomsJson from "./data/rooms.json";
import departmentsJson from "./data/departments.json";
import facultyJson from "./data/faculty.json";
import nodesJson from "./data/navigation-nodes.json";
import edgesJson from "./data/navigation-edges.json";

export const ROOMS: Room[] = roomsJson as Room[];
export const DEPARTMENTS: Department[] = departmentsJson as Department[];
export const FACULTY: FacultyMember[] = facultyJson as FacultyMember[];

export const FLOORS: FloorConfig[] = [
  { id: 0, label: "Ground Floor", spawnPoint: [0, 0.1, 10] },
  { id: 1, label: "First Floor", spawnPoint: [0, 3.1, 8] },
  { id: 2, label: "Second Floor", spawnPoint: [0, 6.1, 8] },
  { id: 3, label: "Third Floor", spawnPoint: [0, 9.1, 8] },
  { id: 4, label: "Fourth Floor", spawnPoint: [0, 12.1, 8] },
];

interface RawNodeItem {
  nodeId: string;
  name: string;
  floor?: number;
  position?: { x?: number; y?: number; z?: number };
  nodeType?: string;
}

interface RawEdgeItem {
  fromNodeId: string;
  toNodeId: string;
  weight?: number;
  bidirectional?: boolean;
}

export const NAV_NODES: NavNode[] = (nodesJson as RawNodeItem[]).map((n) => ({
  id: n.nodeId,
  name: n.name,
  floorId: n.floor ?? 0,
  position: [n.position?.x ?? 0, n.position?.y ?? 0, n.position?.z ?? 0] as [number, number, number],
  nodeType: n.nodeType,
}));

export const NAV_EDGES: NavEdge[] = (edgesJson as RawEdgeItem[]).map((e) => ({
  from: e.fromNodeId,
  to: e.toNodeId,
  weight: e.weight ?? 5,
  bidirectional: e.bidirectional ?? true,
}));

export const campusPathfinder = new CampusPathfinder(NAV_NODES, NAV_EDGES);

/**
 * Standard destinations assembled directly from standard datasets
 * (Rooms, Departments, and Faculty offices).
 */
export const DESTINATIONS: Destination[] = [
  ...ROOMS.map((room) => ({
    id: `room_${room.roomNumber}`,
    name: room.name,
    type: (room.roomType === "office" ? "office" : room.roomType === "classroom" ? "room" : "facility") as Destination["type"],
    floorId: room.floor,
    meshHint: room.meshName,
    description: `Floor ${room.floor === 0 ? "Ground" : room.floor}${room.wing ? `, Wing ${room.wing}` : ""} • ${room.roomType.toUpperCase()}`,
    nodeId: `N-RM-${room.roomNumber}`,
    roomNumber: room.roomNumber,
  })),
  ...DEPARTMENTS.map((dept) => ({
    id: `dept_${dept.slug}`,
    name: dept.name,
    type: "department" as const,
    floorId: dept.floor,
    description: `${dept.shortName} Department — Floor ${dept.floor}`,
    nodeId: "N-1F-01",
    department: dept.shortName,
  })),
  ...FACULTY.map((f) => ({
    id: f.id,
    name: `${f.name} (${f.designation})`,
    type: "faculty" as const,
    floorId: f.floor,
    description: `${f.department} • Room ${f.room} • ${f.specialization || f.qualification}`,
    nodeId: `N-RM-${f.room}`,
    roomNumber: f.room,
    department: f.department,
    contact: f.contact,
  })),
];

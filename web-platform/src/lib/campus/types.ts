export type InteractionMode = "explore" | "game" | "directory" | "outside" | "indoor";

export interface FloorConfig {
  id: number;
  label: string;
  elevationRange?: [number, number];
  navBounds?: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  spawnPoint?: [number, number, number];
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Room {
  roomNumber: string;
  meshName: string;
  name: string;
  roomType: "classroom" | "office" | "library" | "canteen" | "auditorium" | "lab" | "facility" | string;
  floor: number;
  position: Position3D;
  wing?: string;
}

export interface Department {
  slug: string;
  name: string;
  shortName: string;
  floor: number;
  position: Position3D;
  color: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  department: string;
  departmentSlug: string;
  designation: string;
  qualification: string;
  specialization?: string;
  room: string;
  floor: number;
  position: Position3D;
  contact?: string;
  bio?: string;
  status?: "available" | "busy" | "away" | string;
}

export interface Destination {
  id: string;
  name: string;
  type: "room" | "department" | "office" | "facility" | "faculty";
  floorId: number;
  meshHint?: string;
  description?: string;
  nodeId?: string;
  roomNumber?: string;
  department?: string;
  contact?: string;
}

export interface NavNode {
  id: string;
  name: string;
  floorId: number;
  position: [number, number, number];
  nodeType?: string;
}

export interface NavEdge {
  from: string;
  to: string;
  weight: number;
  bidirectional?: boolean;
}

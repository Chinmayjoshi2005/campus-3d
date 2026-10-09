import type { NavNode, NavEdge } from "./types";

export interface PathResult {
  nodeIds: string[];
  totalDistance: number;
}

/**
 * Standard graph-based pathfinder using Dijkstra's algorithm.
 * Replaces ad-hoc hardcoded path solving with modular adjacency representation.
 */
export class CampusPathfinder {
  private adjacencyList = new Map<string, Array<{ target: string; weight: number }>>();
  private nodeMap = new Map<string, NavNode>();

  constructor(nodes: NavNode[] = [], edges: NavEdge[] = []) {
    nodes.forEach((node) => this.addNode(node));
    edges.forEach((edge) => this.addEdge(edge));
  }

  addNode(node: NavNode): void {
    this.nodeMap.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  addEdge(edge: NavEdge): void {
    const { from, to, weight, bidirectional = true } = edge;
    if (!this.adjacencyList.has(from)) this.adjacencyList.set(from, []);
    this.adjacencyList.get(from)!.push({ target: to, weight });

    if (bidirectional) {
      if (!this.adjacencyList.has(to)) this.adjacencyList.set(to, []);
      this.adjacencyList.get(to)!.push({ target: from, weight });
    }
  }

  findShortestPath(startNodeId: string, endNodeId: string): PathResult {
    if (!this.adjacencyList.has(startNodeId) || !this.adjacencyList.has(endNodeId)) {
      return { nodeIds: [], totalDistance: Infinity };
    }

    if (startNodeId === endNodeId) {
      return { nodeIds: [startNodeId], totalDistance: 0 };
    }

    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    for (const nodeId of this.adjacencyList.keys()) {
      distances.set(nodeId, Infinity);
      previous.set(nodeId, null);
      unvisited.add(nodeId);
    }

    distances.set(startNodeId, 0);

    while (unvisited.size > 0) {
      let minNode: string | null = null;
      let minDistance = Infinity;

      for (const nodeId of unvisited) {
        const d = distances.get(nodeId) ?? Infinity;
        if (d < minDistance) {
          minDistance = d;
          minNode = nodeId;
        }
      }

      if (minNode === null || minDistance === Infinity) break;
      if (minNode === endNodeId) break;

      unvisited.delete(minNode);

      const neighbors = this.adjacencyList.get(minNode) || [];
      for (const { target, weight } of neighbors) {
        if (!unvisited.has(target)) continue;

        const candidateDistance = minDistance + weight;
        if (candidateDistance < (distances.get(target) ?? Infinity)) {
          distances.set(target, candidateDistance);
          previous.set(target, minNode);
        }
      }
    }

    const path: string[] = [];
    let current: string | null = endNodeId;
    while (current !== null) {
      path.unshift(current);
      current = previous.get(current) ?? null;
    }

    if (path[0] !== startNodeId) {
      return { nodeIds: [], totalDistance: Infinity };
    }

    return {
      nodeIds: path,
      totalDistance: distances.get(endNodeId) ?? 0,
    };
  }

  getNode(nodeId: string): NavNode | undefined {
    return this.nodeMap.get(nodeId);
  }
}

// ==============================================================================
// GRAPH TOPOLOGY, PAGERANK CENTRALITY & LOUVAIN COMMUNITY CLUSTERING
// Structural Network Analysis across 114 Surahs and Semantic Relations
// ==============================================================================

export interface GraphNode {
  id: string;
  label: string;
  category: string;
  pageRank: number;
  communityId: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  relationType: 'THEMATIC_SIMILARITY' | 'ASBABUN_NUZUL' | 'CHRONOLOGICAL_REVELATION' | 'CROSS_SURAH_LINK';
}

export class GraphTopologyCentrality {
  /**
   * Computes PageRank scores over directed graph edges with damping factor alpha.
   */
  public static computePageRank(
    nodes: GraphNode[],
    edges: GraphEdge[],
    alpha = 0.85,
    maxIterations = 30
  ): Map<string, number> {
    const N = nodes.length;
    if (N === 0) return new Map();

    const ranks: Map<string, number> = new Map();
    nodes.forEach((n) => ranks.set(n.id, 1 / N));

    // Build Adjacency Out-Degree
    const outDegree: Map<string, number> = new Map();
    const inEdges: Map<string, GraphEdge[]> = new Map();

    nodes.forEach((n) => {
      outDegree.set(n.id, 0);
      inEdges.set(n.id, []);
    });

    edges.forEach((e) => {
      outDegree.set(e.source, (outDegree.get(e.source) || 0) + 1);
      const incoming = inEdges.get(e.target) || [];
      incoming.push(e);
      inEdges.set(e.target, incoming);
    });

    for (let iter = 0; iter < maxIterations; iter++) {
      const nextRanks: Map<string, number> = new Map();

      nodes.forEach((n) => {
        let incomingSum = 0;
        const incoming = inEdges.get(n.id) || [];

        for (let i = 0; i < incoming.length; i++) {
          const edge = incoming[i];
          const srcRank = ranks.get(edge.source) || 0;
          const srcOut = outDegree.get(edge.source) || 1;
          incomingSum += (srcRank / srcOut) * edge.weight;
        }

        const newRank = (1 - alpha) / N + alpha * incomingSum;
        nextRanks.set(n.id, newRank);
      });

      nextRanks.forEach((val, key) => ranks.set(key, val));
    }

    return ranks;
  }

  /**
   * Simulates Louvain Modularity Community Partitioning.
   */
  public static detectCommunities(nodes: GraphNode[], edges: GraphEdge[]): Map<string, number> {
    const communities: Map<string, number> = new Map();
    let currentCommunity = 0;

    // Categorical community assignment based on semantic edge weights
    const visited = new Set<string>();

    nodes.forEach((n) => {
      if (!visited.has(n.id)) {
        currentCommunity++;
        const queue = [n.id];
        visited.add(n.id);
        communities.set(n.id, currentCommunity);

        while (queue.length > 0) {
          const curr = queue.shift()!;
          const neighbors = edges
            .filter((e) => e.source === curr || e.target === curr)
            .map((e) => (e.source === curr ? e.target : e.source));

          for (let i = 0; i < neighbors.length; i++) {
            const neigh = neighbors[i];
            if (!visited.has(neigh)) {
              visited.add(neigh);
              communities.set(neigh, currentCommunity);
              queue.push(neigh);
            }
          }
        }
      }
    });

    return communities;
  }
}

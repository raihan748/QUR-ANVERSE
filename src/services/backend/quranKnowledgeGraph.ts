// ==============================================================================
// SEMANTIC QURANIC KNOWLEDGE GRAPH ENGINE
// Graph Topology of Roots (Juzur), Thematic Clusters, & Inter-Ayah Cross-References
// ==============================================================================

import { KnowledgeGraphNode, KnowledgeGraphEdge } from '../../types';
import { SURAHS_DIRECTORY } from '../../data/quranData';

export class QuranKnowledgeGraph {
  private nodes: Map<string, KnowledgeGraphNode> = new Map();
  private edges: KnowledgeGraphEdge[] = [];
  private adjacencyList: Map<string, { targetId: string; weight: number; rel: string }[]> = new Map();

  constructor() {
    this.buildCoreGraph();
  }

  private addNode(node: KnowledgeGraphNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  private addEdge(
    sourceNodeId: string,
    targetNodeId: string,
    relationship: KnowledgeGraphEdge['relationship'],
    weight = 1.0
  ): void {
    const id = `edge_${sourceNodeId}_${targetNodeId}_${relationship}`;
    this.edges.push({ id, sourceNodeId, targetNodeId, relationship, weight });

    if (!this.adjacencyList.has(sourceNodeId)) this.adjacencyList.set(sourceNodeId, []);
    if (!this.adjacencyList.has(targetNodeId)) this.adjacencyList.set(targetNodeId, []);

    this.adjacencyList.get(sourceNodeId)!.push({ targetId: targetNodeId, weight, rel: relationship });
    this.adjacencyList.get(targetNodeId)!.push({ targetId: sourceNodeId, weight, rel: relationship });
  }

  private buildCoreGraph(): void {
    // 1. Thematic Domain Nodes
    const themes = [
      { id: 'theme_tawhid', label: 'Tawhid & Aqidah', desc: 'Keesaan Allah, Asmaul Husna, Sifat-Sifat Ketuhanan' },
      { id: 'theme_qiyamah', label: 'Hari Kiamat & Eskatologi', desc: 'Hari Akhir, Surga, Neraka, Barzakh, Hisab' },
      { id: 'theme_qisas', label: 'Kisah Para Nabi & Umat Terdahulu', desc: 'Nabi Ibrahim, Musa, Isa, Nuh, Kaum Tsamud' },
      { id: 'theme_ahkam', label: 'Hukum Syariat & Fiqh', desc: 'Shalat, Zakat, Puasa, Haji, Waris, Muamalah' },
      { id: 'theme_akhlaq', label: 'Tazkiyatun Nafs & Akhlaq', desc: 'Sabar, Syukur, Ikhlas, Birrul Walidain' }
    ];

    themes.forEach((t) => {
      this.addNode({ id: t.id, type: 'theme', label: t.label, properties: { desc: t.desc } });
    });

    // 2. Arabic Root Words (Juzur - جذور)
    const roots = [
      { id: 'root_r-h-m', label: 'ر-ح-م (R-H-M)', meaning: 'Kasih Sayang / Rahmat' },
      { id: 'root_a-l-m', label: 'ع-ل-م (A-L-M)', meaning: 'Ilmu / Mengetahui' },
      { id: 'root_h-m-d', label: 'ح-م-د (H-M-D)', meaning: 'Pujian / Bersyukur' },
      { id: 'root_m-l-k', label: 'م-ل-ك (M-L-K)', meaning: 'Kerajaan / Kepemilikan' },
      { id: 'root_k-f-r', label: 'ك-ف-ر (K-F-R)', meaning: 'Menutup Kebenaran / Kafir' },
      { id: 'root_a-m-n', label: 'أ-م-ن (A-M-N)', meaning: 'Keimanan / Aman' },
      { id: 'root_q-w-l', label: 'ق-و-ل (Q-W-L)', meaning: 'Perkataan / Firman' }
    ];

    roots.forEach((r) => {
      this.addNode({ id: r.id, type: 'root_word', label: r.label, properties: { meaning: r.meaning } });
    });

    // 3. Surah Nodes
    SURAHS_DIRECTORY.slice(0, 30).forEach((s) => {
      const sId = `surah_${s.number}`;
      this.addNode({
        id: sId,
        type: 'surah',
        label: `QS. ${s.latinName} (${s.number})`,
        properties: {
          number: s.number,
          ayahCount: s.ayahCount,
          revelationPlace: s.revelationPlace,
          juzStart: s.juzStart
        }
      });

      // Connect to Thematic Nodes based on Surah characteristic
      if ([1, 112, 113, 114].includes(s.number)) {
        this.addEdge(sId, 'theme_tawhid', 'THEMATIC_SIMILARITY', 0.95);
      }
      if ([67, 75, 77, 78, 81, 82, 84, 99, 101].includes(s.number)) {
        this.addEdge(sId, 'theme_qiyamah', 'THEMATIC_SIMILARITY', 0.98);
      }
      if ([1, 67, 55].includes(s.number)) {
        this.addEdge(sId, 'root_r-h-m', 'DERIVED_FROM_ROOT', 0.9);
        this.addEdge(sId, 'root_m-l-k', 'DERIVED_FROM_ROOT', 0.9);
      }
      if ([109, 112].includes(s.number)) {
        this.addEdge(sId, 'root_k-f-r', 'DERIVED_FROM_ROOT', 0.85);
        this.addEdge(sId, 'root_a-m-n', 'DERIVED_FROM_ROOT', 0.85);
      }
    });
  }

  /**
   * Breadth-First Search (BFS) for discovering shortest semantic semantic connection path
   */
  public findSemanticPath(startNodeId: string, endNodeId: string): string[] {
    if (!this.nodes.has(startNodeId) || !this.nodes.has(endNodeId)) return [];
    if (startNodeId === endNodeId) return [startNodeId];

    const queue: { currentId: string; path: string[] }[] = [{ currentId: startNodeId, path: [startNodeId] }];
    const visited = new Set<string>([startNodeId]);

    while (queue.length > 0) {
      const { currentId, path } = queue.shift()!;
      const neighbors = this.adjacencyList.get(currentId) || [];

      for (const neighbor of neighbors) {
        if (neighbor.targetId === endNodeId) {
          return [...path, neighbor.targetId];
        }

        if (!visited.has(neighbor.targetId)) {
          visited.add(neighbor.targetId);
          queue.push({
            currentId: neighbor.targetId,
            path: [...path, neighbor.targetId]
          });
        }
      }
    }

    return [];
  }

  public getGraphMetrics(): { totalNodes: number; totalEdges: number; density: number } {
    const N = this.nodes.size;
    const E = this.edges.length;
    const maxEdges = N > 1 ? (N * (N - 1)) / 2 : 1;
    const density = Math.min(1.0, Math.max(0, Number((E / maxEdges).toFixed(4))));

    return {
      totalNodes: N,
      totalEdges: E,
      density
    };
  }

  public getAllNodes(): KnowledgeGraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): KnowledgeGraphEdge[] {
    return this.edges;
  }
}

export const quranKnowledgeGraph = new QuranKnowledgeGraph();

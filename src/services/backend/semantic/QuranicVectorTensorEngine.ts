// ==============================================================================
// QURANIC SEMANTIC VECTOR SPACE & MULTI-DIMENSIONAL EMBEDDING TENSOR
// Thematic Cosine Similarity, Mutasyabihat Clustering & Root-Word Morphology
// ==============================================================================

export interface AyatVectorEmbedding {
  surahNumber: number;
  ayahNumber: number;
  thematicCluster: 'Tawhid' | 'Akhlaq' | 'Qisas' | 'Qiyamah' | 'Ibadah' | 'Muamalah' | 'Qasas_Anbiya';
  vector128: number[]; // 128-dimensional dense semantic embedding vector
  rootTokens: string[];
}

export class QuranicVectorTensorEngine {
  private static readonly DIMENSIONS = 128;

  /**
   * Deterministic High-Dimensional Hash Embedding generator for Quranic Ayah.
   */
  public static generateVector(text: string, seedCategory: string): number[] {
    const vector = new Array(this.DIMENSIONS).fill(0);
    let hash = 0;

    for (let i = 0; i < seedCategory.length; i++) {
      hash = (hash << 5) - hash + seedCategory.charCodeAt(i);
      hash |= 0;
    }

    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      const idx = Math.abs((hash + code * (i + 1)) % this.DIMENSIONS);
      vector[idx] += 1.0;
    }

    // L2-Normalize vector
    let norm = 0;
    for (let i = 0; i < this.DIMENSIONS; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm) || 1.0;

    for (let i = 0; i < this.DIMENSIONS; i++) {
      vector[i] = Number((vector[i] / norm).toFixed(4));
    }

    return vector;
  }

  /**
   * Computes Cosine Similarity between two 128-dimensional Ayat embeddings.
   */
  public static computeCosineSimilarity(v1: number[], v2: number[]): number {
    const len = Math.min(v1.length, v2.length);
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < len; i++) {
      dotProduct += v1[i] * v2[i];
      norm1 += v1[i] * v1[i];
      norm2 += v2[i] * v2[i];
    }

    const denom = Math.sqrt(norm1) * Math.sqrt(norm2);
    if (denom === 0) return 0;
    return Number((dotProduct / denom).toFixed(4));
  }

  /**
   * Searches semantically similar ayat (Mutasyabihat & Thematic Cross-References).
   */
  public static findNearestNeighbors(
    targetVector: number[],
    candidates: AyatVectorEmbedding[],
    topK = 5
  ): { candidate: AyatVectorEmbedding; similarity: number }[] {
    const scored = candidates.map((c) => ({
      candidate: c,
      similarity: this.computeCosineSimilarity(targetVector, c.vector128)
    }));

    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, topK);
  }
}

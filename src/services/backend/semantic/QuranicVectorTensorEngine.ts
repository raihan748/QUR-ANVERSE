// ==============================================================================
// QURANIC SEMANTIC VECTOR SPACE & MULTI-DIMENSIONAL EMBEDDING TENSOR (v3.0)
// Thematic Cosine Similarity, Mutasyabihat Clustering & Multi-Field Tensor IR
// ==============================================================================

export interface AyatVectorEmbedding {
  surahNumber: number;
  ayahNumber: number;
  thematicCluster: 'Tawhid' | 'Akhlaq' | 'Qisas' | 'Qiyamah' | 'Ibadah' | 'Muamalah' | 'Qasas_Anbiya' | 'General';
  vector128: number[]; // 128-dimensional dense semantic embedding vector
  rootTokens: string[];
}

export interface MultiFieldVectorInput {
  arabicText: string;
  translation?: string;
  surahName?: string;
  thematicCluster?: string;
}

export class QuranicVectorTensorEngine {
  public static readonly DIMENSIONS = 128;
  private static readonly VECTOR_CACHE = new Map<string, number[]>();
  private static readonly MAX_CACHE_SIZE = 2048;

  /**
   * Deterministic High-Dimensional Hash Embedding generator for Quranic Ayah.
   */
  public static generateVector(text: string, seedCategory: string): number[] {
    const cacheKey = `${seedCategory}::${text.slice(0, 120)}`;
    const cached = this.VECTOR_CACHE.get(cacheKey);
    if (cached) return cached;

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

    const result = new Array(this.DIMENSIONS);
    for (let i = 0; i < this.DIMENSIONS; i++) {
      result[i] = Number((vector[i] / norm).toFixed(4));
    }

    if (this.VECTOR_CACHE.size >= this.MAX_CACHE_SIZE) {
      const first = this.VECTOR_CACHE.keys().next().value;
      if (first !== undefined) this.VECTOR_CACHE.delete(first);
    }
    this.VECTOR_CACHE.set(cacheKey, result);

    return result;
  }

  /**
   * Generates a multi-field weighted 128D tensor projection (Arabic, Translation, Surah, Theme).
   */
  public static generateMultiFieldVector(input: MultiFieldVectorInput): number[] {
    const arabicVec = this.generateVector(input.arabicText || '', input.thematicCluster || 'General');
    const transVec = input.translation ? this.generateVector(input.translation, 'Translation') : null;
    const surahVec = input.surahName ? this.generateVector(input.surahName, 'SurahName') : null;

    const combined = new Float32Array(this.DIMENSIONS);

    const wArabic = 0.50;
    const wTrans = transVec ? 0.35 : 0.0;
    const wSurah = surahVec ? 0.15 : 0.0;
    const totalW = wArabic + wTrans + wSurah;

    for (let i = 0; i < this.DIMENSIONS; i++) {
      combined[i] = (arabicVec[i] * wArabic +
        (transVec ? transVec[i] * wTrans : 0) +
        (surahVec ? surahVec[i] * wSurah : 0)) / totalW;
    }

    // L2-Normalize
    let sumSq = 0;
    for (let i = 0; i < this.DIMENSIONS; i++) {
      sumSq += combined[i] * combined[i];
    }
    const norm = Math.sqrt(sumSq) || 1.0;

    const result: number[] = new Array(this.DIMENSIONS);
    for (let i = 0; i < this.DIMENSIONS; i++) {
      result[i] = Number((combined[i] / norm).toFixed(4));
    }

    return result;
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
   * Accelerated Batch Cosine Similarity computation using Float32Array
   */
  public static computeBatchCosineSimilarity(targetVector: number[], candidateVectors: number[][]): Float32Array {
    const scores = new Float32Array(candidateVectors.length);
    for (let i = 0; i < candidateVectors.length; i++) {
      scores[i] = this.computeCosineSimilarity(targetVector, candidateVectors[i]);
    }
    return scores;
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

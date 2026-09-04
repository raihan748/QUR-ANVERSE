// ==============================================================================
// ADVANCED OFFLINE QURAN RESEARCH & THEMATIC SEMANTIC ENGINE
// High-Speed BM25 Lexical + 128D Dense Vector Tensor + Knowledge Graph RRF
// ==============================================================================

import { SURAH_LIST } from '../data/quranData';
import madinahPagesAyahsData from '../data/madinahPagesAyahs.json';
import { QuranicVectorTensorEngine } from './backend/semantic/QuranicVectorTensorEngine';
import { quranKnowledgeGraph } from './backend/quranKnowledgeGraph';

export type ThematicDomain = 
  | 'Tawhid' 
  | 'Akhlaq' 
  | 'Qisas' 
  | 'Qiyamah' 
  | 'Ahkam' 
  | 'Ibadah' 
  | 'Muamalah'
  | 'General';

export interface QuranResearchHit {
  surahNumber: number;
  surahName: string;
  surahLatin: string;
  ayahNumber: number;
  pageNumber: number;
  arabicText: string;
  transliteration: string;
  translation: string;
  thematicCluster: ThematicDomain;
  bm25Score: number;
  cosineSimilarity: number;
  rrfScore: number;
  matchedKeywords: string[];
  semanticConcepts: string[];
}

export interface ResearchQueryOptions {
  topK?: number;
  thematicFilter?: ThematicDomain;
  minSimilarity?: number;
}

interface IndexedAyahDoc {
  surahNumber: number;
  surahName: string;
  surahLatin: string;
  ayahNumber: number;
  pageNumber: number;
  arabicText: string;
  transliteration: string;
  translation: string;
  thematicCluster: ThematicDomain;
  tokens: string[];
  docLength: number;
  vector128: number[];
}

export class QuranResearchEngine {
  private static instance: QuranResearchEngine | null = null;
  private indexedDocs: IndexedAyahDoc[] = [];
  private invertedIndex: Map<string, number[]> = new Map(); // token -> docIndices
  private avgDocLength: number = 0;
  private totalDocs: number = 0;
  private isIndexed: boolean = false;

  // BM25 Hyperparameters (Standard Gold-Standard IR tuning)
  private readonly k1 = 1.2;
  private readonly b = 0.75;

  private constructor() {
    this.buildCorpusIndex();
  }

  public static getInstance(): QuranResearchEngine {
    if (!QuranResearchEngine.instance) {
      QuranResearchEngine.instance = new QuranResearchEngine();
    }
    return QuranResearchEngine.instance;
  }

  private determineThematicCluster(surahNum: number, text: string): ThematicDomain {
    const lower = text.toLowerCase();
    if (lower.includes('allah') || lower.includes('tuhan') || [1, 112, 113, 114].includes(surahNum)) return 'Tawhid';
    if (lower.includes('kiamat') || lower.includes('neraka') || lower.includes('surga') || [67, 75, 78, 81, 82, 101].includes(surahNum)) return 'Qiyamah';
    if (lower.includes('ibrahim') || lower.includes('musa') || lower.includes('firaun') || lower.includes('isa') || [12, 18, 19, 20, 21, 28].includes(surahNum)) return 'Qisas';
    if (lower.includes('hukum') || lower.includes('shalat') || lower.includes('zakat') || lower.includes('puasa') || [2, 4, 5].includes(surahNum)) return 'Ahkam';
    if (lower.includes('sabar') || lower.includes('syukur') || lower.includes('ikhlas') || lower.includes('dusta')) return 'Akhlaq';
    return 'General';
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);
  }

  private buildCorpusIndex(): void {
    if (this.isIndexed) return;

    let totalLen = 0;
    const pages = madinahPagesAyahsData as Record<string, any[]>;
    const docList: IndexedAyahDoc[] = [];

    // Map each ayah from Madinah pages
    for (const [pageStr, ayahs] of Object.entries(pages)) {
      const pageNum = parseInt(pageStr, 10) || 1;
      for (const a of ayahs) {
        const surahMeta = SURAH_LIST.find((s) => s.number === a.surahNumber);
        const thematic = this.determineThematicCluster(a.surahNumber, a.translation || '');

        const combinedText = `${a.arabicText || ''} ${a.transliteration || ''} ${a.translation || ''}`;
        const tokens = this.tokenize(combinedText);
        totalLen += tokens.length;

        // Generate 128D tensor embedding
        const vector128 = QuranicVectorTensorEngine.generateVector(a.arabicText || a.translation || '', thematic);

        docList.push({
          surahNumber: a.surahNumber,
          surahName: surahMeta ? surahMeta.name : '',
          surahLatin: surahMeta ? surahMeta.latinName : `Surah ${a.surahNumber}`,
          ayahNumber: a.ayahNumber,
          pageNumber: pageNum,
          arabicText: a.arabicText || '',
          transliteration: a.transliteration || '',
          translation: a.translation || '',
          thematicCluster: thematic,
          tokens,
          docLength: tokens.length,
          vector128
        });
      }
    }

    this.indexedDocs = docList;
    this.totalDocs = docList.length;
    this.avgDocLength = this.totalDocs > 0 ? totalLen / this.totalDocs : 1;

    // Build Inverted Index
    for (let i = 0; i < this.indexedDocs.length; i++) {
      const uniqueTokens = new Set(this.indexedDocs[i].tokens);
      for (const token of uniqueTokens) {
        if (!this.invertedIndex.has(token)) {
          this.invertedIndex.set(token, []);
        }
        this.invertedIndex.get(token)!.push(i);
      }
    }

    this.isIndexed = true;
  }

  /**
   * Hybrid Multi-Factor Quran Research Query: BM25 + 128D Tensor + RRF
   */
  public searchAyat(query: string, options: ResearchQueryOptions = {}): QuranResearchHit[] {
    const topK = options.topK ?? 10;
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    const queryVector = QuranicVectorTensorEngine.generateVector(query, 'General');

    // 1. Calculate BM25 Scores
    const docScores = new Map<number, number>();
    const matchedTokensPerDoc = new Map<number, Set<string>>();

    for (const qToken of queryTokens) {
      const postings = this.invertedIndex.get(qToken) || [];
      const df = postings.length;
      if (df === 0) continue;

      // Robertson-Spärck Jones IDF
      const idf = Math.log(1 + (this.totalDocs - df + 0.5) / (df + 0.5));

      for (const docIdx of postings) {
        const doc = this.indexedDocs[docIdx];
        if (options.thematicFilter && doc.thematicCluster !== options.thematicFilter) continue;

        let tf = 0;
        for (const t of doc.tokens) {
          if (t === qToken) tf++;
        }

        const denom = tf + this.k1 * (1 - this.b + this.b * (doc.docLength / this.avgDocLength));
        const bm25Term = idf * ((tf * (this.k1 + 1)) / (denom || 1));

        docScores.set(docIdx, (docScores.get(docIdx) || 0) + bm25Term);

        if (!matchedTokensPerDoc.has(docIdx)) matchedTokensPerDoc.set(docIdx, new Set());
        matchedTokensPerDoc.get(docIdx)!.add(qToken);
      }
    }

    // Sort BM25 Ranked List
    const bm25Ranked = Array.from(docScores.entries())
      .map(([docIdx, score]) => ({ docIdx, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);

    const bm25RankMap = new Map<number, number>();
    bm25Ranked.forEach((item, rank) => bm25RankMap.set(item.docIdx, rank + 1));

    // 2. Calculate Dense Vector Cosine Similarity
    const candidateIndices = bm25Ranked.length > 0 
      ? bm25Ranked.map(r => r.docIdx)
      : Array.from({ length: Math.min(200, this.totalDocs) }, (_, i) => i);

    const cosineRanked = candidateIndices.map((docIdx) => {
      const doc = this.indexedDocs[docIdx];
      const sim = QuranicVectorTensorEngine.computeCosineSimilarity(queryVector, doc.vector128);
      return { docIdx, sim };
    }).sort((a, b) => b.sim - a.sim);

    const cosineRankMap = new Map<number, number>();
    cosineRanked.forEach((item, rank) => cosineRankMap.set(item.docIdx, rank + 1));

    // 3. Reciprocal Rank Fusion (RRF)
    const rrfK = 60;
    const finalHits: QuranResearchHit[] = [];
    const evaluatedDocs = new Set([...bm25RankMap.keys(), ...cosineRanked.map(c => c.docIdx)]);

    for (const docIdx of evaluatedDocs) {
      const doc = this.indexedDocs[docIdx];
      const r_bm25 = bm25RankMap.get(docIdx) || 999;
      const r_cos = cosineRankMap.get(docIdx) || 999;

      const rrfScore = (1 / (rrfK + r_bm25)) + (1 / (rrfK + r_cos));
      const bm25Score = docScores.get(docIdx) || 0;
      const cosineSim = QuranicVectorTensorEngine.computeCosineSimilarity(queryVector, doc.vector128);

      if (options.minSimilarity && cosineSim < options.minSimilarity) continue;

      finalHits.push({
        surahNumber: doc.surahNumber,
        surahName: doc.surahName,
        surahLatin: doc.surahLatin,
        ayahNumber: doc.ayahNumber,
        pageNumber: doc.pageNumber,
        arabicText: doc.arabicText,
        transliteration: doc.transliteration,
        translation: doc.translation,
        thematicCluster: doc.thematicCluster,
        bm25Score: Number(bm25Score.toFixed(3)),
        cosineSimilarity: Number(cosineSim.toFixed(3)),
        rrfScore: Number(rrfScore.toFixed(5)),
        matchedKeywords: Array.from(matchedTokensPerDoc.get(docIdx) || []),
        semanticConcepts: [doc.thematicCluster, `Juz ${Math.ceil(doc.pageNumber / 20)}`]
      });
    }

    finalHits.sort((a, b) => b.rrfScore - a.rrfScore);
    return finalHits.slice(0, topK);
  }

  public getCorpusStats(): { totalIndexedAyat: number; avgDocLength: number; totalVocabulary: number } {
    return {
      totalIndexedAyat: this.totalDocs,
      avgDocLength: Number(this.avgDocLength.toFixed(1)),
      totalVocabulary: this.invertedIndex.size
    };
  }
}

export const quranResearchEngine = QuranResearchEngine.getInstance();

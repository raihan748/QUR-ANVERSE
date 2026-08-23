// ==============================================================================
// BAYESIAN KNOWLEDGE TRACING (BKT) ENGINE
// Probabilistic Student Knowledge State & 30-Juz Hafidz Competency Estimator
// ==============================================================================

import { BKTParameters, BKTState, BKTCompetencyMatrix } from '../../types';
import { SURAHS_DIRECTORY } from '../../data/quranData';

export const DEFAULT_BKT_PARAMS: BKTParameters = {
  pL0: 0.12, // Prior: Initial belief student knows the ayah before any test
  pT: 0.28,  // Transition: Probability student learns the ayah after 1 practice session
  pG: 0.10,  // Guess: Probability student passes by lucky guess
  pS: 0.08   // Slip: Probability student makes a slip mistake despite knowing the ayah
};

export class BayesianKnowledgeEngine {
  private params: BKTParameters;

  constructor(customParams: Partial<BKTParameters> = {}) {
    this.params = { ...DEFAULT_BKT_PARAMS, ...customParams };
  }

  /**
   * Initializes BKT state for an unpracticed ayah
   */
  public initializeState(surahNumber: number, ayahNumber: number): BKTState {
    return {
      surahNumber,
      ayahNumber,
      masteryProbability: this.params.pL0,
      practiceCount: 0,
      status: 'belum_hafal',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Updates student mastery probability P(L_t) based on observation (Passed / Failed)
   */
  public updateObservation(currentState: BKTState, isCorrect: boolean): BKTState {
    const pPrev = currentState.masteryProbability;
    const { pS, pG, pT } = this.params;

    let pPosterior: number;

    if (isCorrect) {
      // Bayes Rule on Correct Observation:
      // P(L_t | Correct) = (P(L_{t-1}) * (1 - P(S))) / [P(L_{t-1}) * (1 - P(S)) + (1 - P(L_{t-1})) * P(G)]
      const numerator = pPrev * (1 - pS);
      const denominator = numerator + (1 - pPrev) * pG;
      pPosterior = numerator / Math.max(0.0001, denominator);
    } else {
      // Bayes Rule on Incorrect Observation:
      // P(L_t | Incorrect) = (P(L_{t-1}) * P(S)) / [P(L_{t-1}) * P(S) + (1 - P(L_{t-1})) * (1 - P(G))]
      const numerator = pPrev * pS;
      const denominator = numerator + (1 - pPrev) * (1 - pG);
      pPosterior = numerator / Math.max(0.0001, denominator);
    }

    // Transition Step (Learning occurred during this session)
    // P(L_{t+1}) = P(L_t) + (1 - P(L_t)) * P(T)
    const pNext = pPosterior + (1 - pPosterior) * pT;
    const boundedP = Number(Math.min(0.999, Math.max(0.01, pNext)).toFixed(4));

    // Determine status badge
    let status: BKTState['status'] = 'belum_hafal';
    if (boundedP >= 0.90) status = 'mutqin_sempurna';
    else if (boundedP >= 0.70) status = 'hampir_mutqin';
    else if (boundedP >= 0.35) status = 'tahap_latihan';

    return {
      surahNumber: currentState.surahNumber,
      ayahNumber: currentState.ayahNumber,
      masteryProbability: boundedP,
      practiceCount: currentState.practiceCount + 1,
      status,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generates Complete 30-Juz Competency Matrix across all 6,236 Ayahs
   */
  public generateCompetencyMatrix(
    userId: string,
    existingStates: Record<string, BKTState>
  ): BKTCompetencyMatrix {
    const juzMap: Record<number, { totalAyahs: number; masteredAyahs: number; totalProb: number }> = {};
    for (let j = 1; j <= 30; j++) {
      juzMap[j] = { totalAyahs: 0, masteredAyahs: 0, totalProb: 0 };
    }

    const surahScores: { surahNumber: number; surahName: string; averageMastery: number }[] = [];

    SURAHS_DIRECTORY.forEach((surah) => {
      let surahTotalProb = 0;
      const juz = surah.juzStart;

      for (let a = 1; a <= surah.ayahCount; a++) {
        const key = `${surah.number}:${a}`;
        const state = existingStates[key] || this.initializeState(surah.number, a);

        juzMap[juz].totalAyahs++;
        juzMap[juz].totalProb += state.masteryProbability;

        if (state.masteryProbability >= 0.80) {
          juzMap[juz].masteredAyahs++;
        }

        surahTotalProb += state.masteryProbability;
      }

      const surahAvg = Number((surahTotalProb / surah.ayahCount).toFixed(3));
      surahScores.push({
        surahNumber: surah.number,
        surahName: surah.latinName,
        averageMastery: surahAvg
      });
    });

    let globalTotalAyahs = 0;
    let globalMastered = 0;

    const juzBreakdown = Object.entries(juzMap).map(([juzStr, data]) => {
      const juz = parseInt(juzStr, 10);
      const avg = data.totalAyahs > 0 ? data.totalProb / data.totalAyahs : 0;
      globalTotalAyahs += data.totalAyahs;
      globalMastered += data.masteredAyahs;

      let status: 'Perlu Penguatan' | 'Sedang Berjalan' | 'Mutqin' = 'Perlu Penguatan';
      if (avg >= 0.80) status = 'Mutqin';
      else if (avg >= 0.40) status = 'Sedang Berjalan';

      return {
        juz,
        totalAyahs: data.totalAyahs,
        masteredAyahs: data.masteredAyahs,
        averageProbability: Number(avg.toFixed(3)),
        status
      };
    });

    const overallPct = globalTotalAyahs > 0 ? Math.round((globalMastered / globalTotalAyahs) * 100) : 0;

    surahScores.sort((a, b) => a.averageMastery - b.averageMastery);
    const weakestSurahs = surahScores.slice(0, 5);
    const strongestSurahs = [...surahScores].reverse().slice(0, 5);

    return {
      userId,
      overall30JuzMasteryPercentage: overallPct,
      juzBreakdown,
      weakestSurahs,
      strongestSurahs
    };
  }
}

export const bayesianKnowledgeEngine = new BayesianKnowledgeEngine();

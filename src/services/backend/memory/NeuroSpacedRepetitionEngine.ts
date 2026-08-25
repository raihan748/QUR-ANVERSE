// ==============================================================================
// NEURO-COGNITIVE SPACED REPETITION ENGINE (DSR MODEL / SM-18)
// Multi-Variable Difficulty (D), Stability (S), and Retrievability (R) Calculus
// ==============================================================================

export interface DSRMemoryState {
  surahNumber: number;
  ayahNumber: number;
  difficulty: number; // D: 1.0 (trivial) to 10.0 (extremely hard / mutasyabihat)
  stabilityDays: number; // S: Memory stability half-life in days
  retrievability: number; // R: Current probability of recall (0.0 to 1.0)
  lastReviewTimestamp: number;
  totalLapses: number; // Number of times forgotten
  totalRepetitions: number;
  cognitiveFatigueFactor: number; // 1.0 = fresh, > 1.0 = tired/strained
}

export class NeuroSpacedRepetitionEngine {
  /**
   * Evaluates current Retrievability (R) after elapsed delta time: R(t) = exp(-t / S)
   */
  public static calculateRetrievability(state: DSRMemoryState, currentTimestamp = Date.now()): number {
    const elapsedDays = Math.max(0, (currentTimestamp - state.lastReviewTimestamp) / (1000 * 60 * 60 * 24));
    const S = Math.max(0.1, state.stabilityDays);
    const R = Math.exp(-elapsedDays / S);
    return Number(Math.max(0.01, Math.min(1.0, R)).toFixed(3));
  }

  /**
   * Updates DSR memory state following a voice AI recitation test.
   * @param grade 0 (total blank) to 5 (flawless recitation)
   * @param voiceLatencyMs Latency in voice reaction time
   */
  public static updateDSRState(
    currentState: DSRMemoryState,
    grade: 0 | 1 | 2 | 3 | 4 | 5,
    voiceLatencyMs = 800
  ): DSRMemoryState {
    const isSuccess = grade >= 3;
    let { difficulty, stabilityDays, totalLapses, totalRepetitions, cognitiveFatigueFactor } = currentState;

    totalRepetitions++;

    // 1. Update Cognitive Fatigue based on voice reaction latency
    if (voiceLatencyMs > 2000) {
      cognitiveFatigueFactor = Math.min(2.0, cognitiveFatigueFactor + 0.1);
    } else if (voiceLatencyMs < 1000) {
      cognitiveFatigueFactor = Math.max(0.8, cognitiveFatigueFactor - 0.05);
    }

    // 2. Update Difficulty (D)
    // D' = D - w * (grade - 3)
    const deltaD = 0.5 * (3 - grade);
    difficulty = Math.max(1.0, Math.min(10.0, difficulty + deltaD));

    // 3. Update Stability (S)
    if (isSuccess) {
      // Memory consolidation: S' = S * (1 + C * D^(-0.5) * S^(-0.2) * exp(1 - R))
      const R = this.calculateRetrievability(currentState);
      const stabilityMultiplier = 1 + (4.0 / Math.sqrt(difficulty)) * Math.pow(stabilityDays, -0.2) * Math.exp(1 - R);
      stabilityDays = stabilityDays * stabilityMultiplier * (1 / cognitiveFatigueFactor);
    } else {
      // Lapse: S' = min(S * 0.2, 0.5)
      totalLapses++;
      stabilityDays = Math.max(0.2, Math.min(stabilityDays * 0.25, 1.0));
    }

    return {
      surahNumber: currentState.surahNumber,
      ayahNumber: currentState.ayahNumber,
      difficulty: Number(difficulty.toFixed(2)),
      stabilityDays: Number(stabilityDays.toFixed(2)),
      retrievability: 1.0, // immediately reset to 1.0 upon review
      lastReviewTimestamp: Date.now(),
      totalLapses,
      totalRepetitions,
      cognitiveFatigueFactor: Number(cognitiveFatigueFactor.toFixed(2))
    };
  }

  public static initializeState(surahNumber: number, ayahNumber: number, initialDifficulty = 5.0): DSRMemoryState {
    return {
      surahNumber,
      ayahNumber,
      difficulty: initialDifficulty,
      stabilityDays: 1.0,
      retrievability: 1.0,
      lastReviewTimestamp: Date.now(),
      totalLapses: 0,
      totalRepetitions: 0,
      cognitiveFatigueFactor: 1.0
    };
  }
}

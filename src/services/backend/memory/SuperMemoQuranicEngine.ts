// ==============================================================================
// SUPERMEMO SM-2 & SPACED REPETITION QURANIC MEMORIZATION ENGINE
// Cognitive Retention & Modified Ebbinghaus Decay Optimizer
// ==============================================================================

export interface SuperMemoState {
  repetitionNumber: number;
  easinessFactor: number; // EF: standard starts at 2.5
  intervalDays: number;
  lastReviewDate: string;
  nextReviewDate: string;
  retentionProbability: number; // 0.0 to 1.0
}

export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5; // 5 = perfect recall, 0 = complete blackout

export class SuperMemoQuranicEngine {
  /**
   * Evaluates next review interval and stability using SuperMemo SM-2 algorithm.
   */
  public static calculateNextReview(
    currentState: SuperMemoState,
    grade: ReviewGrade
  ): SuperMemoState {
    let { repetitionNumber, easinessFactor, intervalDays } = currentState;

    if (grade >= 3) {
      if (repetitionNumber === 0) {
        intervalDays = 1;
      } else if (repetitionNumber === 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(intervalDays * easinessFactor);
      }
      repetitionNumber++;
    } else {
      repetitionNumber = 0;
      intervalDays = 1;
    }

    // Update Easiness Factor (EF)
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easinessFactor = easinessFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (easinessFactor < 1.3) easinessFactor = 1.3;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);

    // Ebbinghaus Retention Probability: R = e^(-t/S)
    const retention = Math.exp(-1 / (intervalDays * easinessFactor));

    return {
      repetitionNumber,
      easinessFactor: Number(easinessFactor.toFixed(2)),
      intervalDays,
      lastReviewDate: new Date().toISOString(),
      nextReviewDate: nextDate.toISOString(),
      retentionProbability: Number(retention.toFixed(3))
    };
  }

  public static getInitialState(): SuperMemoState {
    return {
      repetitionNumber: 0,
      easinessFactor: 2.5,
      intervalDays: 0,
      lastReviewDate: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      retentionProbability: 1.0
    };
  }
}

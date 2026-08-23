// ==============================================================================
// SPACED REPETITION ENGINE (MODIFIED SUPERMEMO SM-2 + ADAPTIVE TIKRAR 1-5-10)
// Cognitive Memorization & Forgetting Curve Optimization Engine
// ==============================================================================

import { SM2ItemState, SM2EvaluationPayload } from '../../types';

export class SpacedRepetitionEngine {
  /**
   * Initializes default SM-2 state for a newly memorized ayah
   */
  public initializeItem(surahNumber: number, ayahNumber: number): SM2ItemState {
    const today = new Date().toISOString().split('T')[0];
    return {
      itemKey: `surah-${surahNumber}-ayah-${ayahNumber}`,
      repetitionCount: 0,
      easinessFactor: 2.5,
      intervalDays: 1,
      nextReviewDate: today,
      lastReviewedDate: today,
      retentionProbability: 1.0,
      tikrarPhase: 'Bi_An_Nazhar',
      consecutiveSuccesses: 0
    };
  }

  /**
   * Evaluates recall performance and calculates next SM-2 interval & Tikrar phase
   * @param currentState Current state of the memorized ayah
   * @param payload Evaluation data (accuracyScore, qualityGrade, latency)
   */
  public calculateNextReview(
    currentState: SM2ItemState,
    payload: SM2EvaluationPayload
  ): SM2ItemState {
    // 1. Determine Quality Grade (0 to 5)
    let q = payload.qualityGrade;
    if (q === undefined || q === null) {
      if (payload.accuracyScore >= 95) q = 5;
      else if (payload.accuracyScore >= 85) q = 4;
      else if (payload.accuracyScore >= 75) q = 3;
      else if (payload.accuracyScore >= 60) q = 2;
      else if (payload.accuracyScore >= 40) q = 1;
      else q = 0;
    }
    q = Math.max(0, Math.min(5, q));

    // 2. Compute New Easiness Factor (EF)
    // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const deltaEF = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
    let newEF = currentState.easinessFactor + deltaEF;
    // Hard boundary: EF must not drop below 1.3
    newEF = Math.max(1.3, Number(newEF.toFixed(3)));

    let newRepCount = currentState.repetitionCount;
    let newInterval = currentState.intervalDays;
    let newConsecutive = currentState.consecutiveSuccesses;
    let newPhase = currentState.tikrarPhase;

    // 3. Compute New Interval (I_n)
    if (q < 3) {
      // Failed recall -> Reset repetition cycle
      newRepCount = 0;
      newInterval = 1;
      newConsecutive = 0;
      newPhase = 'Bi_An_Nazhar'; // Return to visual reading phase
    } else {
      // Successful recall
      newRepCount += 1;
      newConsecutive += 1;

      if (newRepCount === 1) {
        newInterval = 1;
        newPhase = 'Bi_Al_Ghaib';
      } else if (newRepCount === 2) {
        newInterval = 6;
        newPhase = 'Sabqi';
      } else {
        newInterval = Math.round(currentState.intervalDays * newEF);
        if (newConsecutive >= 5) {
          newPhase = 'Manzil'; // Long-term permanent retention
        }
      }
    }

    // 4. Calculate Next Review Date
    const now = new Date();
    const nextDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
    const nextReviewDateStr = nextDate.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    // 5. Estimate Ebbinghaus Memory Retention Probability: R(t) = e^(-t / S)
    const stabilityFactor = newInterval * (newEF / 2.5);
    const retentionProb = Number(Math.exp(-1 / Math.max(1, stabilityFactor)).toFixed(3));

    return {
      itemKey: currentState.itemKey,
      repetitionCount: newRepCount,
      easinessFactor: newEF,
      intervalDays: newInterval,
      nextReviewDate: nextReviewDateStr,
      lastReviewedDate: todayStr,
      retentionProbability: retentionProb,
      tikrarPhase: newPhase,
      consecutiveSuccesses: newConsecutive
    };
  }

  /**
   * Generates prioritized list of ayahs due for review today
   */
  public filterDueReviews(items: SM2ItemState[]): SM2ItemState[] {
    const today = new Date().toISOString().split('T')[0];
    return items
      .filter((item) => item.nextReviewDate <= today)
      .sort((a, b) => {
        // Priority 1: Lower retention probability
        if (a.retentionProbability !== b.retentionProbability) {
          return a.retentionProbability - b.retentionProbability;
        }
        // Priority 2: Earlier nextReviewDate
        return a.nextReviewDate.localeCompare(b.nextReviewDate);
      });
  }
}

export const spacedRepetitionEngine = new SpacedRepetitionEngine();

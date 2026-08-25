// ==============================================================================
// CONTINUOUS HIDDEN MARKOV MODEL (HMM) & VITERBI TRELLIS SEARCH DECODER
// Multi-State Dynamic Programming for Phoneme Alignment & Duration Scoring
// ==============================================================================

import { MFCCVector } from './MFCCFeatureExtractor';

export interface HMMPhonemeState {
  stateId: string;
  phoneme: string;
  meanMFCC: number[];
  varianceMFCC: number[];
  selfTransitionProb: number;
  nextTransitionProb: number;
}

export interface ViterbiDecodingResult {
  decodedPhonemeSequence: string[];
  totalLogLikelihood: number;
  perPhonemeAcousticScore: { phoneme: string; score: number; durationFrames: number }[];
  isAlignmentValid: boolean;
}

export class ViterbiTrellisDecoder {
  /**
   * Calculates Gaussian probability density for an observed MFCC vector given HMM state parameters.
   */
  private static calculateEmissionLogProb(observed: number[], state: HMMPhonemeState): number {
    let logProb = 0;
    const D = Math.min(observed.length, state.meanMFCC.length);

    for (let d = 0; d < D; d++) {
      const diff = observed[d] - state.meanMFCC[d];
      const variance = Math.max(1e-4, state.varianceMFCC[d] || 1.0);
      logProb += -0.5 * Math.log(2 * Math.PI * variance) - (diff * diff) / (2 * variance);
    }

    return logProb;
  }

  /**
   * Runs Viterbi Trellis dynamic programming across T audio frames and S phoneme states.
   */
  public static decode(
    frames: MFCCVector[],
    canonicalHMMStates: HMMPhonemeState[]
  ): ViterbiDecodingResult {
    const T = frames.length;
    const S = canonicalHMMStates.length;

    if (T === 0 || S === 0) {
      return {
        decodedPhonemeSequence: [],
        totalLogLikelihood: 0,
        perPhonemeAcousticScore: [],
        isAlignmentValid: true
      };
    }

    // Viterbi DP Tables: V[t][s] = max log probability
    const V: number[][] = Array.from({ length: T }, () => new Array(S).fill(-Infinity));
    const backpointer: number[][] = Array.from({ length: T }, () => new Array(S).fill(0));

    // Initialization (t = 0)
    V[0][0] = this.calculateEmissionLogProb(frames[0].coefficients, canonicalHMMStates[0]);

    // Recursion (t = 1 to T - 1)
    for (let t = 1; t < T; t++) {
      for (let s = 0; s < S; s++) {
        const emissionProb = this.calculateEmissionLogProb(frames[t].coefficients, canonicalHMMStates[s]);

        // Option 1: Self transition (s -> s)
        const selfProb = V[t - 1][s] + Math.log(canonicalHMMStates[s].selfTransitionProb);

        // Option 2: Transition from previous state (s-1 -> s)
        let prevProb = -Infinity;
        if (s > 0) {
          prevProb = V[t - 1][s - 1] + Math.log(canonicalHMMStates[s - 1].nextTransitionProb);
        }

        if (selfProb >= prevProb) {
          V[t][s] = selfProb + emissionProb;
          backpointer[t][s] = s;
        } else {
          V[t][s] = prevProb + emissionProb;
          backpointer[t][s] = s - 1;
        }
      }
    }

    // Backtracking best path
    const bestPath: number[] = new Array(T);
    let bestFinalState = 0;
    let maxFinalProb = -Infinity;

    for (let s = 0; s < S; s++) {
      if (V[T - 1][s] > maxFinalProb) {
        maxFinalProb = V[T - 1][s];
        bestFinalState = s;
      }
    }

    bestPath[T - 1] = bestFinalState;
    for (let t = T - 2; t >= 0; t--) {
      bestPath[t] = backpointer[t + 1][bestPath[t + 1]];
    }

    // Aggregate phoneme metrics
    const decodedSequence: string[] = [];
    const scoreMap: Map<string, { total: number; frames: number }> = new Map();

    for (let t = 0; t < T; t++) {
      const state = canonicalHMMStates[bestPath[t]];
      if (!decodedSequence.includes(state.phoneme)) {
        decodedSequence.push(state.phoneme);
      }

      const cur = scoreMap.get(state.phoneme) || { total: 0, frames: 0 };
      cur.total += Math.exp(Math.max(-10, V[t][bestPath[t]] / 100)); // normalized likelihood
      cur.frames += 1;
      scoreMap.set(state.phoneme, cur);
    }

    const perPhonemeAcousticScore = Array.from(scoreMap.entries()).map(([phoneme, data]) => ({
      phoneme,
      score: Number(Math.min(1.0, data.total / data.frames).toFixed(3)),
      durationFrames: data.frames
    }));

    return {
      decodedPhonemeSequence: decodedSequence,
      totalLogLikelihood: Number(maxFinalProb.toFixed(2)),
      perPhonemeAcousticScore,
      isAlignmentValid: maxFinalProb > -5000
    };
  }
}

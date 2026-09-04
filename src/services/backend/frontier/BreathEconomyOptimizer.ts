// ==============================================================================
// BREATH ECONOMY & LUNG CAPACITY OPTIMIZER
// Real-time Exhalation Modeling, Adaptive Waqaf Gating & Ibtida' Guidance
// ==============================================================================

export type WaqafCategory = 
  | 'WAQAF_LAZIM'   // (م) Harus berhenti
  | 'WAQAF_JAIZ'    // (ج) Boleh berhenti boleh lanjut
  | 'WAQAF_QALA'    // (قلى) Lebih utama berhenti
  | 'WAQAF_SALA'    // (صلى) Lebih utama lanjut
  | 'WAQAF_MAMNU'   // (لا) Dilarang berhenti (Waqaf Qabih jika merusak arti)
  | 'WAQAF_RAS_AYAH'// (۝) Akhir ayat (Sunnah berhenti)
  | 'NO_MARK';

export interface AyahWordToken {
  index: number;
  arabic: string;
  waqafMark: WaqafCategory;
  isMeaningBoundary: boolean;
}

export interface BreathStateSnapshot {
  remainingBreathPercent: number; // 100% -> 0%
  continuousPhonationMs: number;
  isExhaustionImminent: boolean;
  recommendedStopWordIndex: number | null;
  ibtidaWordIndex: number | null; // Titik mulai kembali setelah bernafas
  advisoryNote: string;
}

export class BreathEconomyOptimizer {
  // Baseline physiological breath capacity: ~12 seconds of sustained Quranic phonation
  private static readonly MAX_CONTINUOUS_PHONATION_MS = 12500;
  private currentPhonationMs: number = 0;
  private lastTimestampMs: number = 0;
  private isSpeaking: boolean = false;

  public resetBreathState(): void {
    this.currentPhonationMs = 0;
    this.lastTimestampMs = 0;
    this.isSpeaking = false;
  }

  /**
   * Updates real-time breath consumption based on audio energy and elapsed time.
   */
  public updateBreathTelemetry(
    energyLevel: number, // 0 - 100
    timestampMs: number,
    currentWordIndex: number,
    ayahWords: AyahWordToken[]
  ): BreathStateSnapshot {
    if (this.lastTimestampMs === 0) {
      this.lastTimestampMs = timestampMs;
    }

    const deltaMs = Math.max(0, Math.min(250, timestampMs - this.lastTimestampMs));
    this.lastTimestampMs = timestampMs;

    // Phonation threshold (energy > 15 counts as active exhalation)
    if (energyLevel > 15) {
      this.isSpeaking = true;
      // Exponential energy consumption multiplier when reciting loud
      const rateMultiplier = 1.0 + (energyLevel / 100) * 0.4;
      this.currentPhonationMs += deltaMs * rateMultiplier;
    } else {
      // Pause detected: Student is inhaling / taking a breath
      if (this.isSpeaking && deltaMs > 150) {
        // Rapid breath replenishment
        this.currentPhonationMs = Math.max(0, this.currentPhonationMs - deltaMs * 3.5);
      }
    }

    const remainingRatio = Math.max(0, 1 - (this.currentPhonationMs / BreathEconomyOptimizer.MAX_CONTINUOUS_PHONATION_MS));
    const remainingPercent = Math.round(remainingRatio * 100);
    const isExhaustionImminent = remainingPercent <= 25;

    let recommendedStopIndex: number | null = null;
    let ibtidaIndex: number | null = null;
    let advisory = 'Cadangan nafas prima. Teruskan tilawah.';

    if (isExhaustionImminent) {
      // Lookahead: Find the nearest valid waqaf mark ahead
      for (let i = currentWordIndex; i < ayahWords.length; i++) {
        const w = ayahWords[i];
        if (w.waqafMark === 'WAQAF_JAIZ' || w.waqafMark === 'WAQAF_QALA' || w.waqafMark === 'WAQAF_LAZIM' || w.waqafMark === 'WAQAF_RAS_AYAH' || w.isMeaningBoundary) {
          recommendedStopIndex = i;
          ibtidaIndex = w.waqafMark === 'WAQAF_RAS_AYAH' ? i + 1 : Math.max(0, i - 1);
          advisory = `Peringatan nafas menipis (${remainingPercent}%). Disarankan waqaf pada kata ke-${i + 1} (${w.arabic}).`;
          break;
        }
      }

      if (recommendedStopIndex === null && ayahWords.length > 0) {
        recommendedStopIndex = Math.min(ayahWords.length - 1, currentWordIndex + 1);
        ibtidaIndex = Math.max(0, recommendedStopIndex - 1);
        advisory = `Segera berhenti pada kata terdekat (${ayahWords[recommendedStopIndex].arabic}) dan ulangi dari kata sebelumnya (Ibtida').`;
      }
    }

    return {
      remainingBreathPercent: remainingPercent,
      continuousPhonationMs: Math.round(this.currentPhonationMs),
      isExhaustionImminent,
      recommendedStopWordIndex: recommendedStopIndex,
      ibtidaWordIndex: ibtidaIndex,
      advisoryNote: advisory
    };
  }
}

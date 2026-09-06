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

export type RecitationPace = 'hadr' | 'tadwir' | 'tartil';

export interface AyahWordToken {
  index: number;
  arabic: string;
  waqafMark: WaqafCategory;
  isMeaningBoundary: boolean;
}

export interface UserBreathProfile {
  userId: string;
  averageInhaleMs: number;          // Rata-rata durasi tarik nafas santri (default: 1400ms)
  averageWordGapMs: number;         // Rata-rata jeda antar kata (default: 450ms)
  recitationPace: RecitationPace;   // Hadr (Cepat), Tadwir (Sedang), Tartil (Perlahan & Teliti)
  measuredInhales: number[];        // Ring buffer 20 sampel jeda terakhir
  totalSamples: number;             // Total jeda nafas yang dipelajari
  adaptiveInterventionDelayMs: number; // Waktu toleransi sebelum Syekh menegur
  selfCorrectionWindowMs: number;   // Jendela waktu ralat mandiri (istidrak)
  lastUpdated: number;
}

export interface BreathStateSnapshot {
  remainingBreathPercent: number; // 100% -> 0%
  continuousPhonationMs: number;
  isExhaustionImminent: boolean;
  isInhaling: boolean;
  currentPauseMs: number;
  recommendedStopWordIndex: number | null;
  ibtidaWordIndex: number | null; // Titik mulai kembali setelah bernafas
  advisoryNote: string;
  userPace: RecitationPace;
  averageInhaleMs: number;
  learnedSamplesCount: number;
}

const DEFAULT_USER_PROFILE: UserBreathProfile = {
  userId: 'default_santri',
  averageInhaleMs: 1400,
  averageWordGapMs: 450,
  recitationPace: 'tadwir',
  measuredInhales: [1400, 1350, 1450],
  totalSamples: 3,
  adaptiveInterventionDelayMs: 1350,
  selfCorrectionWindowMs: 900,
  lastUpdated: Date.now()
};

export class BreathEconomyOptimizer {
  // Baseline physiological breath capacity: ~12.5 seconds of sustained Quranic phonation
  private static readonly MAX_CONTINUOUS_PHONATION_MS = 12500;
  private currentPhonationMs: number = 0;
  private lastTimestampMs: number = 0;
  private isSpeaking: boolean = false;
  private pauseStartMs: number = 0;
  private currentPauseDurationMs: number = 0;
  private isInhalingState: boolean = false;

  private activeProfile: UserBreathProfile = { ...DEFAULT_USER_PROFILE };

  constructor() {
    this.loadProfileFromStorage('active_santri');
  }

  /**
   * Load stored breathing profile for a specific santri user ID.
   */
  public loadProfileFromStorage(userId: string = 'active_santri'): UserBreathProfile {
    try {
      if (typeof localStorage !== 'undefined') {
        const key = `quranverse_santri_breath_profile_${userId}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.averageInhaleMs === 'number') {
            this.activeProfile = { ...DEFAULT_USER_PROFILE, ...parsed, userId };
            return this.activeProfile;
          }
        }
      }
    } catch {
      // ignore
    }
    this.activeProfile = { ...DEFAULT_USER_PROFILE, userId };
    return this.activeProfile;
  }

  /**
   * Persist current breathing profile to localStorage.
   */
  private saveProfileToStorage(): void {
    try {
      if (typeof localStorage !== 'undefined' && this.activeProfile.userId) {
        const key = `quranverse_santri_breath_profile_${this.activeProfile.userId}`;
        localStorage.setItem(key, JSON.stringify(this.activeProfile));
      }
    } catch {
      // ignore
    }
  }

  public getProfile(): UserBreathProfile {
    return { ...this.activeProfile };
  }

  /**
   * Get dynamic adaptive delay before Sheikh voice intervention can trigger.
   * Gives breathing room based on student's personal inhalation & pacing habits.
   */
  public getAdaptiveInterventionDelayMs(): number {
    return this.activeProfile.adaptiveInterventionDelayMs || 1350;
  }

  /**
   * Get self-correction window (istidrak) allowing the student to repeat without interruption.
   */
  public getSelfCorrectionWindowMs(): number {
    return this.activeProfile.selfCorrectionWindowMs || 900;
  }

  public isInhaling(): boolean {
    return this.isInhalingState;
  }

  public resetBreathState(): void {
    this.currentPhonationMs = 0;
    this.lastTimestampMs = 0;
    this.isSpeaking = false;
    this.pauseStartMs = 0;
    this.currentPauseDurationMs = 0;
    this.isInhalingState = false;
  }

  /**
   * Records a detected silence/pause event, classifying if it is an inhalation (tanaffus).
   * Adapts the student's moving average breath window and pacing.
   */
  public recordPauseOrInhaleEvent(durationMs: number): void {
    // Physiological breathing pause range: 350ms (quick catch-breath) to 4000ms (long meditative pause)
    if (durationMs < 350 || durationMs > 4500) {
      return;
    }

    const recent = [...(this.activeProfile.measuredInhales || [])];
    recent.push(durationMs);
    if (recent.length > 20) {
      recent.shift(); // Keep latest 20 samples
    }

    // Exponential Moving Average (EMA) with alpha = 0.20 for smooth adaptation
    const oldAvg = this.activeProfile.averageInhaleMs || 1400;
    const newAvg = Math.round(oldAvg * 0.8 + durationMs * 0.2);

    // Classify recitation pacing
    let pace: RecitationPace = 'tadwir';
    let adaptiveDelay = 1350;
    let selfCorrection = 900;

    if (newAvg < 900) {
      pace = 'hadr'; // Fast tempo
      adaptiveDelay = Math.max(800, Math.round(newAvg * 1.1));
      selfCorrection = Math.max(500, Math.round(newAvg * 0.7));
    } else if (newAvg > 1700) {
      pace = 'tartil'; // Slow, deliberate, dignified tempo
      adaptiveDelay = Math.min(2500, Math.round(newAvg * 1.15));
      selfCorrection = Math.min(1400, Math.round(newAvg * 0.8));
    } else {
      pace = 'tadwir'; // Moderate tempo
      adaptiveDelay = Math.round(newAvg * 1.12);
      selfCorrection = Math.round(newAvg * 0.75);
    }

    this.activeProfile = {
      ...this.activeProfile,
      averageInhaleMs: newAvg,
      recitationPace: pace,
      measuredInhales: recent,
      totalSamples: (this.activeProfile.totalSamples || 0) + 1,
      adaptiveInterventionDelayMs: adaptiveDelay,
      selfCorrectionWindowMs: selfCorrection,
      lastUpdated: Date.now()
    };

    this.saveProfileToStorage();
  }

  /**
   * Updates real-time breath consumption based on audio energy and elapsed time.
   */
  public updateBreathTelemetry(
    energyLevel: number, // 0 - 100 from Web Audio API Analyser
    timestampMs: number,
    currentWordIndex: number = 0,
    ayahWords: AyahWordToken[] = []
  ): BreathStateSnapshot {
    if (this.lastTimestampMs === 0) {
      this.lastTimestampMs = timestampMs;
    }

    const deltaMs = Math.max(0, Math.min(250, timestampMs - this.lastTimestampMs));
    this.lastTimestampMs = timestampMs;

    // Phonation threshold (energy > 15 counts as active vocal cord vibration / speech)
    if (energyLevel > 15) {
      if (!this.isSpeaking && this.pauseStartMs > 0) {
        // Santri just finished a pause/inhale and resumed vocalizing!
        const pauseDuration = timestampMs - this.pauseStartMs;
        this.recordPauseOrInhaleEvent(pauseDuration);
        this.pauseStartMs = 0;
        this.currentPauseDurationMs = 0;
        this.isInhalingState = false;
      }

      this.isSpeaking = true;
      // Exponential energy consumption multiplier when reciting loud
      const rateMultiplier = 1.0 + (energyLevel / 100) * 0.4;
      this.currentPhonationMs += deltaMs * rateMultiplier;
    } else {
      // Silence / pause detected
      if (this.isSpeaking) {
        // Transition from speaking to silence (start of potential inhale)
        this.isSpeaking = false;
        this.pauseStartMs = timestampMs - deltaMs;
      }

      if (this.pauseStartMs > 0) {
        this.currentPauseDurationMs = timestampMs - this.pauseStartMs;
        // Inhaling state holds if silence has lasted >= 150ms and is within user's expected breath window
        this.isInhalingState = this.currentPauseDurationMs >= 150 && this.currentPauseDurationMs <= (this.activeProfile.averageInhaleMs * 1.8);
      }

      // Rapid breath replenishment while silent
      if (deltaMs > 100) {
        this.currentPhonationMs = Math.max(0, this.currentPhonationMs - deltaMs * 3.5);
      }
    }

    const remainingRatio = Math.max(0, 1 - (this.currentPhonationMs / BreathEconomyOptimizer.MAX_CONTINUOUS_PHONATION_MS));
    const remainingPercent = Math.round(remainingRatio * 100);
    const isExhaustionImminent = remainingPercent <= 25;

    let recommendedStopIndex: number | null = null;
    let ibtidaIndex: number | null = null;
    let advisory = this.isInhalingState 
      ? `Mengambil nafas (Tanaffus)... Ritme santri: ~${(this.activeProfile.averageInhaleMs / 1000).toFixed(1)}s.`
      : 'Cadangan nafas prima. Teruskan tilawah.';

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
      isInhaling: this.isInhalingState,
      currentPauseMs: Math.round(this.currentPauseDurationMs),
      recommendedStopWordIndex: recommendedStopIndex,
      ibtidaWordIndex: ibtidaIndex,
      advisoryNote: advisory,
      userPace: this.activeProfile.recitationPace,
      averageInhaleMs: this.activeProfile.averageInhaleMs,
      learnedSamplesCount: this.activeProfile.totalSamples
    };
  }
}

export const breathOptimizer = new BreathEconomyOptimizer();

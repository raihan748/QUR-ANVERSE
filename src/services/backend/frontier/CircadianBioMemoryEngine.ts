// ==============================================================================
// CIRCADIAN BIO-MEMORY SPACED REPETITION SCHEDULER (FSRS + BIORYTHM)
// Cognitive Neuroscience Modeling of Quranic Retention & Peak Alertness Windows
// ==============================================================================

export type MemorizationHealthTier = 
  | 'CRITICAL_URGENT' // Retensi < 70% (Rawan lupa total, harus dimuraja'ah hari ini)
  | 'OPTIMAL_DUE'    // Retensi 70-85% (Waktu emas muraja'ah sesuai FSRS)
  | 'MUTQIN_STABLE';  // Retensi > 85% (Hafalan kuat, aman)

export interface AyahMemoryProfile {
  surahNumber: number;
  ayahNumber: number;
  stabilityDays: number; // S parameter
  difficulty: number;    // D parameter (1 - 10)
  lastReviewedDate: string; // YYYY-MM-DD
  elapsedDays: number;
  retentionProbability: number; // 0.0 to 1.0
  healthTier: MemorizationHealthTier;
  recommendedTimeWindow: string; // e.g. "Ba'da Subuh (05:00 - 06:30)"
}

export class CircadianBioMemoryEngine {
  /**
   * Evaluates cognitive retention efficiency factor C(h) based on the hour of the day.
   */
  public static getCircadianEfficiency(hourOfDay: number): {
    factor: number;
    phaseName: string;
    cognitiveAdvantage: string;
  } {
    if (hourOfDay >= 4 && hourOfDay < 7) {
      return {
        factor: 1.35,
        phaseName: 'Golden Hour (Ba\'da Subuh)',
        cognitiveAdvantage: 'Gelombang otak Alpha & hormon kortisol alami: +35% konsolidasi memori jangka panjang.'
      };
    }
    if (hourOfDay >= 8 && hourOfDay < 11) {
      return {
        factor: 1.15,
        phaseName: 'Focus Peak (Waktu Dhuha)',
        cognitiveAdvantage: 'Atensi visual & fokus tinggi: +15% efisiensi muraja\'ah.'
      };
    }
    if (hourOfDay >= 12 && hourOfDay < 15) {
      return {
        factor: 0.85,
        phaseName: 'Post-Prandial Dip (Ba\'da Zhuhur)',
        cognitiveAdvantage: 'Fase kantuk biologis: -15% kecepatan retensi.'
      };
    }
    if (hourOfDay >= 18 && hourOfDay < 21) {
      return {
        factor: 1.20,
        phaseName: 'Pre-Sleep Consolidation (Ba\'da Maghrib & Isya)',
        cognitiveAdvantage: 'Kesiapan tidur gelombang lambat: +20% penguncian hafalan ke hipokampus.'
      };
    }
    return {
      factor: 0.75,
      phaseName: 'Fatigue Window (Larut Malam)',
      cognitiveAdvantage: 'Kelelahan kognitif: disarankan istirahat untuk memulihkan neurotransmiter.'
    };
  }

  /**
   * Calculates current retention probability R(t) = exp(-t / (S * C(h)))
   */
  public static computeRetention(
    elapsedDays: number,
    stabilityDays: number,
    hourOfDay: number = new Date().getHours()
  ): number {
    const { factor } = this.getCircadianEfficiency(hourOfDay);
    const effectiveStability = Math.max(0.5, stabilityDays * factor);
    const retention = Math.exp(-elapsedDays / effectiveStability);
    return Number(Math.max(0.01, Math.min(1.0, retention)).toFixed(4));
  }

  /**
   * Generates prioritized Muraja'ah Schedule from an array of memorized ayahs.
   */
  public static prioritizeMurajaahList(
    ayahs: { surahNumber: number; ayahNumber: number; stability: number; lastReviewedDaysAgo: number }[],
    currentHour: number = new Date().getHours()
  ): AyahMemoryProfile[] {
    const evaluated: AyahMemoryProfile[] = ayahs.map((a) => {
      const retention = this.computeRetention(a.lastReviewedDaysAgo, a.stability, currentHour);
      let healthTier: MemorizationHealthTier = 'MUTQIN_STABLE';
      if (retention < 0.70) healthTier = 'CRITICAL_URGENT';
      else if (retention <= 0.85) healthTier = 'OPTIMAL_DUE';

      const window = currentHour < 12 
        ? 'Ba\'da Subuh / Pagi (Puncak Konsolidasi)' 
        : 'Ba\'da Maghrib (Pre-Sleep Consolidation)';

      return {
        surahNumber: a.surahNumber,
        ayahNumber: a.ayahNumber,
        stabilityDays: a.stability,
        difficulty: 5,
        lastReviewedDate: new Date(Date.now() - a.lastReviewedDaysAgo * 86400000).toISOString().split('T')[0],
        elapsedDays: a.lastReviewedDaysAgo,
        retentionProbability: retention,
        healthTier,
        recommendedTimeWindow: window
      };
    });

    // Sort ascending by retention probability (most endangered verses first)
    evaluated.sort((a, b) => a.retentionProbability - b.retentionProbability);
    return evaluated;
  }
}

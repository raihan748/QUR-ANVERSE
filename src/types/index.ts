export type NavigationTab = 
  | 'mushaf' 
  | 'tilawah'
  | 'murojaah_ai' 
  | 'simai' 
  | 'challenge' 
  | 'prayer' 
  | 'dashboard' 
  | 'download';

export interface SurahMeta {
  number: number;
  name: string; // e.g. "الفاتحة"
  latinName: string; // e.g. "Al-Fatihah"
  meaning: string; // e.g. "Pembukaan"
  ayahCount: number;
  revelationPlace: 'Makkah' | 'Madinah';
  juzStart: number;
  juzList?: number[];
}

export interface WordData {
  id: number;
  arabic: string;
  transliteration: string;
  meaningId: string;
}

export interface Ayat {
  numberInSurah: number;
  numberInQuran: number;
  surahNumber: number;
  surahName: string;
  arabicText: string;
  translation: string;
  transliteration: string;
  juz: number;
  page?: number;
  audioUrl: string; // Mishary Rashid Alafasy URL
  words?: WordData[];
  tafsirShort?: string;
  asbabunNuzul?: string;
}

export interface EvaluationResult {
  accuracyScore: number;
  isPassed: boolean; // accuracyScore >= 80
  recognizedText: string;
  expectedArabic: string;
  expectedLatin: string;
  wordEvaluations: {
    expectedWord: string;
    spokenWord?: string;
    status: 'correct' | 'warning' | 'error';
    meaning?: string;
  }[];
  aiAdabPraise: string;
  aiCorrectionNote: string;
  syekhAudioUrl: string;
}

export type SimaiLevel = 'pemula' | 'hafidz' | 'hafidzah';
export type ChallengeMode = 'ai' | 'timer' | 'mandiri';

export interface PrayerTime {
  id: 'subuh' | 'terbit' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';
  name: string;
  arabicName: string;
  timeStr: string; // e.g. "04:48"
  timeDate: Date;
  isPassed: boolean;
  isNext: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl: string;
  hafidzLevel: string;
  totalXp: number;
  streakCount: number;
  lastMurojaahDate: string;
}

export interface WeakVerse {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicText: string;
  translation: string;
  errorCount: number;
  lastTestedDate: string;
  resolved: boolean;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicText: string;
  translation: string;
  note?: string;
  createdAt: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'murojaah' | 'streak' | 'mushaf' | 'challenge';
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

// ==============================================================================
// ENTERPRISE ARCHITECTURE & DEEP BACKEND TYPES (APSI STANDARDS)
// ==============================================================================

// 1. Tajwid AST & Formal Grammar Types
export type TajwidRuleType = 
  | 'idgham_bighunnah'
  | 'idgham_bilaghunnah'
  | 'iqlab'
  | 'ikhfa_haqiqi'
  | 'izhar_halqi'
  | 'mad_thobi_i'
  | 'mad_wajib_muttashil'
  | 'mad_jaiz_munfashil'
  | 'mad_lazim'
  | 'mad_arid_lissukun'
  | 'qalqalah_sugra'
  | 'qalqalah_kubra'
  | 'ghunnah_musyaddadah'
  | 'ikhfa_syafawi'
  | 'idgham_mimi'
  | 'izhar_syafawi'
  | 'idzhar_qamariyah'
  | 'idgham_syamsiyah'
  | 'lam_jalalah_tafkhim'
  | 'lam_jalalah_tarqiq'
  | 'ra_tafkhim'
  | 'ra_tarqiq';

export interface TajwidToken {
  index: number;
  char: string;
  rule: TajwidRuleType;
  ruleLabel: string;
  description: string;
  colorHex: string;
  harakatDuration: number; // in ketukan / harakat beats (e.g. 2, 4, 5, 6)
  startOffset: number;
  endOffset: number;
  matchedPhoneme: string;
}

export interface TajwidAnalysisResult {
  surahNumber: number;
  ayahNumber: number;
  rawArabic: string;
  normalizedArabic: string;
  tokens: TajwidToken[];
  ruleSummary: Record<TajwidRuleType, number>;
  totalRulesDetected: number;
  expectedHarakatTotalBeats: number;
  astTreeJson: string;
}

// 2. Acoustic Phonetic & DTW (Dynamic Time Warping) Types
export type MakhrajCategory = 
  | 'Al-Jauf'       // Rongga Mulut & Tenggorokan (Huruf Mad: ا, و, ي)
  | 'Al-Halq'       // Tenggorokan (ء, ه, ع, ح, غ, خ)
  | 'Al-Lisan'      // Lidah (ق, ك, ج, ش, ي, ض, ل, ن, ر, ط, د, ت, ص, ز, س, ظ, ذ, ث)
  | 'Asy-Syafatain' // Dua Bibir (ف, ب, م, و)
  | 'Al-Khaisyum';  // Rongga Hidung / Ghunnah (ن, م bertasydid)

export interface MakhrajPoint {
  letter: string;
  name: string;
  category: MakhrajCategory;
  coordinates: [number, number, number]; // 3D anatomical coordinate (x: sagittal, y: coronal, z: axial)
  formants: { f1: number; f2: number; f3: number }; // Target Formant Frequencies (Hz)
  subCategory: string;
  characteristics: string[]; // e.g. ["Hams", "Rikhwah", "Isti'la", "Infitah"]
}

export interface AcousticFeatureVector {
  timestampMs: number;
  rmsDecibels: number;
  zeroCrossingRate: number;
  spectralCentroidHz: number;
  estimatedPitchHz: number;
  dominantFormantHz: number;
}

export interface DTWAlignmentResult {
  normalizedDistance: number;
  acousticSimilarityPercentage: number;
  alignmentPath: [number, number][]; // [userFrameIdx, syekhFrameIdx]
  userDurationMs: number;
  referenceDurationMs: number;
  tempoRatio: number;
  makhrajDeviations: {
    letter: string;
    expectedMakhraj: string;
    deviationScore: number;
    feedback: string;
  }[];
}

// 3. SuperMemo SM-2 & Adaptive Tikrar Spaced Repetition Types
export interface SM2ItemState {
  itemKey: string; // e.g. "surah-67-ayah-1"
  repetitionCount: number; // n
  easinessFactor: number;  // EF (default 2.5, min 1.3)
  intervalDays: number;    // I_n
  nextReviewDate: string;  // ISO Date string
  lastReviewedDate: string;
  retentionProbability: number; // 0.0 - 1.0
  tikrarPhase: 'Bi_An_Nazhar' | 'Bi_Al_Ghaib' | 'Sabqi' | 'Manzil';
  consecutiveSuccesses: number;
}

export interface SM2EvaluationPayload {
  qualityGrade: number; // 0 to 5 (0: complete blackout, 5: perfect instant recall)
  responseLatencyMs: number;
  accuracyScore: number;
}

// 4. Bayesian Knowledge Tracing (BKT) Hafidz Mastery Types
export interface BKTParameters {
  pL0: number; // Prior probability of knowing the verse before practice (default ~0.10)
  pT: number;  // Probability of transitioning from unlearned to learned (default ~0.25)
  pG: number;  // Probability of guessing correctly while unlearned (default ~0.15)
  pS: number;  // Probability of slipping/making a mistake while learned (default ~0.08)
}

export interface BKTState {
  surahNumber: number;
  ayahNumber: number;
  masteryProbability: number; // P(L_t) between 0.00 and 1.00
  practiceCount: number;
  status: 'belum_hafal' | 'tahap_latihan' | 'hampir_mutqin' | 'mutqin_sempurna';
  lastUpdated: string;
}

export interface BKTCompetencyMatrix {
  userId: string;
  overall30JuzMasteryPercentage: number;
  juzBreakdown: {
    juz: number;
    totalAyahs: number;
    masteredAyahs: number;
    averageProbability: number;
    status: 'Perlu Penguatan' | 'Sedang Berjalan' | 'Mutqin';
  }[];
  weakestSurahs: { surahNumber: number; surahName: string; averageMastery: number }[];
  strongestSurahs: { surahNumber: number; surahName: string; averageMastery: number }[];
}

// 5. Celestial High-Precision Astronomy Types
export interface CelestialCoordinates {
  julianDate: number;
  solarDeclinationDeg: number;
  equationOfTimeMinutes: number;
  solarNoonUtcHours: number;
  sunTransitAzimuthDeg: number;
}

export interface QiblaVector {
  bearingDegrees: number;
  compassDirectionStr: string;
  greatCircleDistanceKm: number;
  city: string;
  latitude: number;
  longitude: number;
}

// 6. Cryptographic Merkle-Chained Audit Ledger Types
export interface MerkleAuditBlock {
  blockIndex: number;
  timestamp: string;
  userId: string;
  eventType: 'murojaah_test' | 'xp_awarded' | 'streak_increment' | 'badge_unlocked' | 'certification_issued';
  payloadJson: string;
  previousBlockHash: string;
  nonce: string;
  currentBlockHash: string; // HMAC-SHA256(previousBlockHash + payloadJson + nonce)
}

export interface MerkleAuditChainVerification {
  isValid: boolean;
  totalBlocksVerified: number;
  brokenBlockIndex: number | null;
  merkleRootHash: string;
  tamperDetected: boolean;
  verifiedAt: string;
}

// 7. Semantic Quranic Knowledge Graph Types
export interface KnowledgeGraphNode {
  id: string; // e.g. "surah_67", "root_r-h-m", "theme_tawhid"
  type: 'surah' | 'ayah' | 'root_word' | 'theme' | 'asbabun_nuzul';
  label: string;
  properties: Record<string, any>;
}

export interface KnowledgeGraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationship: 'CONTAINS' | 'DERIVED_FROM_ROOT' | 'CROSS_REFERENCES' | 'THEMATIC_SIMILARITY' | 'HISTORICAL_SEQUENCE';
  weight: number;
}

// 8. Resilience Gateway & Circuit Breaker Types
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastStateChange: string;
  totalRequestsHandled: number;
  fallbackTriggeredCount: number;
}


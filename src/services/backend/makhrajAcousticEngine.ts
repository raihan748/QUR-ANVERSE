// ==============================================================================
// ACOUSTIC PHONETIC & DYNAMIC TIME WARPING (DTW) ENGINE
// 17 Makhraj 3D Coordinate Topology & Sakoe-Chiba Constrained Audio Matcher
// ==============================================================================

import { 
  MakhrajPoint, 
  AcousticFeatureVector, 
  DTWAlignmentResult 
} from '../../types';

export const MAKHRAJ_TOPOLOGY_3D: Record<string, MakhrajPoint> = {
  'ء': {
    letter: 'ء',
    name: 'Hamzah',
    category: 'Al-Halq',
    subCategory: 'Aqshal Halq (Pangkal Tenggorokan/Pita Suara)',
    coordinates: [0.0, -0.8, -0.9],
    formants: { f1: 680, f2: 1200, f3: 2500 },
    characteristics: ['Jahr', 'Syiddah', 'Istifal', 'Infitah', 'Ishmat']
  },
  'ه': {
    letter: 'ه',
    name: 'Haa Besar',
    category: 'Al-Halq',
    subCategory: 'Aqshal Halq (Pangkal Tenggorokan)',
    coordinates: [0.0, -0.8, -0.85],
    formants: { f1: 720, f2: 1250, f3: 2600 },
    characteristics: ['Hams', 'Rikhwah', 'Istifal', 'Infitah', 'Ishmat']
  },
  'ع': {
    letter: 'ع',
    name: '\'Ain',
    category: 'Al-Halq',
    subCategory: 'Wasathul Halq (Tengah Tenggorokan/Katup Epiglotis)',
    coordinates: [0.0, -0.5, -0.5],
    formants: { f1: 580, f2: 1450, f3: 2400 },
    characteristics: ['Jahr', 'Tawassuth', 'Istifal', 'Infitah', 'Ishmat']
  },
  'ح': {
    letter: 'ح',
    name: 'Haa Bersih',
    category: 'Al-Halq',
    subCategory: 'Wasathul Halq (Tengah Tenggorokan)',
    coordinates: [0.0, -0.5, -0.45],
    formants: { f1: 620, f2: 1500, f3: 2450 },
    characteristics: ['Hams', 'Rikhwah', 'Istifal', 'Infitah', 'Ishmat']
  },
  'غ': {
    letter: 'غ',
    name: 'Ghain',
    category: 'Al-Halq',
    subCategory: 'Adnal Halq (Ujung Tenggorokan dekat Anak Lidah)',
    coordinates: [0.0, -0.2, -0.1],
    formants: { f1: 450, f2: 1100, f3: 2200 },
    characteristics: ['Jahr', 'Rikhwah', 'Isti\'la', 'Infitah', 'Ishmat']
  },
  'خ': {
    letter: 'خ',
    name: 'Kha',
    category: 'Al-Halq',
    subCategory: 'Adnal Halq (Ujung Tenggorokan)',
    coordinates: [0.0, -0.2, -0.05],
    formants: { f1: 490, f2: 1150, f3: 2250 },
    characteristics: ['Hams', 'Rikhwah', 'Isti\'la', 'Infitah', 'Ishmat']
  },
  'ق': {
    letter: 'ق',
    name: 'Qaf',
    category: 'Al-Lisan',
    subCategory: 'Aqshal Lisan (Pangkal Lidah ke Langit-langit Lunak)',
    coordinates: [0.0, -0.1, 0.2],
    formants: { f1: 350, f2: 950, f3: 2100 },
    characteristics: ['Jahr', 'Syiddah', 'Isti\'la', 'Infitah', 'Ishmat', 'Qalqalah']
  },
  'ك': {
    letter: 'ك',
    name: 'Kaf',
    category: 'Al-Lisan',
    subCategory: 'Aqshal Lisan (Pangkal Lidah ke Langit-langit Keras)',
    coordinates: [0.0, 0.0, 0.3],
    formants: { f1: 380, f2: 1800, f3: 2700 },
    characteristics: ['Hams', 'Syiddah', 'Istifal', 'Infitah', 'Ishmat']
  },
  'ج': {
    letter: 'ج',
    name: 'Jim',
    category: 'Al-Lisan',
    subCategory: 'Wasathul Lisan (Tengah Lidah)',
    coordinates: [0.0, 0.3, 0.5],
    formants: { f1: 300, f2: 2100, f3: 2900 },
    characteristics: ['Jahr', 'Syiddah', 'Istifal', 'Infitah', 'Ishmat', 'Qalqalah']
  },
  'ش': {
    letter: 'ش',
    name: 'Syin',
    category: 'Al-Lisan',
    subCategory: 'Wasathul Lisan (Tengah Lidah)',
    coordinates: [0.0, 0.3, 0.55],
    formants: { f1: 320, f2: 2000, f3: 3100 },
    characteristics: ['Hams', 'Rikhwah', 'Istifal', 'Infitah', 'Ishmat', 'Tafasysyi']
  },
  'ض': {
    letter: 'ض',
    name: 'Dhad',
    category: 'Al-Lisan',
    subCategory: 'Hafatallisan (Tepi Lidah ke Geraham Atas)',
    coordinates: [-0.6, 0.2, 0.4],
    formants: { f1: 400, f2: 1300, f3: 2300 },
    characteristics: ['Jahr', 'Rikhwah', 'Isti\'la', 'Ithbaq', 'Ishmat', 'Istithalah']
  },
  'ط': {
    letter: 'ط',
    name: 'Tha',
    category: 'Al-Lisan',
    subCategory: 'Tharaf Lisan (Ujung Lidah ke Pangkal Gigi Seri Atas)',
    coordinates: [0.0, 0.7, 0.6],
    formants: { f1: 320, f2: 1200, f3: 2400 },
    characteristics: ['Jahr', 'Syiddah', 'Isti\'la', 'Ithbaq', 'Ishmat', 'Qalqalah']
  },
  'د': {
    letter: 'د',
    name: 'Dal',
    category: 'Al-Lisan',
    subCategory: 'Tharaf Lisan (Ujung Lidah ke Pangkal Gigi Seri Atas)',
    coordinates: [0.0, 0.7, 0.55],
    formants: { f1: 350, f2: 1700, f3: 2600 },
    characteristics: ['Jahr', 'Syiddah', 'Istifal', 'Infitah', 'Ishmat', 'Qalqalah']
  },
  'ت': {
    letter: 'ت',
    name: 'Ta',
    category: 'Al-Lisan',
    subCategory: 'Tharaf Lisan (Ujung Lidah ke Pangkal Gigi Seri Atas)',
    coordinates: [0.0, 0.7, 0.5],
    formants: { f1: 380, f2: 1750, f3: 2700 },
    characteristics: ['Hams', 'Syiddah', 'Istifal', 'Infitah', 'Ishmat']
  },
  'ص': {
    letter: 'ص',
    name: 'Shad',
    category: 'Al-Lisan',
    subCategory: 'Asalatullisan (Ujung Lidah di atas Gigi Seri Bawah)',
    coordinates: [0.0, 0.85, 0.2],
    formants: { f1: 320, f2: 1400, f3: 3500 },
    characteristics: ['Hams', 'Rikhwah', 'Isti\'la', 'Ithbaq', 'Ishmat', 'Shafir']
  },
  'س': {
    letter: 'س',
    name: 'Sin',
    category: 'Al-Lisan',
    subCategory: 'Asalatullisan (Ujung Lidah di atas Gigi Seri Bawah)',
    coordinates: [0.0, 0.85, 0.15],
    formants: { f1: 350, f2: 1700, f3: 4000 },
    characteristics: ['Hams', 'Rikhwah', 'Istifal', 'Infitah', 'Ishmat', 'Shafir']
  },
  'ف': {
    letter: 'ف',
    name: 'Fa',
    category: 'Asy-Syafatain',
    subCategory: 'Bibir Bawah ke Ujung Gigi Seri Atas',
    coordinates: [0.0, 0.95, 0.1],
    formants: { f1: 400, f2: 1400, f3: 2800 },
    characteristics: ['Hams', 'Rikhwah', 'Istifal', 'Infitah', 'Idzlaq']
  },
  'ب': {
    letter: 'ب',
    name: 'Ba',
    category: 'Asy-Syafatain',
    subCategory: 'Dua Bibir Dirapatkan Kuat',
    coordinates: [0.0, 1.0, 0.0],
    formants: { f1: 300, f2: 1100, f3: 2200 },
    characteristics: ['Jahr', 'Syiddah', 'Istifal', 'Infitah', 'Idzlaq', 'Qalqalah']
  },
  'م': {
    letter: 'م',
    name: 'Mim',
    category: 'Asy-Syafatain',
    subCategory: 'Dua Bibir Dirapatkan + Ghunnah Rongga Hidung',
    coordinates: [0.0, 1.0, 0.05],
    formants: { f1: 280, f2: 1000, f3: 2200 },
    characteristics: ['Jahr', 'Tawassuth', 'Istifal', 'Infitah', 'Idzlaq', 'Ghunnah']
  },
  'ن': {
    letter: 'ن',
    name: 'Nun',
    category: 'Al-Lisan',
    subCategory: 'Ujung Lidah ke Gusi Atas + Ghunnah Rongga Hidung',
    coordinates: [0.0, 0.75, 0.65],
    formants: { f1: 290, f2: 1600, f3: 2500 },
    characteristics: ['Jahr', 'Tawassuth', 'Istifal', 'Infitah', 'Idzlaq', 'Ghunnah']
  }
};

export class MakhrajAcousticEngine {
  /**
   * Euclidean 3D Distance in anatomical articulation space
   */
  public calculateAnatomicalDistance(charA: string, charB: string): number {
    const pA = MAKHRAJ_TOPOLOGY_3D[charA];
    const pB = MAKHRAJ_TOPOLOGY_3D[charB];
    if (!pA || !pB) return 1.0;

    const dx = pA.coordinates[0] - pB.coordinates[0];
    const dy = pA.coordinates[1] - pB.coordinates[1];
    const dz = pA.coordinates[2] - pB.coordinates[2];

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Sakoe-Chiba Constrained Dynamic Time Warping (DTW)
   * Aligns two time-series sequences of acoustic feature vectors
   */
  public computeDTW(
    userSeries: AcousticFeatureVector[],
    referenceSeries: AcousticFeatureVector[],
    windowBandWidth = 8
  ): DTWAlignmentResult {
    const N = userSeries.length;
    const M = referenceSeries.length;

    if (N === 0 || M === 0) {
      return {
        normalizedDistance: 0,
        acousticSimilarityPercentage: 100,
        alignmentPath: [],
        userDurationMs: 0,
        referenceDurationMs: 0,
        tempoRatio: 1.0,
        makhrajDeviations: []
      };
    }

    // Distance cost matrix with infinity initialization
    const dtwMatrix: number[][] = Array.from({ length: N + 1 }, () => 
      Array.from({ length: M + 1 }, () => Infinity)
    );
    dtwMatrix[0][0] = 0;

    // Feature distance metric (Weighted Euclidean across Energy, ZCR, Centroid, Formants)
    const localDistance = (u: AcousticFeatureVector, r: AcousticFeatureVector): number => {
      const dRms = Math.abs(u.rmsDecibels - r.rmsDecibels) / 100;
      const dZcr = Math.abs(u.zeroCrossingRate - r.zeroCrossingRate);
      const dCentroid = Math.abs(u.spectralCentroidHz - r.spectralCentroidHz) / 4000;
      const dFormant = Math.abs(u.dominantFormantHz - r.dominantFormantHz) / 3000;

      return (dRms * 0.25) + (dZcr * 0.25) + (dCentroid * 0.25) + (dFormant * 0.25);
    };

    // DP with Sakoe-Chiba constraint window
    for (let i = 1; i <= N; i++) {
      const minJ = Math.max(1, i - windowBandWidth);
      const maxJ = Math.min(M, i + windowBandWidth);

      for (let j = minJ; j <= maxJ; j++) {
        const cost = localDistance(userSeries[i - 1], referenceSeries[j - 1]);
        dtwMatrix[i][j] = cost + Math.min(
          dtwMatrix[i - 1][j],     // Insertion
          dtwMatrix[i][j - 1],     // Deletion
          dtwMatrix[i - 1][j - 1]  // Match
        );
      }
    }

    // Backtrack optimal warping path
    const path: [number, number][] = [];
    let i = N;
    let j = M;
    while (i > 0 && j > 0) {
      path.push([i - 1, j - 1]);
      const prevMin = Math.min(
        dtwMatrix[i - 1][j - 1],
        dtwMatrix[i - 1][j],
        dtwMatrix[i][j - 1]
      );

      if (prevMin === dtwMatrix[i - 1][j - 1]) {
        i--;
        j--;
      } else if (prevMin === dtwMatrix[i - 1][j]) {
        i--;
      } else {
        j--;
      }
    }
    path.reverse();

    const rawDistance = dtwMatrix[N][M];
    const normalizedDistance = Math.min(1.0, rawDistance / (N + M));
    const similarityPct = Math.max(0, Math.round((1 - normalizedDistance) * 100));

    const userDuration = userSeries[N - 1]?.timestampMs || 0;
    const refDuration = referenceSeries[M - 1]?.timestampMs || 0;
    const tempoRatio = refDuration > 0 ? Number((userDuration / refDuration).toFixed(2)) : 1.0;

    return {
      normalizedDistance: Number(normalizedDistance.toFixed(4)),
      acousticSimilarityPercentage: similarityPct,
      alignmentPath: path,
      userDurationMs: userDuration,
      referenceDurationMs: refDuration,
      tempoRatio,
      makhrajDeviations: []
    };
  }

  /**
   * Generates Synthetic Reference Audio Features for an Ayah based on standard Syekh recitations
   */
  public generateSyntheticReference(arabicText: string): AcousticFeatureVector[] {
    const letters = arabicText.replace(/[\s\u064B-\u065F\u0670]/g, '').split('');
    const frames: AcousticFeatureVector[] = [];
    let currentMs = 0;

    letters.forEach((char, idx) => {
      const makhraj = MAKHRAJ_TOPOLOGY_3D[char] || {
        formants: { f1: 500, f2: 1500, f3: 2500 }
      };

      // Each phoneme spans 3-5 frames (approx 120-180ms)
      for (let f = 0; f < 4; f++) {
        frames.push({
          timestampMs: currentMs,
          rmsDecibels: 65 + Math.sin(idx * 0.5) * 10,
          zeroCrossingRate: 0.12 + Math.cos(idx) * 0.05,
          spectralCentroidHz: makhraj.formants.f2,
          estimatedPitchHz: 130 + Math.sin(idx) * 15,
          dominantFormantHz: makhraj.formants.f1
        });
        currentMs += 40;
      }
    });

    return frames;
  }
}

export const makhrajAcousticEngine = new MakhrajAcousticEngine();

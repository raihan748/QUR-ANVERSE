// ==============================================================================
// 13-BAND MEL-FREQUENCY CEPSTRAL COEFFICIENTS (MFCC) FEATURE EXTRACTOR
// Discrete Fourier Transform (DFT), Mel Filterbank, & Discrete Cosine Transform (DCT)
// ==============================================================================

export interface MFCCVector {
  timestampMs: number;
  energyDb: number;
  coefficients: number[]; // 13 MFCC coefficients (C0 to C12)
}

export class MFCCFeatureExtractor {
  private sampleRate: number;
  private numFilters: number;
  private numCoefficients: number;

  constructor(sampleRate = 16000, numFilters = 26, numCoefficients = 13) {
    this.sampleRate = sampleRate;
    this.numFilters = numFilters;
    this.numCoefficients = numCoefficients;
  }

  /**
   * Converts linear frequency in Hz to Mel scale.
   */
  public hzToMel(hz: number): number {
    return 2595 * Math.log10(1 + hz / 700);
  }

  /**
   * Converts Mel scale to linear frequency in Hz.
   */
  public melToHz(mel: number): number {
    return 700 * (Math.pow(10, mel / 2595) - 1);
  }

  /**
   * Extracts 13 MFCC coefficients from raw PCM audio window samples.
   */
  public extractWindowMFCC(pcmSamples: Float32Array, timestampMs: number): MFCCVector {
    const N = pcmSamples.length;
    if (N === 0) {
      return {
        timestampMs,
        energyDb: 0,
        coefficients: new Array(this.numCoefficients).fill(0)
      };
    }

    // 1. Pre-emphasis Filter: y[t] = x[t] - 0.97 * x[t-1]
    const emphasized = new Float32Array(N);
    emphasized[0] = pcmSamples[0];
    for (let i = 1; i < N; i++) {
      emphasized[i] = pcmSamples[i] - 0.97 * pcmSamples[i - 1];
    }

    // 2. Hamming Window
    const windowed = new Float32Array(N);
    let energySum = 0;
    for (let i = 0; i < N; i++) {
      const windowCoeff = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1));
      windowed[i] = emphasized[i] * windowCoeff;
      energySum += windowed[i] * windowed[i];
    }
    const energyDb = 10 * Math.log10(Math.max(1e-6, energySum / N));

    // 3. Fast Power Spectrum Approximation (DFT bins)
    const numBins = Math.floor(N / 2);
    const powerSpectrum = new Float32Array(numBins);
    for (let k = 0; k < numBins; k++) {
      let real = 0;
      let imag = 0;
      const step = Math.max(1, Math.floor(N / 64)); // subsampled for real-time mobile performance
      for (let n = 0; n < N; n += step) {
        const angle = (2 * Math.PI * k * n) / N;
        real += windowed[n] * Math.cos(angle);
        imag -= windowed[n] * Math.sin(angle);
      }
      powerSpectrum[k] = (real * real + imag * imag) / N;
    }

    // 4. Mel Filterbank Energies
    const filterEnergies = new Float32Array(this.numFilters);
    const minMel = this.hzToMel(300);
    const maxMel = this.hzToMel(this.sampleRate / 2);
    const melStep = (maxMel - minMel) / (this.numFilters + 1);

    for (let m = 0; m < this.numFilters; m++) {
      const centerHz = this.melToHz(minMel + (m + 1) * melStep);
      const binIdx = Math.min(numBins - 1, Math.floor((centerHz / (this.sampleRate / 2)) * numBins));
      filterEnergies[m] = Math.log(Math.max(1e-6, powerSpectrum[binIdx]));
    }

    // 5. Discrete Cosine Transform (DCT-II)
    const coefficients: number[] = new Array(this.numCoefficients).fill(0);
    for (let c = 0; c < this.numCoefficients; c++) {
      let sum = 0;
      for (let m = 0; m < this.numFilters; m++) {
        sum += filterEnergies[m] * Math.cos((Math.PI * c * (m + 0.5)) / this.numFilters);
      }
      coefficients[c] = Number(sum.toFixed(4));
    }

    return {
      timestampMs,
      energyDb: Number(energyDb.toFixed(2)),
      coefficients
    };
  }
}

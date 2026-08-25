// ==============================================================================
// FORMAL QURANIC PHONEME REGISTRY & ARABIC RASM UTSMANI MATRIX
// Acoustic, Articulatory, and Unicode Codepoint Standards
// ==============================================================================

export interface PhoneticCharacterDescriptor {
  char: string;
  unicodePoint: string;
  arabicName: string;
  latinName: string;
  makhraj: 'Al-Jauf' | 'Al-Halq' | 'Al-Lisan' | 'Asy-Syafatain' | 'Al-Khaisyum';
  sifat: {
    hamsOrJahr: 'Hams' | 'Jahr';
    syiddahOrRakhawah: 'Syiddah' | 'Rakhawah' | 'Tawassuth';
    istilaOrIstifal: 'Isti\'la' | 'Istifal';
    ithbaqOrInfitah: 'Ithbaq' | 'Infitah';
    idzhlaqOrIshmat: 'Idzhlaq' | 'Ishmat';
    additionalSifat?: string[];
  };
  formants: {
    f1Hz: number;
    f2Hz: number;
    bandwidthHz: number;
  };
}

export class QuranicPhonemeRegistry {
  private static readonly PHONEME_MAP: Map<string, PhoneticCharacterDescriptor> = new Map();

  static {
    const rawDescriptors: PhoneticCharacterDescriptor[] = [
      {
        char: 'ء',
        unicodePoint: 'U+0621',
        arabicName: 'هَمْزَة',
        latinName: 'Hamzah',
        makhraj: 'Al-Halq',
        sifat: { hamsOrJahr: 'Jahr', syiddahOrRakhawah: 'Syiddah', istilaOrIstifal: 'Istifal', ithbaqOrInfitah: 'Infitah', idzhlaqOrIshmat: 'Ishmat' },
        formants: { f1Hz: 720, f2Hz: 1240, bandwidthHz: 120 }
      },
      {
        char: 'ب',
        unicodePoint: 'U+0628',
        arabicName: 'بَاء',
        latinName: 'Baa',
        makhraj: 'Asy-Syafatain',
        sifat: { hamsOrJahr: 'Jahr', syiddahOrRakhawah: 'Syiddah', istilaOrIstifal: 'Istifal', ithbaqOrInfitah: 'Infitah', idzhlaqOrIshmat: 'Idzhlaq', additionalSifat: ['Qalqalah'] },
        formants: { f1Hz: 450, f2Hz: 1100, bandwidthHz: 100 }
      },
      {
        char: 'ت',
        unicodePoint: 'U+062A',
        arabicName: 'تَاء',
        latinName: 'Taa',
        makhraj: 'Al-Lisan',
        sifat: { hamsOrJahr: 'Hams', syiddahOrRakhawah: 'Syiddah', istilaOrIstifal: 'Istifal', ithbaqOrInfitah: 'Infitah', idzhlaqOrIshmat: 'Ishmat' },
        formants: { f1Hz: 350, f2Hz: 1750, bandwidthHz: 90 }
      },
      {
        char: 'ث',
        unicodePoint: 'U+062B',
        arabicName: 'ثَاء',
        latinName: 'Tsaa',
        makhraj: 'Al-Lisan',
        sifat: { hamsOrJahr: 'Hams', syiddahOrRakhawah: 'Rakhawah', istilaOrIstifal: 'Istifal', ithbaqOrInfitah: 'Infitah', idzhlaqOrIshmat: 'Ishmat' },
        formants: { f1Hz: 400, f2Hz: 1600, bandwidthHz: 95 }
      },
      {
        char: 'ج',
        unicodePoint: 'U+062C',
        arabicName: 'جِيم',
        latinName: 'Jeem',
        makhraj: 'Al-Lisan',
        sifat: { hamsOrJahr: 'Jahr', syiddahOrRakhawah: 'Syiddah', istilaOrIstifal: 'Istifal', ithbaqOrInfitah: 'Infitah', idzhlaqOrIshmat: 'Ishmat', additionalSifat: ['Qalqalah'] },
        formants: { f1Hz: 500, f2Hz: 1900, bandwidthHz: 110 }
      },
      {
        char: 'ح',
        unicodePoint: 'U+062D',
        arabicName: 'حَاء',
        latinName: 'Haa Halqi',
        makhraj: 'Al-Halq',
        sifat: { hamsOrJahr: 'Hams', syiddahOrRakhawah: 'Rakhawah', istilaOrIstifal: 'Istifal', ithbaqOrInfitah: 'Infitah', idzhlaqOrIshmat: 'Ishmat' },
        formants: { f1Hz: 650, f2Hz: 1550, bandwidthHz: 130 }
      },
      {
        char: 'خ',
        unicodePoint: 'U+062E',
        arabicName: 'خَاء',
        latinName: 'Khaa',
        makhraj: 'Al-Halq',
        sifat: { hamsOrJahr: 'Hams', syiddahOrRakhawah: 'Rakhawah', istilaOrIstifal: 'Isti\'la', ithbaqOrInfitah: 'Infitah', idzhlaqOrIshmat: 'Ishmat' },
        formants: { f1Hz: 600, f2Hz: 1400, bandwidthHz: 140 }
      },
      {
        char: 'د',
        unicodePoint: 'U+062F',
        arabicName: 'دَال',
        latinName: 'Daal',
        makhraj: 'Al-Lisan',
        sifat: { hamsOrJahr: 'Jahr', syiddahOrRakhawah: 'Syiddah', istilaOrIstifal: 'Istifal', ithbaqOrInfitah: 'Infitah', idzhlaqOrIshmat: 'Ishmat', additionalSifat: ['Qalqalah'] },
        formants: { f1Hz: 420, f2Hz: 1700, bandwidthHz: 85 }
      },
      {
        char: 'ر',
        unicodePoint: 'U+0631',
        arabicName: 'رَاء',
        latinName: 'Raa',
        makhraj: 'Al-Lisan',
        sifat: { hamsOrJahr: 'Jahr', syiddahOrRakhawah: 'Tawassuth', istilaOrIstifal: 'Istifal', ithbaqOrInfitah: 'Infitah', idzhlaqOrIshmat: 'Idzhlaq', additionalSifat: ['Inhiraf', 'Takrir'] },
        formants: { f1Hz: 480, f2Hz: 1450, bandwidthHz: 115 }
      },
      {
        char: 'ط',
        unicodePoint: 'U+0637',
        arabicName: 'طَاء',
        latinName: 'Thaa',
        makhraj: 'Al-Lisan',
        sifat: { hamsOrJahr: 'Jahr', syiddahOrRakhawah: 'Syiddah', istilaOrIstifal: 'Isti\'la', ithbaqOrInfitah: 'Ithbaq', idzhlaqOrIshmat: 'Ishmat', additionalSifat: ['Qalqalah'] },
        formants: { f1Hz: 550, f2Hz: 1300, bandwidthHz: 105 }
      },
      {
        char: 'ق',
        unicodePoint: 'U+0642',
        arabicName: 'قَاف',
        latinName: 'Qaaf',
        makhraj: 'Al-Lisan',
        sifat: { hamsOrJahr: 'Jahr', syiddahOrRakhawah: 'Syiddah', istilaOrIstifal: 'Isti\'la', ithbaqOrInfitah: 'Infitah', idzhlaqOrIshmat: 'Ishmat', additionalSifat: ['Qalqalah'] },
        formants: { f1Hz: 580, f2Hz: 1150, bandwidthHz: 125 }
      },
      {
        char: 'م',
        unicodePoint: 'U+0645',
        arabicName: 'مِيم',
        latinName: 'Meem',
        makhraj: 'Asy-Syafatain',
        sifat: { hamsOrJahr: 'Jahr', syiddahOrRakhawah: 'Tawassuth', istilaOrIstifal: 'Istifal', ithbaqOrInfitah: 'Infitah', idzhlaqOrIshmat: 'Idzhlaq', additionalSifat: ['Ghunnah'] },
        formants: { f1Hz: 300, f2Hz: 1000, bandwidthHz: 150 }
      },
      {
        char: 'ن',
        unicodePoint: 'U+0646',
        arabicName: 'نُون',
        latinName: 'Noon',
        makhraj: 'Al-Lisan',
        sifat: { hamsOrJahr: 'Jahr', syiddahOrRakhawah: 'Tawassuth', istilaOrIstifal: 'Istifal', ithbaqOrInfitah: 'Infitah', idzhlaqOrIshmat: 'Idzhlaq', additionalSifat: ['Ghunnah'] },
        formants: { f1Hz: 320, f2Hz: 1600, bandwidthHz: 140 }
      }
    ];

    rawDescriptors.forEach((d) => QuranicPhonemeRegistry.PHONEME_MAP.set(d.char, d));
  }

  public static getDescriptor(char: string): PhoneticCharacterDescriptor | undefined {
    return QuranicPhonemeRegistry.PHONEME_MAP.get(char);
  }

  public static hasQalqalah(char: string): boolean {
    const d = QuranicPhonemeRegistry.PHONEME_MAP.get(char);
    return !!d?.sifat.additionalSifat?.includes('Qalqalah');
  }

  public static isIstiLa(char: string): boolean {
    const d = QuranicPhonemeRegistry.PHONEME_MAP.get(char);
    return d?.sifat.istilaOrIstifal === 'Isti\'la';
  }

  public static isIthbaq(char: string): boolean {
    const d = QuranicPhonemeRegistry.PHONEME_MAP.get(char);
    return d?.sifat.ithbaqOrInfitah === 'Ithbaq';
  }
}

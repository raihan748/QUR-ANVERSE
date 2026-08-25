// ==============================================================================
// GHARIB SPECIAL RECITATION HANDLER & MUTAWATIR RULES LOOKUP
// High-Precision Dispatcher for Exceptional Phonetic Rules
// ==============================================================================

import { GharibItem } from '../../quranTajweedGharibService';

export class GharibSpecialRecitationHandler {
  private static readonly SPECIAL_GHARIB_LOOKUP: Map<string, GharibItem> = new Map();

  static {
    // Imalah
    GharibSpecialRecitationHandler.SPECIAL_GHARIB_LOOKUP.set('226_41', {
      id: 'gh-imalah-hud41',
      title: 'Imalah (إِمَالَة)',
      arabicTerm: 'مَجْرٰ۪ىهَا',
      surahNumber: 11,
      surahName: 'Hud',
      ayahNumber: 41,
      word: 'مَجْرٰ۪ىهَا',
      page: 226,
      pengertianBahasa: 'Imalah berarti memiringkan / mencondongkan suara fathah ke kasrah.',
      pengertianIstilah: 'Membaca fathah miring ke arah kasrah dengan bunyi vokal "e" seperti kata "sate".',
      description: 'Satu-satunya bacaan Imalah riwayat Hafsh.',
      caraBaca: 'Ucapkan "Maj-re-haa" dengan vokal "e" murni.',
      tips: 'Jangan membaca "Majraahaa" atau "Majriihaa".',
      type: 'imalah'
    });

    // Isymam
    GharibSpecialRecitationHandler.SPECIAL_GHARIB_LOOKUP.set('236_11', {
      id: 'gh-isymam-yusuf11',
      title: 'Isymam (إِشْمَام)',
      arabicTerm: 'تَأْمَ۫نَّا',
      surahNumber: 12,
      surahName: 'Yusuf',
      ayahNumber: 11,
      word: 'تَأْمَ۫نَّا',
      page: 236,
      pengertianBahasa: 'Isymam berarti menciumkan bau / memberi isyarat gerak bibir.',
      pengertianIstilah: 'Memonyongkan kedua bibir ke depan tanpa bersuara saat dengung (ghunnah) nun tasydid.',
      description: 'Isyarat dhommah yang dibuang pada kata asalnya "Laa Ta\'manunaa".',
      caraBaca: 'Monyongkan bibir saat menahan dengung lalu normalkan kembali.',
      tips: 'Jangan mengeluarkan bunyi vokal "u", hanya gerakan bibir.',
      type: 'isymam'
    });

    // Tashil
    GharibSpecialRecitationHandler.SPECIAL_GHARIB_LOOKUP.set('481_44', {
      id: 'gh-tashil-fushshilat44',
      title: 'Tashil (تَسْهِيل)',
      arabicTerm: 'ءَ۬اعْجَمِىٌّ',
      surahNumber: 41,
      surahName: 'Fushshilat',
      ayahNumber: 44,
      word: 'ءَ۬اعْجَمِىٌّ',
      page: 481,
      pengertianBahasa: 'Tashil berarti memudahkan / meringankan.',
      pengertianIstilah: 'Membaca hamzah kedua secara lunak di antara hamzah dan alif mad.',
      description: 'Peringanan bunyi hamzah kedua.',
      caraBaca: 'Hamzah 1 tegas ("A"), hamzah 2 mengalir lembut ("-a\'").',
      tips: 'Bunyinya menjadi "A-a\'jamiyyun".',
      type: 'tashil'
    });

    // Naql
    GharibSpecialRecitationHandler.SPECIAL_GHARIB_LOOKUP.set('516_11', {
      id: 'gh-naql-hujurat11',
      title: 'Naql (نَقْل)',
      arabicTerm: 'بِئْسَ ٱلِٱسْمُ',
      surahNumber: 49,
      surahName: 'Al-Hujurat',
      ayahNumber: 11,
      word: 'بِئْسَ ٱلِٱسْمُ',
      page: 516,
      pengertianBahasa: 'Naql berarti memindahkan / menggeser.',
      pengertianIstilah: 'Memindahkan kasrah hamzah washal ke huruf lam sukun sebelumnya sehingga dibaca "Bi\'salismu".',
      description: 'Pemindahan harakat kasrah.',
      caraBaca: 'Langsung sambung "Bi\'sa" ke "lismu" menjadi "Bi\'salismu".',
      tips: 'Dilarang membaca "Bi\'sa Al-Ismu".',
      type: 'naql'
    });
  }

  public static getSpecialGharib(page: number, ayah: number): GharibItem | undefined {
    return GharibSpecialRecitationHandler.SPECIAL_GHARIB_LOOKUP.get(`${page}_${ayah}`);
  }
}

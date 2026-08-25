// ==============================================================================
// TAJWEED & GHARIB KNOWLEDGE ENGINE FOR 604 PAGES OF MADINAH MUSHAF
// Real-time Linguistic Analysis, Color Annotation, and Special Recitation Guide
// ==============================================================================

import { TajwidRuleEngine } from './backend/tajwidRuleEngine';
import { MushafLine } from './madinahPageService';

const tajwidEngine = new TajwidRuleEngine();

export interface TajwidRuleItem {
  id: string;
  ruleName: string;
  ruleCategory: 'nun_mati_tanwin' | 'mim_mati' | 'ghunnah' | 'qalqalah' | 'mad' | 'lam_ra';
  matchedWord: string;
  surahNumber?: number;
  ayahNumber?: number;
  colorHex: string;
  harakatDuration: number;
  description: string;
  caraBaca: string;
}

export interface GharibItem {
  id: string;
  title: string;
  arabicTerm: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  word: string;
  page: number;
  description: string;
  caraBaca: string;
  tips: string;
  type: 'imalah' | 'isymam' | 'tashil' | 'naql' | 'saktah' | 'ibdal' | 'sajdah' | 'sufr';
}

// 1. Comprehensive Gharib & Special Recitation Dictionary (Standar Qira'at Hafs 'an 'Ashim)
export const GHARIB_DICTIONARY: Record<number, GharibItem[]> = {
  39: [{
    id: 'gh-39',
    title: 'Shad dibaca Sin (ص dibaca س)',
    arabicTerm: 'يَبْصُۜطُ',
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    ayahNumber: 245,
    word: 'يَبْصُۜطُ',
    page: 39,
    description: 'Terdapat huruf Sin kecil di atas huruf Shad pada kata يَبْصُۜطُ.',
    caraBaca: 'Wajib dibaca dengan huruf Sin murni: "Yabsuthu" (bukan Yabshuthu).',
    tips: 'Lafadzkan dengan desis halus huruf Sin tanpa menebalkan lidah.',
    type: 'ibdal'
  }],
  159: [{
    id: 'gh-159',
    title: 'Shad dibaca Sin (ص dibaca س)',
    arabicTerm: 'بَصْۜطَةً',
    surahNumber: 7,
    surahName: "Al-A'raf",
    ayahNumber: 69,
    word: 'بَصْۜطَةً',
    page: 159,
    description: 'Terdapat huruf Sin kecil di atas huruf Shad pada kata بَصْۜطَةً.',
    caraBaca: 'Wajib dibaca dengan huruf Sin murni: "Basthotan" (bukan Bashthotan).',
    tips: 'Bibir tipis mengalirkan desis huruf Sin sukun.',
    type: 'ibdal'
  }],
  176: [{
    id: 'gh-176',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'وَيَسْجُدُونَ لَهُۥ',
    surahNumber: 7,
    surahName: "Al-A'raf",
    ayahNumber: 206,
    word: 'وَلَهُۥ يَسْجُدُونَ ۩',
    page: 176,
    description: 'Terdapat simbol kubah sajdah (۩) di akhir ayat 206 Surat Al-A\'raf.',
    caraBaca: 'Disunnahkan melakukan Sujud Tilawah bagi pembaca dan pendengar.',
    tips: 'Baca doa sujud tilawah: سَجَدَ وَجْهِيَ لِلَّذِي خَلَقَهُ وَصَوَّرَهُ...',
    type: 'sajdah'
  }],
  226: [{
    id: 'gh-226',
    title: 'Imalah (إِمَالَة)',
    arabicTerm: 'مَجْرٰ۪ىهَا',
    surahNumber: 11,
    surahName: 'Hud',
    ayahNumber: 41,
    word: 'مَجْرٰ۪ىهَا',
    page: 226,
    description: 'Satu-satunya bacaan Imalah Kubra dalam Qira\'at Imam Hafs Thariq Asy-Syathibiyyah.',
    caraBaca: 'Harakat fathah dimiringkan ke arah kasrah, sehingga terdengar seperti vokal "e" (sate) menjadi "Maj-re-haa".',
    tips: 'Jangan membaca murni "Maj-ra-haa" atau "Maj-ri-haa", tapi condong antara A dan I ("Majrehaa").',
    type: 'imalah'
  }],
  236: [{
    id: 'gh-236',
    title: 'Isymam (إِشْمَام)',
    arabicTerm: 'لَا تَأْمَ۫نَّا',
    surahNumber: 12,
    surahName: 'Yusuf',
    ayahNumber: 11,
    word: 'لَا تَأْمَ۫نَّا',
    page: 236,
    description: 'Penggabungan dua huruf Nun (aslinya: تَأْمَنُنَا) dengan isyarat harakat dhummah.',
    caraBaca: 'Memonyongkan kedua bibir ke depan tanpa suara tepat saat menahan dengung huruf Nun tasydid (2 harakat).',
    tips: 'Boleh juga dibaca Ikhtilas (membaca cepat 2/3 harakat harakat nun pertama).',
    type: 'isymam'
  }],
  251: [{
    id: 'gh-251',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'بِٱلْغُدُوِّ وَٱلْـَٔاصَالِ ۩',
    surahNumber: 13,
    surahName: "Ar-Ra'd",
    ayahNumber: 15,
    word: 'وَٱلْـَٔاصَالِ ۩',
    page: 251,
    description: 'Terdapat simbol kubah sajdah (۩) di akhir ayat 15 Surat Ar-Ra\'d.',
    caraBaca: 'Disunnahkan melakukan Sujud Tilawah setelah membaca atau mendengar ayat ini.',
    tips: 'Boleh sujud di dalam shalat maupun di luar shalat dengan satu kali sujud.',
    type: 'sajdah'
  }],
  272: [{
    id: 'gh-272',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'وَهُمْ لَا يَسْتَكْبِرُونَ ۩',
    surahNumber: 16,
    surahName: 'An-Nahl',
    ayahNumber: 49,
    word: 'لَا يَسْتَكْبِرُونَ ۩',
    page: 272,
    description: 'Terdapat tanda Ayat Sajdah (۩) di ayat 49-50 Surat An-Nahl.',
    caraBaca: 'Sunnah Sujud Tilawah saat membaca ketundukan seluruh makhluk di langit dan bumi.',
    tips: 'Lakukan sujud tilawah untuk menunjukkan ketundukan hamba kepada Allah Ta\'ala.',
    type: 'sajdah'
  }],
  293: [{
    id: 'gh-293-saktah',
    title: 'Saktah (سَكْتَة)',
    arabicTerm: 'عِوَجًا ۜ قَيِّمًا',
    surahNumber: 18,
    surahName: 'Al-Kahf',
    ayahNumber: 1,
    word: 'عِوَجًا ۜ قَيِّمًا',
    page: 293,
    description: 'Terdapat tanda Sin kecil (ۜ) di akhir ayat 1 Surat Al-Kahf.',
    caraBaca: 'Berhenti sejenak selama 2 harakat (1 alif) tanpa mengambil nafas baru pada kata "عِوَجًا" lalu melanjutkan ke "قَيِّمًا".',
    tips: 'Saktah berfungsi memisahkan makna agar tidak disangka kitab Al-Qur\'an itu bengkok sekaligus lurus.',
    type: 'saktah'
  }, {
    id: 'gh-293-sajdah',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'يَخِرُّونَ لِلْأَذْقَانِ بُكِيًّا ۩',
    surahNumber: 17,
    surahName: "Al-Isra'",
    ayahNumber: 107,
    word: 'يَبْكُونَ ۩',
    page: 293,
    description: 'Terdapat tanda Ayat Sajdah di akhir Surat Al-Isra\' ayat 107-109.',
    caraBaca: 'Disunnahkan sujud tilawah.',
    tips: 'Menghayati tangisan orang-orang berilmu saat mendengarkan Al-Qur\'an.',
    type: 'sajdah'
  }],
  309: [{
    id: 'gh-309',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'خَرُّوا۟ سُجَّدًا وَبُكِيًّا ۩',
    surahNumber: 19,
    surahName: 'Maryam',
    ayahNumber: 58,
    word: 'سُجَّدًا وَبُكِيًّا ۩',
    page: 309,
    description: 'Terdapat simbol Ayat Sajdah (۩) di ayat 58 Surat Maryam.',
    caraBaca: 'Sunnah Sujud Tilawah.',
    tips: 'Sujud meneladani para nabi pilihan yang tersungkur sujud dan menangis.',
    type: 'sajdah'
  }],
  334: [{
    id: 'gh-334',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'يَفْعَلُ مَا يَشَآءُ ۩',
    surahNumber: 22,
    surahName: 'Al-Hajj',
    ayahNumber: 18,
    word: 'مَا يَشَآءُ ۩',
    page: 334,
    description: 'Sajdah pertama di Surat Al-Hajj ayat 18.',
    caraBaca: 'Sunnah Sujud Tilawah.',
    tips: 'Sujud menyaksikan seluruh ciptaan di langit dan bumi sujud kepada Allah.',
    type: 'sajdah'
  }],
  341: [{
    id: 'gh-341',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'وَٱسْجُدُوا۟ وَٱعْبُدُوا۟ ۩',
    surahNumber: 22,
    surahName: 'Al-Hajj',
    ayahNumber: 77,
    word: 'وَٱسْجُدُوا۟ ۩',
    page: 341,
    description: 'Sajdah kedua di Surat Al-Hajj ayat 77.',
    caraBaca: 'Sunnah Sujud Tilawah saat ayat perintah ruku\' dan sujud.',
    tips: 'Surat Al-Hajj memiliki keistimewaan memiliki dua ayat sajdah.',
    type: 'sajdah'
  }],
  365: [{
    id: 'gh-365',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'وَزَادَهُمْ نُفُورًا ۩',
    surahNumber: 25,
    surahName: 'Al-Furqan',
    ayahNumber: 60,
    word: 'نُفُورًا ۩',
    page: 365,
    description: 'Ayat Sajdah pada Surat Al-Furqan ayat 60.',
    caraBaca: 'Sunnah Sujud Tilawah.',
    tips: 'Bantahan terhadap orang kafir yang enggan bersujud kepada Ar-Rahman.',
    type: 'sajdah'
  }],
  379: [{
    id: 'gh-379',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ رَبُّ ٱلْعَرْشِ ٱلْعَظِيمِ ۩',
    surahNumber: 27,
    surahName: 'An-Naml',
    ayahNumber: 26,
    word: 'ٱلْعَظِيمِ ۩',
    page: 379,
    description: 'Ayat Sajdah pada Surat An-Naml ayat 25-26 (Kisah Burung Hud-hud).',
    caraBaca: 'Sunnah Sujud Tilawah.',
    tips: 'Pengakuan tauhid bahwa Allah adalah Tuhan Pemilik \'Arsy yang Agung.',
    type: 'sajdah'
  }],
  416: [{
    id: 'gh-416',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'خَرُّوا۟ سُجَّدًا وَسَبَّحُوا۟ ۩',
    surahNumber: 32,
    surahName: 'As-Sajdah',
    ayahNumber: 15,
    word: 'وَسَبَّحُوا۟ بِحَمْدِ رَبِّهِمْ ۩',
    page: 416,
    description: 'Ayat Sajdah utama pada Surat As-Sajdah ayat 15.',
    caraBaca: 'Sunnah Sujud Tilawah (sangat dianjurkan pada sholat Subuh hari Jumat).',
    tips: 'Ciri orang beriman yang tidak menyombongkan diri saat diingatkan ayat Allah.',
    type: 'sajdah'
  }],
  443: [{
    id: 'gh-443',
    title: 'Saktah (سَكْتَة)',
    arabicTerm: 'مِن مَّرْقَدِنَا ۜ هَٰذَا',
    surahNumber: 36,
    surahName: 'Ya-Sin',
    ayahNumber: 52,
    word: 'مِن مَّرْقَدِنَا ۜ هَٰذَا',
    page: 443,
    description: 'Terdapat tanda Saktah (ۜ) di antara perkataan orang kafir dan jawaban malaikat.',
    caraBaca: 'Berhenti sejenak 2 harakat tanpa nafas pada kata "مِن مَّرْقَدِنَا" lalu melanjutkan "هَٰذَا مَا وَعَدَ ٱلرَّحْمَٰنُ".',
    tips: 'Saktah membedakan ucapan orang kafir yang bangkit dari kubur dengan penegasan kebenaran janji Allah.',
    type: 'saktah'
  }],
  454: [{
    id: 'gh-454',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'وَخَرَّ رَاكِعًا وَأَنَابَ ۩',
    surahNumber: 38,
    surahName: 'Shad',
    ayahNumber: 24,
    word: 'وَأَنَابَ ۩',
    page: 454,
    description: 'Ayat Sajdah pada kisah Nabi Dawud AS di Surat Shad ayat 24.',
    caraBaca: 'Sunnah Sujud Tilawah (Sujud Taubat/Syukur).',
    tips: 'Meneladani taubat dan ketundukan Nabi Dawud saat memohon ampunan.',
    type: 'sajdah'
  }],
  480: [{
    id: 'gh-480',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'وَٱسْجُدُوا۟ لِلَّهِ ٱلَّذِى خَلَقَهُنَّ ۩',
    surahNumber: 41,
    surahName: 'Fushshilat',
    ayahNumber: 37,
    word: 'خَلَقَهُنَّ ۩',
    page: 480,
    description: 'Ayat Sajdah pada Surat Fushshilat ayat 37-38.',
    caraBaca: 'Sunnah Sujud Tilawah saat larangan sujud kepada matahari dan bulan.',
    tips: 'Sujud hanya kepada Allah Yang Maha Pencipta segala benda langit.',
    type: 'sajdah'
  }],
  481: [{
    id: 'gh-481',
    title: 'Tashil (تَسْهِيل)',
    arabicTerm: 'ءَ۬اعْجَمِىٌّ',
    surahNumber: 41,
    surahName: 'Fushshilat',
    ayahNumber: 44,
    word: 'ءَ۬اعْجَمِىٌّ',
    page: 481,
    description: 'Pertemuan dua Hamzah Qatha\' berharakat fathah dalam satu kata.',
    caraBaca: 'Hamzah pertama dibaca jelas/tahqiq ("A"), hamzah kedua dibaca lunak/tashil antara hamzah dan alif ("-a\'") menjadi "A-a\'jamiyyun".',
    tips: 'Jangan membaca dua hamzah tajam "A-Agjamiyyun" dan jangan pula memanjangkannya seperti mad.',
    type: 'tashil'
  }],
  516: [{
    id: 'gh-516',
    title: 'Naql (نَقْل)',
    arabicTerm: 'بِئْسَ ٱلِٱسْمُ',
    surahNumber: 49,
    surahName: 'Al-Hujurat',
    ayahNumber: 11,
    word: 'بِئْسَ ٱلِٱسْمُ',
    page: 516,
    description: 'Perpindahan harakat kasrah pada hamzah washal ke huruf Lam sukun sebelumnya.',
    caraBaca: 'Saat washal dibaca "Bi\'salismu" (harakat kasrah pindah ke Lam, hamzah washal gugur).',
    tips: 'Jika memulai bacaan dari kata ini (ibtida\'), boleh membaca "Alismu" atau "Lismu".',
    type: 'naql'
  }],
  525: [{
    id: 'gh-525',
    title: 'Shad boleh Sin (ص / س)',
    arabicTerm: 'ٱلْمُصَۜيْطِرُونَ',
    surahNumber: 52,
    surahName: 'Ath-Thur',
    ayahNumber: 37,
    word: 'ٱلْمُصَۜيْطِرُونَ',
    page: 525,
    description: 'Terdapat huruf Sin kecil di bawah huruf Shad.',
    caraBaca: 'Boleh dibaca dengan huruf Shad ("Al-Mushaythiruun") atau huruf Sin ("Al-Musaythiruun").',
    tips: 'Membaca dengan huruf Shad lebih masyhur dan diutamakan dalam riwayat Hafs.',
    type: 'ibdal'
  }],
  528: [{
    id: 'gh-528',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'فَٱسْجُدُوا۟ لِلَّهِ وَٱعْبُدُوا۟ ۩',
    surahNumber: 53,
    surahName: 'An-Najm',
    ayahNumber: 62,
    word: 'وَٱعْبُدُوا۟ ۩',
    page: 528,
    description: 'Ayat terakhir Surat An-Najm (Ayat 62).',
    caraBaca: 'Sunnah Sujud Tilawah.',
    tips: 'Perintah agung bersujud dan beribadah hanya kepada Allah Azza wa Jalla.',
    type: 'sajdah'
  }],
  578: [{
    id: 'gh-578',
    title: 'Saktah (سَكْتَة)',
    arabicTerm: 'وَقِيلَ مَنْ ۜ رَاقٍ',
    surahNumber: 75,
    surahName: 'Al-Qiyamah',
    ayahNumber: 27,
    word: 'مَنْ ۜ رَاقٍ',
    page: 578,
    description: 'Tanda Saktah (ۜ) antara kata "مَنْ" dan "رَاقٍ".',
    caraBaca: 'Berhenti sejenak 2 harakat tanpa bernafas pada kata "Man" lalu melanjutkan "Raaq".',
    tips: 'Saktah mencegah terjadinya Idgham Bilaghunnah menjadi "Mar-raaq" agar maknanya jelas (siapakah yang dapat mengobati).',
    type: 'saktah'
  }],
  588: [{
    id: 'gh-588',
    title: 'Saktah (سَكْتَة)',
    arabicTerm: 'كَلَّا ۖ بَلْ ۜ رَانَ',
    surahNumber: 83,
    surahName: 'Al-Muthaffifin',
    ayahNumber: 14,
    word: 'بَلْ ۜ رَانَ',
    page: 588,
    description: 'Tanda Saktah (ۜ) antara kata "بَلْ" dan "رَانَ".',
    caraBaca: 'Berhenti sejenak 2 harakat tanpa bernafas pada kata "Bal" lalu melanjutkan "Raana".',
    tips: 'Saktah mencegah terjadinya Idgham Mutajanisain/Mutaqaribain menjadi "Bar-raana" agar arti tidak rancu.',
    type: 'saktah'
  }],
  589: [{
    id: 'gh-589',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'وَإِذَا قُرِئَ عَلَيْهِمُ ٱلْقُرْءَانُ لَا يَسْجُدُونَ ۩',
    surahNumber: 84,
    surahName: 'Al-Insyiqaq',
    ayahNumber: 21,
    word: 'لَا يَسْجُدُونَ ۩',
    page: 589,
    description: 'Ayat Sajdah pada Surat Al-Insyiqaq ayat 21.',
    caraBaca: 'Sunnah Sujud Tilawah.',
    tips: 'Teguran bagi orang-orang yang tidak mau bersujud ketika dibacakan Al-Qur\'an.',
    type: 'sajdah'
  }],
  592: [{
    id: 'gh-592',
    title: 'Shad Mutlak (ص Murni)',
    arabicTerm: 'بِمُصَيْطِرٍ',
    surahNumber: 88,
    surahName: 'Al-Ghasyiyah',
    ayahNumber: 22,
    word: 'بِمُصَيْطِرٍ',
    page: 592,
    description: 'Huruf Shad pada kata بِمُصَيْطِرٍ tanpa tanda Sin.',
    caraBaca: 'Wajib dibaca dengan huruf Shad murni dan tebal: "Bimushaythir" (tidak boleh diganti Sin).',
    tips: 'Pangkal lidah terangkat ke langit-langit membentuk sifat Isti\'la dan Ithbaq yang tebal.',
    type: 'ibdal'
  }],
  597: [{
    id: 'gh-597',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'وَٱسْجُدْ وَٱقْتَرِب ۩',
    surahNumber: 96,
    surahName: "Al-'Alaq",
    ayahNumber: 19,
    word: 'وَٱسْجُدْ وَٱقْتَرِب ۩',
    page: 597,
    description: 'Ayat Sajdah penutup pada ayat terakhir Surat Al-\'Alaq.',
    caraBaca: 'Sunnah Sujud Tilawah.',
    tips: 'Keadaan terdekat seorang hamba dengan Tuhannya adalah saat sedang bersujud.',
    type: 'sajdah'
  }]
};

/**
 * Returns Gharib rules detected on the given page.
 */
export function getPageGharibRules(page: number): GharibItem[] {
  return GHARIB_DICTIONARY[page] || [];
}

/**
 * Analyzes Tajweed rules across all lines of a given page.
 */
export function analyzePageTajweedRules(lines: MushafLine[]): {
  rulesList: TajwidRuleItem[];
  ruleSummary: Record<string, number>;
  totalRules: number;
} {
  const rulesList: TajwidRuleItem[] = [];
  const ruleSummary: Record<string, number> = {};

  const seenRules = new Set<string>();

  lines.forEach((line) => {
    if (line.type === 'text' && line.text) {
      const text = line.text;
      const res = tajwidEngine.analyzeAyat(1, 1, text);

      res.tokens.forEach((t) => {
        const uniqueKey = `${t.rule}-${t.matchedPhoneme || t.char}`;
        if (!seenRules.has(uniqueKey) && rulesList.length < 24) {
          seenRules.add(uniqueKey);

          let cat: TajwidRuleItem['ruleCategory'] = 'mad';
          if (t.rule.includes('ghunnah')) cat = 'ghunnah';
          else if (t.rule.includes('qalqalah')) cat = 'qalqalah';
          else if (t.rule.includes('syafawi') || t.rule.includes('mimi')) cat = 'mim_mati';
          else if (t.rule.includes('izhar') || t.rule.includes('idgham') || t.rule.includes('ikhfa') || t.rule.includes('iqlab')) cat = 'nun_mati_tanwin';

          // Extract surrounding word
          const words = text.split(' ');
          const matchingWord = words.find((w) => w.includes(t.char)) || t.matchedPhoneme || t.char;

          let caraBaca = 'Dibaca sesuai kaidah tajwid.';
          if (t.rule === 'ghunnah_musyaddadah') caraBaca = 'Mendengung 2-3 harakat.';
          else if (t.rule === 'qalqalah_kubra') caraBaca = 'Memantul tebal di akhir waqaf.';
          else if (t.rule === 'qalqalah_sugra') caraBaca = 'Memantul ringan di tengah kata.';
          else if (t.rule === 'ikhfa_haqiqi') caraBaca = 'Samar-samar disertai dengung 2 harakat.';
          else if (t.rule === 'idgham_bighunnah') caraBaca = 'Melebur masuk huruf berikutnya dengan dengung 2 harakat.';
          else if (t.rule === 'idgham_bilaghunnah') caraBaca = 'Melebur masuk tanpa dengung.';
          else if (t.rule === 'iqlab') caraBaca = 'Mengubah bunyi nun/tanwin menjadi mim tersembunyi dengan dengung.';
          else if (t.rule === 'izhar_halqi') caraBaca = 'Jelas, terang, tanpa dengung.';
          else if (t.rule.includes('mad')) caraBaca = `Dipanjangkan ${t.harakatDuration || 2} harakat.`;

          rulesList.push({
            id: `taj-${rulesList.length + 1}`,
            ruleName: t.ruleLabel,
            ruleCategory: cat,
            matchedWord: matchingWord,
            colorHex: t.colorHex,
            harakatDuration: t.harakatDuration || 2,
            description: t.description,
            caraBaca
          });
        }

        ruleSummary[t.ruleLabel] = (ruleSummary[t.ruleLabel] || 0) + 1;
      });
    }
  });

  const totalRules = Object.values(ruleSummary).reduce((a, b) => a + b, 0);

  return {
    rulesList,
    ruleSummary,
    totalRules
  };
}

/**
 * Colorizes Tajweed words within a line for interactive rendering.
 */
export function getTajweedColorForWord(word: string): { color: string; bg: string; ruleName?: string } {
  if (word.includes('ّ') && (word.includes('ن') || word.includes('م'))) {
    return { color: '#047857', bg: '#D1FAE5', ruleName: 'Ghunnah Musyaddadah' };
  }
  if (word.includes('ْ') && (word.includes('ق') || word.includes('ط') || word.includes('ب') || word.includes('ج') || word.includes('د'))) {
    return { color: '#C2410C', bg: '#FFEDD5', ruleName: 'Qalqalah Sughra' };
  }
  if (word.includes('ٓ') || word.includes('~') || word.includes('آ')) {
    return { color: '#B91C1C', bg: '#FEE2E2', ruleName: 'Mad Wajib / Jaiz' };
  }
  if (word.includes('ۢ') || word.includes('ۭ') || word.includes('۫')) {
    return { color: '#6D28D9', bg: '#EDE9FE', ruleName: 'Iqlab / Gharib' };
  }
  return { color: '#064E3B', bg: 'transparent' };
}

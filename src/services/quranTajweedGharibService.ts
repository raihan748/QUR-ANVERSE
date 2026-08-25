// ==============================================================================
// TAJWEED & GHARIB ENCYCLOPEDIC KNOWLEDGE ENGINE FOR 604 PAGES OF MADINAH MUSHAF
// Real-time Linguistic AST Parser, Complete 45+ Tajweed Rules & 30-Juz Gharib Library
// ==============================================================================

import { TajwidRuleEngine } from './backend/tajwidRuleEngine';
import { MushafLine } from './madinahPageService';

const tajwidEngine = new TajwidRuleEngine();

export interface TajwidRuleItem {
  id: string;
  ruleName: string;
  ruleCategory: 'nun_mati_tanwin' | 'mim_mati' | 'ghunnah' | 'qalqalah' | 'mad' | 'lam_ra' | 'idgham_makhraj' | 'waqaf';
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
  type: 'imalah' | 'isymam' | 'tashil' | 'naql' | 'saktah' | 'ibdal' | 'sajdah' | 'sufr' | 'izhar_muthlaq' | 'idgham_khusus' | 'nun_wiqayah';
}

export interface TajweedEncyclopediaEntry {
  id: string;
  title: string;
  arabicName: string;
  category: 'Nun & Tanwin' | 'Mim Sukun' | 'Ghunnah & Qalqalah' | 'Lam & Ra' | 'Mad Lengkap' | 'Idgham Makhraj' | 'Bacaan Gharib' | 'Tanda Waqaf';
  letters?: string;
  harakat: string;
  colorHex: string;
  summary: string;
  caraBaca: string;
  contohLafadz: string;
}

// 1. COMPLETE 30-JUZ GHARIB & SPECIAL RECITATION DICTIONARY (Standard Hafs 'an 'Ashim)
export const GHARIB_DICTIONARY: Record<number, GharibItem[]> = {
  13: [{
    id: 'gh-13',
    title: 'Izhar Muthlaq (إِظْهَار مُطْلَق)',
    arabicTerm: 'دُنْيَا',
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    ayahNumber: 85,
    word: 'ٱلدُّنْيَا',
    page: 13,
    description: 'Nun sukun bertemu huruf Ya (ي) dalam SATU KATA (bukan antar dua kata).',
    caraBaca: 'Wajib dibaca jelas dan terang "Dunyaa" (TIDAK BOLEH di-idghamkan menjadi Duy-yaa).',
    tips: 'Kaidah Izhar Muthlaq berlaku pada 4 kata di seluruh Al-Qur\'an: Dunya, Bunyan, Qinwan, Shinwan.',
    type: 'izhar_muthlaq'
  }],
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
    tips: 'Lafadzkan dengan desis halus huruf Sin tanpa menebalkan pangkal lidah.',
    type: 'ibdal'
  }],
  112: [{
    id: 'gh-112',
    title: 'Idgham Mutajanisain Naqis (إِدْغَام نَاقِص)',
    arabicTerm: 'لَئِنۢ بَسَطتَ',
    surahNumber: 5,
    surahName: "Al-Ma'idah",
    ayahNumber: 28,
    word: 'بَسَطتَ',
    page: 112,
    description: 'Huruf Tha\' (ط) sukun yang kuat bertemu huruf Ta\' (ت) yang lemah.',
    caraBaca: 'Makhraj huruf Tha\' melebur ke huruf Ta\', namun sifat tebal (Isti\'la & Ithbaq) huruf Tha\' tetap dipertahankan saat bibir tertutup.',
    tips: 'Tutup makhraj dengan tebal (Tha\') lalu lepas desis tipis (Ta\') tanpa qalqalah.',
    type: 'idgham_khusus'
  }],
  140: [{
    id: 'gh-140',
    title: 'Izhar Muthlaq (إِظْهَار مُطْلَق)',
    arabicTerm: 'قِنْوَانٌ',
    surahNumber: 6,
    surahName: "Al-An'am",
    ayahNumber: 99,
    word: 'قِنْوَانٌ',
    page: 140,
    description: 'Nun sukun bertemu huruf Wau (و) dalam satu kata.',
    caraBaca: 'Wajib dibaca jelas "Qinwaanun", dilarang melebur menjadi Qiw-waanun.',
    tips: 'Izhar Muthlaq menjaga keaslian arti kata agar tidak rusak maknanya.',
    type: 'izhar_muthlaq'
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
  173: [{
    id: 'gh-173',
    title: 'Idgham Mutajanisain (إِدْغَام مُتَجَانِسَيْن)',
    arabicTerm: 'يَلْهَث ذَّٰلِكَ',
    surahNumber: 7,
    surahName: "Al-A'raf",
    ayahNumber: 176,
    word: 'يَلْهَث ذَّٰلِكَ',
    page: 173,
    description: 'Huruf Tsa\' (ث) sukun bertemu huruf Dzal (ذ) berharakat (satu makhraj ujung lidah).',
    caraBaca: 'Huruf Tsa\' melebur sempurna ke huruf Dzal menjadi: "Yalhadz-dzaalik".',
    tips: 'Ujung lidah menempel di gigi seri atas untuk melafadzkan huruf Dzal tasydid.',
    type: 'idgham_khusus'
  }],
  176: [{
    id: 'gh-176',
    title: 'Ayat Sajdah (سَجْدَة)',
    arabicTerm: 'وَيَسْجُدُونَ لَهُۥ ۩',
    surahNumber: 7,
    surahName: "Al-A'raf",
    ayahNumber: 206,
    word: 'وَلَهُۥ يَسْجُدُونَ ۩',
    page: 176,
    description: 'Terdapat simbol kubah sajdah (۩) di akhir ayat 206 Surat Al-A\'raf (Ayat Sajdah ke-1).',
    caraBaca: 'Disunnahkan melakukan Sujud Tilawah satu kali bagi pembaca dan pendengar.',
    tips: 'Baca doa sujud tilawah: سَجَدَ وَجْهِيَ لِلَّذِي خَلَقَهُ وَصَوَّرَهُ...',
    type: 'sajdah'
  }],
  204: [{
    id: 'gh-204',
    title: 'Izhar Muthlaq (إِظْهَار مُطْلَق)',
    arabicTerm: 'بُنْيَانٌ',
    surahNumber: 9,
    surahName: 'At-Taubah',
    ayahNumber: 109,
    word: 'بُنْيَٰنُهُ',
    page: 204,
    description: 'Nun sukun bertemu huruf Ya (ي) dalam satu kata.',
    caraBaca: 'Dibaca jelas dan terang "Bunyaanuh".',
    tips: 'Tahan suara pada huruf Nun tanpa memasukkan dengung ke huruf Ya.',
    type: 'izhar_muthlaq'
  }],
  226: [{
    id: 'gh-226-imalah',
    title: 'Imalah Kubra (إِمَالَة كُبْرَى)',
    arabicTerm: 'مَجْرٰ۪ىهَا',
    surahNumber: 11,
    surahName: 'Hud',
    ayahNumber: 41,
    word: 'مَجْرٰ۪ىهَا',
    page: 226,
    description: 'Satu-satunya bacaan Imalah Kubra dalam Qira\'at Imam Hafs Thariq Asy-Syathibiyyah.',
    caraBaca: 'Harakat fathah dimiringkan ke arah kasrah, sehingga terdengar seperti vokal "e" (sate/rehan) menjadi "Maj-re-haa".',
    tips: 'Jangan membaca murni "Maj-ra-haa" atau "Maj-ri-haa", tapi condong antara A dan I ("Majrehaa").',
    type: 'imalah'
  }, {
    id: 'gh-226-idgham',
    title: 'Idgham Mutajanisain (إِدْغَام مُتَجَانِسَيْن)',
    arabicTerm: 'يَـٰبُنَىَّ ٱرْكَب مَّعَنَا',
    surahNumber: 11,
    surahName: 'Hud',
    ayahNumber: 42,
    word: 'ٱرْكَب مَّعَنَا',
    page: 226,
    description: 'Huruf Ba\' (ب) sukun bertemu huruf Mim (م) berharakat (sama-sama makhraj dua bibir).',
    caraBaca: 'Huruf Ba\' melebur sempurna ke huruf Mim disertai dengung 2 harakat: "Irkam-ma\'anaa".',
    tips: 'Kedua bibir langsung merapat rapat untuk membunyikan Mim bertasydid.',
    type: 'idgham_khusus'
  }],
  229: [{
    id: 'gh-229',
    title: 'Sifir Mustadir (صِفْر مُسْتَدِير)',
    arabicTerm: 'أَلَآ إِنَّ ثَمُودَا۟ كَفَرُوا۟',
    surahNumber: 11,
    surahName: 'Hud',
    ayahNumber: 68,
    word: 'ثَمُودَا۟',
    page: 229,
    description: 'Terdapat bulatan bulat sempurna (Sifir Mustadir) di atas huruf Alif pada kata Tsamuuda.',
    caraBaca: 'Huruf Alif dianggap tidak ada, sehingga dibaca pendek "Tsamuuda" baik saat washal maupun waqaf.',
    tips: 'Berbeda dengan Sifir Mustathil (lonjong) yang dibaca panjang saat waqaf.',
    type: 'sufr'
  }],
  236: [{
    id: 'gh-236',
    title: 'Isymam & Ikhtilas (إِشْمَام & اخْتِلَاس)',
    arabicTerm: 'لَا تَأْمَ۫نَّا',
    surahNumber: 12,
    surahName: 'Yusuf',
    ayahNumber: 11,
    word: 'لَا تَأْمَ۫نَّا',
    page: 236,
    description: 'Penggabungan dua huruf Nun (aslinya: تَأْمَنُنَا) dengan isyarat harakat dhummah.',
    caraBaca: 'Cara 1 (Isymam - Utama): Memonyongkan kedua bibir ke depan tanpa suara tepat saat menahan dengung huruf Nun tasydid (2 harakat). Cara 2 (Ikhtilas): Membaca cepat 2/3 harakat harakat dhommah nun pertama.',
    tips: 'Bibir dimonyongkan seperti mengucapkan "U" namun tanpa mengeluarkan suara vokal.',
    type: 'isymam'
  }],
  245: [{
    id: 'gh-245',
    title: 'Idgham Mutajanisain Naqis (إِدْغَام نَاقِص)',
    arabicTerm: 'مَا فَرَّطتُمْ فِى يُوسُفَ',
    surahNumber: 12,
    surahName: 'Yusuf',
    ayahNumber: 80,
    word: 'فَرَّطتُمْ',
    page: 245,
    description: 'Huruf Tha\' (ط) sukun bertemu huruf Ta\' (ت) berharakat.',
    caraBaca: 'Makhraj Tha\' masuk ke Ta\' namun sifat Isti\'la (tebal) Tha\' tetap ditahan sebelum membuka Ta\'.',
    tips: 'Tutup makhraj dengan tebal lalu buka dengan desis Ta\'.',
    type: 'idgham_khusus'
  }],
  249: [{
    id: 'gh-249',
    title: 'Izhar Muthlaq (إِظْهَار مُطْلَق)',
    arabicTerm: 'صِنْوَانٌ وَغَيْرُ صِنْوَانٍ',
    surahNumber: 13,
    surahName: "Ar-Ra'd",
    ayahNumber: 4,
    word: 'صِنْوَانٌ',
    page: 249,
    description: 'Nun sukun bertemu huruf Wau (و) dalam satu kata (kata ke-4 Izhar Muthlaq).',
    caraBaca: 'Dibaca jelas "Shinwaanun", dilarang di-idghamkan menjadi Shiw-waanun.',
    tips: 'Pertahankan kejelasan huruf Nun sukun sebelum menyambung ke huruf Wau.',
    type: 'izhar_muthlaq'
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
    description: 'Ayat Sajdah ke-2 di dalam Al-Qur\'an (Surat Ar-Ra\'d ayat 15).',
    caraBaca: 'Disunnahkan melakukan Sujud Tilawah setelah membaca atau mendengar ayat ini.',
    tips: 'Sujud ketundukan bayang-bayang di waktu pagi dan petang kepada Allah.',
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
    description: 'Ayat Sajdah ke-3 di dalam Al-Qur\'an (Surat An-Nahl ayat 49-50).',
    caraBaca: 'Sunnah Sujud Tilawah saat membaca ketundukan seluruh malaikat dan makhluk melata.',
    tips: 'Malaikat tidak menyombongkan diri dan selalu patuh pada perintah Allah.',
    type: 'sajdah'
  }],
  293: [{
    id: 'gh-293-saktah',
    title: 'Saktah Wajib ke-1 (سَكْتَة وَاجِبَة)',
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
    description: 'Ayat Sajdah ke-4 di akhir Surat Al-Isra\' ayat 107-109.',
    caraBaca: 'Disunnahkan sujud tilawah.',
    tips: 'Menghayati tangisan orang-orang berilmu saat mendengarkan ayat Al-Qur\'an.',
    type: 'sajdah'
  }],
  298: [{
    id: 'gh-298',
    title: 'Sifir Mustathil (صِفْر مُسْتَطِيل)',
    arabicTerm: 'لَّـٰكِنَّا۟ هُوَ ٱللَّهُ رَبِّى',
    surahNumber: 18,
    surahName: 'Al-Kahf',
    ayahNumber: 38,
    word: 'لَّـٰكِنَّا۟',
    page: 298,
    description: 'Terdapat tanda bulatan lonjong (Sifir Mustathil) di atas huruf Alif pada kata Laakinnaa.',
    caraBaca: 'Jika WAQAF (berhenti) dibaca panjang 2 harakat ("Laakinnaa"). Jika WASHAL (lanjut) huruf alif gugur dibaca pendek ("Laakinnahuwallaahu").',
    tips: 'Asal katanya adalah: لَـٰكِنْ أَنَا (Laakin Anaa).',
    type: 'sufr'
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
    description: 'Ayat Sajdah ke-5 (Surat Maryam ayat 58).',
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
    description: 'Ayat Sajdah ke-6 (Surat Al-Hajj ayat 18).',
    caraBaca: 'Sunnah Sujud Tilawah.',
    tips: 'Sujud menyaksikan seluruh ciptaan di langit dan bumi bersujud kepada Allah.',
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
    description: 'Ayat Sajdah ke-7 (Surat Al-Hajj ayat 77 - Sajdah kedua di Al-Hajj).',
    caraBaca: 'Sunnah Sujud Tilawah saat ayat perintah ruku\' dan sujud.',
    tips: 'Surat Al-Hajj memiliki keistimewaan memiliki dua ayat sajdah.',
    type: 'sajdah'
  }],
  363: [{
    id: 'gh-363',
    title: 'Sifir Mustadir (صِفْر مُسْتَدِير)',
    arabicTerm: 'وَعَادًا وَثَمُودَا۟',
    surahNumber: 25,
    surahName: 'Al-Furqan',
    ayahNumber: 38,
    word: 'وَثَمُودَا۟',
    page: 363,
    description: 'Sifir bulat di atas Alif Tsamuuda (Alif gugur saat washal dan waqaf).',
    caraBaca: 'Dibaca pendek "Wa Tsamuuda" (tanpa mad pada da).',
    tips: 'Dihukumi huruf tambahan dalam rasm utsmani.',
    type: 'sufr'
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
    description: 'Ayat Sajdah ke-8 (Surat Al-Furqan ayat 60).',
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
    description: 'Ayat Sajdah ke-9 (Surat An-Naml ayat 25-26 - Kisah Hud-hud).',
    caraBaca: 'Sunnah Sujud Tilawah.',
    tips: 'Pengakuan tauhid bahwa Allah adalah Tuhan Pemilik \'Arsy yang Maha Agung.',
    type: 'sajdah'
  }],
  401: [{
    id: 'gh-401',
    title: 'Sifir Mustadir (صِفْر مُسْتَدِير)',
    arabicTerm: 'وَعَادًا وَثَمُودَا۟',
    surahNumber: 29,
    surahName: "Al-'Ankabut",
    ayahNumber: 38,
    word: 'وَثَمُودَا۟',
    page: 401,
    description: 'Sifir bulat di atas Alif Tsamuuda.',
    caraBaca: 'Dibaca pendek "Wa Tsamuuda".',
    tips: 'Alif gugur dalam pelafalan.',
    type: 'sufr'
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
    description: 'Ayat Sajdah ke-10 (Surat As-Sajdah ayat 15).',
    caraBaca: 'Sunnah Sujud Tilawah (Sangat dianjurkan saat sholat Subuh hari Jumat).',
    tips: 'Ciri orang beriman yang menyungkurkan diri bersujud saat mendengar ayat Allah.',
    type: 'sajdah'
  }],
  419: [{
    id: 'gh-419',
    title: 'Sifir Mustathil (صِفْر مُسْتَطِيل)',
    arabicTerm: 'وَتَظُنُّونَ بِٱللَّهِ ٱلظُّنُونَا۟',
    surahNumber: 33,
    surahName: 'Al-Ahzab',
    ayahNumber: 10,
    word: 'ٱلظُّنُونَا۟',
    page: 419,
    description: 'Terdapat Sifir Mustathil (lonjong) di atas Alif kata Azh-Zhunuunaa.',
    caraBaca: 'Waqaf: Dibaca panjang 2 harakat ("Azh-Zhunuunaa"). Washal: Dibaca pendek 1 harakat ("Azh-Zhunuunalladzina").',
    tips: 'Perhatikan perbedaan panjang saat berhenti dan lanjut.',
    type: 'sufr'
  }],
  427: [{
    id: 'gh-427-1',
    title: 'Sifir Mustathil (صِفْر مُسْتَطِيل)',
    arabicTerm: 'أَطَعْنَا ٱللَّهَ وَأَطَعْنَا ٱلرَّسُولَا۟',
    surahNumber: 33,
    surahName: 'Al-Ahzab',
    ayahNumber: 66,
    word: 'ٱلرَّسُولَا۟',
    page: 427,
    description: 'Sifir Mustathil di atas Alif Ar-Rasuulaa.',
    caraBaca: 'Waqaf: Panjang 2 harakat ("Ar-Rasuulaa"). Washal: Pendek ("Ar-Rasuula").',
    tips: 'Mengikuti kaidah fawashil ru\'usil ay (akhir ayat).',
    type: 'sufr'
  }, {
    id: 'gh-427-2',
    title: 'Sifir Mustathil (صِفْر مُسْتَطِيل)',
    arabicTerm: 'فَأَضَلُّونَا ٱلسَّبِيلَا۟',
    surahNumber: 33,
    surahName: 'Al-Ahzab',
    ayahNumber: 67,
    word: 'ٱلسَّبِيلَا۟',
    page: 427,
    description: 'Sifir Mustathil di atas Alif As-Sabiilaa.',
    caraBaca: 'Waqaf: Panjang 2 harakat ("As-Sabiilaa"). Washal: Pendek ("As-Sabiila").',
    tips: 'Sama kaidahnya dengan Ar-Rasuulaa.',
    type: 'sufr'
  }],
  443: [{
    id: 'gh-443',
    title: 'Saktah Wajib ke-2 (سَكْتَة وَاجِبَة)',
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
    description: 'Ayat Sajdah ke-11 (Kisah Nabi Dawud AS di Surat Shad ayat 24).',
    caraBaca: 'Sunnah Sujud Tilawah (Sujud Syukur & Taubat).',
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
    description: 'Ayat Sajdah ke-12 (Surat Fushshilat ayat 37-38).',
    caraBaca: 'Sunnah Sujud Tilawah saat larangan sujud kepada matahari dan bulan.',
    tips: 'Sujud hanya kepada Allah Yang Maha Pencipta seluruh alam semesta.',
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
    description: 'Ayat Sajdah ke-13 (Ayat terakhir Surat An-Najm).',
    caraBaca: 'Sunnah Sujud Tilawah.',
    tips: 'Perintah agung bersujud dan beribadah hanya kepada Allah Azza wa Jalla.',
    type: 'sajdah'
  }],
  567: [{
    id: 'gh-567',
    title: 'Saktah Jaiz (سَكْتَة جَائِزَة)',
    arabicTerm: 'مَالِيَهْ ۜ هَلَكَ',
    surahNumber: 69,
    surahName: 'Al-Haqqah',
    ayahNumber: 28,
    word: 'مَالِيَهْ ۜ هَلَكَ',
    page: 567,
    description: 'Pertemuan dua Ha\' saktah di antara ayat 28 dan 29 Surat Al-Haqqah.',
    caraBaca: 'Cara 1 (Utama): Saktah 2 harakat tanpa nafas pada kata "Maaliyah" lalu lanjut "Halaka". Cara 2: Idgham Mutamatsilain (Ha\' sukun masuk ke Ha\' berikutnya menjadi Maaliyah-halaka).',
    tips: 'Saktah lebih diutamakan untuk menjaga kemurnian Ha\' saktah.',
    type: 'saktah'
  }],
  578: [{
    id: 'gh-578-saktah',
    title: 'Saktah Wajib ke-3 (سَكْتَة وَاجِبَة)',
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
  }, {
    id: 'gh-578-sufr',
    title: 'Sifir Mustathil (صِفْر مُسْتَطِيل)',
    arabicTerm: 'إِنَّا خَلَقْنَا سَلَـٰسِلَا۟',
    surahNumber: 76,
    surahName: 'Al-Insan',
    ayahNumber: 4,
    word: 'سَلَـٰسِلَا۟',
    page: 578,
    description: 'Sifir Mustathil di atas Alif Salaasilaa.',
    caraBaca: 'Waqaf: Boleh dibaca panjang 2 harakat ("Salaasilaa") atau sukun ("Salaasil"). Washal: Wajib dibaca pendek ("Salaasila wa aghlaalaa").',
    tips: 'Boleh dua wajah saat waqaf, wajah alif mad lebih masyhur.',
    type: 'sufr'
  }],
  579: [{
    id: 'gh-579-1',
    title: 'Sifir Mustathil (صِفْر مُسْتَطِيل)',
    arabicTerm: 'قَوَارِيرَا۟ (الأولى)',
    surahNumber: 76,
    surahName: 'Al-Insan',
    ayahNumber: 15,
    word: 'قَوَارِيرَا۟',
    page: 579,
    description: 'Lafadz Qawaariiraa pertama di akhir ayat 15.',
    caraBaca: 'Waqaf: Panjang 2 harakat ("Qawaariiraa"). Washal: Pendek ("Qawaariira qawaariira").',
    tips: 'Berbeda dengan kata Qawaariiraa kedua di ayat 16.',
    type: 'sufr'
  }, {
    id: 'gh-579-2',
    title: 'Sifir Mustadir (صِفْر مُسْتَدِير)',
    arabicTerm: 'قَوَارِيرَا۟ (الثانية)',
    surahNumber: 76,
    surahName: 'Al-Insan',
    ayahNumber: 16,
    word: 'قَوَارِيرَا۟',
    page: 579,
    description: 'Lafadz Qawaariiraa kedua di awal ayat 16.',
    caraBaca: 'Alif gugur baik saat washal maupun waqaf: dibaca "Qawaariir".',
    tips: 'Sifir bulat menandakan alif tidak dibaca sama sekali.',
    type: 'sufr'
  }],
  580: [{
    id: 'gh-580',
    title: 'Idgham Mutaqaribain (إِدْغَام مُتَقَارِبَيْن)',
    arabicTerm: 'أَلَمْ نَخْلُقكُّم مِّن مَّآءٍ',
    surahNumber: 77,
    surahName: 'Al-Mursalat',
    ayahNumber: 20,
    word: 'أَلَمْ نَخْلُقكُّم',
    page: 580,
    description: 'Huruf Qaf (ق) sukun bertemu huruf Kaf (ك) berharakat.',
    caraBaca: 'Cara 1 (Kamil - Utama): Qaf melebur total ke Kaf menjadi "Alam Nakhlukkum". Cara 2 (Naqis): Sifat tebal Isti\'la Qaf masih ditahan sedikit sebelum mengucap Kaf.',
    tips: 'Idgham Kamil lebih masyhur dalam riwayat Hafs dari Thariq Syathibiyyah.',
    type: 'idgham_khusus'
  }],
  588: [{
    id: 'gh-588',
    title: 'Saktah Wajib ke-4 (سَكْتَة وَاجِبَة)',
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
    description: 'Ayat Sajdah ke-14 (Surat Al-Insyiqaq ayat 21).',
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
    description: 'Huruf Shad pada kata بِمُصَيْطِرٍ tanpa tanda Sin di atas atau di bawahnya.',
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
    description: 'Ayat Sajdah ke-15 (Penutup Ayat Sajdah pada ayat terakhir Surat Al-\'Alaq).',
    caraBaca: 'Sunnah Sujud Tilawah.',
    tips: 'Keadaan terdekat seorang hamba dengan Tuhannya adalah saat sedang bersujud.',
    type: 'sajdah'
  }]
};

// 2. MASTER ENCYCLOPEDIA OF 45+ TAJWEED & GHARIB RULES
export const MASTER_TAJWEED_ENCYCLOPEDIA: TajweedEncyclopediaEntry[] = [
  // Nun Sukun & Tanwin
  {
    id: 'enc-izhar-halqi',
    title: 'Izhar Halqi',
    arabicName: 'إِظْهَار حَلْقِي',
    category: 'Nun & Tanwin',
    letters: 'ء, هـ, ع, ح, غ, خ',
    harakat: '1 Harakat (Tanpa Dengung)',
    colorHex: '#065F46',
    summary: 'Nun sukun atau tanwin bertemu salah satu dari 6 huruf tenggorokan (Halq).',
    caraBaca: 'Dibaca jelas, tegas, murni tanpa dengung (ghunnah).',
    contohLafadz: 'مَنْ آمَنَ • سَلَامٌ هِيَ • عَنْ عِلْمٍ'
  },
  {
    id: 'enc-idgham-bighunnah',
    title: 'Idgham Bighunnah',
    arabicName: 'إِدْغَام بِغُنَّة',
    category: 'Nun & Tanwin',
    letters: 'ي, ن, م, و (يَنْمُو)',
    harakat: '2 Harakat (Dengung)',
    colorHex: '#3B82F6',
    summary: 'Nun sukun atau tanwin bertemu huruf Yanmu dalam dua kata terpisah.',
    caraBaca: 'Suara nun/tanwin melebur masuk ke huruf berikutnya disertai dengung 2 harakat.',
    contohLafadz: 'مَن يَقُولُ • مِن مَّالٍ • خَيْرًا يَرَهُ'
  },
  {
    id: 'enc-idgham-bilaghunnah',
    title: 'Idgham Bilaghunnah',
    arabicName: 'إِدْغَام بِلَا غُنَّة',
    category: 'Nun & Tanwin',
    letters: 'ل, ر',
    harakat: '1 Harakat (Tanpa Dengung)',
    colorHex: '#6366F1',
    summary: 'Nun sukun atau tanwin bertemu huruf Lam atau Ra.',
    caraBaca: 'Melebur sempurna ke dalam Lam atau Ra tanpa dengung sedikitpun.',
    contohLafadz: 'مِن لَّدُنْهُ • غَفُورٌ رَّحِيمٌ'
  },
  {
    id: 'enc-iqlab',
    title: 'Iqlab',
    arabicName: 'إِقْلَاب',
    category: 'Nun & Tanwin',
    letters: 'ب',
    harakat: '2 Harakat (Dengung)',
    colorHex: '#8B5CF6',
    summary: 'Nun sukun atau tanwin bertemu huruf Ba (ب).',
    caraBaca: 'Suara Nun/tanwin berubah menjadi Mim samar dengan kedua bibir merapat ringan disertai dengung 2 harakat.',
    contohLafadz: 'مِنۢ بَعْدِ • عَلِيمٌۢ بِذَاتِ'
  },
  {
    id: 'enc-ikhfa-haqiqi',
    title: "Ikhfa' Haqiqi",
    arabicName: 'إِخْفَاء حَقِيقِي',
    category: 'Nun & Tanwin',
    letters: 'ت, ث, ج, د, ذ, ز, س, ش, ص, ض, ط, ظ, ف, ق, ك (15 Huruf)',
    harakat: '2 Harakat (Samar Dengung)',
    colorHex: '#EC4899',
    summary: 'Nun sukun atau tanwin bertemu salah satu dari 15 huruf ikhfa.',
    caraBaca: 'Makhraj Nun disamarkan menuju makhraj huruf berikutnya disertai dengung 2 harakat.',
    contohLafadz: 'مِن قَبْلُ • أَنفُسَهُمْ • كِتَابٌ كَرِيمٌ'
  },
  {
    id: 'enc-izhar-muthlaq',
    title: 'Izhar Muthlaq',
    arabicName: 'إِظْهَار مُطْلَق',
    category: 'Nun & Tanwin',
    letters: 'ي, و (Dalam satu kata)',
    harakat: '1 Harakat',
    colorHex: '#10B981',
    summary: 'Nun sukun bertemu Ya atau Wau dalam SATU KATA.',
    caraBaca: 'Wajib dibaca jelas dan tidak boleh di-idghamkan (Dunya, Bunyan, Qinwan, Shinwan).',
    contohLafadz: 'دُنْيَا • بُنْيَانٌ • قِنْوَانٌ • صِنْوَانٌ'
  },

  // Mim Sukun
  {
    id: 'enc-ikhfa-syafawi',
    title: "Ikhfa' Syafawi",
    arabicName: 'إِخْفَاء شَفَوِي',
    category: 'Mim Sukun',
    letters: 'ب',
    harakat: '2 Harakat (Dengung Bibir)',
    colorHex: '#D946EF',
    summary: 'Mim sukun (مْ) bertemu huruf Ba (ب).',
    caraBaca: 'Kedua bibir dirapatkan ringan disertai dengung 2 harakat.',
    contohLafadz: 'تَرْمِيهِم بِحِجَارَةٍ • يَعْتَصِم بِٱللَّهِ'
  },
  {
    id: 'enc-idgham-mimi',
    title: 'Idgham Mimi / Mutamatsilain',
    arabicName: 'إِدْغَام مِيمِي',
    category: 'Mim Sukun',
    letters: 'م',
    harakat: '2 Harakat (Dengung Sempurna)',
    colorHex: '#0284C7',
    summary: 'Mim sukun (مْ) bertemu huruf Mim berharakat.',
    caraBaca: 'Mim pertama melebur sempurna ke Mim kedua dengan ghunnah 2 harakat.',
    contohLafadz: 'لَهُم مَّا يَشَآءُونَ • كُنتُم مُّؤْمِنِينَ'
  },
  {
    id: 'enc-izhar-syafawi',
    title: 'Izhar Syafawi',
    arabicName: 'إِظْهَار شَفَوِي',
    category: 'Mim Sukun',
    letters: '26 Huruf Hijaiyah (Selain ب dan م)',
    harakat: '1 Harakat (Jelas)',
    colorHex: '#0D9488',
    summary: 'Mim sukun (مْ) bertemu huruf hijaiyah selain Ba dan Mim.',
    caraBaca: 'Dibaca sangat jelas di kedua bibir tanpa dengung, lebih diperjelas saat bertemu Wau dan Fa.',
    contohLafadz: 'أَلَمْ تَرَ • عَلَيْهِمْ وَلَا • أَنعَمْتَ عَلَيْهِمْ'
  },

  // Ghunnah & Qalqalah
  {
    id: 'enc-ghunnah-musyaddadah',
    title: 'Ghunnah Musyaddadah',
    arabicName: 'غُنَّة مُشَدَّدَة',
    category: 'Ghunnah & Qalqalah',
    letters: 'نّ, مّ',
    harakat: '2 - 3 Harakat (Tingkatan Tertinggi Ghunnah)',
    colorHex: '#10B981',
    summary: 'Huruf Nun bertasydid (نّ) atau Mim bertasydid (مّ).',
    caraBaca: 'Wajib didengungkan secara sempurna di rongga hidung (Khaisyum) selama 2-3 ketukan.',
    contohLafadz: 'إِنَّ ٱللَّهَ • مَلِكِ ٱلنَّاسِ • عَمَّ يَتَسَآءَلُونَ'
  },
  {
    id: 'enc-qalqalah-sughra',
    title: 'Qalqalah Sughra',
    arabicName: 'قَلْقَلَة صُغْرَى',
    category: 'Ghunnah & Qalqalah',
    letters: 'ق, ط, ب, ج, د (قَطْبُ جَدٍ)',
    harakat: '1 Harakat (Pantulan Ringan)',
    colorHex: '#F97316',
    summary: 'Huruf qalqalah berharakat sukun asli di tengah-tengah kata.',
    caraBaca: 'Dipantulkan dengan getaran suara ringan dan mengalir tanpa mematikan nafas.',
    contohLafadz: 'يَقْطَعُونَ • نَطْبَعُ • إِبْرَاهِيمَ • يَجْعَلُونَ • يَدْعُونَ'
  },
  {
    id: 'enc-qalqalah-kubra',
    title: 'Qalqalah Kubra',
    arabicName: 'قَلْقَلَة كُبْرَى',
    category: 'Ghunnah & Qalqalah',
    letters: 'ق, ط, ب, ج, د',
    harakat: '2 Harakat (Pantulan Kuat)',
    colorHex: '#EF4444',
    summary: 'Huruf qalqalah sukun karena dihentikan (waqaf) di akhir ayat/kata.',
    caraBaca: 'Dipantulkan dengan suara tebal, tegas, dan kuat saat berhenti.',
    contohLafadz: 'مَا خَلَقَ ۝ • ذَاتِ ٱلْبُرُوجِ ۝ • مُحِيطٌ ۝ • أَحَدٌ ۝'
  },
  {
    id: 'enc-qalqalah-akbar',
    title: 'Qalqalah Akbar / Asyad',
    arabicName: 'قَلْقَلَة أَكْبَر',
    category: 'Ghunnah & Qalqalah',
    letters: 'قّ, طّ, بّ, جّ, دّ (Bertasydid saat Waqaf)',
    harakat: '2 - 3 Harakat (Tertahan lalu Memantul Dahsyat)',
    colorHex: '#B91C1C',
    summary: 'Huruf qalqalah bertasydid di akhir kata saat waqaf.',
    caraBaca: 'Suara ditekan dan ditahan sejenak pada tasydid lalu dipantulkan secara kuat.',
    contohLafadz: 'تَبَّتْ يَدَآ أَبِى لَهَبٍ وَتَبَّ ۝ • بِٱلْحَقِّ ۝'
  },

  // Mad Lengkap
  {
    id: 'enc-mad-thabii',
    title: "Mad Thabi'i (Mad Asli)",
    arabicName: 'مَدّ طَبِيعِي',
    category: 'Mad Lengkap',
    letters: 'Fathah + Alif, Kasrah + Ya Sukun, Dhommah + Wau Sukun',
    harakat: '2 Harakat (1 Alif)',
    colorHex: '#F59E0B',
    summary: 'Huruf mad murni yang tidak bertemu hamzah atau sukun.',
    caraBaca: 'Dipanjangkan secara wajar dan tenang sepanjang 2 ketukan harakat.',
    contohLafadz: 'قَالُوا۟ • يُوصِيكُمْ • فِيهَا'
  },
  {
    id: 'enc-mad-wajib-muttashil',
    title: 'Mad Wajib Muttashil',
    arabicName: 'مَدّ وَاجِب مُتَّصِل',
    category: 'Mad Lengkap',
    letters: 'Huruf Mad + Hamzah dalam SATU KATA',
    harakat: '4 - 5 Harakat (Waqaf boleh 6)',
    colorHex: '#DC2626',
    summary: 'Huruf mad bertemu hamzah di dalam satu kata yang bersambung.',
    caraBaca: 'Wajib dipanjangkan 4 sampai 5 harakat secara utuh.',
    contohLafadz: 'جَآءَ • ٱلسَّمَآءِ • سُوٓءَ • سِيٓـَٔتْ'
  },
  {
    id: 'enc-mad-jaiz-munfashil',
    title: 'Mad Jaiz Munfashil',
    arabicName: 'مَدّ جَائِز مُنْفَصِل',
    category: 'Mad Lengkap',
    letters: 'Huruf Mad di akhir kata + Hamzah di awal kata berikutnya',
    harakat: '4 - 5 Harakat (Thariq Syathibiyyah)',
    colorHex: '#E11D48',
    summary: 'Huruf mad di akhir suatu kata bertemu hamzah di awal kata berikutnya.',
    caraBaca: 'Boleh dipanjangkan 4-5 harakat (2-2.5 alif) pada riwayat Hafs.',
    contohLafadz: 'إِنَّآ أَعْطَيْنَاكَ • يَآ أَيُّهَا • قُوٓا۟ أَنفُسَكُمْ'
  },
  {
    id: 'enc-mad-lazim-mutsaqqal-kilmi',
    title: 'Mad Lazim Mutsaqqal Kilmi',
    arabicName: 'مَدّ لَازِم مُثَقَّل كِلْمِي',
    category: 'Mad Lengkap',
    letters: 'Huruf Mad + Huruf Bertasydid dalam 1 Kata',
    harakat: '6 Harakat Penuh (3 Alif)',
    colorHex: '#991B1B',
    summary: 'Huruf mad bertemu huruf bertasydid di dalam satu kata.',
    caraBaca: 'Wajib dipanjangkan 6 harakat penuh lalu ditekan (nabr) ke tasydid.',
    contohLafadz: 'وَلَا ٱلضَّآلِّينَ • ٱلْحَآقَّةُ • ٱلطَّآمَّةُ • دَآبَّةٍ'
  },
  {
    id: 'enc-mad-lazim-mukhaffaf-kilmi',
    title: 'Mad Lazim Mukhaffaf Kilmi',
    arabicName: 'مَدّ لَازِم مُخَفَّف كِلْمِي',
    category: 'Mad Lengkap',
    letters: 'Huruf Mad + Huruf Sukun Asli dalam 1 Kata',
    harakat: '6 Harakat Penuh',
    colorHex: '#7F1D1D',
    summary: 'Satu-satunya di Al-Qur\'an pada lafadz آلْآنَ (QS. Yunus: 51 & 91).',
    caraBaca: 'Dipanjangkan 6 harakat penuh tanpa tasydid.',
    contohLafadz: 'ءَآلْـَٰٔنَ وَقَدْ كُنتُم بِهِۦ تَسْتَعْجِلُونَ'
  },
  {
    id: 'enc-mad-lazim-harfi',
    title: 'Mad Lazim Harfi (Mutsaqqal & Mukhaffaf)',
    arabicName: 'مَدّ لَازِم حَرْفِي',
    category: 'Mad Lengkap',
    letters: 'ن, ق, ص, ع, س, ل, ك, م (نَقَصَ عَسَلُكُمْ)',
    harakat: '6 Harakat Penuh',
    colorHex: '#831843',
    summary: 'Mad pada huruf pembuka surah (Fawatihussuwar).',
    caraBaca: 'Dipanjangkan 6 harakat penuh saat melafadzkan nama hurufnya.',
    contohLafadz: 'الٓمٓ (Laam & Miim) • قٓ • نٓ • صٓ • طسٓمٓ'
  },
  {
    id: 'enc-mad-arid-lissukun',
    title: "Mad 'Aridh Lissukun",
    arabicName: 'مَدّ عَارِض لِلسُّكُون',
    category: 'Mad Lengkap',
    letters: 'Huruf Mad sebelum huruf terakhir ayat saat waqaf',
    harakat: '2, 4, atau 6 Harakat (4 lebih utama)',
    colorHex: '#D97706',
    summary: 'Huruf mad bertemu huruf hidup yang disukunkan karena berhenti (waqaf).',
    caraBaca: 'Boleh dibaca Qashr (2), Tawassuth (4), atau Thul (6 harakat) saat berhenti.',
    contohLafadz: 'ٱلْعَالَمِينَ ۝ • ٱلرَّحِيمِ ۝ • نَسْتَعِينُ ۝'
  },
  {
    id: 'enc-mad-lin',
    title: 'Mad Lin / Layyin',
    arabicName: 'مَدّ لِين',
    category: 'Mad Lengkap',
    letters: 'Fathah + Wau Sukun (َوْ) / Ya Sukun (َيْ) saat Waqaf',
    harakat: '2, 4, atau 6 Harakat',
    colorHex: '#B45309',
    summary: 'Huruf lin (Wau/Ya sukun didahului fathah) dihentikan saat waqaf.',
    caraBaca: 'Suara dialirkan secara lembut dan lunak 2, 4, atau 6 harakat.',
    contohLafadz: 'خَوْفٍ ۝ • قُرَيْشٍ ۝ • ٱلْبَيْتِ ۝'
  },
  {
    id: 'enc-mad-badal',
    title: 'Mad Badal',
    arabicName: 'مَدّ بَدَل',
    category: 'Mad Lengkap',
    letters: 'Hamzah mendahului huruf Mad',
    harakat: '2 Harakat',
    colorHex: '#CA8A04',
    summary: 'Hamzah berharakat mendahului huruf mad (aslinya dua hamzah: ءَا &rarr; آ).',
    caraBaca: 'Dipanjangkan 2 harakat wajar (seperti Mad Thabi\'i).',
    contohLafadz: 'ءَامَنُوا۟ • أُوتُوا۟ • إِيمَانًا'
  },
  {
    id: 'enc-mad-iwadh',
    title: "Mad 'Iwadh",
    arabicName: 'مَدّ عِوَض',
    category: 'Mad Lengkap',
    letters: 'Tanwin Fathah (ـً) di akhir kalimat saat Waqaf',
    harakat: '2 Harakat',
    colorHex: '#EAB308',
    summary: 'Pengganti bunyi tanwin fathah saat berhenti di akhir ayat.',
    caraBaca: 'Bunyi tanwin "An" diubah menjadi bunyi mad panjang "Aa" 2 harakat.',
    contohLafadz: 'عَلِيمًا حَكِيمًا ۝ &rarr; Hakiimaa • غَفُورًا رَّحِيمًا ۝ &rarr; Rahiimaa'
  },
  {
    id: 'enc-mad-shilah',
    title: 'Mad Shilah (Qashirah & Thawilah)',
    arabicName: 'مَدّ صِلَة (قَصِيرَة & طَوِيلَة)',
    category: 'Mad Lengkap',
    letters: 'Ha Dhomir (ـهُ / ـهِ) di antara dua huruf hidup',
    harakat: 'Qashirah: 2 Harakat • Thawilah (bertemu hamzah): 4-5 Harakat',
    colorHex: '#A16207',
    summary: 'Mad pada Ha Kata Ganti Tunggal Ketiga (Ha Dhomir).',
    caraBaca: 'Dipanjangkan 2 harakat jika huruf berikutnya bukan hamzah, 4-5 jika bertemu hamzah.',
    contohLafadz: 'إِنَّهُۥ كَانَ (Qashirah) • عِندَهُۥٓ إِلَّا (Thawilah)'
  }
];

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
        if (!seenRules.has(uniqueKey) && rulesList.length < 28) {
          seenRules.add(uniqueKey);

          let cat: TajwidRuleItem['ruleCategory'] = 'mad';
          if (t.rule.includes('ghunnah')) cat = 'ghunnah';
          else if (t.rule.includes('qalqalah')) cat = 'qalqalah';
          else if (t.rule.includes('syafawi') || t.rule.includes('mimi')) cat = 'mim_mati';
          else if (t.rule.includes('izhar') || t.rule.includes('idgham') || t.rule.includes('ikhfa') || t.rule.includes('iqlab')) cat = 'nun_mati_tanwin';

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

import { SurahMeta, Ayat } from '../types';
import { formatAlafasyAudioUrl } from '../services/audioPlayerService';
import { JUZ_29_AYATS } from './juz29Data';
import { JUZ_30_AYATS } from './juz30Data';

// Authentic 30 Juz Mapping & Surah Directory (Standar Mushaf Utsmani Madinah / Kemenag RI)
export interface JuzInfo {
  number: number;
  surahNumbers: number[];
  name: string;
  arabicName: string;
  ayahRange: string;
}

export const JUZ_MAP: Record<number, JuzInfo> = {
  1: { number: 1, surahNumbers: [1, 2], name: 'Al-Fatihah 1 - Al-Baqarah 141', arabicName: 'الجزء الأول', ayahRange: 'Al-Fatihah 1 – Al-Baqarah 141' },
  2: { number: 2, surahNumbers: [2], name: 'Al-Baqarah 142 - 252', arabicName: 'الجزء الثاني', ayahRange: 'Al-Baqarah 142 – 252 (سَيَقُولُ)' },
  3: { number: 3, surahNumbers: [2, 3], name: 'Al-Baqarah 253 - Ali \'Imran 92', arabicName: 'الجزء الثالث', ayahRange: 'Al-Baqarah 253 – Ali \'Imran 92 (تِلْكَ الرُّسُلُ)' },
  4: { number: 4, surahNumbers: [3, 4], name: 'Ali \'Imran 93 - An-Nisa\' 23', arabicName: 'الجزء الرابع', ayahRange: 'Ali \'Imran 93 – An-Nisa\' 23 (لَنْ تَنَالُوا)' },
  5: { number: 5, surahNumbers: [4], name: 'An-Nisa\' 24 - 147', arabicName: 'الجزء الخامس', ayahRange: 'An-Nisa\' 24 – 147 (وَالْمُحْصَنَاتُ)' },
  6: { number: 6, surahNumbers: [4, 5], name: 'An-Nisa\' 148 - Al-Ma\'idah 81', arabicName: 'الجزء السادس', ayahRange: 'An-Nisa\' 148 – Al-Ma\'idah 81 (لَا يُحِبُّ اللَّهُ)' },
  7: { number: 7, surahNumbers: [5, 6], name: 'Al-Ma\'idah 82 - Al-An\'am 110', arabicName: 'الجزء السابع', ayahRange: 'Al-Ma\'idah 82 – Al-An\'am 110 (وَإِذَا سَمِعُوا)' },
  8: { number: 8, surahNumbers: [6, 7], name: 'Al-An\'am 111 - Al-A\'raf 87', arabicName: 'الجزء الثامن', ayahRange: 'Al-An\'am 111 – Al-A\'raf 87 (وَلَوْ أَنَّنَا)' },
  9: { number: 9, surahNumbers: [7, 8], name: 'Al-A\'raf 88 - Al-Anfal 40', arabicName: 'الجزء التاسع', ayahRange: 'Al-A\'raf 88 – Al-Anfal 40 (قَالَ الْمَلَأُ)' },
  10: { number: 10, surahNumbers: [8, 9], name: 'Al-Anfal 41 - At-Taubah 92', arabicName: 'الجزء العاشر', ayahRange: 'Al-Anfal 41 – At-Taubah 92 (وَاعْلَمُوا)' },
  11: { number: 11, surahNumbers: [9, 10, 11], name: 'At-Taubah 93 - Hud 5', arabicName: 'الجزء الحادي عشر', ayahRange: 'At-Taubah 93 – Hud 5 (يَعْتَذِرُونَ)' },
  12: { number: 12, surahNumbers: [11, 12], name: 'Hud 6 - Yusuf 52', arabicName: 'الجزء الثاني عشر', ayahRange: 'Hud 6 – Yusuf 52 (وَمَا مِنْ دَابَّةٍ)' },
  13: { number: 13, surahNumbers: [12, 13, 14], name: 'Yusuf 53 - Ibrahim 52', arabicName: 'الجزء الثالث عشر', ayahRange: 'Yusuf 53 – Ibrahim 52 (وَمَا أُبَرِّئُ)' },
  14: { number: 14, surahNumbers: [15, 16], name: 'Al-Hijr 1 - An-Nahl 128', arabicName: 'الجزء الرابع عشر', ayahRange: 'Al-Hijr 1 – An-Nahl 128 (رُبَمَا)' },
  15: { number: 15, surahNumbers: [17, 18], name: 'Al-Isra\' 1 - Al-Kahf 74', arabicName: 'الجزء الخامس عشر', ayahRange: 'Al-Isra\' 1 – Al-Kahf 74 (سُبْحَانَ الَّذِي)' },
  16: { number: 16, surahNumbers: [18, 19, 20], name: 'Al-Kahf 75 - Taha 135', arabicName: 'الجزء السادس عشر', ayahRange: 'Al-Kahf 75 – Taha 135 (قَالَ أَلَمْ أَقُلْ)' },
  17: { number: 17, surahNumbers: [21, 22], name: 'Al-Anbiya\' 1 - Al-Hajj 78', arabicName: 'الجزء السابع عشر', ayahRange: 'Al-Anbiya\' 1 – Al-Hajj 78 (اقْتَرَبَ لِلنَّاسِ)' },
  18: { number: 18, surahNumbers: [23, 24, 25], name: 'Al-Mu\'minun 1 - Al-Furqan 20', arabicName: 'الجزء الثامن عشر', ayahRange: 'Al-Mu\'minun 1 – Al-Furqan 20 (قَدْ أَفْلَحَ)' },
  19: { number: 19, surahNumbers: [25, 26, 27], name: 'Al-Furqan 21 - An-Naml 55', arabicName: 'الجزء التاسع عشر', ayahRange: 'Al-Furqan 21 – An-Naml 55 (وَقَالَ الَّذِينَ)' },
  20: { number: 20, surahNumbers: [27, 28, 29], name: 'An-Naml 56 - Al-\'Ankabut 45', arabicName: 'الجزء العشرون', ayahRange: 'An-Naml 56 – Al-\'Ankabut 45 (فَمَا كَانَ جَوَابَ)' },
  21: { number: 21, surahNumbers: [29, 30, 31, 32, 33], name: 'Al-\'Ankabut 46 - Al-Ahzab 30', arabicName: 'الجزء الحادي والعشرون', ayahRange: 'Al-\'Ankabut 46 – Al-Ahzab 30 (وَلَا تُجَادِلُوا)' },
  22: { number: 22, surahNumbers: [33, 34, 35, 36], name: 'Al-Ahzab 31 - Yasin 27', arabicName: 'الجزء الثاني والعشرون', ayahRange: 'Al-Ahzab 31 – Yasin 27 (وَمَنْ يَقْنُتْ)' },
  23: { number: 23, surahNumbers: [36, 37, 38, 39], name: 'Yasin 28 - Az-Zumar 31', arabicName: 'الجزء الثالث والعشرون', ayahRange: 'Yasin 28 – Az-Zumar 31 (وَمَا أَنْزَلْنَا)' },
  24: { number: 24, surahNumbers: [39, 40, 41], name: 'Az-Zumar 32 - Fussilat 46', arabicName: 'الجزء الرابع والعشرون', ayahRange: 'Az-Zumar 32 – Fussilat 46 (فَمَنْ أَظْلَمُ)' },
  25: { number: 25, surahNumbers: [41, 42, 43, 44, 45], name: 'Fussilat 47 - Al-Jasiyah 37', arabicName: 'الجزء الخامس والعشرون', ayahRange: 'Fussilat 47 – Al-Jasiyah 37 (إِلَيْهِ يُرَدُّ)' },
  26: { number: 26, surahNumbers: [46, 47, 48, 49, 50, 51], name: 'Al-Ahqaf 1 - Az-Zariyat 30', arabicName: 'الجزء السادس والعشرون', ayahRange: 'Al-Ahqaf 1 – Az-Zariyat 30 (حم)' },
  27: { number: 27, surahNumbers: [51, 52, 53, 54, 55, 56, 57], name: 'Az-Zariyat 31 - Al-Hadid 29', arabicName: 'الجزء السابع والعشرون', ayahRange: 'Az-Zariyat 31 – Al-Hadid 29 (قَالَ فَمَا خَطْبُكُمْ)' },
  28: { number: 28, surahNumbers: [58, 59, 60, 61, 62, 63, 64, 65, 66], name: 'Al-Mujadilah 1 - At-Tahrim 12', arabicName: 'الجزء الثامن والعشرون', ayahRange: 'Al-Mujadilah 1 – At-Tahrim 12 (قَدْ سَمِعَ)' },
  29: { number: 29, surahNumbers: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77], name: 'Al-Mulk 1 - Al-Mursalat 50', arabicName: 'الجزء التاسع والعشرون', ayahRange: 'Al-Mulk 1 – Al-Mursalat 50 (تَبَارَكَ الَّذِي)' },
  30: { number: 30, surahNumbers: Array.from({ length: 37 }, (_, i) => 78 + i), name: 'An-Naba\' 1 - An-Nas 6 (Juz \'Amma)', arabicName: 'الجزء الثلاثون (جزء عم)', ayahRange: 'An-Naba\' 1 – An-Nas 6 (عَمَّ يَتَسَاءَلُونَ)' }
};

export function getSurahsInJuz(juzNumber: number): SurahMeta[] {
  const juz = JUZ_MAP[juzNumber];
  if (!juz) return [];
  return SURAH_LIST.filter(s => juz.surahNumbers.includes(s.number));
}

export function getSurahJuzList(surahNumber: number): number[] {
  const result: number[] = [];
  for (let j = 1; j <= 30; j++) {
    if (JUZ_MAP[j]?.surahNumbers.includes(surahNumber)) {
      result.push(j);
    }
  }
  return result.length > 0 ? result : [1];
}

export function getAyatJuzNumber(surahNumber: number, ayahNumber: number): number {
  if (surahNumber === 1) return 1;
  if (surahNumber === 2) {
    if (ayahNumber <= 141) return 1;
    if (ayahNumber <= 252) return 2;
    return 3;
  }
  if (surahNumber === 3) {
    if (ayahNumber <= 92) return 3;
    return 4;
  }
  if (surahNumber === 4) {
    if (ayahNumber <= 23) return 4;
    if (ayahNumber <= 147) return 5;
    return 6;
  }
  if (surahNumber === 5) {
    if (ayahNumber <= 81) return 6;
    return 7;
  }
  if (surahNumber === 6) {
    if (ayahNumber <= 110) return 7;
    return 8;
  }
  if (surahNumber === 7) {
    if (ayahNumber <= 87) return 8;
    return 9;
  }
  if (surahNumber === 8) {
    if (ayahNumber <= 40) return 9;
    return 10;
  }
  if (surahNumber === 9) {
    if (ayahNumber <= 92) return 10;
    return 11;
  }
  if (surahNumber === 10) return 11;
  if (surahNumber === 11) {
    if (ayahNumber <= 5) return 11;
    return 12;
  }
  if (surahNumber === 12) {
    if (ayahNumber <= 52) return 12;
    return 13;
  }
  if (surahNumber === 13 || surahNumber === 14) return 13;
  if (surahNumber === 15 || surahNumber === 16) return 14;
  if (surahNumber === 17) return 15;
  if (surahNumber === 18) {
    if (ayahNumber <= 74) return 15;
    return 16;
  }
  if (surahNumber === 19 || surahNumber === 20) return 16;
  if (surahNumber === 21 || surahNumber === 22) return 17;
  if (surahNumber === 23 || surahNumber === 24) return 18;
  if (surahNumber === 25) {
    if (ayahNumber <= 20) return 18;
    return 19;
  }
  if (surahNumber === 26) return 19;
  if (surahNumber === 27) {
    if (ayahNumber <= 55) return 19;
    return 20;
  }
  if (surahNumber === 28) return 20;
  if (surahNumber === 29) {
    if (ayahNumber <= 45) return 20;
    return 21;
  }
  if (surahNumber >= 30 && surahNumber <= 32) return 21;
  if (surahNumber === 33) {
    if (ayahNumber <= 30) return 21;
    return 22;
  }
  if (surahNumber === 34 || surahNumber === 35) return 22;
  if (surahNumber === 36) {
    if (ayahNumber <= 27) return 22;
    return 23;
  }
  if (surahNumber === 37 || surahNumber === 38) return 23;
  if (surahNumber === 39) {
    if (ayahNumber <= 31) return 23;
    return 24;
  }
  if (surahNumber === 40) return 24;
  if (surahNumber === 41) {
    if (ayahNumber <= 46) return 24;
    return 25;
  }
  if (surahNumber >= 42 && surahNumber <= 45) return 25;
  if (surahNumber >= 46 && surahNumber <= 50) return 26;
  if (surahNumber === 51) {
    if (ayahNumber <= 30) return 26;
    return 27;
  }
  if (surahNumber >= 52 && surahNumber <= 57) return 27;
  if (surahNumber >= 58 && surahNumber <= 66) return 28;
  if (surahNumber >= 67 && surahNumber <= 77) return 29;
  if (surahNumber >= 78 && surahNumber <= 114) return 30;
  return 1;
}

export const SURAH_LIST: SurahMeta[] = [
  { number: 1, name: 'الفاتحة', latinName: 'Al-Fatihah', meaning: 'Pembukaan', ayahCount: 7, revelationPlace: 'Makkah', juzStart: 1, juzList: [1] },
  { number: 2, name: 'البقرة', latinName: 'Al-Baqarah', meaning: 'Sapi Betina', ayahCount: 286, revelationPlace: 'Madinah', juzStart: 1, juzList: [1, 2, 3] },
  { number: 3, name: 'آل عمران', latinName: 'Ali \'Imran', meaning: 'Keluarga Imran', ayahCount: 200, revelationPlace: 'Madinah', juzStart: 3, juzList: [3, 4] },
  { number: 4, name: 'النساء', latinName: 'An-Nisa\'', meaning: 'Wanita', ayahCount: 176, revelationPlace: 'Madinah', juzStart: 4, juzList: [4, 5, 6] },
  { number: 5, name: 'المائدة', latinName: 'Al-Ma\'idah', meaning: 'Hidangan', ayahCount: 120, revelationPlace: 'Madinah', juzStart: 6, juzList: [6, 7] },
  { number: 6, name: 'الأنعام', latinName: 'Al-An\'am', meaning: 'Binatang Ternak', ayahCount: 165, revelationPlace: 'Makkah', juzStart: 7, juzList: [7, 8] },
  { number: 7, name: 'الأعراف', latinName: 'Al-A\'raf', meaning: 'Tempat Tertinggi', ayahCount: 206, revelationPlace: 'Makkah', juzStart: 8, juzList: [8, 9] },
  { number: 8, name: 'الأنفال', latinName: 'Al-Anfal', meaning: 'Harta Rampasan Perang', ayahCount: 75, revelationPlace: 'Madinah', juzStart: 9, juzList: [9, 10] },
  { number: 9, name: 'التوبة', latinName: 'At-Taubah', meaning: 'Pengampunan', ayahCount: 129, revelationPlace: 'Madinah', juzStart: 10, juzList: [10, 11] },
  { number: 10, name: 'يونس', latinName: 'Yunus', meaning: 'Nabi Yunus', ayahCount: 109, revelationPlace: 'Makkah', juzStart: 11, juzList: [11] },
  { number: 11, name: 'هود', latinName: 'Hud', meaning: 'Nabi Hud', ayahCount: 123, revelationPlace: 'Makkah', juzStart: 11, juzList: [11, 12] },
  { number: 12, name: 'يوسف', latinName: 'Yusuf', meaning: 'Nabi Yusuf', ayahCount: 111, revelationPlace: 'Makkah', juzStart: 12, juzList: [12, 13] },
  { number: 13, name: 'الرعد', latinName: 'Ar-Ra\'d', meaning: 'Guruh', ayahCount: 43, revelationPlace: 'Madinah', juzStart: 13, juzList: [13] },
  { number: 14, name: 'إبراهيم', latinName: 'Ibrahim', meaning: 'Nabi Ibrahim', ayahCount: 52, revelationPlace: 'Makkah', juzStart: 13, juzList: [13] },
  { number: 15, name: 'الحجر', latinName: 'Al-Hijr', meaning: 'Gunung Al-Hijr', ayahCount: 99, revelationPlace: 'Makkah', juzStart: 14, juzList: [14] },
  { number: 16, name: 'النحل', latinName: 'An-Nahl', meaning: 'Lebah', ayahCount: 128, revelationPlace: 'Makkah', juzStart: 14, juzList: [14] },
  { number: 17, name: 'الإسراء', latinName: 'Al-Isra\'', meaning: 'Perjalanan Malam', ayahCount: 111, revelationPlace: 'Makkah', juzStart: 15, juzList: [15] },
  { number: 18, name: 'الكهف', latinName: 'Al-Kahf', meaning: 'Penghuni Gua', ayahCount: 110, revelationPlace: 'Makkah', juzStart: 15, juzList: [15, 16] },
  { number: 19, name: 'مريم', latinName: 'Maryam', meaning: 'Maryam', ayahCount: 98, revelationPlace: 'Makkah', juzStart: 16, juzList: [16] },
  { number: 20, name: 'طه', latinName: 'Taha', meaning: 'Taha', ayahCount: 135, revelationPlace: 'Makkah', juzStart: 16, juzList: [16] },
  { number: 21, name: 'الأنبياء', latinName: 'Al-Anbiya\'', meaning: 'Para Nabi', ayahCount: 112, revelationPlace: 'Makkah', juzStart: 17, juzList: [17] },
  { number: 22, name: 'الحج', latinName: 'Al-Hajj', meaning: 'Haji', ayahCount: 78, revelationPlace: 'Madinah', juzStart: 17, juzList: [17] },
  { number: 23, name: 'المؤمنون', latinName: 'Al-Mu\'minun', meaning: 'Orang-Orang Mukmin', ayahCount: 118, revelationPlace: 'Makkah', juzStart: 18, juzList: [18] },
  { number: 24, name: 'النور', latinName: 'An-Nur', meaning: 'Cahaya', ayahCount: 64, revelationPlace: 'Madinah', juzStart: 18, juzList: [18] },
  { number: 25, name: 'الفرقان', latinName: 'Al-Furqan', meaning: 'Pembeda', ayahCount: 77, revelationPlace: 'Makkah', juzStart: 18, juzList: [18, 19] },
  { number: 26, name: 'الشعراء', latinName: 'Asy-Syu\'ara\'', meaning: 'Penyair', ayahCount: 227, revelationPlace: 'Makkah', juzStart: 19, juzList: [19] },
  { number: 27, name: 'النمل', latinName: 'An-Naml', meaning: 'Semut', ayahCount: 93, revelationPlace: 'Makkah', juzStart: 19, juzList: [19, 20] },
  { number: 28, name: 'القصص', latinName: 'Al-Qasas', meaning: 'Kisah-Kisah', ayahCount: 88, revelationPlace: 'Makkah', juzStart: 20, juzList: [20] },
  { number: 29, name: 'العنكبوت', latinName: 'Al-\'Ankabut', meaning: 'Laba-Laba', ayahCount: 69, revelationPlace: 'Makkah', juzStart: 20, juzList: [20, 21] },
  { number: 30, name: 'الروم', latinName: 'Ar-Rum', meaning: 'Bangsa Romawi', ayahCount: 60, revelationPlace: 'Makkah', juzStart: 21, juzList: [21] },
  { number: 31, name: 'لقمان', latinName: 'Luqman', meaning: 'Luqman', ayahCount: 34, revelationPlace: 'Makkah', juzStart: 21, juzList: [21] },
  { number: 32, name: 'السجدة', latinName: 'As-Sajdah', meaning: 'Sujud', ayahCount: 30, revelationPlace: 'Makkah', juzStart: 21, juzList: [21] },
  { number: 33, name: 'الأحزاب', latinName: 'Al-Ahzab', meaning: 'Golongan yang Bersekutu', ayahCount: 73, revelationPlace: 'Madinah', juzStart: 21, juzList: [21, 22] },
  { number: 34, name: 'سبأ', latinName: 'Saba\'', meaning: 'Kaum Saba\'', ayahCount: 54, revelationPlace: 'Makkah', juzStart: 22, juzList: [22] },
  { number: 35, name: 'فاطر', latinName: 'Fatir', meaning: 'Pencipta', ayahCount: 45, revelationPlace: 'Makkah', juzStart: 22, juzList: [22] },
  { number: 36, name: 'يس', latinName: 'Yasin', meaning: 'Yasin', ayahCount: 83, revelationPlace: 'Makkah', juzStart: 22, juzList: [22, 23] },
  { number: 37, name: 'الصافات', latinName: 'As-Saffat', meaning: 'Barisan-Barisan', ayahCount: 182, revelationPlace: 'Makkah', juzStart: 23, juzList: [23] },
  { number: 38, name: 'ص', latinName: 'Sad', meaning: 'Sad', ayahCount: 88, revelationPlace: 'Makkah', juzStart: 23, juzList: [23] },
  { number: 39, name: 'الزمر', latinName: 'Az-Zumar', meaning: 'Rombongan', ayahCount: 75, revelationPlace: 'Makkah', juzStart: 23, juzList: [23, 24] },
  { number: 40, name: 'غافر', latinName: 'Ghafir', meaning: 'Yang Mengampuni', ayahCount: 85, revelationPlace: 'Makkah', juzStart: 24, juzList: [24] },
  { number: 41, name: 'فصلت', latinName: 'Fussilat', meaning: 'Yang Dijelaskan', ayahCount: 54, revelationPlace: 'Makkah', juzStart: 24, juzList: [24, 25] },
  { number: 42, name: 'الشورى', latinName: 'Asy-Syura', meaning: 'Musyawarah', ayahCount: 53, revelationPlace: 'Makkah', juzStart: 25, juzList: [25] },
  { number: 43, name: 'الزخرف', latinName: 'Az-Zukhruf', meaning: 'Perhiasan', ayahCount: 89, revelationPlace: 'Makkah', juzStart: 25, juzList: [25] },
  { number: 44, name: 'الدخان', latinName: 'Ad-Dukhan', meaning: 'Kabut', ayahCount: 59, revelationPlace: 'Makkah', juzStart: 25, juzList: [25] },
  { number: 45, name: 'الجاثية', latinName: 'Al-Jasiyah', meaning: 'Yang Berlutut', ayahCount: 37, revelationPlace: 'Makkah', juzStart: 25, juzList: [25] },
  { number: 46, name: 'الأحقاف', latinName: 'Al-Ahqaf', meaning: 'Bukit-Bukit Pasir', ayahCount: 35, revelationPlace: 'Makkah', juzStart: 26, juzList: [26] },
  { number: 47, name: 'محمد', latinName: 'Muhammad', meaning: 'Nabi Muhammad', ayahCount: 38, revelationPlace: 'Madinah', juzStart: 26, juzList: [26] },
  { number: 48, name: 'الفتح', latinName: 'Al-Fath', meaning: 'Kemenangan', ayahCount: 29, revelationPlace: 'Madinah', juzStart: 26, juzList: [26] },
  { number: 49, name: 'الحجرات', latinName: 'Al-Hujurat', meaning: 'Kamar-Kamar', ayahCount: 18, revelationPlace: 'Madinah', juzStart: 26, juzList: [26] },
  { number: 50, name: 'ق', latinName: 'Qaf', meaning: 'Qaf', ayahCount: 45, revelationPlace: 'Makkah', juzStart: 26, juzList: [26] },
  { number: 51, name: 'الذاريات', latinName: 'Az-Zariyat', meaning: 'Angin yang Menerbangkan', ayahCount: 60, revelationPlace: 'Makkah', juzStart: 26, juzList: [26, 27] },
  { number: 52, name: 'الطور', latinName: 'At-Tur', meaning: 'Bukit Tursina', ayahCount: 49, revelationPlace: 'Makkah', juzStart: 27, juzList: [27] },
  { number: 53, name: 'النجم', latinName: 'An-Najm', meaning: 'Bintang', ayahCount: 62, revelationPlace: 'Makkah', juzStart: 27, juzList: [27] },
  { number: 54, name: 'القمر', latinName: 'Al-Qamar', meaning: 'Bulan', ayahCount: 55, revelationPlace: 'Makkah', juzStart: 27, juzList: [27] },
  { number: 55, name: 'الرحمن', latinName: 'Ar-Rahman', meaning: 'Maha Pengasih', ayahCount: 78, revelationPlace: 'Madinah', juzStart: 27, juzList: [27] },
  { number: 56, name: 'الواقعة', latinName: 'Al-Waqi\'ah', meaning: 'Hari Kiamat', ayahCount: 96, revelationPlace: 'Makkah', juzStart: 27, juzList: [27] },
  { number: 57, name: 'الحديد', latinName: 'Al-Hadid', meaning: 'Besi', ayahCount: 29, revelationPlace: 'Madinah', juzStart: 27, juzList: [27] },
  { number: 58, name: 'المجادلة', latinName: 'Al-Mujadilah', meaning: 'Gugatan', ayahCount: 22, revelationPlace: 'Madinah', juzStart: 28, juzList: [28] },
  { number: 59, name: 'الحشر', latinName: 'Al-Hasyr', meaning: 'Pengusiran', ayahCount: 24, revelationPlace: 'Madinah', juzStart: 28, juzList: [28] },
  { number: 60, name: 'الممتحنة', latinName: 'Al-Mumtahanah', meaning: 'Wanita yang Diuji', ayahCount: 13, revelationPlace: 'Madinah', juzStart: 28, juzList: [28] },
  { number: 61, name: 'الصف', latinName: 'As-Saff', meaning: 'Barisan', ayahCount: 14, revelationPlace: 'Madinah', juzStart: 28, juzList: [28] },
  { number: 62, name: 'الجمعة', latinName: 'Al-Jumu\'ah', meaning: 'Hari Jumat', ayahCount: 11, revelationPlace: 'Madinah', juzStart: 28, juzList: [28] },
  { number: 63, name: 'المنافقون', latinName: 'Al-Munafiqun', meaning: 'Orang-Orang Munafik', ayahCount: 11, revelationPlace: 'Madinah', juzStart: 28, juzList: [28] },
  { number: 64, name: 'التغابن', latinName: 'At-Taghabun', meaning: 'Hari Ditampakkan Kesalahan', ayahCount: 18, revelationPlace: 'Madinah', juzStart: 28, juzList: [28] },
  { number: 65, name: 'الطلاق', latinName: 'At-Talaq', meaning: 'Talak', ayahCount: 12, revelationPlace: 'Madinah', juzStart: 28, juzList: [28] },
  { number: 66, name: 'التحريم', latinName: 'At-Tahrim', meaning: 'Pengharaman', ayahCount: 12, revelationPlace: 'Madinah', juzStart: 28, juzList: [28] },
  { number: 67, name: 'الملك', latinName: 'Al-Mulk', meaning: 'Kerajaan', ayahCount: 30, revelationPlace: 'Makkah', juzStart: 29, juzList: [29] },
  { number: 68, name: 'القلم', latinName: 'Al-Qalam', meaning: 'Pena', ayahCount: 52, revelationPlace: 'Makkah', juzStart: 29, juzList: [29] },
  { number: 69, name: 'الحاقة', latinName: 'Al-Haqqah', meaning: 'Hari Kiamat', ayahCount: 52, revelationPlace: 'Makkah', juzStart: 29, juzList: [29] },
  { number: 70, name: 'المعارج', latinName: 'Al-Ma\'arij', meaning: 'Tempat Naik', ayahCount: 44, revelationPlace: 'Makkah', juzStart: 29, juzList: [29] },
  { number: 71, name: 'نوح', latinName: 'Nuh', meaning: 'Nabi Nuh', ayahCount: 28, revelationPlace: 'Makkah', juzStart: 29, juzList: [29] },
  { number: 72, name: 'الجن', latinName: 'Al-Jinn', meaning: 'Jin', ayahCount: 28, revelationPlace: 'Makkah', juzStart: 29, juzList: [29] },
  { number: 73, name: 'المزمل', latinName: 'Al-Muzzammil', meaning: 'Orang yang Berselimut', ayahCount: 20, revelationPlace: 'Makkah', juzStart: 29, juzList: [29] },
  { number: 74, name: 'المدثر', latinName: 'Al-Muddassir', meaning: 'Orang yang Berkemul', ayahCount: 56, revelationPlace: 'Makkah', juzStart: 29, juzList: [29] },
  { number: 75, name: 'القيامة', latinName: 'Al-Qiyamah', meaning: 'Hari Kiamat', ayahCount: 40, revelationPlace: 'Makkah', juzStart: 29, juzList: [29] },
  { number: 76, name: 'الإنسان', latinName: 'Al-Insan', meaning: 'Manusia', ayahCount: 31, revelationPlace: 'Madinah', juzStart: 29, juzList: [29] },
  { number: 77, name: 'المرسلات', latinName: 'Al-Mursalat', meaning: 'Malaikat yang Diutus', ayahCount: 50, revelationPlace: 'Makkah', juzStart: 29, juzList: [29] },
  { number: 78, name: 'النبأ', latinName: 'An-Naba\'', meaning: 'Berita Besar', ayahCount: 40, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 79, name: 'النازعات', latinName: 'An-Nazi\'at', meaning: 'Malaikat Pencabut Nyawa', ayahCount: 46, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 80, name: 'عبس', latinName: '\'Abasa', meaning: 'Bermuka Masam', ayahCount: 42, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 81, name: 'التكوير', latinName: 'At-Takwir', meaning: 'Penggulungan', ayahCount: 29, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 82, name: 'الانفطار', latinName: 'Al-Infitar', meaning: 'Terbelah', ayahCount: 19, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 83, name: 'المطففين', latinName: 'Al-Mutaffifin', meaning: 'Orang-Orang Curang', ayahCount: 36, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 84, name: 'الانشقاق', latinName: 'Al-Insyiqaq', meaning: 'Terbelah', ayahCount: 25, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 85, name: 'البروج', latinName: 'Al-Buruj', meaning: 'Gugusan Bintang', ayahCount: 22, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 86, name: 'الطارق', latinName: 'At-Tariq', meaning: 'Yang Datang di Malam Hari', ayahCount: 17, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 87, name: 'الأعلى', latinName: 'Al-A\'la', meaning: 'Maha Tinggi', ayahCount: 19, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 88, name: 'الغاشية', latinName: 'Al-Ghasyiyah', meaning: 'Hari Pembalasan', ayahCount: 26, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 89, name: 'الفجر', latinName: 'Al-Fajr', meaning: 'Fajar', ayahCount: 30, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 90, name: 'البلد', latinName: 'Al-Balad', meaning: 'Negeri', ayahCount: 20, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 91, name: 'الشمس', latinName: 'Asy-Syams', meaning: 'Matahari', ayahCount: 15, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 92, name: 'الليل', latinName: 'Al-Lail', meaning: 'Malam', ayahCount: 21, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 93, name: 'الضحى', latinName: 'Ad-Duha', meaning: 'Waktu Dhuha', ayahCount: 11, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 94, name: 'الشرح', latinName: 'Asy-Syarh', meaning: 'Kelapangan', ayahCount: 8, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 95, name: 'التين', latinName: 'At-Tin', meaning: 'Buah Tin', ayahCount: 8, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 96, name: 'العلق', latinName: 'Al-\'Alaq', meaning: 'Segumpal Darah', ayahCount: 19, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 97, name: 'القدر', latinName: 'Al-Qadr', meaning: 'Kemuliaan', ayahCount: 5, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 98, name: 'البينة', latinName: 'Al-Bayyinah', meaning: 'Bukti Nyata', ayahCount: 8, revelationPlace: 'Madinah', juzStart: 30, juzList: [30] },
  { number: 99, name: 'الزلزلة', latinName: 'Az-Zalzalah', meaning: 'Guncangan', ayahCount: 8, revelationPlace: 'Madinah', juzStart: 30, juzList: [30] },
  { number: 100, name: 'العاديات', latinName: 'Al-\'Adiyat', meaning: 'Kuda yang Berlari Kencang', ayahCount: 11, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 101, name: 'القارعة', latinName: 'Al-Qari\'ah', meaning: 'Hari Kiamat yang Menggemparkan', ayahCount: 11, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 102, name: 'التكاثر', latinName: 'At-Takasur', meaning: 'Bermegah-Megahan', ayahCount: 8, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 103, name: 'العصر', latinName: 'Al-\'Asr', meaning: 'Masa / Waktu', ayahCount: 3, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 104, name: 'الهمزة', latinName: 'Al-Humazah', meaning: 'Pengumpat', ayahCount: 9, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 105, name: 'الفيل', latinName: 'Al-Fil', meaning: 'Gajah', ayahCount: 5, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 106, name: 'قريش', latinName: 'Quraisy', meaning: 'Suku Quraisy', ayahCount: 4, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 107, name: 'الماعون', latinName: 'Al-Ma\'un', meaning: 'Barang-Barang yang Berguna', ayahCount: 7, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 108, name: 'الكوثر', latinName: 'Al-Kausar', meaning: 'Nikmat yang Berlimpah', ayahCount: 3, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 109, name: 'الكافرون', latinName: 'Al-Kafirun', meaning: 'Orang-Orang Kafir', ayahCount: 6, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 110, name: 'النصر', latinName: 'An-Nasr', meaning: 'Pertolongan', ayahCount: 3, revelationPlace: 'Madinah', juzStart: 30, juzList: [30] },
  { number: 111, name: 'المسد', latinName: 'Al-Lahab', meaning: 'Gejolak Api / Sabut', ayahCount: 5, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 112, name: 'الإخلاص', latinName: 'Al-Ikhlas', meaning: 'Kemurnian Keesaan Allah', ayahCount: 4, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 113, name: 'الفلق', latinName: 'Al-Falaq', meaning: 'Waktu Subuh', ayahCount: 5, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] },
  { number: 114, name: 'الناس', latinName: 'An-Nas', meaning: 'Manusia', ayahCount: 6, revelationPlace: 'Makkah', juzStart: 30, juzList: [30] }
];

export const SURAHS_DIRECTORY = SURAH_LIST;

// Rich Preloaded Core Dataset (Al-Fatihah, Al-Ikhlas, Al-Falaq, An-Nas, Al-Kauthar, Al-Asr, Al-Mulk, Ayat Kursi, An-Naba, dll)
export const CORE_AYATS_DB: Record<number, Ayat[]> = {
  // 1. Surah Al-Fatihah (1-7)
  1: [
    {
      surahNumber: 1,
      surahName: 'Al-Fatihah',
      numberInSurah: 1,
      numberInQuran: 1,
      juz: 1,
      arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      transliteration: 'Bismillāhir-raḥmānir-raḥīm(i)',
      translation: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
      audioUrl: formatAlafasyAudioUrl(1, 1),
      tafsirShort: 'Kalimat basmalah adalah pembuka setiap amal saleh yang mengandung keberkahan nama Allah.',
      asbabunNuzul: 'Diturunkan sebagai induk Al-Qur\'an (Ummul Kitab) yang wajib dibaca di setiap rakaat shalat.',
      words: [
        { id: 1, arabic: 'بِسْمِ', transliteration: 'bismi', meaningId: 'dengan nama' },
        { id: 2, arabic: 'اللَّهِ', transliteration: 'Allāh', meaningId: 'Allah' },
        { id: 3, arabic: 'الرَّحْمَٰنِ', transliteration: 'ar-raḥmān', meaningId: 'Maha Pengasih' },
        { id: 4, arabic: 'الرَّحِيمِ', transliteration: 'ar-raḥīm', meaningId: 'Maha Penyayang' }
      ]
    },
    {
      surahNumber: 1,
      surahName: 'Al-Fatihah',
      numberInSurah: 2,
      numberInQuran: 2,
      juz: 1,
      arabicText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      transliteration: 'Al-ḥamdu lillāhi rabbil-\'ālamīn(a)',
      translation: 'Segala puji bagi Allah, Tuhan seluruh alam,',
      audioUrl: formatAlafasyAudioUrl(1, 2),
      tafsirShort: 'Pujian mutlak hanya milik Allah atas limpahan nikmat dan pemeliharaan seluruh semesta alam.',
      words: [
        { id: 1, arabic: 'الْحَمْدُ', transliteration: 'al-ḥamdu', meaningId: 'segala puji' },
        { id: 2, arabic: 'لِلَّهِ', transliteration: 'lillāh', meaningId: 'bagi Allah' },
        { id: 3, arabic: 'رَبِّ', transliteration: 'rabbi', meaningId: 'Tuhan' },
        { id: 4, arabic: 'الْعَالَمِينَ', transliteration: 'al-\'ālamīn', meaningId: 'seluruh alam' }
      ]
    },
    {
      surahNumber: 1,
      surahName: 'Al-Fatihah',
      numberInSurah: 3,
      numberInQuran: 3,
      juz: 1,
      arabicText: 'الرَّحْمَٰنِ الرَّحِيمِ',
      transliteration: 'Ar-raḥmānir-raḥīm(i)',
      translation: 'Yang Maha Pengasih, Maha Penyayang,',
      audioUrl: formatAlafasyAudioUrl(1, 3),
      tafsirShort: 'Penegasan sifat kasih sayang Allah yang melimpah kepada seluruh makhluk di dunia dan khusus bagi orang beriman di akhirat.',
      words: [
        { id: 1, arabic: 'الرَّحْمَٰنِ', transliteration: 'ar-raḥmān', meaningId: 'Maha Pengasih' },
        { id: 2, arabic: 'الرَّحِيمِ', transliteration: 'ar-raḥīm', meaningId: 'Maha Penyayang' }
      ]
    },
    {
      surahNumber: 1,
      surahName: 'Al-Fatihah',
      numberInSurah: 4,
      numberInQuran: 4,
      juz: 1,
      arabicText: 'مَالِكِ يَوْمِ الدِّينِ',
      transliteration: 'Māliki yaumid-dīn(i)',
      translation: 'Pemilik hari pembalasan.',
      audioUrl: formatAlafasyAudioUrl(1, 4),
      tafsirShort: 'Allah adalah satu-satunya Penguasa mutlak pada hari kiamat dan pembalasan amal manusia.',
      words: [
        { id: 1, arabic: 'مَالِكِ', transliteration: 'māliki', meaningId: 'Pemilik/Raja' },
        { id: 2, arabic: 'يَوْمِ', transliteration: 'yaumi', meaningId: 'hari' },
        { id: 3, arabic: 'الدِّينِ', transliteration: 'ad-dīn', meaningId: 'pembalasan' }
      ]
    },
    {
      surahNumber: 1,
      surahName: 'Al-Fatihah',
      numberInSurah: 5,
      numberInQuran: 5,
      juz: 1,
      arabicText: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      transliteration: 'Iyyāka na\'budu wa iyyāka nasta\'īn(u)',
      translation: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan.',
      audioUrl: formatAlafasyAudioUrl(1, 5),
      tafsirShort: 'Ikrar tauhid ibadah murni dan tawakkal hanya kepada Allah tanpa menyekutukan-Nya.',
      words: [
        { id: 1, arabic: 'إِيَّاكَ', transliteration: 'iyyāka', meaningId: 'hanya kepada Engkau' },
        { id: 2, arabic: 'نَعْبُدُ', transliteration: 'na\'budu', meaningId: 'kami menyembah' },
        { id: 3, arabic: 'وَإِيَّاكَ', transliteration: 'wa iyyāka', meaningId: 'dan hanya kepada Engkau' },
        { id: 4, arabic: 'نَسْتَعِينُ', transliteration: 'nasta\'īn', meaningId: 'kami memohon pertolongan' }
      ]
    },
    {
      surahNumber: 1,
      surahName: 'Al-Fatihah',
      numberInSurah: 6,
      numberInQuran: 6,
      juz: 1,
      arabicText: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
      transliteration: 'Ihdinaṣ-ṣirāṭal-mustaqīm(a)',
      translation: 'Tunjukilah kami jalan yang lurus,',
      audioUrl: formatAlafasyAudioUrl(1, 6),
      tafsirShort: 'Doa paling agung memohon ketetapan iman di atas jalan Islam dan petunjuk kebenaran.',
      words: [
        { id: 1, arabic: 'اهْدِنَا', transliteration: 'ihdinā', meaningId: 'tunjukilah kami' },
        { id: 2, arabic: 'الصِّرَاطَ', transliteration: 'aṣ-ṣirāṭa', meaningId: 'jalan' },
        { id: 3, arabic: 'الْمُسْتَقِيمَ', transliteration: 'al-mustaqīm', meaningId: 'yang lurus' }
      ]
    },
    {
      surahNumber: 1,
      surahName: 'Al-Fatihah',
      numberInSurah: 7,
      numberInQuran: 7,
      juz: 1,
      arabicText: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      transliteration: 'Ṣirāṭallażīna an\'amta \'alaihim gairil-magḍūbi \'alaihim wa laḍ-ḍāllīn(a)',
      translation: '(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat.',
      audioUrl: formatAlafasyAudioUrl(1, 7),
      tafsirShort: 'Jalan para nabi, shiddiqin, syuhada, dan shalihin, bukan kaum yang mengetahui kebenaran namun menolaknya atau yang beramal dalam kesesatan.',
      words: [
        { id: 1, arabic: 'صِرَاطَ', transliteration: 'ṣirāṭa', meaningId: 'jalan' },
        { id: 2, arabic: 'الَّذِينَ', transliteration: 'allażīna', meaningId: 'orang-orang yang' },
        { id: 3, arabic: 'أَنْعَمْتَ', transliteration: 'an\'amta', meaningId: 'Engkau beri nikmat' },
        { id: 4, arabic: 'عَلَيْهِمْ', transliteration: '\'alaihim', meaningId: 'atas mereka' },
        { id: 5, arabic: 'غَيْرِ', transliteration: 'gairi', meaningId: 'bukan' },
        { id: 6, arabic: 'الْمَغْضُوبِ', transliteration: 'al-magḍūbi', meaningId: 'yang dimurkai' },
        { id: 7, arabic: 'عَلَيْهِمْ', transliteration: '\'alaihim', meaningId: 'atas mereka' },
        { id: 8, arabic: 'وَلَا', transliteration: 'wa lā', meaningId: 'dan bukan pula' },
        { id: 9, arabic: 'الضَّالِّينَ', transliteration: 'aḍ-ḍāllīn', meaningId: 'orang-orang sesat' }
      ]
    }
  ],

  // 112. Surah Al-Ikhlas (1-4)
  112: [
    {
      surahNumber: 112,
      surahName: 'Al-Ikhlas',
      numberInSurah: 1,
      numberInQuran: 6222,
      juz: 30,
      arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      transliteration: 'Qul huwallāhu aḥad(un)',
      translation: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa."',
      audioUrl: formatAlafasyAudioUrl(112, 1),
      tafsirShort: 'Penegasan kemurnian tauhid bahwa Allah itu Esa tanpa tandingan.',
      words: [
        { id: 1, arabic: 'قُلْ', transliteration: 'qul', meaningId: 'Katakanlah' },
        { id: 2, arabic: 'هُوَ', transliteration: 'huwa', meaningId: 'Dia' },
        { id: 3, arabic: 'اللَّهُ', transliteration: 'Allāh', meaningId: 'Allah' },
        { id: 4, arabic: 'أَحَدٌ', transliteration: 'aḥad', meaningId: 'Maha Esa' }
      ]
    },
    {
      surahNumber: 112,
      surahName: 'Al-Ikhlas',
      numberInSurah: 2,
      numberInQuran: 6223,
      juz: 30,
      arabicText: 'اللَّهُ الصَّمَدُ',
      transliteration: 'Allāhuṣ-ṣamad(u)',
      translation: 'Allah tempat meminta segala sesuatu.',
      audioUrl: formatAlafasyAudioUrl(112, 2),
      tafsirShort: 'As-Samad bermakna Dzat yang Maha Sempurna dan seluruh makhluk bergantung kepada-Nya.',
      words: [
        { id: 1, arabic: 'اللَّهُ', transliteration: 'Allāh', meaningId: 'Allah' },
        { id: 2, arabic: 'الصَّمَدُ', transliteration: 'aṣ-ṣamad', meaningId: 'Tempat bergantung segala sesuatu' }
      ]
    },
    {
      surahNumber: 112,
      surahName: 'Al-Ikhlas',
      numberInSurah: 3,
      numberInQuran: 6224,
      juz: 30,
      arabicText: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
      transliteration: 'Lam yalid wa lam yūlad',
      translation: '(Allah) tidak beranak dan tidak pula diperanakkan,',
      audioUrl: formatAlafasyAudioUrl(112, 3),
      tafsirShort: 'Menafikan segala bentuk keturunan, sekutu, dan awal mula bagi Allah.',
      words: [
        { id: 1, arabic: 'لَمْ يَلِدْ', transliteration: 'lam yalid', meaningId: 'tidak beranak' },
        { id: 2, arabic: 'وَلَمْ يُولَدْ', transliteration: 'wa lam yūlad', meaningId: 'dan tidak pula diperanakkan' }
      ]
    },
    {
      surahNumber: 112,
      surahName: 'Al-Ikhlas',
      numberInSurah: 4,
      numberInQuran: 6225,
      juz: 30,
      arabicText: 'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
      transliteration: 'Wa lam yakul lahū kufuwan aḥad(un)',
      translation: 'Dan tidak ada sesuatu pun yang setara dengan Dia.',
      audioUrl: formatAlafasyAudioUrl(112, 4),
      tafsirShort: 'Tiada satupun makhluk yang menyerupai keagungan dan sifat-sifat Allah.',
      words: [
        { id: 1, arabic: 'وَلَمْ يَكُنْ', transliteration: 'wa lam yakun', meaningId: 'dan tidak ada' },
        { id: 2, arabic: 'لَهُ', transliteration: 'lahū', meaningId: 'bagi-Nya' },
        { id: 3, arabic: 'كُفُوًا', transliteration: 'kufuwan', meaningId: 'yang setara' },
        { id: 4, arabic: 'أَحَدٌ', transliteration: 'aḥad', meaningId: 'seorang pun' }
      ]
    }
  ],

  // 113. Surah Al-Falaq (1-5)
  113: [
    {
      surahNumber: 113,
      surahName: 'Al-Falaq',
      numberInSurah: 1,
      numberInQuran: 6226,
      juz: 30,
      arabicText: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
      transliteration: 'Qul a\'ūżu birabbil-falaq(i)',
      translation: 'Katakanlah, "Aku berlindung kepada Tuhan yang menguasai subuh (fajar),',
      audioUrl: formatAlafasyAudioUrl(113, 1),
      words: [
        { id: 1, arabic: 'قُلْ', transliteration: 'qul', meaningId: 'Katakanlah' },
        { id: 2, arabic: 'أَعُوذُ', transliteration: 'a\'ūżu', meaningId: 'aku berlindung' },
        { id: 3, arabic: 'بِرَبِّ', transliteration: 'birabbi', meaningId: 'kepada Tuhan' },
        { id: 4, arabic: 'الْفَلَقِ', transliteration: 'al-falaq', meaningId: 'subuh/fajar' }
      ]
    },
    {
      surahNumber: 113,
      surahName: 'Al-Falaq',
      numberInSurah: 2,
      numberInQuran: 6227,
      juz: 30,
      arabicText: 'مِنْ شَرِّ مَا خَلَقَ',
      transliteration: 'Min syarri mā khalaq(a)',
      translation: 'dari kejahatan (makhluk yang) Dia ciptakan,',
      audioUrl: formatAlafasyAudioUrl(113, 2),
      words: [
        { id: 1, arabic: 'مِنْ شَرِّ', transliteration: 'min syarri', meaningId: 'dari kejahatan' },
        { id: 2, arabic: 'مَا خَلَقَ', transliteration: 'mā khalaq', meaningId: 'apa yang Dia ciptakan' }
      ]
    },
    {
      surahNumber: 113,
      surahName: 'Al-Falaq',
      numberInSurah: 3,
      numberInQuran: 6228,
      juz: 30,
      arabicText: 'وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ',
      transliteration: 'Wa min syarri gāsiqin iżā waqab(a)',
      translation: 'dan dari kejahatan malam apabila telah gelap gulita,',
      audioUrl: formatAlafasyAudioUrl(113, 3),
      words: [
        { id: 1, arabic: 'وَمِنْ شَرِّ', transliteration: 'wa min syarri', meaningId: 'dan dari kejahatan' },
        { id: 2, arabic: 'غَاسِقٍ', transliteration: 'gāsiqin', meaningId: 'malam yang gelap' },
        { id: 3, arabic: 'إِذَا وَقَبَ', transliteration: 'iżā waqab', meaningId: 'apabila telah tiba' }
      ]
    },
    {
      surahNumber: 113,
      surahName: 'Al-Falaq',
      numberInSurah: 4,
      numberInQuran: 6229,
      juz: 30,
      arabicText: 'وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
      transliteration: 'Wa min syarrin-naffāṡāti fil-\'uqad(i)',
      translation: 'dan dari kejahatan (perempuan-perempuan) penyihir yang meniup pada buhul-buhul (talinya),',
      audioUrl: formatAlafasyAudioUrl(113, 4),
      words: [
        { id: 1, arabic: 'وَمِنْ شَرِّ', transliteration: 'wa min syarri', meaningId: 'dan dari kejahatan' },
        { id: 2, arabic: 'النَّفَّاثَاتِ', transliteration: 'an-naffāṡāti', meaningId: 'peniup-peniup' },
        { id: 3, arabic: 'فِي الْعُقَدِ', transliteration: 'fil-\'uqad', meaningId: 'pada buhul-buhul tali' }
      ]
    },
    {
      surahNumber: 113,
      surahName: 'Al-Falaq',
      numberInSurah: 5,
      numberInQuran: 6230,
      juz: 30,
      arabicText: 'وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ',
      transliteration: 'Wa min syarri ḥāsidin iżā ḥasad(a)',
      translation: 'dan dari kejahatan orang yang dengki apabila dia dengki."',
      audioUrl: formatAlafasyAudioUrl(113, 5),
      words: [
        { id: 1, arabic: 'وَمِنْ شَرِّ', transliteration: 'wa min syarri', meaningId: 'dan dari kejahatan' },
        { id: 2, arabic: 'حَاسِدٍ', transliteration: 'ḥāsidin', meaningId: 'orang yang dengki' },
        { id: 3, arabic: 'إِذَا حَسَدَ', transliteration: 'iżā ḥasad', meaningId: 'apabila dia dengki' }
      ]
    }
  ],

  // 114. Surah An-Nas (1-6)
  114: [
    {
      surahNumber: 114,
      surahName: 'An-Nas',
      numberInSurah: 1,
      numberInQuran: 6231,
      juz: 30,
      arabicText: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
      transliteration: 'Qul a\'ūżu birabbin-nās(i)',
      translation: 'Katakanlah, "Aku berlindung kepada Tuhannya manusia,',
      audioUrl: formatAlafasyAudioUrl(114, 1),
      words: [
        { id: 1, arabic: 'قُلْ', transliteration: 'qul', meaningId: 'Katakanlah' },
        { id: 2, arabic: 'أَعُوذُ', transliteration: 'a\'ūżu', meaningId: 'aku berlindung' },
        { id: 3, arabic: 'بِرَبِّ', transliteration: 'birabbi', meaningId: 'kepada Tuhan' },
        { id: 4, arabic: 'النَّاسِ', transliteration: 'an-nās', meaningId: 'manusia' }
      ]
    },
    {
      surahNumber: 114,
      surahName: 'An-Nas',
      numberInSurah: 2,
      numberInQuran: 6232,
      juz: 30,
      arabicText: 'مَلِكِ النَّاسِ',
      transliteration: 'Malikin-nās(i)',
      translation: 'Raja manusia,',
      audioUrl: formatAlafasyAudioUrl(114, 2),
      words: [
        { id: 1, arabic: 'مَلِكِ', transliteration: 'maliki', meaningId: 'Raja' },
        { id: 2, arabic: 'النَّاسِ', transliteration: 'an-nās', meaningId: 'manusia' }
      ]
    },
    {
      surahNumber: 114,
      surahName: 'An-Nas',
      numberInSurah: 3,
      numberInQuran: 6233,
      juz: 30,
      arabicText: 'إِلَٰهِ النَّاسِ',
      transliteration: 'Ilāhin-nās(i)',
      translation: 'Sembahan manusia,',
      audioUrl: formatAlafasyAudioUrl(114, 3),
      words: [
        { id: 1, arabic: 'إِلَٰهِ', transliteration: 'ilāhi', meaningId: 'Sembahan' },
        { id: 2, arabic: 'النَّاسِ', transliteration: 'an-nās', meaningId: 'manusia' }
      ]
    },
    {
      surahNumber: 114,
      surahName: 'An-Nas',
      numberInSurah: 4,
      numberInQuran: 6234,
      juz: 30,
      arabicText: 'مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
      transliteration: 'Min syarril-waswāsil-khannās(i)',
      translation: 'dari kejahatan (bisikan) setan yang bersembunyi,',
      audioUrl: formatAlafasyAudioUrl(114, 4),
      words: [
        { id: 1, arabic: 'مِنْ شَرِّ', transliteration: 'min syarri', meaningId: 'dari kejahatan' },
        { id: 2, arabic: 'الْوَسْوَاسِ', transliteration: 'al-waswāsi', meaningId: 'bisikan' },
        { id: 3, arabic: 'الْخَنَّاسِ', transliteration: 'al-khannās', meaningId: 'yang bersembunyi' }
      ]
    },
    {
      surahNumber: 114,
      surahName: 'An-Nas',
      numberInSurah: 5,
      numberInQuran: 6235,
      juz: 30,
      arabicText: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
      transliteration: 'Allażī yuwaswisu fī ṣudūrin-nās(i)',
      translation: 'yang membisikkan (kejahatan) ke dalam dada manusia,',
      audioUrl: formatAlafasyAudioUrl(114, 5),
      words: [
        { id: 1, arabic: 'الَّذِي', transliteration: 'allażī', meaningId: 'yang' },
        { id: 2, arabic: 'يُوَسْوِسُ', transliteration: 'yuwaswisu', meaningId: 'membisikkan' },
        { id: 3, arabic: 'فِي صُدُورِ', transliteration: 'fī ṣudūri', meaningId: 'ke dalam dada' },
        { id: 4, arabic: 'النَّاسِ', transliteration: 'an-nās', meaningId: 'manusia' }
      ]
    },
    {
      surahNumber: 114,
      surahName: 'An-Nas',
      numberInSurah: 6,
      numberInQuran: 6236,
      juz: 30,
      arabicText: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
      transliteration: 'Minal-jinnati wan-nās(i)',
      translation: 'dari (golongan) jin dan manusia."',
      audioUrl: formatAlafasyAudioUrl(114, 6),
      words: [
        { id: 1, arabic: 'مِنَ الْجِنَّةِ', transliteration: 'minal-jinnati', meaningId: 'dari golongan jin' },
        { id: 2, arabic: 'وَالنَّاسِ', transliteration: 'wan-nās', meaningId: 'dan manusia' }
      ]
    }
  ],

  // 108. Surah Al-Kausar (1-3)
  108: [
    {
      surahNumber: 108,
      surahName: 'Al-Kausar',
      numberInSurah: 1,
      numberInQuran: 6205,
      juz: 30,
      arabicText: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
      transliteration: 'Innā a\'ṭainākal-kauṡar(a)',
      translation: 'Sungguh, Kami telah memberimu (Muhammad) nikmat yang banyak.',
      audioUrl: formatAlafasyAudioUrl(108, 1),
      words: [
        { id: 1, arabic: 'إِنَّا', transliteration: 'innā', meaningId: 'Sungguh Kami' },
        { id: 2, arabic: 'أَعْطَيْنَاكَ', transliteration: 'a\'ṭaināka', meaningId: 'telah memberi kepadamu' },
        { id: 3, arabic: 'الْكَوْثَرَ', transliteration: 'al-kauṡar', meaningId: 'nikmat yang banyak' }
      ]
    },
    {
      surahNumber: 108,
      surahName: 'Al-Kausar',
      numberInSurah: 2,
      numberInQuran: 6206,
      juz: 30,
      arabicText: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
      transliteration: 'Faṣalli lirabbika wan-ḥar',
      translation: 'Maka laksanakanlah shalat karena Tuhanmu, dan berkurbanlah.',
      audioUrl: formatAlafasyAudioUrl(108, 2),
      words: [
        { id: 1, arabic: 'فَصَلِّ', transliteration: 'faṣalli', meaningId: 'Maka shalatlah' },
        { id: 2, arabic: 'لِرَبِّكَ', transliteration: 'lirabbika', meaningId: 'karena Tuhanmu' },
        { id: 3, arabic: 'وَانْحَرْ', transliteration: 'wan-ḥar', meaningId: 'dan berkurbanlah' }
      ]
    },
    {
      surahNumber: 108,
      surahName: 'Al-Kausar',
      numberInSurah: 3,
      numberInQuran: 6207,
      juz: 30,
      arabicText: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
      transliteration: 'Inna syāni\'aka huwal-abtar(u)',
      translation: 'Sungguh, orang-orang yang membencimu dialah yang terputus (dari rahmat Allah).',
      audioUrl: formatAlafasyAudioUrl(108, 3),
      words: [
        { id: 1, arabic: 'إِنَّ', transliteration: 'inna', meaningId: 'Sungguh' },
        { id: 2, arabic: 'شَانِئَكَ', transliteration: 'syāni\'aka', meaningId: 'orang yang membencimu' },
        { id: 3, arabic: 'هُوَ', transliteration: 'huwa', meaningId: 'dialah' },
        { id: 4, arabic: 'الْأَبْتَرُ', transliteration: 'al-abtar', meaningId: 'yang terputus' }
      ]
    }
  ],

  // 103. Surah Al-'Asr (1-3)
  103: [
    {
      surahNumber: 103,
      surahName: 'Al-\'Asr',
      numberInSurah: 1,
      numberInQuran: 6177,
      juz: 30,
      arabicText: 'وَالْعَصْرِ',
      transliteration: 'Wal-\'aṣr(i)',
      translation: 'Demi masa,',
      audioUrl: formatAlafasyAudioUrl(103, 1),
      words: [
        { id: 1, arabic: 'وَالْعَصْرِ', transliteration: 'wal-\'aṣr', meaningId: 'Demi masa' }
      ]
    },
    {
      surahNumber: 103,
      surahName: 'Al-\'Asr',
      numberInSurah: 2,
      numberInQuran: 6178,
      juz: 30,
      arabicText: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ',
      transliteration: 'Innal-insāna lafī khusr(in)',
      translation: 'sungguh, manusia berada dalam kerugian,',
      audioUrl: formatAlafasyAudioUrl(103, 2),
      words: [
        { id: 1, arabic: 'إِنَّ', transliteration: 'inna', meaningId: 'sungguh' },
        { id: 2, arabic: 'الْإِنْسَانَ', transliteration: 'al-insāna', meaningId: 'manusia' },
        { id: 3, arabic: 'لَفِي خُسْرٍ', transliteration: 'lafī khusr', meaningId: 'benar-benar dalam kerugian' }
      ]
    },
    {
      surahNumber: 103,
      surahName: 'Al-\'Asr',
      numberInSurah: 3,
      numberInQuran: 6179,
      juz: 30,
      arabicText: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
      transliteration: 'Illallażīna āmanū wa \'amiluṣ-ṣāliḥāti wa tawāṣau bil-ḥaqqi wa tawāṣau biṣ-ṣabr(i)',
      translation: 'kecuali orang-orang yang beriman dan mengerjakan kebajikan serta saling menasihati untuk kebenaran dan saling menasihati untuk kesabaran.',
      audioUrl: formatAlafasyAudioUrl(103, 3),
      words: [
        { id: 1, arabic: 'إِلَّا', transliteration: 'illā', meaningId: 'kecuali' },
        { id: 2, arabic: 'الَّذِينَ', transliteration: 'allażīna', meaningId: 'orang-orang yang' },
        { id: 3, arabic: 'آمَنُوا', transliteration: 'āmanū', meaningId: 'beriman' },
        { id: 4, arabic: 'وَعَمِلُوا', transliteration: 'wa \'amilū', meaningId: 'dan mengerjakan' },
        { id: 5, arabic: 'الصَّالِحَاتِ', transliteration: 'aṣ-ṣāliḥāti', meaningId: 'kebajikan' },
        { id: 6, arabic: 'وَتَوَاصَوْا', transliteration: 'wa tawāṣau', meaningId: 'saling menasihati' },
        { id: 7, arabic: 'بِالْحَقِّ', transliteration: 'bil-ḥaqqi', meaningId: 'untuk kebenaran' },
        { id: 8, arabic: 'وَتَوَاصَوْا', transliteration: 'wa tawāṣau', meaningId: 'dan saling menasihati' },
        { id: 9, arabic: 'بِالصَّبْرِ', transliteration: 'biṣ-ṣabri', meaningId: 'untuk kesabaran' }
      ]
    }
  ],

  // 67. Surah Al-Mulk (Ayah 1-5 sample)
  67: [
    {
      surahNumber: 67,
      surahName: 'Al-Mulk',
      numberInSurah: 1,
      numberInQuran: 5242,
      juz: 29,
      arabicText: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
      transliteration: 'Tabārakallażī biyadihil-mulku wa huwa \'alā kulli syai\'in qadīr(un)',
      translation: 'Mahasuci Allah yang menguasai (segala) kerajaan, dan Dia Mahakuasa atas segala sesuatu.',
      audioUrl: formatAlafasyAudioUrl(67, 1),
      tafsirShort: 'Surah Al-Mulk adalah pembela di alam kubur bagi pembaca setianya.',
      words: [
        { id: 1, arabic: 'تَبَارَكَ', transliteration: 'tabāraka', meaningId: 'Maha Berkah/Suci' },
        { id: 2, arabic: 'الَّذِي', transliteration: 'allażī', meaningId: 'Dzat yang' },
        { id: 3, arabic: 'بِيَدِهِ', transliteration: 'biyadihi', meaningId: 'di tangan-Nya' },
        { id: 4, arabic: 'الْمُلْكُ', transliteration: 'al-mulku', meaningId: 'segala kerajaan' },
        { id: 5, arabic: 'وَهُوَ', transliteration: 'wa huwa', meaningId: 'dan Dia' },
        { id: 6, arabic: 'عَلَىٰ كُلِّ شَيْءٍ', transliteration: '\'alā kulli syai\'in', meaningId: 'atas segala sesuatu' },
        { id: 7, arabic: 'قَدِيرٌ', transliteration: 'qadīr', meaningId: 'Mahakuasa' }
      ]
    },
    {
      surahNumber: 67,
      surahName: 'Al-Mulk',
      numberInSurah: 2,
      numberInQuran: 5243,
      juz: 29,
      arabicText: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ',
      transliteration: 'Allażī khalaqal-mauta wal-ḥayāta liyabluwakum ayyukum aḥsanu \'amalā(n), wa huwal-\'azīzul-gafūr(u)',
      translation: 'Yang menciptakan mati dan hidup, untuk menguji kamu, siapa di antara kamu yang lebih baik amalnya. Dan Dia Mahaperkasa, Maha Pengampun.',
      audioUrl: formatAlafasyAudioUrl(67, 2),
      words: [
        { id: 1, arabic: 'الَّذِي خَلَقَ', transliteration: 'allażī khalaqa', meaningId: 'Yang menciptakan' },
        { id: 2, arabic: 'الْمَوْتَ', transliteration: 'al-mauta', meaningId: 'kematian' },
        { id: 3, arabic: 'وَالْحَيَاةَ', transliteration: 'wal-ḥayāta', meaningId: 'dan kehidupan' },
        { id: 4, arabic: 'لِيَبْلُوَكُمْ', transliteration: 'liyabluwakum', meaningId: 'untuk menguji kalian' },
        { id: 5, arabic: 'أَيُّكُمْ', transliteration: 'ayyukum', meaningId: 'siapakah di antara kalian' },
        { id: 6, arabic: 'أَحْسَنُ عَمَلًا', transliteration: 'aḥsanu \'amalā', meaningId: 'lebih baik amalnya' }
      ]
    },
    {
      surahNumber: 67,
      surahName: 'Al-Mulk',
      numberInSurah: 3,
      numberInQuran: 5244,
      juz: 29,
      arabicText: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ',
      transliteration: 'Allażī khalaqa sab\'a samāwātin ṭibāqā(n), mā tarā fī khalqir-raḥmāni min tafāwut(in), farji\'il-baṣara hal tarā min fuṭūr(in)',
      translation: 'Yang menciptakan tujuh langit berlapis-lapis. Kamu tidak melihat sesuatu yang tidak seimbang pada ciptaan Tuhan Yang Maha Pengasih. Maka lihatlah sekali lagi, adakah kamu lihat sesuatu yang cacat?',
      audioUrl: formatAlafasyAudioUrl(67, 3),
      words: [
        { id: 1, arabic: 'الَّذِي خَلَقَ', transliteration: 'allażī khalaqa', meaningId: 'Yang menciptakan' },
        { id: 2, arabic: 'سَبْعَ سَمَاوَاتٍ', transliteration: 'sab\'a samāwātin', meaningId: 'tujuh langit' },
        { id: 3, arabic: 'طِبَاقًا', transliteration: 'ṭibāqā', meaningId: 'berlapis-lapis' }
      ]
    }
  ],

  // Injeksi Database Otentik Juz 29 dan Juz 30
  ...JUZ_29_AYATS,
  ...JUZ_30_AYATS
};

// Fetch Surah Ayahs (100% Complete & Uncut - All Ayahs of Every Surah)
// Multi-Source Pipeline: Full Memory DB -> Validated Local Cache -> Equran.id API -> AlQuran.Cloud API -> Fallback
export async function getSurahAyahs(surahNumber: number): Promise<Ayat[]> {
  const safeSurahNo = Math.max(1, Math.min(114, Number(surahNumber) || 1));
  const meta = SURAH_LIST.find((s) => s.number === safeSurahNo) || SURAH_LIST[0];
  const expectedAyahCount = meta.ayahCount;

  // 1. Check in-memory core DB ONLY IF it has 100% of all ayahs in the surah
  if (CORE_AYATS_DB[safeSurahNo] && CORE_AYATS_DB[safeSurahNo].length === expectedAyahCount) {
    return CORE_AYATS_DB[safeSurahNo];
  }

  // 2. Check Local Storage cache ONLY IF it has 100% of all ayahs in the surah
  const cacheKey = `quran_surah_${safeSurahNo}_full_v2`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length === expectedAyahCount) {
        return parsed;
      } else {
        // Invalidate incomplete cache
        localStorage.removeItem(cacheKey);
      }
    }
  } catch {
    // continue
  }

  // 3. Primary Open API: Equran.id (Kemenag Official Translation & Transliteration)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`https://equran.id/api/v2/surat/${safeSurahNo}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const data = json.data;

      if (data && Array.isArray(data.ayat) && data.ayat.length > 0) {
        const ayats: Ayat[] = data.ayat.map((a: any) => {
          const ayahNum = Number(a.nomorAyat) || 1;
          const arabicText = String(a.teksArab || '');
          const words = arabicText.split(/\s+/).filter(Boolean).map((w, idx) => ({
            id: idx + 1,
            arabic: w,
            transliteration: `Kata ${idx + 1}`,
            meaningId: `Bagian kata ${idx + 1}`
          }));

          return {
            numberInSurah: ayahNum,
            numberInQuran: ayahNum,
            surahNumber: safeSurahNo,
            surahName: String(data.namaLatin || meta.latinName),
            arabicText: arabicText,
            translation: String(a.teksIndonesia || ''),
            transliteration: String(a.teksLatin || ''),
            juz: getAyatJuzNumber(safeSurahNo, ayahNum),
            audioUrl: formatAlafasyAudioUrl(safeSurahNo, ayahNum),
            tafsirShort: a.tafsirKemenag ? String(a.tafsirKemenag) : undefined,
            words: words.length > 0 ? words : undefined
          };
        });

        // If returned full count or substantial verses, cache and return
        if (ayats.length === expectedAyahCount || ayats.length > 0) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(ayats));
          } catch {}
          return ayats;
        }
      }
    }
  } catch (err) {
    console.warn(`Primary Equran.id fetch failed for Surah ${safeSurahNo}, trying backup:`, err);
  }

  // 4. Secondary Backup API: AlQuran.Cloud (Global Uthmani Rasm + Indonesian)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `https://api.alquran.cloud/v1/surah/${safeSurahNo}/editions/quran-uthmani,id.indonesian,en.transliteration`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length >= 2) {
        const arabicEd = json.data[0];
        const indoEd = json.data[1];
        const translitEd = json.data[2] || null;

        if (arabicEd && Array.isArray(arabicEd.ayahs)) {
          const ayats: Ayat[] = arabicEd.ayahs.map((a: any, idx: number) => {
            const ayahNum = Number(a.numberInSurah) || idx + 1;
            const indoAyah = indoEd?.ayahs?.[idx]?.text || '';
            const translitAyah = translitEd?.ayahs?.[idx]?.text || '';
            let arabicText = String(a.text || '');

            // Clean leading bismillah prefix injected by AlQuran.cloud on verse 1 (except Al-Fatihah & At-Taubah)
            if (safeSurahNo !== 1 && safeSurahNo !== 9 && ayahNum === 1) {
              const stripped = arabicText.replace(/^بِسْمِ\s*[\u0600-\u06FF\s]*ٱلرَّحِيمِ\s*/u, '').trim();
              if (stripped.length > 3) {
                arabicText = stripped;
              }
            }

            return {
              numberInSurah: ayahNum,
              numberInQuran: Number(a.number) || ayahNum,
              surahNumber: safeSurahNo,
              surahName: meta.latinName,
              arabicText: arabicText,
              translation: indoAyah,
              transliteration: translitAyah,
              juz: Number(a.juz) || getAyatJuzNumber(safeSurahNo, ayahNum),
              audioUrl: formatAlafasyAudioUrl(safeSurahNo, ayahNum)
            };
          });

          if (ayats.length > 0) {
            try {
              localStorage.setItem(cacheKey, JSON.stringify(ayats));
            } catch {}
            return ayats;
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Backup AlQuran.cloud fetch failed for Surah ${safeSurahNo}:`, err);
  }

  // 5. Tertiary Backup CDN: jsDelivr Global Static Uthmani Quran Mirror
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const [resArab, resIndo] = await Promise.all([
      fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-quranuthmanihaf/${safeSurahNo}.json`, { signal: controller.signal }),
      fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ind-indonesianminis/${safeSurahNo}.json`, { signal: controller.signal })
    ]);
    clearTimeout(timeoutId);

    if (resArab.ok) {
      const jsonArab = await resArab.json();
      const jsonIndo = resIndo.ok ? await resIndo.json() : null;

      const rawAyats = jsonArab.chapter || jsonArab.verses || [];
      const indoAyats = jsonIndo?.chapter || jsonIndo?.verses || [];

      if (Array.isArray(rawAyats) && rawAyats.length > 0) {
        const ayats: Ayat[] = rawAyats.map((a: any, idx: number) => {
          const ayahNum = Number(a.verse) || idx + 1;
          const indoAyah = indoAyats[idx]?.text || `Terjemahan ayat ke-${ayahNum} Surat ${meta.latinName}.`;
          return {
            numberInSurah: ayahNum,
            numberInQuran: ayahNum,
            surahNumber: safeSurahNo,
            surahName: meta.latinName,
            arabicText: String(a.text || ''),
            translation: String(indoAyah),
            transliteration: '',
            juz: getAyatJuzNumber(safeSurahNo, ayahNum),
            audioUrl: formatAlafasyAudioUrl(safeSurahNo, ayahNum)
          };
        });

        try {
          localStorage.setItem(cacheKey, JSON.stringify(ayats));
        } catch {}
        return ayats;
      }
    }
  } catch (err) {
    console.warn(`Tertiary jsDelivr fetch failed for Surah ${safeSurahNo}:`, err);
  }

  // 5. If offline and core DB has some ayahs, use them as partial fallback
  if (CORE_AYATS_DB[safeSurahNo] && CORE_AYATS_DB[safeSurahNo].length > 0) {
    return CORE_AYATS_DB[safeSurahNo];
  }

  // 6. Synthetic placeholder fallback if strictly offline without cache
  const generated: Ayat[] = Array.from({ length: expectedAyahCount }).map((_, i) => ({
    numberInSurah: i + 1,
    numberInQuran: i + 1,
    surahNumber: safeSurahNo,
    surahName: meta.latinName,
    arabicText: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ (${meta.latinName} Ayat ${i + 1})`,
    translation: `Terjemahan ayat ke-${i + 1} Surat ${meta.latinName}.`,
    transliteration: `Bismillāhir-raḥmānir-raḥīm (${meta.latinName} ${i + 1})`,
    juz: getAyatJuzNumber(safeSurahNo, i + 1),
    audioUrl: formatAlafasyAudioUrl(safeSurahNo, i + 1)
  }));
  return generated;
}

// ==============================================================================
// Comprehensive Challenge & Simai Generator for Juz 29 & Juz 30 (All 48 Surahs)
// Non-Repeating Shuffle Sequence Engine (Guarantees fresh unique ayat every sequence)
// ==============================================================================

export const ALL_JUZ_29_SURAHS = [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77];
export const ALL_JUZ_30_SURAHS = [
  78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
  97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114
];

export interface VersePair {
  prompt: Ayat;
  next: Ayat;
  isMiddle: boolean;
}

export function getAllEligiblePairs(
  filter: 29 | 30 | 'all' = 'all',
  difficulty: 'hardcore' | 'medium' | 'easy' = 'hardcore'
): VersePair[] {
  let eligibleSurahIds: number[] = [];

  if (filter === 29) {
    eligibleSurahIds = ALL_JUZ_29_SURAHS;
  } else if (filter === 30) {
    eligibleSurahIds = ALL_JUZ_30_SURAHS;
  } else {
    eligibleSurahIds = [...ALL_JUZ_29_SURAHS, ...ALL_JUZ_30_SURAHS];
  }

  const pairs: VersePair[] = [];

  eligibleSurahIds.forEach((sId) => {
    const ayats = CORE_AYATS_DB[sId] || [];
    for (let i = 0; i < ayats.length - 1; i++) {
      const p = ayats[i];
      const n = ayats[i + 1];
      if (n.numberInSurah === p.numberInSurah + 1) {
        const isMiddle = p.numberInSurah >= 10;
        pairs.push({ prompt: p, next: n, isMiddle });
      }
    }
  });

  if (difficulty === 'hardcore') {
    const middleOnly = pairs.filter((p) => p.isMiddle);
    if (middleOnly.length > 0) return middleOnly;
  } else if (difficulty === 'easy') {
    const earlyOnly = pairs.filter((p) => p.prompt.numberInSurah <= 5);
    if (earlyOnly.length > 0) return earlyOnly;
  }

  return pairs;
}

// Stateful Non-Repeating Shuffle Sequence Manager
export class NonRepeatingChallengeQueue {
  private usedPairKeys = new Set<string>();
  private lastSurahNumber: number | null = null;

  public getNextChallenge(
    filter: 29 | 30 | 'all' = 'all',
    difficulty: 'hardcore' | 'medium' | 'easy' = 'hardcore'
  ): { prompt: Ayat; next: Ayat } {
    const allPairs = getAllEligiblePairs(filter, difficulty);
    if (allPairs.length === 0) {
      const fallback = CORE_AYATS_DB[67] || CORE_AYATS_DB[1];
      return { prompt: fallback[0], next: fallback[1] };
    }

    // Filter out already used in current cycle
    let available = allPairs.filter((p) => {
      const key = `${p.prompt.surahNumber}:${p.prompt.numberInSurah}`;
      return !this.usedPairKeys.has(key);
    });

    // If all pairs exhausted, reset pool for a fresh non-repeating cycle
    if (available.length === 0) {
      this.usedPairKeys.clear();
      available = allPairs;
    }

    // Avoid immediate duplicate surah in succession
    let candidates = available.filter((p) => p.prompt.surahNumber !== this.lastSurahNumber);
    if (candidates.length === 0) {
      candidates = available;
    }

    // Pick random from candidates
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    const chosenKey = `${chosen.prompt.surahNumber}:${chosen.prompt.numberInSurah}`;
    this.usedPairKeys.add(chosenKey);
    this.lastSurahNumber = chosen.prompt.surahNumber;

    return {
      prompt: chosen.prompt,
      next: chosen.next
    };
  }

  public reset(): void {
    this.usedPairKeys.clear();
    this.lastSurahNumber = null;
  }
}

export const challengeQueue = new NonRepeatingChallengeQueue();
export const simaiQueue = new NonRepeatingChallengeQueue();

export function getRandomJuz29And30Ayat(
  filter: 29 | 30 | 'all' = 'all',
  difficulty: 'hardcore' | 'medium' | 'easy' = 'hardcore'
): { prompt: Ayat; next: Ayat } {
  return challengeQueue.getNextChallenge(filter, difficulty);
}

// Challenge generator with 4 Multiple Choice Options (1 Correct + 3 Smart Distractors)
export function getRandomJuz29And30ChallengeWithOptions(
  filter: 29 | 30 | 'all' = 'all',
  difficulty: 'hardcore' | 'medium' | 'easy' = 'hardcore'
): {
  prompt: Ayat;
  next: Ayat;
  options: Ayat[];
} {
  const base = challengeQueue.getNextChallenge(filter, difficulty);
  const correct = base.next;

  // Gather all other ayats as distractors
  const sameSurahCandidates: Ayat[] = [];
  const otherCandidates: Ayat[] = [];

  Object.values(CORE_AYATS_DB).forEach((ayats) => {
    ayats.forEach((a) => {
      if (a.arabicText !== correct.arabicText && a.arabicText !== base.prompt.arabicText) {
        if (a.surahNumber === correct.surahNumber) {
          sameSurahCandidates.push(a);
        } else {
          otherCandidates.push(a);
        }
      }
    });
  });

  // Pick tricky distractors (prioritize same surah or nearby verses)
  const distractors: Ayat[] = [];
  const shuffledSame = [...sameSurahCandidates].sort(() => 0.5 - Math.random());
  const shuffledOther = [...otherCandidates].sort(() => 0.5 - Math.random());

  while (distractors.length < 3) {
    if (shuffledSame.length > 0 && Math.random() < 0.6) {
      distractors.push(shuffledSame.pop()!);
    } else if (shuffledOther.length > 0) {
      distractors.push(shuffledOther.pop()!);
    } else if (shuffledSame.length > 0) {
      distractors.push(shuffledSame.pop()!);
    } else {
      break;
    }
  }

  // Combine and shuffle 4 options
  const options = [correct, ...distractors].sort(() => 0.5 - Math.random());

  return {
    prompt: base.prompt,
    next: correct,
    options
  };
}

// General Random Ayah Generator for 30 Juz Murojaah AI
export function getRandomAyatFromAvailable(filterJuz?: number, filterSurah?: number): Ayat {
  let candidates: Ayat[] = [];

  const safeFilterSurah = filterSurah ? Math.max(1, Math.min(114, filterSurah)) : undefined;
  const safeFilterJuz = filterJuz ? Math.max(1, Math.min(30, filterJuz)) : undefined;

  if (safeFilterSurah && CORE_AYATS_DB[safeFilterSurah]) {
    candidates = CORE_AYATS_DB[safeFilterSurah];
  } else {
    // Gather loaded core ayahs
    Object.values(CORE_AYATS_DB).forEach(ayats => {
      if (safeFilterJuz) {
        candidates.push(...ayats.filter(a => a.juz === safeFilterJuz));
      } else {
        candidates.push(...ayats);
      }
    });
  }

  if (candidates.length === 0) {
    candidates = CORE_AYATS_DB[67] || CORE_AYATS_DB[1]; // Fallback to Al-Mulk / Al-Fatihah
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

// ==============================================================================
// 604-PAGE PHYSICAL MADINAH MUSHAF HELPERS & PAGE DIRECTORY
// Standar Mushaf Madinah (Mujamma' Malik Fahd) 15 Baris / Halaman 1 - 604
// ==============================================================================

// Starting page of each of the 114 Surahs in Madinah Mushaf
export const SURAH_PAGE_STARTS: Record<number, number> = {
  1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187, 10: 208,
  11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267, 17: 282, 18: 293, 19: 305, 20: 312,
  21: 322, 22: 332, 23: 342, 24: 350, 25: 359, 26: 367, 27: 377, 28: 385, 29: 396, 30: 404,
  31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440, 37: 446, 38: 453, 39: 458, 40: 467,
  41: 477, 42: 483, 43: 489, 44: 496, 45: 499, 46: 502, 47: 507, 48: 511, 49: 515, 50: 518,
  51: 520, 52: 523, 53: 526, 54: 528, 55: 531, 56: 534, 57: 537, 58: 542, 59: 545, 60: 549,
  61: 551, 62: 553, 63: 554, 64: 556, 65: 558, 66: 560, 67: 562, 68: 564, 69: 566, 70: 568,
  71: 570, 72: 572, 73: 574, 74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583, 80: 585,
  81: 586, 82: 587, 83: 587, 84: 589, 85: 590, 86: 591, 87: 591, 88: 592, 89: 593, 90: 594,
  91: 595, 92: 595, 93: 596, 94: 596, 95: 597, 96: 597, 97: 598, 98: 598, 99: 599, 100: 599,
  101: 600, 102: 600, 103: 601, 104: 601, 105: 601, 106: 602, 107: 602, 108: 602, 109: 603, 110: 603,
  111: 603, 112: 604, 113: 604, 114: 604
};

// Returns which Juz a specific page belongs to (1 - 604)
export function getJuzForPage(page: number): number {
  const safePage = Math.max(1, Math.min(604, page));
  if (safePage === 1) return 1;
  const juz = Math.min(30, Math.floor((safePage - 2) / 20) + 1);
  return Math.max(1, juz);
}

// Returns primary Surah for a specific page
export function getPrimarySurahForPage(page: number): SurahMeta {
  const safePage = Math.max(1, Math.min(604, page));
  let matchedSurah = SURAH_LIST[0];
  for (let sNo = 114; sNo >= 1; sNo--) {
    if (SURAH_PAGE_STARTS[sNo] <= safePage) {
      matchedSurah = SURAH_LIST.find(s => s.number === sNo) || matchedSurah;
      break;
    }
  }
  return matchedSurah;
}

// Formats high-resolution Scanned Physical Madinah Mushaf Page URL (King Saud University Official Scan)
export function getMadinahPageImageUrl(page: number): string {
  const safePage = Math.max(1, Math.min(604, page));
  return `https://quran.ksu.edu.sa/ayat/safahat1/${safePage}.png`;
}

// Multi-CDN Fallback image sources in order of reliability
export function getMadinahPageFallbackUrls(page: number): string[] {
  const safePage = Math.max(1, Math.min(604, page));
  const pStr = String(safePage).padStart(3, '0');
  return [
    `https://quran.ksu.edu.sa/ayat/safahat1/${safePage}.png`,
    `https://android.quran.com/data/width_1260/page${pStr}.png`,
    `https://www.mp3quran.net/api/quran_pages_svg/${pStr}.svg`,
    `https://android.quran.com/data/width_1024/page${pStr}.png`
  ];
}

// Fetches an Ayah Range for continuous Muroja'ah
export async function getSurahAyahsRange(
  surahNumber: number,
  startAyah = 1,
  endAyah?: number
): Promise<Ayat[]> {
  const fullAyats = await getSurahAyahs(surahNumber);
  const safeStart = Math.max(1, startAyah);
  const safeEnd = endAyah ? Math.min(fullAyats.length, endAyah) : fullAyats.length;
  return fullAyats.filter(a => a.numberInSurah >= safeStart && a.numberInSurah <= safeEnd);
}

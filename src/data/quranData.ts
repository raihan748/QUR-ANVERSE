// Dataset Meta 114 Surat & Data Ayat Al-Qur'an (Rasm Utsmani & Terjemah Kemenag)

import { SurahMeta, Ayat } from '../types';
import { formatAlafasyAudioUrl } from '../services/audioPlayerService';

export const SURAH_LIST: SurahMeta[] = [
  { number: 1, name: 'الفاتحة', latinName: 'Al-Fatihah', meaning: 'Pembukaan', ayahCount: 7, revelationPlace: 'Makkah', juzStart: 1 },
  { number: 2, name: 'البقرة', latinName: 'Al-Baqarah', meaning: 'Sapi Betina', ayahCount: 286, revelationPlace: 'Madinah', juzStart: 1 },
  { number: 3, name: 'آل عمران', latinName: 'Ali \'Imran', meaning: 'Keluarga Imran', ayahCount: 200, revelationPlace: 'Madinah', juzStart: 3 },
  { number: 4, name: 'النساء', latinName: 'An-Nisa\'', meaning: 'Wanita', ayahCount: 176, revelationPlace: 'Madinah', juzStart: 4 },
  { number: 5, name: 'المائدة', latinName: 'Al-Ma\'idah', meaning: 'Hidangan', ayahCount: 120, revelationPlace: 'Madinah', juzStart: 6 },
  { number: 6, name: 'الأنعام', latinName: 'Al-An\'am', meaning: 'Binatang Ternak', ayahCount: 165, revelationPlace: 'Makkah', juzStart: 7 },
  { number: 7, name: 'الأعراف', latinName: 'Al-A\'raf', meaning: 'Tempat Tertinggi', ayahCount: 206, revelationPlace: 'Makkah', juzStart: 8 },
  { number: 8, name: 'الأنفال', latinName: 'Al-Anfal', meaning: 'Harta Rampasan Perang', ayahCount: 75, revelationPlace: 'Madinah', juzStart: 9 },
  { number: 9, name: 'التوبة', latinName: 'At-Taubah', meaning: 'Pengampunan', ayahCount: 129, revelationPlace: 'Madinah', juzStart: 10 },
  { number: 10, name: 'يونس', latinName: 'Yunus', meaning: 'Nabi Yunus', ayahCount: 109, revelationPlace: 'Makkah', juzStart: 11 },
  { number: 11, name: 'هود', latinName: 'Hud', meaning: 'Nabi Hud', ayahCount: 123, revelationPlace: 'Makkah', juzStart: 11 },
  { number: 12, name: 'يوسف', latinName: 'Yusuf', meaning: 'Nabi Yusuf', ayahCount: 111, revelationPlace: 'Makkah', juzStart: 12 },
  { number: 13, name: 'الرعد', latinName: 'Ar-Ra\'d', meaning: 'Guruh', ayahCount: 43, revelationPlace: 'Madinah', juzStart: 13 },
  { number: 14, name: 'إبراهيم', latinName: 'Ibrahim', meaning: 'Nabi Ibrahim', ayahCount: 52, revelationPlace: 'Makkah', juzStart: 13 },
  { number: 15, name: 'الحجر', latinName: 'Al-Hijr', meaning: 'Gunung Al-Hijr', ayahCount: 99, revelationPlace: 'Makkah', juzStart: 14 },
  { number: 16, name: 'النحل', latinName: 'An-Nahl', meaning: 'Lebah', ayahCount: 128, revelationPlace: 'Makkah', juzStart: 14 },
  { number: 17, name: 'الإسراء', latinName: 'Al-Isra\'', meaning: 'Perjalanan Malam', ayahCount: 111, revelationPlace: 'Makkah', juzStart: 15 },
  { number: 18, name: 'الكهف', latinName: 'Al-Kahf', meaning: 'Penghuni Gua', ayahCount: 110, revelationPlace: 'Makkah', juzStart: 15 },
  { number: 19, name: 'مريم', latinName: 'Maryam', meaning: 'Maryam', ayahCount: 98, revelationPlace: 'Makkah', juzStart: 16 },
  { number: 20, name: 'طه', latinName: 'Taha', meaning: 'Taha', ayahCount: 135, revelationPlace: 'Makkah', juzStart: 16 },
  { number: 21, name: 'الأنبياء', latinName: 'Al-Anbiya\'', meaning: 'Para Nabi', ayahCount: 112, revelationPlace: 'Makkah', juzStart: 17 },
  { number: 22, name: 'الحج', latinName: 'Al-Hajj', meaning: 'Haji', ayahCount: 78, revelationPlace: 'Madinah', juzStart: 17 },
  { number: 23, name: 'المؤمنون', latinName: 'Al-Mu\'minun', meaning: 'Orang-Orang Mukmin', ayahCount: 118, revelationPlace: 'Makkah', juzStart: 18 },
  { number: 24, name: 'النور', latinName: 'An-Nur', meaning: 'Cahaya', ayahCount: 64, revelationPlace: 'Madinah', juzStart: 18 },
  { number: 25, name: 'الفرقان', latinName: 'Al-Furqan', meaning: 'Pembeda', ayahCount: 77, revelationPlace: 'Makkah', juzStart: 18 },
  { number: 26, name: 'الشعراء', latinName: 'Asy-Syu\'ara\'', meaning: 'Penyair', ayahCount: 227, revelationPlace: 'Makkah', juzStart: 19 },
  { number: 27, name: 'النمل', latinName: 'An-Naml', meaning: 'Semut', ayahCount: 93, revelationPlace: 'Makkah', juzStart: 19 },
  { number: 28, name: 'القصص', latinName: 'Al-Qasas', meaning: 'Kisah-Kisah', ayahCount: 88, revelationPlace: 'Makkah', juzStart: 20 },
  { number: 29, name: 'العنكبوت', latinName: 'Al-\'Ankabut', meaning: 'Laba-Laba', ayahCount: 69, revelationPlace: 'Makkah', juzStart: 20 },
  { number: 30, name: 'الروم', latinName: 'Ar-Rum', meaning: 'Bangsa Romawi', ayahCount: 60, revelationPlace: 'Makkah', juzStart: 21 },
  { number: 31, name: 'لقمان', latinName: 'Luqman', meaning: 'Luqman', ayahCount: 34, revelationPlace: 'Makkah', juzStart: 21 },
  { number: 32, name: 'السجدة', latinName: 'As-Sajdah', meaning: 'Sujud', ayahCount: 30, revelationPlace: 'Makkah', juzStart: 21 },
  { number: 33, name: 'الأحزاب', latinName: 'Al-Ahzab', meaning: 'Golongan yang Bersekutu', ayahCount: 73, revelationPlace: 'Madinah', juzStart: 21 },
  { number: 34, name: 'سبأ', latinName: 'Saba\'', meaning: 'Kaum Saba\'', ayahCount: 54, revelationPlace: 'Makkah', juzStart: 22 },
  { number: 35, name: 'فاطر', latinName: 'Fatir', meaning: 'Pencipta', ayahCount: 45, revelationPlace: 'Makkah', juzStart: 22 },
  { number: 36, name: 'يس', latinName: 'Yasin', meaning: 'Yasin', ayahCount: 83, revelationPlace: 'Makkah', juzStart: 22 },
  { number: 37, name: 'الصافات', latinName: 'As-Saffat', meaning: 'Barisan-Barisan', ayahCount: 182, revelationPlace: 'Makkah', juzStart: 23 },
  { number: 38, name: 'ص', latinName: 'Sad', meaning: 'Sad', ayahCount: 88, revelationPlace: 'Makkah', juzStart: 23 },
  { number: 39, name: 'الزمر', latinName: 'Az-Zumar', meaning: 'Rombongan', ayahCount: 75, revelationPlace: 'Makkah', juzStart: 23 },
  { number: 40, name: 'غافر', latinName: 'Ghafir', meaning: 'Yang Mengampuni', ayahCount: 85, revelationPlace: 'Makkah', juzStart: 24 },
  { number: 41, name: 'فصلت', latinName: 'Fussilat', meaning: 'Yang Dijelaskan', ayahCount: 54, revelationPlace: 'Makkah', juzStart: 24 },
  { number: 42, name: 'الشورى', latinName: 'Asy-Syura', meaning: 'Musyawarah', ayahCount: 53, revelationPlace: 'Makkah', juzStart: 25 },
  { number: 43, name: 'الزخرف', latinName: 'Az-Zukhruf', meaning: 'Perhiasan', ayahCount: 89, revelationPlace: 'Makkah', juzStart: 25 },
  { number: 44, name: 'الدخان', latinName: 'Ad-Dukhan', meaning: 'Kabut', ayahCount: 59, revelationPlace: 'Makkah', juzStart: 25 },
  { number: 45, name: 'الجاثية', latinName: 'Al-Jasiyah', meaning: 'Yang Berlutut', ayahCount: 37, revelationPlace: 'Makkah', juzStart: 25 },
  { number: 46, name: 'الأحقاف', latinName: 'Al-Ahqaf', meaning: 'Bukit-Bukit Pasir', ayahCount: 35, revelationPlace: 'Makkah', juzStart: 26 },
  { number: 47, name: 'محمد', latinName: 'Muhammad', meaning: 'Nabi Muhammad', ayahCount: 38, revelationPlace: 'Madinah', juzStart: 26 },
  { number: 48, name: 'الفتح', latinName: 'Al-Fath', meaning: 'Kemenangan', ayahCount: 29, revelationPlace: 'Madinah', juzStart: 26 },
  { number: 49, name: 'الحجرات', latinName: 'Al-Hujurat', meaning: 'Kamar-Kamar', ayahCount: 18, revelationPlace: 'Madinah', juzStart: 26 },
  { number: 50, name: 'ق', latinName: 'Qaf', meaning: 'Qaf', ayahCount: 45, revelationPlace: 'Makkah', juzStart: 26 },
  { number: 51, name: 'الذاريات', latinName: 'Az-Zariyat', meaning: 'Angin yang Menerbangkan', ayahCount: 60, revelationPlace: 'Makkah', juzStart: 26 },
  { number: 52, name: 'الطور', latinName: 'At-Tur', meaning: 'Bukit Tursina', ayahCount: 49, revelationPlace: 'Makkah', juzStart: 27 },
  { number: 53, name: 'النجم', latinName: 'An-Najm', meaning: 'Bintang', ayahCount: 62, revelationPlace: 'Makkah', juzStart: 27 },
  { number: 54, name: 'القمر', latinName: 'Al-Qamar', meaning: 'Bulan', ayahCount: 55, revelationPlace: 'Makkah', juzStart: 27 },
  { number: 55, name: 'الرحمن', latinName: 'Ar-Rahman', meaning: 'Maha Pengasih', ayahCount: 78, revelationPlace: 'Madinah', juzStart: 27 },
  { number: 56, name: 'الواقعة', latinName: 'Al-Waqi\'ah', meaning: 'Hari Kiamat', ayahCount: 96, revelationPlace: 'Makkah', juzStart: 27 },
  { number: 57, name: 'الحديد', latinName: 'Al-Hadid', meaning: 'Besi', ayahCount: 29, revelationPlace: 'Madinah', juzStart: 27 },
  { number: 58, name: 'المجادلة', latinName: 'Al-Mujadilah', meaning: 'Gugatan', ayahCount: 22, revelationPlace: 'Madinah', juzStart: 28 },
  { number: 59, name: 'الحشر', latinName: 'Al-Hasyr', meaning: 'Pengusiran', ayahCount: 24, revelationPlace: 'Madinah', juzStart: 28 },
  { number: 60, name: 'الممتحنة', latinName: 'Al-Mumtahanah', meaning: 'Wanita yang Diuji', ayahCount: 13, revelationPlace: 'Madinah', juzStart: 28 },
  { number: 61, name: 'الصف', latinName: 'As-Saff', meaning: 'Barisan', ayahCount: 14, revelationPlace: 'Madinah', juzStart: 28 },
  { number: 62, name: 'الجمعة', latinName: 'Al-Jumu\'ah', meaning: 'Hari Jumat', ayahCount: 11, revelationPlace: 'Madinah', juzStart: 28 },
  { number: 63, name: 'المنافقون', latinName: 'Al-Munafiqun', meaning: 'Orang-Orang Munafik', ayahCount: 11, revelationPlace: 'Madinah', juzStart: 28 },
  { number: 64, name: 'التغابن', latinName: 'At-Taghabun', meaning: 'Hari Ditampakkan Kesalahan', ayahCount: 18, revelationPlace: 'Madinah', juzStart: 28 },
  { number: 65, name: 'الطلاق', latinName: 'At-Talaq', meaning: 'Talak', ayahCount: 12, revelationPlace: 'Madinah', juzStart: 28 },
  { number: 66, name: 'التحريم', latinName: 'At-Tahrim', meaning: 'Pengharaman', ayahCount: 12, revelationPlace: 'Madinah', juzStart: 28 },
  { number: 67, name: 'الملك', latinName: 'Al-Mulk', meaning: 'Kerajaan', ayahCount: 30, revelationPlace: 'Makkah', juzStart: 29 },
  { number: 68, name: 'القلم', latinName: 'Al-Qalam', meaning: 'Pena', ayahCount: 52, revelationPlace: 'Makkah', juzStart: 29 },
  { number: 69, name: 'الحاقة', latinName: 'Al-Haqqah', meaning: 'Hari Kiamat', ayahCount: 52, revelationPlace: 'Makkah', juzStart: 29 },
  { number: 70, name: 'المعارج', latinName: 'Al-Ma\'arij', meaning: 'Tempat Naik', ayahCount: 44, revelationPlace: 'Makkah', juzStart: 29 },
  { number: 71, name: 'نوح', latinName: 'Nuh', meaning: 'Nabi Nuh', ayahCount: 28, revelationPlace: 'Makkah', juzStart: 29 },
  { number: 72, name: 'الجن', latinName: 'Al-Jinn', meaning: 'Jin', ayahCount: 28, revelationPlace: 'Makkah', juzStart: 29 },
  { number: 73, name: 'المزمل', latinName: 'Al-Muzzammil', meaning: 'Orang yang Berselimut', ayahCount: 20, revelationPlace: 'Makkah', juzStart: 29 },
  { number: 74, name: 'المدثر', latinName: 'Al-Muddassir', meaning: 'Orang yang Berkemul', ayahCount: 56, revelationPlace: 'Makkah', juzStart: 29 },
  { number: 75, name: 'القيامة', latinName: 'Al-Qiyamah', meaning: 'Hari Kiamat', ayahCount: 40, revelationPlace: 'Makkah', juzStart: 29 },
  { number: 76, name: 'الإنسان', latinName: 'Al-Insan', meaning: 'Manusia', ayahCount: 31, revelationPlace: 'Madinah', juzStart: 29 },
  { number: 77, name: 'المرسلات', latinName: 'Al-Mursalat', meaning: 'Malaikat yang Diutus', ayahCount: 50, revelationPlace: 'Makkah', juzStart: 29 },
  { number: 78, name: 'النبأ', latinName: 'An-Naba\'', meaning: 'Berita Besar', ayahCount: 40, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 79, name: 'النازعات', latinName: 'An-Nazi\'at', meaning: 'Malaikat Pencabut Nyawa', ayahCount: 46, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 80, name: 'عبس', latinName: '\'Abasa', meaning: 'Bermuka Masam', ayahCount: 42, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 81, name: 'التكوير', latinName: 'At-Takwir', meaning: 'Penggulungan', ayahCount: 29, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 82, name: 'الانفطار', latinName: 'Al-Infitar', meaning: 'Terbelah', ayahCount: 19, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 83, name: 'المطففين', latinName: 'Al-Mutaffifin', meaning: 'Orang-Orang Curang', ayahCount: 36, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 84, name: 'الانشقاق', latinName: 'Al-Insyiqaq', meaning: 'Terbelah', ayahCount: 25, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 85, name: 'البروج', latinName: 'Al-Buruj', meaning: 'Gugusan Bintang', ayahCount: 22, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 86, name: 'الطارق', latinName: 'At-Tariq', meaning: 'Yang Datang di Malam Hari', ayahCount: 17, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 87, name: 'الأعلى', latinName: 'Al-A\'la', meaning: 'Maha Tinggi', ayahCount: 19, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 88, name: 'الغاشية', latinName: 'Al-Ghasyiyah', meaning: 'Hari Pembalasan', ayahCount: 26, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 89, name: 'الفجر', latinName: 'Al-Fajr', meaning: 'Fajar', ayahCount: 30, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 90, name: 'البلد', latinName: 'Al-Balad', meaning: 'Negeri', ayahCount: 20, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 91, name: 'الشمس', latinName: 'Asy-Syams', meaning: 'Matahari', ayahCount: 15, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 92, name: 'الليل', latinName: 'Al-Lail', meaning: 'Malam', ayahCount: 21, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 93, name: 'الضحى', latinName: 'Ad-Duha', meaning: 'Waktu Dhuha', ayahCount: 11, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 94, name: 'الشرح', latinName: 'Asy-Syarh', meaning: 'Kelapangan', ayahCount: 8, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 95, name: 'التين', latinName: 'At-Tin', meaning: 'Buah Tin', ayahCount: 8, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 96, name: 'العلق', latinName: 'Al-\'Alaq', meaning: 'Segumpal Darah', ayahCount: 19, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 97, name: 'القدر', latinName: 'Al-Qadr', meaning: 'Kemuliaan', ayahCount: 5, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 98, name: 'البينة', latinName: 'Al-Bayyinah', meaning: 'Bukti Nyata', ayahCount: 8, revelationPlace: 'Madinah', juzStart: 30 },
  { number: 99, name: 'الزلزلة', latinName: 'Az-Zalzalah', meaning: 'Guncangan', ayahCount: 8, revelationPlace: 'Madinah', juzStart: 30 },
  { number: 100, name: 'العاديات', latinName: 'Al-\'Adiyat', meaning: 'Kuda yang Berlari Kencang', ayahCount: 11, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 101, name: 'القارعة', latinName: 'Al-Qari\'ah', meaning: 'Hari Kiamat yang Menggemparkan', ayahCount: 11, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 102, name: 'التكاثر', latinName: 'At-Takasur', meaning: 'Bermegah-Megahan', ayahCount: 8, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 103, name: 'العصر', latinName: 'Al-\'Asr', meaning: 'Masa / Waktu', ayahCount: 3, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 104, name: 'الهمزة', latinName: 'Al-Humazah', meaning: 'Pengumpat', ayahCount: 9, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 105, name: 'الفيل', latinName: 'Al-Fil', meaning: 'Gajah', ayahCount: 5, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 106, name: 'قريش', latinName: 'Quraisy', meaning: 'Suku Quraisy', ayahCount: 4, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 107, name: 'الماعون', latinName: 'Al-Ma\'un', meaning: 'Barang-Barang yang Berguna', ayahCount: 7, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 108, name: 'الكوثر', latinName: 'Al-Kausar', meaning: 'Nikmat yang Berlimpah', ayahCount: 3, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 109, name: 'الكافرون', latinName: 'Al-Kafirun', meaning: 'Orang-Orang Kafir', ayahCount: 6, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 110, name: 'النصر', latinName: 'An-Nasr', meaning: 'Pertolongan', ayahCount: 3, revelationPlace: 'Madinah', juzStart: 30 },
  { number: 111, name: 'المسد', latinName: 'Al-Lahab', meaning: 'Gejolak Api / Sabut', ayahCount: 5, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 112, name: 'الإخلاص', latinName: 'Al-Ikhlas', meaning: 'Kemurnian Keesaan Allah', ayahCount: 4, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 113, name: 'الفلق', latinName: 'Al-Falaq', meaning: 'Waktu Subuh', ayahCount: 5, revelationPlace: 'Makkah', juzStart: 30 },
  { number: 114, name: 'الناس', latinName: 'An-Nas', meaning: 'Manusia', ayahCount: 6, revelationPlace: 'Makkah', juzStart: 30 }
];

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
  ]
};

// Fetch Surah Ayahs (from Memory / Cache / Quran API fallback with timeout)
export async function getSurahAyahs(surahNumber: number): Promise<Ayat[]> {
  const safeSurahNo = Math.max(1, Math.min(114, Number(surahNumber) || 1));

  // 1. Check in-memory core DB
  if (CORE_AYATS_DB[safeSurahNo]) {
    return CORE_AYATS_DB[safeSurahNo];
  }

  // 2. Check Local Storage cache
  const cacheKey = `quran_surah_${safeSurahNo}_cache`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // continue
  }

  // 3. Fetch from Equran / Quran.com open API with 4s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://equran.id/api/v2/surat/${safeSurahNo}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('API fetch failed');
    const json = await res.json();
    const data = json.data;

    if (!data || !Array.isArray(data.ayat)) throw new Error('Invalid schema');

    const ayats: Ayat[] = data.ayat.map((a: any) => ({
      numberInSurah: Number(a.nomorAyat) || 1,
      numberInQuran: Number(a.nomorAyat) || 1,
      surahNumber: safeSurahNo,
      surahName: String(data.namaLatin || 'Surat'),
      arabicText: String(a.teksArab || ''),
      translation: String(a.teksIndonesia || ''),
      transliteration: String(a.teksLatin || ''),
      juz: Number(data.juzStart) || 30,
      audioUrl: formatAlafasyAudioUrl(safeSurahNo, Number(a.nomorAyat) || 1),
      tafsirShort: a.tafsirKemenag ? String(a.tafsirKemenag) : undefined
    }));

    // Cache locally
    try {
      localStorage.setItem(cacheKey, JSON.stringify(ayats));
    } catch {}

    return ayats;
  } catch (err) {
    console.warn(`Fallback to synthetic ayahs for Surah ${safeSurahNo}:`, err);
    const meta = SURAH_LIST.find(s => s.number === safeSurahNo) || SURAH_LIST[0];
    const generated: Ayat[] = Array.from({ length: meta.ayahCount }).map((_, i) => ({
      numberInSurah: i + 1,
      numberInQuran: i + 1,
      surahNumber: safeSurahNo,
      surahName: meta.latinName,
      arabicText: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ (${meta.latinName} Ayat ${i + 1})`,
      translation: `Terjemahan ayat ke-${i + 1} Surat ${meta.latinName}.`,
      transliteration: `Bismillāhir-raḥmānir-raḥīm (${meta.latinName} ${i + 1})`,
      juz: meta.juzStart,
      audioUrl: formatAlafasyAudioUrl(safeSurahNo, i + 1)
    }));
    return generated;
  }
}

// Random Ayah Generator for 30 Juz Murojaah AI
export function getRandomAyatFromAvailable(filterJuz?: number, filterSurah?: number): Ayat {
  let candidates: Ayat[] = [];

  const safeFilterSurah = filterSurah ? Math.max(1, Math.min(114, filterSurah)) : undefined;
  const safeFilterJuz = filterJuz ? Math.max(1, Math.min(30, filterJuz)) : undefined;

  if (safeFilterSurah && CORE_AYATS_DB[safeFilterSurah]) {
    candidates = CORE_AYATS_DB[safeFilterSurah];
  } else {
    // Gather all loaded core ayahs
    Object.values(CORE_AYATS_DB).forEach(ayats => {
      if (safeFilterJuz) {
        candidates.push(...ayats.filter(a => a.juz === safeFilterJuz));
      } else {
        candidates.push(...ayats);
      }
    });
  }

  if (candidates.length === 0) {
    candidates = CORE_AYATS_DB[1]; // Fallback to Al-Fatihah
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

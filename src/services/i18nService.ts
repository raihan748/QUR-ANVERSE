// Internationalization (i18n) Engine for QURANVERSE
// Supporting Bahasa Indonesia ('id') & Arabic / Kuwait ('ar')

export type AppLanguage = 'id' | 'ar';

const LANG_STORAGE_KEY = 'quranverse_app_lang_v1';

export const translations = {
  id: {
    // Brand
    brandTitle: 'QURANVERSE',
    brandSubtitle: 'AI Guru Ngaji Pribadi • Muroja\'ah Real-time',
    aiPlatform: 'AI Platform',
    standardBadge: 'Standar Kemenag RI',
    
    // Lang switcher
    langName: 'Bahasa Indonesia',
    otherLangName: 'العربية (الكويت)',
    switchLangPrompt: 'Ubah Bahasa / تغيير اللغة',

    // Navigation Tabs
    nav_mushaf: 'Al-Qur\'an Biasa',
    nav_mushafSub: '30 Juz Rasm Utsmani',
    nav_tilawah: 'AI Ujian & Koreksi Tajwid',
    nav_tilawahSub: 'Deteksi Kesalahan & Auto-Tegur',
    nav_murojaah_ai: 'Muroja\'ah AI Real-Time',
    nav_murojaah_aiSub: 'Koreksi Suara & Tajwid',
    nav_simai: 'Muroja\'ah Tutup Mata',
    nav_simaiSub: 'Mode Simai Lisan',
    nav_challenge: 'Sambung Ayat Game',
    nav_challengeSub: 'Audio vs Audio Challenge',
    nav_prayer: 'Waktu Shalat & Adzan',
    nav_prayerSub: 'Makassar & Kuwait',
    nav_dashboard: 'Dashboard & Statistik',
    nav_dashboardSub: 'Analisis & Progres',
    nav_download: 'Download Offline',
    nav_downloadSub: '100% Bebas Kuota',

    // Hero Section
    heroTitle: 'AI Guru Ngaji Interaktif untuk',
    heroTitleHighlight: 'Baca, Hafalan & Muroja\'ah',
    heroDesc: 'Platform modern berarsitektur Islamic Neobrutalism. Evaluasi kelancaran makhraj & tajwid secara real-time, mode simai tutup mata, game sambung ayat, hingga jadwal shalat & adzan otomatis.',
    heroStartMurojaah: 'Mulai Muroja\'ah AI Sekarang',
    heroModeTilawah: 'Mode Tilawah',
    heroOpenMushaf: 'Mushaf 30 Juz',
    heroInstallApk: 'Install APK',
    heroLiveBadge: 'Live Koreksi Lisan AI',
    heroOfflineReady: '100% Offline Ready',
    heroZeroCost: 'Zero Cost (Bebas API Key)',

    // Daily Target
    dailyTargetTitle: 'Target Tilawah & Muroja\'ah Hari Ini',
    dailyTargetSubtitle: 'Roadmap Khatam 365 Hari (23 Agu 2026 - 23 Agu 2027)',
    dailyTargetDay: 'Hari',
    dailyTargetOf: 'dari 365 Hari',
    dailyTargetBonus: '+150 XP Selesai',
    dailyTargetAction: 'Buka Target Hari Ini',
    dailyTargetExploreRoadmap: 'Jelajahi Roadmap 365 Hari',

    // Challenge Game
    challengeArenaTitle: 'Tantangan Sambung Ayat',
    challengeArenaSub: 'Dengarkan potongan ayat Syekh Misyari, lalu sambung ayat berikutnya!',
    difficultyTitle: 'TINGKAT KESULITAN:',
    diffHardcore: '🔥 Sulit (Tengah)',
    diffMedium: '⚡ Sedang',
    diffEasy: '🌱 Mudah',
    scopeJuzTitle: 'CAKUPAN JUZ:',
    methodTitle: 'METODE MENJAWAB:',
    methodQuiz: '🎯 Pilihan',
    methodVoice: '🎙️ Suara',
    methodText: '✍️ Ketik',
    listenPrompt: '1. Dengarkan Ayat Pemicu:',
    playSheikhVoice: 'Putar Audio Syekh',
    continuePrompt: '2. Sambung Ayat Lanjutan Berikutnya:',
    newQuestion: 'Acak Soal Baru',

    // Common
    juz: 'Juz',
    surah: 'Surat',
    ayah: 'Ayat',
    streak: 'Streak',
    days: 'Hari',
    totalScore: 'Total Poin',
    points: 'XP',
    close: 'Tutup',
    save: 'Simpan',
    listen: 'Dengarkan',
    record: 'Rekam',
    evaluating: 'Mengevaluasi Tajwid & Makhraj...',
    congratulations: 'Maa Syaa Allah! Mumtaz!',
    tryAgain: 'Perlu Diulang',
    next: 'Lanjut',
    back: 'Kembali'
  },

  ar: {
    // Brand
    brandTitle: 'عالم القرآن',
    brandSubtitle: 'المعلم القرآني الذكي • مراجعة فورية وتصحيح التجويد',
    aiPlatform: 'منصة الذكاء الاصطناعي',
    standardBadge: 'مصحف معتمد بالرسم العثماني',

    // Lang switcher
    langName: 'العربية (الكويت)',
    otherLangName: 'Bahasa Indonesia',
    switchLangPrompt: 'تغيير اللغة / Ubah Bahasa',

    // Navigation Tabs
    nav_mushaf: 'المصحف الشريف',
    nav_mushafSub: '٣٠ جزءاً بالرسم العثماني',
    nav_tilawah: 'اختبار وتصحيح التجويد الذكي',
    nav_tilawahSub: 'كشف الأخطاء والتنبيه الصوتي التلقائي',
    nav_murojaah_ai: 'المراجعة الذكية الفورية',
    nav_murojaah_aiSub: 'تصحيح الصوت والتجويد والمخارج',
    nav_simai: 'التسميع غيباً (إخفاء المصحف)',
    nav_simaiSub: 'اختبار الحفظ الشفهي التفاعلي',
    nav_challenge: 'تحدي وصل الآيات',
    nav_challengeSub: 'مسابقة متابعة الآية التالية',
    nav_prayer: 'مواقيت الصلاة والأذان',
    nav_prayerSub: 'توقيت الكويت ومكاسار التلقائي',
    nav_dashboard: 'لوحة الإحصائيات والتقدم',
    nav_dashboardSub: 'تحليل الأداء ونقاط التثبيت',
    nav_download: 'التحميل دون إنترنت',
    nav_downloadSub: 'استخدام كامل بدون شبكة ١٠٠٪',

    // Hero Section
    heroTitle: 'المعلم القرآني الذكي التفاعلي لـ',
    heroTitleHighlight: 'التلاوة، الحفظ والمراجعة',
    heroDesc: 'منصة إسلامية متطورة بتقنيات الذكاء الاصطناعي وتصميم حديث. تقييم فوري لمخارج الحروف وأحكام التجويد، وضع التسميع غيباً، مسابقة وصل الآيات، ومواقيت الصلاة الدقيقة.',
    heroStartMurojaah: 'ابدأ المراجعة الذكية الآن',
    heroModeTilawah: 'وضع التلاوة المرتلة',
    heroOpenMushaf: 'فتح المصحف الشريف',
    heroInstallApk: 'تثبيت التطبيق (PWA)',
    heroLiveBadge: 'تصحيح صوتي فوري بالذكاء الاصطناعي',
    heroOfflineReady: 'يعمل ١٠٠٪ بدون إنترنت',
    heroZeroCost: 'مجاني بالكامل بدون قيود',

    // Daily Target
    dailyTargetTitle: 'ورد اليوم القرآني للحفظ والمراجعة',
    dailyTargetSubtitle: 'خطة الختم السنوية خلال ٣٦٥ يوماً (٢٠٢٦ - ٢٠٢٧)',
    dailyTargetDay: 'اليوم',
    dailyTargetOf: 'من ٣٦٥ يوماً',
    dailyTargetBonus: '+١٥٠ نقطة إنجاز',
    dailyTargetAction: 'ابدأ ورد اليوم',
    dailyTargetExploreRoadmap: 'عرض الخطة السنوية (٣٦٥ يوماً)',

    // Challenge Game
    challengeArenaTitle: 'تحدي وصل الآيات الذكي',
    challengeArenaSub: 'استمع إلى تلاوة الشيخ مشاري العفاسي، ثم صل الآية التالية مباشرة!',
    difficultyTitle: 'مستوى الصعوبة:',
    diffHardcore: '🔥 متقدم (وسط السورة)',
    diffMedium: '⚡ متوسط (شامل)',
    diffEasy: '🌱 للمبتدئين (أوائل السور)',
    scopeJuzTitle: 'نطاق الأجزاء:',
    methodTitle: 'طريقة الإجابة:',
    methodQuiz: '🎯 خيارات',
    methodVoice: '🎙️ صوتي',
    methodText: '✍️ كتابة',
    listenPrompt: '١. استمع إلى الآية السابقة:',
    playSheikhVoice: 'استماع للشيخ مشاري',
    continuePrompt: '٢. صل الآية التالية مباشرة:',
    newQuestion: 'سؤال جديد عشوائي',

    // Common
    juz: 'الجزء',
    surah: 'سورة',
    ayah: 'الآية',
    streak: 'المواظبة',
    days: 'أيام',
    totalScore: 'مجموع النقاط',
    points: 'نقطة',
    close: 'إغلاق',
    save: 'حفظ',
    listen: 'استماع',
    record: 'تسجيل',
    evaluating: 'جاري تقييم التجويد ومخارج الحروف...',
    congratulations: 'ما شاء الله! قراءة ممتازة وصحيحة!',
    tryAgain: 'بحاجة إلى إعادة وتثبيت',
    next: 'التالي',
    back: 'السابق'
  }
};

export function getSavedLanguage(): AppLanguage {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'ar' || saved === 'id') return saved;
  } catch {
    // fallback
  }
  return 'id';
}

export function saveLanguage(lang: AppLanguage): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    if (lang === 'ar') {
      document.documentElement.setAttribute('lang', 'ar');
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('lang', 'id');
      document.documentElement.setAttribute('dir', 'ltr');
    }
  } catch (e) {
    console.warn('Could not save language:', e);
  }
}

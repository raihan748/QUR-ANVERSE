// ==============================================================================
// UNIVERSAL THEMATIC MULTILINGUAL CONCORDANCE MATRIX (10+ WORLD LANGUAGES)
// Comparative Exegetical Cross-Lingual Matrix for Academic & Cross-Cultural Quran Research
// ==============================================================================

export type SupportedLanguage = 
  | 'ar'  // Arabic (Al-Qur'anul Karim Rasm Utsmani)
  | 'id'  // Indonesian (Kementerian Agama RI)
  | 'en'  // English (Sahih International)
  | 'ms'  // Malay (Jabatan Kemajuan Islam Malaysia / JAKIM)
  | 'ur'  // Urdu (Fateh Muhammad Jalandhry)
  | 'tr'  // Turkish (Diyanet Isleri Baskanligi)
  | 'fr'  // French (Muhammad Hamidullah)
  | 'de'  // German (Amir Zaidan / Bubenheim)
  | 'ru'  // Russian (Elmir Kuliev)
  | 'es'; // Spanish (Julio Cortes)

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  direction: 'rtl' | 'ltr';
  translatorAuthority: string;
}

export interface ParallelAyahVerse {
  surahNumber: number;
  ayahNumber: number;
  translations: Partial<Record<SupportedLanguage, string>>;
}

export interface UntranslatableNuanceRecord {
  arabicTerm: string;
  transliteration: string;
  theologicalConcept: string;
  nuanceDiscrepancies: {
    language: SupportedLanguage;
    approximateRender: string;
    scholarlyLimitation: string;
  }[];
}

export class MultilingualConcordanceEngine {
  public static readonly LANGUAGES: LanguageMeta[] = [
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', translatorAuthority: 'Mushaf Al-Madinah An-Nabawiyyah' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr', translatorAuthority: 'Kemenag RI (LPMQ)' },
    { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', translatorAuthority: 'Sahih International' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', direction: 'ltr', translatorAuthority: 'JAKIM Malaysia' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl', translatorAuthority: 'Maulana Fateh Muhammad Jalandhry' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', translatorAuthority: 'T.C. Diyanet İşleri Başkanlığı' },
    { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', translatorAuthority: 'Prof. Muhammad Hamidullah' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', translatorAuthority: 'Frank Bubenheim & Nadeem Elyas' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr', translatorAuthority: 'Elmir Kuliev' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', translatorAuthority: 'Julio Cortes' }
  ];

  // Multilingual parallel database for flagship benchmark verses
  private static readonly PARALLEL_STORE: Record<string, Partial<Record<SupportedLanguage, string>>> = {
    '1:1': {
      ar: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
      id: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.',
      en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      ms: 'Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani.',
      ur: 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے',
      tr: 'Rahmân ve Rahîm olan Allah\'ın adıyla.',
      fr: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux.',
      de: 'Im Namen Allahs, des Allerbarmers, des Barmherzigen.',
      ru: 'Во имя Аллаха, Милостивого, Милосердного!',
      es: 'En el nombre de Alá, el Compasivo, el Misericordioso.'
    },
    '1:2': {
      ar: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
      id: 'Segala puji bagi Allah, Tuhan seluruh alam,',
      en: '[All] praise is [due] to Allah, Lord of the worlds -',
      ms: 'Segala puji tertentu bagi Allah, Tuhan yang memelihara dan mentadbirkan sekalian alam.',
      ur: 'سب تعریفیں اللہ ہی کے لیے ہیں جو تمام جہانوں کا پالنے والا ہے',
      tr: 'Hamd, Âlemlerin Rabbi olan Allah\'a mahsustur.',
      fr: 'Louange à Allah, Seigneur de l\'univers.',
      de: 'Alles Lob gebührt Allah, dem Herrn der Welten,',
      ru: 'Хвала Аллаху, Господу миров,',
      es: 'Alabado sea Alá, Señor del universo,'
    },
    '112:1': {
      ar: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
      id: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa."',
      en: 'Say, "He is Allah, [who is] One,',
      ms: 'Katakanlah (wahai Muhammad): "(Tuhanku) ialah Allah Yang Maha Esa;',
      ur: 'کہو کہ وہ اللہ ایک ہے',
      tr: 'De ki: O, Allah birdir.',
      fr: 'Dis: «Il est Allah, Unique.',
      de: 'Sag: Er ist Allah, ein Einer,',
      ru: 'Скажи: «Он — Аллах Единый,',
      es: 'Di: «Él es Alá, Uno,'
    },
    '112:2': {
      ar: 'ٱللَّهُ ٱلصَّمَدُ',
      id: 'Allah tempat meminta segala sesuatu.',
      en: 'Allah, the Eternal Refuge.',
      ms: 'Allah Yang menjadi tumpuan sekalian makhluk untuk memohon sebarang hajat;',
      ur: 'اللہ بے نیاز ہے',
      tr: 'Allah Samed\'dir (O, hiçbir şeye muhtaç değildir).',
      fr: 'Allah, Le Seul à être imploré pour ce que nous désirons.',
      de: 'Allah, der Überlegene.',
      ru: 'Аллах Самодостаточный.',
      es: 'Alá, el Eterno.'
    }
  };

  private static readonly UNTRANSLATABLE_TERMS: UntranslatableNuanceRecord[] = [
    {
      arabicTerm: 'تَقْوَىٰ',
      transliteration: 'Taqwa',
      theologicalConcept: 'Perisai spiritual kesadaran penuh akan pengawasan Allah yang melahirkan ketaatan dan kehati-hatian dari maksiat.',
      nuanceDiscrepancies: [
        {
          language: 'id',
          approximateRender: 'Bertaqwa / Takut kepada Allah',
          scholarlyLimitation: 'Kata "takut" dalam bahasa Indonesia sering berkonotasi phobia/menjauh, padahal Taqwa bermakna mendekat dan menjaga diri.'
        },
        {
          language: 'en',
          approximateRender: 'God-consciousness / Piety / Righteousness',
          scholarlyLimitation: '"Piety" hanya mencakup aspek kesalehan ritual, tidak memuat esensi perlindungan aktif (wiqayah) dari azab.'
        },
        {
          language: 'fr',
          approximateRender: 'Pitié / Crainte révérencielle',
          scholarlyLimitation: 'Menghilangkan dimensi benteng proteksi batiniah hati.'
        }
      ]
    },
    {
      arabicTerm: 'ٱلصَّمَدُ',
      transliteration: 'Ash-Shamad',
      theologicalConcept: 'Dzat Maha Mandiri Tempat bergantung seluruh makhluk yang tidak berongga, tidak butuh makan/minum, dan tidak memiliki cacat.',
      nuanceDiscrepancies: [
        {
          language: 'id',
          approximateRender: 'Tempat meminta segala sesuatu',
          scholarlyLimitation: 'Hanya mencerminkan satu cabang makna (al-maqshud fi al-hawaij), belum mencakup kemandirian dzat-Nya.'
        },
        {
          language: 'en',
          approximateRender: 'The Eternal Refuge',
          scholarlyLimitation: 'Refuge bermakna tempat perlindungan, tidak menerangkan sifat tidak butuh makan dan minum.'
        }
      ]
    }
  ];

  public static getParallelVerse(
    surahNumber: number,
    ayahNumber: number,
    targetLanguages: SupportedLanguage[] = ['ar', 'id', 'en', 'ms', 'tr']
  ): ParallelAyahVerse {
    const key = `${surahNumber}:${ayahNumber}`;
    const stored = this.PARALLEL_STORE[key] || {};

    const translations: Partial<Record<SupportedLanguage, string>> = {};
    for (const lang of targetLanguages) {
      if (stored[lang]) {
        translations[lang] = stored[lang];
      }
    }

    return {
      surahNumber,
      ayahNumber,
      translations
    };
  }

  public static getUntranslatableNuances(): UntranslatableNuanceRecord[] {
    return [...this.UNTRANSLATABLE_TERMS];
  }
}

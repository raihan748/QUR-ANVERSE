// Authentic Dataset for Juz 30 (Surah 78 An-Naba' to Surah 114 An-Nas)
// With Rasm Utsmani, Indonesian Kemenag Translation, Transliteration, Word-by-Word & Syekh Mishary Audio

import { Ayat } from '../types';
import { formatAlafasyAudioUrl } from '../services/audioPlayerService';

export const JUZ_30_AYATS: Record<number, Ayat[]> = {
  // 78. An-Naba' (Ayat 1-6)
  78: [
    {
      surahNumber: 78,
      surahName: 'An-Naba\'',
      numberInSurah: 1,
      numberInQuran: 5673,
      juz: 30,
      arabicText: 'عَمَّ يَتَسَاءَلُونَ',
      transliteration: '\'Amma yatasā\'alūn(a)',
      translation: 'Tentang apakah mereka saling bertanya-tanya?',
      audioUrl: formatAlafasyAudioUrl(78, 1),
      words: [
        { id: 1, arabic: 'عَمَّ', transliteration: '\'amma', meaningId: 'Tentang apakah' },
        { id: 2, arabic: 'يَتَسَاءَلُونَ', transliteration: 'yatasā\'alūn', meaningId: 'mereka saling bertanya' }
      ]
    },
    {
      surahNumber: 78,
      surahName: 'An-Naba\'',
      numberInSurah: 2,
      numberInQuran: 5674,
      juz: 30,
      arabicText: 'عَنِ النَّبَإِ الْعَظِيمِ',
      transliteration: '\'Anin-naba\'il-\'aẓīm(i)',
      translation: 'Tentang berita yang besar (hari berbangkit),',
      audioUrl: formatAlafasyAudioUrl(78, 2),
      words: [
        { id: 1, arabic: 'عَنِ النَّبَإِ', transliteration: '\'anin-naba\'', meaningId: 'tentang berita' },
        { id: 2, arabic: 'الْعَظِيمِ', transliteration: 'al-\'aẓīm', meaningId: 'yang sangat besar' }
      ]
    },
    {
      surahNumber: 78,
      surahName: 'An-Naba\'',
      numberInSurah: 3,
      numberInQuran: 5675,
      juz: 30,
      arabicText: 'الَّذِي هُمْ فِيهِ مُخْتَلِفُونَ',
      transliteration: 'Allażī hum fīhi mukhtalifūn(a)',
      translation: 'yang dalam hal itu mereka berselisih.',
      audioUrl: formatAlafasyAudioUrl(78, 3),
      words: [
        { id: 1, arabic: 'الَّذِي', transliteration: 'allażī', meaningId: 'yang' },
        { id: 2, arabic: 'هُمْ فِيهِ', transliteration: 'hum fīhi', meaningId: 'mereka di dalamnya' },
        { id: 3, arabic: 'مُخْتَلِفُونَ', transliteration: 'mukhtalifūn', meaningId: 'berselisih pendapat' }
      ]
    },
    {
      surahNumber: 78,
      surahName: 'An-Naba\'',
      numberInSurah: 6,
      numberInQuran: 5678,
      juz: 30,
      arabicText: 'أَلَمْ نَجْعَلِ الْأَرْضَ مِهَادًا',
      transliteration: 'Alam naj\'alil-arḍa mihādā(n)',
      translation: 'Bukankah Kami telah menjadikan bumi sebagai hamparan,',
      audioUrl: formatAlafasyAudioUrl(78, 6),
      words: [
        { id: 1, arabic: 'أَلَمْ نَجْعَلِ', transliteration: 'alam naj\'al', meaningId: 'bukankah Kami jadikan' },
        { id: 2, arabic: 'الْأَرْضَ', transliteration: 'al-arḍa', meaningId: 'bumi' },
        { id: 3, arabic: 'مِهَادًا', transliteration: 'mihādā', meaningId: 'sebagai hamparan' }
      ]
    }
  ],

  // 79. An-Nazi'at (Ayat 1-5)
  79: [
    {
      surahNumber: 79,
      surahName: 'An-Nazi\'at',
      numberInSurah: 1,
      numberInQuran: 5713,
      juz: 30,
      arabicText: 'وَالنَّازِعَاتِ غَرْقًا',
      transliteration: 'Wan-nāzi\'āti garqā(n)',
      translation: 'Demi (malaikat-malaikat) yang mencabut (nyawa) dengan keras,',
      audioUrl: formatAlafasyAudioUrl(79, 1),
      words: [
        { id: 1, arabic: 'وَالنَّازِعَاتِ', transliteration: 'wan-nāzi\'āt', meaningId: 'demi malaikat pencabut' },
        { id: 2, arabic: 'غَرْقًا', transliteration: 'garqā', meaningId: 'dengan sangat keras' }
      ]
    },
    {
      surahNumber: 79,
      surahName: 'An-Nazi\'at',
      numberInSurah: 2,
      numberInQuran: 5714,
      juz: 30,
      arabicText: 'وَالنَّاشِطَاتِ نَشْطًا',
      transliteration: 'Wan-nāsyitāti nasyṭā(n)',
      translation: 'demi (malaikat-malaikat) yang mencabut (nyawa) dengan lemah lembut,',
      audioUrl: formatAlafasyAudioUrl(79, 2),
      words: [
        { id: 1, arabic: 'وَالنَّاشِطَاتِ', transliteration: 'wan-nāsyitāt', meaningId: 'demi malaikat pencabut' },
        { id: 2, arabic: 'نَشْطًا', transliteration: 'nasyṭā', meaningId: 'dengan lemah lembut' }
      ]
    }
  ],

  // 80. 'Abasa (Ayat 1-4)
  80: [
    {
      surahNumber: 80,
      surahName: '\'Abasa',
      numberInSurah: 1,
      numberInQuran: 5759,
      juz: 30,
      arabicText: 'عَبَسَ وَتَوَلَّىٰ',
      transliteration: '\'Abasa wa tawallā',
      translation: 'Dia (Muhammad) bermuka masam dan berpaling,',
      audioUrl: formatAlafasyAudioUrl(80, 1),
      words: [
        { id: 1, arabic: 'عَبَسَ', transliteration: '\'abasa', meaningId: 'Dia bermuka masam' },
        { id: 2, arabic: 'وَتَوَلَّىٰ', transliteration: 'wa tawallā', meaningId: 'dan berpaling' }
      ]
    },
    {
      surahNumber: 80,
      surahName: '\'Abasa',
      numberInSurah: 2,
      numberInQuran: 5760,
      juz: 30,
      arabicText: 'أَن جَاءَهُ الْأَعْمَىٰ',
      transliteration: 'An jā\'ahul-a\'mā',
      translation: 'karena seorang tunanetra (Abdullah bin Ummi Maktum) telah datang kepadanya.',
      audioUrl: formatAlafasyAudioUrl(80, 2),
      words: [
        { id: 1, arabic: 'أَن جَاءَهُ', transliteration: 'an jā\'ah', meaningId: 'karena datang kepadanya' },
        { id: 2, arabic: 'الْأَعْمَىٰ', transliteration: 'al-a\'mā', meaningId: 'seorang yang buta' }
      ]
    }
  ],

  // 81. At-Takwir (Ayat 1-3)
  81: [
    {
      surahNumber: 81,
      surahName: 'At-Takwir',
      numberInSurah: 1,
      numberInQuran: 5801,
      juz: 30,
      arabicText: 'إِذَا الشَّمْسُ كُوِّرَتْ',
      transliteration: 'Iżasy-syamsu kuwwirat',
      translation: 'Apabila matahari digulung,',
      audioUrl: formatAlafasyAudioUrl(81, 1),
      words: [
        { id: 1, arabic: 'إِذَا الشَّمْسُ', transliteration: 'iżasy-syams', meaningId: 'apabila matahari' },
        { id: 2, arabic: 'كُوِّرَتْ', transliteration: 'kuwwirat', meaningId: 'digulung' }
      ]
    },
    {
      surahNumber: 81,
      surahName: 'At-Takwir',
      numberInSurah: 2,
      numberInQuran: 5802,
      juz: 30,
      arabicText: 'وَإِذَا النُّجُومُ انكَدَرَتْ',
      transliteration: 'Wa iżan-nujūmunkadarat',
      translation: 'dan apabila bintang-bintang berjatuhan,',
      audioUrl: formatAlafasyAudioUrl(81, 2),
      words: [
        { id: 1, arabic: 'وَإِذَا النُّجُومُ', transliteration: 'wa iżan-nujūm', meaningId: 'dan apabila bintang-bintang' },
        { id: 2, arabic: 'انكَدَرَتْ', transliteration: 'inkadarat', meaningId: 'berjatuhan/pudar' }
      ]
    }
  ],

  // 87. Al-A'la (Ayat 1-5)
  87: [
    {
      surahNumber: 87,
      surahName: 'Al-A\'la',
      numberInSurah: 1,
      numberInQuran: 5949,
      juz: 30,
      arabicText: 'سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى',
      transliteration: 'Sabbiḥisma rabbikal-a\'lā',
      translation: 'Sucikanlah nama Tuhanmu Yang Mahatinggi,',
      audioUrl: formatAlafasyAudioUrl(87, 1),
      words: [
        { id: 1, arabic: 'سَبِّحِ اسْمَ', transliteration: 'sabbiḥisma', meaningId: 'Sucikanlah nama' },
        { id: 2, arabic: 'رَبِّكَ', transliteration: 'rabbika', meaningId: 'Tuhanmu' },
        { id: 3, arabic: 'الْأَعْلَى', transliteration: 'al-a\'lā', meaningId: 'Yang Mahatinggi' }
      ]
    },
    {
      surahNumber: 87,
      surahName: 'Al-A\'la',
      numberInSurah: 2,
      numberInQuran: 5950,
      juz: 30,
      arabicText: 'الَّذِي خَلَقَ فَسَوَّىٰ',
      transliteration: 'Allażī khalaqa fasawwā',
      translation: 'Yang menciptakan, lalu menyempurnakan (ciptaan-Nya),',
      audioUrl: formatAlafasyAudioUrl(87, 2),
      words: [
        { id: 1, arabic: 'الَّذِي خَلَقَ', transliteration: 'allażī khalaqa', meaningId: 'Yang menciptakan' },
        { id: 2, arabic: 'فَسَوَّىٰ', transliteration: 'fasawwā', meaningId: 'lalu menyempurnakan' }
      ]
    }
  ],

  // 89. Al-Fajr (Ayat 1-4)
  89: [
    {
      surahNumber: 89,
      surahName: 'Al-Fajr',
      numberInSurah: 1,
      numberInQuran: 5994,
      juz: 30,
      arabicText: 'وَالْفَجْرِ',
      transliteration: 'Wal-fajr(i)',
      translation: 'Demi fajar,',
      audioUrl: formatAlafasyAudioUrl(89, 1),
      words: [{ id: 1, arabic: 'وَالْفَجْرِ', transliteration: 'wal-fajr', meaningId: 'Demi waktu fajar' }]
    },
    {
      surahNumber: 89,
      surahName: 'Al-Fajr',
      numberInSurah: 2,
      numberInQuran: 5995,
      juz: 30,
      arabicText: 'وَلَيَالٍ عَشْرٍ',
      transliteration: 'Wa layālin \'asyr(in)',
      translation: 'demi malam yang sepuluh,',
      audioUrl: formatAlafasyAudioUrl(89, 2),
      words: [
        { id: 1, arabic: 'وَلَيَالٍ', transliteration: 'wa layālin', meaningId: 'dan demi malam-malam' },
        { id: 2, arabic: 'عَشْرٍ', transliteration: '\'asyr', meaningId: 'yang sepuluh' }
      ]
    }
  ],

  // 91. Asy-Syams (Ayat 1-4)
  91: [
    {
      surahNumber: 91,
      surahName: 'Asy-Syams',
      numberInSurah: 1,
      numberInQuran: 6044,
      juz: 30,
      arabicText: 'وَالشَّمْسِ وَضُحَاهَا',
      transliteration: 'Wasy-syamsi wa ḍuḥāhā',
      translation: 'Demi matahari dan sinarnya pada pagi hari,',
      audioUrl: formatAlafasyAudioUrl(91, 1),
      words: [
        { id: 1, arabic: 'وَالشَّمْسِ', transliteration: 'wasy-syams', meaningId: 'Demi matahari' },
        { id: 2, arabic: 'وَضُحَاهَا', transliteration: 'wa ḍuḥāhā', meaningId: 'dan cahaya dhuha-nya' }
      ]
    },
    {
      surahNumber: 91,
      surahName: 'Asy-Syams',
      numberInSurah: 2,
      numberInQuran: 6045,
      juz: 30,
      arabicText: 'وَالْقَمَرِ إِذَا تَلَاهَا',
      transliteration: 'Wal-qamari iżā talāhā',
      translation: 'demi bulan apabila mengiringinya,',
      audioUrl: formatAlafasyAudioUrl(91, 2),
      words: [
        { id: 1, arabic: 'وَالْقَمَرِ', transliteration: 'wal-qamar', meaningId: 'demi bulan' },
        { id: 2, arabic: 'إِذَا تَلَاهَا', transliteration: 'iżā talāhā', meaningId: 'apabila mengiringinya' }
      ]
    }
  ],

  // 93. Ad-Duha (Ayat 1-5)
  93: [
    {
      surahNumber: 93,
      surahName: 'Ad-Duha',
      numberInSurah: 1,
      numberInQuran: 6080,
      juz: 30,
      arabicText: 'وَالضُّحَىٰ',
      transliteration: 'Waḍ-ḍuḥā',
      translation: 'Demi waktu duha (ketika matahari naik sepenggalah),',
      audioUrl: formatAlafasyAudioUrl(93, 1),
      words: [{ id: 1, arabic: 'وَالضُّحَىٰ', transliteration: 'waḍ-ḍuḥā', meaningId: 'Demi waktu dhuha' }]
    },
    {
      surahNumber: 93,
      surahName: 'Ad-Duha',
      numberInSurah: 2,
      numberInQuran: 6081,
      juz: 30,
      arabicText: 'وَاللَّيْلِ إِذَا سَجَىٰ',
      transliteration: 'Wal-laili iżā sajā',
      translation: 'dan demi malam apabila telah sunyi,',
      audioUrl: formatAlafasyAudioUrl(93, 2),
      words: [
        { id: 1, arabic: 'وَاللَّيْلِ', transliteration: 'wal-lail', meaningId: 'dan demi malam' },
        { id: 2, arabic: 'إِذَا سَجَىٰ', transliteration: 'iżā sajā', meaningId: 'apabila telah sunyi' }
      ]
    },
    {
      surahNumber: 93,
      surahName: 'Ad-Duha',
      numberInSurah: 3,
      numberInQuran: 6082,
      juz: 30,
      arabicText: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ',
      transliteration: 'Mā wadda\'aka rabbuka wa mā qalā',
      translation: 'Tuhanmu tidak meninggalkan engkau (Muhammad) dan tidak (pula) membencimu,',
      audioUrl: formatAlafasyAudioUrl(93, 3),
      words: [
        { id: 1, arabic: 'مَا وَدَّعَكَ', transliteration: 'mā wadda\'aka', meaningId: 'tidak meninggalkanmu' },
        { id: 2, arabic: 'رَبُّكَ', transliteration: 'rabbuka', meaningId: 'Tuhanmu' },
        { id: 3, arabic: 'وَمَا قَلَىٰ', transliteration: 'wa mā qalā', meaningId: 'dan tidak membenci' }
      ]
    }
  ],

  // 94. Asy-Syarh (Ayat 1-4)
  94: [
    {
      surahNumber: 94,
      surahName: 'Asy-Syarh',
      numberInSurah: 1,
      numberInQuran: 6091,
      juz: 30,
      arabicText: 'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ',
      transliteration: 'Alam nasyraḥ laka ṣadrak(a)',
      translation: 'Bukankah Kami telah melapangkan dadamu (Muhammad)?',
      audioUrl: formatAlafasyAudioUrl(94, 1),
      words: [
        { id: 1, arabic: 'أَلَمْ نَشْرَحْ', transliteration: 'alam nasyraḥ', meaningId: 'bukankah Kami lapangkan' },
        { id: 2, arabic: 'لَكَ صَدْرَكَ', transliteration: 'laka ṣadraka', meaningId: 'bagimu dadamu' }
      ]
    },
    {
      surahNumber: 94,
      surahName: 'Asy-Syarh',
      numberInSurah: 5,
      numberInQuran: 6095,
      juz: 30,
      arabicText: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
      transliteration: 'Fa inna ma\'al-\'usri yusrā(n)',
      translation: 'Maka sesungguhnya beserta kesulitan ada kemudahan,',
      audioUrl: formatAlafasyAudioUrl(94, 5),
      words: [
        { id: 1, arabic: 'فَإِنَّ', transliteration: 'fa inna', meaningId: 'maka sesungguhnya' },
        { id: 2, arabic: 'مَعَ الْعُسْرِ', transliteration: 'ma\'al-\'usr', meaningId: 'bersama kesulitan' },
        { id: 3, arabic: 'يُسْرًا', transliteration: 'yusrā', meaningId: 'ada kemudahan' }
      ]
    },
    {
      surahNumber: 94,
      surahName: 'Asy-Syarh',
      numberInSurah: 6,
      numberInQuran: 6096,
      juz: 30,
      arabicText: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
      transliteration: 'Inna ma\'al-\'usri yusrā(n)',
      translation: 'sesungguhnya beserta kesulitan itu ada kemudahan.',
      audioUrl: formatAlafasyAudioUrl(94, 6),
      words: [
        { id: 1, arabic: 'إِنَّ مَعَ', transliteration: 'inna ma\'a', meaningId: 'sesungguhnya bersama' },
        { id: 2, arabic: 'الْعُسْرِ', transliteration: 'al-\'usr', meaningId: 'kesulitan' },
        { id: 3, arabic: 'يُسْرًا', transliteration: 'yusrā', meaningId: 'ada kemudahan' }
      ]
    }
  ],

  // 95. At-Tin (Ayat 1-4)
  95: [
    {
      surahNumber: 95,
      surahName: 'At-Tin',
      numberInSurah: 1,
      numberInQuran: 6099,
      juz: 30,
      arabicText: 'وَالتِّينِ وَالزَّيْتُونِ',
      transliteration: 'Wat-tīni waz-zaitūn(i)',
      translation: 'Demi (buah) Tin dan (buah) Zaitun,',
      audioUrl: formatAlafasyAudioUrl(95, 1),
      words: [
        { id: 1, arabic: 'وَالتِّينِ', transliteration: 'wat-tīn', meaningId: 'Demi buah Tin' },
        { id: 2, arabic: 'وَالزَّيْتُونِ', transliteration: 'waz-zaitūn', meaningId: 'dan buah Zaitun' }
      ]
    },
    {
      surahNumber: 95,
      surahName: 'At-Tin',
      numberInSurah: 4,
      numberInQuran: 6102,
      juz: 30,
      arabicText: 'لَقَدْ خَلَقْنَا الْإِنسَانَ فِي أَحْسَنِ تَقْوِيمٍ',
      transliteration: 'Laqad khalaqnal-insāna fī aḥsani taqwīm(in)',
      translation: 'Sungguh, Kami telah menciptakan manusia dalam bentuk yang sebaik-baiknya,',
      audioUrl: formatAlafasyAudioUrl(95, 4),
      words: [
        { id: 1, arabic: 'لَقَدْ خَلَقْنَا', transliteration: 'laqad khalaqnā', meaningId: 'sungguh Kami ciptakan' },
        { id: 2, arabic: 'الْإِنسَانَ', transliteration: 'al-insāna', meaningId: 'manusia' },
        { id: 3, arabic: 'فِي أَحْسَنِ تَقْوِيمٍ', transliteration: 'fī aḥsani taqwīm', meaningId: 'sebaik-baik bentuk' }
      ]
    }
  ],

  // 96. Al-'Alaq (Ayat 1-5)
  96: [
    {
      surahNumber: 96,
      surahName: 'Al-\'Alaq',
      numberInSurah: 1,
      numberInQuran: 6107,
      juz: 30,
      arabicText: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
      transliteration: 'Iqra\' bismi rabbikal-lażī khalaq(a)',
      translation: 'Bacalah dengan (menyebut) nama Tuhanmu yang menciptakan,',
      audioUrl: formatAlafasyAudioUrl(96, 1),
      words: [
        { id: 1, arabic: 'اقْرَأْ', transliteration: 'iqra\'', meaningId: 'Bacalah' },
        { id: 2, arabic: 'بِاسْمِ رَبِّكَ', transliteration: 'bismi rabbika', meaningId: 'dengan nama Tuhanmu' },
        { id: 3, arabic: 'الَّذِي خَلَقَ', transliteration: 'allażī khalaq', meaningId: 'Yang menciptakan' }
      ]
    },
    {
      surahNumber: 96,
      surahName: 'Al-\'Alaq',
      numberInSurah: 2,
      numberInQuran: 6108,
      juz: 30,
      arabicText: 'خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ',
      transliteration: 'Khalaqal-insāna min \'alaq(in)',
      translation: 'Dia telah menciptakan manusia dari segumpal darah.',
      audioUrl: formatAlafasyAudioUrl(96, 2),
      words: [
        { id: 1, arabic: 'خَلَقَ الْإِنسَانَ', transliteration: 'khalaqal-insāna', meaningId: 'menciptakan manusia' },
        { id: 2, arabic: 'مِنْ عَلَقٍ', transliteration: 'min \'alaq', meaningId: 'dari segumpal darah' }
      ]
    },
    {
      surahNumber: 96,
      surahName: 'Al-\'Alaq',
      numberInSurah: 3,
      numberInQuran: 6109,
      juz: 30,
      arabicText: 'اقْرَأْ وَرَبُّكَ الْأَكْرَمُ',
      transliteration: 'Iqra\' wa rabbukal-akram(u)',
      translation: 'Bacalah, dan Tuhanmulah Yang Mahamulia,',
      audioUrl: formatAlafasyAudioUrl(96, 3),
      words: [
        { id: 1, arabic: 'اقْرَأْ', transliteration: 'iqra\'', meaningId: 'Bacalah' },
        { id: 2, arabic: 'وَرَبُّكَ الْأَكْرَمُ', transliteration: 'wa rabbukal-akram', meaningId: 'dan Tuhanmu Mahamulia' }
      ]
    }
  ],

  // 97. Al-Qadr (Ayat 1-5)
  97: [
    {
      surahNumber: 97,
      surahName: 'Al-Qadr',
      numberInSurah: 1,
      numberInQuran: 6126,
      juz: 30,
      arabicText: 'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ',
      transliteration: 'Innā anzalnāhu fī lailatil-qadr(i)',
      translation: 'Sesungguhnya Kami telah menurunkannya (Al-Qur\'an) pada malam qadar.',
      audioUrl: formatAlafasyAudioUrl(97, 1),
      words: [
        { id: 1, arabic: 'إِنَّا أَنزَلْنَاهُ', transliteration: 'innā anzalnāh', meaningId: 'Sungguh Kami menurunkannya' },
        { id: 2, arabic: 'فِي لَيْلَةِ الْقَدْرِ', transliteration: 'fī lailatil-qadr', meaningId: 'pada malam kemuliaan' }
      ]
    },
    {
      surahNumber: 97,
      surahName: 'Al-Qadr',
      numberInSurah: 2,
      numberInQuran: 6127,
      juz: 30,
      arabicText: 'وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ',
      transliteration: 'Wa mā adrāka mā lailatul-qadr(i)',
      translation: 'Dan tahukah kamu apakah malam kemuliaan itu?',
      audioUrl: formatAlafasyAudioUrl(97, 2),
      words: [
        { id: 1, arabic: 'وَمَا أَدْرَاكَ', transliteration: 'wa mā adrāka', meaningId: 'dan tahukah kamu' },
        { id: 2, arabic: 'مَا لَيْلَةُ الْقَدْرِ', transliteration: 'mā lailatul-qadr', meaningId: 'apakah malam kemuliaan' }
      ]
    },
    {
      surahNumber: 97,
      surahName: 'Al-Qadr',
      numberInSurah: 3,
      numberInQuran: 6128,
      juz: 30,
      arabicText: 'لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ',
      transliteration: 'Lailatul-qadri khairum min alfi syahr(in)',
      translation: 'Malam kemuliaan itu lebih baik daripada seribu bulan.',
      audioUrl: formatAlafasyAudioUrl(97, 3),
      words: [
        { id: 1, arabic: 'لَيْلَةُ الْقَدْرِ', transliteration: 'lailatul-qadr', meaningId: 'Malam kemuliaan' },
        { id: 2, arabic: 'خَيْرٌ مِّنْ', transliteration: 'khairum min', meaningId: 'lebih baik dari' },
        { id: 3, arabic: 'أَلْفِ شَهْرٍ', transliteration: 'alfi syahr', meaningId: 'seribu bulan' }
      ]
    }
  ],

  // 109. Al-Kafirun (1-6)
  109: [
    {
      surahNumber: 109,
      surahName: 'Al-Kafirun',
      numberInSurah: 1,
      numberInQuran: 6208,
      juz: 30,
      arabicText: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ',
      transliteration: 'Qul yā ayyuhal-kāfirūn(a)',
      translation: 'Katakanlah (Muhammad), "Wahai orang-orang kafir!',
      audioUrl: formatAlafasyAudioUrl(109, 1),
      words: [
        { id: 1, arabic: 'قُلْ', transliteration: 'qul', meaningId: 'Katakanlah' },
        { id: 2, arabic: 'يَا أَيُّهَا', transliteration: 'yā ayyuhā', meaningId: 'Wahai' },
        { id: 3, arabic: 'الْكَافِرُونَ', transliteration: 'al-kāfirūn', meaningId: 'orang-orang kafir' }
      ]
    },
    {
      surahNumber: 109,
      surahName: 'Al-Kafirun',
      numberInSurah: 2,
      numberInQuran: 6209,
      juz: 30,
      arabicText: 'لَا أَعْبُدُ مَا تَعْبُدُونَ',
      transliteration: 'Lā a\'budu mā ta\'budūn(a)',
      translation: 'Aku tidak akan menyembah apa yang kamu sembah,',
      audioUrl: formatAlafasyAudioUrl(109, 2),
      words: [
        { id: 1, arabic: 'لَا أَعْبُدُ', transliteration: 'lā a\'budu', meaningId: 'aku tidak menyembah' },
        { id: 2, arabic: 'مَا تَعْبُدُونَ', transliteration: 'mā ta\'budūn', meaningId: 'apa yang kalian sembah' }
      ]
    },
    {
      surahNumber: 109,
      surahName: 'Al-Kafirun',
      numberInSurah: 6,
      numberInQuran: 6213,
      juz: 30,
      arabicText: 'لَكُمْ دِينُكُمْ وَلِيَ دِينِ',
      transliteration: 'Lakum dīnukum wa liya dīn(i)',
      translation: 'Untukmu agamamu, dan untukku agamaku."',
      audioUrl: formatAlafasyAudioUrl(109, 6),
      words: [
        { id: 1, arabic: 'لَكُمْ دِينُكُمْ', transliteration: 'lakum dīnukum', meaningId: 'untukmu agamamu' },
        { id: 2, arabic: 'وَلِيَ دِينِ', transliteration: 'wa liya dīn', meaningId: 'dan untukku agamaku' }
      ]
    }
  ],

  // 112. Al-Ikhlas (1-4)
  112: [
    {
      surahNumber: 112,
      surahName: 'Al-Ikhlas',
      numberInSurah: 1,
      numberInQuran: 6222,
      juz: 30,
      arabicText: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      transliteration: 'Qul huwallāhu aḥad(un)',
      translation: 'Katakanlah (Muhammad), "Dialah Allah, Yang Maha Esa.',
      audioUrl: formatAlafasyAudioUrl(112, 1),
      words: [
        { id: 1, arabic: 'قُلْ', transliteration: 'qul', meaningId: 'Katakanlah' },
        { id: 2, arabic: 'هُوَ اللَّهُ', transliteration: 'huwallāh', meaningId: 'Dialah Allah' },
        { id: 3, arabic: 'أَحَدٌ', transliteration: 'aḥad', meaningId: 'Yang Maha Esa' }
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
      words: [
        { id: 1, arabic: 'اللَّهُ', transliteration: 'Allāh', meaningId: 'Allah' },
        { id: 2, arabic: 'الصَّمَدُ', transliteration: 'aṣ-ṣamad', meaningId: 'Tempat Bergantung' }
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
      words: [
        { id: 1, arabic: 'لَمْ يَلِدْ', transliteration: 'lam yalid', meaningId: 'tidak beranak' },
        { id: 2, arabic: 'وَلَمْ يُولَدْ', transliteration: 'wa lam yūlad', meaningId: 'dan tidak diperanakkan' }
      ]
    },
    {
      surahNumber: 112,
      surahName: 'Al-Ikhlas',
      numberInSurah: 4,
      numberInQuran: 6225,
      juz: 30,
      arabicText: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
      transliteration: 'Wa lam yakul lahū kufuwan aḥad(un)',
      translation: 'dan tidak ada sesuatu yang setara dengan Dia."',
      audioUrl: formatAlafasyAudioUrl(112, 4),
      words: [
        { id: 1, arabic: 'وَلَمْ يَكُن لَّهُ', transliteration: 'wa lam yakul lahū', meaningId: 'dan tidak ada bagi-Nya' },
        { id: 2, arabic: 'كُفُوًا', transliteration: 'kufuwan', meaningId: 'yang setara' },
        { id: 3, arabic: 'أَحَدٌ', transliteration: 'aḥad', meaningId: 'seorangpun' }
      ]
    }
  ],

  // 113. Al-Falaq (1-5)
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
        { id: 3, arabic: 'بِرَبِّ الْفَلَقِ', transliteration: 'birabbil-falaq', meaningId: 'kepada Tuhan subuh' }
      ]
    },
    {
      surahNumber: 113,
      surahName: 'Al-Falaq',
      numberInSurah: 2,
      numberInQuran: 6227,
      juz: 30,
      arabicText: 'مِن شَرِّ مَا خَلَقَ',
      transliteration: 'Min syarri mā khalaq(a)',
      translation: 'dari kejahatan (makhluk yang) Dia ciptakan,',
      audioUrl: formatAlafasyAudioUrl(113, 2),
      words: [
        { id: 1, arabic: 'مِن شَرِّ', transliteration: 'min syarri', meaningId: 'dari kejahatan' },
        { id: 2, arabic: 'مَا خَلَقَ', transliteration: 'mā khalaq', meaningId: 'apa yang Dia ciptakan' }
      ]
    }
  ],

  // 114. An-Nas (1-6)
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
        { id: 3, arabic: 'بِرَبِّ النَّاسِ', transliteration: 'birabbin-nās', meaningId: 'kepada Tuhan manusia' }
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
    }
  ]
};

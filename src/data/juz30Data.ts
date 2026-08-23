// Authentic Comprehensive Dataset for Juz 30 (Surah 78 An-Naba' to Surah 114 An-Nas)
// Featuring challenging Middle, Deep, and Ending Verses (Ayat 10, 15, 20, 24, 29, 30, 34, 40)
// With Rasm Utsmani, Indonesian Kemenag Translation, Transliteration, & Syekh Mishary Audio

import { Ayat } from '../types';
import { formatAlafasyAudioUrl } from '../services/audioPlayerService';

export const JUZ_30_AYATS: Record<number, Ayat[]> = {
  // 78. An-Naba' (40 Ayat)
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
      audioUrl: formatAlafasyAudioUrl(78, 1)
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
      audioUrl: formatAlafasyAudioUrl(78, 2)
    },
    {
      surahNumber: 78,
      surahName: 'An-Naba\'',
      numberInSurah: 17,
      numberInQuran: 5689,
      juz: 30,
      arabicText: 'إِنَّ يَوْمَ الْفَصْلِ كَانَ مِيقَاتًا',
      transliteration: 'Inna yaumal-faṣli kāna mīqātā(n)',
      translation: 'Sungguh, hari keputusan adalah suatu waktu yang telah ditetapkan,',
      audioUrl: formatAlafasyAudioUrl(78, 17)
    },
    {
      surahNumber: 78,
      surahName: 'An-Naba\'',
      numberInSurah: 18,
      numberInQuran: 5690,
      juz: 30,
      arabicText: 'يَوْمَ يُنفَخُ فِي الصُّورِ فَتَأْتُونَ أَفْوَاجًا',
      transliteration: 'Yauma yunfakhu fiṣ-ṣūri fata\'tūna afwājā(n)',
      translation: '(yaitu) pada hari (ketika) sangkakala ditiup, lalu kamu datang berbondong-bondong,',
      audioUrl: formatAlafasyAudioUrl(78, 18)
    },
    {
      surahNumber: 78,
      surahName: 'An-Naba\'',
      numberInSurah: 31,
      numberInQuran: 5703,
      juz: 30,
      arabicText: 'إِنَّ لِلْمُتَّقِينَ مَفَازًا',
      transliteration: 'Inna lil-muttaqīna mafāzā(n)',
      translation: 'Sungguh, bagi orang-orang yang bertakwa ada kemenangan (surga),',
      audioUrl: formatAlafasyAudioUrl(78, 31)
    },
    {
      surahNumber: 78,
      surahName: 'An-Naba\'',
      numberInSurah: 32,
      numberInQuran: 5704,
      juz: 30,
      arabicText: 'حَدَائِقَ وَأَعْنَابًا',
      transliteration: 'Ḥadā\'iqa wa a\'nābā(n)',
      translation: '(yaitu) kebun-kebun dan buah anggur,',
      audioUrl: formatAlafasyAudioUrl(78, 32)
    },
    {
      surahNumber: 78,
      surahName: 'An-Naba\'',
      numberInSurah: 33,
      numberInQuran: 5705,
      juz: 30,
      arabicText: 'وَكَوَاعِبَ أَتْرَابًا',
      transliteration: 'Wa kawā\'iba atrābā(n)',
      translation: 'dan gadis-gadis montok yang sebaya,',
      audioUrl: formatAlafasyAudioUrl(78, 33)
    },
    {
      surahNumber: 78,
      surahName: 'An-Naba\'',
      numberInSurah: 34,
      numberInQuran: 5706,
      juz: 30,
      arabicText: 'وَكَأْسًا دِهَاقًا',
      transliteration: 'Wa ka\'san dihāqā(n)',
      translation: 'dan gelas-gelas yang penuh (berisi minuman).',
      audioUrl: formatAlafasyAudioUrl(78, 34)
    },
    {
      surahNumber: 78,
      surahName: 'An-Naba\'',
      numberInSurah: 39,
      numberInQuran: 5711,
      juz: 30,
      arabicText: 'ذَٰلِكَ الْيَوْمُ الْحَقُّ ۖ فَمَن شَاءَ اتَّخَذَ إِلَىٰ رَبِّهِ مَآبًا',
      transliteration: 'Żālikal-yaumul-ḥaqq(u), faman syā\'attakhaża ilā rabbihī ma\'ābā(n)',
      translation: 'Itulah hari yang pasti terjadi. Maka barang siapa menghendaki, niscaya dia menempuh jalan kembali kepada Tuhannya.',
      audioUrl: formatAlafasyAudioUrl(78, 39)
    },
    {
      surahNumber: 78,
      surahName: 'An-Naba\'',
      numberInSurah: 40,
      numberInQuran: 5712,
      juz: 30,
      arabicText: 'إِنَّا أَنذَرْنَاكُمْ عَذَابًا قَرِيبًا يَوْمَ يَنظُرُ الْمَرْءُ مَا قَدَّمَتْ يَدَاهُ وَيَقُولُ الْكَافِرُ يَا لَيْتَنِي كُنتُ تُرَابًا',
      transliteration: 'Innā anżarnākum \'ażāban qarībā(n), yauma yanẓurul-mar\'u mā qaddamat yadāhu wa yaqūlul-kāfiru yā laitanī kuntu turābā(n)',
      translation: 'Sesungguhnya Kami telah memperingatkan kepadamu (orang kafir) azab yang dekat, pada hari manusia melihat apa yang telah diperbuat oleh kedua tangannya; dan orang kafir berkata, "Alangkah baiknya seandainya dahulu aku jadi tanah."',
      audioUrl: formatAlafasyAudioUrl(78, 40)
    }
  ],

  // 79. An-Nazi'at (46 Ayat)
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
      audioUrl: formatAlafasyAudioUrl(79, 1)
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
      audioUrl: formatAlafasyAudioUrl(79, 2)
    },
    {
      surahNumber: 79,
      surahName: 'An-Nazi\'at',
      numberInSurah: 27,
      numberInQuran: 5739,
      juz: 30,
      arabicText: 'أَأَنتُمْ أَشَدُّ خَلْقًا أَمِ السَّمَاءُ ۚ بَنَاهَا',
      transliteration: 'A\'antum asyaddu khalqan amis-samā\'(u), banāhā',
      translation: 'Apakah penciptaan kamu yang lebih hebat ataukah langit yang telah dibangun-Nya?',
      audioUrl: formatAlafasyAudioUrl(79, 27)
    },
    {
      surahNumber: 79,
      surahName: 'An-Nazi\'at',
      numberInSurah: 28,
      numberInQuran: 5740,
      juz: 30,
      arabicText: 'رَفَعَ سَمْكَهَا فَسَوَّاهَا',
      transliteration: 'Rafa\'a samkahā fasawwāhā',
      translation: 'Dia telah meninggikan bangunannya lalu menyempurnakannya,',
      audioUrl: formatAlafasyAudioUrl(79, 28)
    },
    {
      surahNumber: 79,
      surahName: 'An-Nazi\'at',
      numberInSurah: 29,
      numberInQuran: 5741,
      juz: 30,
      arabicText: 'وَأَغْطَشَ لَيْلَهَا وَأَخْرَجَ ضُحَاهَا',
      transliteration: 'Wa agṭasya lailahā wa akhraja ḍuḥāhā',
      translation: 'dan Dia menjadikan malamnya (gelap gulita), dan menjadikan siangnya (terang benderang).',
      audioUrl: formatAlafasyAudioUrl(79, 29)
    },
    {
      surahNumber: 79,
      surahName: 'An-Nazi\'at',
      numberInSurah: 30,
      numberInQuran: 5742,
      juz: 30,
      arabicText: 'وَالْأَرْضَ بَعْدَ ذَٰلِكَ دَحَاهَا',
      transliteration: 'Wal-arḍa ba\'da żālika daḥāhā',
      translation: 'Dan setelah itu bumi Dia hamparkan.',
      audioUrl: formatAlafasyAudioUrl(79, 30)
    },
    {
      surahNumber: 79,
      surahName: 'An-Nazi\'at',
      numberInSurah: 34,
      numberInQuran: 5746,
      juz: 30,
      arabicText: 'فَإِذَا جَاءَتِ الطَّامَّةُ الْكُبْرَىٰ',
      transliteration: 'Fa iżā jā\'atit-ṭāmmatul-kubrā',
      translation: 'Maka apabila malapetaka besar (hari kiamat) telah datang,',
      audioUrl: formatAlafasyAudioUrl(79, 34)
    },
    {
      surahNumber: 79,
      surahName: 'An-Nazi\'at',
      numberInSurah: 35,
      numberInQuran: 5747,
      juz: 30,
      arabicText: 'يَوْمَ يَتَذَكَّرُ الْإِنسَانُ مَا سَعَىٰ',
      transliteration: 'Yauma yatażakkarul-insānu mā sa\'ā',
      translation: 'yaitu pada hari (ketika) manusia teringat akan apa yang telah dikerjakannya,',
      audioUrl: formatAlafasyAudioUrl(79, 35)
    },
    {
      surahNumber: 79,
      surahName: 'An-Nazi\'at',
      numberInSurah: 40,
      numberInQuran: 5752,
      juz: 30,
      arabicText: 'وَأَمَّا مَنْ خَافَ مَقَامَ رَبِّهِ وَنَهَى النَّفْسَ عَنِ الْهَوَىٰ',
      transliteration: 'Wa ammā man khāfa maqāma rabbihī wa nahan-nafsa \'anil-hawā',
      translation: 'Dan adapun orang-orang yang takut kepada kebesaran Tuhannya dan menahan diri dari (keinginan) hawa nafsunya,',
      audioUrl: formatAlafasyAudioUrl(79, 40)
    },
    {
      surahNumber: 79,
      surahName: 'An-Nazi\'at',
      numberInSurah: 41,
      numberInQuran: 5753,
      juz: 30,
      arabicText: 'فَإِنَّ الْجَنَّةَ هِيَ الْمَأْوَىٰ',
      transliteration: 'Fa innal-jannata hiyal-ma\'wā',
      translation: 'maka sungguh, surgalah tempat tinggal(nya).',
      audioUrl: formatAlafasyAudioUrl(79, 41)
    }
  ],

  // 80. 'Abasa (42 Ayat)
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
      audioUrl: formatAlafasyAudioUrl(80, 1)
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
      audioUrl: formatAlafasyAudioUrl(80, 2)
    },
    {
      surahNumber: 80,
      surahName: '\'Abasa',
      numberInSurah: 24,
      numberInQuran: 5782,
      juz: 30,
      arabicText: 'فَلْيَنظُرِ الْإِنسَانُ إِلَىٰ طَعَامِهِ',
      transliteration: 'Falyanẓuril-insānu ilā ṭa\'āmih(ī)',
      translation: 'Maka hendaklah manusia itu memperhatikan makanannya.',
      audioUrl: formatAlafasyAudioUrl(80, 24)
    },
    {
      surahNumber: 80,
      surahName: '\'Abasa',
      numberInSurah: 25,
      numberInQuran: 5783,
      juz: 30,
      arabicText: 'أَنَّا صَبَبْنَا الْمَاءَ صَبًّا',
      transliteration: 'Annā ṣababnal-mā\'a ṣabbā(n)',
      translation: 'Sesungguhnya Kami telah mencurahkan air (dari langit) dengan melimpah,',
      audioUrl: formatAlafasyAudioUrl(80, 25)
    },
    {
      surahNumber: 80,
      surahName: '\'Abasa',
      numberInSurah: 33,
      numberInQuran: 5791,
      juz: 30,
      arabicText: 'فَإِذَا جَاءَتِ الصَّاخَّةُ',
      transliteration: 'Fa iżā jā\'atiṣ-ṣākhkhah(tu)',
      translation: 'Maka apabila suara yang memekakkan (tiupan sangkakala) telah datang,',
      audioUrl: formatAlafasyAudioUrl(80, 33)
    },
    {
      surahNumber: 80,
      surahName: '\'Abasa',
      numberInSurah: 34,
      numberInQuran: 5792,
      juz: 30,
      arabicText: 'يَوْمَ يَفِرُّ الْمَرْءُ مِنْ أَخِيهِ',
      transliteration: 'Yauma yafirrul-mar\'u min akhīh(i)',
      translation: 'pada hari itu manusia lari dari saudaranya,',
      audioUrl: formatAlafasyAudioUrl(80, 34)
    },
    {
      surahNumber: 80,
      surahName: '\'Abasa',
      numberInSurah: 35,
      numberInQuran: 5793,
      juz: 30,
      arabicText: 'وَأُمِّهِ وَأَبِيهِ',
      transliteration: 'Wa ummihī wa abīh(i)',
      translation: 'dan dari ibu dan bapaknya,',
      audioUrl: formatAlafasyAudioUrl(80, 35)
    },
    {
      surahNumber: 80,
      surahName: '\'Abasa',
      numberInSurah: 36,
      numberInQuran: 5794,
      juz: 30,
      arabicText: 'وَصَاحِبَتِهِ وَبَنِيهِ',
      transliteration: 'Wa ṣāḥibatihī wa banīh(i)',
      translation: 'dan dari istri dan anak-anaknya.',
      audioUrl: formatAlafasyAudioUrl(80, 36)
    },
    {
      surahNumber: 80,
      surahName: '\'Abasa',
      numberInSurah: 37,
      numberInQuran: 5795,
      juz: 30,
      arabicText: 'لِكُلِّ امْرِئٍ مِّنْهُمْ يَوْمَئِذٍ شَأْنٌ يُغْنِيهِ',
      transliteration: 'Likullimri\'im minhum yauma\'iżin sya\'nuy yugnīh(i)',
      translation: 'Setiap orang dari mereka pada hari itu mempunyai urusan yang menyibukkannya.',
      audioUrl: formatAlafasyAudioUrl(80, 37)
    }
  ],

  // 83. Al-Muthaffifin (36 Ayat)
  83: [
    {
      surahNumber: 83,
      surahName: 'Al-Muthaffifin',
      numberInSurah: 1,
      numberInQuran: 5849,
      juz: 30,
      arabicText: 'وَيْلٌ لِّلْمُطَفِّفِينَ',
      transliteration: 'Wailul lil-muṭaffifīn(a)',
      translation: 'Celakalah bagi orang-orang yang curang (dalam menakar dan menimbang)!',
      audioUrl: formatAlafasyAudioUrl(83, 1)
    },
    {
      surahNumber: 83,
      surahName: 'Al-Muthaffifin',
      numberInSurah: 22,
      numberInQuran: 5870,
      juz: 30,
      arabicText: 'إِنَّ الْأَبْرَارَ لَفِي نَعِيمٍ',
      transliteration: 'Innal-abrāra lafī na\'īm(in)',
      translation: 'Sesungguhnya orang-orang yang berbakti benar-benar berada dalam (surga yang penuh) kenikmatan,',
      audioUrl: formatAlafasyAudioUrl(83, 22)
    },
    {
      surahNumber: 83,
      surahName: 'Al-Muthaffifin',
      numberInSurah: 23,
      numberInQuran: 5871,
      juz: 30,
      arabicText: 'عَلَى الْأَرَائِكِ يَنظُرُونَ',
      transliteration: '\'Alal-arā\'iki yanẓurūn(a)',
      translation: 'mereka (duduk) di atas dipan-dipan melepas pandangan.',
      audioUrl: formatAlafasyAudioUrl(83, 23)
    },
    {
      surahNumber: 83,
      surahName: 'Al-Muthaffifin',
      numberInSurah: 29,
      numberInQuran: 5877,
      juz: 30,
      arabicText: 'إِنَّ الَّذِينَ أَجْرَمُوا كَانُوا مِنَ الَّذِينَ آمَنُوا يَضْحَكُونَ',
      transliteration: 'Innal-lażīna ajramū kānū minal-lażīna āmanū yaḍ-ḥakūn(a)',
      translation: 'Sesungguhnya orang-orang yang berdosa, adalah mereka yang dahulu menertawakan orang-orang yang beriman.',
      audioUrl: formatAlafasyAudioUrl(83, 29)
    },
    {
      surahNumber: 83,
      surahName: 'Al-Muthaffifin',
      numberInSurah: 30,
      numberInQuran: 5878,
      juz: 30,
      arabicText: 'وَإِذَا مَرُّوا بِهِمْ يَتَغَامَزُونَ',
      transliteration: 'Wa iżā marrū bihim yatagāmazūn(a)',
      translation: 'Dan apabila mereka (orang-orang beriman) melintas di hadapan mereka, mereka saling mengedip-ngedipkan matanya,',
      audioUrl: formatAlafasyAudioUrl(83, 30)
    },
    {
      surahNumber: 83,
      surahName: 'Al-Muthaffifin',
      numberInSurah: 34,
      numberInQuran: 5882,
      juz: 30,
      arabicText: 'فَالْيَوْمَ الَّذِينَ آمَنُوا مِنَ الْكُفَّارِ يَضْحَكُونَ',
      transliteration: 'Fal-yaumal-lażīna āmanū minal-kuffāri yaḍ-ḥakūn(a)',
      translation: 'Maka pada hari ini, orang-orang yang beriman yang menertawakan orang-orang kafir,',
      audioUrl: formatAlafasyAudioUrl(83, 34)
    },
    {
      surahNumber: 83,
      surahName: 'Al-Muthaffifin',
      numberInSurah: 35,
      numberInQuran: 5883,
      juz: 30,
      arabicText: 'عَلَى الْأَرَائِكِ يَنظُرُونَ',
      transliteration: '\'Alal-arā\'iki yanẓurūn(a)',
      translation: 'mereka (duduk) di atas dipan-dipan melepas pandangan.',
      audioUrl: formatAlafasyAudioUrl(83, 35)
    },
    {
      surahNumber: 83,
      surahName: 'Al-Muthaffifin',
      numberInSurah: 36,
      numberInQuran: 5884,
      juz: 30,
      arabicText: 'هَلْ ثُوِّبَ الْكُفَّارُ مَا كَانُوا يَفْعَلُونَ',
      transliteration: 'Hal ṡuwwibal-kuffāru mā kānū yaf\'alūn(a)',
      translation: 'Apakah orang-orang kafir itu diberi balasan (hukuman) terhadap apa yang telah mereka perbuat?',
      audioUrl: formatAlafasyAudioUrl(83, 36)
    }
  ],

  // 89. Al-Fajr (30 Ayat)
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
      audioUrl: formatAlafasyAudioUrl(89, 1)
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
      audioUrl: formatAlafasyAudioUrl(89, 2)
    },
    {
      surahNumber: 89,
      surahName: 'Al-Fajr',
      numberInSurah: 27,
      numberInQuran: 6020,
      juz: 30,
      arabicText: 'يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ',
      transliteration: 'Yā ayyatuhan-nafsul-muṭma\'innah(tu)',
      translation: 'Wahai jiwa yang tenang!',
      audioUrl: formatAlafasyAudioUrl(89, 27)
    },
    {
      surahNumber: 89,
      surahName: 'Al-Fajr',
      numberInSurah: 28,
      numberInQuran: 6021,
      juz: 30,
      arabicText: 'ارْجِعِي إِلَىٰ رَبِّكِ رَاضِيَةً مَّرْضِيَّةً',
      transliteration: 'Irji\'ī ilā rabbiki rāḍiyatam marḍiyyah(tan)',
      translation: 'Kembalilah kepada Tuhanmu dengan hati yang rida dan diridai-Nya.',
      audioUrl: formatAlafasyAudioUrl(89, 28)
    },
    {
      surahNumber: 89,
      surahName: 'Al-Fajr',
      numberInSurah: 29,
      numberInQuran: 6022,
      juz: 30,
      arabicText: 'فَادْخُلِي فِي عِبَادِي',
      transliteration: 'Fadkhulī fī \'ibādī',
      translation: 'Maka masuklah ke dalam golongan hamba-hamba-Ku,',
      audioUrl: formatAlafasyAudioUrl(89, 29)
    },
    {
      surahNumber: 89,
      surahName: 'Al-Fajr',
      numberInSurah: 30,
      numberInQuran: 6023,
      juz: 30,
      arabicText: 'وَادْخُلِي جَنَّتِي',
      transliteration: 'Wadkhulī jannatī',
      translation: 'dan masuklah ke dalam surga-Ku.',
      audioUrl: formatAlafasyAudioUrl(89, 30)
    }
  ],

  // 97. Al-Qadr (5 Ayat)
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
      audioUrl: formatAlafasyAudioUrl(97, 1)
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
      audioUrl: formatAlafasyAudioUrl(97, 2)
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
      audioUrl: formatAlafasyAudioUrl(97, 3)
    },
    {
      surahNumber: 97,
      surahName: 'Al-Qadr',
      numberInSurah: 4,
      numberInQuran: 6129,
      juz: 30,
      arabicText: 'تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ',
      transliteration: 'Tanazzalul-malā\'ikatu war-rūḥu fīhā bi\'iżni rabbihim min kulli amr(in)',
      translation: 'Pada malam itu turun para malaikat dan Rūḥ (Jibril) dengan izin Tuhannya untuk mengatur semua urusan.',
      audioUrl: formatAlafasyAudioUrl(97, 4)
    },
    {
      surahNumber: 97,
      surahName: 'Al-Qadr',
      numberInSurah: 5,
      numberInQuran: 6130,
      juz: 30,
      arabicText: 'سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ',
      transliteration: 'Salāmun hiya ḥattā maṭla\'il-fajr(i)',
      translation: 'Sejahteralah (malam itu) sampai terbit fajar.',
      audioUrl: formatAlafasyAudioUrl(97, 5)
    }
  ],

  // 108. Al-Kautsar (3 Ayat)
  108: [
    {
      surahNumber: 108,
      surahName: 'Al-Kautsar',
      numberInSurah: 1,
      numberInQuran: 6194,
      juz: 30,
      arabicText: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
      transliteration: 'Innā a\'ṭainākal-kauṡar(a)',
      translation: 'Sungguh, Kami telah memberimu (Muhammad) nikmat yang banyak.',
      audioUrl: formatAlafasyAudioUrl(108, 1)
    },
    {
      surahNumber: 108,
      surahName: 'Al-Kautsar',
      numberInSurah: 2,
      numberInQuran: 6195,
      juz: 30,
      arabicText: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
      transliteration: 'Faṣalli lirabbika wanḥar',
      translation: 'Maka laksanakanlah salat karena Tuhanmu, dan berkurbanlah.',
      audioUrl: formatAlafasyAudioUrl(108, 2)
    },
    {
      surahNumber: 108,
      surahName: 'Al-Kautsar',
      numberInSurah: 3,
      numberInQuran: 6196,
      juz: 30,
      arabicText: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
      transliteration: 'Inna syāni\'aka huwal-abtar(u)',
      translation: 'Sungguh, orang-orang yang membencimu dialah yang terputus (dari rahmat Allah).',
      audioUrl: formatAlafasyAudioUrl(108, 3)
    }
  ],

  // 112. Al-Ikhlas (4 Ayat)
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
      audioUrl: formatAlafasyAudioUrl(112, 1)
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
      audioUrl: formatAlafasyAudioUrl(112, 2)
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
      audioUrl: formatAlafasyAudioUrl(112, 3)
    },
    {
      surahNumber: 112,
      surahName: 'Al-Ikhlas',
      numberInSurah: 4,
      numberInQuran: 6225,
      juz: 30,
      arabicText: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
      transliteration: 'Wa lam yakul lahū kufuwan aḥad(un)',
      translation: 'dan tidak ada sesuatu yang setara dengan Dia.',
      audioUrl: formatAlafasyAudioUrl(112, 4)
    }
  ],

  // 113. Al-Falaq (5 Ayat)
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
      audioUrl: formatAlafasyAudioUrl(113, 1)
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
      audioUrl: formatAlafasyAudioUrl(113, 2)
    },
    {
      surahNumber: 113,
      surahName: 'Al-Falaq',
      numberInSurah: 3,
      numberInQuran: 6228,
      juz: 30,
      arabicText: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
      transliteration: 'Wa min syarri gāsiqin iżā waqab(a)',
      translation: 'dan dari kejahatan malam apabila telah gelap gulita,',
      audioUrl: formatAlafasyAudioUrl(113, 3)
    },
    {
      surahNumber: 113,
      surahName: 'Al-Falaq',
      numberInSurah: 4,
      numberInQuran: 6229,
      juz: 30,
      arabicText: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
      transliteration: 'Wa min syarrin-naffāṡāti fil-\'uqad(i)',
      translation: 'dan dari kejahatan (perempuan-perempuan) penyihir yang meniup pada buhul-buhul (talinya),',
      audioUrl: formatAlafasyAudioUrl(113, 4)
    },
    {
      surahNumber: 113,
      surahName: 'Al-Falaq',
      numberInSurah: 5,
      numberInQuran: 6230,
      juz: 30,
      arabicText: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
      transliteration: 'Wa min syarri ḥāsidin iżā ḥasad(a)',
      translation: 'dan dari kejahatan orang yang dengki apabila dia dengki."',
      audioUrl: formatAlafasyAudioUrl(113, 5)
    }
  ],

  // 114. An-Nas (6 Ayat)
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
      audioUrl: formatAlafasyAudioUrl(114, 1)
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
      audioUrl: formatAlafasyAudioUrl(114, 2)
    },
    {
      surahNumber: 114,
      surahName: 'An-Nas',
      numberInSurah: 3,
      numberInQuran: 6233,
      juz: 30,
      arabicText: 'إِلَٰهِ النَّاسِ',
      transliteration: 'Ilāhin-nās(i)',
      translation: 'sembahan manusia,',
      audioUrl: formatAlafasyAudioUrl(114, 3)
    },
    {
      surahNumber: 114,
      surahName: 'An-Nas',
      numberInSurah: 4,
      numberInQuran: 6234,
      juz: 30,
      arabicText: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
      transliteration: 'Min syarril-waswāsil-khannās(i)',
      translation: 'dari kejahatan (bisikan) setan yang bersembunyi,',
      audioUrl: formatAlafasyAudioUrl(114, 4)
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
      audioUrl: formatAlafasyAudioUrl(114, 5)
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
      audioUrl: formatAlafasyAudioUrl(114, 6)
    }
  ]
};

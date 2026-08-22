export interface DzikirItem {
  id: number;
  arabic: string;
  transliteration: string;
  translation: string;
  repeatCount: number;
  note: string;
}

export const DOA_SETELAH_ADZAN = {
  title: 'Doa Setelah Adzan',
  arabic: 'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
  transliteration: 'Allāhumma rabba hāżihid-da\'watit-tāmmah, waṣ-ṣalātil-qā\'imah, āti Muḥammadanil-wasīlata wal-faḍīlah, wab\'aṡhu maqāmam maḥmūdanil-lażī wa\'adtah.',
  translation: 'Ya Allah, Tuhan Pemilik panggilan yang sempurna ini dan shalat yang senantiasa didirikan, berikanlah kepada Nabi Muhammad wasilah (kedudukan tinggi) dan keutamaan, serta bangkitkanlah beliau pada tempat terpuji yang telah Engkau janjikan.'
};

export const DZIKIR_PAGI_PETANG: DzikirItem[] = [
  {
    id: 1,
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subḥānallāhi wa biḥamdih',
    translation: 'Mahasuci Allah dan segala puji bagi-Nya.',
    repeatCount: 100,
    note: 'Dihapuskan dosa-dosanya walaupun sebanyak buih di lautan (HR. Bukhari & Muslim).'
  },
  {
    id: 2,
    arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullāha wa atūbu ilayh',
    translation: 'Aku memohon ampunan kepada Allah dan bertaubat kepada-Nya.',
    repeatCount: 100,
    note: 'Menghilangkan kesempitan hidup dan mendatangkan rezeki dari arah tak disangka-sangka.'
  },
  {
    id: 3,
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa \'alā kulli syai\'in qadīr',
    translation: 'Tiada sesembahan yang berhak disembah selain Allah semata, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya segala puji dan Dia Mahakuasa atas segala sesuatu.',
    repeatCount: 10,
    note: 'Perisai dari godaan setan sepanjang hari sampai sore hari.'
  },
  {
    id: 4,
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    transliteration: 'Allāhumma bika aṣbaḥnā, wa bika amsaynā, wa bika naḥyā, wa bika namūtu, wa ilaykan-nusyūr',
    translation: 'Ya Allah, dengan rahmat-Mu kami memasuki waktu pagi, dengan rahmat-Mu kami memasuki waktu petang, dengan rahmat-Mu kami hidup, dengan rahmat-Mu kami mati, dan kepada-Mulah tempat kebangkitan.',
    repeatCount: 1,
    note: 'Doa pembuka pagi hari sunnah Rasulullah SAW.'
  }
];

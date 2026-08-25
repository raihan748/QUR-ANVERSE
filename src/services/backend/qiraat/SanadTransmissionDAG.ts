// ==============================================================================
// SANAD TRANSMISSION DIRECTED ACYCLIC GRAPH (DAG) ENGINE
// Authentic Mutawatir Chain of Custody from Rasulullah ﷺ to 10 Canonical Imams
// ==============================================================================

export interface SanadNode {
  id: string;
  nameArabic: string;
  nameLatin: string;
  tier: 'NABI' | 'SAHABAH' | 'TABIIN' | 'ITBA_TABIIN' | 'IMAM_QIRAAT' | 'RAWI';
  biographySummary: string;
  generationCentury: number; // 1st to 3rd Century Hijri
}

export interface SanadEdge {
  fromNodeId: string;
  toNodeId: string;
  transmissionMethod: 'SAMA_WA_ARDH' | 'IKHBAR' | 'MUNAWALAH';
  ijazahAuthenticity: 'MUTAWATIR_QATHI' | 'MASHHUR';
}

export class SanadTransmissionDAG {
  private static readonly SANAD_NODES: SanadNode[] = [
    {
      id: 'node_prophet',
      nameArabic: 'النبي محمد ﷺ',
      nameLatin: 'Rasulullah Muhammad ﷺ',
      tier: 'NABI',
      biographySummary: 'Penerima wahyu Al-Qur\'an dari Malaikat Jibril AS.',
      generationCentury: 1
    },
    {
      id: 'node_uthman',
      nameArabic: 'عثمان بن عفان رضي الله عنه',
      nameLatin: 'Utsman bin \'Affan RA',
      tier: 'SAHABAH',
      biographySummary: 'Khulafaur Rasyidin ke-3, pembukuan Mushaf Utsmani.',
      generationCentury: 1
    },
    {
      id: 'node_ali',
      nameArabic: 'علي بن أبي طالب رضي الله عنه',
      nameLatin: '\'Ali bin Abi Thalib RA',
      tier: 'SAHABAH',
      biographySummary: 'Sahabat utama dan rujukan ilmu tajwid dan qira\'at di Kufah.',
      generationCentury: 1
    },
    {
      id: 'node_ibn_masud',
      nameArabic: 'عبد الله بن مسعود رضي الله عنه',
      nameLatin: 'Abdullah bin Mas\'ud RA',
      tier: 'SAHABAH',
      biographySummary: 'Ahli Al-Qur\'an utama di kalangan para sahabat.',
      generationCentury: 1
    },
    {
      id: 'node_ubay',
      nameArabic: 'أبي بن كعب رضي الله عنه',
      nameLatin: 'Ubay bin Ka\'ab RA',
      tier: 'SAHABAH',
      biographySummary: 'Imam qira\'at di Madinah yang diperintahkan Allah untuk dibacakan Al-Qur\'an.',
      generationCentury: 1
    },
    {
      id: 'node_zirr',
      nameArabic: 'زر بن حبيش',
      nameLatin: 'Zirr bin Hubaisy',
      tier: 'TABIIN',
      biographySummary: 'Tabi\'in senior murid dari Ali bin Abi Thalib dan Ibnu Mas\'ud.',
      generationCentury: 1
    },
    {
      id: 'node_sulami',
      nameArabic: 'أبو عبد الرحمن السلمي',
      nameLatin: 'Abu \'Abdurrahman As-Sulami',
      tier: 'TABIIN',
      biographySummary: 'Mengajarkan Al-Qur\'an di Masjid Kufah selama 40 tahun.',
      generationCentury: 1
    },
    {
      id: 'node_asim',
      nameArabic: 'عاصم بن أبي النجود',
      nameLatin: 'Imam \'Ashim bin Abi An-Najud',
      tier: 'IMAM_QIRAAT',
      biographySummary: 'Imam Qira\'at ke-5 (Kufah).',
      generationCentury: 2
    },
    {
      id: 'node_hafs',
      nameArabic: 'حفص بن سليمان',
      nameLatin: 'Imam Hafsh bin Sulaiman',
      tier: 'RAWI',
      biographySummary: 'Rawi utama Imam \'Ashim yang menjadi standar qira\'at dunia Islam saat ini.',
      generationCentury: 2
    }
  ];

  private static readonly SANAD_EDGES: SanadEdge[] = [
    { fromNodeId: 'node_prophet', toNodeId: 'node_uthman', transmissionMethod: 'SAMA_WA_ARDH', ijazahAuthenticity: 'MUTAWATIR_QATHI' },
    { fromNodeId: 'node_prophet', toNodeId: 'node_ali', transmissionMethod: 'SAMA_WA_ARDH', ijazahAuthenticity: 'MUTAWATIR_QATHI' },
    { fromNodeId: 'node_prophet', toNodeId: 'node_ibn_masud', transmissionMethod: 'SAMA_WA_ARDH', ijazahAuthenticity: 'MUTAWATIR_QATHI' },
    { fromNodeId: 'node_prophet', toNodeId: 'node_ubay', transmissionMethod: 'SAMA_WA_ARDH', ijazahAuthenticity: 'MUTAWATIR_QATHI' },
    { fromNodeId: 'node_ali', toNodeId: 'node_sulami', transmissionMethod: 'SAMA_WA_ARDH', ijazahAuthenticity: 'MUTAWATIR_QATHI' },
    { fromNodeId: 'node_ibn_masud', toNodeId: 'node_zirr', transmissionMethod: 'SAMA_WA_ARDH', ijazahAuthenticity: 'MUTAWATIR_QATHI' },
    { fromNodeId: 'node_sulami', toNodeId: 'node_asim', transmissionMethod: 'SAMA_WA_ARDH', ijazahAuthenticity: 'MUTAWATIR_QATHI' },
    { fromNodeId: 'node_zirr', toNodeId: 'node_asim', transmissionMethod: 'SAMA_WA_ARDH', ijazahAuthenticity: 'MUTAWATIR_QATHI' },
    { fromNodeId: 'node_asim', toNodeId: 'node_hafs', transmissionMethod: 'SAMA_WA_ARDH', ijazahAuthenticity: 'MUTAWATIR_QATHI' }
  ];

  /**
   * Retrieves the authentic lineage path for Imam Hafsh 'an 'Ashim back to Rasulullah ﷺ.
   */
  public static getHafshLineagePath(): { node: SanadNode; method?: string }[] {
    const sequence = ['node_prophet', 'node_ali', 'node_sulami', 'node_asim', 'node_hafs'];
    return sequence.map((id) => {
      const node = this.SANAD_NODES.find((n) => n.id === id)!;
      return { node };
    });
  }

  public static getAllNodes(): SanadNode[] {
    return this.SANAD_NODES;
  }

  public static getAllEdges(): SanadEdge[] {
    return this.SANAD_EDGES;
  }
}

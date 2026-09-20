import React, { useState, useMemo } from 'react';
import { 
  ScrollText, 
  Search, 
  BookOpen, 
  Mic, 
  Clock, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Filter, 
  ChevronRight,
  History,
  BookMarked,
  X
} from 'lucide-react';
import { 
  ChronologicalWahyuEngine, 
  RevelationEra, 
  AsbabunNuzulRecord 
} from '../../services/backend/research/ChronologicalWahyuEngine';
import { SURAH_LIST } from '../../data/quranData';
import { useLanguage } from '../../context/LanguageContext';

interface AsbabunNuzulViewProps {
  onNavigateToMushaf?: (surahNumber: number, ayahNumber?: number) => void;
  onNavigateToMurojaah?: (surahNumber: number, ayahNumber?: number) => void;
}

interface EraDefinition {
  id: RevelationEra | 'ALL';
  nameId: string;
  nameAr: string;
  period: string;
  location: 'Makkah' | 'Madinah' | 'Semua';
  badgeColor: string;
  description: string;
}

const ERAS: EraDefinition[] = [
  {
    id: 'ALL',
    nameId: 'Semua Era',
    nameAr: 'جميع العصور',
    period: '610 - 632 M (23 Tahun)',
    location: 'Semua',
    badgeColor: 'bg-gray-100 text-gray-800 border-gray-400',
    description: 'Seluruh linimasa 23 tahun turunnya Al-Qur\'an dari Gua Hira hingga Haji Wada\'.'
  },
  {
    id: 'EARLY_MAKKAH',
    nameId: 'Awal Kenabian (Sirriyah)',
    nameAr: 'أوائل مكة (الدعوة السرية)',
    period: 'Tahun 1-3 Bi\'tsah (610-613 M)',
    location: 'Makkah',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-500',
    description: 'Fase dakwah sembunyi-sembunyi di Rumah Al-Arqam. Wahyu berfokus pada Tauhid murni, Hari Akhir, dan pembersihan jiwa.'
  },
  {
    id: 'MID_MAKKAH',
    nameId: 'Pertengahan Makkah (Jahriyyah)',
    nameAr: 'أواسط مكة (الجهر بالدعوة)',
    period: 'Tahun 4-10 Bi\'tsah (613-620 M)',
    location: 'Makkah',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-500',
    description: 'Fase dakwah terang-terangan di Bukit Shafa, boikot ekonomi Quraisy, dan ujian berat para sahabat seperti Bilal dan Sumayyah.'
  },
  {
    id: 'LATE_MAKKAH',
    nameId: 'Akhir Makkah (Pra-Hijrah)',
    nameAr: 'أواخر مكة (ما قبل الهجرة)',
    period: 'Tahun 10-13 Bi\'tsah (620-622 M)',
    location: 'Makkah',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-500',
    description: '\'Amul Huzni (Tahun Kesedihan), peristiwa agung Isra\' Mi\'raj, perintah shalat 5 waktu, dan persiapan Bai\'at \'Aqabah.'
  },
  {
    id: 'EARLY_MADINAH',
    nameId: 'Awal Madinah (Fondasi)',
    nameAr: 'أوائل المدينة (بناء الدولة)',
    period: 'Tahun 1-3 H (622-625 M)',
    location: 'Madinah',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-500',
    description: 'Pembangunan Masjid Nabawi, Piagam Madinah, persaudaraan Muhajirin-Anshar, pengalihan kiblat, dan Perang Badar.'
  },
  {
    id: 'MID_MADINAH',
    nameId: 'Pertengahan Madinah (Ujian)',
    nameAr: 'أواسط المدينة (المواجهة والتشريع)',
    period: 'Tahun 4-8 H (625-630 M)',
    location: 'Madinah',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-500',
    description: 'Perang Uhud, Perang Khandaq (Ahzab), Perjanjian Hudaibiyyah, serta penurunan hukum-hukum muamalah, hijab, dan waris.'
  },
  {
    id: 'LATE_MADINAH',
    nameId: 'Akhir Madinah (Penyempurnaan)',
    nameAr: 'أواخر المدينة (الفتح والكمال)',
    period: 'Tahun 8-10 H (630-632 M)',
    location: 'Madinah',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-500',
    description: 'Fathu Makkah (Pembebasan Makkah), Haji Wada\', dan turunnya ayat penyempurnaan syariat Islam (Al-Ma\'idah: 3).'
  }
];

export const AsbabunNuzulView: React.FC<AsbabunNuzulViewProps> = ({
  onNavigateToMushaf,
  onNavigateToMurojaah
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEra, setSelectedEra] = useState<RevelationEra | 'ALL'>('ALL');
  const [activeViewTab, setActiveViewTab] = useState<'asbab' | 'chronology'>('asbab');

  // Authentic Asbab records
  const allAsbabRecords = useMemo(() => ChronologicalWahyuEngine.getAllAsbabRecords(), []);

  // Filtered Asbab records
  const filteredAsbab = useMemo(() => {
    return allAsbabRecords.filter((rec) => {
      const matchesEra = selectedEra === 'ALL' || rec.historicalEra === selectedEra;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesEra;

      const surahMeta = SURAH_LIST.find((s) => s.number === rec.surahNumber);
      const matchesSurah = 
        surahMeta?.latinName.toLowerCase().includes(q) ||
        surahMeta?.name.includes(q) ||
        String(rec.surahNumber) === q;

      const matchesContent =
        rec.title.toLowerCase().includes(q) ||
        rec.sababSummary.toLowerCase().includes(q) ||
        rec.sanadNarrator.toLowerCase().includes(q);

      return matchesEra && (matchesSurah || matchesContent);
    });
  }, [allAsbabRecords, selectedEra, searchQuery]);

  // Chronological 114 Surahs Sequence
  const chronologicalSurahs = useMemo(() => {
    const sequence = ChronologicalWahyuEngine.getChronologicalSequence();
    return sequence.map((item) => {
      const meta = SURAH_LIST.find((s) => s.number === item.surahNumber) || SURAH_LIST[0];
      const era = ChronologicalWahyuEngine.getEraForChronologicalOrder(item.order);
      const asbabCount = ChronologicalWahyuEngine.getAsbabunNuzul(item.surahNumber).length;
      return {
        order: item.order,
        meta,
        era,
        asbabCount
      };
    }).filter((item) => {
      const matchesEra = selectedEra === 'ALL' || item.era === selectedEra;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesEra;
      return (
        matchesEra &&
        (item.meta.latinName.toLowerCase().includes(q) ||
          item.meta.name.includes(q) ||
          String(item.meta.number) === q ||
          String(item.order) === q)
      );
    });
  }, [selectedEra, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Hero Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-[#0B4627] dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800 rounded-xl text-xs font-semibold">
              <ScrollText className="w-4 h-4" />
              <span>{language === 'ar' ? 'أسباب النزول وتاريخ الوحي' : 'ASBABUN NUZUL & HISTORI WAHYU'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              {language === 'ar'
                ? 'سياق نزول الآيات وتاريخ الرسالة المحمدية'
                : 'Menyelami Konteks Historis & Sebab Turunnya Ayat'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Memahami Al-Qur'an secara utuh dari sudut pandang sejarah nuzul wahyu (610-632 M). 
              Diperkaya riwayat shahih dari <strong className="text-slate-900 dark:text-white font-semibold">Shahih Al-Bukhari</strong>,{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">Shahih Muslim</strong>, dan ensiklopedia <strong className="text-slate-900 dark:text-white font-semibold">Lubabun Nuqul</strong> karya Al-Hafizh As-Suyuthi.
            </p>
          </div>

          {/* Stat Badges */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0 font-mono">
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl p-3 text-center">
              <span className="text-2xl font-bold text-slate-900 dark:text-white block">114</span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Surah Tertib Nuzul</span>
            </div>
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl p-3 text-center">
              <span className="text-2xl font-bold text-[#0B4627] dark:text-emerald-400 block">6</span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Era Kenabian</span>
            </div>
          </div>
        </div>

        {/* View Mode Toggle: Riwayat Asbabun Nuzul vs Tertib Kronologis Nuzul */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/80 dark:border-slate-700 rounded-xl gap-1">
            <button
              onClick={() => setActiveViewTab('asbab')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeViewTab === 'asbab'
                  ? 'bg-[#0B4627] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ScrollText className="w-4 h-4" />
              <span>{language === 'ar' ? 'أسباب النزول الصحيحة' : 'Katalog Asbabun Nuzul'}</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                {allAsbabRecords.length}
              </span>
            </button>
            <button
              onClick={() => setActiveViewTab('chronology')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeViewTab === 'chronology'
                  ? 'bg-[#0B4627] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{language === 'ar' ? 'الترتيب الزمني لنزول السور' : '114 Kronologi Nuzul Wahyu'}</span>
              <span className="bg-white text-slate-900 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold border border-slate-200">
                114
              </span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari surah, peristiwa, atau perawi hadits..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
                aria-label="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 6 Prophetic Eras Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#0B4627] dark:text-emerald-400" />
            Pilih Era Kenabian (Tahun Wahyu):
          </span>
          {selectedEra !== 'ALL' && (
            <button
              onClick={() => setSelectedEra('ALL')}
              className="text-[11px] font-medium text-[#0B4627] dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Reset ke Semua Era
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {ERAS.map((era) => {
            const isSelected = selectedEra === era.id;
            return (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0B4627] text-white border-[#0B4627] shadow-xs'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border inline-block mb-1 ${
                    isSelected ? 'bg-amber-400 text-slate-950 border-amber-500' : `${era.badgeColor} border-slate-200`
                  }`}>
                    {era.location}
                  </span>
                  <p className="text-xs font-semibold leading-tight truncate">{era.nameId}</p>
                </div>
                <p className={`text-[9px] mt-1 truncate ${
                  isSelected ? 'text-emerald-200' : 'text-slate-400'
                }`}>
                  {era.period}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content: Asbabun Nuzul Cards */}
      {activeViewTab === 'asbab' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-500">
              Menampilkan <strong className="text-slate-900 dark:text-white">{filteredAsbab.length}</strong> riwayat Asbabun Nuzul
            </span>
          </div>

          {filteredAsbab.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-10 text-center shadow-xs space-y-3">
              <ScrollText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tidak ada riwayat yang cocok</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Coba ubah kata kunci pencarian atau pilih era kenabian lainnya.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedEra('ALL');
                }}
                className="px-4 py-2 bg-[#0B4627] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
              >
                Tampilkan Semua Riwayat
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAsbab.map((rec, idx) => {
                const surahMeta = SURAH_LIST.find((s) => s.number === rec.surahNumber) || SURAH_LIST[0];
                const eraInfo = ERAS.find((e) => e.id === rec.historicalEra);
                const nuzulOrder = ChronologicalWahyuEngine.getChronologicalOrderOfSurah(rec.surahNumber);

                return (
                  <div
                    key={`${rec.surahNumber}-${rec.ayahStart}-${idx}`}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all"
                  >
                    <div className="space-y-3">
                      {/* Card Header: Surah & Badges */}
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[#0B4627] dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800 text-[11px] font-bold flex items-center justify-center font-mono">
                              {surahMeta.number}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              QS. {surahMeta.latinName} : {rec.ayahStart}{rec.ayahEnd !== rec.ayahStart ? `-${rec.ayahEnd}` : ''}
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {surahMeta.meaning} • Wahyu Ke-{nuzulOrder}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="font-quran text-lg font-bold text-[#0B4627] dark:text-emerald-400 block">
                            {surahMeta.name}
                          </span>
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border inline-block mt-0.5 ${
                            eraInfo?.badgeColor ? `${eraInfo.badgeColor} border-slate-200` : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {eraInfo?.nameId.split(' ')[0] || rec.historicalEra}
                          </span>
                        </div>
                      </div>

                      {/* Event Title */}
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-[#0B4627] dark:text-emerald-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          {rec.title}
                        </h4>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-3">
                          "{rec.sababSummary}"
                        </p>
                      </div>

                      {/* Sanad / Narrator Box */}
                      <div className="bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-2.5 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-semibold text-slate-900 dark:text-white block">Riwayat & Takhrij Sanad:</span>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            {rec.sanadNarrator}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onNavigateToMushaf && onNavigateToMushaf(rec.surahNumber, rec.ayahStart)}
                        className="flex-1 py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#0B4627] dark:text-emerald-400" />
                        <span>Buka di Mushaf</span>
                      </button>

                      <button
                        onClick={() => onNavigateToMurojaah && onNavigateToMurojaah(rec.surahNumber, rec.ayahStart)}
                        className="flex-1 py-2 px-3 bg-[#0B4627] hover:bg-[#07331b] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
                      >
                        <Mic className="w-3.5 h-3.5 text-amber-300" />
                        <span>Uji Muroja'ah</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: 114 Chronological Wahyu Sequence */}
      {activeViewTab === 'chronology' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-500">
              Urutan Penurunan 114 Surah (Berdasarkan Riwayat Al-Hafizh As-Suyuthi dalam <em>Al-Itqan fi Ulumil Qur'an</em>)
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {chronologicalSurahs.map((item) => {
                const eraInfo = ERAS.find((e) => e.id === item.era);
                return (
                  <div
                    key={item.order}
                    className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex items-center justify-between gap-2 hover:border-emerald-300 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#0B4627] text-amber-300 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[7px] font-bold uppercase leading-none">WAHYU</span>
                        <span className="text-xs font-bold font-mono leading-none">#{item.order}</span>
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {item.meta.latinName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Surah #{item.meta.number} • {item.meta.ayahCount} Ayat
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded border block mb-1 ${
                        eraInfo?.badgeColor ? `${eraInfo.badgeColor} border-slate-200` : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {item.meta.revelationPlace}
                      </span>
                      <button
                        onClick={() => onNavigateToMushaf && onNavigateToMushaf(item.meta.number)}
                        className="text-[10px] font-semibold text-[#0B4627] dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        Buka <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

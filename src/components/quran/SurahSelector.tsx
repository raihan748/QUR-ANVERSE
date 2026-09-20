import React, { useState, useMemo } from 'react';
import { Search, Book, Layers, Sparkles, Headphones, ChevronDown, Check, Clock, X } from 'lucide-react';
import { SURAH_LIST, JUZ_MAP, getSurahsInJuz } from '../../data/quranData';
import { SurahMeta } from '../../types';
import { audioPlayer, RECITERS_LIST, Reciter } from '../../services/audioPlayerService';
import { useLanguage } from '../../context/LanguageContext';
import { ChronologicalWahyuEngine } from '../../services/backend/research/ChronologicalWahyuEngine';

interface SurahSelectorProps {
  selectedSurahNumber: number;
  onSelectSurah: (surahNumber: number) => void;
  onReciterChanged?: (reciter: Reciter) => void;
}

export const SurahSelector: React.FC<SurahSelectorProps> = ({
  selectedSurahNumber,
  onSelectSurah,
  onReciterChanged
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'surah' | 'nuzul' | 'juz'>('surah');
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [activeReciter, setActiveReciter] = useState<Reciter>(audioPlayer.getActiveReciter());
  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState(false);

  // Filter Surahs with memoization
  const filteredSurahs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return SURAH_LIST.filter((s) => {
      const matchQuery =
        !query ||
        s.latinName.toLowerCase().includes(query) ||
        s.meaning.toLowerCase().includes(query) ||
        s.name.includes(query) ||
        String(s.number) === query;

      let matchJuz = true;
      if (selectedJuz) {
        matchJuz = JUZ_MAP[selectedJuz]?.surahNumbers.includes(s.number) || false;
      }

      return matchQuery && matchJuz;
    });
  }, [searchQuery, selectedJuz]);

  const displaySurahs = useMemo(() => {
    return [...filteredSurahs].sort((a, b) => {
      if (activeFilter === 'nuzul') {
        const orderA = ChronologicalWahyuEngine.getChronologicalOrderOfSurah(a.number);
        const orderB = ChronologicalWahyuEngine.getChronologicalOrderOfSurah(b.number);
        return orderA - orderB;
      }
      return a.number - b.number;
    });
  }, [filteredSurahs, activeFilter]);

  const handleSelectReciter = (reciter: Reciter) => {
    audioPlayer.setActiveReciter(reciter.id);
    setActiveReciter(reciter);
    setIsReciterMenuOpen(false);
    if (onReciterChanged) {
      onReciterChanged(reciter);
    }
  };

  const currentJuzInfo = selectedJuz ? JUZ_MAP[selectedJuz] : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs mb-6 space-y-3">
      {/* Search, Filter Tabs & Reciter Switcher */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث عن الآيات حسب الموضوع أو المعنى أو اسم السورة...' : 'Cari Ayat Berdasarkan Topik atau Makna Kalimat...'}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center p-0.5"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Filter: 114 Surat vs Urutan Nuzul vs 30 Juz */}
          <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5 gap-0.5">
            <button
              onClick={() => {
                setActiveFilter('surah');
                setSelectedJuz(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'surah' && !selectedJuz
                  ? 'bg-[#0B4627] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Book className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? '١١٤ سورة' : '114 Surat'}</span>
            </button>
            <button
              onClick={() => {
                setActiveFilter('nuzul');
                setSelectedJuz(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'nuzul' && !selectedJuz
                  ? 'bg-[#0B4627] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Urutan Berdasarkan Kronologi Penurunan Wahyu"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'ترتيب النزول' : 'Urutan Nuzul'}</span>
            </button>
            <button
              onClick={() => {
                setActiveFilter('juz');
                if (!selectedJuz) setSelectedJuz(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'juz' || selectedJuz !== null
                  ? 'bg-[#0B4627] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? '٣٠ جزءاً' : '30 Juz'}</span>
            </button>
          </div>

          {/* Qari / Reciter Quick Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
              className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-300 border border-amber-300/70 dark:border-amber-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition duration-150"
              title="Pilih Qari / Syekh Tilawah"
            >
              <Headphones className="w-3.5 h-3.5 text-[#0B4627] dark:text-emerald-400" />
              <span className="truncate max-w-[130px]">{activeReciter.name.split(' ')[1] || activeReciter.name}</span>
              <ChevronDown className="w-3 h-3 text-amber-800 dark:text-amber-300" />
            </button>

            {isReciterMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-md z-50 animate-in fade-in zoom-in-95 space-y-1">
                <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#0B4627] dark:text-emerald-400">
                    {language === 'ar' ? 'اختر القارئ المعتمد:' : `Pilih Qari (${RECITERS_LIST.length} Tersedia):`}
                  </span>
                  <button
                    onClick={() => setIsReciterMenuOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    aria-label="Tutup"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                  {RECITERS_LIST.map((r) => {
                    const isSelected = r.id === activeReciter.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleSelectReciter(r)}
                        className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 border-emerald-400 shadow-xs'
                            : 'bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 border-transparent'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="text-xs font-bold truncate">{r.name}</p>
                          <p className={`text-[10px] font-medium ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                            {r.style}
                          </p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-semibold shrink-0 ${
                          isSelected ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {r.bitrate}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Juz Quick Selector Buttons if Juz Tab active */}
      {activeFilter === 'juz' && (
        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="text-xs font-bold text-[#0B4627] dark:text-emerald-400">
              {language === 'ar' ? 'اختر رقم الجزء (١ - ٣٠):' : 'Pilih Nomor Juz Al-Qur\'an (1 - 30):'}
            </span>
            {currentJuzInfo && (
              <span className="text-[11px] font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-300/60">
                {currentJuzInfo.ayahRange}
              </span>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNo) => (
              <button
                key={juzNo}
                onClick={() => setSelectedJuz(juzNo)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border shrink-0 transition-all cursor-pointer ${
                  selectedJuz === juzNo
                    ? 'bg-[#0B4627] text-white border-emerald-700 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                Juz {juzNo}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Surahs Chips List */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {displaySurahs.map((surah: SurahMeta) => {
          const isSelected = surah.number === selectedSurahNumber;
          const juzDisplay = surah.juzList ? surah.juzList.join(', ') : surah.juzStart;
          const nuzulOrder = ChronologicalWahyuEngine.getChronologicalOrderOfSurah(surah.number);

          return (
            <button
              key={surah.number}
              onClick={() => onSelectSurah(surah.number)}
              className={`px-3 py-2 rounded-xl border shrink-0 text-left transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? 'bg-[#0B4627] text-white border-emerald-700'
                  : 'bg-white dark:bg-slate-850 text-slate-900 dark:text-slate-100 border-slate-200/90 dark:border-slate-800 hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full text-[10px] font-semibold flex items-center justify-center font-mono ${
                    isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                  title={activeFilter === 'nuzul' ? `Urutan Wahyu #${nuzulOrder}` : `Nomor Surah #${surah.number}`}
                >
                  {activeFilter === 'nuzul' ? `#${nuzulOrder}` : surah.number}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs whitespace-nowrap block">{surah.latinName}</span>
                    {activeFilter === 'nuzul' && (
                      <span className={`text-[8px] px-1.5 py-0.2 rounded-full font-semibold uppercase ${
                        isSelected ? 'bg-white/20 text-amber-200' : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60'
                      }`}>
                        {surah.revelationPlace}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9px] font-medium block ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                    {activeFilter === 'nuzul' ? `Surah #${surah.number} • ` : ''}Juz {juzDisplay} • {surah.ayahCount} Ayat
                  </span>
                </div>
                <span className={`font-quran text-sm font-bold pl-1 ${isSelected ? 'text-amber-300' : 'text-emerald-700 dark:text-emerald-400'}`}>
                  {surah.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

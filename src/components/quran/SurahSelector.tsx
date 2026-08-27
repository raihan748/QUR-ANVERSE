import React, { useState } from 'react';
import { Search, Book, Layers, Sparkles, Headphones, ChevronDown, Check } from 'lucide-react';
import { SURAH_LIST, JUZ_MAP, getSurahsInJuz } from '../../data/quranData';
import { SurahMeta } from '../../types';
import { audioPlayer, RECITERS_LIST, Reciter } from '../../services/audioPlayerService';
import { useLanguage } from '../../context/LanguageContext';

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
  const [activeFilter, setActiveFilter] = useState<'surah' | 'juz'>('surah');
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [activeReciter, setActiveReciter] = useState<Reciter>(audioPlayer.getActiveReciter());
  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState(false);

  // Filter Surahs
  const filteredSurahs = SURAH_LIST.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
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
    <div className="bg-[#FFFDF7] border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_#111827] mb-6 space-y-3">
      {/* Search, Filter Tabs & Reciter Switcher */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث عن اسم السورة أو الرقم أو المعنى...' : 'Cari Surat (nama, arti, no)...'}
            className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-black font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Controls Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Filter: 114 Surat vs 30 Juz */}
          <div className="flex border-2 border-black rounded-xl overflow-hidden bg-[#E5E7EB] p-0.5 gap-0.5">
            <button
              onClick={() => {
                setActiveFilter('surah');
                setSelectedJuz(null);
              }}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'surah' && !selectedJuz
                  ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <Book className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? '١١٤ سورة' : '114 Surat'}</span>
            </button>
            <button
              onClick={() => {
                setActiveFilter('juz');
                if (!selectedJuz) setSelectedJuz(1);
              }}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'juz' || selectedJuz !== null
                  ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                  : 'text-gray-700 hover:text-black'
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
              className="px-3 py-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 neo-button cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              title="Pilih Qari / Syekh Tilawah"
            >
              <Headphones className="w-3.5 h-3.5 text-[#0B4627]" />
              <span className="truncate max-w-[130px]">{activeReciter.name.split(' ')[1] || activeReciter.name}</span>
              <ChevronDown className="w-3 h-3 text-gray-700" />
            </button>

            {isReciterMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white border-3 border-black rounded-2xl p-2 shadow-[6px_6px_0px_0px_#000] z-50 animate-in fade-in zoom-in-95 space-y-1">
                <div className="p-1.5 border-b-2 border-black flex items-center justify-between">
                  <span className="text-[11px] font-black text-[#0B4627]">
                    {language === 'ar' ? 'اختر القارئ المعتمد:' : `Pilih Qari (${RECITERS_LIST.length} Tersedia):`}
                  </span>
                  <button
                    onClick={() => setIsReciterMenuOpen(false)}
                    className="text-xs font-bold text-gray-500 hover:text-black"
                  >
                    ✕
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                  {RECITERS_LIST.map((r) => {
                    const isSelected = r.id === activeReciter.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleSelectReciter(r)}
                        className={`w-full p-2 rounded-xl border-2 border-black text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-[#F9FAFB] hover:bg-amber-50 text-gray-900'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="text-xs font-black truncate">{r.name}</p>
                          <p className={`text-[10px] font-bold ${isSelected ? 'text-amber-300' : 'text-gray-600'}`}>
                            {r.style}
                          </p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 border ${
                          isSelected ? 'bg-[#F59E0B] text-black border-black' : 'bg-gray-200 text-gray-700 border-gray-400'
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
        <div className="p-3 bg-[#F0FDF4] border-2 border-black rounded-xl space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="text-xs font-black text-[#0B4627]">
              {language === 'ar' ? 'اختر رقم الجزء (١ - ٣٠):' : 'Pilih Nomor Juz Al-Qur\'an (1 - 30):'}
            </span>
            {currentJuzInfo && (
              <span className="text-[11px] font-extrabold bg-[#F59E0B] text-black px-2 py-0.5 rounded border border-black font-mono">
                {currentJuzInfo.ayahRange}
              </span>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNo) => (
              <button
                key={juzNo}
                onClick={() => setSelectedJuz(juzNo)}
                className={`px-2.5 py-1.5 text-xs font-black rounded-lg border-2 border-black shrink-0 transition-all cursor-pointer ${
                  selectedJuz === juzNo
                    ? 'bg-[#0B4627] text-[#F59E0B] shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-white text-gray-800 hover:bg-amber-100'
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
        {filteredSurahs.map((surah) => {
          const isSelected = surah.number === selectedSurahNumber;
          const juzDisplay = surah.juzList ? surah.juzList.join(', ') : surah.juzStart;

          return (
            <button
              key={surah.number}
              onClick={() => onSelectSurah(surah.number)}
              className={`px-3 py-2 rounded-xl border-2 border-black shrink-0 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#0B4627] text-white shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
                  : 'bg-white text-gray-900 hover:bg-[#FEF3C7] shadow-[2px_2px_0px_0px_#111827]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-5 h-5 rounded border border-black text-[10px] font-black flex items-center justify-center ${
                    isSelected ? 'bg-[#F59E0B] text-black' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {surah.number}
                </span>
                <div>
                  <span className="font-extrabold text-xs whitespace-nowrap block">{surah.latinName}</span>
                  <span className={`text-[9px] font-bold block ${isSelected ? 'text-emerald-200' : 'text-gray-500'}`}>
                    Juz {juzDisplay} • {surah.ayahCount} Ayat
                  </span>
                </div>
                <span className={`font-quran text-sm font-bold pl-1 ${isSelected ? 'text-[#F59E0B]' : 'text-emerald-800'}`}>
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

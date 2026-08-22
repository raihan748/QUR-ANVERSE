import React, { useState } from 'react';
import { Search, Book, Layers, Sparkles } from 'lucide-react';
import { SURAH_LIST } from '../../data/quranData';
import { SurahMeta } from '../../types';

interface SurahSelectorProps {
  selectedSurahNumber: number;
  onSelectSurah: (surahNumber: number) => void;
}

export const SurahSelector: React.FC<SurahSelectorProps> = ({
  selectedSurahNumber,
  onSelectSurah
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'surah' | 'juz'>('surah');
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);

  // Filter Surahs
  const filteredSurahs = SURAH_LIST.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    const matchQuery =
      !query ||
      s.latinName.toLowerCase().includes(query) ||
      s.meaning.toLowerCase().includes(query) ||
      s.name.includes(query) ||
      String(s.number) === query;

    const matchJuz = selectedJuz ? s.juzStart === selectedJuz : true;

    return matchQuery && matchJuz;
  });

  return (
    <div className="bg-[#FFFDF7] border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_#111827] mb-6">
      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Surat (nama, arti, no)..."
            className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
          />
        </div>

        {/* Tab Filter */}
        <div className="flex border-2 border-black rounded-xl overflow-hidden bg-[#E5E7EB] p-0.5 gap-0.5 w-full sm:w-auto">
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
            <Book className="w-3.5 h-3.5" /> 114 Surat
          </button>
          <button
            onClick={() => setActiveFilter('juz')}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'juz' || selectedJuz !== null
                ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                : 'text-gray-700 hover:text-black'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 30 Juz
          </button>
        </div>
      </div>

      {/* Juz Quick Selector Buttons if Juz Tab active */}
      {activeFilter === 'juz' && (
        <div className="mb-4 p-2.5 bg-white border-2 border-black rounded-xl">
          <p className="text-[11px] font-extrabold text-gray-700 mb-2">Pilih Nomor Juz (1 - 30):</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNo) => (
              <button
                key={juzNo}
                onClick={() => setSelectedJuz(selectedJuz === juzNo ? null : juzNo)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border border-black shrink-0 transition-all cursor-pointer ${
                  selectedJuz === juzNo
                    ? 'bg-[#F59E0B] text-black font-extrabold shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-[#F3F4F6] text-gray-800 hover:bg-gray-200'
                }`}
              >
                Juz {juzNo}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Horizontal Surah Chips List */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {filteredSurahs.slice(0, 30).map((surah) => {
          const isSelected = surah.number === selectedSurahNumber;

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
                <span className="font-extrabold text-xs whitespace-nowrap">{surah.latinName}</span>
                <span className={`font-quran text-sm font-bold ${isSelected ? 'text-[#F59E0B]' : 'text-emerald-800'}`}>
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

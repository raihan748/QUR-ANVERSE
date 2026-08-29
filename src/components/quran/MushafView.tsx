import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Bookmark as BookmarkIcon, 
  BookOpen, 
  Sparkles, 
  Settings2, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  FileText,
  Share2,
  Sliders
} from 'lucide-react';
import { Ayat, SurahMeta, Bookmark, WordData } from '../../types';
import { SURAH_LIST, getSurahAyahs } from '../../data/quranData';
import { SurahSelector } from './SurahSelector';
import { WordByWordModal } from './WordByWordModal';
import { QuranAudioBar } from './QuranAudioBar';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { audioPlayer } from '../../services/audioPlayerService';
import { getBookmarks, saveBookmark, setLastRead, getLastRead } from '../../services/offlineStorage';

import { PhysicalMushafPageReader } from './PhysicalMushafPageReader';
import { useLanguage } from '../../context/LanguageContext';
import { getTajweedColorForWord } from '../../services/quranTajweedGharibService';

const STORAGE_MUSHAF_MODE = 'quranverse_mushaf_view_mode_v1';

export const MushafView: React.FC = () => {
  const { language } = useLanguage();
  const [mushafViewMode, setMushafViewMode] = useState<'digital' | 'physical'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MUSHAF_MODE);
      if (saved === 'digital' || saved === 'physical') return saved;
    } catch {}
    return 'physical'; // Default: Mushaf Fisik Asli (Open Book Spread)
  });

  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [ayats, setAyats] = useState<Ayat[]>([]);
  const [loading, setLoading] = useState(true);

  // Audio State
  const [currentPlayingAyat, setCurrentPlayingAyat] = useState<Ayat | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Word by word modal state
  const [selectedAyatForWords, setSelectedAyatForWords] = useState<Ayat | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);

  // Styling & Preferences
  const [fontSize, setFontSize] = useState<number>(28);
  const [themeMode, setThemeMode] = useState<'paper' | 'dark' | 'emerald'>('paper');
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [showControls, setShowControls] = useState(false);

  const handleSetViewMode = (mode: 'digital' | 'physical') => {
    setMushafViewMode(mode);
    try {
      localStorage.setItem(STORAGE_MUSHAF_MODE, mode);
    } catch {}
  };

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Note Drawer / Modal
  const [activeNoteAyat, setActiveNoteAyat] = useState<Ayat | null>(null);
  const [noteText, setNoteText] = useState('');

  const currentSurahMeta = SURAH_LIST.find((s) => s.number === selectedSurahNumber) || SURAH_LIST[0];

  useEffect(() => {
    setBookmarks(getBookmarks());
    loadSurah(selectedSurahNumber);
  }, [selectedSurahNumber]);

  const loadSurah = async (surahNumber: number) => {
    setLoading(true);
    const data = await getSurahAyahs(surahNumber);
    setAyats(data);
    setLoading(false);
    setLastRead(surahNumber, 1, currentSurahMeta.latinName);
  };

  const handlePlayAyat = async (ayat: Ayat) => {
    if (currentPlayingAyat?.numberInSurah === ayat.numberInSurah && isPlayingAudio) {
      audioPlayer.pause();
      setIsPlayingAudio(false);
      return;
    }

    setCurrentPlayingAyat(ayat);
    setIsPlayingAudio(true);

    await audioPlayer.playAyat(ayat.surahNumber, ayat.numberInSurah, () => {
      // Auto play next ayat in Surah
      const nextAyat = ayats.find(a => a.numberInSurah === ayat.numberInSurah + 1);
      if (nextAyat) {
        handlePlayAyat(nextAyat);
      } else {
        setIsPlayingAudio(false);
        setCurrentPlayingAyat(null);
      }
    });
  };

  const handleToggleBookmark = (ayat: Ayat) => {
    const updated = saveBookmark({
      surahNumber: ayat.surahNumber,
      ayahNumber: ayat.numberInSurah,
      surahName: ayat.surahName,
      arabicText: ayat.arabicText,
      translation: ayat.translation,
      note: noteText || undefined
    });
    setBookmarks(updated);
  };

  const isAyatBookmarked = (ayat: Ayat) => {
    return bookmarks.some(b => b.surahNumber === ayat.surahNumber && b.ayahNumber === ayat.numberInSurah);
  };

  const handleWordClick = (ayat: Ayat, word: WordData) => {
    setSelectedAyatForWords(ayat);
    setSelectedWord(word);
    setIsWordModalOpen(true);
  };

  const getContainerTheme = () => {
    switch (themeMode) {
      case 'dark':
        return 'bg-[#111827] text-white';
      case 'emerald':
        return 'bg-[#064E3B] text-emerald-50';
      case 'paper':
      default:
        return 'bg-[#FFFDF7] text-gray-900';
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-5xl mx-auto">
      {/* 🌟 DUAL MODE SWITCHER: DIGITAL vs PHYSICAL 604-PAGE MUSHAF */}
      <div className="flex border-2 border-black rounded-2xl overflow-hidden bg-[#E5E7EB] p-1 gap-1 shadow-[2px_2px_0px_0px_#111827]">
        <button
          onClick={() => handleSetViewMode('digital')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mushafViewMode === 'digital'
              ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
              : 'text-gray-700 hover:text-black'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#F59E0B]" />
          <span>{language === 'ar' ? '📱 مصحف رقمي مفسر' : '📱 Mode Digital (Teks, Terjemah & Per Kata)'}</span>
        </button>

        <button
          onClick={() => handleSetViewMode('physical')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mushafViewMode === 'physical'
              ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
              : 'text-gray-700 hover:text-black'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          <span>{language === 'ar' ? '📖 مصحف المدينة ٦٠٤ صفحة (قلب الصفحات)' : '📖 Mode Mushaf Fisik Asli (604 Halaman Geser)'}</span>
        </button>
      </div>

      {mushafViewMode === 'physical' ? (
        <PhysicalMushafPageReader />
      ) : (
        <>
          {/* Top Banner Surah Selector */}
          <SurahSelector
            selectedSurahNumber={selectedSurahNumber}
            onSelectSurah={(no) => setSelectedSurahNumber(no)}
          />

      {/* Surah Header Card */}
      <NeobrutalCard variant="emerald" className="p-4 sm:p-5 relative overflow-hidden shadow-[3px_3px_0px_0px_#111827] border-2 border-black">
        {/* Background Islamic Star Pattern */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#F59E0B]/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-black bg-[#F59E0B] text-black rounded border border-black uppercase">
                Surat ke-{currentSurahMeta.number}
              </span>
              <span className="px-2 py-0.5 text-xs font-bold bg-white/20 text-white rounded border border-white/30">
                {currentSurahMeta.revelationPlace} • {currentSurahMeta.ayahCount} Ayat
              </span>
              <span className="px-2 py-0.5 text-xs font-bold bg-[#10B981] text-black rounded border border-black">
                Juz {currentSurahMeta.juzList ? currentSurahMeta.juzList.join(', ') : currentSurahMeta.juzStart}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white">
              Surat {currentSurahMeta.latinName}
            </h2>
            <p className="text-xs text-emerald-200 font-medium">"{currentSurahMeta.meaning}"</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#FFFDF7] text-black border-2 border-black rounded-xl neo-button cursor-pointer text-xs font-extrabold"
            >
              <Sliders className="w-4 h-4 text-[#0B4627]" />
              <span>Pengaturan Tampilan</span>
            </button>
          </div>
        </div>

        {/* Customization Drawer / Panel */}
        {showControls && (
          <div className="mt-4 pt-4 border-t-2 border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Font Size Slider */}
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/20">
              <span className="font-bold text-[#F59E0B] block mb-1">Ukuran Font Arab ({fontSize}px)</span>
              <input
                type="range"
                min="20"
                max="44"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-[#F59E0B] cursor-pointer"
              />
            </div>

            {/* Theme Selector */}
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/20">
              <span className="font-bold text-[#F59E0B] block mb-1">Tema Mushaf</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setThemeMode('paper')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded border ${
                    themeMode === 'paper' ? 'bg-[#FFFDF7] text-black font-black' : 'bg-transparent text-white'
                  }`}
                >
                  Krem Mushaf
                </button>
                <button
                  onClick={() => setThemeMode('emerald')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded border ${
                    themeMode === 'emerald' ? 'bg-[#10B981] text-black font-black' : 'bg-transparent text-white'
                  }`}
                >
                  Zamrud
                </button>
                <button
                  onClick={() => setThemeMode('dark')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded border ${
                    themeMode === 'dark' ? 'bg-[#111827] text-white font-black' : 'bg-transparent text-white'
                  }`}
                >
                  Malam
                </button>
              </div>
            </div>

            {/* Toggle Translations */}
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/20 flex flex-col justify-center gap-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(e) => setShowTranslation(e.target.checked)}
                  className="accent-[#F59E0B] rounded"
                />
                <span>Terjemah Kemenag</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={showTransliteration}
                  onChange={(e) => setShowTransliteration(e.target.checked)}
                  className="accent-[#F59E0B] rounded"
                />
                <span>Transliterasi Latin</span>
              </label>
            </div>
          </div>
        )}
      </NeobrutalCard>

      {/* Bismillah Header (except At-Taubah 9) */}
      {selectedSurahNumber !== 9 && selectedSurahNumber !== 1 && (
        <div className="text-center py-4 bg-[#FFFDF7] border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#111827]">
          <p className="font-quran text-2xl text-emerald-950 font-bold" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-[11px] text-gray-600 italic mt-1">
            "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang"
          </p>
        </div>
      )}

      {/* Ayah List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-[#0B4627] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-bold text-gray-700">Memuat Ayat Rasm Utsmani...</p>
          </div>
        ) : (
          ayats.map((ayat) => {
            const isPlayingThis = currentPlayingAyat?.numberInSurah === ayat.numberInSurah && isPlayingAudio;
            const isBookmarked = isAyatBookmarked(ayat);

            return (
              <div
                key={ayat.numberInSurah}
                className={`rounded-2xl p-4 sm:p-5 border-2 border-black transition-all ${getContainerTheme()} ${
                  isPlayingThis
                    ? 'shadow-[3px_3px_0px_0px_#F59E0B] ring-2 ring-[#F59E0B]'
                    : 'shadow-[2px_2px_0px_0px_#111827]'
                }`}
              >
                {/* Header Ayat Bar */}
                <div className="flex items-center justify-between border-b-2 border-dashed border-gray-300 dark:border-gray-700 pb-3 mb-4">
                  {/* Number Badge */}
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-[#F59E0B] border-2 border-black flex items-center justify-center text-black font-extrabold text-xs shadow-[2px_2px_0px_0px_#000]">
                      {ayat.numberInSurah}
                    </span>
                    <span className="text-xs font-bold text-gray-500">
                      Juz {ayat.juz}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Play Audio Syekh Mishary */}
                    <button
                      onClick={() => handlePlayAyat(ayat)}
                      className={`p-2 rounded-lg border-2 border-black neo-button cursor-pointer flex items-center gap-1 text-xs font-extrabold ${
                        isPlayingThis ? 'bg-[#F59E0B] text-black' : 'bg-white text-[#0B4627]'
                      }`}
                      title="Dengarkan Suara Syekh Misyari"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="hidden xs:inline">{isPlayingThis ? 'Memutar' : 'Audio Syekh'}</span>
                    </button>

                    {/* Word-by-Word Modal Button */}
                    <button
                      onClick={() => {
                        setSelectedAyatForWords(ayat);
                        setSelectedWord(null);
                        setIsWordModalOpen(true);
                      }}
                      className="p-2 bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#0B4627] border-2 border-black rounded-lg neo-button cursor-pointer text-xs font-extrabold flex items-center gap-1"
                      title="Lihat Arti Kata per Kata"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="hidden sm:inline">Arti Kata</span>
                    </button>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => handleToggleBookmark(ayat)}
                      className={`p-2 rounded-lg border-2 border-black neo-button cursor-pointer ${
                        isBookmarked ? 'bg-[#F59E0B] text-black' : 'bg-white text-gray-600'
                      }`}
                      title={isBookmarked ? 'Tersimpan di Bookmark' : 'Tandai Ayat'}
                    >
                      <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-black' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Arabic Text (Clickable Words with Tajweed Colors) */}
                <div className="my-4 text-right" dir="rtl">
                  {ayat.words && ayat.words.length > 0 ? (
                    <div className="flex flex-wrap gap-x-2.5 gap-y-3.5 items-center">
                      {ayat.words.map((w, wIdx) => {
                        const nextW = ayat.words ? ayat.words[wIdx + 1]?.arabic || '' : '';
                        const prevW = ayat.words ? ayat.words[wIdx - 1]?.arabic || '' : '';
                        const isLineEnd = wIdx === (ayat.words?.length || 0) - 1;
                        const tajweed = getTajweedColorForWord(w.arabic, nextW, prevW, isLineEnd);

                        return (
                          <span
                            key={w.id}
                            onClick={() => handleWordClick(ayat, w)}
                            style={{ 
                              fontSize: `${fontSize}px`,
                              color: tajweed.color !== '#0F172A' ? tajweed.color : undefined,
                              backgroundColor: tajweed.bg !== 'transparent' ? tajweed.bg : undefined
                            }}
                            className={`font-quran leading-loose px-2 py-0.5 rounded-lg cursor-pointer transition-all inline-block ${
                              tajweed.bg !== 'transparent' 
                                ? 'shadow-xs border border-amber-300/40 font-bold' 
                                : 'text-emerald-950 dark:text-emerald-300 hover:bg-[#FEF3C7] hover:text-black border border-transparent hover:border-black'
                            }`}
                            title={tajweed.ruleName ? `[${tajweed.ruleName}] ${w.meaningId} (${w.transliteration})` : `"${w.meaningId}" (${w.transliteration})`}
                          >
                            {w.arabic}
                          </span>
                        );
                      })}
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-black bg-[#F59E0B] text-black font-quran text-xs font-bold mr-2 shadow-[1px_1px_0px_0px_#000]">
                        ۝{ayat.numberInSurah}
                      </span>
                    </div>
                  ) : (
                    <p
                      style={{ fontSize: `${fontSize}px` }}
                      className="font-quran leading-loose text-emerald-950 dark:text-emerald-200 font-bold"
                    >
                      {ayat.arabicText}
                    </p>
                  )}
                </div>

                {/* Latin Transliteration */}
                {showTransliteration && ayat.transliteration && (
                  <p className="text-xs font-semibold text-[#0B4627] dark:text-[#34D399] mb-1.5 italic">
                    {ayat.transliteration}
                  </p>
                )}

                {/* Indonesian Translation */}
                {showTranslation && ayat.translation && (
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    {ayat.translation}
                  </p>
                )}

                {/* Short Tafsir if available */}
                {ayat.tafsirShort && (
                  <div className="mt-3 p-3 bg-[#F0FDF4] dark:bg-emerald-950/40 border border-[#10B981] rounded-xl text-xs text-gray-700 dark:text-emerald-200">
                    <span className="font-bold text-[#0B4627] dark:text-[#F59E0B] flex items-center gap-1 mb-0.5">
                      <Sparkles className="w-3 h-3" /> Intisari Tafsir:
                    </span>
                    {ayat.tafsirShort}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Surah Navigation (Next / Prev) */}
      <div className="flex justify-between items-center pt-4">
        <button
          disabled={selectedSurahNumber <= 1}
          onClick={() => setSelectedSurahNumber(selectedSurahNumber - 1)}
          className="px-4 py-2.5 bg-white disabled:opacity-40 text-black border-2 border-black rounded-xl neo-button cursor-pointer flex items-center gap-2 text-xs font-extrabold"
        >
          <ChevronLeft className="w-4 h-4" /> Surat Sebelumnya
        </button>

        <button
          disabled={selectedSurahNumber >= 114}
          onClick={() => setSelectedSurahNumber(selectedSurahNumber + 1)}
          className="px-4 py-2.5 bg-[#0B4627] disabled:opacity-40 text-white border-2 border-black rounded-xl neo-button cursor-pointer flex items-center gap-2 text-xs font-extrabold"
        >
          Surat Selanjutnya <ChevronRight className="w-4 h-4 text-[#F59E0B]" />
        </button>
      </div>

      {/* Word by Word Interactive Modal */}
      <WordByWordModal
        ayat={selectedAyatForWords}
        selectedWord={selectedWord}
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
      />

      {/* Floating Audio Bar */}
      {currentPlayingAyat && (
        <QuranAudioBar
          currentAyat={currentPlayingAyat}
          isPlaying={isPlayingAudio}
          onTogglePlay={() => {
            if (isPlayingAudio) {
              audioPlayer.pause();
              setIsPlayingAudio(false);
            } else {
              audioPlayer.resume();
              setIsPlayingAudio(true);
            }
          }}
          onNextAyat={() => {
            const next = ayats.find(a => a.numberInSurah === currentPlayingAyat.numberInSurah + 1);
            if (next) handlePlayAyat(next);
          }}
          onPrevAyat={() => {
            const prev = ayats.find(a => a.numberInSurah === currentPlayingAyat.numberInSurah - 1);
            if (prev) handlePlayAyat(prev);
          }}
        />
      )}
        </>
      )}
    </div>
  );
};

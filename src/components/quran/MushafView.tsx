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
    } catch {
      // ignore
    }
    return 'digital';
  });

  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(() => {
    const last = getLastRead();
    return last ? last.surahNumber : 1;
  });

  const [ayats, setAyats] = useState<Ayat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(28);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showTransliteration, setShowTransliteration] = useState<boolean>(true);
  const [themeMode, setThemeMode] = useState<'paper' | 'emerald' | 'dark'>('paper');
  const [showControls, setShowControls] = useState<boolean>(false);

  // Word-by-word modal state
  const [selectedAyatForWords, setSelectedAyatForWords] = useState<Ayat | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [isWordModalOpen, setIsWordModalOpen] = useState<boolean>(false);

  // Audio state
  const [currentPlayingAyat, setCurrentPlayingAyat] = useState<Ayat | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  // Spotlight effect for Bayan AI Agentic navigation
  const [spotlightAyatNumber, setSpotlightAyatNumber] = useState<number | null>(null);

  const currentSurahMeta = SURAH_LIST.find((s) => s.number === selectedSurahNumber) || SURAH_LIST[0];

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getSurahAyahs(selectedSurahNumber).then((data) => {
      if (isMounted) {
        setAyats(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber]);

  // Listener untuk Aksi Cerdas Bayan AI (Lompat ke Surah & Ayat Tertentu)
  useEffect(() => {
    const handleJump = (e: Event) => {
      const customEvent = e as CustomEvent<{ surahNumber: number; ayahNumber?: number }>;
      if (customEvent.detail && customEvent.detail.surahNumber) {
        setSelectedSurahNumber(customEvent.detail.surahNumber);
        const targetAyah = customEvent.detail.ayahNumber || 1;
        setSpotlightAyatNumber(targetAyah);
        setTimeout(() => {
          setSpotlightAyatNumber(null);
        }, 5000);

        if (customEvent.detail.ayahNumber) {
          setTimeout(() => {
            const el = document.getElementById(`ayat-${customEvent.detail.ayahNumber}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 500);
        }
      }
    };
    window.addEventListener('qv_mushaf_jump', handleJump);
    return () => window.removeEventListener('qv_mushaf_jump', handleJump);
  }, []);

  const handleSetViewMode = (mode: 'digital' | 'physical') => {
    setMushafViewMode(mode);
    try {
      localStorage.setItem(STORAGE_MUSHAF_MODE, mode);
    } catch {
      // ignore
    }
  };

  const handlePlayAyat = (ayat: Ayat) => {
    if (currentPlayingAyat?.numberInSurah === ayat.numberInSurah && isPlayingAudio) {
      audioPlayer.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayer.playAyat(
        ayat.surahNumber,
        ayat.numberInSurah,
        () => {
          setIsPlayingAudio(false);
          setCurrentPlayingAyat(null);
        }
      );
      setCurrentPlayingAyat(ayat);
      setIsPlayingAudio(true);
    }
  };

  const handleToggleBookmark = (ayat: Ayat) => {
    const isBookmarked = bookmarks.some(
      (b) => b.surahNumber === ayat.surahNumber && b.ayahNumber === ayat.numberInSurah
    );

    if (isBookmarked) {
      // remove
      const updated = bookmarks.filter(
        (b) => !(b.surahNumber === ayat.surahNumber && b.ayahNumber === ayat.numberInSurah)
      );
      localStorage.setItem('quranverse_bookmarks', JSON.stringify(updated));
      setBookmarks(updated);
    } else {
      const newBm: Bookmark = {
        id: `bm_${Date.now()}`,
        surahNumber: ayat.surahNumber,
        surahName: currentSurahMeta.latinName,
        ayahNumber: ayat.numberInSurah,
        arabicText: ayat.arabicText,
        translation: ayat.translation,
        createdAt: new Date().toISOString()
      };
      saveBookmark(newBm);
      setBookmarks(getBookmarks());
    }
  };

  const isAyatBookmarked = (ayat: Ayat) => {
    return bookmarks.some(
      (b) => b.surahNumber === ayat.surahNumber && b.ayahNumber === ayat.numberInSurah
    );
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
      {/* DUAL MODE SWITCHER: DIGITAL vs PHYSICAL 604-PAGE MUSHAF */}
      <div className="flex border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800/80 p-1 gap-1 shadow-xs">
        <button
          onClick={() => handleSetViewMode('digital')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mushafViewMode === 'digital'
              ? 'bg-[#0B4627] text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>{language === 'ar' ? 'مصحف رقمي مفسر' : 'Mode Digital (Teks, Terjemah & Per Kata)'}</span>
        </button>

        <button
          onClick={() => handleSetViewMode('physical')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mushafViewMode === 'physical'
              ? 'bg-[#0B4627] text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{language === 'ar' ? 'مصحف المدينة ٦٠٤ صفحة (قلب الصفحات)' : 'Mushaf Madinah Asli (604 Halaman)'}</span>
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
      <div className="p-5 relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#032313] via-[#0B4627] to-[#042413] text-white border border-emerald-800/60 shadow-md">
        {/* Background Islamic Star Pattern */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg shadow-xs uppercase">
                Surat ke-{currentSurahMeta.number}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium bg-white/15 text-white rounded-lg border border-white/20">
                {currentSurahMeta.revelationPlace} • {currentSurahMeta.ayahCount} Ayat
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-400/30">
                Juz {currentSurahMeta.juzList ? currentSurahMeta.juzList.join(', ') : currentSurahMeta.juzStart}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              Surat {currentSurahMeta.latinName}
            </h2>
            <p className="text-xs text-emerald-200/90 font-medium">"{currentSurahMeta.meaning}"</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl cursor-pointer text-xs font-semibold transition-colors"
            >
              <Sliders className="w-4 h-4 text-amber-300" />
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
      </div>

      {/* Bismillah Header (except At-Taubah 9) */}
      {selectedSurahNumber !== 9 && selectedSurahNumber !== 1 && (
        <div className="text-center py-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
          <p className="font-quran text-2xl text-emerald-950 dark:text-emerald-300 font-bold" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1 font-medium">
            "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang"
          </p>
        </div>
      )}

      {/* Ayah List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-[#0B4627] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Memuat Ayat Rasm Utsmani...</p>
          </div>
        ) : (
          ayats.map((ayat) => {
            const isPlayingThis = currentPlayingAyat?.numberInSurah === ayat.numberInSurah && isPlayingAudio;
            const isBookmarked = isAyatBookmarked(ayat);
            const isSpotlighted = ayat.numberInSurah === spotlightAyatNumber;

            return (
              <div
                key={ayat.numberInSurah}
                id={`ayat-${ayat.numberInSurah}`}
                className={`rounded-2xl p-4 sm:p-5 border transition-all duration-700 ${getContainerTheme()} ${
                  isSpotlighted
                    ? 'border-amber-400 ring-4 ring-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.45)] bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 scale-[1.01]'
                    : isPlayingThis
                    ? 'border-amber-400 shadow-md ring-2 ring-amber-400/30'
                    : 'border-slate-200/90 dark:border-slate-800 shadow-xs'
                }`}
              >
                {/* Header Ayat Bar */}
                <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-3 mb-4">
                  {/* Number Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                      isSpotlighted 
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 animate-bounce' 
                        : 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-400/40'
                    }`}>
                      {ayat.numberInSurah}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Juz {ayat.juz}
                    </span>
                    {isSpotlighted && (
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg bg-amber-500 text-slate-950 animate-pulse flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3 text-slate-950 fill-current" /> Target Bayan AI
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Play Audio Syekh Mishary */}
                    <button
                      onClick={() => handlePlayAyat(ayat)}
                      className={`p-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-1 text-xs font-semibold transition-all ${
                        isPlayingThis ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs' : 'bg-white dark:bg-slate-800 text-[#0B4627] dark:text-emerald-400 hover:bg-slate-50'
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
                      className="p-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[#0B4627] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl cursor-pointer text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Lihat Arti Kata per Kata"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="hidden sm:inline">Arti Kata</span>
                    </button>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => handleToggleBookmark(ayat)}
                      className={`p-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-all ${
                        isBookmarked ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                      title={isBookmarked ? 'Tersimpan di Bookmark' : 'Tandai Ayat'}
                    >
                      <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-slate-950' : ''}`} />
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
                                : 'text-emerald-950 dark:text-emerald-300 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 border border-transparent rounded-lg'
                            }`}
                            title={tajweed.ruleName ? `[${tajweed.ruleName}] ${w.meaningId} (${w.transliteration})` : `"${w.meaningId}" (${w.transliteration})`}
                          >
                            {w.arabic}
                          </span>
                        );
                      })}
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-amber-500/50 bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 font-quran text-xs font-bold mr-2 shadow-xs">
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
          className="px-4 py-2.5 bg-white dark:bg-slate-800 disabled:opacity-40 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer flex items-center gap-2 text-xs font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> Surat Sebelumnya
        </button>

        <button
          disabled={selectedSurahNumber >= 114}
          onClick={() => setSelectedSurahNumber(selectedSurahNumber + 1)}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-2xl shadow-xs transition-colors cursor-pointer flex items-center gap-2 text-xs font-semibold"
        >
          Surat Selanjutnya <ChevronRight className="w-4 h-4 text-amber-300" />
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
              if (audioPlayer.isPaused()) {
                audioPlayer.resume();
                setIsPlayingAudio(true);
              } else if (currentPlayingAyat) {
                handlePlayAyat(currentPlayingAyat);
              }
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

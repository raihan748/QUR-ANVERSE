import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Repeat, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  CheckCircle2, 
  Bookmark as BookmarkIcon, 
  Sparkles, 
  Sliders, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2,
  ChevronDown,
  Search,
  Flame,
  Award,
  Settings2,
  Target,
  X
} from 'lucide-react';
import { Ayat, SurahMeta, UserProfile, Bookmark } from '../../types';
import confetti from 'canvas-confetti';
import { SURAH_LIST, getSurahAyahs, JUZ_MAP } from '../../data/quranData';
import { audioPlayer, RECITERS_LIST, Reciter } from '../../services/audioPlayerService';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { saveBookmark, setLastRead, addXpAndCheckStreak } from '../../services/offlineStorage';
import { DailyTargetWidget } from '../common/DailyTargetWidget';
import { 
  getDailyTarget, 
  markAyahCompletedInTarget, 
  DailyQuranTarget 
} from '../../services/dailyTargetService';
import { Headphones } from 'lucide-react';

interface TilawahStudioProps {
  userProfile?: UserProfile;
  onProfileUpdated?: (profile: UserProfile) => void;
}

export const TilawahStudio: React.FC<TilawahStudioProps> = ({
  userProfile,
  onProfileUpdated
}) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(67); // Default Al-Mulk (Juz 29)
  const [currentAyats, setCurrentAyats] = useState<Ayat[]>([]);
  const [activeAyahIndex, setActiveAyahIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [repeatCount, setRepeatCount] = useState<number>(1); // 1, 3, 5, 10, 999 (infinite)
  const [currentRepeatIteration, setCurrentRepeatIteration] = useState<number>(1);
  
  // Reciter State
  const [activeReciter, setActiveReciter] = useState<Reciter>(audioPlayer.getActiveReciter());
  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState<boolean>(false);

  // Customization State
  const [fontSize, setFontSize] = useState<number>(32);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showTransliteration, setShowTransliteration] = useState<boolean>(true);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isSurahModalOpen, setIsSurahModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [juzFilterTab, setJuzFilterTab] = useState<'all' | 29 | 30 | 'popular'>('all');

  // Daily Target State
  const [dailyTarget, setDailyTarget] = useState<DailyQuranTarget>(getDailyTarget());

  // Refs for auto-scroll
  const ayahRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const currentSurahMeta = SURAH_LIST.find(s => s.number === selectedSurahNumber) || SURAH_LIST[0];

  // Load ayahs when surah changes
  useEffect(() => {
    let isMounted = true;
    audioPlayer.stop();
    setIsPlaying(false);
    setActiveAyahIndex(0);
    setCurrentRepeatIteration(1);

    getSurahAyahs(selectedSurahNumber).then((data) => {
      if (isMounted) {
        setCurrentAyats(data);
        setLastRead(selectedSurahNumber, 1, currentSurahMeta.latinName);
      }
    });

    return () => {
      isMounted = false;
      audioPlayer.stop();
    };
  }, [selectedSurahNumber]);

  // Scroll active ayah into view smoothly
  useEffect(() => {
    if (isPlaying && ayahRefs.current[activeAyahIndex]) {
      ayahRefs.current[activeAyahIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeAyahIndex, isPlaying]);

  // Play a specific Ayah by index with repeat logic & daily target tracking
  const playAyahAtIndex = async (index: number) => {
    if (!currentAyats[index]) return;

    setActiveAyahIndex(index);
    setIsPlaying(true);

    const targetAyat = currentAyats[index];
    setLastRead(targetAyat.surahNumber, targetAyat.numberInSurah, currentSurahMeta.latinName);

    // Track progress in Daily Target
    const updatedTarget = markAyahCompletedInTarget(
      targetAyat.surahNumber,
      targetAyat.numberInSurah,
      (updatedProfile, finishedTarget) => {
        if (onProfileUpdated) onProfileUpdated(updatedProfile);
        confetti({ particleCount: 120, spread: 80 });
      }
    );
    setDailyTarget(updatedTarget);

    await audioPlayer.playAyat(targetAyat.surahNumber, targetAyat.numberInSurah, () => {
      handleAyahEnded(index);
    });
  };

  // Handle Ayah Audio Ended (Advance or Repeat)
  const handleAyahEnded = (currentIndex: number) => {
    if (repeatCount > 1 && currentRepeatIteration < repeatCount) {
      setCurrentRepeatIteration((prev) => prev + 1);
      setTimeout(() => {
        playAyahAtIndex(currentIndex);
      }, 300);
      return;
    }

    setCurrentRepeatIteration(1);

    // Advance to next ayah if available
    if (currentIndex + 1 < currentAyats.length) {
      playAyahAtIndex(currentIndex + 1);
    } else {
      // Completed Surah Tilawah!
      setIsPlaying(false);
      audioPlayer.playSuccessChime();
      confetti({ particleCount: 80, spread: 70 });
      if (onProfileUpdated) {
        const updated = addXpAndCheckStreak(75);
        onProfileUpdated(updated);
      }
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioPlayer.pause();
      setIsPlaying(false);
    } else {
      if (audioPlayer.getIsPlaying()) {
        audioPlayer.resume();
        setIsPlaying(true);
      } else {
        playAyahAtIndex(activeAyahIndex);
      }
    }
  };

  const handleNextAyah = () => {
    if (activeAyahIndex + 1 < currentAyats.length) {
      setCurrentRepeatIteration(1);
      playAyahAtIndex(activeAyahIndex + 1);
    }
  };

  const handlePrevAyah = () => {
    if (activeAyahIndex > 0) {
      setCurrentRepeatIteration(1);
      playAyahAtIndex(activeAyahIndex - 1);
    }
  };

  const handleBookmarkAyah = (ayat: Ayat) => {
    saveBookmark({
      surahNumber: ayat.surahNumber,
      ayahNumber: ayat.numberInSurah,
      surahName: currentSurahMeta.latinName,
      arabicText: ayat.arabicText,
      translation: ayat.translation,
      note: 'Ditandai dari Mode Tilawah Al-Qur\'an'
    });
    alert(`Ayat ${ayat.numberInSurah} Surat ${currentSurahMeta.latinName} berhasil ditandai ke Bookmark!`);
  };

  const filteredSurahs = SURAH_LIST.filter((s) => {
    const matchesSearch =
      s.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString().includes(searchQuery) ||
      s.meaning.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (juzFilterTab === 29) return s.number >= 67 && s.number <= 77;
    if (juzFilterTab === 30) return s.number >= 78 && s.number <= 114;
    if (juzFilterTab === 'popular') return [1, 18, 36, 55, 56, 67, 78, 112, 113, 114].includes(s.number);
    return true;
  });

  return (
    <div className={`space-y-4 pb-28 max-w-4xl mx-auto transition-all ${isFocusMode ? 'bg-[#F8F5EE] py-4' : ''}`}>
      {/* 1. DAILY TARGET WIDGET (TARGET TILAWAH HARI INI) */}
      {!isFocusMode && (
        <DailyTargetWidget
          onStartTarget={(target) => {
            setSelectedSurahNumber(target.surahNumber);
          }}
          onTargetChanged={(newTarget) => {
            setDailyTarget(newTarget);
            setSelectedSurahNumber(newTarget.surahNumber);
          }}
        />
      )}

      {/* HEADER & SURAH SELECTOR */}
      {/* Header & Surah Selector */}
      {!isFocusMode && (
        <div className="bg-gradient-to-r from-[#0B4627] to-[#06331D] text-white rounded-2xl p-5 sm:p-6 border border-emerald-800/80 shadow-xs relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 rounded-full border border-amber-400/30 uppercase tracking-wide flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Studio Tilawah & Murottal
                </span>
                <div className="relative inline-block">
                  <button
                    onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
                    className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 rounded-lg border border-emerald-600/40 flex items-center gap-1 cursor-pointer transition"
                    title="Ganti Qari / Syekh Tilawah"
                  >
                    <Headphones className="w-3.5 h-3.5 text-amber-300" />
                    <span>{activeReciter.name}</span>
                    <ChevronDown className="w-3 h-3 text-emerald-300" />
                  </button>

                  {/* Dropdown Reciter Menu */}
                  {isReciterMenuOpen && (
                    <div className="absolute left-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 space-y-1">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-900 dark:text-white">
                        <span className="text-[11px] font-bold text-[#0B4627] dark:text-emerald-400">Pilih Qari ({RECITERS_LIST.length} Tersedia):</span>
                        <button
                          onClick={() => setIsReciterMenuOpen(false)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
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
                              onClick={() => {
                                audioPlayer.setActiveReciter(r.id);
                                setActiveReciter(r);
                                setIsReciterMenuOpen(false);
                                if (isPlaying) {
                                  audioPlayer.playAyat(selectedSurahNumber, currentAyats[activeAyahIndex]?.numberInSurah || 1);
                                }
                              }}
                              className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0B4627] text-white'
                                  : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <p className="text-xs font-semibold truncate">{r.name}</p>
                                <p className={`text-[10px] ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                                  {r.style}
                                </p>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium shrink-0 border ${
                                isSelected ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-200 text-slate-700 border-slate-300'
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
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                Tilawah & Murottal Berkelanjutan
              </h2>
              <p className="text-xs text-emerald-200/90 font-normal mt-0.5">
                Dengarkan lantunan tartil ayat per ayat secara otomatis dengan audio kualitas jernih.
              </p>
            </div>

            {/* Focus Mode Button */}
            <button
              onClick={() => setIsFocusMode(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition shadow-xs"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Mode Khusyuk</span>
            </button>
          </div>

          {/* Surah Picker Button & Shortcuts */}
          <div className="mt-4 pt-4 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-3">
            {/* Click to open Full Searchable Modal */}
            <button
              onClick={() => setIsSurahModalOpen(true)}
              className="flex-1 min-w-[240px] px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-mono text-xs font-bold">
                  {selectedSurahNumber}
                </span>
                <span className="text-sm font-semibold">
                  QS. {currentSurahMeta.latinName} ({currentSurahMeta.ayahCount} Ayat • Juz {currentSurahMeta.juzList ? currentSurahMeta.juzList.join(', ') : currentSurahMeta.juzStart})
                </span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-800/80 rounded-md text-[10px] font-medium text-emerald-200 flex items-center gap-1">
                <span>Ganti Surat</span>
                <ChevronDown className="w-3 h-3" />
              </span>
            </button>

            {/* Quick Juz Jump */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelectedSurahNumber(67)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  selectedSurahNumber === 67
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                Juz 29 (Al-Mulk)
              </button>
              <button
                onClick={() => setSelectedSurahNumber(78)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  selectedSurahNumber === 78
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                Juz 30 (An-Naba')
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Searchable Surah Picker Modal */}
      {isSurahModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-4 pt-3 sm:pt-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-[#0B4627] text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Daftar 114 Surat Al-Qur'an</h4>
                <p className="text-xs text-emerald-200/90 mt-0.5">Pilih surat yang ingin dilantunkan dalam Tilawah</p>
              </div>
              <button
                onClick={() => setIsSurahModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari surat (contoh: Al-Mulk, Yasin, Al-Kahf, 67)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
                  autoFocus
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="px-3 py-2 bg-slate-50/70 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {[
                { id: 'all' as const, label: 'Semua 114 Surat' },
                { id: 29 as const, label: 'Juz 29 (67-77)' },
                { id: 30 as const, label: 'Juz 30 (78-114)' },
                { id: 'popular' as const, label: 'Surat Pilihan' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setJuzFilterTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg shrink-0 cursor-pointer font-medium transition ${
                    juzFilterTab === tab.id
                      ? 'bg-[#0B4627] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Surah List Scrollable */}
            <div className="p-3 overflow-y-auto space-y-1.5 flex-1 max-h-96">
              {filteredSurahs.map((s) => {
                const isSelected = s.number === selectedSurahNumber;
                return (
                  <button
                    key={s.number}
                    onClick={() => {
                      setSelectedSurahNumber(s.number);
                      setIsSurahModalOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B4627] text-white border-[#0B4627] shadow-xs'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>#{s.number}</span>
                        <span className="font-semibold text-xs">{s.latinName}</span>
                        <span className="text-[10px] opacity-75">({s.meaning})</span>
                      </div>
                      <span className="text-[10px] opacity-80 block mt-0.5">
                        {s.ayahCount} Ayat • Juz {s.juzStart} • {s.revelationPlace}
                      </span>
                    </div>

                    <span className="font-quran text-lg font-bold">{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Focus Mode Exit Bar */}
      {isFocusMode && (
        <div className="flex items-center justify-between p-3 bg-[#0B4627] text-white rounded-xl shadow-md">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-xs font-semibold rounded-md">
              Mode Khusyuk
            </span>
            <span className="text-xs font-medium">QS. {currentSurahMeta.latinName} ({currentSurahMeta.ayahCount} Ayat)</span>
          </div>
          <button
            onClick={() => setIsFocusMode(false)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Kembali Normal</span>
          </button>
        </div>
      )}

      {/* Audio Controller Bar */}
      <div className="sticky top-20 z-40 bg-gradient-to-r from-[#06331D] via-[#0B4627] to-[#042413] border border-emerald-700/70 rounded-2xl p-4 shadow-lg text-white space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Active Ayah Info */}
          <div>
            <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider block">
              Sedang Membaca / Memutar:
            </span>
            <h4 className="text-base font-bold text-white">
              QS. {currentSurahMeta.latinName} : Ayat {activeAyahIndex + 1} dari {currentAyats.length}
            </h4>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevAyah}
              disabled={activeAyahIndex === 0}
              className="p-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-xl cursor-pointer transition"
              title="Ayat Sebelumnya"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Jeda Tilawah' : 'Putar Tilawah'}</span>
            </button>

            <button
              onClick={handleNextAyah}
              disabled={activeAyahIndex + 1 >= currentAyats.length}
              className="p-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-xl cursor-pointer transition"
              title="Ayat Selanjutnya"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Repeat & View Toggles */}
        <div className="pt-2 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tikrar Repeat Count */}
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-200/90 font-medium flex items-center gap-1">
              <Repeat className="w-3.5 h-3.5 text-amber-300" /> Ulang Ayat:
            </span>
            {[1, 3, 5, 10].map((count) => (
              <button
                key={count}
                onClick={() => { setRepeatCount(count); setCurrentRepeatIteration(1); }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer transition ${
                  repeatCount === count
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-black/30 text-emerald-200 hover:bg-black/40'
                }`}
              >
                {count}x
              </button>
            ))}
            {repeatCount > 1 && (
              <span className="text-[10px] text-emerald-300 ml-1">
                (Putaran ke-{currentRepeatIteration}/{repeatCount})
              </span>
            )}
          </div>

          {/* Display Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition ${
                showTranslation ? 'bg-emerald-700 text-white' : 'bg-black/30 text-emerald-300/70 hover:bg-black/40'
              }`}
            >
              Terjemah
            </button>
            <button
              onClick={() => setShowTransliteration(!showTransliteration)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition ${
                showTransliteration ? 'bg-emerald-700 text-white' : 'bg-black/30 text-emerald-300/70 hover:bg-black/40'
              }`}
            >
              Latin
            </button>
            <div className="flex items-center gap-1 ml-2">
              <span className="text-[10px] text-emerald-200/70">Font:</span>
              <button
                onClick={() => setFontSize(Math.max(24, fontSize - 4))}
                className="px-2 py-0.5 bg-black/30 hover:bg-black/50 rounded text-[10px] font-mono transition"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize(Math.min(48, fontSize + 4))}
                className="px-2 py-0.5 bg-black/30 hover:bg-black/50 rounded text-[10px] font-mono transition"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ayat List Container with Active Highlight */}
      <div className="space-y-4">
        {currentAyats.map((ayat, index) => {
          const isActive = index === activeAyahIndex;

          return (
            <div
              key={ayat.numberInSurah}
              ref={(el) => { ayahRefs.current[index] = el; }}
              className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 shadow-xs ring-1 ring-amber-400/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-emerald-300 transition-all'
              }`}
            >
              {/* Header Ayat Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                      isActive ? 'bg-[#0B4627] text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {ayat.numberInSurah}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    QS. {currentSurahMeta.latinName} : Ayat {ayat.numberInSurah}
                  </span>
                  {isActive && isPlaying && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 animate-pulse">
                      <Volume2 className="w-3 h-3 text-emerald-600" /> Sedang Dilantunkan
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => playAyahAtIndex(index)}
                    className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                    title="Putar dari ayat ini"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span className="hidden sm:inline">Putar</span>
                  </button>

                  <button
                    onClick={() => handleBookmarkAyah(ayat)}
                    className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition"
                    title="Tandai Bookmark"
                  >
                    <BookmarkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Rasm Utsmani Arabic Text */}
              <div
                style={{ fontSize: `${fontSize}px` }}
                className="font-quran text-right leading-loose py-2 text-slate-900 dark:text-white select-none font-bold"
                dir="rtl"
              >
                {ayat.arabicText}
              </div>

              {/* Latin Transliteration */}
              {showTransliteration && ayat.transliteration && (
                <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium mt-2">
                  {ayat.transliteration}
                </p>
              )}

              {/* Indonesian Translation */}
              {showTranslation && ayat.translation && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                  "{ayat.translation}"
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

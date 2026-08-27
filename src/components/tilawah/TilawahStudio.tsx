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
  Target
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
      {/* 🎯 1. DAILY TARGET WIDGET (TARGET TILAWAH HARI INI) */}
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
      {!isFocusMode && (
        <NeobrutalCard variant="emerald" className="p-4 sm:p-5 relative shadow-[3px_3px_0px_0px_#111827] border-2 border-black">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-xs font-black bg-[#F59E0B] text-black rounded border border-black uppercase flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Studio Tilawah & Murottal
                </span>
                <div className="relative inline-block">
                  <button
                    onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
                    className="px-2.5 py-0.5 text-xs font-black bg-[#F59E0B] hover:bg-[#D97706] text-black rounded border border-black flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                    title="Ganti Qari / Syekh Tilawah"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>{activeReciter.name}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {/* Dropdown Reciter Menu */}
                  {isReciterMenuOpen && (
                    <div className="absolute left-0 top-full mt-2 w-72 bg-white border-3 border-black rounded-2xl p-2 shadow-[6px_6px_0px_0px_#000] z-50 animate-in fade-in zoom-in-95 space-y-1">
                      <div className="p-1.5 border-b-2 border-black flex items-center justify-between text-black">
                        <span className="text-[11px] font-black text-[#0B4627]">Pilih Qari / Syekh Murottal:</span>
                        <button
                          onClick={() => setIsReciterMenuOpen(false)}
                          className="text-xs font-bold text-gray-500 hover:text-black"
                        >
                          ✕
                        </button>
                      </div>
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
                  )}
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                Tilawah & Murottal Berkelanjutan
              </h2>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                Dengarkan dan ikuti lantunan tartil ayat per ayat secara otomatis dengan audio HD Studio Master.
              </p>
            </div>

            {/* Focus Mode Button */}
            <button
              onClick={() => setIsFocusMode(true)}
              className="px-3.5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 neo-button cursor-pointer shrink-0"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Mode Khusyuk</span>
            </button>
          </div>

          {/* SURAH PICKER BUTTON & SHORTCUTS */}
          <div className="mt-4 pt-4 border-t border-emerald-700/50 flex flex-wrap items-center justify-between gap-3">
            {/* Click to open Full Searchable Modal */}
            <button
              onClick={() => setIsSurahModalOpen(true)}
              className="flex-1 min-w-[240px] px-4 py-3 bg-white text-black border-2 border-black rounded-xl text-xs font-black flex items-center justify-between shadow-[3px_3px_0px_0px_#000] hover:bg-amber-50 cursor-pointer neo-button"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#0B4627] text-white flex items-center justify-center font-mono text-xs">
                  {selectedSurahNumber}
                </span>
                <span className="text-sm font-extrabold">
                  QS. {currentSurahMeta.latinName} ({currentSurahMeta.ayahCount} Ayat • Juz {currentSurahMeta.juzList ? currentSurahMeta.juzList.join(', ') : currentSurahMeta.juzStart})
                </span>
              </div>
              <span className="px-2 py-1 bg-amber-100 border border-black rounded-lg text-[10px] font-black uppercase text-amber-900">
                Pilih Surat Lain ▾
              </span>
            </button>

            {/* Quick Juz Jump (Juz 29 & 30 Shortcut) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelectedSurahNumber(67)}
                className={`px-3 py-2 border-2 border-black rounded-xl text-xs font-black cursor-pointer transition-all ${
                  selectedSurahNumber === 67 ? 'bg-[#0B4627] text-[#F59E0B] shadow-[2px_2px_0px_0px_#000]' : 'bg-[#F59E0B] text-black hover:bg-[#D97706]'
                }`}
              >
                Juz 29 (Al-Mulk)
              </button>
              <button
                onClick={() => setSelectedSurahNumber(78)}
                className={`px-3 py-2 border-2 border-black rounded-xl text-xs font-black cursor-pointer transition-all ${
                  selectedSurahNumber === 78 ? 'bg-[#0B4627] text-[#10B981] shadow-[2px_2px_0px_0px_#000]' : 'bg-[#10B981] text-black hover:bg-[#059669]'
                }`}
              >
                Juz 30 (An-Naba')
              </button>
            </div>
          </div>
        </NeobrutalCard>
      )}

      {/* SEARCHABLE SURAH PICKER MODAL (FLOATING AT THE TOP) */}
      {isSurahModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center p-3 sm:p-4 pt-3 sm:pt-6 overflow-y-auto">
          <div className="bg-white border-3 border-black rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-[8px_8px_0px_0px_#000] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-[#0B4627] text-white border-b-3 border-black flex items-center justify-between">
              <div>
                <h4 className="text-base font-black">Daftar 114 Surat Al-Qur'an</h4>
                <p className="text-xs text-emerald-200">Pilih surat yang ingin dilantunkan dalam Tilawah</p>
              </div>
              <button
                onClick={() => setIsSurahModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white text-black font-black text-sm flex items-center justify-center border-2 border-black cursor-pointer hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b-2 border-black bg-amber-50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari surat (contoh: Al-Mulk, Yasin, Al-Kahf, 67)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
                  autoFocus
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="px-3 py-2 bg-gray-100 border-b border-gray-300 flex items-center gap-1.5 overflow-x-auto text-[11px] font-black">
              {[
                { id: 'all' as const, label: 'Semua 114 Surat' },
                { id: 29 as const, label: 'Juz 29 (67-77)' },
                { id: 30 as const, label: 'Juz 30 (78-114)' },
                { id: 'popular' as const, label: 'Surat Pilihan' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setJuzFilterTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg border-2 border-black shrink-0 cursor-pointer font-bold ${
                    juzFilterTab === tab.id
                      ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                      : 'bg-white text-black hover:bg-amber-100'
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
                    className={`w-full p-2.5 rounded-xl border-2 border-black text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white hover:bg-amber-50 text-black'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black">#{s.number}</span>
                        <span className="font-extrabold text-xs">{s.latinName}</span>
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

      {/* FOCUS MODE EXIT BAR */}
      {isFocusMode && (
        <div className="flex items-center justify-between p-3 bg-[#0B4627] text-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#F59E0B] text-black text-xs font-black rounded border border-black">
              Mode Khusyuk
            </span>
            <span className="text-xs font-extrabold">QS. {currentSurahMeta.latinName} ({currentSurahMeta.ayahCount} Ayat)</span>
          </div>
          <button
            onClick={() => setIsFocusMode(false)}
            className="px-3 py-1 bg-white text-black text-xs font-black border-2 border-black rounded-xl flex items-center gap-1 neo-button cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Kembali Normal</span>
          </button>
        </div>
      )}

      {/* FLOATING / STICKY AUDIO CONTROLLER BAR */}
      <div className="sticky top-20 z-40 bg-[#0D2418] border-3 border-black rounded-2xl p-4 shadow-[6px_6px_0px_0px_#F59E0B] text-white space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Active Ayah Info */}
          <div>
            <span className="text-[10px] font-black text-[#F59E0B] uppercase tracking-wider block">
              Sedang Membaca / Memutar:
            </span>
            <h4 className="text-base font-black text-white">
              QS. {currentSurahMeta.latinName} : Ayat {activeAyahIndex + 1} dari {currentAyats.length}
            </h4>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevAyah}
              disabled={activeAyahIndex === 0}
              className="p-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white border-2 border-black rounded-xl cursor-pointer"
              title="Ayat Sebelumnya"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-black border-2 border-black rounded-xl font-black text-xs flex items-center gap-2 neo-button shadow-[2px_2px_0px_0px_#000] cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
              <span>{isPlaying ? 'Jeda Tilawah' : 'Putar Tilawah'}</span>
            </button>

            <button
              onClick={handleNextAyah}
              disabled={activeAyahIndex + 1 >= currentAyats.length}
              className="p-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white border-2 border-black rounded-xl cursor-pointer"
              title="Ayat Selanjutnya"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* REPEAT (TIKRAR) & VIEW TOGGLES */}
        <div className="pt-2 border-t border-emerald-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tikrar Repeat Count */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-300 font-bold flex items-center gap-1">
              <Repeat className="w-3.5 h-3.5 text-[#F59E0B]" /> Ulang Ayat:
            </span>
            {[1, 3, 5, 10].map((count) => (
              <button
                key={count}
                onClick={() => { setRepeatCount(count); setCurrentRepeatIteration(1); }}
                className={`px-2 py-0.5 rounded border text-[11px] font-black cursor-pointer ${
                  repeatCount === count
                    ? 'bg-[#F59E0B] text-black border-black'
                    : 'bg-black/40 text-gray-300 border-white/20 hover:text-white'
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
              className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                showTranslation ? 'bg-[#10B981] text-black border-black' : 'bg-black/30 text-gray-400 border-white/20'
              }`}
            >
              Terjemah
            </button>
            <button
              onClick={() => setShowTransliteration(!showTransliteration)}
              className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                showTransliteration ? 'bg-[#10B981] text-black border-black' : 'bg-black/30 text-gray-400 border-white/20'
              }`}
            >
              Latin
            </button>
            <div className="flex items-center gap-1 ml-2">
              <span className="text-[10px] text-gray-400">Font:</span>
              <button
                onClick={() => setFontSize(Math.max(24, fontSize - 4))}
                className="px-1.5 py-0.5 bg-black/40 border border-white/20 rounded text-[10px] font-mono hover:text-white"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize(Math.min(48, fontSize + 4))}
                className="px-1.5 py-0.5 bg-black/40 border border-white/20 rounded text-[10px] font-mono hover:text-white"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AYAT LIST CONTAINER WITH ACTIVE KARAOKE HIGHLIGHT */}
      <div className="space-y-4">
        {currentAyats.map((ayat, index) => {
          const isActive = index === activeAyahIndex;

          return (
            <div
              key={ayat.numberInSurah}
              ref={(el) => { ayahRefs.current[index] = el; }}
              className={`p-5 sm:p-6 rounded-2xl border-3 border-black transition-all ${
                isActive
                  ? 'bg-[#FEF3C7] shadow-[6px_6px_0px_0px_#F59E0B] scale-[1.01] ring-2 ring-[#0B4627]'
                  : 'bg-white shadow-[3px_3px_0px_0px_#111827] hover:bg-amber-50/50'
              }`}
            >
              {/* Header Ayat Bar */}
              <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center font-mono text-xs font-black ${
                      isActive ? 'bg-[#0B4627] text-white' : 'bg-[#F59E0B] text-black'
                    }`}
                  >
                    {ayat.numberInSurah}
                  </span>
                  <span className="text-xs font-black text-gray-700">
                    QS. {currentSurahMeta.latinName} : Ayat {ayat.numberInSurah}
                  </span>
                  {isActive && isPlaying && (
                    <span className="px-2 py-0.5 text-[10px] font-black bg-[#10B981] text-black rounded border border-black flex items-center gap-1 animate-pulse">
                      <Volume2 className="w-3 h-3" /> Sedang Dilantunkan
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => playAyahAtIndex(index)}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 text-black border-2 border-black rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer"
                    title="Putar dari ayat ini"
                  >
                    <Play className="w-3 h-3 fill-black" />
                    <span className="hidden sm:inline">Putar</span>
                  </button>

                  <button
                    onClick={() => handleBookmarkAyah(ayat)}
                    className="p-1.5 bg-white hover:bg-amber-100 text-black border-2 border-black rounded-lg cursor-pointer"
                    title="Tandai Bookmark"
                  >
                    <BookmarkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Rasm Utsmani Arabic Text */}
              <div
                style={{ fontSize: `${fontSize}px` }}
                className="font-quran text-right leading-loose py-2 text-black select-none font-bold"
                dir="rtl"
              >
                {ayat.arabicText}
              </div>

              {/* Latin Transliteration */}
              {showTransliteration && ayat.transliteration && (
                <p className="text-xs text-emerald-800 font-semibold mt-2">
                  {ayat.transliteration}
                </p>
              )}

              {/* Indonesian Translation */}
              {showTranslation && ayat.translation && (
                <p className="text-xs text-gray-700 italic mt-1.5 border-t border-dashed border-gray-200 pt-2">
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

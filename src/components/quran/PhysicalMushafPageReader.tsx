import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Play, 
  Pause, 
  Headphones, 
  ChevronDown, 
  Bookmark as BookmarkIcon, 
  Maximize2, 
  Minimize2, 
  Info,
  Layers,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Palette,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Check,
  Volume2,
  VolumeX
} from 'lucide-react';
import { 
  SURAH_LIST, 
  JUZ_MAP, 
  SURAH_PAGE_STARTS, 
  getJuzForPage, 
  getPrimarySurahForPage, 
  getMadinahPageFallbackUrls 
} from '../../data/quranData';
import { 
  getMadinahPageLines, 
  getMadinahPageSurahs, 
  MushafLine 
} from '../../services/madinahPageService';
import { 
  analyzePageTajweedRules, 
  getPageGharibRules, 
  getTajweedColorForWord,
  TajwidRuleItem,
  GharibItem,
  MASTER_TAJWEED_ENCYCLOPEDIA,
  TajweedEncyclopediaEntry 
} from '../../services/quranTajweedGharibService';
import { audioPlayer, RECITERS_LIST, Reciter } from '../../services/audioPlayerService';
import { saveBookmark, setLastRead } from '../../services/offlineStorage';
import { useLanguage } from '../../context/LanguageContext';

const STORAGE_LAST_PAGE = 'quranverse_physical_mushaf_last_page_v1';
const STORAGE_PAGE_SOUND = 'quranverse_mushaf_page_sound_v1';

export type MushafPageLine = MushafLine;

/**
 * Generates an organic, whisper-soft synthetic paper rustle sound when flipping pages.
 * 100% offline & instantaneous via Web Audio API.
 */
function playPageTurnSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const bufferSize = Math.floor(ctx.sampleRate * 0.12);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1100;
    filter.Q.value = 0.9;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.045, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    whiteNoise.start();
  } catch {}
}

export const PhysicalMushafPageReader: React.FC = () => {
  const { language } = useLanguage();
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LAST_PAGE);
      if (saved) {
        const p = parseInt(saved, 10);
        if (p >= 1 && p <= 604) return p;
      }
    } catch {}
    return 1;
  });

  const [activeReciter, setActiveReciter] = useState<Reciter>(audioPlayer.getActiveReciter());
  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState(false);
  const [isPlayingPageAudio, setIsPlayingPageAudio] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Swipe & Drag Gesture State (Efek Geser Lembaran Mushaf Madinah Asli)
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [slidePhase, setSlidePhase] = useState<'idle' | 'sliding-out' | 'sliding-in'>('idle');
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
  const [pageSoundEnabled, setPageSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PAGE_SOUND);
      return saved !== 'false';
    } catch {
      return true;
    }
  });
  const dragStartTimeRef = useRef<number>(0);

  // Display Mode: 'scan' (Scanned Page Image - Physical Mushaf) | 'layout' (15-line Typography)
  const [viewMode, setViewMode] = useState<'scan' | 'layout'>('scan');
  const [mushafLines, setMushafLines] = useState<MushafPageLine[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);

  // Tajweed & Gharib State
  const [activeTajweedTab, setActiveTajweedTab] = useState<'tajweed' | 'gharib' | 'legend' | 'encyclopedia'>('tajweed');
  const [selectedTajweedWord, setSelectedTajweedWord] = useState<{ word: string; ruleName: string } | null>(null);
  const [encyclopediaSearch, setEncyclopediaSearch] = useState<string>('');
  const [encyclopediaCategory, setEncyclopediaCategory] = useState<string>('Semua');

  // Scan Image State
  const [scanLoaded, setScanLoaded] = useState<boolean>(false);
  const [scanError, setScanError] = useState<boolean>(false);
  const [scanUrlIndex, setScanUrlIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const primarySurah = useMemo(() => getPrimarySurahForPage(currentPage), [currentPage]);
  const juzNumber = useMemo(() => getJuzForPage(currentPage), [currentPage]);
  const fallbackUrls = useMemo(() => getMadinahPageFallbackUrls(currentPage), [currentPage]);

  const pageSurahs = useMemo(() => getMadinahPageSurahs(currentPage, primarySurah), [currentPage, primarySurah]);
  const pageSurahsLatinLabel = useMemo(() => pageSurahs
    .map((s) => `${s.surahLatin} (${s.startAyah === s.endAyah ? `Ayat ${s.startAyah}` : `Ayat ${s.startAyah}–${s.endAyah}`})`)
    .join(' • '), [pageSurahs]);
  const pageSurahsArabicLabel = useMemo(() => pageSurahs
    .map((s) => s.surahArabic)
    .join(' • '), [pageSurahs]);

  const pageTajweedData = useMemo(() => analyzePageTajweedRules(mushafLines), [mushafLines]);
  const pageGharibData = useMemo(() => getPageGharibRules(currentPage), [currentPage]);

  const filteredEncyclopedia = useMemo(() => MASTER_TAJWEED_ENCYCLOPEDIA.filter((item) => {
    const matchesCat = encyclopediaCategory === 'Semua' || item.category === encyclopediaCategory;
    const q = encyclopediaSearch.trim().toLowerCase();
    const matchesSearch = !q || 
      item.title.toLowerCase().includes(q) ||
      item.arabicName.includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.contohLafadz.toLowerCase().includes(q) ||
      (item.letters && item.letters.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  }), [encyclopediaCategory, encyclopediaSearch]);

  // Toggle paper rustle sound
  const handleToggleSound = () => {
    setPageSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_PAGE_SOUND, String(next));
      } catch {}
      if (next) playPageTurnSound();
      return next;
    });
  };

  // Toast Auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioPlayer.stop();
    };
  }, []);

  // Preload adjacent scanned pages for instant flipping
  useEffect(() => {
    const nextP = currentPage < 604 ? currentPage + 1 : 1;
    const prevP = currentPage > 1 ? currentPage - 1 : 604;
    const urlsNext = getMadinahPageFallbackUrls(nextP);
    const urlsPrev = getMadinahPageFallbackUrls(prevP);
    if (urlsNext[0]) {
      const img1 = new Image();
      img1.src = urlsNext[0];
    }
    if (urlsPrev[0]) {
      const img2 = new Image();
      img2.src = urlsPrev[0];
    }
  }, [currentPage]);

  // Load authentic 15-Line Madinah Mushaf dataset (100% offline & instantaneous)
  useEffect(() => {
    setIsLoadingPage(true);
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('quranverse_mushaf_layout_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}

    const lines = getMadinahPageLines(currentPage);
    setMushafLines(lines as MushafPageLine[]);
    setIsLoadingPage(false);
  }, [currentPage, reloadKey]);

  // Reset scan state on page change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LAST_PAGE, String(currentPage));
      const firstSurah = pageSurahs[0] || { surahNumber: primarySurah.number, startAyah: 1 };
      setLastRead(firstSurah.surahNumber, firstSurah.startAyah, `Halaman ${currentPage} (${pageSurahsLatinLabel})`);
    } catch {}

    setScanLoaded(false);
    setScanError(false);
    setScanUrlIndex(0);

    if (isPlayingPageAudio) {
      audioPlayer.stop();
      setIsPlayingPageAudio(false);
    }
  }, [currentPage]);

  // Trigger Page Slide Animation (RTL Quran standard: Left Swipe = Next Page, Right Swipe = Prev Page)
  const triggerPageTurn = useCallback((dir: 'next' | 'prev') => {
    if (isTransitioning) return;
    if (dir === 'next' && currentPage >= 604) {
      setDragOffset(35);
      setTimeout(() => setDragOffset(0), 220);
      setToastMessage('📖 Anda telah berada di halaman terakhir (Surat An-Nas / Halaman 604)');
      return;
    }
    if (dir === 'prev' && currentPage <= 1) {
      setDragOffset(-35);
      setTimeout(() => setDragOffset(0), 220);
      setToastMessage('📖 Anda telah berada di halaman pertama (Surat Al-Fatihah / Halaman 1)');
      return;
    }

    if (pageSoundEnabled) {
      playPageTurnSound();
    }

    setIsTransitioning(true);
    setSlideDirection(dir);
    setSlidePhase('sliding-out');

    // Slide out smoothly with 3D perspective fold
    const targetOffset = dir === 'next' ? -380 : 380;
    setDragOffset(targetOffset);

    setTimeout(() => {
      if (dir === 'next') {
        setCurrentPage((prev) => Math.min(604, prev + 1));
      } else {
        setCurrentPage((prev) => Math.max(1, prev - 1));
      }

      setSlidePhase('sliding-in');
      setDragOffset(dir === 'next' ? 140 : -140);

      requestAnimationFrame(() => {
        setTimeout(() => {
          setDragOffset(0);
          setTimeout(() => {
            setSlidePhase('idle');
            setSlideDirection(null);
            setIsTransitioning(false);
          }, 340);
        }, 30);
      });
    }, 220);
  }, [currentPage, isTransitioning, pageSoundEnabled]);

  const handleNextPage = useCallback(() => { 
    triggerPageTurn('next');
  }, [triggerPageTurn]);

  const handlePrevPage = useCallback(() => { 
    triggerPageTurn('prev');
  }, [triggerPageTurn]);

  const handleJumpToJuz = (juz: number) => {
    const targetPage = juz === 1 ? 1 : Math.min(604, (juz - 1) * 20 + 2);
    if (pageSoundEnabled) playPageTurnSound();
    setCurrentPage(targetPage);
  };

  const handleJumpToSurah = (surahNumber: number) => {
    const targetPage = SURAH_PAGE_STARTS[surahNumber] || 1;
    if (pageSoundEnabled) playPageTurnSound();
    setCurrentPage(targetPage);
  };

  const handleSelectReciter = (reciter: Reciter) => {
    audioPlayer.setActiveReciter(reciter.id);
    setActiveReciter(reciter);
    setIsReciterMenuOpen(false);
  };

  const handleTogglePageAudio = async () => {
    if (isPlayingPageAudio) {
      audioPlayer.stop();
      setIsPlayingPageAudio(false);
      return;
    }
    setIsPlayingPageAudio(true);
    const startSurah = pageSurahs[0] || { surahNumber: primarySurah.number, startAyah: 1 };
    await audioPlayer.playAyat(startSurah.surahNumber, startSurah.startAyah, () => {
      setIsPlayingPageAudio(false);
    }, activeReciter.id);
  };

  const handleBookmarkPage = () => {
    const startSurah = pageSurahs[0] || { surahNumber: primarySurah.number, startAyah: 1 };
    saveBookmark({
      surahNumber: startSurah.surahNumber,
      ayahNumber: startSurah.startAyah,
      surahName: `Halaman ${currentPage} - ${pageSurahsLatinLabel}`,
      arabicText: `مصحف المدينة المنورة - الصفحة ${currentPage}`,
      translation: `Tanda Baca Halaman ${currentPage} (Juz ${juzNumber} • ${pageSurahsLatinLabel})`,
      note: `Ditandai dari Mode Mushaf Fisik Asli (Halaman ${currentPage})`
    });
    setToastMessage(`🔖 Halaman ${currentPage} (${pageSurahsLatinLabel}) berhasil disimpan ke Bookmark!`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 'ArrowLeft') {
        handleNextPage();
      } else if (e.key === 'ArrowRight') {
        handlePrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPage, handlePrevPage]);

  // Touch Swipe Handlers (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    dragStartTimeRef.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || dragStartX === null || isTransitioning) return;
    const currentX = e.touches[0].clientX;
    const diffX = currentX - dragStartX;
    if ((currentPage >= 604 && diffX < 0) || (currentPage <= 1 && diffX > 0)) {
      setDragOffset(diffX * 0.25);
    } else {
      const clamped = Math.max(-240, Math.min(240, diffX));
      setDragOffset(clamped);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragStartX(null);

    const elapsed = Date.now() - dragStartTimeRef.current;
    const isFlick = elapsed < 250 && Math.abs(dragOffset) > 20;

    if (dragOffset < -40 || (isFlick && dragOffset < -15)) {
      triggerPageTurn('next');
    } else if (dragOffset > 40 || (isFlick && dragOffset > 15)) {
      triggerPageTurn('prev');
    } else {
      setDragOffset(0);
    }
  };

  // Mouse Drag Handlers (Desktop Interactive Swipe)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isTransitioning) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    dragStartTimeRef.current = Date.now();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragStartX === null || isTransitioning) return;
    const diffX = e.clientX - dragStartX;
    if ((currentPage >= 604 && diffX < 0) || (currentPage <= 1 && diffX > 0)) {
      setDragOffset(diffX * 0.25);
    } else {
      const clamped = Math.max(-240, Math.min(240, diffX));
      setDragOffset(clamped);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragStartX(null);

    const elapsed = Date.now() - dragStartTimeRef.current;
    const isFlick = elapsed < 250 && Math.abs(dragOffset) > 20;

    if (dragOffset < -40 || (isFlick && dragOffset < -15)) {
      triggerPageTurn('next');
    } else if (dragOffset > 40 || (isFlick && dragOffset > 15)) {
      triggerPageTurn('prev');
    } else {
      setDragOffset(0);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStartX(null);
      setDragOffset(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`space-y-4 max-w-4xl mx-auto transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#F8F5EE] p-4 overflow-y-auto max-w-none' : ''
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-4 py-2.5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs font-bold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-[#FFFDF7] dark:bg-[#1E293B] border-3 border-black rounded-2xl p-3 sm:p-4 shadow-[4px_4px_0px_0px_#111827] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#F59E0B] text-black border-2 border-black rounded-xl flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-black dark:text-white flex items-center gap-1.5">
                <span>{language === 'ar' ? `مصحف المدينة (صفحة ${currentPage})` : `Mushaf Madinah (Hal. ${currentPage})`}</span>
                <span className="text-[10px] bg-[#0B4627] text-[#F59E0B] px-1.5 py-0.5 rounded-md font-mono font-bold border border-black">
                  {currentPage} / 604
                </span>
              </h3>
              <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                Juz {juzNumber} • {pageSurahsLatinLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000]">
              <button
                onClick={() => setViewMode('scan')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'scan' 
                    ? 'bg-[#0B4627] text-white shadow-xs' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-black'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Scan Asli Fisik</span>
              </button>
              <button
                onClick={() => setViewMode('layout')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'layout' 
                    ? 'bg-[#0B4627] text-white shadow-xs' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-black'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>15 Baris Teks</span>
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
                className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-black border-2 border-black rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                title="Pilih Qari Tilawah"
              >
                <Headphones className="w-3.5 h-3.5 text-[#0B4627]" />
                <span className="max-w-[110px] truncate hidden sm:inline">{activeReciter.name}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isReciterMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white border-3 border-black rounded-2xl shadow-[6px_6px_0px_0px_#111827] z-50 p-2 space-y-1">
                  <div className="px-2 py-1 border-b border-black font-black text-xs text-gray-700 flex justify-between items-center">
                    <span>Pilih Qari Tilawah:</span>
                    <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 rounded font-black text-amber-900">{RECITERS_LIST.length} Qari</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                    {RECITERS_LIST.map((r) => {
                      const isSelected = r.id === activeReciter.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => handleSelectReciter(r)}
                          className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#0B4627] text-white font-black shadow-[2px_2px_0px_0px_#000]'
                              : 'hover:bg-amber-100 text-black'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <p className="text-xs font-black truncate">{r.name}</p>
                            <p className={`text-[10px] font-bold ${isSelected ? 'text-amber-300' : 'text-gray-600'}`}>
                              {r.style}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleToggleSound}
              className={`p-1.5 border-2 border-black rounded-xl cursor-pointer shadow-[2px_2px_0px_0px_#000] transition-all ${
                pageSoundEnabled ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-400'
              }`}
              title={pageSoundEnabled ? 'Efek Suara Geser Kertas: AKTIF' : 'Efek Suara Geser Kertas: MATI'}
            >
              {pageSoundEnabled ? <Volume2 className="w-4 h-4 text-[#0B4627]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={handleTogglePageAudio}
              className={`px-3 py-1.5 border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                isPlayingPageAudio ? 'bg-[#F59E0B] text-black animate-pulse' : 'bg-[#10B981] text-white'
              }`}
            >
              {isPlayingPageAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingPageAudio ? 'Jeda Audio' : 'Audio Hal.'}</span>
            </button>

            <button
              onClick={handleBookmarkPage}
              className="p-1.5 bg-white hover:bg-[#FEF3C7] text-black border-2 border-black rounded-xl cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              title="Tandai Halaman Ini (Bookmark)"
            >
              <BookmarkIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 bg-white hover:bg-gray-100 text-black border-2 border-black rounded-xl cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-dashed border-gray-300 text-xs">
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <span className="font-bold text-gray-700 shrink-0">Juz:</span>
            <select
              value={juzNumber}
              onChange={(e) => handleJumpToJuz(Number(e.target.value))}
              className="w-full p-1.5 bg-white border-2 border-black rounded-xl font-bold focus:outline-none"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                <option key={j} value={j}>Juz {j}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4 flex items-center gap-1.5">
            <span className="font-bold text-gray-700 shrink-0">Surat:</span>
            <select
              value={primarySurah.number}
              onChange={(e) => handleJumpToSurah(Number(e.target.value))}
              className="w-full p-1.5 bg-white border-2 border-black rounded-xl font-bold focus:outline-none"
            >
              {SURAH_LIST.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.latinName}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-5 flex items-center gap-2">
            <span className="font-bold text-gray-700 shrink-0">Halaman:</span>
            <input
              type="range"
              min="1"
              max="604"
              value={currentPage}
              onChange={(e) => {
                if (pageSoundEnabled) playPageTurnSound();
                setCurrentPage(Number(e.target.value));
              }}
              className="w-full accent-[#0B4627] cursor-pointer"
            />
            <input
              type="number"
              min="1"
              max="604"
              value={currentPage}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 1 && val <= 604) {
                  if (pageSoundEnabled) playPageTurnSound();
                  setCurrentPage(val);
                }
              }}
              className="w-14 p-1 bg-white border-2 border-black rounded-lg text-center font-bold font-mono text-xs"
            />
          </div>
        </div>
      </div>

      <div 
        className="relative bg-[#FFFDF7] dark:bg-[#1E293B] border-3 border-black rounded-3xl p-3 sm:p-6 shadow-[6px_6px_0px_0px_#111827] flex flex-col items-center justify-center overflow-hidden"
      >
        <div className="w-full flex items-center justify-between border-b-2 border-amber-800/40 pb-2 mb-3 px-2 text-xs font-bold text-amber-900 dark:text-amber-300 font-mono">
          <span className="truncate max-w-[200px] sm:max-w-none text-right font-quran text-sm sm:text-base font-black">
            {pageSurahsArabicLabel}
          </span>
          <span className="font-sans font-black tracking-wider text-[#0B4627] dark:text-[#34D399] px-2 text-center text-[10px] sm:text-xs">
            {language === 'ar' ? 'مصحف المدينة النبوية الشريفة' : 'MUSHAF MADINAH ASLI (604 HALAMAN)'}
          </span>
          <span className="font-quran text-sm sm:text-base font-black">
            الجزء {juzNumber}
          </span>
        </div>

        {/* INTERACTIVE 3D FLIPPABLE / SLIDABLE MUSHAF PAGE FRAME */}
        <div 
          className="relative w-full max-w-2xl bg-[#FFFDF7] border-3 border-amber-900/40 rounded-2xl p-2 sm:p-5 flex flex-col min-h-[580px] sm:min-h-[780px] justify-between cursor-grab active:cursor-grabbing select-none overflow-hidden"
          style={{
            transform: `translateX(${dragOffset}px) rotateY(${dragOffset * 0.055}deg) scale(${Math.max(0.93, 1 - Math.abs(dragOffset) * 0.00035)})`,
            transformOrigin: dragOffset < 0 ? 'right center' : 'left center',
            opacity: isTransitioning && slidePhase === 'sliding-out' 
              ? Math.max(0.2, 1 - Math.abs(dragOffset) / 380) 
              : 1,
            transition: isDragging 
              ? 'none' 
              : 'transform 0.36s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease-out, box-shadow 0.3s ease-out',
            perspective: '1400px',
            transformStyle: 'preserve-3d',
            boxShadow: isDragging || isTransitioning
              ? `${dragOffset > 0 ? '22px' : '-22px'} 12px 35px rgba(0, 0, 0, ${Math.min(0.3, Math.abs(dragOffset) * 0.0012 + 0.08)})`
              : '0 12px 32px rgba(0, 0, 0, 0.09), inset 0 0 25px rgba(180, 83, 9, 0.07)'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Dynamic Paper Lighting & Spine Fold Crease */}
          {(isDragging || isTransitioning) && (
            <div 
              className="absolute inset-0 pointer-events-none z-30 rounded-2xl transition-opacity duration-200"
              style={{
                background: dragOffset < 0 
                  ? 'linear-gradient(to right, transparent 35%, rgba(180,83,9,0.06) 70%, rgba(0,0,0,0.16) 100%)'
                  : 'linear-gradient(to left, transparent 35%, rgba(180,83,9,0.06) 70%, rgba(0,0,0,0.16) 100%)',
                opacity: Math.min(1, Math.abs(dragOffset) / 90)
              }}
            />
          )}

          {/* Floating Flip Target Badge */}
          {(isDragging || (isTransitioning && slidePhase === 'sliding-out')) && Math.abs(dragOffset) > 25 && (
            <div className={`absolute top-5 ${dragOffset < 0 ? 'left-5' : 'right-5'} z-40 bg-emerald-950/95 text-amber-300 backdrop-blur-md px-3.5 py-1.5 rounded-full border-2 border-amber-400/80 shadow-[3px_3px_0px_0px_#000] text-xs font-black flex items-center gap-1.5 animate-fadeIn pointer-events-none`}>
              {dragOffset < 0 ? (
                <>
                  <span>👈 Halaman {Math.min(604, currentPage + 1)}</span>
                  <span className="text-[10px] text-emerald-300 font-normal hidden sm:inline">• Lepas untuk membalik</span>
                </>
              ) : (
                <>
                  <span className="text-[10px] text-emerald-300 font-normal hidden sm:inline">Lepas untuk membalik •</span>
                  <span>Halaman {Math.max(1, currentPage - 1)} 👉</span>
                </>
              )}
            </div>
          )}

          {/* Interactive Golden Corner Peels */}
          {currentPage < 604 && (
            <div 
              onClick={(e) => { e.stopPropagation(); handleNextPage(); }}
              className="absolute bottom-2 left-2 w-8 h-8 rounded-br-2xl group cursor-pointer z-30 transition-transform hover:scale-125"
              title={`Buka Halaman ${currentPage + 1} (👈)`}
            >
              <div className="w-full h-full bg-gradient-to-tr from-amber-400 via-amber-200 to-transparent border-t-2 border-r-2 border-amber-600/70 rounded-tr-lg shadow-sm opacity-60 group-hover:opacity-100 transition-all transform -rotate-12 group-hover:rotate-0"></div>
            </div>
          )}

          {currentPage > 1 && (
            <div 
              onClick={(e) => { e.stopPropagation(); handlePrevPage(); }}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-bl-2xl group cursor-pointer z-30 transition-transform hover:scale-125"
              title={`Buka Halaman ${currentPage - 1} (👉)`}
            >
              <div className="w-full h-full bg-gradient-to-tl from-amber-400 via-amber-200 to-transparent border-t-2 border-l-2 border-amber-600/70 rounded-tl-lg shadow-sm opacity-60 group-hover:opacity-100 transition-all transform rotate-12 group-hover:rotate-0"></div>
            </div>
          )}
          
          <div className="absolute inset-2 border-2 border-dashed border-amber-700/30 rounded-xl pointer-events-none"></div>

          {/* VIEW MODE 1: PHYSICAL SCANNED MADINAH MUSHAF (DEFAULT & 100% AUTHENTIC) */}
          {viewMode === 'scan' && (
            <div className="w-full flex-1 flex items-center justify-center relative min-h-[540px] sm:min-h-[740px] bg-white rounded-xl shadow-inner p-1 sm:p-3 overflow-hidden">
              {!scanLoaded && !scanError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFFDF7]/90 z-10 space-y-2">
                  <div className="w-9 h-9 border-3 border-[#0B4627] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-emerald-950">Membuka Lembaran Halaman {currentPage}...</p>
                </div>
              )}

              {!scanError ? (
                <img
                  src={fallbackUrls[scanUrlIndex] || fallbackUrls[0]}
                  alt={`Halaman ${currentPage} Mushaf Al-Quran Standar Madinah`}
                  onLoad={() => {
                    setScanLoaded(true);
                    setScanError(false);
                  }}
                  onError={() => {
                    if (scanUrlIndex + 1 < fallbackUrls.length) {
                      setScanUrlIndex((prev) => prev + 1);
                    } else {
                      setScanLoaded(false);
                      setScanError(true);
                      setViewMode('layout');
                    }
                  }}
                  className={`w-full max-h-[85vh] object-contain transition-opacity duration-300 pointer-events-none select-none rounded-lg drop-shadow-md ${
                    scanLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <p className="text-xs font-bold text-amber-900">
                    Gambar scan dialihkan otomatis ke mode 15 Baris Teks.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: NATURAL 15-LINE TYPOGRAPHY (CORRECTED WORD SPACING) */}
          {viewMode === 'layout' && (
            <div className="w-full flex-1 flex flex-col justify-between space-y-2 z-10 select-text px-2 py-3" dir="rtl">
              {isLoadingPage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFFDF7]/90 z-20 space-y-2 rounded-2xl">
                  <div className="w-10 h-10 border-4 border-[#0B4627] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-black text-emerald-900">
                    Membuka Baris Halaman {currentPage}...
                  </p>
                </div>
              )}

              {mushafLines.length > 0 ? (
                mushafLines.map((line, idx) => {
                  if (line.type === 'surah-header') {
                    return (
                      <div 
                        key={idx} 
                        className="my-2 p-2 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 border-2 border-amber-800/60 rounded-xl text-center shadow-xs"
                      >
                        <span className="font-quran text-xl sm:text-2xl font-black text-amber-950 block">
                          {line.surahName || `سُورَةُ ${primarySurah.name}`}
                        </span>
                      </div>
                    );
                  }

                  if (line.type === 'basmala') {
                    return (
                      <div key={idx} className="my-1 text-center font-quran text-lg sm:text-xl text-amber-950 font-bold">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={idx}
                      className="w-full font-quran text-lg sm:text-2xl md:text-[25px] text-emerald-950 dark:text-emerald-950 font-bold leading-[2.2] sm:leading-[2.5] text-center tracking-normal py-0.5"
                    >
                      {line.text ? (
                        line.text.split(/\s+/).filter(Boolean).map((w, wIdx, wordsArr) => {
                          const nextW = wordsArr[wIdx + 1] || '';
                          const prevW = wordsArr[wIdx - 1] || '';
                          const isEnd = wIdx === wordsArr.length - 1;
                          const style = getTajweedColorForWord(w, nextW, prevW, isEnd);
                          return (
                            <span
                              key={wIdx}
                              onClick={() => {
                                if (style.ruleName) {
                                  setSelectedTajweedWord({ word: w, ruleName: style.ruleName });
                                }
                              }}
                              className={`inline-block mx-0.5 px-0.5 py-0.2 rounded transition-all cursor-pointer select-text hover:scale-105 ${
                                selectedTajweedWord?.word === w ? 'ring-2 ring-amber-500 bg-amber-100 font-black' : ''
                              }`}
                              style={{
                                color: style.color,
                                backgroundColor: style.bg !== 'transparent' && selectedTajweedWord?.word !== w ? style.bg : undefined
                              }}
                              title={style.ruleName ? `${w} (${style.ruleName})` : w}
                            >
                              {w}
                            </span>
                          );
                        })
                      ) : (
                        <span className="inline font-quran select-text">{line.text}</span>
                      )}
                    </div>
                  );
                })
              ) : (
                !isLoadingPage && (
                  <div className="text-center py-10 px-4 space-y-4 font-sans" dir="ltr">
                    <div className="w-14 h-14 bg-amber-100 border-2 border-black rounded-2xl flex items-center justify-center mx-auto text-amber-900 shadow-[3px_3px_0px_0px_#000]">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-quran text-2xl text-emerald-900 font-bold leading-loose">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </p>
                      <h4 className="text-base font-black text-black">
                        Halaman {currentPage} (Juz {juzNumber} - {pageSurahsLatinLabel})
                      </h4>
                      <p className="text-xs text-gray-600 max-w-sm mx-auto">
                        Sedang menghubungkan ke server mushaf. Klik tombol di bawah untuk memuat baris ayat halaman {currentPage}.
                      </p>
                    </div>
                    <button
                      onClick={() => setReloadKey((prev) => prev + 1)}
                      className="px-4 py-2 bg-[#0B4627] hover:bg-[#07301B] text-white border-2 border-black rounded-xl font-black text-xs cursor-pointer shadow-[3px_3px_0px_0px_#000] inline-flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <RotateCcw className="w-4 h-4 text-[#F59E0B]" />
                      <span>Muat Baris Ayat Halaman {currentPage}</span>
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Swipe Guidance & Quick Turn Navigation Footer */}
        <div className="flex items-center justify-between w-full max-w-2xl text-[11px] font-bold text-amber-900 dark:text-amber-300 pt-3 px-2">
          <button 
            onClick={handleNextPage}
            disabled={currentPage >= 604}
            className="flex items-center gap-1 text-[#0B4627] dark:text-emerald-400 hover:underline disabled:opacity-30 cursor-pointer font-black text-xs bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800"
            title="Buka Halaman Berikutnya"
          >
            <span>👈 Hal. {currentPage < 604 ? currentPage + 1 : 604}</span>
          </button>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-950 font-black bg-amber-200/90 px-3 py-1 rounded-full border border-amber-400 shadow-xs">
            <span>✨ Usap / Geser Lembaran Mushaf</span>
          </div>
          <button 
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 text-[#0B4627] dark:text-emerald-400 hover:underline disabled:opacity-30 cursor-pointer font-black text-xs bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800"
            title="Buka Halaman Sebelumnya"
          >
            <span>Hal. {currentPage > 1 ? currentPage - 1 : 1} 👉</span>
          </button>
        </div>

        <div className="w-full flex items-center justify-between border-t-2 border-amber-800/40 pt-2 mt-3 px-3 text-xs font-mono font-black text-amber-900 dark:text-amber-300">
          <span>- {currentPage} -</span>
          <span>الحزب {Math.ceil(juzNumber * 2)}</span>
        </div>

        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FFFDF7]/95 hover:bg-[#FEF3C7] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center cursor-pointer transition-all hover:scale-110 disabled:opacity-30 disabled:pointer-events-none z-30"
          title="Halaman Sebelumnya (◄)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <button
          onClick={handleNextPage}
          disabled={currentPage >= 604}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FFFDF7]/95 hover:bg-[#FEF3C7] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center cursor-pointer transition-all hover:scale-110 disabled:opacity-30 disabled:pointer-events-none z-30"
          title="Halaman Selanjutnya (►)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* SELECTED TAJWEED WORD FLOATING INFO */}
      {selectedTajweedWord && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-800 rounded-2xl p-3 shadow-[3px_3px_0px_0px_#000] flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-400 border-2 border-black rounded-xl flex items-center justify-center text-black font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-2">
                <span className="font-quran text-lg text-emerald-900 dark:text-emerald-300 font-bold">{selectedTajweedWord.word}</span>
                <span className="bg-[#0B4627] text-[#F59E0B] px-2 py-0.5 rounded-md text-[10px]">
                  {selectedTajweedWord.ruleName}
                </span>
              </p>
              <p className="text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                Klik tab Hukum Tajwid di bawah untuk penjelasan lengkap kaidah & durasi harakat.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedTajweedWord(null)}
            className="p-1 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-lg text-black dark:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAJWEED & GHARIB KNOWLEDGE PANEL (ALL 604 PAGES) */}
      <div className="bg-[#FFFDF7] dark:bg-[#1E293B] border-3 border-black rounded-3xl p-4 sm:p-5 shadow-[6px_6px_0px_0px_#111827] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-gray-300 dark:border-gray-700 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#0B4627] text-[#F59E0B] border-2 border-black rounded-xl flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-black text-black dark:text-white flex items-center gap-2">
                <span>Panduan Tajwid & Kaidah Gharib</span>
                <span className="text-[10px] bg-[#FEF3C7] text-amber-900 border border-amber-800 px-1.5 py-0.5 rounded-md font-bold">
                  Halaman {currentPage}
                </span>
              </h4>
              <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                Analisis otomatis hukum tajwid per kata & kaidah bacaan khusus halaman {currentPage}
              </p>
            </div>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] flex-wrap gap-1">
            <button
              onClick={() => setActiveTajweedTab('tajweed')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTajweedTab === 'tajweed'
                  ? 'bg-[#0B4627] text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:text-black'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Hukum Tajwid ({pageTajweedData.rulesList.length})</span>
            </button>
            <button
              onClick={() => setActiveTajweedTab('gharib')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTajweedTab === 'gharib'
                  ? 'bg-[#0B4627] text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:text-black'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Bacaan Gharib ({pageGharibData.length})</span>
            </button>
            <button
              onClick={() => setActiveTajweedTab('legend')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTajweedTab === 'legend'
                  ? 'bg-[#0B4627] text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:text-black'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Panduan Warna</span>
            </button>
            <button
              onClick={() => setActiveTajweedTab('encyclopedia')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTajweedTab === 'encyclopedia'
                  ? 'bg-[#0B4627] text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:text-black'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Kamus Tajwid & Gharib ({MASTER_TAJWEED_ENCYCLOPEDIA.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: HUKUM TAJWID */}
        {activeTajweedTab === 'tajweed' && (
          <div className="space-y-3">
            {pageTajweedData.rulesList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pageTajweedData.rulesList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white dark:bg-gray-800 border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] space-y-2 hover:bg-amber-50/60 dark:hover:bg-gray-700 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span 
                        className="px-2.5 py-1 rounded-lg text-white font-black text-xs border border-black shadow-xs"
                        style={{ backgroundColor: item.colorHex }}
                      >
                        {item.ruleName}
                      </span>
                      <span className="text-[10px] bg-gray-100 dark:bg-gray-700 border border-black px-2 py-0.5 rounded-md font-bold text-gray-800 dark:text-gray-200">
                        {item.harakatDuration} Harakat
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Contoh Lafadz Halaman Ini:</span>
                      <span className="font-quran text-xl font-bold text-emerald-950 dark:text-emerald-300" dir="rtl">
                        {item.matchedWord}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {item.pengertianBahasa && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                          <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-snug">
                            <span className="font-bold text-emerald-900 dark:text-emerald-400">📖 Pengertian Bahasa:</span> {item.pengertianBahasa}
                          </p>
                        </div>
                      )}
                      {item.pengertianIstilah && (
                        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/20">
                          <p className="text-[11px] text-emerald-950 dark:text-emerald-200 leading-snug">
                            <span className="font-bold text-emerald-900 dark:text-emerald-400">🎯 Pengertian Istilah:</span> {item.pengertianIstilah}
                          </p>
                        </div>
                      )}
                      <p className="text-[11px] text-gray-800 dark:text-gray-200 leading-snug">
                        <b>🗣️ Cara Membaca:</b> {item.caraBaca}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-500 font-bold">
                Memuat kaidah tajwid halaman {currentPage}...
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BACAAN GHARIB */}
        {activeTajweedTab === 'gharib' && (
          <div className="space-y-3">
            {pageGharibData.length > 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-800 rounded-xl text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-900 shrink-0" />
                  <span>Ditemukan <b>{pageGharibData.length} Bacaan Khusus (Gharib)</b> pada Halaman {currentPage}!</span>
                </div>

                {pageGharibData.map((g) => (
                  <div
                    key={g.id}
                    className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800 border-3 border-amber-900 rounded-2xl shadow-[4px_4px_0px_0px_#000] space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-800/30 pb-2">
                      <div>
                        <h5 className="text-sm font-black text-amber-950 dark:text-amber-300 flex items-center gap-2">
                          <span>{g.title}</span>
                          <span className="text-xs bg-[#0B4627] text-[#F59E0B] px-2 py-0.5 rounded-md font-mono">
                            QS. {g.surahName} : {g.ayahNumber}
                          </span>
                        </h5>
                      </div>
                      <span className="font-quran text-2xl font-black text-emerald-950 dark:text-emerald-300" dir="rtl">
                        {g.arabicTerm}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {g.pengertianBahasa && (
                        <div className="bg-white/80 dark:bg-gray-900/60 p-2 rounded-xl border border-amber-800/20">
                          <p className="text-[11px] text-gray-800 dark:text-gray-200 leading-snug">
                            <span className="font-bold text-amber-950 dark:text-amber-400">📖 Pengertian Bahasa:</span> {g.pengertianBahasa}
                          </p>
                        </div>
                      )}
                      {g.pengertianIstilah && (
                        <div className="bg-amber-100/70 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-800/30">
                          <p className="text-[11px] text-amber-950 dark:text-amber-200 leading-snug">
                            <span className="font-bold text-amber-950 dark:text-amber-400">🎯 Pengertian Istilah:</span> {g.pengertianIstilah}
                          </p>
                        </div>
                      )}
                      <p className="text-gray-800 dark:text-gray-200">
                        <b>🗣️ Cara Membaca:</b> {g.caraBaca}
                      </p>
                      <p className="text-emerald-900 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/30">
                        💡 <b>Tips Praktis & Kaidah:</b> {g.tips}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-[#F8FAFC] dark:bg-gray-800 border-2 border-black rounded-2xl text-xs space-y-2 shadow-[2px_2px_0px_0px_#000]">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-black">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kaidah Bacaan Standar (Tanpa Saktah/Imalah Khusus)</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-[11px] leading-relaxed">
                  Halaman {currentPage} dibaca menggunakan kaidah tilawah standar Rasm Utsmani Imam Hafs. Perhatikan tanda waqaf:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 bg-white dark:bg-gray-700 border border-black rounded-xl text-center">
                    <span className="font-bold text-red-600 text-sm block font-quran">مـ</span>
                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Waqaf Lazim (Wajib Berhenti)</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-700 border border-black rounded-xl text-center">
                    <span className="font-bold text-emerald-600 text-sm block font-quran">ج</span>
                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Waqaf Jaiz (Boleh Berhenti/Lanjut)</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-700 border border-black rounded-xl text-center">
                    <span className="font-bold text-blue-600 text-sm block font-quran">قلى</span>
                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Waqaf Aula (Lebih Utama Berhenti)</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-700 border border-black rounded-xl text-center">
                    <span className="font-bold text-amber-600 text-sm block font-quran">صلى</span>
                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Washal Aula (Lebih Utama Lanjut)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PANDUAN WARNA TAJWID */}
        {activeTajweedTab === 'legend' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-800 rounded-xl flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#10B981] border border-black shrink-0"></div>
              <div>
                <p className="font-black text-emerald-950 dark:text-emerald-300 text-[11px]">Ghunnah / Dengung</p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">Nun/Mim Tasydid (2-3 Harakat)</p>
              </div>
            </div>
            <div className="p-2.5 bg-orange-50 dark:bg-orange-950/40 border-2 border-orange-800 rounded-xl flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#F97316] border border-black shrink-0"></div>
              <div>
                <p className="font-black text-orange-950 dark:text-orange-300 text-[11px]">Qalqalah</p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">Pantulan Huruf (ب ج د ط ق)</p>
              </div>
            </div>
            <div className="p-2.5 bg-pink-50 dark:bg-pink-950/40 border-2 border-pink-800 rounded-xl flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#EC4899] border border-black shrink-0"></div>
              <div>
                <p className="font-black text-pink-950 dark:text-pink-300 text-[11px]">Ikhfa' Haqiqi</p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">Samar-samar (2 Harakat)</p>
              </div>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-800 rounded-xl flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#3B82F6] border border-black shrink-0"></div>
              <div>
                <p className="font-black text-blue-950 dark:text-blue-300 text-[11px]">Idgham Bighunnah</p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">Melebur Dengung (ي ن م و)</p>
              </div>
            </div>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-800 rounded-xl flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#8B5CF6] border border-black shrink-0"></div>
              <div>
                <p className="font-black text-purple-950 dark:text-purple-300 text-[11px]">Iqlab</p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">Nun/Tanwin jadi Mim (ب)</p>
              </div>
            </div>
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border-2 border-red-800 rounded-xl flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#DC2626] border border-black shrink-0"></div>
              <div>
                <p className="font-black text-red-950 dark:text-red-300 text-[11px]">Mad Wajib / Jaiz</p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">Panjang 4-6 Harakat (~ / ٓ)</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ENSIKLOPEDIA & KAMUS TAJWID 30 JUZ */}
        {activeTajweedTab === 'encyclopedia' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={encyclopediaSearch}
                  onChange={(e) => setEncyclopediaSearch(e.target.value)}
                  placeholder="Cari kaidah tajwid, huruf, atau lafadz..."
                  className="w-full pl-9 pr-8 py-2 bg-white dark:bg-gray-800 border-2 border-black rounded-xl text-xs font-bold text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
                />
                {encyclopediaSearch && (
                  <button
                    onClick={() => setEncyclopediaSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {['Semua', 'Nun & Tanwin', 'Mim Sukun', 'Ghunnah & Qalqalah', 'Mad Lengkap', 'Lam & Ra', 'Idgham Makhraj', 'Bacaan Gharib', 'Tanda Waqaf'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setEncyclopediaCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black whitespace-nowrap border cursor-pointer transition-all ${
                      encyclopediaCategory === cat
                        ? 'bg-[#0B4627] text-white border-black shadow-xs'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 hover:border-black'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredEncyclopedia.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredEncyclopedia.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white dark:bg-gray-800 border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] space-y-2.5 hover:bg-amber-50/40 dark:hover:bg-gray-700/60 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                      <div>
                        <h5 className="text-xs sm:text-sm font-black text-black dark:text-white flex items-center gap-1.5">
                          <span 
                            className="w-2.5 h-2.5 rounded-full inline-block shrink-0" 
                            style={{ backgroundColor: item.colorHex }}
                          />
                          <span>{item.title}</span>
                        </h5>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                          {item.category}
                        </span>
                      </div>
                      <span className="font-quran text-xl font-bold text-emerald-950 dark:text-emerald-300" dir="rtl">
                        {item.arabicName}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {item.letters && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-bold text-gray-600 dark:text-gray-400">Huruf:</span>
                          <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-300 font-black">
                            {item.letters}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="font-bold text-gray-600 dark:text-gray-400">Ketukan Harakat:</span>
                        <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                          {item.harakat}
                        </span>
                      </div>

                      {item.pengertianBahasa && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                          <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-snug">
                            <span className="font-bold text-emerald-900 dark:text-emerald-400">📖 Pengertian Bahasa:</span> {item.pengertianBahasa}
                          </p>
                        </div>
                      )}

                      {item.pengertianIstilah && (
                        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/20">
                          <p className="text-[11px] text-emerald-950 dark:text-emerald-200 leading-snug">
                            <span className="font-bold text-emerald-900 dark:text-emerald-400">🎯 Pengertian Istilah:</span> {item.pengertianIstilah}
                          </p>
                        </div>
                      )}

                      {item.sebabHukum && (
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug">
                          <b>🔍 Sebab Hukum:</b> {item.sebabHukum}
                        </p>
                      )}

                      <p className="text-[11px] text-gray-800 dark:text-gray-200 leading-snug">
                        <b>🗣️ Cara Membaca:</b> {item.caraBaca}
                      </p>

                      <div className="bg-amber-50/80 dark:bg-gray-700/80 p-2 rounded-xl border border-amber-800/20 text-center mt-1">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block mb-0.5">Contoh Potongan Lafadz:</span>
                        <span className="font-quran text-lg font-bold text-emerald-950 dark:text-emerald-200 block" dir="rtl">
                          {item.contohLafadz}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300">
                <p className="text-xs font-bold text-gray-500">
                  Tidak ditemukan kaidah tajwid/gharib yang cocok dengan "{encyclopediaSearch}".
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#F0FDF4] border-2 border-black rounded-xl text-xs text-gray-700">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#0B4627] shrink-0" />
          <p className="font-medium">
            <b>Mushaf Standar Madinah (Mujamma' Malik Fahd):</b> Tata letak persis 15 Baris per halaman, 604 Halaman Rasm Utsmani lengkap.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentPage(1)}
            className="px-2 py-1 bg-white hover:bg-gray-100 border border-black rounded-lg font-bold text-[11px] cursor-pointer"
          >
            Halaman 1
          </button>
          <button
            onClick={() => setCurrentPage(293)}
            className="px-2 py-1 bg-white hover:bg-gray-100 border border-black rounded-lg font-bold text-[11px] cursor-pointer"
          >
            Al-Kahf (293)
          </button>
          <button
            onClick={() => setCurrentPage(582)}
            className="px-2 py-1 bg-white hover:bg-gray-100 border border-black rounded-lg font-bold text-[11px] cursor-pointer"
          >
            Juz 30 (582)
          </button>
        </div>
      </div>
    </div>
  );
};

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
  VolumeX,
  Columns,
  Square
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
const STORAGE_SPREAD_MODE = 'quranverse_mushaf_spread_mode_v1';

export type MushafPageLine = MushafLine;

const toArabicNumerals = (num: number): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => arabicDigits[Number(d)]);
};

const JUZ_ARABIC_NAMES: Record<number, string> = {
  1: 'الجزء الأول', 2: 'الجزء الثاني', 3: 'الجزء الثالث', 4: 'الجزء الرابع',
  5: 'الجزء الخامس', 6: 'الجزء السادس', 7: 'الجزء السابع', 8: 'الجزء الثامن',
  9: 'الجزء التاسع', 10: 'الجزء العاشر', 11: 'الجزء الحادي عشر', 12: 'الجزء الثاني عشر',
  13: 'الجزء الثالث عشر', 14: 'الجزء الرابع عشر', 15: 'الجزء الخامس عشر', 16: 'الجزء السادس عشر',
  17: 'الجزء السابع عشر', 18: 'الجزء الثامن عشر', 19: 'الجزء التاسع عشر', 20: 'الجزء العشرون',
  21: 'الجزء الحادي والعشرون', 22: 'الجزء الثاني والعشرون', 23: 'الجزء الثالث والعشرون', 24: 'الجزء الرابع والعشرون',
  25: 'الجزء الخامس والعشرون', 26: 'الجزء السادس والعشرون', 27: 'الجزء السابع والعشرون', 28: 'الجزء الثامن والعشرون',
  29: 'الجزء التاسع والعشرون', 30: 'الجزء الثلاثون'
};

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
    return 293;
  });

  // Spread Mode: 'double' (Dual-page open book like real Mushaf) | 'single' (1-page view)
  const [spreadMode, setSpreadMode] = useState<'double' | 'single'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SPREAD_MODE);
      if (saved === 'single' || saved === 'double') return saved;
    } catch {}
    return typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'double' : 'single';
  });

  const isDualSpread = spreadMode === 'double';

  // In authentic standard Quran layout:
  // Right Page is always ODD (e.g. 293 or 1)
  // Left Page is always EVEN (e.g. 294 or 2)
  const rightPageNumber = useMemo(() => {
    if (!isDualSpread) return currentPage;
    if (currentPage === 1) return 1;
    return currentPage % 2 === 1 ? currentPage : Math.max(1, currentPage - 1);
  }, [currentPage, isDualSpread]);

  const leftPageNumber = useMemo(() => {
    if (!isDualSpread) return null;
    if (rightPageNumber === 1) return 2;
    return rightPageNumber + 1 <= 604 ? rightPageNumber + 1 : null;
  }, [rightPageNumber, isDualSpread]);

  const [activeReciter, setActiveReciter] = useState<Reciter>(audioPlayer.getActiveReciter());
  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState(false);
  const [isPlayingPageAudio, setIsPlayingPageAudio] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Swipe & Drag Gesture State
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

  // Display Mode: 'scan' | 'layout'
  const [viewMode, setViewMode] = useState<'scan' | 'layout'>('scan');
  
  // Right Page Lines & Scans
  const [mushafLinesRight, setMushafLinesRight] = useState<MushafPageLine[]>([]);
  const [isLoadingPageRight, setIsLoadingPageRight] = useState<boolean>(false);
  const [scanLoadedRight, setScanLoadedRight] = useState<boolean>(false);
  const [scanErrorRight, setScanErrorRight] = useState<boolean>(false);
  const [scanUrlIndexRight, setScanUrlIndexRight] = useState<number>(0);

  // Left Page Lines & Scans (For Dual Mode)
  const [mushafLinesLeft, setMushafLinesLeft] = useState<MushafPageLine[]>([]);
  const [isLoadingPageLeft, setIsLoadingPageLeft] = useState<boolean>(false);
  const [scanLoadedLeft, setScanLoadedLeft] = useState<boolean>(false);
  const [scanErrorLeft, setScanErrorLeft] = useState<boolean>(false);
  const [scanUrlIndexLeft, setScanUrlIndexLeft] = useState<number>(0);

  const [reloadKey, setReloadKey] = useState<number>(0);

  // Tajweed & Gharib State
  const [activeTajweedTab, setActiveTajweedTab] = useState<'tajweed' | 'gharib' | 'legend' | 'encyclopedia'>('tajweed');
  const [selectedTajweedWord, setSelectedTajweedWord] = useState<{ word: string; ruleName: string } | null>(null);
  const [encyclopediaSearch, setEncyclopediaSearch] = useState<string>('');
  const [encyclopediaCategory, setEncyclopediaCategory] = useState<string>('Semua');

  const containerRef = useRef<HTMLDivElement>(null);

  // Right Page Metadata
  const primarySurahRight = useMemo(() => getPrimarySurahForPage(rightPageNumber), [rightPageNumber]);
  const juzNumberRight = useMemo(() => getJuzForPage(rightPageNumber), [rightPageNumber]);
  const fallbackUrlsRight = useMemo(() => getMadinahPageFallbackUrls(rightPageNumber), [rightPageNumber]);
  const pageSurahsRight = useMemo(() => getMadinahPageSurahs(rightPageNumber, primarySurahRight), [rightPageNumber, primarySurahRight]);
  const pageSurahsLatinLabelRight = useMemo(() => pageSurahsRight
    .map((s) => `${s.surahLatin} (${s.startAyah === s.endAyah ? `Ayat ${s.startAyah}` : `Ayat ${s.startAyah}–${s.endAyah}`})`)
    .join(' • '), [pageSurahsRight]);
  const pageSurahsArabicLabelRight = useMemo(() => pageSurahsRight
    .map((s) => s.surahArabic)
    .join(' • '), [pageSurahsRight]);

  // Left Page Metadata
  const primarySurahLeft = useMemo(() => leftPageNumber ? getPrimarySurahForPage(leftPageNumber) : null, [leftPageNumber]);
  const juzNumberLeft = useMemo(() => leftPageNumber ? getJuzForPage(leftPageNumber) : null, [leftPageNumber]);
  const fallbackUrlsLeft = useMemo(() => leftPageNumber ? getMadinahPageFallbackUrls(leftPageNumber) : [], [leftPageNumber]);
  const pageSurahsLeft = useMemo(() => leftPageNumber && primarySurahLeft ? getMadinahPageSurahs(leftPageNumber, primarySurahLeft) : [], [leftPageNumber, primarySurahLeft]);
  const pageSurahsLatinLabelLeft = useMemo(() => pageSurahsLeft
    .map((s) => `${s.surahLatin} (${s.startAyah === s.endAyah ? `Ayat ${s.startAyah}` : `Ayat ${s.startAyah}–${s.endAyah}`})`)
    .join(' • '), [pageSurahsLeft]);
  const pageSurahsArabicLabelLeft = useMemo(() => pageSurahsLeft
    .map((s) => s.surahArabic)
    .join(' • '), [pageSurahsLeft]);

  // Active page tajweed data
  const pageTajweedData = useMemo(() => analyzePageTajweedRules(mushafLinesRight), [mushafLinesRight]);
  const pageGharibData = useMemo(() => getPageGharibRules(rightPageNumber), [rightPageNumber]);

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

  const handleToggleSpreadMode = () => {
    setSpreadMode((prev) => {
      const next = prev === 'double' ? 'single' : 'double';
      try {
        localStorage.setItem(STORAGE_SPREAD_MODE, next);
      } catch {}
      if (pageSoundEnabled) playPageTurnSound();
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

  useEffect(() => {
    return () => {
      audioPlayer.stop();
    };
  }, []);

  // Preload adjacent scanned pages
  useEffect(() => {
    const step = isDualSpread ? 2 : 1;
    const nextP = Math.min(604, currentPage + step);
    const prevP = Math.max(1, currentPage - step);
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
  }, [currentPage, isDualSpread]);

  // Load 15-Line Madinah dataset for Right Page
  useEffect(() => {
    setIsLoadingPageRight(true);
    const lines = getMadinahPageLines(rightPageNumber);
    setMushafLinesRight(lines as MushafPageLine[]);
    setIsLoadingPageRight(false);
  }, [rightPageNumber, reloadKey]);

  // Load 15-Line Madinah dataset for Left Page
  useEffect(() => {
    if (leftPageNumber) {
      setIsLoadingPageLeft(true);
      const lines = getMadinahPageLines(leftPageNumber);
      setMushafLinesLeft(lines as MushafPageLine[]);
      setIsLoadingPageLeft(false);
    } else {
      setMushafLinesLeft([]);
    }
  }, [leftPageNumber, reloadKey]);

  // Reset scan state on page change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LAST_PAGE, String(currentPage));
      const firstSurah = pageSurahsRight[0] || { surahNumber: primarySurahRight.number, startAyah: 1 };
      setLastRead(firstSurah.surahNumber, firstSurah.startAyah, `Halaman ${currentPage} (${pageSurahsLatinLabelRight})`);
    } catch {}

    setScanLoadedRight(false);
    setScanErrorRight(false);
    setScanUrlIndexRight(0);

    setScanLoadedLeft(false);
    setScanErrorLeft(false);
    setScanUrlIndexLeft(0);

    if (isPlayingPageAudio) {
      audioPlayer.stop();
      setIsPlayingPageAudio(false);
    }
  }, [currentPage]);

  // Trigger Page Slide & Flip Animation
  const triggerPageTurn = useCallback((dir: 'next' | 'prev') => {
    if (isTransitioning) return;
    const step = isDualSpread ? 2 : 1;

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

    const targetOffset = dir === 'next' ? -380 : 380;
    setDragOffset(targetOffset);

    setTimeout(() => {
      if (dir === 'next') {
        setCurrentPage((prev) => Math.min(604, prev + step));
      } else {
        setCurrentPage((prev) => Math.max(1, prev - step));
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
  }, [currentPage, isTransitioning, isDualSpread, pageSoundEnabled]);

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
    const startSurah = pageSurahsRight[0] || { surahNumber: primarySurahRight.number, startAyah: 1 };
    await audioPlayer.playAyat(startSurah.surahNumber, startSurah.startAyah, () => {
      setIsPlayingPageAudio(false);
    }, activeReciter.id);
  };

  const handleBookmarkPage = () => {
    const startSurah = pageSurahsRight[0] || { surahNumber: primarySurahRight.number, startAyah: 1 };
    saveBookmark({
      surahNumber: startSurah.surahNumber,
      ayahNumber: startSurah.startAyah,
      surahName: `Halaman ${rightPageNumber} - ${pageSurahsLatinLabelRight}`,
      arabicText: `مصحف المدينة المنورة - الصفحة ${rightPageNumber}`,
      translation: `Tanda Baca Halaman ${rightPageNumber} (Juz ${juzNumberRight} • ${pageSurahsLatinLabelRight})`,
      note: `Ditandai dari Mode Mushaf Fisik Asli (Halaman ${rightPageNumber})`
    });
    setToastMessage(`🔖 Halaman ${rightPageNumber} (${pageSurahsLatinLabelRight}) berhasil disimpan ke Bookmark!`);
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

  // Touch Swipe Handlers
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

  // Mouse Drag Handlers
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

  // Helper to render individual authentic page with ornate cartouches & borders
  const renderSingleMushafPage = (
    pageNum: number,
    lines: MushafPageLine[],
    isLoading: boolean,
    scanLoaded: boolean,
    scanError: boolean,
    scanUrlIndex: number,
    fallbackUrls: string[],
    setScanLoaded: (v: boolean) => void,
    setScanError: (v: boolean) => void,
    setScanUrlIndex: React.Dispatch<React.SetStateAction<number>>,
    surahArabic: string,
    juzNum: number,
    isLeftPage: boolean
  ) => {
    const isEven = pageNum % 2 === 0;

    return (
      <div 
        className={`relative flex-1 bg-[#FFFDF7] text-black border-2 border-amber-900/60 rounded-xl p-2.5 sm:p-4 shadow-[inset_0_0_20px_rgba(180,83,9,0.06)] flex flex-col justify-between min-h-[580px] sm:min-h-[760px] select-none ${
          isEven ? 'border-r-amber-900/20' : 'border-l-amber-900/20'
        }`}
      >
        {/* TOP ORNATE CARTOUCHE HEADER (SURAH • ARABIC PAGE NUM DOME • JUZ) */}
        <div className="w-full flex items-center justify-between border-b-2 border-amber-800/50 pb-2 mb-2 px-1 text-xs font-bold text-amber-950 font-mono">
          {/* Outer Header: Surah Cartouche */}
          <div className="flex-1 text-right">
            <span className="inline-block px-2.5 py-0.5 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 border border-amber-800/80 rounded-md font-quran text-xs sm:text-sm font-black text-amber-950 shadow-xs">
              {surahArabic}
            </span>
          </div>

          {/* Center Header: Scalloped Page Number Dome (e.g. ٢٩٣ / ٢٩٤) */}
          <div className="px-2 text-center">
            <span className="inline-flex items-center justify-center w-8 h-7 bg-amber-200 border border-amber-900 rounded-t-xl rounded-b-md font-quran text-sm font-black text-amber-950 shadow-xs">
              {toArabicNumerals(pageNum)}
            </span>
          </div>

          {/* Inner Header: Juz Cartouche */}
          <div className="flex-1 text-left">
            <span className="inline-block px-2.5 py-0.5 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 border border-amber-800/80 rounded-md font-quran text-xs sm:text-sm font-black text-amber-950 shadow-xs">
              {JUZ_ARABIC_NAMES[juzNum] || `الجزء ${toArabicNumerals(juzNum)}`}
            </span>
          </div>
        </div>

        {/* ORNATE DOUBLE ILLUMINATED BORDER FRAME */}
        <div className="relative flex-1 w-full border-[3px] border-amber-900/60 rounded-lg p-1 sm:p-2 bg-white flex flex-col justify-between shadow-inner">
          <div className="absolute inset-1 border border-dashed border-amber-700/30 rounded pointer-events-none z-10"></div>

          {/* VIEW MODE 1: PHYSICAL SCANNED MADINAH MUSHAF */}
          {viewMode === 'scan' && (
            <div className="w-full flex-1 flex items-center justify-center relative min-h-[500px] sm:min-h-[680px] bg-white rounded overflow-hidden">
              {!scanLoaded && !scanError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFFDF7]/90 z-20 space-y-2">
                  <div className="w-8 h-8 border-3 border-[#0B4627] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[11px] font-bold text-emerald-950">Memuat Halaman {pageNum}...</p>
                </div>
              )}

              {!scanError ? (
                <img
                  src={fallbackUrls[scanUrlIndex] || fallbackUrls[0]}
                  alt={`Halaman ${pageNum} Mushaf Al-Quran Standar Madinah`}
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
                  className={`w-full max-h-[75vh] object-contain transition-opacity duration-300 pointer-events-none select-none drop-shadow-sm ${
                    scanLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ) : (
                <div className="text-center p-4 space-y-1">
                  <p className="text-xs font-bold text-amber-900">
                    Gambar scan dialihkan otomatis ke mode 15 Baris Teks.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: NATURAL 15-LINE TYPOGRAPHY */}
          {viewMode === 'layout' && (
            <div className="w-full flex-1 flex flex-col justify-between space-y-1 z-10 select-text px-1 py-2" dir="rtl">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFFDF7]/90 z-20 space-y-2 rounded-xl">
                  <div className="w-8 h-8 border-3 border-[#0B4627] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-black text-emerald-900">
                    Memuat Baris Halaman {pageNum}...
                  </p>
                </div>
              )}

              {lines.length > 0 ? (
                lines.map((line, idx) => {
                  if (line.type === 'surah-header') {
                    return (
                      <div 
                        key={idx} 
                        className="my-1.5 p-1.5 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 border-2 border-amber-800/70 rounded-lg text-center shadow-xs"
                      >
                        <span className="font-quran text-lg sm:text-xl font-black text-amber-950 block">
                          {line.surahName || surahArabic}
                        </span>
                      </div>
                    );
                  }

                  if (line.type === 'basmala') {
                    return (
                      <div key={idx} className="my-0.5 text-center font-quran text-base sm:text-lg text-amber-950 font-bold">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={idx}
                      className="w-full font-quran text-base sm:text-xl md:text-[21px] text-emerald-950 font-bold leading-[2.1] sm:leading-[2.4] text-center tracking-normal py-0.5"
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
                !isLoading && (
                  <div className="text-center py-8 px-2 space-y-2 font-sans" dir="ltr">
                    <BookOpen className="w-6 h-6 mx-auto text-amber-900" />
                    <p className="text-xs font-bold text-gray-700">Halaman {pageNum}</p>
                    <button
                      onClick={() => setReloadKey((prev) => prev + 1)}
                      className="px-3 py-1 bg-[#0B4627] text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Muat Baris Ayat
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* BOTTOM CARTOUCHE: PAGE NUMBER IN ISLAMIC FRAME */}
        <div className="w-full flex items-center justify-between border-t-2 border-amber-800/50 pt-2 mt-2 px-2 text-xs font-mono font-black text-amber-950">
          <span className="font-quran text-xs text-amber-900">
            {isEven ? `الحزب ${toArabicNumerals(Math.ceil(juzNum * 2))}` : `الجزء ${toArabicNumerals(juzNum)}`}
          </span>
          <span className="px-3 py-0.5 bg-amber-200 border border-amber-900 rounded-md shadow-xs">
            - {pageNum} -
          </span>
          <span className="font-quran text-xs text-amber-900">
            {!isEven ? `الحزب ${toArabicNumerals(Math.ceil(juzNum * 2))}` : `الجزء ${toArabicNumerals(juzNum)}`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`space-y-4 max-w-6xl mx-auto transition-all ${
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

      {/* TOP CONTROL BAR */}
      <div className="bg-[#FFFDF7] dark:bg-[#1E293B] border-3 border-black rounded-2xl p-3 sm:p-4 shadow-[4px_4px_0px_0px_#111827] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#F59E0B] text-black border-2 border-black rounded-xl flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-black dark:text-white flex items-center gap-1.5">
                <span>
                  {isDualSpread 
                    ? `Mushaf Madinah (Hal. ${rightPageNumber} & ${leftPageNumber || 604})` 
                    : `Mushaf Madinah (Hal. ${currentPage})`}
                </span>
                <span className="text-[10px] bg-[#0B4627] text-[#F59E0B] px-1.5 py-0.5 rounded-md font-mono font-bold border border-black">
                  {isDualSpread ? `${rightPageNumber}-${leftPageNumber || 604} / 604` : `${currentPage} / 604`}
                </span>
              </h3>
              <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                Juz {juzNumberRight} • {pageSurahsLatinLabelRight} {leftPageNumber ? `& ${pageSurahsLatinLabelLeft}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* SPREAD MODE TOGGLE: DUAL PAGE SPREAD VS SINGLE PAGE */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000]">
              <button
                onClick={handleToggleSpreadMode}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                  isDualSpread 
                    ? 'bg-[#0B4627] text-white shadow-xs' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-black'
                }`}
                title="Tampilan 2 Halaman Berdampingan (Buku Terbuka)"
              >
                <Columns className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="hidden sm:inline">2 Halaman (Buku Terbuka)</span>
                <span className="sm:hidden">2 Hal</span>
              </button>
              <button
                onClick={handleToggleSpreadMode}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                  !isDualSpread 
                    ? 'bg-[#0B4627] text-white shadow-xs' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-black'
                }`}
                title="Tampilan 1 Lembaran Tunggal"
              >
                <Square className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="hidden sm:inline">1 Halaman</span>
                <span className="sm:hidden">1 Hal</span>
              </button>
            </div>

            {/* VIEW MODE: SCAN ASLI VS 15 BARIS TEKS */}
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
                <span>Scan Asli</span>
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
                <span>15 Baris</span>
              </button>
            </div>

            {/* QARI SELECTOR */}
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

            {/* SOUND EFFECT TOGGLE */}
            <button
              onClick={handleToggleSound}
              className={`p-1.5 border-2 border-black rounded-xl cursor-pointer shadow-[2px_2px_0px_0px_#000] transition-all ${
                pageSoundEnabled ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-400'
              }`}
              title={pageSoundEnabled ? 'Efek Suara Lembaran Kertas: AKTIF' : 'Efek Suara Lembaran Kertas: MATI'}
            >
              {pageSoundEnabled ? <Volume2 className="w-4 h-4 text-[#0B4627]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* AUDIO PLAY/PAUSE */}
            <button
              onClick={handleTogglePageAudio}
              className={`px-3 py-1.5 border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                isPlayingPageAudio ? 'bg-[#F59E0B] text-black animate-pulse' : 'bg-[#10B981] text-white'
              }`}
            >
              {isPlayingPageAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingPageAudio ? 'Jeda Audio' : 'Audio Hal.'}</span>
            </button>

            {/* BOOKMARK BUTTON */}
            <button
              onClick={handleBookmarkPage}
              className="p-1.5 bg-white hover:bg-[#FEF3C7] text-black border-2 border-black rounded-xl cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              title="Tandai Halaman Ini (Bookmark)"
            >
              <BookmarkIcon className="w-4 h-4" />
            </button>

            {/* FULLSCREEN */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 bg-white hover:bg-gray-100 text-black border-2 border-black rounded-xl cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* JUZ / SURAH / PAGE QUICK JUMP */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-dashed border-gray-300 text-xs">
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <span className="font-bold text-gray-700 shrink-0">Juz:</span>
            <select
              value={juzNumberRight}
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
              value={primarySurahRight.number}
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

      {/* AUTHENTIC PHYSICAL MUSHAF BOOK SPREAD CASING */}
      <div 
        className="relative bg-[#200F09] dark:bg-[#120804] border-4 border-amber-950 rounded-3xl p-2 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center overflow-hidden"
      >
        {/* TOP ELEGANT HEADER BAR */}
        <div className="w-full flex items-center justify-between border-b-2 border-amber-700/40 pb-2 mb-3 px-3 text-xs font-bold text-amber-200 font-mono">
          <span className="truncate max-w-[200px] sm:max-w-none text-right font-quran text-sm sm:text-base font-black text-amber-300">
            {leftPageNumber ? pageSurahsArabicLabelLeft : pageSurahsArabicLabelRight}
          </span>
          <span className="font-sans font-black tracking-widest text-[#F59E0B] px-2 text-center text-[10px] sm:text-xs">
            {language === 'ar' ? 'مصحف المدينة النبوية الشريفة' : 'MUSHAF MADINAH ASLI • BUKU TERBUKA (604 HALAMAN)'}
          </span>
          <span className="font-quran text-sm sm:text-base font-black text-amber-300">
            الجزء {juzNumberRight}
          </span>
        </div>

        {/* 3D FLIPPABLE BOOK CONTAINER */}
        <div 
          className="relative w-full bg-[#180A05] border-2 border-amber-900/80 rounded-2xl p-1.5 sm:p-3 flex flex-col sm:flex-row gap-2 justify-between cursor-grab active:cursor-grabbing select-none overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]"
          style={{
            transform: `translateX(${dragOffset}px) rotateY(${dragOffset * 0.045}deg) scale(${Math.max(0.94, 1 - Math.abs(dragOffset) * 0.0003)})`,
            transformOrigin: dragOffset < 0 ? 'right center' : 'left center',
            opacity: isTransitioning && slidePhase === 'sliding-out' 
              ? Math.max(0.2, 1 - Math.abs(dragOffset) / 380) 
              : 1,
            transition: isDragging 
              ? 'none' 
              : 'transform 0.36s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease-out',
            perspective: '1400px',
            transformStyle: 'preserve-3d',
            boxShadow: isDragging || isTransitioning
              ? `${dragOffset > 0 ? '22px' : '-22px'} 12px 35px rgba(0, 0, 0, ${Math.min(0.3, Math.abs(dragOffset) * 0.0012 + 0.08)})`
              : '0 15px 35px rgba(0, 0, 0, 0.35)'
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
                  ? 'linear-gradient(to right, transparent 35%, rgba(180,83,9,0.06) 70%, rgba(0,0,0,0.2) 100%)'
                  : 'linear-gradient(to left, transparent 35%, rgba(180,83,9,0.06) 70%, rgba(0,0,0,0.2) 100%)',
                opacity: Math.min(1, Math.abs(dragOffset) / 90)
              }}
            />
          )}

          {/* Floating Flip Target Badge */}
          {(isDragging || (isTransitioning && slidePhase === 'sliding-out')) && Math.abs(dragOffset) > 25 && (
            <div className={`absolute top-5 ${dragOffset < 0 ? 'left-5' : 'right-5'} z-40 bg-emerald-950/95 text-amber-300 backdrop-blur-md px-3.5 py-1.5 rounded-full border-2 border-amber-400/80 shadow-[3px_3px_0px_0px_#000] text-xs font-black flex items-center gap-1.5 animate-fadeIn pointer-events-none`}>
              {dragOffset < 0 ? (
                <>
                  <span>👈 Buka Halaman {Math.min(604, rightPageNumber + (isDualSpread ? 2 : 1))}</span>
                  <span className="text-[10px] text-emerald-300 font-normal hidden sm:inline">• Lepas untuk membalik</span>
                </>
              ) : (
                <>
                  <span className="text-[10px] text-emerald-300 font-normal hidden sm:inline">Lepas untuk membalik •</span>
                  <span>Buka Halaman {Math.max(1, rightPageNumber - (isDualSpread ? 2 : 1))} 👉</span>
                </>
              )}
            </div>
          )}

          {/* LEFT PAGE (EVEN PAGE IN DUAL SPREAD, e.g. 294) */}
          {isDualSpread && leftPageNumber && renderSingleMushafPage(
            leftPageNumber,
            mushafLinesLeft,
            isLoadingPageLeft,
            scanLoadedLeft,
            scanErrorLeft,
            scanUrlIndexLeft,
            fallbackUrlsLeft,
            setScanLoadedLeft,
            setScanErrorLeft,
            setScanUrlIndexLeft,
            pageSurahsArabicLabelLeft,
            juzNumberLeft || juzNumberRight,
            true
          )}

          {/* CENTRAL BOOK SPINNER / SPINAL CREASE & GOLDEN BOOKMARK RIBBON */}
          {isDualSpread && leftPageNumber && (
            <div className="hidden sm:flex relative w-6 flex-col items-center justify-center shrink-0">
              {/* Deep 3D Spine Gutter Shadow */}
              <div className="absolute inset-y-0 -inset-x-2 bg-gradient-to-r from-black/35 via-black/10 to-black/35 pointer-events-none z-20"></div>
              
              {/* Golden Silk Bookmark Ribbon */}
              <div className="w-2.5 h-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 shadow-md rounded-b-md border-x border-amber-700/60 z-25 relative">
                <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            </div>
          )}

          {/* RIGHT PAGE (ODD PAGE IN DUAL SPREAD, e.g. 293 / OR SINGLE PAGE) */}
          {renderSingleMushafPage(
            rightPageNumber,
            mushafLinesRight,
            isLoadingPageRight,
            scanLoadedRight,
            scanErrorRight,
            scanUrlIndexRight,
            fallbackUrlsRight,
            setScanLoadedRight,
            setScanErrorRight,
            setScanUrlIndexRight,
            pageSurahsArabicLabelRight,
            juzNumberRight,
            false
          )}

          {/* Interactive Golden Corner Peels */}
          {rightPageNumber < 604 && (
            <div 
              onClick={(e) => { e.stopPropagation(); handleNextPage(); }}
              className="absolute bottom-2 left-2 w-8 h-8 rounded-br-2xl group cursor-pointer z-30 transition-transform hover:scale-125"
              title={`Buka Halaman Berikutnya (👈)`}
            >
              <div className="w-full h-full bg-gradient-to-tr from-amber-400 via-amber-200 to-transparent border-t-2 border-r-2 border-amber-600/70 rounded-tr-lg shadow-sm opacity-70 group-hover:opacity-100 transition-all transform -rotate-12 group-hover:rotate-0"></div>
            </div>
          )}

          {rightPageNumber > 1 && (
            <div 
              onClick={(e) => { e.stopPropagation(); handlePrevPage(); }}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-bl-2xl group cursor-pointer z-30 transition-transform hover:scale-125"
              title={`Buka Halaman Sebelumnya (👉)`}
            >
              <div className="w-full h-full bg-gradient-to-tl from-amber-400 via-amber-200 to-transparent border-t-2 border-l-2 border-amber-600/70 rounded-tl-lg shadow-sm opacity-70 group-hover:opacity-100 transition-all transform rotate-12 group-hover:rotate-0"></div>
            </div>
          )}
        </div>

        {/* SWIPE GUIDANCE & BOTTOM CONTROLS */}
        <div className="flex items-center justify-between w-full text-[11px] font-bold text-amber-200 pt-3 px-2">
          <button 
            onClick={handleNextPage}
            disabled={currentPage >= 604}
            className="flex items-center gap-1 text-[#F59E0B] hover:underline disabled:opacity-30 cursor-pointer font-black text-xs bg-amber-950/80 px-3 py-1.5 rounded-xl border border-amber-700/60"
            title="Buka Halaman Berikutnya"
          >
            <span>👈 Buka Hal. {Math.min(604, rightPageNumber + (isDualSpread ? 2 : 1))}</span>
          </button>
          
          <div className="flex items-center gap-1.5 text-[10px] text-amber-950 font-black bg-amber-300 px-3.5 py-1 rounded-full border border-amber-500 shadow-xs">
            <span>✨ Usap Lembaran Mushaf untuk Membalik</span>
          </div>

          <button 
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 text-[#F59E0B] hover:underline disabled:opacity-30 cursor-pointer font-black text-xs bg-amber-950/80 px-3 py-1.5 rounded-xl border border-amber-700/60"
            title="Buka Halaman Sebelumnya"
          >
            <span>Buka Hal. {Math.max(1, rightPageNumber - (isDualSpread ? 2 : 1))} 👉</span>
          </button>
        </div>

        {/* SIDE TURN FLOATING BUTTONS */}
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

      {/* TAJWEED & GHARIB KNOWLEDGE PANEL */}
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
                  Halaman {rightPageNumber} {leftPageNumber ? `& ${leftPageNumber}` : ''}
                </span>
              </h4>
              <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                Analisis otomatis hukum tajwid per kata & kaidah bacaan khusus pada bukaan mushaf
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
              <span>Hukum Tajwid ({pageTajweedData?.rulesList?.length || 0})</span>
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
              <span>Kaidah Gharib {pageGharibData && pageGharibData.length > 0 ? '🌟' : ''}</span>
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
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Ensiklopedia Tajwid</span>
            </button>
          </div>
        </div>

        {/* TAB 1: TAJWEED RULES */}
        {activeTajweedTab === 'tajweed' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Ditemukan <strong className="text-emerald-700 dark:text-emerald-400">{pageTajweedData?.rulesList?.length || 0}</strong> jenis hukum tajwid pada halaman ini:
              </span>
            </div>

            {pageTajweedData?.rulesList && pageTajweedData.rulesList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {pageTajweedData.rulesList.map((t, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-white dark:bg-gray-800 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] flex flex-col justify-between space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className="px-2 py-0.5 rounded text-[11px] font-black"
                        style={{ backgroundColor: t.colorHex + '25', color: t.colorHex }}
                      >
                        {t.ruleName}
                      </span>
                      <span className="font-quran text-xs font-bold text-amber-900 dark:text-amber-300">{t.matchedWord}</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{t.description}</p>
                    <div className="pt-1 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-gray-500">Durasi:</span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">{t.harakatDuration} Harakat</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs font-bold text-gray-500">
                Pilih mode 15 Baris Teks untuk melihat analisis otomatis hukum tajwid per kata.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GHARIB RULES */}
        {activeTajweedTab === 'gharib' && (
          <div className="space-y-3">
            {pageGharibData && pageGharibData.length > 0 ? (
              <div className="space-y-3">
                {pageGharibData.map((gharib, gIdx) => (
                  <div key={gIdx} className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-800 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
                      <AlertCircle className="w-5 h-5" />
                      <h5 className="font-black text-sm">{gharib.title} ({gharib.surahName} : {gharib.ayahNumber})</h5>
                    </div>
                    <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                      {gharib.description}
                    </p>
                    <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-amber-700/40 font-mono text-xs">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">Cara Membaca: </span>
                      <span className="text-gray-700 dark:text-gray-200">{gharib.caraBaca}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs font-bold text-gray-600 dark:text-gray-400 space-y-1">
                <p>Tidak ada bacaan Gharib khusus pada halaman {rightPageNumber}.</p>
                <p className="text-[11px] text-gray-500">Gharib terdapat pada ayat-ayat tertentu seperti Imalah (Hud: 41), Isymam (Yusuf: 11), Tashil (Fushshilat: 44), Naql (Al-Hujurat: 11), dan Saktah.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COLOR LEGEND */}
        {activeTajweedTab === 'legend' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border-2 border-red-800 rounded-xl">
              <span className="font-black text-red-700 dark:text-red-300 block">🔴 Hukum Mad</span>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">Mad Wajib, Jaiz, Lazim, 'Aridh (2-6 harakat)</p>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-800 rounded-xl">
              <span className="font-black text-emerald-700 dark:text-emerald-300 block">🟢 Ghunnah & Idgham</span>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">Nun/Mim Tasydid & Idgham Bighunnah (2 harakat)</p>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-800 rounded-xl">
              <span className="font-black text-blue-700 dark:text-blue-300 block">🔵 Ikhfa' Haqiqi</span>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">Samar-samar berdengung (15 huruf ikhfa')</p>
            </div>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-800 rounded-xl">
              <span className="font-black text-purple-700 dark:text-purple-300 block">🟣 Iqlab & Qalqalah</span>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">Tukar bunyi ke mim & pantulan huruf Quthbu Jaddin</p>
            </div>
          </div>
        )}

        {/* TAB 4: TAJWEED ENCYCLOPEDIA */}
        {activeTajweedTab === 'encyclopedia' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kaidah tajwid..."
                  value={encyclopediaSearch}
                  onChange={(e) => setEncyclopediaSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-gray-800 border-2 border-black rounded-xl text-xs font-bold focus:outline-none"
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                {['Semua', 'Nun & Tanwin', 'Mim Mati', 'Hukum Mad', 'Gharib'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setEncyclopediaCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border border-black cursor-pointer ${
                      encyclopediaCategory === cat ? 'bg-[#0B4627] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {filteredEncyclopedia.map((entry, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-white dark:bg-gray-800 border-2 border-black rounded-xl space-y-1.5 shadow-[2px_2px_0px_0px_#000]"
                >
                  <div className="flex items-center justify-between">
                    <h6 className="font-black text-xs text-black dark:text-white flex items-center gap-1.5">
                      <span>{entry.title}</span>
                      <span className="font-quran text-emerald-800 dark:text-emerald-300 font-bold">({entry.arabicName})</span>
                    </h6>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-800">
                      {entry.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-700 dark:text-gray-300">{entry.summary}</p>
                  <div className="bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-800/40 font-mono text-[11px] flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Contoh:</span>
                    <span className="font-quran text-sm font-bold text-amber-950 dark:text-amber-200">{entry.contohLafadz}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
  Square,
  SkipForward,
  SkipBack,
  Volume1
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

export interface PlayingVerseItem {
  surahNumber: number;
  ayahNumber: number;
  surahLatin: string;
  pageNumber: number;
}

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sequential Page Audio State
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [isAudioPaused, setIsAudioPaused] = useState<boolean>(false);
  const isAudioPlayingRef = useRef<boolean>(false);
  const [currentPlayingVerse, setCurrentPlayingVerse] = useState<PlayingVerseItem | null>(null);
  const [pageAudioQueue, setPageAudioQueue] = useState<PlayingVerseItem[]>([]);
  const [currentQueueIdx, setCurrentQueueIdx] = useState<number>(0);

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
      isAudioPlayingRef.current = false;
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

    if (isAudioActive || isAudioPlayingRef.current) {
      isAudioPlayingRef.current = false;
      audioPlayer.stop();
      setIsAudioActive(false);
      setIsAudioPaused(false);
      setCurrentPlayingVerse(null);
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

    setTimeout(() => {
      setCurrentPage((prev) => {
        if (dir === 'next') {
          return Math.min(604, prev + step);
        } else {
          return Math.max(1, prev - step);
        }
      });
      setDragOffset(0);
      setSlidePhase('sliding-in');

      setTimeout(() => {
        setSlidePhase('idle');
        setIsTransitioning(false);
        setSlideDirection(null);
      }, 260);
    }, 240);
  }, [currentPage, isTransitioning, pageSoundEnabled, isDualSpread]);

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
    if (isAudioActive && currentPlayingVerse && !isAudioPaused) {
      // Re-trigger current verse with new reciter voice
      audioPlayer.playAyat(currentPlayingVerse.surahNumber, currentPlayingVerse.ayahNumber, undefined, reciter.id);
    }
  };

  // Build the complete sequential playlist of verses on the current page spread
  const buildPagePlaylist = useCallback((): PlayingVerseItem[] => {
    const list: PlayingVerseItem[] = [];

    // Right Page (Odd) verses
    pageSurahsRight.forEach((s) => {
      for (let a = s.startAyah; a <= s.endAyah; a++) {
        list.push({
          surahNumber: s.surahNumber,
          ayahNumber: a,
          surahLatin: s.surahLatin,
          pageNumber: rightPageNumber
        });
      }
    });

    // Left Page (Even) verses if in dual spread mode
    if (isDualSpread && leftPageNumber && pageSurahsLeft.length > 0) {
      pageSurahsLeft.forEach((s) => {
        for (let a = s.startAyah; a <= s.endAyah; a++) {
          list.push({
            surahNumber: s.surahNumber,
            ayahNumber: a,
            surahLatin: s.surahLatin,
            pageNumber: leftPageNumber
          });
        }
      });
    }

    return list;
  }, [pageSurahsRight, pageSurahsLeft, isDualSpread, rightPageNumber, leftPageNumber]);

  // Sequential Verse Player with auto-advance across the page
  const playQueueAt = useCallback((index: number, queue: PlayingVerseItem[]) => {
    if (!queue || queue.length === 0 || !isAudioPlayingRef.current) return;

    if (index >= queue.length) {
      // Finished all verses on current page!
      if (currentPage < 604) {
        setToastMessage('📖 Halaman selesai. Melanjutkan ke halaman berikutnya...');
        triggerPageTurn('next');
      } else {
        isAudioPlayingRef.current = false;
        setIsAudioActive(false);
        setIsAudioPaused(false);
        setCurrentPlayingVerse(null);
        setToastMessage('✅ Tilawah khatam.');
      }
      return;
    }

    const item = queue[index];
    setCurrentQueueIdx(index);
    setCurrentPlayingVerse(item);
    setIsAudioActive(true);
    setIsAudioPaused(false);

    // Preload next ayah in queue for instant zero-latency transition
    if (index + 1 < queue.length) {
      const nextItem = queue[index + 1];
      audioPlayer.preloadAyat(nextItem.surahNumber, nextItem.ayahNumber);
    }

    audioPlayer.playAyat(
      item.surahNumber,
      item.ayahNumber,
      () => {
        // Callback when current ayah audio finishes -> ONLY advance if user hasn't paused or stopped!
        if (isAudioPlayingRef.current) {
          playQueueAt(index + 1, queue);
        }
      },
      activeReciter.id
    );
  }, [currentPage, triggerPageTurn, activeReciter.id]);

  const handleStopPageAudio = () => {
    isAudioPlayingRef.current = false;
    audioPlayer.stop();
    setIsAudioActive(false);
    setIsAudioPaused(false);
    setCurrentPlayingVerse(null);
    setToastMessage('⏹ Audio tilawah dihentikan');
  };

  const handleTogglePlayPause = () => {
    // 1. If not active -> Start playing from beginning
    if (!isAudioActive) {
      const queue = buildPagePlaylist();
      if (queue.length === 0) {
        setToastMessage('Tidak ada ayat terdeteksi pada halaman ini');
        return;
      }
      isAudioPlayingRef.current = true;
      setIsAudioActive(true);
      setIsAudioPaused(false);
      setPageAudioQueue(queue);
      playQueueAt(0, queue);
      setToastMessage('▶ Memulai tilawah halaman...');
      return;
    }

    // 2. If active and currently playing -> PAUSE
    if (!isAudioPaused) {
      isAudioPlayingRef.current = false;
      audioPlayer.pause();
      setIsAudioPaused(true);
      setToastMessage('⏸ Audio tilawah dijeda');
      return;
    }

    // 3. If active and currently paused -> RESUME
    isAudioPlayingRef.current = true;
    setIsAudioPaused(false);
    if (audioPlayer.isPaused()) {
      audioPlayer.resume();
    } else if (pageAudioQueue.length > 0) {
      playQueueAt(currentQueueIdx, pageAudioQueue);
    }
    setToastMessage('▶ Melanjutkan audio tilawah...');
  };

  const handleSkipNextAyat = () => {
    if (pageAudioQueue.length > 0 && currentQueueIdx + 1 < pageAudioQueue.length) {
      isAudioPlayingRef.current = true;
      setIsAudioActive(true);
      setIsAudioPaused(false);
      playQueueAt(currentQueueIdx + 1, pageAudioQueue);
    }
  };

  const handleSkipPrevAyat = () => {
    if (pageAudioQueue.length > 0 && currentQueueIdx > 0) {
      isAudioPlayingRef.current = true;
      setIsAudioActive(true);
      setIsAudioPaused(false);
      playQueueAt(currentQueueIdx - 1, pageAudioQueue);
    }
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
      } else if (e.key === ' ') {
        e.preventDefault();
        handleTogglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPage, handlePrevPage, isAudioActive, isAudioPaused]);

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
        <div className="relative flex-1 w-full border-[3px] border-amber-900/60 rounded-lg p-1 sm:p-2 bg-white flex flex-col justify-between shadow-inner overflow-hidden">
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
            <div className="w-full flex-1 flex flex-col justify-between space-y-1 z-10 select-text px-1 py-1 sm:py-2" dir="rtl">
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
                        className="my-1 sm:my-1.5 p-1 sm:p-1.5 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 border-2 border-amber-800/70 rounded-lg text-center shadow-xs"
                      >
                        <span className="font-quran text-base sm:text-xl font-black text-amber-950 block">
                          {line.surahName || surahArabic}
                        </span>
                      </div>
                    );
                  }

                  if (line.type === 'basmala') {
                    return (
                      <div key={idx} className="my-0.5 text-center font-quran text-sm sm:text-lg text-amber-950 font-bold">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                      </div>
                    );
                  }

                  // Detect if this line belongs to the currently reciting verse
                  const isLineActive = Boolean(
                    isAudioActive &&
                    currentPlayingVerse && 
                    currentPlayingVerse.pageNumber === pageNum && 
                    line.verseRange && 
                    (() => {
                      const parts = line.verseRange.split('-');
                      return parts.some((p) => {
                        const [s, a] = p.trim().split(':');
                        return Number(s) === currentPlayingVerse.surahNumber && Number(a) === currentPlayingVerse.ayahNumber;
                      });
                    })()
                  );

                  return (
                    <div 
                      key={idx}
                      className={`w-full font-quran text-base sm:text-xl md:text-[21px] font-bold leading-[2.1] sm:leading-[2.4] text-center tracking-normal py-0.5 sm:py-1 px-1 transition-all duration-300 rounded-lg ${
                        isLineActive 
                          ? isAudioPaused
                            ? 'bg-amber-300/15 border-b-4 border-amber-400/80 shadow-[0_4px_12px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/40'
                            : 'bg-gradient-to-r from-amber-400/20 via-amber-300/35 to-amber-400/20 border-b-4 border-amber-500 shadow-[0_4px_16px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/60' 
                          : 'text-emerald-950 dark:text-emerald-300'
                      }`}
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
                                isLineActive ? 'underline decoration-amber-500 underline-offset-8 decoration-2' : ''
                              } ${
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
            {pageNum}
          </span>
          <span className="font-quran text-xs text-amber-900">
            {surahArabic}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`space-y-4 pb-20 select-none ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#111827] p-3 sm:p-6 overflow-y-auto' : 'max-w-6xl mx-auto'
      }`}
    >
      {/* FLOATING TOAST */}
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

            {/* AUDIO PLAY / PAUSE / STOP */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleTogglePlayPause}
                className={`px-3 py-1.5 border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000] transition-all ${
                  isAudioActive
                    ? isAudioPaused
                      ? 'bg-amber-400 hover:bg-amber-300 text-black'
                      : 'bg-[#F59E0B] text-black animate-pulse'
                    : 'bg-[#10B981] hover:bg-[#059669] text-white'
                }`}
                title={isAudioActive ? (isAudioPaused ? 'Lanjutkan Tilawah' : 'Jeda Tilawah') : 'Dengar Halaman'}
              >
                {isAudioActive ? (
                  isAudioPaused ? <Play className="w-3.5 h-3.5 fill-black" /> : <Pause className="w-3.5 h-3.5 fill-black" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white" />
                )}
                <span>
                  {isAudioActive ? (isAudioPaused ? 'Lanjut Tilawah' : 'Jeda Audio') : 'Dengar Halaman'}
                </span>
              </button>

              {isAudioActive && (
                <button
                  onClick={handleStopPageAudio}
                  className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white border-2 border-black rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                  title="Hentikan Audio Sepenuhnya"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Stop</span>
                </button>
              )}
            </div>

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
              className="w-full bg-white dark:bg-gray-800 text-black dark:text-white border-2 border-black rounded-xl px-2.5 py-1.5 font-bold cursor-pointer shadow-[2px_2px_0px_0px_#000]"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                <option key={j} value={j}>
                  Juz {j} ({JUZ_MAP[j]?.name || ''})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-5 flex items-center gap-1.5">
            <span className="font-bold text-gray-700 shrink-0">Surat:</span>
            <select
              value={primarySurahRight.number}
              onChange={(e) => handleJumpToSurah(Number(e.target.value))}
              className="w-full bg-white dark:bg-gray-800 text-black dark:text-white border-2 border-black rounded-xl px-2.5 py-1.5 font-bold cursor-pointer shadow-[2px_2px_0px_0px_#000]"
            >
              {SURAH_LIST.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.latinName} ({s.name}) • {s.ayahCount} Ayat
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4 flex items-center gap-1.5">
            <span className="font-bold text-gray-700 shrink-0">Hal:</span>
            <input
              type="number"
              min={1}
              max={604}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1 && val <= 604) {
                  setCurrentPage(val);
                }
              }}
              className="w-20 bg-white dark:bg-gray-800 text-black dark:text-white border-2 border-black rounded-xl px-2 py-1.5 font-black text-center shadow-[2px_2px_0px_0px_#000]"
            />
            <span className="font-bold text-gray-500">/ 604</span>
          </div>
        </div>
      </div>

      {/* 📖 MAIN PHYSICAL MUSHAF BOOK SPREAD CONTAINER */}
      <div 
        className="relative bg-[#EADBBE] dark:bg-[#0F172A] border-4 border-amber-950 rounded-2xl p-2 sm:p-5 shadow-[6px_6px_0px_0px_#111827] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* LEFTHAND / RIGHTHAND NAVIGATION FLIP BUTTONS */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-[#FFFDF7] hover:bg-[#FEF3C7] disabled:opacity-30 text-black border-2 border-black rounded-full shadow-[3px_3px_0px_0px_#000] cursor-pointer transition-all"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-amber-950" />
        </button>

        <button
          onClick={handleNextPage}
          disabled={currentPage >= 604}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-[#FFFDF7] hover:bg-[#FEF3C7] disabled:opacity-30 text-black border-2 border-black rounded-full shadow-[3px_3px_0px_0px_#000] cursor-pointer transition-all"
          title="Halaman Selanjutnya"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-amber-950" />
        </button>

        {/* 3D BOOK SPINE GUTTER & GOLD SILK BOOKMARK RIBBON (Only in Dual Spread Mode) */}
        {isDualSpread && leftPageNumber && (
          <>
            {/* Center Spine Crease Shadow */}
            <div className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-gradient-to-r from-black/25 via-black/5 to-black/25 pointer-events-none z-20 shadow-inner"></div>
            
            {/* Golden Silk Bookmark Ribbon */}
            <div className="absolute left-1/2 top-0 w-3 -translate-x-1/2 h-[75%] bg-gradient-to-b from-amber-600 via-amber-400 to-amber-500 shadow-[2px_4px_8px_rgba(0,0,0,0.3)] z-25 pointer-events-none rounded-b-md border-x border-amber-700/60 flex items-end justify-center">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-600 translate-y-2"></div>
            </div>
          </>
        )}

        {/* PAGES WRAPPER WITH ANIMATED SLIDE/FLIP */}
        <div 
          className={`flex gap-2 sm:gap-4 transition-transform duration-200 ${
            slidePhase === 'sliding-out' 
              ? slideDirection === 'next' ? '-translate-x-6 scale-98 opacity-80' : 'translate-x-6 scale-98 opacity-80'
              : slidePhase === 'sliding-in' 
              ? 'translate-x-0 scale-100 opacity-100'
              : ''
          }`}
          style={{ transform: dragOffset !== 0 ? `translateX(${dragOffset}px)` : undefined }}
        >
          {/* LEFT PAGE (Even Page, e.g. Hal. 294) - Only rendered in Dual Spread Mode */}
          {isDualSpread && leftPageNumber && (
            renderSingleMushafPage(
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
            )
          )}

          {/* RIGHT PAGE (Odd Page, e.g. Hal. 293) */}
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
        </div>

        {/* 🔊 FLOATING LIVE RECITATION HUD BAR */}
        {isAudioActive && currentPlayingVerse && (
          <div className="absolute bottom-3 left-4 right-4 sm:left-8 sm:right-8 bg-gradient-to-r from-[#0B4627] via-[#064E3B] to-[#0B4627] text-white p-3 sm:p-4 rounded-2xl border-3 border-amber-400 shadow-[0_8px_24px_rgba(0,0,0,0.45)] flex flex-wrap items-center justify-between gap-3 z-40 animate-fade-in backdrop-blur-md">
            <div className="flex items-center gap-3">
              {/* Equalizer Soundwave Animation */}
              <div className="flex items-end gap-1 h-6">
                <span className={`w-1.5 bg-amber-400 rounded-full h-5 ${!isAudioPaused ? 'animate-bounce' : ''}`}></span>
                <span className={`w-1.5 bg-amber-300 rounded-full h-3 ${!isAudioPaused ? 'animate-bounce delay-75' : ''}`}></span>
                <span className={`w-1.5 bg-amber-400 rounded-full h-6 ${!isAudioPaused ? 'animate-bounce delay-150' : ''}`}></span>
                <span className={`w-1.5 bg-amber-300 rounded-full h-4 ${!isAudioPaused ? 'animate-bounce delay-200' : ''}`}></span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border shadow-xs ${
                    isAudioPaused 
                      ? 'bg-amber-200 text-amber-950 border-amber-400' 
                      : 'bg-amber-400 text-black border-amber-500'
                  }`}>
                    {isAudioPaused ? '⏸ Tilawah Dijeda' : '▶ Sedang Tilawah'}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-amber-200">
                    QS. {currentPlayingVerse.surahLatin} [{currentPlayingVerse.surahNumber}] : Ayat {currentPlayingVerse.ayahNumber}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200 font-medium mt-0.5">
                  Qari: {activeReciter.name} ({activeReciter.country}) • Hal. {currentPlayingVerse.pageNumber}
                </p>
              </div>
            </div>

            {/* Audio Queue Navigation Controls */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-300/80 mr-1 hidden md:inline">
                Ayat {currentQueueIdx + 1} dari {pageAudioQueue.length}
              </span>

              <button 
                onClick={handleSkipPrevAyat}
                disabled={currentQueueIdx <= 0}
                className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-xl border border-white/20 cursor-pointer"
                title="Ayat Sebelumnya"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button 
                onClick={handleTogglePlayPause}
                className={`px-3 py-2 text-black font-black rounded-xl border-2 border-black flex items-center gap-1.5 text-xs shadow-xs cursor-pointer ${
                  isAudioPaused ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-amber-400 hover:bg-amber-300'
                }`}
                title={isAudioPaused ? 'Lanjutkan Tilawah' : 'Jeda Tilawah'}
              >
                {isAudioPaused ? <Play className="w-4 h-4 fill-black" /> : <Pause className="w-4 h-4 fill-black" />}
                <span>{isAudioPaused ? 'Lanjut' : 'Jeda'}</span>
              </button>

              <button 
                onClick={handleStopPageAudio}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl border-2 border-black flex items-center gap-1.5 text-xs shadow-xs cursor-pointer"
                title="Hentikan Audio Sepenuhnya"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Stop</span>
              </button>

              <button 
                onClick={handleSkipNextAyat}
                disabled={currentQueueIdx + 1 >= pageAudioQueue.length}
                className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white rounded-xl border border-white/20 cursor-pointer"
                title="Ayat Selanjutnya"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TAJWEED & ENCYCLOPEDIA INSPECTOR */}
      <div className="bg-[#FFFDF7] dark:bg-[#1E293B] border-3 border-black rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#111827] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-dashed border-gray-300 dark:border-gray-700 pb-3">
          <div>
            <h4 className="text-base font-black text-black dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <span>Analisis Hukum Tajwid & Kaidah Gharib (Halaman {rightPageNumber})</span>
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Standar Riwayat Hafs 'an 'Ashim Thariq Asy-Syathibiyyah (Mushaf Madinah).
            </p>
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
              <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">Dengung sempurna 2-3 harakat</p>
            </div>
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-800 rounded-xl">
              <span className="font-black text-sky-700 dark:text-sky-300 block">🔵 Ikhfa'</span>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">Samar-samar ber-ghunnah 2 harakat</p>
            </div>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-800 rounded-xl">
              <span className="font-black text-purple-700 dark:text-purple-300 block">🟣 Iqlab</span>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1">Menukar suara N ke M dengan dengung</p>
            </div>
          </div>
        )}

        {/* TAB 4: ENCYCLOPEDIA */}
        {activeTajweedTab === 'encyclopedia' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari kaidah tajwid..."
                  value={encyclopediaSearch}
                  onChange={(e) => setEncyclopediaSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border-2 border-black rounded-xl text-xs font-bold"
                />
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
                {['Semua', 'Nun & Tanwin', 'Mim Sukun', 'Ghunnah & Qalqalah', 'Mad Lengkap', 'Bacaan Gharib', 'Tanda Waqaf'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setEncyclopediaCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap border border-black cursor-pointer transition-all ${
                      encyclopediaCategory === cat
                        ? 'bg-[#0B4627] text-white shadow-xs'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {filteredEncyclopedia.map((entry) => (
                <div 
                  key={entry.id}
                  className="p-3.5 bg-white dark:bg-gray-800 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <div>
                      <h6 className="font-black text-xs text-black dark:text-white">{entry.title}</h6>
                      <span className="font-quran text-xs text-amber-800 font-bold">{entry.arabicName}</span>
                    </div>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-black"
                      style={{ backgroundColor: entry.colorHex + '25', color: entry.colorHex }}
                    >
                      {entry.category}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong className="text-emerald-900 dark:text-emerald-400">Menurut Bahasa: </strong>
                      {entry.pengertianBahasa}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong className="text-emerald-900 dark:text-emerald-400">Menurut Istilah: </strong>
                      {entry.pengertianIstilah}
                    </p>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 text-xs">
                    <p className="font-mono text-[11px] text-amber-900 dark:text-amber-300 font-bold">
                      Cara Baca: {entry.caraBaca}
                    </p>
                    <p className="font-quran text-xs text-right text-emerald-950 dark:text-emerald-200 mt-1" dir="rtl">
                      {entry.contohLafadz}
                    </p>
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

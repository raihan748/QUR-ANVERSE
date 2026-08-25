import React, { useState, useEffect, useRef } from 'react';
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
  RotateCcw
} from 'lucide-react';
import { 
  SURAH_LIST, 
  JUZ_MAP, 
  SURAH_PAGE_STARTS, 
  getJuzForPage, 
  getPrimarySurahForPage, 
  getMadinahPageFallbackUrls,
  getSurahAyahs 
} from '../../data/quranData';
import { audioPlayer, RECITERS_LIST, Reciter } from '../../services/audioPlayerService';
import { saveBookmark, setLastRead } from '../../services/offlineStorage';
import { useLanguage } from '../../context/LanguageContext';

const STORAGE_LAST_PAGE = 'quranverse_physical_mushaf_last_page_v1';

export interface MushafPageLine {
  line: number;
  type: 'text' | 'surah-header' | 'basmala';
  text?: string;
  surahName?: string;
  verseRange?: string;
}

export interface PageVerseInfo {
  surahNumber: number;
  surahLatin: string;
  surahArabic: string;
  startAyah: number;
  endAyah: number;
}

// Computes all surahs and their ayah ranges present on this page
function getPageSurahsInfo(lines: MushafPageLine[], fallbackSurah: any): PageVerseInfo[] {
  const map = new Map<number, { startAyah: number; endAyah: number }>();

  lines.forEach((l) => {
    if (l.verseRange) {
      const parts = l.verseRange.split('-');
      parts.forEach((p) => {
        const [sStr, aStr] = p.trim().split(':');
        const sNo = parseInt(sStr, 10);
        const aNo = parseInt(aStr, 10);
        if (!isNaN(sNo) && !isNaN(aNo)) {
          if (!map.has(sNo)) {
            map.set(sNo, { startAyah: aNo, endAyah: aNo });
          } else {
            const e = map.get(sNo)!;
            e.startAyah = Math.min(e.startAyah, aNo);
            e.endAyah = Math.max(e.endAyah, aNo);
          }
        }
      });
    }
  });

  if (map.size === 0) {
    return [{
      surahNumber: fallbackSurah.number,
      surahLatin: fallbackSurah.latinName,
      surahArabic: fallbackSurah.name,
      startAyah: 1,
      endAyah: fallbackSurah.ayahCount
    }];
  }

  const result: PageVerseInfo[] = [];
  map.forEach((range, sNo) => {
    const meta = SURAH_LIST.find((s) => s.number === sNo) || fallbackSurah;
    result.push({
      surahNumber: sNo,
      surahLatin: meta.latinName,
      surahArabic: meta.name,
      startAyah: range.startAyah,
      endAyah: range.endAyah
    });
  });

  return result.sort((a, b) => a.surahNumber - b.surahNumber);
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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Display Mode: 'scan' (Scanned Page Image - Physical Mushaf) | 'layout' (15-line Typography)
  const [viewMode, setViewMode] = useState<'scan' | 'layout'>('scan');
  const [mushafLines, setMushafLines] = useState<MushafPageLine[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState<number>(0);

  // Scan Image State
  const [scanLoaded, setScanLoaded] = useState<boolean>(false);
  const [scanError, setScanError] = useState<boolean>(false);
  const [scanUrlIndex, setScanUrlIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const primarySurah = getPrimarySurahForPage(currentPage);
  const juzNumber = getJuzForPage(currentPage);
  const fallbackUrls = getMadinahPageFallbackUrls(currentPage);

  const pageSurahs = getPageSurahsInfo(mushafLines, primarySurah);
  const pageSurahsLatinLabel = pageSurahs
    .map((s) => `${s.surahLatin} (${s.startAyah === s.endAyah ? `Ayat ${s.startAyah}` : `Ayat ${s.startAyah}–${s.endAyah}`})`)
    .join(' • ');
  const pageSurahsArabicLabel = pageSurahs
    .map((s) => s.surahArabic)
    .join(' • ');

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

  // Fetch 15-Line Mushaf Layout for the current page
  useEffect(() => {
    let isMounted = true;
    setIsLoadingPage(true);
    const pStr = String(currentPage).padStart(3, '0');
    const cacheKey = `quranverse_mushaf_layout_p${pStr}_v2`;

    // 1. Try LocalStorage Cache first
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMushafLines(parsed);
          setIsLoadingPage(false);
          return;
        }
      }
    } catch {}

    // 2. Fetch from jsDelivr Global CDN with raw GitHub fallback
    const fetchLayout = async () => {
      try {
        const url1 = `https://cdn.jsdelivr.net/gh/zonetecde/mushaf-layout@main/mushaf/page-${pStr}.json`;
        let res = await fetch(url1);
        if (!res.ok) {
          const url2 = `https://raw.githubusercontent.com/zonetecde/mushaf-layout/main/mushaf/page-${pStr}.json`;
          res = await fetch(url2);
        }
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.lines) && isMounted) {
            const formattedLines: MushafPageLine[] = data.lines.map((l: any, idx: number) => ({
              line: l.line || idx + 1,
              type: l.type || 'text',
              text: l.text || '',
              surahName: l.surahName || (l.type === 'surah-header' ? (l.text || primarySurah.name) : undefined),
              verseRange: l.verseRange || ''
            }));
            setMushafLines(formattedLines);
            try {
              localStorage.setItem(cacheKey, JSON.stringify(formattedLines));
            } catch {}
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load mushaf layout JSON, attempting fallback API:', err);
      }

      // 3. Fallback to AlQuran.cloud API
      try {
        const apiRes = await fetch(`https://api.alquran.cloud/v1/page/${currentPage}/quran-uthmani`);
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.code === 200 && Array.isArray(apiData.data?.ayahs) && isMounted) {
            const lines: MushafPageLine[] = apiData.data.ayahs.map((a: any, idx: number) => ({
              line: idx + 1,
              type: 'text',
              text: `${a.text} ۝${a.numberInSurah}`,
              verseRange: `${a.surah.number}:${a.numberInSurah}`
            }));
            setMushafLines(lines);
            try {
              localStorage.setItem(cacheKey, JSON.stringify(lines));
            } catch {}
            return;
          }
        }
      } catch (apiErr) {
        console.warn('API fallback also failed, attempting core surah ayahs fallback:', apiErr);
      }

      // 4. Ultimate Fallback: Load from Core In-Memory / Equran Database
      try {
        const coreAyats = await getSurahAyahs(primarySurah.number);
        if (coreAyats && coreAyats.length > 0 && isMounted) {
          const lines: MushafPageLine[] = coreAyats.map((a, idx) => ({
            line: idx + 1,
            type: 'text',
            text: `${a.arabicText} ۝${a.numberInSurah}`,
            verseRange: `${a.surahNumber}:${a.numberInSurah}`
          }));
          setMushafLines(lines);
          return;
        }
      } catch (coreErr) {
        console.warn('Core ayahs fallback failed:', coreErr);
      }
    };

    fetchLayout().finally(() => {
      if (isMounted) setIsLoadingPage(false);
    });

    return () => {
      isMounted = false;
    };
  }, [currentPage, reloadKey]);

  // Reset scan state on page change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LAST_PAGE, String(currentPage));
      setLastRead(primarySurah.number, 1, `Halaman ${currentPage} (${primarySurah.latinName})`);
    } catch {}

    setScanLoaded(false);
    setScanError(false);
    setScanUrlIndex(0);

    if (isPlayingPageAudio) {
      audioPlayer.stop();
      setIsPlayingPageAudio(false);
    }
  }, [currentPage]);

  const handleNextPage = () => { if (currentPage < 604) setCurrentPage((prev) => prev + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage((prev) => prev - 1); };

  const handleJumpToJuz = (juz: number) => {
    const targetPage = juz === 1 ? 1 : Math.min(604, (juz - 1) * 20 + 2);
    setCurrentPage(targetPage);
  };

  const handleJumpToSurah = (surahNumber: number) => {
    const targetPage = SURAH_PAGE_STARTS[surahNumber] || 1;
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
    alert(`🔖 Halaman ${currentPage} (${pageSurahsLatinLabel}) berhasil disimpan ke Bookmark!`);
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
  }, [currentPage]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
    }
    setTouchStartX(null);
  };

  return (
    <div 
      ref={containerRef}
      className={`space-y-4 max-w-4xl mx-auto transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#F8F5EE] p-4 overflow-y-auto max-w-none' : ''
      }`}
    >
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
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border-3 border-black rounded-2xl shadow-[6px_6px_0px_0px_#111827] z-50 p-2 space-y-1">
                  <div className="px-2 py-1 border-b border-black font-black text-xs text-gray-700">
                    Pilih Qari Tilawah:
                  </div>
                  {RECITERS_LIST.map((r) => {
                    const isSelected = r.id === activeReciter.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleSelectReciter(r)}
                        className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0B4627] text-white font-black'
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
              )}
            </div>

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
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="w-full accent-[#0B4627] cursor-pointer"
            />
            <input
              type="number"
              min="1"
              max="604"
              value={currentPage}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 1 && val <= 604) setCurrentPage(val);
              }}
              className="w-14 p-1 bg-white border-2 border-black rounded-lg text-center font-bold font-mono text-xs"
            />
          </div>
        </div>
      </div>

      <div 
        className="relative bg-[#FFFDF7] dark:bg-[#1E293B] border-3 border-black rounded-3xl p-3 sm:p-6 shadow-[6px_6px_0px_0px_#111827] flex flex-col items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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

        <div className="relative w-full max-w-2xl bg-[#FFFDF7] border-3 border-amber-900/40 rounded-2xl p-2 sm:p-5 shadow-[inset_0_0_20px_rgba(180,83,9,0.1)] flex flex-col min-h-[580px] sm:min-h-[780px] justify-between">
          
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
                      <span className="inline font-quran select-text">{line.text}</span>
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

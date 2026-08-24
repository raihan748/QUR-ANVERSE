import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Volume2, 
  Square, 
  Play, 
  Pause, 
  Headphones, 
  ChevronDown, 
  Bookmark as BookmarkIcon, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  SURAH_LIST, 
  JUZ_MAP, 
  SURAH_PAGE_STARTS, 
  getJuzForPage, 
  getPrimarySurahForPage, 
  getMadinahPageImageUrl 
} from '../../data/quranData';
import { audioPlayer, RECITERS_LIST, Reciter } from '../../services/audioPlayerService';
import { saveBookmark, setLastRead } from '../../services/offlineStorage';
import { useLanguage } from '../../context/LanguageContext';

const STORAGE_LAST_PAGE = 'quranverse_physical_mushaf_last_page_v1';

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
    return 1; // Default to Al-Fatihah page 1
  });

  const [activeReciter, setActiveReciter] = useState<Reciter>(audioPlayer.getActiveReciter());
  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState(false);
  const [isPlayingPageAudio, setIsPlayingPageAudio] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const primarySurah = getPrimarySurahForPage(currentPage);
  const juzNumber = getJuzForPage(currentPage);

  const [imageSrc, setImageSrc] = useState<string>(getMadinahPageImageUrl(currentPage));
  const [triedBackupCdn, setTriedBackupCdn] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LAST_PAGE, String(currentPage));
      setLastRead(primarySurah.number, 1, `Halaman ${currentPage} (${primarySurah.latinName})`);
    } catch {}
    setImageSrc(getMadinahPageImageUrl(currentPage));
    setTriedBackupCdn(false);
    setImageLoaded(false);
    setImageError(false);
    if (isPlayingPageAudio) {
      audioPlayer.stop();
      setIsPlayingPageAudio(false);
    }
  }, [currentPage]);

  // Page Navigation Handlers
  const handleNextPage = () => {
    if (currentPage < 604) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

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

  // Play Page Audio
  const handleTogglePageAudio = async () => {
    if (isPlayingPageAudio) {
      audioPlayer.stop();
      setIsPlayingPageAudio(false);
      return;
    }

    setIsPlayingPageAudio(true);
    await audioPlayer.playAyat(primarySurah.number, 1, () => {
      setIsPlayingPageAudio(false);
    }, activeReciter.id);
  };

  // Bookmark current page
  const handleBookmarkPage = () => {
    saveBookmark({
      surahNumber: primarySurah.number,
      ayahNumber: 1,
      surahName: `Halaman ${currentPage} - Surat ${primarySurah.latinName}`,
      arabicText: `مصحف المدينة المنورة - الصفحة ${currentPage}`,
      translation: `Tanda Baca Halaman ${currentPage} (Juz ${juzNumber} - Surat ${primarySurah.latinName})`,
      note: `Ditandai dari Mode Mushaf Fisik Asli (Halaman ${currentPage})`
    });
    alert(`🔖 Halaman ${currentPage} (Juz ${juzNumber} - Surat ${primarySurah.latinName}) berhasil disimpan ke Bookmark!`);
  };

  // Keyboard Arrow Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleNextPage();
      } else if (e.key === 'ArrowRight') {
        handlePrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  // Touch Swipe Gesture for Mobile/Tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      handleNextPage();
    } else if (diff < -50) {
      handlePrevPage();
    }
    setTouchStartX(null);
  };

  return (
    <div 
      ref={containerRef}
      className={`space-y-4 max-w-5xl mx-auto transition-all select-none ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#111827] p-4 overflow-y-auto' : ''
      }`}
    >
      {/* 1. TOP CONTROL BAR */}
      <div className="bg-[#FFFDF7] border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_0px_#111827] space-y-3">
        {/* Row A: Title, Reciter Selector, & Quick Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#0B4627] text-[#F59E0B] border-2 border-black flex items-center justify-center font-black text-xs font-mono shadow-[2px_2px_0px_0px_#000]">
              {currentPage}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0B4627] bg-[#D1FAE5] px-2 py-0.5 rounded border border-[#0B4627]">
                  {language === 'ar' ? `الجزء ${juzNumber}` : `Juz ${juzNumber}`}
                </span>
                <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-200 px-2 py-0.5 rounded border border-amber-400">
                  {language === 'ar' ? `صفحة ${currentPage} من ٦٠٤` : `Hal. ${currentPage} / 604`}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-black">
                Surat {primarySurah.latinName} ({primarySurah.name})
              </h3>
            </div>
          </div>

          {/* Reciter Selector & Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Reciter Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
                className="px-2.5 py-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 neo-button cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                title="Pilih Qari / Syekh Tilawah"
              >
                <Headphones className="w-3.5 h-3.5 text-[#0B4627]" />
                <span className="truncate max-w-[110px]">{activeReciter.name.split(' ')[1] || activeReciter.name}</span>
                <ChevronDown className="w-3 h-3 text-gray-700" />
              </button>

              {isReciterMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border-3 border-black rounded-2xl p-2 shadow-[6px_6px_0px_0px_#000] z-50 animate-in fade-in zoom-in-95 space-y-1">
                  <div className="p-1.5 border-b-2 border-black flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#0B4627]">
                      {language === 'ar' ? 'اختر القارئ المعتمد:' : 'Pilih Qari / Syekh Murottal:'}
                    </span>
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
              )}
            </div>

            {/* Play Page Audio */}
            <button
              onClick={handleTogglePageAudio}
              className={`px-3 py-1.5 border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer neo-button shadow-[2px_2px_0px_0px_#000] ${
                isPlayingPageAudio ? 'bg-[#F59E0B] text-black animate-pulse' : 'bg-[#10B981] text-white'
              }`}
            >
              {isPlayingPageAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingPageAudio ? 'Jeda Audio' : 'Audio Halaman'}</span>
            </button>

            {/* Bookmark Page */}
            <button
              onClick={handleBookmarkPage}
              className="p-1.5 bg-white hover:bg-[#FEF3C7] text-black border-2 border-black rounded-xl neo-button cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              title="Tandai Halaman Ini (Bookmark)"
            >
              <BookmarkIcon className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 bg-white hover:bg-gray-100 text-black border-2 border-black rounded-xl neo-button cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Row B: Quick Jump Selectors (Juz, Surah, Slider) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-dashed border-gray-300 text-xs">
          {/* Quick Jump Juz */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-700 shrink-0">Juz:</span>
            <select
              value={juzNumber}
              onChange={(e) => handleJumpToJuz(Number(e.target.value))}
              className="w-full p-1.5 bg-white border-2 border-black rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                <option key={j} value={j}>
                  Juz {j} - {JUZ_MAP[j]?.name || ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Jump Surah */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-700 shrink-0">Surat:</span>
            <select
              value={primarySurah.number}
              onChange={(e) => handleJumpToSurah(Number(e.target.value))}
              className="w-full p-1.5 bg-white border-2 border-black rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
            >
              {SURAH_LIST.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.latinName} ({s.name})
                </option>
              ))}
            </select>
          </div>

          {/* Direct Page Input & Slider */}
          <div className="flex items-center gap-2">
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

      {/* 2. REALISTIC PHYSICAL MUSHAF CANVAS CONTAINER */}
      <div 
        className="relative bg-[#FFFDF7] dark:bg-[#1E293B] border-3 border-black rounded-3xl p-3 sm:p-6 shadow-[6px_6px_0px_0px_#111827] flex flex-col items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Ornamental Golden Islamic Top Header */}
        <div className="w-full flex items-center justify-between border-b-2 border-amber-800/40 pb-2 mb-3 px-2 text-xs font-bold text-amber-900 dark:text-amber-300 font-mono">
          <span>{primarySurah.name}</span>
          <span className="font-sans font-black tracking-widest text-[#0B4627] dark:text-[#34D399]">
            {language === 'ar' ? 'مصحف المدينة النبوية' : 'MUSHAF MADINAH'}
          </span>
          <span>الجزء {juzNumber}</span>
        </div>

        {/* Realistic Page Frame & Scanned Page Image */}
        <div className="relative w-full max-w-2xl bg-white border-2 border-amber-900/30 rounded-2xl p-2 sm:p-4 shadow-inner flex flex-col items-center min-h-[540px] sm:min-h-[720px] justify-center">
          {/* Loading Spinner */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFFDF7]/90 z-10 space-y-2">
              <div className="w-10 h-10 border-4 border-[#0B4627] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-black text-emerald-900">
                Membuka Lembaran Halaman {currentPage}...
              </p>
            </div>
          )}

          {/* Scanned Madinah Mushaf Page Image */}
          <img
            src={imageSrc}
            alt={`Halaman ${currentPage} Mushaf Al-Quran Standar Madinah`}
            onLoad={() => {
              setImageLoaded(true);
              setImageError(false);
            }}
            onError={() => {
              const pStr = String(currentPage).padStart(3, '0');
              if (!triedBackupCdn) {
                setTriedBackupCdn(true);
                // Try secondary GitHub / jsDelivr raw mirror
                setImageSrc(`https://raw.githubusercontent.com/Govar/quran-images/master/images/page${pStr}.png`);
              } else {
                setImageLoaded(true);
                setImageError(true);
              }
            }}
            className={`w-full max-h-[85vh] object-contain transition-opacity duration-300 pointer-events-none select-none ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Fallback Display if Offline or CDN Issue */}
          {imageError && (
            <div className="text-center p-8 space-y-3">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl border-2 border-black flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-black">Halaman {currentPage} (Juz {juzNumber})</h4>
              <p className="text-xs text-gray-600 max-w-md">
                Surat {primarySurah.latinName} ({primarySurah.meaning})
              </p>
              <p className="font-quran text-2xl text-emerald-950 font-bold leading-loose p-4 bg-[#F8F5EE] border border-black rounded-xl" dir="rtl">
                {primarySurah.name}
              </p>
            </div>
          )}
        </div>

        {/* Ornamental Golden Islamic Bottom Footer */}
        <div className="w-full flex items-center justify-between border-t-2 border-amber-800/40 pt-2 mt-3 px-3 text-xs font-mono font-black text-amber-900 dark:text-amber-300">
          <span>- {currentPage} -</span>
          <span className="text-[10px] font-sans font-bold text-gray-500 hidden sm:inline">
            Gunakan tombol panah ◄ ► atau swipe layar untuk membalik halaman
          </span>
          <span>الحزب {Math.ceil(juzNumber * 2)}</span>
        </div>

        {/* Floating Side Flip Buttons (Overlay) */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FFFDF7]/90 hover:bg-[#FEF3C7] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center cursor-pointer transition-all hover:scale-110 disabled:opacity-30 disabled:pointer-events-none z-20"
          title="Halaman Sebelumnya (◄)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <button
          onClick={handleNextPage}
          disabled={currentPage >= 604}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FFFDF7]/90 hover:bg-[#FEF3C7] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center cursor-pointer transition-all hover:scale-110 disabled:opacity-30 disabled:pointer-events-none z-20"
          title="Halaman Selanjutnya (►)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* 3. BOTTOM HELPER BANNER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#F0FDF4] border-2 border-black rounded-xl text-xs text-gray-700">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#0B4627] shrink-0" />
          <p className="font-medium">
            <b>Mushaf Standar Madinah (Mujamma' Malik Fahd):</b> 15 Baris, 604 Halaman Rasm Utsmani otentik.
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

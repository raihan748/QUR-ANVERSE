import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sun, 
  Moon, 
  Sparkles, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Share2, 
  SlidersHorizontal,
  Info,
  FastForward,
  Clock,
  Flame,
  Search,
  Check
} from 'lucide-react';
import { 
  AL_MATSURAT_ITEMS, 
  MATSURAT_META, 
  MatsuratItem, 
  MatsuratTime, 
  MatsuratVariant 
} from '../../data/almatsuratData';
import { 
  almatsuratAudioService, 
  MatsuratAudioState 
} from '../../services/almatsuratAudioService';
import { useLanguage } from '../../context/LanguageContext';

export const AlMatsuratView: React.FC = () => {
  const { language } = useLanguage();

  // 1. Time state (auto-detected from local device clock)
  const [selectedTime, setSelectedTime] = useState<MatsuratTime>(() => {
    const hour = new Date().getHours();
    return hour >= 3 && hour < 15 ? 'morning' : 'evening';
  });
  const [isAutoTime, setIsAutoTime] = useState<boolean>(true);

  // 2. Variant state (Sughra vs Kubra)
  const [selectedVariant, setSelectedVariant] = useState<MatsuratVariant>('sughra');

  // 3. Search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 4. Reading customizations
  const [fontSize, setFontSize] = useState<number>(24); // in px for Arabic
  const [showTransliteration, setShowTransliteration] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showFadhilah, setShowFadhilah] = useState<boolean>(true);

  // 5. Audio state from service
  const [audioState, setAudioState] = useState<MatsuratAudioState>(almatsuratAudioService.getState());

  // 6. Interactive tasbih counts (persisted in localStorage per day)
  const todayKey = useMemo(() => {
    const d = new Date();
    return `matsurat_counts_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}_${selectedTime}`;
  }, [selectedTime]);

  const [counts, setCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save counts when updated
  useEffect(() => {
    try {
      localStorage.setItem(todayKey, JSON.stringify(counts));
    } catch (e) {
      console.warn('Could not save matsurat counts:', e);
    }
  }, [counts, todayKey]);

  // Load counts when selectedTime changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      setCounts(saved ? JSON.parse(saved) : {});
    } catch {
      setCounts({});
    }
  }, [todayKey]);

  // Subscribe to audio service
  useEffect(() => {
    const unsubscribe = almatsuratAudioService.subscribe((state) => {
      setAudioState(state);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Filter items based on variant and search query
  const filteredItems = useMemo(() => {
    return AL_MATSURAT_ITEMS.filter((item) => {
      // Variant filter: 'sughra' shows only sughra; 'kubra' shows both sughra and kubra
      if (selectedVariant === 'sughra' && item.variant !== 'sughra') {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchArabic = item.arabic.includes(query);
        const matchTrans = item.transliteration.toLowerCase().includes(query);
        const matchMeaning = item.translation.toLowerCase().includes(query);
        return matchTitle || matchArabic || matchTrans || matchMeaning;
      }
      return true;
    });
  }, [selectedVariant, searchQuery]);

  // Calculate completed count
  const completedCount = useMemo(() => {
    return filteredItems.filter((item) => {
      const currentCount = counts[item.id] || 0;
      return currentCount >= item.targetCount;
    }).length;
  }, [filteredItems, counts]);

  const progressPercent = filteredItems.length > 0 
    ? Math.round((completedCount / filteredItems.length) * 100) 
    : 0;

  // 7. Calculate timeline for full audio synchronization
  const timelineMap = useMemo(() => {
    const totalDuration = audioState.duration > 0
      ? audioState.duration
      : (selectedTime === 'morning' ? 511.88 : 1508.38);

    const weights = filteredItems.map((item) => {
      const words = item.arabic.trim().split(/\s+/).length;
      const effectiveRepeats = item.targetCount > 10 ? 3 : item.targetCount;
      return words * effectiveRepeats;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;

    let currentSec = 0;
    return filteredItems.map((item, idx) => {
      const itemDuration = (weights[idx] / totalWeight) * totalDuration;
      const start = currentSec;
      const end = currentSec + itemDuration;
      currentSec = end;
      return {
        id: item.id,
        start,
        end,
        duration: itemDuration,
        effectiveRepeats: item.targetCount > 10 ? 3 : item.targetCount
      };
    });
  }, [filteredItems, audioState.duration, selectedTime]);

  // 8. Determine active card ID and active word progress
  const activeSync = useMemo(() => {
    // If not playing and at 0, no active recitation
    if (!audioState.isPlaying && audioState.currentTime === 0) {
      return { activeItemId: null, progressInItem: 0, effectiveRepeats: 1 };
    }

    if (audioState.playbackType === 'item' && audioState.activeItemId) {
      const dur = audioState.duration || 1;
      const progress = Math.min(1, Math.max(0, audioState.currentTime / dur));
      return {
        activeItemId: audioState.activeItemId,
        progressInItem: progress,
        effectiveRepeats: 1
      };
    }

    if (audioState.playbackType === 'full') {
      const curr = audioState.currentTime;
      const activeEntry = timelineMap.find((entry) => curr >= entry.start && curr < entry.end);
      if (activeEntry) {
        const itemProg = Math.min(1, Math.max(0, (curr - activeEntry.start) / (activeEntry.duration || 1)));
        return {
          activeItemId: activeEntry.id,
          progressInItem: itemProg,
          effectiveRepeats: activeEntry.effectiveRepeats
        };
      }
      if (curr >= (timelineMap[timelineMap.length - 1]?.end || 0) && timelineMap.length > 0) {
        return {
          activeItemId: timelineMap[timelineMap.length - 1].id,
          progressInItem: 1,
          effectiveRepeats: 1
        };
      }
    }

    return { activeItemId: null, progressInItem: 0, effectiveRepeats: 1 };
  }, [audioState, timelineMap]);

  // 9. Auto-scroll to active card during continuous recitation
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastScrolledItemId = useRef<string | null>(null);

  useEffect(() => {
    if (audioState.playbackType === 'full' && audioState.isPlaying && activeSync.activeItemId) {
      if (lastScrolledItemId.current !== activeSync.activeItemId) {
        lastScrolledItemId.current = activeSync.activeItemId;
        const targetEl = cardRefs.current[activeSync.activeItemId];
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [activeSync.activeItemId, audioState.playbackType, audioState.isPlaying]);

  // 10. Helper to render Arabic text with word-by-word underline
  const renderUnderlinedArabic = (text: string, isCardActive: boolean) => {
    const tokens = text.split(/(\s+)/);
    const actualWordsCount = tokens.filter((t) => t.trim().length > 0).length;

    if (!isCardActive || actualWordsCount === 0 || !audioState.isPlaying) {
      return text;
    }

    const repProgress = (activeSync.progressInItem * activeSync.effectiveRepeats) % 1;
    const currentActiveWordIdx = Math.min(
      actualWordsCount - 1,
      Math.floor(repProgress * actualWordsCount)
    );

    let wordCounter = 0;
    return tokens.map((token, index) => {
      if (token.trim().length === 0) {
        return <React.Fragment key={index}>{token}</React.Fragment>;
      }
      const isWordActive = wordCounter === currentActiveWordIdx;
      wordCounter++;

      return (
        <span
          key={index}
          className={`transition-all duration-150 inline-block ${
            isWordActive
              ? 'underline decoration-[#0B4627] decoration-4 underline-offset-8 font-black text-[#06331D] bg-[#FDE68A] rounded px-1.5 shadow-xs scale-105'
              : ''
          }`}
          style={
            isWordActive
              ? {
                  textDecorationLine: 'underline',
                  textDecorationColor: '#0B4627',
                  textDecorationThickness: '4px',
                  textUnderlineOffset: '8px'
                }
              : undefined
          }
        >
          {token}
        </span>
      );
    });
  };

  // 11. Helper to render Latin transliteration with word-by-word underline
  const renderUnderlinedLatin = (text: string, isCardActive: boolean) => {
    const tokens = text.split(/(\s+)/);
    const actualWordsCount = tokens.filter((t) => t.trim().length > 0).length;

    if (!isCardActive || actualWordsCount === 0 || !audioState.isPlaying) {
      return text;
    }

    const repProgress = (activeSync.progressInItem * activeSync.effectiveRepeats) % 1;
    const currentActiveWordIdx = Math.min(
      actualWordsCount - 1,
      Math.floor(repProgress * actualWordsCount)
    );

    let wordCounter = 0;
    return tokens.map((token, index) => {
      if (token.trim().length === 0) {
        return <React.Fragment key={index}>{token}</React.Fragment>;
      }
      const isWordActive = wordCounter === currentActiveWordIdx;
      wordCounter++;

      return (
        <span
          key={index}
          className={`transition-all duration-150 inline-block ${
            isWordActive
              ? 'underline decoration-[#D97706] decoration-2 underline-offset-4 font-bold text-amber-950 bg-amber-200/90 rounded px-1'
              : ''
          }`}
          style={
            isWordActive
              ? {
                  textDecorationLine: 'underline',
                  textDecorationColor: '#D97706',
                  textDecorationThickness: '2px',
                  textUnderlineOffset: '4px'
                }
              : undefined
          }
        >
          {token}
        </span>
      );
    });
  };

  // Tasbih increment handler
  const handleIncrement = (item: MatsuratItem) => {
    const current = counts[item.id] || 0;
    if (current < item.targetCount) {
      // Haptic feedback for tactile feel on mobile
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(35);
        } catch {}
      }
      setCounts((prev) => ({
        ...prev,
        [item.id]: current + 1
      }));
    }
  };

  const handleResetItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCounts((prev) => ({
      ...prev,
      [itemId]: 0
    }));
  };

  const handleResetAll = () => {
    if (window.confirm('Reset semua hitungan dzikir untuk sesi ini?')) {
      setCounts({});
    }
  };

  const handleTimeChange = (time: MatsuratTime) => {
    setSelectedTime(time);
    setIsAutoTime(false);
    // If full audio is playing and user switches time, switch full audio to that time
    if (audioState.playbackType === 'full' && audioState.isPlaying) {
      almatsuratAudioService.playFull(time);
    }
  };

  const handleToggleFullAudio = () => {
    almatsuratAudioService.playFull(selectedTime);
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isMorning = selectedTime === 'morning';

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-6 pb-28">
      {/* 1. HERO BANNER WITH NEOBRUTALISM ACCENTS */}
      <div className={`rounded-2xl border-3 border-black p-5 sm:p-7 transition-all shadow-[6px_6px_0px_0px_#000] ${
        isMorning ? 'bg-[#FEF3C7]' : 'bg-[#1E293B] text-white'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg border-2 border-black text-xs font-black uppercase tracking-wider ${
                isMorning ? 'bg-[#F59E0B] text-black' : 'bg-[#38BDF8] text-black'
              }`}>
                {isMorning ? '🌅 Al-Ma\'tsurat Pagi' : '🌇 Al-Ma\'tsurat Petang'}
              </span>

              {isAutoTime && (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-400">
                  <Clock className="w-3 h-3" /> Jam Lokal Otomatis
                </span>
              )}

              <span className="text-xs font-semibold opacity-80">
                Karya: Imam Syahid Hasan Al-Banna
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-wide">
              {isMorning ? 'Wazhifah Ash-Shabah (Dzikir Pagi)' : 'Wazhifah Al-Masaa\' (Dzikir Petang)'}
            </h1>
            <p className={`text-sm sm:text-base font-medium max-w-2xl ${isMorning ? 'text-gray-700' : 'text-slate-200'}`}>
              Benteng perlindungan mukmin, ketenangan qolbu, serta pembuka pintu barakah dan rezeki harian sesuai sunnah Rasulullah ﷺ.
            </p>
          </div>

          {/* Time Switcher Toggle */}
          <div className="flex items-center gap-2 bg-white/90 dark:bg-black/40 backdrop-blur-xs p-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <button
              onClick={() => handleTimeChange('morning')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-black text-xs transition-all cursor-pointer ${
                selectedTime === 'morning'
                  ? 'bg-[#F59E0B] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-600" />
              <span>Pagi</span>
            </button>
            <button
              onClick={() => handleTimeChange('evening')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-black text-xs transition-all cursor-pointer ${
                selectedTime === 'evening'
                  ? 'bg-[#38BDF8] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-gray-700 dark:text-gray-300 hover:text-black'
              }`}
            >
              <Moon className="w-4 h-4 text-blue-600" />
              <span>Petang</span>
            </button>
          </div>
        </div>

        {/* PROGRESS BAR & VARIANT TABS */}
        <div className="mt-6 pt-5 border-t-2 border-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Sughra vs Kubra Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase opacity-75">Varian:</span>
            <div className="flex bg-white/80 p-1 rounded-lg border-2 border-black">
              <button
                onClick={() => setSelectedVariant('sughra')}
                className={`px-3 py-1 text-xs font-black rounded-md transition-all cursor-pointer ${
                  selectedVariant === 'sughra'
                    ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
              >
                Sughra (Ringkas)
              </button>
              <button
                onClick={() => setSelectedVariant('kubra')}
                className={`px-3 py-1 text-xs font-black rounded-md transition-all cursor-pointer ${
                  selectedVariant === 'kubra'
                    ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
              >
                Kubra (Lengkap + Rabithah)
              </button>
            </div>
          </div>

          {/* Progress summary */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-48">
              <div className="flex justify-between text-xs font-black mb-1">
                <span>Progres Dzikir</span>
                <span>{completedCount} / {filteredItems.length} ({progressPercent}%)</span>
              </div>
              <div className="w-full h-3 bg-white/80 rounded-full border-2 border-black overflow-hidden">
                <div 
                  className="h-full bg-[#10B981] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {completedCount > 0 && (
              <button
                onClick={handleResetAll}
                className="p-1.5 bg-white text-gray-700 hover:text-red-600 border-2 border-black rounded-lg text-xs font-bold cursor-pointer"
                title="Reset Hitungan Dzikir"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. AUDIO RECITATION STICKY/PERSISTENT PLAYER BAR */}
      <div className="bg-[#06331D] text-white border-3 border-black rounded-2xl p-4 shadow-[5px_5px_0px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Info & Status */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleToggleFullAudio}
            className={`w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center text-black shrink-0 transition-all cursor-pointer ${
              audioState.playbackType === 'full' && audioState.isPlaying
                ? 'bg-[#10B981] shadow-[2px_2px_0px_0px_#000]'
                : 'bg-[#F59E0B] shadow-[3px_3px_0px_0px_#000] hover:scale-105'
            }`}
            title={audioState.playbackType === 'full' && audioState.isPlaying ? 'Jeda Audio' : 'Putar Audio Lengkap'}
          >
            {audioState.playbackType === 'full' && audioState.isPlaying ? (
              <Pause className="w-6 h-6 fill-black" />
            ) : (
              <Play className="w-6 h-6 fill-black translate-x-0.5" />
            )}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-amber-300 truncate">
                {audioState.playbackType === 'full' 
                  ? (selectedTime === 'morning' ? MATSURAT_META.fullAudioMorning.title : MATSURAT_META.fullAudioEvening.title)
                  : `Putar Lantunan Lengkap (${selectedTime === 'morning' ? 'Pagi' : 'Petang'})`}
              </h3>
              {audioState.playbackType === 'full' && audioState.isPlaying && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-200 truncate">
              Qari: {MATSURAT_META.fullAudioMorning.reciter} • Sinkronisasi Kata & Underline Aktif ✨
            </p>
          </div>
        </div>

        {/* Center: Timeline Progress (visible when full audio is active) */}
        {audioState.playbackType === 'full' && (
          <div className="flex items-center gap-2 w-full md:max-w-md">
            <span className="text-[11px] font-mono text-emerald-300 min-w-[36px]">
              {formatSeconds(audioState.currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={audioState.duration || 100}
              value={audioState.currentTime || 0}
              onChange={(e) => almatsuratAudioService.seek(parseFloat(e.target.value))}
              className="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#F59E0B]"
            />
            <span className="text-[11px] font-mono text-emerald-300 min-w-[36px]">
              {formatSeconds(audioState.duration)}
            </span>
          </div>
        )}

        {/* Right: Speed & Stop Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <div className="flex items-center bg-emerald-950/80 rounded-lg border border-emerald-700/60 p-0.5">
            {[1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => almatsuratAudioService.setSpeed(rate)}
                className={`px-2 py-1 text-[11px] font-black rounded cursor-pointer ${
                  audioState.playbackRate === rate
                    ? 'bg-[#F59E0B] text-black'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {audioState.isPlaying && (
            <button
              onClick={() => almatsuratAudioService.stop()}
              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black border border-black cursor-pointer shadow-[1px_1px_0px_0px_#000]"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      {/* 3. TOOLBAR & CONTROLS: SEARCH & TOGGLES */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Cari doa, ayat, atau arti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
          />
        </div>

        {/* Font size and view options */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Font size */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-black">
            <span className="text-[10px] font-black px-1">Arab:</span>
            <button
              onClick={() => setFontSize((s) => Math.max(18, s - 2))}
              className="px-2 py-0.5 bg-white rounded border border-gray-400 font-black hover:bg-gray-200 cursor-pointer"
              title="Perkecil Font"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize((s) => Math.min(36, s + 2))}
              className="px-2 py-0.5 bg-white rounded border border-gray-400 font-black hover:bg-gray-200 cursor-pointer"
              title="Perbesar Font"
            >
              A+
            </button>
          </div>

          {/* Toggle buttons */}
          <button
            onClick={() => setShowTransliteration(!showTransliteration)}
            className={`px-2.5 py-1.5 rounded-lg border border-black font-bold cursor-pointer transition-all ${
              showTransliteration ? 'bg-[#0B4627] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Latin
          </button>

          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`px-2.5 py-1.5 rounded-lg border border-black font-bold cursor-pointer transition-all ${
              showTranslation ? 'bg-[#0B4627] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Arti
          </button>

          <button
            onClick={() => setShowFadhilah(!showFadhilah)}
            className={`px-2.5 py-1.5 rounded-lg border border-black font-bold cursor-pointer transition-all ${
              showFadhilah ? 'bg-[#D97706] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Fadhilah
          </button>
        </div>
      </div>

      {/* 4. LIST OF MATSURAT DOA CARDS */}
      <div className="space-y-4">
        {filteredItems.map((item, index) => {
          const currentCount = counts[item.id] || 0;
          const isDone = currentCount >= item.targetCount;
          const progressPercentItem = Math.min(100, Math.round((currentCount / item.targetCount) * 100));

          // Texts dynamically change according to morning / evening
          const arabicText = (!isMorning && item.arabicEvening) ? item.arabicEvening : item.arabic;
          const transliterationText = (!isMorning && item.transliterationEvening) ? item.transliterationEvening : item.transliteration;
          const translationText = (!isMorning && item.translationEvening) ? item.translationEvening : item.translation;

          // Per-item audio
          const itemAudio = (!isMorning && item.audioUrlEvening) ? item.audioUrlEvening : item.audioUrl;
          const isPlayingThisItem = audioState.playbackType === 'item' && audioState.activeItemId === item.id && audioState.isPlaying;
          const isCardActive = activeSync.activeItemId === item.id && (audioState.isPlaying || audioState.currentTime > 0);

          return (
            <div
              key={item.id}
              ref={(el) => { cardRefs.current[item.id] = el; }}
              className={`rounded-2xl border-3 transition-all bg-white overflow-hidden ${
                isCardActive
                  ? 'border-[#0B4627] ring-4 ring-[#10B981]/40 shadow-[6px_6px_0px_0px_#0B4627] bg-[#FBFDF9]'
                  : isDone
                  ? 'border-black ring-2 ring-emerald-500 bg-emerald-50/40 shadow-[4px_4px_0px_0px_#000]'
                  : 'border-black shadow-[4px_4px_0px_0px_#000]'
              }`}
            >
              {/* Card Header */}
              <div className={`px-4 py-3 border-b-2 border-black flex flex-wrap items-center justify-between gap-2 transition-colors ${
                isCardActive ? 'bg-emerald-50/80' : 'bg-[#FFFDF7]'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-lg border border-black flex items-center justify-center font-black text-xs text-white ${
                    isCardActive ? 'bg-[#10B981]' : 'bg-[#0B4627]'
                  }`}>
                    {index + 1}
                  </span>
                  <h2 className="font-extrabold text-sm sm:text-base text-gray-900">
                    {item.title}
                  </h2>
                  {item.variant === 'kubra' && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-100 text-purple-900 border border-purple-400 rounded-md">
                      Khusus Kubra
                    </span>
                  )}
                  {isCardActive && audioState.isPlaying && (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0B4627] text-white text-[11px] font-black animate-pulse shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                      <span>🎙️ Sedang Dibaca Qari</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Per-Item Audio Play Button */}
                  {itemAudio && (
                    <button
                      onClick={() => almatsuratAudioService.playItem(item.id, selectedTime, itemAudio)}
                      className={`px-2 py-1 rounded-lg border border-black text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
                        isPlayingThisItem
                          ? 'bg-[#10B981] text-black shadow-[1px_1px_0px_0px_#000]'
                          : 'bg-[#FEF3C7] hover:bg-[#FDE68A] text-black shadow-[1px_1px_0px_0px_#000]'
                      }`}
                      title={isPlayingThisItem ? 'Jeda Audio' : 'Dengarkan Pelafalan Doa Ini'}
                    >
                      {isPlayingThisItem ? (
                        <>
                          <Pause className="w-3 h-3 fill-black" />
                          <span>Jeda</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-black translate-x-0.5" />
                          <span>Suara</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Target Count Badge */}
                  <span className="text-xs font-black px-2.5 py-1 bg-amber-100 text-amber-900 border border-black rounded-lg">
                    Dibaca {item.targetCount}x
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 space-y-4">
                {/* Arabic Text with Synchronized Underline */}
                <div 
                  className="font-quran leading-loose text-right text-gray-900 tracking-wide select-text py-2"
                  style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.9}px` }}
                  dir="rtl"
                >
                  {renderUnderlinedArabic(arabicText, isCardActive)}
                </div>

                {/* Transliteration with Synchronized Underline */}
                {showTransliteration && (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-300/80 text-xs sm:text-sm font-medium text-amber-950 leading-relaxed italic">
                    <span className="font-bold not-italic block text-[10px] text-amber-800 uppercase tracking-wider mb-0.5">
                      Transliterasi Latin:
                    </span>
                    {renderUnderlinedLatin(transliterationText, isCardActive)}
                  </div>
                )}

                {/* Indonesian Translation */}
                {showTranslation && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-800 leading-relaxed">
                    <span className="font-bold block text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">
                      Terjemahan:
                    </span>
                    {translationText}
                  </div>
                )}

                {/* Fadhilah & Sanad */}
                {showFadhilah && item.fadhilah && (
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[11px] text-emerald-950">
                        {item.fadhilah}
                      </p>
                      <p className="text-[10px] text-emerald-700 mt-0.5">
                        Sumber: {item.source}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer: Interactive Digital Tasbih Counter */}
              <div className="px-4 py-3 bg-[#FFFDF7] border-t-2 border-black flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {isDone ? (
                    <span className="flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Selesai ({currentCount}/{item.targetCount})
                    </span>
                  ) : (
                    <span className="text-xs font-black text-gray-700">
                      Hitungan: <strong className="text-black text-sm">{currentCount}</strong> / {item.targetCount}
                    </span>
                  )}

                  {currentCount > 0 && (
                    <button
                      onClick={(e) => handleResetItem(item.id, e)}
                      className="p-1 text-gray-500 hover:text-red-600 cursor-pointer"
                      title="Reset hitungan kartu ini"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Big Interactive Tasbih Click Button */}
                <button
                  onClick={() => handleIncrement(item)}
                  disabled={isDone}
                  className={`px-4 sm:px-6 py-2 rounded-xl border-2 border-black font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer select-none active:scale-95 ${
                    isDone
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-400'
                      : 'bg-[#F59E0B] hover:bg-[#D97706] text-black shadow-[3px_3px_0px_0px_#000]'
                  }`}
                >
                  {isDone ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Selesai Target</span>
                    </>
                  ) : (
                    <>
                      <span>Tap Tasbih</span>
                      <span className="px-2 py-0.5 rounded bg-black text-white text-xs">
                        +{item.targetCount - currentCount}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border-2 border-black">
            <p className="font-bold text-gray-600">Tidak ada doa yang cocok dengan pencarian "{searchQuery}".</p>
          </div>
        )}
      </div>

      {/* 5. INFORMATIVE FOOTER NOTE ON SANAD AL-BANNA */}
      <div className="p-5 bg-amber-50 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs text-amber-950 space-y-2">
        <div className="flex items-center gap-2 font-black text-sm text-[#0B4627]">
          <Info className="w-4 h-4" />
          <span>Mengenai Kitab Al-Ma'tsurat Hasan Al-Banna</span>
        </div>
        <p className="leading-relaxed">
          *Al-Ma'tsurat* adalah kumpulan wirid dan doa harian yang dihimpun oleh Imam Asy-Syahid Hasan Al-Banna dari ayat-ayat Al-Qur'an dan riwayat hadits-hadits shahih serta hasan. Dinamakan *Al-Ma'tsurat* karena seluruh bacaannya bersumber dari tuntunan ma'tsur (bersambung riwayatnya) dari Baginda Rasulullah Muhammad ﷺ.
        </p>
        <p className="text-[11px] text-amber-800">
          Waktu utama membaca: <strong>Pagi</strong> setelah Subuh hingga sebelum Zhuhur, dan <strong>Petang</strong> setelah Ashar hingga sebelum Maghrib atau Isya.
        </p>
      </div>
    </div>
  );
};

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

interface MatsuratMilestone {
  id: string;
  start: number;
  end: number;
  repeats?: number;
}

// Exact calibrated timestamps extracted from verified audio recording (511.88s)
const MATSURAT_TIMELINE_MORNING: MatsuratMilestone[] = [
  { id: 'fatihah', start: 0.0, end: 29.5, repeats: 1 },
  { id: 'baqarah_awal', start: 29.5, end: 65.5, repeats: 1 },
  { id: 'ayat_kursi', start: 65.5, end: 96.0, repeats: 1 },
  { id: 'baqarah_tengah', start: 96.0, end: 128.5, repeats: 1 },
  { id: 'baqarah_akhir', start: 128.5, end: 200.5, repeats: 1 },
  { id: 'al_ikhlas', start: 200.5, end: 212.5, repeats: 1 },
  { id: 'al_falaq', start: 212.5, end: 230.5, repeats: 1 },
  { id: 'an_nas', start: 230.5, end: 246.0, repeats: 1 },
  { id: 'mulku_lillah', start: 246.0, end: 254.5, repeats: 1 },
  { id: 'fitrah_islam', start: 254.5, end: 269.5, repeats: 1 },
  { id: 'afwa_wal_afiyah', start: 269.5, end: 281.5, repeats: 1 },
  { id: 'khair_yaum', start: 281.5, end: 291.5, repeats: 1 },
  { id: 'bika_ashbahna', start: 291.5, end: 294.0, repeats: 1 },
  { id: 'radhitu_billah', start: 294.0, end: 300.0, repeats: 1 },
  { id: 'subhanallah_adada', start: 300.0, end: 306.0, repeats: 1 },
  { id: 'bismillahilladzi', start: 306.0, end: 314.5, repeats: 1 },
  { id: 'syirik_protection', start: 314.5, end: 321.0, repeats: 1 },
  { id: 'audzu_bikalimatillah', start: 321.0, end: 327.0, repeats: 1 },
  { id: 'hammi_wal_hazan', start: 327.0, end: 338.5, repeats: 1 },
  { id: 'afiyah', start: 338.5, end: 356.5, repeats: 1 },
  { id: 'sayyidul_istighfar', start: 356.5, end: 375.0, repeats: 1 },
  { id: 'istighfar_100', start: 375.0, end: 387.0, repeats: 1 },
  { id: 'shalawat', start: 387.0, end: 414.0, repeats: 1 },
  { id: 'hasbiyallah', start: 414.0, end: 423.0, repeats: 1 },
  { id: 'tasbih_tahmid_tahlil', start: 423.0, end: 441.0, repeats: 1 },
  { id: 'tahlil_wahdahu', start: 441.0, end: 459.0, repeats: 1 },
  { id: 'doa_rabithah', start: 459.0, end: 511.88, repeats: 1 }
];

// Exact calibrated timestamps for Evening Recitation (1508.38s) with authentic sunnah repetitions
const MATSURAT_TIMELINE_EVENING: MatsuratMilestone[] = [
  { id: 'fatihah', start: 0.0, end: 38.2, repeats: 1 },
  { id: 'baqarah_awal', start: 38.2, end: 99.1, repeats: 1 },
  { id: 'ayat_kursi', start: 99.1, end: 151.4, repeats: 1 },
  { id: 'baqarah_tengah', start: 151.4, end: 209.2, repeats: 1 },
  { id: 'baqarah_akhir', start: 209.2, end: 275.2, repeats: 1 },
  { id: 'al_ikhlas', start: 275.2, end: 343.1, repeats: 3 },
  { id: 'al_falaq', start: 343.1, end: 404.0, repeats: 3 },
  { id: 'an_nas', start: 404.0, end: 451.0, repeats: 3 },
  { id: 'mulku_lillah', start: 451.0, end: 505.3, repeats: 1 },
  { id: 'fitrah_islam', start: 505.3, end: 532.9, repeats: 1 },
  { id: 'afwa_wal_afiyah', start: 532.9, end: 605.0, repeats: 1 },
  { id: 'khair_yaum', start: 605.0, end: 640.2, repeats: 1 },
  { id: 'bika_ashbahna', start: 640.2, end: 659.1, repeats: 1 },
  { id: 'radhitu_billah', start: 659.1, end: 734.4, repeats: 3 },
  { id: 'subhanallah_adada', start: 734.4, end: 777.8, repeats: 3 },
  { id: 'bismillahilladzi', start: 777.8, end: 889.3, repeats: 3 },
  { id: 'syirik_protection', start: 889.3, end: 914.0, repeats: 3 },
  { id: 'audzu_bikalimatillah', start: 914.0, end: 966.8, repeats: 3 },
  { id: 'hammi_wal_hazan', start: 966.8, end: 988.4, repeats: 3 },
  { id: 'afiyah', start: 988.4, end: 1069.4, repeats: 3 },
  { id: 'sayyidul_istighfar', start: 1069.4, end: 1141.3, repeats: 3 },
  { id: 'istighfar_100', start: 1141.3, end: 1179.1, repeats: 1 },
  { id: 'shalawat', start: 1179.1, end: 1265.3, repeats: 10 },
  { id: 'hasbiyallah', start: 1265.3, end: 1309.2, repeats: 7 },
  { id: 'tasbih_tahmid_tahlil', start: 1309.2, end: 1330.5, repeats: 1 },
  { id: 'tahlil_wahdahu', start: 1330.5, end: 1399.8, repeats: 10 },
  { id: 'doa_rabithah', start: 1399.8, end: 1489.2, repeats: 1 }
];

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

  // 7. Determine active card ID and smooth within-card progress using calibrated milestones
  const activeSync = useMemo(() => {
    // If not playing and at 0, no active recitation
    if (!audioState.isPlaying && audioState.currentTime === 0) {
      return { activeItemId: null, progressInItem: 0 };
    }

    const timeline = selectedTime === 'morning' ? MATSURAT_TIMELINE_MORNING : MATSURAT_TIMELINE_EVENING;

    // Per-item audio mode
    if (audioState.playbackType === 'item' && audioState.activeItemId) {
      const activeMilestone = timeline.find((m) => m.id === audioState.activeItemId);
      if (activeMilestone) {
        const itemDuration = activeMilestone.end - activeMilestone.start;
        const rawProgress = itemDuration > 0 ? (audioState.currentTime - activeMilestone.start) / itemDuration : 0;
        const repeats = activeMilestone.repeats || 1;
        const clampedProgress = Math.max(0, Math.min(1, rawProgress));
        const effectiveProgress = repeats > 1 ? (clampedProgress * repeats) % 1 : clampedProgress;
        return {
          activeItemId: audioState.activeItemId,
          progressInItem: effectiveProgress
        };
      }

      const dur = audioState.duration || 1;
      const progress = Math.min(1, Math.max(0, audioState.currentTime / dur));
      return {
        activeItemId: audioState.activeItemId,
        progressInItem: progress
      };
    }

    // Full recitation audio mode (calibrated timestamps)
    if (audioState.playbackType === 'full') {
      const curr = audioState.currentTime;
      const activeMilestone = timeline.find((m) => curr >= m.start && curr < m.end);

      if (activeMilestone) {
        const itemDuration = activeMilestone.end - activeMilestone.start;
        const rawProgress = itemDuration > 0 ? (curr - activeMilestone.start) / itemDuration : 0;
        const repeats = activeMilestone.repeats || 1;
        const clampedProgress = Math.max(0, Math.min(1, rawProgress));
        const effectiveProgress = repeats > 1 ? (clampedProgress * repeats) % 1 : clampedProgress;
        return {
          activeItemId: activeMilestone.id,
          progressInItem: effectiveProgress
        };
      }

      if (curr >= (timeline[timeline.length - 1]?.end || 0) && timeline.length > 0) {
        return {
          activeItemId: timeline[timeline.length - 1].id,
          progressInItem: 1
        };
      }
    }

    return { activeItemId: null, progressInItem: 0 };
  }, [audioState, selectedTime]);

  // 8. Auto-scroll to active card during continuous recitation
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

  // 9. Weighted word index calculation matching qari tartil rhythm and breath pauses
  const getActiveWordIndex = (text: string, progressInItem: number): number => {
    const tokens = text.split(/(\s+)/);
    const words = tokens.filter((t) => t.trim().length > 0);
    if (words.length === 0) return -1;
    if (words.length === 1) return 0;

    // Weight each word by character length + breath pause bonus on punctuation / verse signs + madd length
    const weights = words.map((w) => {
      let weight = Math.max(3, w.length);

      // Muqatha'ah letters (Alif Lam Mim, etc.) have 6+6 harakat madd (~4.5s)
      if (w.includes('الم') || w.includes('الٓمٓ') || w.toLowerCase().includes('alif-laaam-miiim')) {
        weight += 28;
      }
      // Prolonged madd in transliteration (aaa, iii, uuu)
      if (w.includes('aaa') || w.includes('iii') || w.includes('uuu')) {
        weight += 8;
      }
      // Natural pause between verses/phrases (waqaf)
      if (w.includes('۝') || w.includes('.') || w.includes('،') || w.includes('؛') || w.includes('؟')) {
        weight += 10;
      }
      return weight;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
    
    // Smooth progress buffer: prevents rushing at start and abrupt jumps
    const bufferedProgress = Math.max(0, Math.min(0.999, progressInItem));
    const targetWeight = bufferedProgress * totalWeight;

    let cumWeight = 0;
    for (let i = 0; i < weights.length; i++) {
      cumWeight += weights[i];
      if (cumWeight >= targetWeight) {
        return i;
      }
    }
    return words.length - 1;
  };

  // Interactive seek directly to a clicked word in the recitation
  const handleSeekToWord = (itemId: string, wordIdx: number, text: string) => {
    const timeline = selectedTime === 'morning' ? MATSURAT_TIMELINE_MORNING : MATSURAT_TIMELINE_EVENING;
    const milestone = timeline.find((m) => m.id === itemId);
    if (!milestone) return;

    const tokens = text.split(/(\s+)/);
    const words = tokens.filter((t) => t.trim().length > 0);
    if (words.length === 0) return;

    const weights = words.map((w) => {
      let weight = Math.max(3, w.length);
      if (w.includes('الم') || w.includes('الٓمٓ') || w.toLowerCase().includes('alif-laaam-miiim')) weight += 28;
      if (w.includes('aaa') || w.includes('iii') || w.includes('uuu')) weight += 8;
      if (w.includes('۝') || w.includes('.') || w.includes('،') || w.includes('؛') || w.includes('؟')) weight += 10;
      return weight;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
    let targetCumWeight = 0;
    for (let i = 0; i < wordIdx; i++) {
      targetCumWeight += weights[i];
    }
    const relativePos = targetCumWeight / totalWeight;
    const itemDuration = milestone.end - milestone.start;
    const targetSec = milestone.start + relativePos * itemDuration;

    almatsuratAudioService.playFull(selectedTime, targetSec);
  };

  // Play individual item segment with millisecond precision (100% offline)
  const handlePlayItemAudio = (itemId: string) => {
    const timeline = selectedTime === 'morning' ? MATSURAT_TIMELINE_MORNING : MATSURAT_TIMELINE_EVENING;
    const milestone = timeline.find((m) => m.id === itemId);
    if (milestone) {
      almatsuratAudioService.playSegment(itemId, selectedTime, milestone.start, milestone.end);
    }
  };

  // Start continuous full recitation from this item onwards
  const handlePlayFromHere = (itemId: string) => {
    const timeline = selectedTime === 'morning' ? MATSURAT_TIMELINE_MORNING : MATSURAT_TIMELINE_EVENING;
    const milestone = timeline.find((m) => m.id === itemId);
    if (milestone) {
      almatsuratAudioService.playFull(selectedTime, milestone.start);
    }
  };

  // 10. Helper to render Arabic text with word-by-word underline & click-to-seek
  const renderUnderlinedArabic = (text: string, isCardActive: boolean, itemId: string) => {
    const tokens = text.split(/(\s+)/);
    const actualWordsCount = tokens.filter((t) => t.trim().length > 0).length;

    if (actualWordsCount === 0) {
      return text;
    }

    const currentActiveWordIdx = (isCardActive && audioState.isPlaying)
      ? getActiveWordIndex(text, activeSync.progressInItem)
      : -1;

    let wordCounter = 0;
    return tokens.map((token, index) => {
      if (token.trim().length === 0) {
        return <React.Fragment key={index}>{token}</React.Fragment>;
      }
      const wordIdx = wordCounter;
      const isWordActive = wordCounter === currentActiveWordIdx;
      wordCounter++;

      return (
        <span
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            handleSeekToWord(itemId, wordIdx, text);
          }}
          className={`transition-all duration-200 inline-block cursor-pointer hover:bg-amber-100 rounded px-1 ${
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
          title="Klik untuk mendengarkan dari kata ini"
        >
          {token}
        </span>
      );
    });
  };

  // 11. Helper to render Latin transliteration with word-by-word underline & click-to-seek
  const renderUnderlinedLatin = (text: string, isCardActive: boolean, itemId: string) => {
    const tokens = text.split(/(\s+)/);
    const actualWordsCount = tokens.filter((t) => t.trim().length > 0).length;

    if (actualWordsCount === 0) {
      return text;
    }

    const currentActiveWordIdx = (isCardActive && audioState.isPlaying)
      ? getActiveWordIndex(text, activeSync.progressInItem)
      : -1;

    let wordCounter = 0;
    return tokens.map((token, index) => {
      if (token.trim().length === 0) {
        return <React.Fragment key={index}>{token}</React.Fragment>;
      }
      const wordIdx = wordCounter;
      const isWordActive = wordCounter === currentActiveWordIdx;
      wordCounter++;

      return (
        <span
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            handleSeekToWord(itemId, wordIdx, text);
          }}
          className={`transition-all duration-200 inline-block cursor-pointer hover:bg-amber-200/50 rounded px-1 ${
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
          title="Klik untuk mendengarkan dari kata ini"
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

                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Per-Item Audio Play Button (Precise Segment Talaqqi) */}
                  <button
                    onClick={() => handlePlayItemAudio(item.id)}
                    className={`px-2.5 py-1 rounded-lg border border-black text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
                      isPlayingThisItem
                        ? 'bg-[#10B981] text-black shadow-[1px_1px_0px_0px_#000]'
                        : 'bg-[#FEF3C7] hover:bg-[#FDE68A] text-black shadow-[1px_1px_0px_0px_#000]'
                    }`}
                    title={isPlayingThisItem ? 'Jeda Audio' : 'Dengarkan Pelafalan Doa Ini Saja'}
                  >
                    {isPlayingThisItem ? (
                      <>
                        <Pause className="w-3 h-3 fill-black" />
                        <span>Jeda</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 text-black" />
                        <span>Suara</span>
                      </>
                    )}
                  </button>

                  {/* Play Continuous Recitation from this Item */}
                  <button
                    onClick={() => handlePlayFromHere(item.id)}
                    className="px-2 py-1 rounded-lg border border-black text-xs font-black flex items-center gap-1 bg-white hover:bg-emerald-50 text-gray-800 shadow-[1px_1px_0px_0px_#000] cursor-pointer"
                    title="Putar lantunan menerus mulai dari doa ini"
                  >
                    <Play className="w-3 h-3 fill-black translate-x-0.5" />
                    <span className="hidden sm:inline">Mulai Sini</span>
                  </button>

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
                  {renderUnderlinedArabic(arabicText, isCardActive, item.id)}
                </div>

                {/* Transliteration with Synchronized Underline */}
                {showTransliteration && (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-300/80 text-xs sm:text-sm font-medium text-amber-950 leading-relaxed italic">
                    <span className="font-bold not-italic block text-[10px] text-amber-800 uppercase tracking-wider mb-0.5">
                      Transliterasi Latin:
                    </span>
                    {renderUnderlinedLatin(transliterationText, isCardActive, item.id)}
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

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Shuffle, 
  HeartHandshake,
  ShieldAlert,
  Flame,
  Award,
  Target,
  Search,
  BookOpen,
  Settings2,
  Play,
  Pause,
  Zap,
  Edit3,
  Keyboard,
  Activity,
  Headphones,
  ChevronDown,
  Sliders,
  Check,
  Radio,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayat, EvaluationResult, UserProfile, SurahMeta } from '../../types';
import { 
  SURAH_LIST, 
  getSurahAyahs, 
  getSurahAyahsRange, 
  getRandomAyatFromAvailable 
} from '../../data/quranData';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { speechEngine, continuousTracker, ArabicDialect, normalizeArabic } from '../../services/speechEngine';
import { audioPlayer, RECITERS_LIST, Reciter } from '../../services/audioPlayerService';
import { audioRecorder } from '../../services/audioRecorderService';
import { recordWeakVerse, resolveWeakVerse, addXpAndCheckStreak } from '../../services/offlineStorage';
import { recordMurojaahLogToSupabase } from '../../services/supabaseClient';
import { 
  DailyQuranTarget, 
  getDailyTarget, 
  setCustomDailyTarget, 
  markAyahCompletedInTarget 
} from '../../services/dailyTargetService';
import { DailyTargetWidget } from '../common/DailyTargetWidget';
import { useLanguage } from '../../context/LanguageContext';

interface MurojaahStudioProps {
  userProfile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
}

type MurojaahMode = 'daily_target' | 'continuous_surah' | 'random';
type InputMode = 'voice' | 'text' | 'demo';

export const MurojaahStudio: React.FC<MurojaahStudioProps> = ({
  userProfile,
  onProfileUpdated
}) => {
  const { language } = useLanguage();

  // Mode Selection
  const [studyMode, setStudyMode] = useState<MurojaahMode>('continuous_surah');
  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [dailyTarget, setDailyTarget] = useState<DailyQuranTarget>(getDailyTarget());

  // Surah & Range Selection
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(67); // Default QS. Al-Mulk
  const [rangePreset, setRangePreset] = useState<'all' | '1-5' | '1-10' | '1-20' | 'custom'>('1-10');
  const [startAyah, setStartAyah] = useState<number>(1);
  const [endAyah, setEndAyah] = useState<number>(10);

  // Multi-Ayah Passage State
  const [passageAyats, setPassageAyats] = useState<Ayat[]>([]);
  const [activeAyahIndex, setActiveAyahIndex] = useState<number>(0);
  const [matchedWordsState, setMatchedWordsState] = useState<Record<number, number[]>>({});
  const [completedAyahsSet, setCompletedAyahsSet] = useState<Set<number>>(new Set());

  // Sheikh Companion State
  const [activeReciter, setActiveReciter] = useState<Reciter>(audioPlayer.getActiveReciter());
  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState(false);

  // Recording & Live Evaluation State (Default: ar-SA Authentic Arabic Dictation)
  const [isRecording, setIsRecording] = useState(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [speechLanguage, setSpeechLanguage] = useState<ArabicDialect>('ar-SA');
  const [micSensitivity, setMicSensitivity] = useState<'normal' | 'high' | 'ultra'>('ultra');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [sheikhTeguranMessage, setSheikhTeguranMessage] = useState<string | null>(null);
  const [isSheikhSpeaking, setIsSheikhSpeaking] = useState(false);
  const [errorWordState, setErrorWordState] = useState<{
    ayahIdx: number;
    wordIdx: number;
    reason: string;
    targetWord: string;
    spokenWord: string;
  } | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSurahPickerOpen, setIsSurahPickerOpen] = useState(false);

  // Active Surah Meta
  const currentSurahMeta = SURAH_LIST.find((s) => s.number === selectedSurahNumber) || SURAH_LIST[66];

  // Auto-scroll ref for active verse
  const activeAyahRef = useRef<HTMLDivElement | null>(null);

  // Load Passage Ayahs when Surah or Range changes
  useEffect(() => {
    let isMounted = true;
    let sAyah = startAyah;
    let eAyah = endAyah;

    if (rangePreset === 'all') {
      sAyah = 1;
      eAyah = currentSurahMeta.ayahCount;
    } else if (rangePreset === '1-5') {
      sAyah = 1;
      eAyah = Math.min(5, currentSurahMeta.ayahCount);
    } else if (rangePreset === '1-10') {
      sAyah = 1;
      eAyah = Math.min(10, currentSurahMeta.ayahCount);
    } else if (rangePreset === '1-20') {
      sAyah = 1;
      eAyah = Math.min(20, currentSurahMeta.ayahCount);
    }

    setStartAyah(sAyah);
    setEndAyah(eAyah);

    getSurahAyahsRange(selectedSurahNumber, sAyah, eAyah).then((data) => {
      if (isMounted) {
        setPassageAyats(data);
        resetSessionState();
      }
    });

    return () => {
      isMounted = false;
      continuousTracker.stop();
      speechEngine.stopListening();
      audioRecorder.stopRecording();
      audioPlayer.stop();
    };
  }, [selectedSurahNumber, rangePreset, startAyah, endAyah]);

  // Scroll active verse into view
  useEffect(() => {
    if (activeAyahRef.current) {
      activeAyahRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeAyahIndex]);

  const resetSessionState = () => {
    continuousTracker.stop();
    speechEngine.stopListening();
    audioRecorder.stopRecording();
    audioPlayer.stop();
    setIsRecording(false);
    setMicVolume(0);
    setActiveAyahIndex(0);
    setMatchedWordsState({});
    setCompletedAyahsSet(new Set());
    setLiveTranscript('');
    setSheikhTeguranMessage(null);
    setIsSheikhSpeaking(false);
    setErrorWordState(null);
    setSessionCompleted(false);
    setFinalScore(null);
  };

  // Re-start listening after error / retry
  const handleRetryCurrentWord = () => {
    audioPlayer.stop();
    setIsSheikhSpeaking(false);
    setErrorWordState(null);
    setSheikhTeguranMessage(null);
    setLiveTranscript('');
    speechEngine.clearTranscript();
    continuousTracker.resumeAfterCorrection();

    speechEngine.setLanguage(speechLanguage);
    speechEngine.setSensitivity(micSensitivity);
    const started = speechEngine.startListening({
      language: speechLanguage,
      sensitivity: micSensitivity,
      onInterimResult: (text, alts) => {
        setLiveTranscript(text);
        setMicVolume(Math.min(95, 45 + Math.round(Math.random() * 40)));
        continuousTracker.processStream(text, alts, false);
      },
      onFinalResult: (text, alts) => {
        setLiveTranscript(text);
        setMicVolume(Math.min(95, 55 + Math.round(Math.random() * 35)));
        continuousTracker.processStream(text, alts, true);
      },
      onError: (err) => {
        console.warn('Mic status warning:', err);
        if (typeof err === 'string') {
          setSheikhTeguranMessage(err);
        }
      }
    });

    if (started) {
      setIsRecording(true);
      setMicVolume(25);
    }
  };

  // Start Real-Time Continuous Muroja'ah Session
  const handleStartContinuousMurojaah = async () => {
    if (passageAyats.length === 0) return;

    resetSessionState();

    // 1. Initialize Continuous Tracker with Passage Ayats & Sensitivity Boost
    continuousTracker.initialize(passageAyats, {
      onWordMatched: (ayahIdx, wordIdx) => {
        setErrorWordState((curr) => {
          if (curr && curr.ayahIdx === ayahIdx && curr.wordIdx === wordIdx) {
            return null;
          }
          return curr;
        });
        setSheikhTeguranMessage(null);

        requestAnimationFrame(() => {
          setMatchedWordsState((prev) => {
            const list = prev[ayahIdx] || [];
            if (!list.includes(wordIdx)) {
              return { ...prev, [ayahIdx]: [...list, wordIdx] };
            }
            return prev;
          });
        });
      },
      onAyahCompleted: (ayahIdx, ayat) => {
        setCompletedAyahsSet((prev) => new Set(prev).add(ayahIdx));
        setActiveAyahIndex(ayahIdx + 1);
        setLiveTranscript('');
        setErrorWordState(null);
        speechEngine.clearTranscript();
        audioPlayer.playSuccessChime();

        // Track progress in Daily Target if applicable
        const updatedTarget = markAyahCompletedInTarget(
          ayat.surahNumber,
          ayat.numberInSurah,
          (profile) => onProfileUpdated(profile)
        );
        setDailyTarget(updatedTarget);
      },
      onErrorDetected: async (ayahIdx, wordIdx, reason, targetWord, spokenWord) => {
        const targetAyat = passageAyats[ayahIdx];
        if (!targetAyat) return;

        // 🚨 1. Highlight word in RED & set error state
        setErrorWordState({
          ayahIdx,
          wordIdx,
          reason,
          targetWord: targetWord || '',
          spokenWord: spokenWord || ''
        });
        setSheikhTeguranMessage(`🚨 Teguran Syekh: ${reason}`);

        // Soft alarm warning chime without forcefully disconnecting microphone
        audioPlayer.playAlarmTeguranSound();

        // Record weak verse for spaced repetition
        recordWeakVerse({
          surahNumber: targetAyat.surahNumber,
          ayahNumber: targetAyat.numberInSurah,
          surahName: targetAyat.surahName,
          arabicText: targetAyat.arabicText,
          translation: targetAyat.translation,
          errorCount: 1,
          resolved: false
        });
      },
      onPassageCompleted: (score) => {
        setIsRecording(false);
        setSessionCompleted(true);
        setErrorWordState(null);
        setFinalScore(score);
        audioPlayer.playSuccessChime();
        confetti({ particleCount: 120, spread: 80 });

        const xpAward = 150 + passageAyats.length * 20;
        const updatedProfile = addXpAndCheckStreak(xpAward);
        onProfileUpdated(updatedProfile);

        // Log to Supabase
        recordMurojaahLogToSupabase(
          userProfile.id,
          selectedSurahNumber,
          passageAyats[0]?.numberInSurah || 1,
          currentSurahMeta.latinName,
          'realtime',
          score,
          true,
          'Muroja\'ah Beruntun Multi-Ayat Berhasil!'
        );
      }
    }, micSensitivity);

    // 2. Start Speech Recognition with 100% Dedicated Microphone Access
    speechEngine.setLanguage(speechLanguage);
    speechEngine.setSensitivity(micSensitivity);
    const started = speechEngine.startListening({
      language: speechLanguage,
      sensitivity: micSensitivity,
      onInterimResult: (text, alts) => {
        setLiveTranscript(text);
        setMicVolume(Math.min(95, 45 + Math.round(Math.random() * 40)));
        continuousTracker.processStream(text, alts, false);
      },
      onFinalResult: (text, alts) => {
        setLiveTranscript(text);
        setMicVolume(Math.min(95, 55 + Math.round(Math.random() * 35)));
        continuousTracker.processStream(text, alts, true);
      },
      onError: (err) => {
        console.warn('Mic status warning:', err);
        if (typeof err === 'string') {
          setSheikhTeguranMessage(err);
        }
      }
    });

    if (started) {
      setIsRecording(true);
      setMicVolume(25);
    } else {
      setSheikhTeguranMessage('Fitur Dikte Suara membutuhkan izin mikrofon atau gunakan browser Google Chrome / Edge / Safari.');
    }
  };

  // Stop Muroja'ah Session manually
  const handleStopSession = () => {
    continuousTracker.stop();
    speechEngine.stopListening();
    audioPlayer.stop();
    setIsRecording(false);
    setMicVolume(0);
  };
  // Filtered Surahs for Selector Modal
  const filteredSurahs = SURAH_LIST.filter(
    (s) =>
      s.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString().includes(searchQuery) ||
      s.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.includes(searchQuery)
  );

  return (
    <div className="space-y-4 pb-28 max-w-4xl mx-auto">
      {/* 🎯 1. DAILY TARGET WIDGET (TARGET HARI INI) */}
      <DailyTargetWidget
        onStartTarget={(target) => {
          setSelectedSurahNumber(target.surahNumber);
          setStartAyah(target.ayahStart);
          setEndAyah(target.ayahEnd);
          setRangePreset('custom');
        }}
      />

      {/* 2. SURAH, RANGE & SHEIKH COMPANION HEADER */}
      <div className="bg-[#FFFDF7] border-3 border-black rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#111827] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#0B4627] text-white flex items-center justify-center font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              {currentSurahMeta.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-black">{currentSurahMeta.latinName}</h2>
                <span className="font-arabic text-sm text-[#0B4627] font-bold">({currentSurahMeta.name})</span>
              </div>
              <p className="text-xs text-gray-600 font-semibold">
                {currentSurahMeta.meaning} • {currentSurahMeta.ayahCount} Ayat ({currentSurahMeta.revelationPlace === 'Makkah' ? 'Makkiyyah' : 'Madaniyyah'})
              </p>
            </div>
          </div>

          {/* Action Header Buttons: Ganti Surat & Pilih Syekh */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSurahPickerOpen(true)}
              className="px-3.5 py-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-black text-xs rounded-xl border-2 border-black neo-button flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ganti Surat (114)</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
                className="px-3.5 py-2 bg-[#E0E7FF] hover:bg-[#C7D2FE] text-indigo-950 font-black text-xs rounded-xl border-2 border-black neo-button flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-700" />
                <span className="truncate max-w-[110px]">{activeReciter.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* Reciter Dropdown */}
              {isReciterMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_#000] p-2 z-50 space-y-1">
                  <p className="text-[10px] font-black uppercase text-gray-500 px-2 py-1">Syekh Pembimbing Muroja'ah:</p>
                  {RECITERS_LIST.map((r: Reciter) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        audioPlayer.setActiveReciter(r.id);
                        setActiveReciter(r);
                        setIsReciterMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-all ${
                        activeReciter.id === r.id ? 'bg-[#0B4627] text-white' : 'hover:bg-gray-100 text-black'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{r.name}</p>
                        <p className="text-[10px] opacity-75">{r.arabicName} • {r.style}</p>
                      </div>
                      {activeReciter.id === r.id && <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Range Selector & Preset Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-gray-700">Rentang Ayat:</span>
            {(['1-5', '1-10', '1-20', 'all', 'custom'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setRangePreset(preset);
                  if (preset === '1-5') {
                    setStartAyah(1);
                    setEndAyah(Math.min(5, currentSurahMeta.ayahCount));
                  } else if (preset === '1-10') {
                    setStartAyah(1);
                    setEndAyah(Math.min(10, currentSurahMeta.ayahCount));
                  } else if (preset === '1-20') {
                    setStartAyah(1);
                    setEndAyah(Math.min(20, currentSurahMeta.ayahCount));
                  } else if (preset === 'all') {
                    setStartAyah(1);
                    setEndAyah(currentSurahMeta.ayahCount);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black border-2 border-black neo-button cursor-pointer ${
                  rangePreset === preset
                    ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {preset === 'all' ? 'Semua Ayat' : preset === 'custom' ? 'Kustom' : `Ayat ${preset}`}
              </button>
            ))}
          </div>

          {/* Custom Input Spinners */}
          {rangePreset === 'custom' && (
            <div className="flex items-center gap-1.5 bg-gray-50 border-2 border-black rounded-lg px-2 py-1 text-xs font-bold">
              <span>Dari:</span>
              <input
                type="number"
                min={1}
                max={currentSurahMeta.ayahCount}
                value={startAyah}
                onChange={(e) => setStartAyah(Math.max(1, Math.min(Number(e.target.value), endAyah)))}
                className="w-12 text-center bg-white border border-black rounded px-1 py-0.5 font-bold"
              />
              <span>Sampai:</span>
              <input
                type="number"
                min={startAyah}
                max={currentSurahMeta.ayahCount}
                value={endAyah}
                onChange={(e) => setEndAyah(Math.min(currentSurahMeta.ayahCount, Math.max(Number(e.target.value), startAyah)))}
                className="w-12 text-center bg-white border border-black rounded px-1 py-0.5 font-bold"
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. MULTI-AYAH PASSAGE CONTAINER (INTERACTIVE ARABIC WORDS) */}
      <div className="space-y-3">
        {passageAyats.map((ayat, aIdx) => {
          const isActive = aIdx === activeAyahIndex && isRecording;
          const isDone = completedAyahsSet.has(aIdx);
          const matchedWords = matchedWordsState[aIdx] || [];
          const words = (ayat.arabicText || '').split(/\s+/).filter((w) => normalizeArabic(w).length > 0);

          return (
            <div
              key={ayat.numberInSurah}
              ref={isActive ? activeAyahRef : undefined}
              className={`p-4 rounded-2xl border-3 border-black transition-all space-y-3 ${
                isActive
                  ? 'bg-[#FEFCE8] shadow-[6px_6px_0px_0px_#CA8A04] ring-2 ring-amber-400 scale-[1.01]'
                  : isDone
                  ? 'bg-[#ECFDF5] shadow-[3px_3px_0px_0px_#059669] opacity-90'
                  : 'bg-white shadow-[3px_3px_0px_0px_#111827]'
              }`}
            >
              {/* Ayah Header Badge */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border-2 border-black ${
                      isDone
                        ? 'bg-[#10B981] text-white'
                        : isActive
                        ? 'bg-[#F59E0B] text-black animate-pulse'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {ayat.numberInSurah}
                  </span>
                  <span className="text-xs font-black text-gray-600">Ayat ke-{ayat.numberInSurah}</span>
                </div>

                {isDone ? (
                  <span className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Lulus Mutqin
                  </span>
                ) : isActive ? (
                  <span className="flex items-center gap-1 text-[11px] font-black text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-full border border-amber-500 animate-bounce">
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping"></span> Sedang Dibaca...
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-gray-400">Menunggu antrean</span>
                )}
              </div>

              {/* Arabic Text with Word-by-Word Active Highlighting (Authentic RTL Quranic Flow) */}
              <div className="text-right py-2 leading-loose" dir="rtl">
                <div className="flex flex-wrap gap-2 justify-start items-center" dir="rtl">
                  {words.map((w, wIdx) => {
                    const isWordDone = matchedWords.includes(wIdx);
                    const isWordError = errorWordState?.ayahIdx === aIdx && errorWordState?.wordIdx === wIdx;
                    const isCurrentWordTarget = (isActive || isWordError) && matchedWords.length === wIdx;

                    return (
                      <span
                        key={wIdx}
                        onClick={() => {
                          if (isWordError) {
                            handleRetryCurrentWord();
                          } else if (isActive && isCurrentWordTarget) {
                            continuousTracker.advanceCurrentWord(true);
                          }
                        }}
                        title={
                          isWordError
                            ? `Salah lafal: ${errorWordState.reason}. Klik untuk coba ulang!`
                            : isCurrentWordTarget
                            ? 'Kata yang wajib dibaca sekarang'
                            : undefined
                        }
                        className={`font-arabic text-2xl sm:text-3xl px-2.5 py-1 rounded-xl transition-all inline-block select-none ${
                          isWordDone
                            ? 'bg-[#10B981] text-white shadow-xs font-bold scale-105'
                            : isWordError
                            ? 'bg-[#EF4444] text-white border-3 border-black shadow-[4px_4px_0px_0px_#000] scale-115 font-black ring-4 ring-red-300 animate-pulse cursor-pointer'
                            : isCurrentWordTarget
                            ? 'bg-[#FBBF24] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] scale-110 font-bold animate-pulse cursor-pointer hover:bg-amber-300 ring-4 ring-amber-300'
                            : 'text-gray-800'
                        }`}
                      >
                        {w}
                      </span>
                    );
                  })}
                  <span className="text-sm font-arabic font-bold text-[#0B4627] px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-300">
                    ۝{ayat.numberInSurah}
                  </span>
                </div>
              </div>

              {/* 🚨 AUTO-TEGUR SYEKH ALERT CARD (When Mistake is Detected) */}
              {errorWordState && errorWordState.ayahIdx === aIdx && (
                <div className="my-3 p-4 bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-white rounded-2xl border-3 border-red-500 shadow-[5px_5px_0px_0px_#000] space-y-3 animate-shake">
                  <div className="flex items-center justify-between border-b border-red-700/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-400 animate-ping"></span>
                      <span className="font-black text-sm text-red-200 uppercase tracking-wide flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        🚨 TEGURAN OTOMATIS SYEKH (BACAAN SALAH)
                      </span>
                    </div>
                    {isSheikhSpeaking && (
                      <span className="px-2.5 py-1 bg-red-600 text-white font-black text-xs rounded-full border border-white animate-pulse flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5" /> Syekh Membimbing...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-black/40 rounded-xl border border-red-700">
                      <span className="text-red-300 font-bold block mb-1">🎯 Lafadz Target yang Benar:</span>
                      <span className="font-arabic text-xl font-black text-emerald-300" dir="rtl">
                        « {errorWordState.targetWord} »
                      </span>
                    </div>
                    <div className="p-2.5 bg-black/40 rounded-xl border border-red-700">
                      <span className="text-red-300 font-bold block mb-1">❌ Terdengar Keliru / Tertukar:</span>
                      <span className="font-arabic text-xl font-bold text-red-400 line-through" dir="rtl">
                        « {errorWordState.spokenWord || '(Belum terdengar)'} »
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-red-900/60 rounded-xl border border-red-600 text-red-100 font-medium text-xs">
                    <span className="font-bold text-yellow-300">💡 Analisis Tajwid/Makhraj: </span>
                    {errorWordState.reason}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={handleRetryCurrentWord}
                      className="flex-1 min-w-[200px] flex items-center justify-center gap-2 py-2 px-4 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 transition-all"
                    >
                      <Mic className="w-4 h-4 text-black animate-pulse" />
                      🎙️ Wajib Baca Ulang Kata Ini Sekarang
                    </button>
                    <button
                      onClick={() => {
                        setIsSheikhSpeaking(true);
                        audioPlayer.playSheikhIntervention(
                          ayat.surahNumber,
                          ayat.numberInSurah,
                          activeReciter.id,
                          () => setIsSheikhSpeaking(false)
                        );
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl border border-white/40 transition-all"
                    >
                      <Volume2 className="w-4 h-4" />
                      Putar Ulang Audio Syekh
                    </button>
                  </div>
                </div>
              )}

              {/* 🎙️ SUPER PROMINENT LIVE DICTATION HUD INSIDE ACTIVE AYAH CARD */}
              {isActive && isRecording && !errorWordState && (
                <div className="my-3 p-3.5 bg-gradient-to-r from-[#022C22] via-[#064E3B] to-[#022C22] text-white rounded-2xl border-3 border-[#F59E0B] shadow-[4px_4px_0px_0px_#000] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black border-b border-emerald-700/60 pb-1.5">
                    <span className="flex items-center gap-2 text-amber-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                      🎙️ HASIL DIKTE SUARA (LIVE TRANSCRIPT ARAB):
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] bg-black/40 px-2 py-0.5 rounded-md border border-emerald-500">
                      <Activity className="w-3 h-3 text-[#F59E0B] animate-pulse" />
                      <span>VU: {micVolume} dB</span>
                    </div>
                  </div>

                  {/* Big Arabic Calligraphy Spoken Text Display */}
                  <div className="text-right py-1" dir="rtl">
                    {liveTranscript ? (
                      <div className="space-y-1">
                        <p className="font-arabic text-2xl sm:text-3xl font-bold text-amber-300 leading-loose tracking-wide break-words drop-shadow-md">
                          « {liveTranscript} »
                        </p>
                        <p className="text-[11px] text-emerald-200 font-sans font-bold text-left" dir="ltr">
                          ✓ Mesin sedang mencocokkan kata demi kata secara real-time
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-2 space-y-1" dir="ltr">
                        <p className="font-arabic text-lg text-emerald-200 font-bold">
                          بانتظار صوتك الكريم...
                        </p>
                        <p className="text-xs text-emerald-300/80 italic font-sans">
                          🎙️ Silakan mulai melantunkan ayat ini ke mikrofon...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transliteration & Indonesian Translation */}
              <p className="text-xs text-emerald-900 font-bold border-t border-gray-200 pt-2 font-mono">
                {ayat.transliteration}
              </p>
              <p className="text-xs text-gray-700 italic border-t border-gray-200 pt-1.5 mt-1 font-medium">
                "{ayat.translation}"
              </p>
            </div>
          );
        })}
      </div>

      {/* 4. REAL-TIME LIVE CONTROL BAR & HIGH-VISIBILITY MOBILE SUBTITLE HUD */}
      <div className="sticky bottom-3 z-30 bg-[#FFFDF7] border-3 border-black rounded-2xl p-4 shadow-[6px_6px_0px_0px_#111827] space-y-3">
        {/* Live Sheikh Correction Alert */}
        {sheikhTeguranMessage && (
          <div className="p-3 bg-[#FEE2E2] border-2 border-red-500 rounded-xl flex items-center justify-between gap-2 animate-bounce text-xs font-bold text-red-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{sheikhTeguranMessage}</span>
            </div>
            {isSheikhSpeaking && (
              <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] uppercase font-mono animate-pulse">
                🔊 Syekh Bersuara...
              </span>
            )}
          </div>
        )}

        {/* 📱 HIGH-VISIBILITY LIVE DICTATION SUBTITLE HUD (Mobile Optimized) */}
        {isRecording && (
          <div className="space-y-2 bg-[#064E3B] text-white p-3.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            {/* Header: VU Sound Level Meter & Connection Badge */}
            <div className="flex items-center justify-between text-xs font-black border-b border-emerald-700 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-emerald-200 font-bold uppercase tracking-wider text-[11px]">
                  🎙️ الاستماع المباشر للتلاوة (Dikte Bahasa Arab)
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] bg-[#0B4627] px-2.5 py-1 rounded-lg border border-emerald-600">
                <Activity className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse" />
                <span>VU: <b>{micVolume} dB</b></span>
                <span className={`w-2 h-2 rounded-full ml-1 ${micVolume > 15 ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              </div>
            </div>

            {/* Live Dictation Display (Large, Multi-line, Authentic Arabic Font) */}
            <div className="bg-[#022C22] p-3.5 rounded-xl border-2 border-emerald-600 min-h-[64px] flex flex-col justify-center text-right" dir="rtl">
              <p className="text-[10px] font-black uppercase text-emerald-400 tracking-wider font-sans">
                النص القرآني المستمع (Lafal Bahasa Arab Terdeteksi):
              </p>
              <p className="text-base sm:text-xl font-bold text-amber-300 font-arabic leading-loose break-words mt-1">
                {liveTranscript ? (
                  `« ${liveTranscript} »`
                ) : (
                  <span className="text-emerald-300 text-xs italic font-sans font-normal" dir="ltr">
                    ⏳ بانتظار تلاوة الآية الكريمة... (Silakan melantunkan ayat dalam bahasa Arab)
                  </span>
                )}
              </p>
            </div>

            {/* Sensitivitas & Touch Assist Helper */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-emerald-300 font-bold">Sensitivitas Mic:</span>
                {(['normal', 'high', 'ultra'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setMicSensitivity(lvl);
                      speechEngine.setSensitivity(lvl);
                      continuousTracker.setSensitivity(lvl);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-black border transition-all cursor-pointer ${
                      micSensitivity === lvl
                        ? 'bg-[#F59E0B] text-black border-black shadow-xs'
                        : 'bg-emerald-900 text-emerald-300 border-emerald-700 hover:bg-emerald-800'
                    }`}
                  >
                    {lvl === 'normal' ? '🟢 Normal' : lvl === 'high' ? '🟡 Sensitif HP' : '🔥 Super Boost (Ramai)'}
                  </button>
                ))}
              </div>

              <span className="text-amber-200 text-[10px] font-semibold">
                💡 Tap kata kuning atau tombol <b>⚡ Bantu Kata</b> bila dikte macet.
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {!isRecording ? (
              <button
                onClick={handleStartContinuousMurojaah}
                className="px-5 py-3 bg-[#0B4627] hover:bg-[#064E3B] text-white font-black text-sm rounded-xl border-2 border-black neo-button flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000]"
              >
                <Mic className="w-4 h-4 text-[#F59E0B]" />
                <span>Mulai Muroja'ah Beruntun</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleStopSession}
                  className="px-5 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white font-black text-sm rounded-xl border-2 border-black neo-button flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000]"
                >
                  <MicOff className="w-4 h-4" />
                  <span>Selesai Sesi</span>
                </button>

                {/* Instant Skip / Assist Active Word Button */}
                <button
                  onClick={() => continuousTracker.advanceCurrentWord(true)}
                  className="px-4 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-black font-black text-xs sm:text-sm rounded-xl border-2 border-black neo-button flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_0px_#000] animate-pulse"
                  title="Lewati kata aktif jika pelafalan benar tapi dikte mic gagal mengenali"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>⚡ Bantu / Lewati Kata Ini</span>
                </button>
              </>
            )}

            <button
              onClick={resetSessionState}
              className="p-3 bg-white hover:bg-gray-100 text-black border-2 border-black rounded-xl neo-button cursor-pointer"
              title="Ulangi dari Awal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speech Engine Dialect Selector (Full Arabic Dialects) */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-black text-xs font-bold flex-wrap">
            <span className="text-[10px] font-black text-gray-600 px-1">Dialek Arab:</span>
            {([
              { code: 'ar-SA', label: '🇸🇦 السعودية' },
              { code: 'ar-EG', label: '🇪🇬 مصر' },
              { code: 'ar-AE', label: '🇦🇪 الإمارات' },
              { code: 'ar-KW', label: '🇰🇼 الكويت' },
              { code: 'id-ID', label: '🇮🇩 Latin/ID' }
            ] as const).map(({ code, label }) => (
              <button
                key={code}
                onClick={() => {
                  setSpeechLanguage(code as ArabicDialect);
                  speechEngine.setLanguage(code as ArabicDialect);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  speechLanguage === code
                    ? 'bg-[#0B4627] text-white shadow-xs'
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Session Completed Banner */}
        {sessionCompleted && (
          <div className="p-4 bg-[#D1FAE5] border-2 border-[#0B4627] rounded-xl text-center space-y-2 animate-in zoom-in-95">
            <div className="flex items-center justify-center gap-2 text-[#0B4627]">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h4 className="text-base font-black">
                🎉 Maa Syaa Allah! Sesi Muroja'ah Beruntun Tuntas!
              </h4>
            </div>
            <p className="text-xs font-bold text-emerald-900">
              Skor Kelancaran: <b className="text-base font-black text-[#0B4627]">{finalScore}% (Mutqin)</b> • +{150 + passageAyats.length * 20} XP Poin Diperoleh!
            </p>
          </div>
        )}
      </div>

      {/* 5. SURAH SELECTOR MODAL (114 SURAT) */}
      {isSurahPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl max-h-[80vh] flex flex-col bg-[#FFFDF7] border-3 border-black rounded-3xl p-5 shadow-[8px_8px_0px_0px_#111827] animate-in zoom-in-95 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-base font-black text-black flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0B4627]" />
                <span>Pilih Surat untuk Muroja'ah (1–114 Surat)</span>
              </h3>
              <button
                onClick={() => setIsSurahPickerOpen(false)}
                className="p-1 bg-[#FEE2E2] hover:bg-[#FCA5A5] border border-black rounded-lg font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama surat atau nomor..."
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
              />
            </div>

            {/* Surah List Scrollable */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-1.5">
              {filteredSurahs.map((s) => (
                <button
                  key={s.number}
                  onClick={() => {
                    setSelectedSurahNumber(s.number);
                    setRangePreset('1-10');
                    setIsSurahPickerOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl border-2 border-black text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedSurahNumber === s.number
                      ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                      : 'bg-white text-gray-900 hover:bg-[#FEF3C7]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-gray-100 border border-black text-xs font-bold text-black flex items-center justify-center">
                      {s.number}
                    </span>
                    <div>
                      <p className="font-extrabold text-xs">{s.latinName}</p>
                      <p className={`text-[10px] ${selectedSurahNumber === s.number ? 'text-emerald-200' : 'text-gray-500'}`}>
                        {s.meaning} • {s.ayahCount} Ayat
                      </p>
                    </div>
                  </div>
                  <span className="font-quran text-lg font-bold" dir="rtl">
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
import { speechEngine, continuousTracker } from '../../services/speechEngine';
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

  // Recording & Live Evaluation State
  const [isRecording, setIsRecording] = useState(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [speechLanguage, setSpeechLanguage] = useState<'ar-SA' | 'ar-KW' | 'id-ID'>('ar-SA');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [sheikhTeguranMessage, setSheikhTeguranMessage] = useState<string | null>(null);
  const [isSheikhSpeaking, setIsSheikhSpeaking] = useState(false);
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
    setSessionCompleted(false);
    setFinalScore(null);
  };

  // Start Real-Time Continuous Muroja'ah Session
  const handleStartContinuousMurojaah = async () => {
    if (passageAyats.length === 0) return;

    resetSessionState();

    // 1. Initialize Continuous Tracker with Passage Ayats
    continuousTracker.initialize(passageAyats, {
      onWordMatched: (ayahIdx, wordIdx) => {
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
      onErrorDetected: async (ayahIdx, wordIdx, reason) => {
        const targetAyat = passageAyats[ayahIdx];
        if (!targetAyat) return;

        // Pause tracker so Sheikh recitation audio is never mistaken for user speech
        continuousTracker.pause();
        setSheikhTeguranMessage(`Teguran Syekh: ${reason}`);
        setIsSheikhSpeaking(true);

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

        // Sheikh Voice Correction Intervention
        await audioPlayer.playSheikhIntervention(
          targetAyat.surahNumber,
          targetAyat.numberInSurah,
          activeReciter.id,
          () => {
            setIsSheikhSpeaking(false);
            setLiveTranscript('');
            speechEngine.clearTranscript();
            continuousTracker.resumeAfterCorrection();
          }
        );
      },
      onPassageCompleted: (score) => {
        setIsRecording(false);
        setSessionCompleted(true);
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
    });

    // 2. Start Live Microphone Recording & Decibel Meter
    await audioRecorder.startRecording((vol) => setMicVolume(vol));

    speechEngine.setLanguage(speechLanguage);
    const started = speechEngine.startListening({
      language: speechLanguage,
      onInterimResult: (text, alts) => {
        setLiveTranscript(text);
        continuousTracker.processStream(text, alts);
      },
      onFinalResult: (text, alts) => {
        setLiveTranscript(text);
        continuousTracker.processStream(text, alts);
      },
      onError: (err) => console.warn('Mic status:', err)
    });

    if (started) {
      setIsRecording(true);
    }
  };

  // Stop Muroja'ah Session manually
  const handleStopSession = () => {
    continuousTracker.stop();
    speechEngine.stopListening();
    audioRecorder.stopRecording();
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
    <div className="space-y-4 pb-24 max-w-4xl mx-auto">
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
      <NeobrutalCard variant="emerald" className="p-4 sm:p-5 relative shadow-[3px_3px_0px_0px_#111827] border-2 border-black space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Surah Title & Range Info */}
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 text-xs font-black bg-[#F59E0B] text-black rounded border border-black uppercase flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Studio Muroja'ah Beruntun 114 Surat
              </span>
              <span className="px-2 py-0.5 text-xs font-bold bg-white/20 text-white rounded border border-white/30 font-mono">
                {currentSurahMeta.revelationPlace === 'Makkah' ? 'Makkiyyah' : 'Madaniyyah'} • {currentSurahMeta.ayahCount} Ayat
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 font-display">
              <span>{currentSurahMeta.latinName}</span>
              <span className="font-quran text-amber-300 text-lg">({currentSurahMeta.name})</span>
            </h2>
            <p className="text-xs text-emerald-100 font-medium">
              Arti: "{currentSurahMeta.meaning}" • Menampilkan Ayat {startAyah} s/d {endAyah}
            </p>
          </div>

          {/* Quick Sheikh Reciter & Surah Switchers */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Reciter Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
                className="px-2.5 py-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 neo-button cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                title="Pilih Syekh Pendamping & Penegur Hafalan"
              >
                <Headphones className="w-3.5 h-3.5 text-[#0B4627]" />
                <span className="truncate max-w-[120px]">{activeReciter.name.split(' ')[1] || activeReciter.name}</span>
                <ChevronDown className="w-3 h-3 text-gray-700" />
              </button>

              {isReciterMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border-3 border-black rounded-2xl p-2 shadow-[6px_6px_0px_0px_#000] z-50 animate-in fade-in zoom-in-95 space-y-1">
                  <div className="p-1.5 border-b-2 border-black flex items-center justify-between text-black">
                    <span className="text-[11px] font-black text-[#0B4627]">
                      {language === 'ar' ? 'اختر الشيخ Penegur:' : 'Pilih Syekh Penegur Suara:'}
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
                        onClick={() => {
                          setActiveReciter(r);
                          audioPlayer.setActiveReciter(r.id);
                          setIsReciterMenuOpen(false);
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

            {/* Choose Surah Button */}
            <button
              onClick={() => setIsSurahPickerOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-[#FEF3C7] text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer neo-button shadow-[2px_2px_0px_0px_#000]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Ganti Surat (1–114)</span>
            </button>
          </div>
        </div>

        {/* Preset Range Selector Bar */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-white/20 flex-wrap text-xs">
          <span className="font-bold text-emerald-100 text-[11px]">Rentang Ayat:</span>
          {(['1-5', '1-10', '1-20', 'all'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setRangePreset(preset)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                rangePreset === preset
                  ? 'bg-[#F59E0B] text-black border-black font-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-black/30 text-white border-white/30 hover:bg-black/50'
              }`}
            >
              {preset === '1-5' ? '1 – 5 Ayat' : preset === '1-10' ? '1 – 10 Ayat' : preset === '1-20' ? '1 – 20 Ayat' : `Seluruh Surat (${currentSurahMeta.ayahCount} Ayat)`}
            </button>
          ))}
        </div>
      </NeobrutalCard>

      {/* 3. MULTI-AYAT RECITATION CANVAS (CONTINUOUS PASSAGE VIEW) */}
      <div className="space-y-3">
        {passageAyats.map((ayat, aIdx) => {
          const isActive = activeAyahIndex === aIdx && isRecording;
          const isCompleted = completedAyahsSet.has(aIdx);
          const words = (ayat.arabicText || '').split(/\s+/).filter(Boolean);
          const matchedIndices = matchedWordsState[aIdx] || [];

          return (
            <div
              key={ayat.numberInSurah}
              ref={isActive ? activeAyahRef : null}
              className={`rounded-2xl p-4 sm:p-5 border-2 border-black transition-all bg-[#FFFDF7] ${
                isActive
                  ? 'ring-3 ring-[#0B4627] shadow-[4px_4px_0px_0px_#0B4627] bg-[#F0FDF4]'
                  : isCompleted
                  ? 'opacity-85 bg-emerald-50/60 shadow-[2px_2px_0px_0px_#111827]'
                  : 'shadow-[2px_2px_0px_0px_#111827]'
              }`}
            >
              {/* Ayah Header Bar */}
              <div className="flex items-center justify-between border-b border-dashed border-gray-300 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center font-bold text-xs ${
                    isCompleted ? 'bg-[#10B981] text-white font-black' : isActive ? 'bg-[#F59E0B] text-black font-black' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {ayat.numberInSurah}
                  </span>
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    Ayat ke-{ayat.numberInSurah} {isCompleted ? <span className="text-emerald-700 font-black">✓ Lulus Mutqin</span> : isActive ? <span className="text-amber-700 font-black animate-pulse">● Sedang Dilantunkan</span> : null}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => audioPlayer.playAyat(ayat.surahNumber, ayat.numberInSurah, undefined, activeReciter.id)}
                    className="p-1.5 bg-white hover:bg-[#FEF3C7] text-[#0B4627] border border-black rounded-lg text-xs font-bold neo-button cursor-pointer flex items-center gap-1"
                    title="Dengarkan Suara Syekh"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Dengar Syekh</span>
                  </button>
                </div>
              </div>

              {/* Word-by-Word Arabic Text with Live Highlighting & Tap-to-Pass */}
              <div className="my-2 text-right" dir="rtl">
                <div className="flex flex-wrap gap-x-2 gap-y-3 items-center justify-start">
                  {words.map((word, wIdx) => {
                    const isMatched = matchedIndices.includes(wIdx) || isCompleted;
                    const isCurrentlyTargeted = isActive && matchedIndices.length === wIdx;

                    return (
                      <span
                        key={wIdx}
                        onClick={() => {
                          if (isActive && isCurrentlyTargeted) {
                            continuousTracker.advanceCurrentWord(true);
                          }
                        }}
                        title={isCurrentlyTargeted ? 'Klik jika lisan antum benar tapi mic salah mendikte!' : undefined}
                        className={`font-quran text-2xl sm:text-3xl leading-relaxed px-2.5 py-1 rounded-xl border-2 transition-all flex items-center gap-1 select-none ${
                          isMatched
                            ? 'bg-[#10B981] text-white border-black font-bold shadow-[2px_2px_0px_0px_#000] scale-100'
                            : isCurrentlyTargeted
                            ? 'bg-[#F59E0B] text-black border-black font-black shadow-[3px_3px_0px_0px_#000] scale-105 animate-pulse ring-2 ring-amber-400 cursor-pointer hover:bg-amber-400'
                            : 'text-emerald-950 bg-white/70 border-gray-300 opacity-80'
                        }`}
                      >
                        {word}
                        {isMatched && <span className="text-[10px] font-sans font-black text-amber-200">✓</span>}
                        {isCurrentlyTargeted && <span className="text-[9px] font-sans font-bold bg-black text-amber-300 px-1 rounded ml-1">Klik Bantu</span>}
                      </span>
                    );
                  })}
                  <span className="w-7 h-7 rounded-full border border-black bg-[#F59E0B] text-black font-quran text-xs flex items-center justify-center font-bold mr-1">
                    ۝{ayat.numberInSurah}
                  </span>
                </div>
              </div>

              {/* Transliteration & Meaning */}
              {ayat.transliteration && (
                <p className="text-xs font-semibold text-[#0B4627] mt-2 italic">
                  "{ayat.transliteration}"
                </p>
              )}
              <p className="text-xs text-gray-700 italic border-t border-gray-200 pt-1.5 mt-1 font-medium">
                "{ayat.translation}"
              </p>
            </div>
          );
        })}
      </div>

      {/* 4. REAL-TIME LIVE CONTROL BAR */}
      <div className="sticky bottom-4 z-30 bg-[#FFFDF7] border-3 border-black rounded-2xl p-4 shadow-[6px_6px_0px_0px_#111827] space-y-3">
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

        {/* Live Audio Transcript & Decibel Meter */}
        {isRecording && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between bg-[#F0FDF4] p-2.5 rounded-xl border border-emerald-300 text-xs">
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <p className="font-mono text-emerald-900 font-bold truncate">
                  Lafal terdeteksi: {liveTranscript || 'Mendengarkan lantunan ayat...'}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 font-mono text-[11px] font-bold text-emerald-800">
                <Activity className="w-3.5 h-3.5 text-[#0B4627]" />
                <span>VU: {micVolume} dB</span>
              </div>
            </div>

            {/* Smart Assist Info Badge */}
            <div className="flex items-center justify-between bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-300 text-[11px] text-amber-900 font-bold">
              <span>💡 Jika lisan antum sudah benar tapi dikte mic macet, klik langsung tombol <b>"⚡ Bantu Kata"</b> atau klik kata kuning di atas!</span>
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
                  <span>Selesai / Hentikan Sesi</span>
                </button>

                {/* Instant Skip / Assist Active Word Button */}
                <button
                  onClick={() => continuousTracker.advanceCurrentWord(true)}
                  className="px-3.5 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-black font-black text-xs rounded-xl border-2 border-black neo-button flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
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

          {/* Speech Engine Dialect Selector */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-black text-xs font-bold">
            <span className="text-[10px] font-black text-gray-600 px-1">Dialek Mic:</span>
            {(['ar-SA', 'ar-KW', 'id-ID'] as const).map((langCode) => (
              <button
                key={langCode}
                onClick={() => {
                  setSpeechLanguage(langCode);
                  speechEngine.setLanguage(langCode);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  speechLanguage === langCode
                    ? 'bg-[#0B4627] text-white shadow-xs'
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                {langCode === 'ar-SA' ? '🇸🇦 Saudi' : langCode === 'ar-KW' ? '🇰🇼 Kuwait' : '🇮🇩 Latin/ID'}
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

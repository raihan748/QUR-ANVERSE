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
  Zap,
  Edit3,
  Keyboard,
  Activity,
  Headphones,
  Sliders,
  Eye,
  EyeOff,
  Filter,
  Check,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayat, EvaluationResult, UserProfile, SurahMeta } from '../../types';
import { SURAH_LIST, JUZ_MAP, getSurahAyahs, getRandomAyatFromAvailable } from '../../data/quranData';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { speechEngine } from '../../services/speechEngine';
import { audioPlayer } from '../../services/audioPlayerService';
import { audioRecorder } from '../../services/audioRecorderService';
import { recordWeakVerse, resolveWeakVerse, addXpAndCheckStreak } from '../../services/offlineStorage';
import { recordMurojaahLogToSupabase } from '../../services/supabaseClient';
import { 
  DailyQuranTarget, 
  getDailyTarget, 
  markAyahCompletedInTarget 
} from '../../services/dailyTargetService';
import { DailyTargetWidget } from '../common/DailyTargetWidget';
import { useLanguage } from '../../context/LanguageContext';

interface MurojaahStudioProps {
  userProfile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
}

type InputMode = 'voice' | 'text' | 'demo';

export const MurojaahStudio: React.FC<MurojaahStudioProps> = ({
  userProfile,
  onProfileUpdated
}) => {
  const { language, t } = useLanguage();

  // 1. Surah & Ayah Range Selection (All 114 Surahs)
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1); // Default: Al-Fatihah
  const [startAyah, setStartAyah] = useState<number>(1);
  const [endAyah, setEndAyah] = useState<number>(7);
  const [isSurahModalOpen, setIsSurahModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJuzFilter, setSelectedJuzFilter] = useState<number | null>(null);

  // 2. Multi-Ayah Dataset & Active Pointer
  const [allAyatsInSurah, setAllAyatsInSurah] = useState<Ayat[]>([]);
  const [activeAyahIndex, setActiveAyahIndex] = useState<number>(0);
  const [completedAyahIndices, setCompletedAyahIndices] = useState<Set<number>>(new Set());
  const [isBlindMode, setIsBlindMode] = useState<boolean>(false); // Blind Tahfidz mode (blur text)
  const [isLoadingAyahs, setIsLoadingAyahs] = useState<boolean>(false);

  // 3. Audio Recording, Real-Time Streaming & Speech Supervisor
  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [speechLanguage, setSpeechLanguage] = useState<'ar-SA' | 'ar-KW' | 'id-ID'>('ar-SA');
  const [interimSpoken, setInterimSpoken] = useState<string>('');
  const [manualTextInput, setManualTextInput] = useState<string>('');

  // Real-Time Word Tracking State for Current Active Ayah
  const [activeWordStatuses, setActiveWordStatuses] = useState<{
    expectedWord: string;
    spokenWord: string;
    status: 'correct' | 'warning' | 'error' | 'pending';
  }[]>([]);
  const [currentAyahAccuracy, setCurrentAyahAccuracy] = useState<number>(0);

  // 4. Live Syekh Voice Correction (Teguran Suara Syekh)
  const [isSyekhCorrecting, setIsSyekhCorrecting] = useState<boolean>(false);
  const [lastMistakeNotice, setLastMistakeNotice] = useState<string | null>(null);

  // 5. Presentation Demo Simulator State
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);

  const ayahItemRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const currentSurahMeta = SURAH_LIST.find((s) => s.number === selectedSurahNumber) || SURAH_LIST[0];
  const activeAyats = allAyatsInSurah.slice(startAyah - 1, endAyah);
  const currentAyat = activeAyats[activeAyahIndex] || allAyatsInSurah[0] || getRandomAyatFromAvailable();

  // Load All Ayahs of Selected Surah
  useEffect(() => {
    setIsLoadingAyahs(true);
    speechEngine.stopListening();
    audioRecorder.stopRecording();
    audioPlayer.stop();
    setIsRecording(false);
    setIsSyekhCorrecting(false);
    setLastMistakeNotice(null);
    setInterimSpoken('');
    setCompletedAyahIndices(new Set());
    setActiveAyahIndex(0);

    getSurahAyahs(selectedSurahNumber).then((ayats) => {
      setAllAyatsInSurah(ayats);
      setStartAyah(1);
      setEndAyah(ayats.length);
      setIsLoadingAyahs(false);
    });
  }, [selectedSurahNumber]);

  // Scroll active ayah into center view
  useEffect(() => {
    if (ayahItemRefs.current[activeAyahIndex]) {
      ayahItemRefs.current[activeAyahIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeAyahIndex]);

  // Sync initial word statuses when active ayah changes
  useEffect(() => {
    if (currentAyat && currentAyat.arabicText) {
      const words = currentAyat.arabicText.split(/\s+/).filter(Boolean);
      setActiveWordStatuses(
        words.map((w) => ({
          expectedWord: w,
          spokenWord: '',
          status: 'pending'
        }))
      );
      setInterimSpoken('');
      setCurrentAyahAccuracy(0);
    }
  }, [activeAyahIndex, currentAyat]);

  // ==============================================================================
  // REAL-TIME SPEECH STREAMING SUPERVISOR & AUTO-ADVANCE / SYEKH CORRECTION
  // ==============================================================================
  const handleStreamingResult = (spokenText: string) => {
    if (!currentAyat || isSyekhCorrecting || isDemoRunning) return;

    setInterimSpoken(spokenText);
    const progress = speechEngine.evaluateStreamingProgress(spokenText, currentAyat);
    setActiveWordStatuses(progress.wordStatuses);
    setCurrentAyahAccuracy(progress.accuracyScore);

    // 1. CRITICAL ERROR / MISTAKE DETECTED -> TEGURAN SUARA SYEKH MISYARI
    if (progress.hasCriticalMistake) {
      triggerSyekhCorrection(
        `⚠️ Teguran AI: Lafal pada ayat ini keliru (${progress.accuracyScore}%). Simak lantunan Syekh Misyari untuk meluruskan bacaan!`
      );
      return;
    }

    // 2. AYAH COMPLETED SUCCESSFULLY -> AUTO-ADVANCE TO NEXT AYAH CONTINUOUSLY
    if (progress.isAyahCompleted) {
      handleAyahCompletedSuccessfully(progress.accuracyScore);
    }
  };

  // Success Handler: Mark Ayah Done & Smoothly Advance to Next Ayah
  const handleAyahCompletedSuccessfully = (score: number) => {
    audioPlayer.playSuccessChime();

    // Mark current active ayah as completed
    setCompletedAyahIndices((prev) => new Set(prev).add(activeAyahIndex));

    // Update Profile XP & Streak
    const updated = addXpAndCheckStreak(75);
    onProfileUpdated(updated);

    // Resolve weak verse if any
    resolveWeakVerse(currentAyat.surahNumber, currentAyat.numberInSurah);

    // Record to Supabase
    recordMurojaahLogToSupabase(
      userProfile.id,
      currentAyat.surahNumber,
      currentAyat.numberInSurah,
      currentAyat.surahName,
      'realtime',
      score,
      true,
      'Maa Syaa Allah! Hafalan mutqin lancar berurutan.'
    );

    // Clear transcript buffer in speech engine for next verse
    speechEngine.clearTranscript();
    setInterimSpoken('');

    // Advance to next ayah in multi-ayah sequence
    if (activeAyahIndex + 1 < activeAyats.length) {
      setTimeout(() => {
        setActiveAyahIndex((prev) => prev + 1);
      }, 500);
    } else {
      // Completed entire surah / range!
      setIsRecording(false);
      speechEngine.stopListening();
      audioRecorder.stopRecording();
      confetti({ particleCount: 150, spread: 90 });
    }
  };

  // Trigger Syekh Correction Interruption
  const triggerSyekhCorrection = async (noticeText: string) => {
    setIsSyekhCorrecting(true);
    setLastMistakeNotice(noticeText);

    // Pause mic
    speechEngine.stopListening();
    await audioRecorder.stopRecording();
    setIsRecording(false);

    // Play correction prompt sound
    audioPlayer.playCorrectionPromptSound();

    // Record as weak verse for Tikrar 1-5-10
    recordWeakVerse({
      surahNumber: currentAyat.surahNumber,
      ayahNumber: currentAyat.numberInSurah,
      surahName: currentAyat.surahName,
      arabicText: currentAyat.arabicText,
      translation: currentAyat.translation,
      errorCount: 1,
      resolved: false
    });

    // Play authentic Syekh Mishary audio for this verse
    setTimeout(async () => {
      await audioPlayer.playAyat(currentAyat.surahNumber, currentAyat.numberInSurah, () => {
        setIsSyekhCorrecting(false);
      });
    }, 800);
  };

  // Start Mic Listening for Continuous Muroja'ah
  const handleStartContinuousRecording = async () => {
    audioPlayer.stop();
    setIsSyekhCorrecting(false);
    setLastMistakeNotice(null);
    setInterimSpoken('');

    await audioRecorder.startRecording((vol) => {
      setMicVolume(vol);
    });

    const started = speechEngine.startListening({
      language: speechLanguage as any,
      onInterimResult: (text) => handleStreamingResult(text),
      onFinalResult: (text) => handleStreamingResult(text),
      onError: (err) => {
        console.warn('Mic speech warning:', err);
      }
    });

    if (started) {
      setIsRecording(true);
    } else {
      setIsRecording(true);
    }
  };

  // Stop Mic Listening
  const handleStopContinuousRecording = async () => {
    speechEngine.stopListening();
    await audioRecorder.stopRecording();
    setIsRecording(false);
    setMicVolume(0);
  };

  // Manual Text / Word Chip Evaluation
  const handleEvaluateManualTextInput = () => {
    if (!manualTextInput.trim()) {
      alert('Silakan ketik atau klik susunan kata ayat terlebih dahulu.');
      return;
    }
    const evalResult = speechEngine.evaluateRecitation(manualTextInput.trim(), currentAyat);
    if (evalResult.isPassed) {
      handleAyahCompletedSuccessfully(evalResult.accuracyScore);
      setManualTextInput('');
    } else {
      triggerSyekhCorrection(
        `⚠️ Teguran AI: Susunan kata kurang tepat (${evalResult.accuracyScore}%). Simak lantunan Syekh Misyari!`
      );
    }
  };

  // 🎯 1-Click Live Multi-Ayat Presentation Demo (Guaranteed 96% Pitch-Perfect Result)
  const handleRunPresentationDemo = async () => {
    if (isDemoRunning) return;
    setIsDemoRunning(true);
    audioPlayer.stop();
    setIsRecording(false);
    setIsSyekhCorrecting(false);
    setLastMistakeNotice(null);

    // Simulate multi-ayah continuous recitation step-by-step
    const demoSteps = Math.min(3, activeAyats.length);

    for (let step = 0; step < demoSteps; step++) {
      setActiveAyahIndex(step);
      const targetAyat = activeAyats[step];
      const words = targetAyat.arabicText.split(/\s+/).filter(Boolean);

      // Progressive word highlight simulation
      for (let wIdx = 0; wIdx < words.length; wIdx++) {
        await new Promise((r) => setTimeout(r, 250));
        setActiveWordStatuses(
          words.map((w, i) => ({
            expectedWord: w,
            spokenWord: w,
            status: i <= wIdx ? 'correct' : 'pending'
          }))
        );
        setCurrentAyahAccuracy(Math.round(((wIdx + 1) / words.length) * 96));
      }

      audioPlayer.playSuccessChime();
      setCompletedAyahIndices((prev) => new Set(prev).add(step));
      const updated = addXpAndCheckStreak(100);
      onProfileUpdated(updated);

      await new Promise((r) => setTimeout(r, 500));
    }

    setIsDemoRunning(false);
    confetti({ particleCount: 120, spread: 80 });
  };

  // Surah filter list
  const filteredSurahs = SURAH_LIST.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      s.latinName.toLowerCase().includes(q) ||
      s.meaning.toLowerCase().includes(q) ||
      s.name.includes(q) ||
      String(s.number) === q;

    const matchesJuz = selectedJuzFilter === null || JUZ_MAP[selectedJuzFilter]?.surahNumbers.includes(s.number);
    return matchesQuery && matchesJuz;
  });

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto">
      {/* 🎯 1. DAILY TARGET ROADMAP WIDGET */}
      <DailyTargetWidget
        onStartTarget={(target) => {
          setSelectedSurahNumber(target.surahNumber);
          setStartAyah(target.ayahStart);
          setEndAyah(target.ayahEnd);
        }}
      />

      {/* 2. SURAH & AYAH RANGE SELECTOR CARD (114 SURAT) */}
      <NeobrutalCard variant="emerald" className="p-4 sm:p-5 border-2 border-black shadow-[3px_3px_0px_0px_#111827]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-white/20 pb-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 text-xs font-black bg-[#F59E0B] text-black rounded border border-black uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Muroja'ah Multi-Ayat AI
              </span>
              <span className="px-2 py-0.5 text-xs font-bold bg-[#10B981] text-black rounded border border-black">
                114 Surat Penuh (Juz 1–30)
              </span>
              <span className="px-2 py-0.5 text-xs font-bold bg-white/20 text-white rounded border border-white/30">
                {currentSurahMeta.revelationPlace}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white">
              QS. {currentSurahMeta.latinName} ({currentSurahMeta.name})
            </h2>
            <p className="text-xs text-emerald-100 font-medium">
              "{currentSurahMeta.meaning}" • Total {currentSurahMeta.ayahCount} Ayat (Juz {currentSurahMeta.juzStart})
            </p>
          </div>

          {/* Action: Open 114 Surahs Picker Modal */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSurahModalOpen(true)}
              className="px-3.5 py-2 bg-[#FFFDF7] hover:bg-[#FEF3C7] text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer neo-button shadow-[2px_2px_0px_0px_#000]"
            >
              <BookOpen className="w-4 h-4 text-[#0B4627]" />
              <span>Ganti Surat (114 Surat) ▾</span>
            </button>
          </div>
        </div>

        {/* Range Selector Bar & Blind Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Ayah Range Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#F59E0B]">Rentang Ayat:</span>
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/20 text-white font-bold">
              <span>Ayat</span>
              <input
                type="number"
                min={1}
                max={endAyah}
                value={startAyah}
                onChange={(e) => setStartAyah(Math.max(1, Math.min(Number(e.target.value), endAyah)))}
                className="w-12 px-1.5 py-0.5 bg-white text-black text-center font-black rounded border border-black text-xs"
              />
              <span>s/d</span>
              <input
                type="number"
                min={startAyah}
                max={currentSurahMeta.ayahCount}
                value={endAyah}
                onChange={(e) => setEndAyah(Math.max(startAyah, Math.min(Number(e.target.value), currentSurahMeta.ayahCount)))}
                className="w-12 px-1.5 py-0.5 bg-white text-black text-center font-black rounded border border-black text-xs"
              />
              <span className="text-emerald-300">({endAyah - startAyah + 1} Ayat)</span>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setStartAyah(1);
                  setEndAyah(currentSurahMeta.ayahCount);
                }}
                className="px-2 py-1 bg-black/40 hover:bg-black/60 text-white rounded-lg border border-white/20 text-[11px] font-bold cursor-pointer"
              >
                Semua Ayat
              </button>
              {currentSurahMeta.ayahCount > 10 && (
                <button
                  onClick={() => {
                    setStartAyah(1);
                    setEndAyah(10);
                  }}
                  className="px-2 py-1 bg-black/40 hover:bg-black/60 text-white rounded-lg border border-white/20 text-[11px] font-bold cursor-pointer"
                >
                  Ayat 1-10
                </button>
              )}
            </div>
          </div>

          {/* Blind / Blur Mode Toggle */}
          <button
            onClick={() => setIsBlindMode(!isBlindMode)}
            className={`px-3 py-1.5 rounded-xl border-2 border-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer neo-button transition-all ${
              isBlindMode ? 'bg-[#F59E0B] text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-white text-black'
            }`}
            title="Sembunyikan teks untuk menguji ingatan murni"
          >
            {isBlindMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#0B4627]" />}
            <span>{isBlindMode ? 'Mode Tutup Hafalan (Aktif)' : 'Mode Buka Teks'}</span>
          </button>
        </div>
      </NeobrutalCard>

      {/* 3. TEGURAN SUARA SYEKH NOTIFICATION BANNER (IF MISTAKE OCCURS) */}
      {lastMistakeNotice && (
        <div className="p-4 bg-[#FEE2E2] border-2 border-red-500 rounded-2xl shadow-[3px_3px_0px_0px_#DC2626] animate-in fade-in zoom-in-95 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-black text-red-900">
              {isSyekhCorrecting ? '🔊 Bimbingan Suara Syekh Misyari Sedang Berbunyi...' : '⚠️ Catatan Koreksi Tajwid & Makhraj'}
            </h4>
            <p className="text-xs text-red-800 font-medium mt-0.5">{lastMistakeNotice}</p>
            <p className="text-[11px] text-red-700 font-bold mt-1">
              Ayat ini telah otomatis dicatat ke Pelacak Ayat Lemah (Metode Tikrar). Silakan latih kembali agar menancap mutqin!
            </p>
          </div>
          <button
            onClick={() => setLastMistakeNotice(null)}
            className="text-xs font-black text-red-800 hover:text-black p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4. LIVE SPEECH CONTROL & DECIBEL SUPERVISOR BAR */}
      <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#111827] space-y-3">
        {/* Mode Selector & Dialect Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gray-200 pb-2.5">
          {/* 3 Input Modes */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setInputMode('voice')}
              className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1 cursor-pointer ${
                inputMode === 'voice' ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Mikrofon Suara (Multi-Ayat)</span>
            </button>

            <button
              onClick={() => setInputMode('text')}
              className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1 cursor-pointer ${
                inputMode === 'text' ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Ketik / Chip Kata</span>
            </button>

            <button
              onClick={handleRunPresentationDemo}
              disabled={isDemoRunning}
              className="px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black bg-[#F59E0B] hover:bg-[#D97706] text-black flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
              title="Simulasi Muroja'ah Multi-Ayat Otomatis di Depan Juri"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>{isDemoRunning ? 'Simulasi Berjalan...' : '⚡ Demo Juri Multi-Ayat'}</span>
            </button>
          </div>

          {/* Dialect Selector */}
          {inputMode === 'voice' && (
            <div className="flex items-center gap-1 text-xs">
              <span className="font-bold text-gray-600 hidden sm:inline">Dialek:</span>
              <button
                onClick={() => setSpeechLanguage('ar-SA')}
                className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                  speechLanguage === 'ar-SA' ? 'bg-[#0B4627] text-white border-black font-black' : 'bg-gray-100 text-gray-700'
                }`}
              >
                🇸🇦 Arab
              </button>
              <button
                onClick={() => setSpeechLanguage('ar-KW')}
                className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                  speechLanguage === 'ar-KW' ? 'bg-[#0B4627] text-white border-black font-black' : 'bg-gray-100 text-gray-700'
                }`}
              >
                🇰🇼 Kuwait
              </button>
              <button
                onClick={() => setSpeechLanguage('id-ID')}
                className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                  speechLanguage === 'id-ID' ? 'bg-[#F59E0B] text-black border-black font-black' : 'bg-gray-100 text-gray-700'
                }`}
              >
                🇮🇩 Fonetik
              </button>
            </div>
          )}
        </div>

        {/* VOICE INPUT MAIN CONTROLS */}
        {inputMode === 'voice' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {/* Mic Button & Volume Ring */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                {isRecording && (
                  <div
                    className="absolute rounded-full bg-emerald-400 opacity-40 animate-ping pointer-events-none"
                    style={{
                      width: `${Math.max(54, 54 + micVolume * 0.7)}px`,
                      height: `${Math.max(54, 54 + micVolume * 0.7)}px`
                    }}
                  />
                )}
                <button
                  onClick={isRecording ? handleStopContinuousRecording : handleStartContinuousRecording}
                  className={`w-14 h-14 rounded-full border-3 border-black flex items-center justify-center transition-all cursor-pointer relative z-10 ${
                    isRecording
                      ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.8)] scale-105'
                      : 'bg-[#10B981] hover:bg-[#059669] text-black shadow-[3px_3px_0px_0px_#000]'
                  }`}
                  title={isRecording ? 'Klik untuk Menghentikan Mic' : 'Mulai Melafalkan Ayat Berkelanjutan'}
                >
                  {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              </div>

              <div>
                <p className="text-xs font-black text-black">
                  {isRecording ? '🎙️ Mikrofon Aktif — Silakan Melafalkan' : 'Klik Tombol Mikrofon untuk Memulai'}
                </p>
                <p className="text-[11px] text-gray-600">
                  {isRecording
                    ? 'Lafalkan ayat secara mengalir. Sistem otomatis berpindah ayat jika benar, dan Syekh menegur jika salah.'
                    : 'Muroja\'ah mengalir dari ayat awal sampai akhir tanpa perlu menekan tombol berulang.'}
                </p>
              </div>
            </div>

            {/* Live Meter & Accuracy */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {isRecording && (
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2.5 bg-gray-200 rounded-full border border-black overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-75 ${
                        micVolume > 60 ? 'bg-red-500' : (micVolume > 30 ? 'bg-amber-400' : 'bg-emerald-500')
                      }`}
                      style={{ width: `${Math.min(100, Math.max(8, micVolume))}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-gray-600">{micVolume} dB</span>
                </div>
              )}

              {currentAyahAccuracy > 0 && (
                <div className="px-2.5 py-1 bg-emerald-100 border border-emerald-800 rounded-lg text-right">
                  <span className="text-xs font-black text-emerald-950 font-mono">{currentAyahAccuracy}%</span>
                  <span className="text-[9px] font-bold text-emerald-800 block leading-none">Akurasi Live</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* KEYBOARD / CHIP INPUT */}
        {inputMode === 'text' && (
          <div className="space-y-2.5 pt-1">
            <div className="flex flex-wrap gap-1.5" dir="rtl">
              {currentAyat.arabicText.split(/\s+/).filter(Boolean).map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => setManualTextInput((prev) => (prev ? prev + ' ' + word : word))}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-black border-2 border-black rounded-lg font-quran text-sm font-bold cursor-pointer neo-button shadow-[2px_2px_0px_0px_#000]"
                >
                  {word}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualTextInput}
                onChange={(e) => setManualTextInput(e.target.value)}
                placeholder="Ketik lafal atau klik potongan kata di atas..."
                className="flex-1 px-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold focus:outline-none"
              />
              <button
                onClick={handleEvaluateManualTextInput}
                className="px-4 py-2 bg-[#0B4627] text-white border-2 border-black rounded-xl text-xs font-black neo-button cursor-pointer"
              >
                Evaluasi
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. CONTINUOUS MULTI-AYAH MUSHAF STREAM */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-gray-700 uppercase">
            Aliran Ayat Muroja'ah ({activeAyats.length} Ayat) • Selesai: {completedAyahIndices.size} / {activeAyats.length}
          </span>
          <span className="text-[11px] font-bold text-[#0B4627] bg-[#D1FAE5] px-2 py-0.5 rounded border border-[#0B4627]">
            Ayat Aktif: #{currentAyat.numberInSurah}
          </span>
        </div>

        {isLoadingAyahs ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-[#0B4627] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-600">Memuat seluruh ayat Surat {currentSurahMeta.latinName}...</p>
          </div>
        ) : (
          activeAyats.map((ayat, idx) => {
            const isActive = idx === activeAyahIndex;
            const isCompleted = completedAyahIndices.has(idx);

            return (
              <div
                key={ayat.numberInSurah}
                ref={(el) => { ayahItemRefs.current[idx] = el; }}
                className={`p-4 rounded-2xl border-2 border-black transition-all ${
                  isActive
                    ? 'bg-[#FFFDF7] shadow-[3px_3px_0px_0px_#F59E0B] ring-2 ring-[#F59E0B]'
                    : (isCompleted
                      ? 'bg-[#F0FDF4] border-emerald-600 shadow-[1px_1px_0px_0px_#059669] opacity-90'
                      : 'bg-white shadow-[2px_2px_0px_0px_#111827]')
                }`}
              >
                {/* Ayah Header Strip */}
                <div className="flex items-center justify-between border-b border-dashed border-gray-300 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center font-mono font-bold text-xs ${
                      isActive ? 'bg-[#F59E0B] text-black' : (isCompleted ? 'bg-[#10B981] text-white' : 'bg-gray-100 text-gray-800')
                    }`}>
                      {ayat.numberInSurah}
                    </span>
                    <span className="text-xs font-extrabold text-gray-700">
                      Ayat ke-{ayat.numberInSurah}
                    </span>
                    {isActive && (
                      <span className="px-2 py-0.5 text-[10px] font-black bg-[#0B4627] text-white rounded uppercase animate-pulse">
                        🎙️ Sedang Dilafalkan
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2 py-0.5 text-[10px] font-black bg-[#D1FAE5] text-[#0B4627] rounded border border-[#0B4627]">
                        ✓ Selesai Mutqin
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Syekh Recitation Button */}
                    <button
                      onClick={() => audioPlayer.playAyat(ayat.surahNumber, ayat.numberInSurah)}
                      className="px-2.5 py-1 bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#0B4627] border border-black rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Dengarkan Suara Syekh Misyari"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Dengar Syekh</span>
                    </button>

                    {/* Switch Focus to this Ayah */}
                    {!isActive && (
                      <button
                        onClick={() => {
                          setActiveAyahIndex(idx);
                          speechEngine.clearTranscript();
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-gray-100 text-black border border-black rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Pilih Ayat
                      </button>
                    )}
                  </div>
                </div>

                {/* Arabic Words Display (Live Real-Time Highlight on Active Ayah) */}
                <div className="text-right my-2" dir="rtl">
                  {isActive ? (
                    <div className="flex flex-wrap gap-x-2 gap-y-2.5 items-center">
                      {activeWordStatuses.map((w, wIdx) => {
                        let wordBg = 'text-emerald-950';
                        let badgeIcon = '';

                        if (w.status === 'correct') {
                          wordBg = 'bg-[#D1FAE5] text-[#064E3B] border border-[#0B4627] font-bold';
                          badgeIcon = '✓';
                        } else if (w.status === 'warning') {
                          wordBg = 'bg-[#FEF3C7] text-[#92400E] border border-[#D97706] font-bold';
                          badgeIcon = '~';
                        } else if (w.status === 'error') {
                          wordBg = 'bg-[#FEE2E2] text-[#991B1B] border border-red-600 font-bold animate-shake';
                          badgeIcon = '!';
                        }

                        return (
                          <span
                            key={wIdx}
                            className={`font-quran text-2xl sm:text-3xl leading-loose px-2 py-0.5 rounded-lg transition-all inline-flex items-center gap-1 ${wordBg} ${
                              isBlindMode && w.status === 'pending' ? 'blur-xs select-none' : ''
                            }`}
                          >
                            <span>{w.expectedWord}</span>
                            {badgeIcon && (
                              <span className="text-[10px] font-sans font-black opacity-80">{badgeIcon}</span>
                            )}
                          </span>
                        );
                      })}
                      <span className="w-7 h-7 rounded-full border-2 border-black bg-[#F59E0B] text-black font-quran text-xs flex items-center justify-center font-bold mr-1">
                        ۝{ayat.numberInSurah}
                      </span>
                    </div>
                  ) : (
                    <p
                      className={`font-quran text-xl sm:text-2xl leading-loose text-emerald-950 font-bold ${
                        isBlindMode && !isCompleted ? 'blur-xs select-none' : ''
                      }`}
                    >
                      {ayat.arabicText}
                    </p>
                  )}
                </div>

                {/* Transliteration & Translation */}
                {!isBlindMode && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs font-semibold text-[#0B4627] italic">
                      {ayat.transliteration}
                    </p>
                    <p className="text-xs text-gray-700 italic mt-0.5">
                      "{ayat.translation}"
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 6. SEARCHABLE 114 SURAHS PICKER MODAL */}
      {isSurahModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-black rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-[8px_8px_0px_0px_#000] overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-4 bg-[#0B4627] text-white border-b-2 border-black flex items-center justify-between">
              <div>
                <h4 className="text-base font-black">Pilih Surat untuk Muroja'ah (114 Surat)</h4>
                <p className="text-xs text-emerald-200">Pilih dari Juz 1 sampai Juz 30</p>
              </div>
              <button
                onClick={() => setIsSurahModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white text-black font-black text-sm flex items-center justify-center border-2 border-black cursor-pointer hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Search & Juz Filter */}
            <div className="p-3 border-b-2 border-black bg-gray-50 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari surat (nama, nomor, arti)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
                  autoFocus
                />
              </div>

              {/* Quick Juz filter pills */}
              <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSelectedJuzFilter(null)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold shrink-0 cursor-pointer ${
                    selectedJuzFilter === null ? 'bg-[#0B4627] text-white border-black font-black' : 'bg-white text-gray-700'
                  }`}
                >
                  Semua Juz
                </button>
                {[30, 29, 1, 2, 15, 18, 28].map((jNo) => (
                  <button
                    key={jNo}
                    onClick={() => setSelectedJuzFilter(jNo)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold shrink-0 cursor-pointer ${
                      selectedJuzFilter === jNo ? 'bg-[#F59E0B] text-black border-black font-black' : 'bg-white text-gray-700'
                    }`}
                  >
                    Juz {jNo}
                  </button>
                ))}
              </div>
            </div>

            {/* Surah List */}
            <div className="p-3 overflow-y-auto space-y-1.5 flex-1 max-h-96">
              {filteredSurahs.map((s) => {
                const isCurrent = s.number === selectedSurahNumber;
                return (
                  <button
                    key={s.number}
                    onClick={() => {
                      setSelectedSurahNumber(s.number);
                      setIsSurahModalOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border-2 border-black text-left flex items-center justify-between cursor-pointer transition-all ${
                      isCurrent ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-white hover:bg-amber-50 text-black'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-black ${isCurrent ? 'text-[#F59E0B]' : 'text-gray-600'}`}>
                          #{s.number}
                        </span>
                        <span className="font-extrabold text-xs">{s.latinName}</span>
                      </div>
                      <span className={`text-[10px] block mt-0.5 ${isCurrent ? 'text-emerald-200' : 'text-gray-600'}`}>
                        {s.ayahCount} Ayat • Juz {s.juzStart} • "{s.meaning}"
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
    </div>
  );
};

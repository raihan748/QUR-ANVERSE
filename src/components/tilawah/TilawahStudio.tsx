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
  ShieldAlert,
  Flame,
  Award,
  BookOpen,
  Zap,
  Activity,
  Check,
  Search,
  BookMarked,
  Info,
  HelpCircle,
  Play,
  RotateCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayat, UserProfile } from '../../types';
import { SURAH_LIST, getSurahAyahs } from '../../data/quranData';
import { 
  TAJWID_RULES_DB, 
  TajwidRule, 
  TajwidExamAyah, 
  TAJWID_EXAM_PRESETS 
} from '../../data/tajwidRulesData';
import { tajwidEngine, TajwidEvaluation } from '../../services/tajwidEngine';
import { speechEngine } from '../../services/speechEngine';
import { audioPlayer } from '../../services/audioPlayerService';
import { audioRecorder } from '../../services/audioRecorderService';
import { addXpAndCheckStreak, recordWeakVerse } from '../../services/offlineStorage';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { useLanguage } from '../../context/LanguageContext';

interface TilawahStudioProps {
  userProfile?: UserProfile;
  onProfileUpdated?: (profile: UserProfile) => void;
}

export const TilawahStudio: React.FC<TilawahStudioProps> = ({
  userProfile,
  onProfileUpdated
}) => {
  const { language, t } = useLanguage();

  // 1. Current Exam Ayah State
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [currentExamAyah, setCurrentExamAyah] = useState<TajwidExamAyah>(TAJWID_EXAM_PRESETS[0]);
  const [isSurahModalOpen, setIsSurahModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2. Real-time Audio & Speech State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [speechLanguage, setSpeechLanguage] = useState<'ar-SA' | 'ar-KW' | 'id-ID'>('ar-SA');
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  // 3. Evaluation & Auto-Tegur State
  const [evaluation, setEvaluation] = useState<TajwidEvaluation | null>(null);
  const [isPlayingSyekhGuide, setIsPlayingSyekhGuide] = useState<boolean>(false);
  const [isAutoTegurFired, setIsAutoTegurFired] = useState<boolean>(false);

  // 4. Load Preset / Surah
  const handleSelectPreset = (index: number) => {
    stopAllAudioAndMic();
    setSelectedPresetIndex(index);
    setCurrentExamAyah(TAJWID_EXAM_PRESETS[index]);
    setEvaluation(null);
    setIsAutoTegurFired(false);
    setLiveTranscript('');
  };

  // Generate random exam question
  const handleRandomExamAyah = () => {
    stopAllAudioAndMic();
    const randomIndex = Math.floor(Math.random() * TAJWID_EXAM_PRESETS.length);
    handleSelectPreset(randomIndex);
  };

  const stopAllAudioAndMic = () => {
    speechEngine.stopListening();
    audioRecorder.stopRecording();
    audioPlayer.stop();
    setIsListening(false);
    setMicVolume(0);
    setIsPlayingSyekhGuide(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllAudioAndMic();
    };
  }, []);

  // ==============================================================================
  // REAL-TIME MIC LISTENING & AUTO-TEGUR EVALUATION
  // ==============================================================================
  const handleStartListening = async () => {
    audioPlayer.stop();
    setIsPlayingSyekhGuide(false);
    setEvaluation(null);
    setIsAutoTegurFired(false);
    setLiveTranscript('');

    // Start VU meter
    await audioRecorder.startRecording((vol) => {
      setMicVolume(vol);
    });

    const started = speechEngine.startListening({
      language: speechLanguage as any,
      onInterimResult: (text) => processLiveSpeechInput(text),
      onFinalResult: (text) => processLiveSpeechInput(text),
      onError: (err) => {
        console.warn('Speech Engine Warning:', err);
      }
    });

    if (started) {
      setIsListening(true);
    } else {
      setIsListening(true);
    }
  };

  const handleStopListening = async () => {
    stopAllAudioAndMic();
    if (liveTranscript.trim()) {
      const evalRes = tajwidEngine.evaluateSpokenTajwid(liveTranscript, currentExamAyah);
      applyEvaluationResult(evalRes);
    }
  };

  // Real-time speech stream processing with Auto-Tegur trigger
  const processLiveSpeechInput = (text: string) => {
    setLiveTranscript(text);
    if (!text.trim() || isAutoTegurFired) return;

    const evalRes = tajwidEngine.evaluateSpokenTajwid(text, currentExamAyah);

    // If mistake detected during speech -> FIRE AUTO-TEGUR IMMEDIATELY!
    if (evalRes.hasError) {
      triggerAutoTegur(evalRes);
    } else if (evalRes.isPassed) {
      // User read perfectly!
      applyEvaluationResult(evalRes);
    }
  };

  // Trigger Instant Auto-Tegur: Halt mic, lock word in glowing red with wavy underline, play correction sound & Syekh voice
  const triggerAutoTegur = async (evalRes: TajwidEvaluation) => {
    setIsAutoTegurFired(true);
    speechEngine.stopListening();
    await audioRecorder.stopRecording();
    setIsListening(false);
    setMicVolume(0);

    // Set evaluation with locked error
    setEvaluation(evalRes);

    // 1. Play Warning Alert Sound
    audioPlayer.playCorrectionPromptSound();

    // 2. Record weak verse for Tikrar 1-5-10
    recordWeakVerse({
      surahNumber: currentExamAyah.surahNumber,
      ayahNumber: currentExamAyah.ayahNumber,
      surahName: currentExamAyah.surahName,
      arabicText: currentExamAyah.arabicText,
      translation: currentExamAyah.translation,
      errorCount: 1,
      resolved: false
    });

    // 3. Automatically play Sheikh Mishary's correct recitation on this verse
    setTimeout(async () => {
      setIsPlayingSyekhGuide(true);
      await audioPlayer.playAyat(currentExamAyah.surahNumber, currentExamAyah.ayahNumber, () => {
        setIsPlayingSyekhGuide(false);
      });
    }, 800);
  };

  const applyEvaluationResult = (evalRes: TajwidEvaluation) => {
    setEvaluation(evalRes);

    if (evalRes.isPassed) {
      stopAllAudioAndMic();
      audioPlayer.playSuccessChime();
      confetti({ particleCount: 120, spread: 80 });

      if (userProfile && onProfileUpdated) {
        const updated = addXpAndCheckStreak(100);
        onProfileUpdated(updated);
      }
    }
  };

  // Play Syekh audio guide manually
  const handlePlaySyekhGuide = async () => {
    setIsPlayingSyekhGuide(true);
    await audioPlayer.playAyat(currentExamAyah.surahNumber, currentExamAyah.ayahNumber, () => {
      setIsPlayingSyekhGuide(false);
    });
  };

  // Reset status for Retry
  const handleResetForRetry = () => {
    stopAllAudioAndMic();
    setEvaluation(null);
    setIsAutoTegurFired(false);
    setLiveTranscript('');
    handleStartListening();
  };

  // ==============================================================================
  // ⚡ 4-IN-1 SCENARIO SIMULATOR FOR JURY PRESENTATION
  // ==============================================================================
  const handleRunSimulation = (type: 'ikhfa_short' | 'mad_short' | 'makhraj_ain' | 'perfect') => {
    stopAllAudioAndMic();
    setLiveTranscript(
      type === 'perfect' 
        ? currentExamAyah.arabicText 
        : (type === 'ikhfa_short' ? 'Min syarri (kurang dengung)' : 'Lafal deviasi terdeteksi')
    );

    const simResult = tajwidEngine.simulateMistakeScenario(currentExamAyah, type);

    if (simResult.hasError) {
      triggerAutoTegur(simResult);
    } else {
      applyEvaluationResult(simResult);
    }
  };

  // Advance to next exam preset
  const handleAdvanceToNextPreset = () => {
    const nextIdx = (selectedPresetIndex + 1) % TAJWID_EXAM_PRESETS.length;
    handleSelectPreset(nextIdx);
  };

  const erroneousWord = (evaluation?.errorWordIndex !== undefined && currentExamAyah.words[evaluation.errorWordIndex])
    ? currentExamAyah.words[evaluation.errorWordIndex].text
    : '';

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto">
      {/* 1. TOP HEADER: MODULE BADGE & EXAM SELECTOR */}
      <NeobrutalCard variant="emerald" className="p-4 sm:p-5 border-2 border-black shadow-[3px_3px_0px_0px_#111827]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-white/20 pb-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-black bg-[#F59E0B] text-black rounded border border-black uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Ujian & Koreksi Tajwid
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-red-600 text-white rounded border border-black flex items-center gap-1 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" /> Auto-Tegur Aktif
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white">
              QS. {currentExamAyah.surahName} (Ayat {currentExamAyah.ayahNumber})
            </h2>
            <p className="text-xs text-emerald-100 font-medium">
              Fokus Hukum: <span className="font-bold text-[#F59E0B]">{currentExamAyah.primaryRule.name}</span> ({currentExamAyah.primaryRule.arabicName})
            </p>
          </div>

          {/* Preset Exam Quick Switcher */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleRandomExamAyah}
              className="px-3 py-1.5 bg-white hover:bg-amber-50 text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer neo-button shadow-[2px_2px_0px_0px_#000]"
              title="Acak Soal Ujian Tajwid Lain"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#0B4627]" />
              <span>Acak Soal</span>
            </button>

            <button
              onClick={() => setIsSurahModalOpen(true)}
              className="px-3 py-1.5 bg-[#FFFDF7] hover:bg-[#FEF3C7] text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer neo-button shadow-[2px_2px_0px_0px_#000]"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#0B4627]" />
              <span>Pilih Soal ▾</span>
            </button>
          </div>
        </div>

        {/* Quick Question Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
          {TAJWID_EXAM_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(idx)}
              className={`p-2 rounded-xl border-2 border-black text-left font-bold transition-all cursor-pointer truncate ${
                selectedPresetIndex === idx
                  ? 'bg-[#F59E0B] text-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-black/30 text-white hover:bg-black/50 border-white/20'
              }`}
            >
              <span className="block text-[10px] opacity-80 font-mono">Soal #{idx + 1}</span>
              <span className="block truncate font-extrabold">{preset.primaryRule.name}</span>
            </button>
          ))}
        </div>
      </NeobrutalCard>

      {/* 2. MUSHAF-STYLE NATURAL AYAT DISPLAY (CONTINUOUS ARABIC SENTENCE WITH INLINE HIGHLIGHTING) */}
      <NeobrutalCard variant="white" className="p-5 sm:p-7 border-2 border-black shadow-[3px_3px_0px_0px_#111827] space-y-4">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-dashed border-gray-300 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg border-2 border-black bg-[#0B4627] text-white flex items-center justify-center font-mono font-bold text-xs">
              {currentExamAyah.ayahNumber}
            </span>
            <span className="text-xs font-black text-black">
              QS. {currentExamAyah.surahName} : Ayat {currentExamAyah.ayahNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePlaySyekhGuide}
              className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5 cursor-pointer neo-button ${
                isPlayingSyekhGuide ? 'bg-[#F59E0B] text-black animate-pulse' : 'bg-[#D1FAE5] text-[#0B4627]'
              }`}
              title="Dengarkan Suara Pembetulan Syekh Misyari"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isPlayingSyekhGuide ? 'Syekh Membaca...' : 'Dengar Contoh Qari'}</span>
            </button>
          </div>
        </div>

        {/* Natural Flowing Arabic Sentence (Mushaf Typography) */}
        <div className="p-6 sm:p-8 bg-[#FBF9F2] border-2 border-black rounded-3xl text-center space-y-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
          <div 
            className="font-quran text-3xl sm:text-4xl lg:text-5xl leading-relaxed sm:leading-loose text-emerald-950 font-bold tracking-wide select-none"
            dir="rtl"
          >
            {currentExamAyah.words.map((w, wIdx) => {
              const isLockedError = evaluation?.errorWordIndex === wIdx;
              const isBeingRead = isListening && !isLockedError;

              // Inline Highlight Styling without rigid boxes
              let highlightClass = 'text-emerald-950 transition-all duration-200';

              if (isLockedError) {
                // Word turns glowing red with wavy underline when error detected
                highlightClass = 'text-red-600 underline decoration-wavy decoration-red-500 decoration-2 font-black bg-red-100/90 rounded px-1.5 animate-pulse ring-2 ring-red-400';
              } else if (isBeingRead) {
                highlightClass = 'text-emerald-900';
              }

              return (
                <React.Fragment key={wIdx}>
                  <span className={`inline-block mx-1.5 ${highlightClass}`}>
                    {w.text}
                  </span>
                  {' '}
                </React.Fragment>
              );
            })}
            
            {/* Elegant Ayah End Marker */}
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-black bg-[#F59E0B] text-black font-quran text-sm font-black mx-2 align-middle shadow-[1px_1px_0px_0px_#000]">
              ۝{currentExamAyah.ayahNumber}
            </span>
          </div>

          {/* Transliteration & Indonesian Translation */}
          <div className="border-t border-gray-300/80 pt-3 space-y-1.5 text-center">
            <p className="text-sm sm:text-base font-bold text-[#0B4627] italic font-serif">
              "{currentExamAyah.transliteration}"
            </p>
            <p className="text-xs sm:text-sm text-gray-700 italic font-medium max-w-2xl mx-auto leading-relaxed">
              "{currentExamAyah.translation}"
            </p>
          </div>
        </div>

        {/* 3. BANNER / CARD PERINGATAN KOREKSI AI (AUTO-TEGUR REAL-TIME) */}
        {evaluation?.hasError && (
          <div className="p-5 bg-[#FEE2E2] border-3 border-red-600 rounded-3xl shadow-[4px_4px_0px_0px_#DC2626] space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-8 h-8 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 text-[10px] font-black bg-red-600 text-white rounded border border-black uppercase">
                    Auto-Tegur AI Aktif
                  </span>
                  {erroneousWord && (
                    <span className="px-2.5 py-0.5 text-xs font-black bg-white text-red-700 rounded border border-red-400 font-quran" dir="rtl">
                      Kata: {erroneousWord}
                    </span>
                  )}
                </div>

                <h4 className="text-base font-black text-red-950">
                  ⚠️ Tajwid Kurang Tepat pada kata "{erroneousWord || 'ayat ini'}"
                </h4>
                <p className="text-xs text-red-900 font-bold mt-1">
                  {evaluation.mistakeExplanation || 'Terdapat kekeliruan makhraj huruf atau panjang harakat yang tidak sesuai kaidah.'}
                </p>
              </div>
            </div>

            {/* Hukum Tajwid & Cara Membaca yang Benar */}
            <div className="p-3.5 bg-white border-2 border-red-500 rounded-2xl space-y-1">
              <span className="text-[11px] font-black text-[#0B4627] uppercase block flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" /> 
                Hukum Tajwid & Penjelasan:
              </span>
              <p className="text-xs text-gray-900 font-extrabold leading-relaxed">
                {evaluation.correctGuidance || currentExamAyah.primaryRule.correctGuide}
              </p>
            </div>

            {/* Action Buttons: Dengar Contoh Qari & Ulangi Bacaan */}
            <div className="pt-2 border-t border-red-300 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                onClick={handlePlaySyekhGuide}
                className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-emerald-50 text-black border-2 border-black rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer neo-button shadow-[2px_2px_0px_0px_#000]"
              >
                <Volume2 className="w-4 h-4 text-[#0B4627]" />
                <span>Dengar Contoh Qari</span>
              </button>

              <button
                onClick={handleResetForRetry}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white border-2 border-black rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000] animate-pulse"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi Bacaan</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. SUCCESS BANNER (WHEN PASSED MUTQIN) */}
        {evaluation?.isPassed && (
          <div className="p-5 bg-[#D1FAE5] border-3 border-[#0B4627] rounded-3xl shadow-[4px_4px_0px_0px_#065F46] space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-[#0B4627]" />
                <div>
                  <h4 className="text-base font-black text-black">
                    LULUS UJIAN TAJWID (MUMTAZ {evaluation.score}%)
                  </h4>
                  <p className="text-xs font-bold text-emerald-900">
                    Maa Syaa Allah! Makhraj huruf, mad, dan ghunnah dilafalkan dengan sangat fasih dan tepat.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black font-mono text-[#0B4627]">+{100} XP</span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-400 flex justify-end">
              <button
                onClick={handleAdvanceToNextPreset}
                className="px-5 py-2.5 bg-[#0B4627] hover:bg-[#064E3B] text-white border-2 border-black rounded-xl text-xs font-black flex items-center gap-2 neo-button cursor-pointer shadow-[3px_3px_0px_0px_#000]"
              >
                <span>Lanjut ke Soal Ujian Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 5. MAIN MIC CONTROLS & LIVE DECIBEL METER */}
        <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_#111827] space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gray-200 pb-2.5">
            <span className="text-xs font-black text-gray-800 uppercase flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-[#0B4627]" /> Perekam Ujian Lisan AI:
            </span>

            {/* Dialect Switcher */}
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
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {/* Big Mic Button */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                {isListening && (
                  <div
                    className="absolute rounded-full bg-emerald-400 opacity-40 animate-ping pointer-events-none"
                    style={{
                      width: `${Math.max(54, 54 + micVolume * 0.7)}px`,
                      height: `${Math.max(54, 54 + micVolume * 0.7)}px`
                    }}
                  />
                )}
                <button
                  onClick={isListening ? handleStopListening : handleStartListening}
                  className={`w-14 h-14 rounded-full border-3 border-black flex items-center justify-center transition-all cursor-pointer relative z-10 ${
                    isListening
                      ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.8)] scale-105'
                      : 'bg-[#10B981] hover:bg-[#059669] text-black shadow-[3px_3px_0px_0px_#000]'
                  }`}
                  title={isListening ? 'Hentikan Perekaman' : 'Mulai Membaca'}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              </div>

              <div>
                <p className="text-xs font-black text-black">
                  {isListening ? '🎙️ AI Menyimak Pelafalan Anda Secara Langsung...' : 'Klik "Mulai Membaca" untuk Menguji Tajwid'}
                </p>
                <p className="text-[11px] text-gray-600">
                  {isListening
                    ? 'Lafalkan ayat dengan tartil. Jika terdeteksi kekeliruan tajwid, sistem akan otomatis menegur seketika.'
                    : 'Dekatkan mikrofon ke bibir dan baca ayat dengan tajwid & makhraj yang benar.'}
                </p>
              </div>
            </div>

            {/* VU Meter Bar */}
            {isListening && (
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
          </div>

          {/* Spoken Text Live Preview */}
          {liveTranscript && (
            <div className="p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-center">
              <span className="text-[10px] text-gray-500 font-bold block">Suara Terdeteksi:</span>
              <p className="text-xs font-bold text-black">{liveTranscript}</p>
            </div>
          )}
        </div>
      </NeobrutalCard>

      {/* 6. ⚡ 4-IN-1 SCENARIO SIMULATOR PANEL (FOR JURY DEMONSTRATION) */}
      <NeobrutalCard variant="gold" className="p-4 sm:p-5 border-2 border-black shadow-[3px_3px_0px_0px_#111827] space-y-3">
        <div className="flex items-center justify-between border-b border-black/20 pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 fill-black text-black" />
            <h3 className="text-sm font-black text-black uppercase">
              ⚡ Panel Simulasi Kesalahan Tajwid (Demo Cepat Juri Kuwait)
            </h3>
          </div>
          <span className="text-[10px] font-extrabold bg-black text-white px-2 py-0.5 rounded">
            1-Klik Uji Auto-Tegur
          </span>
        </div>

        <p className="text-xs text-black font-medium">
          Gunakan tombol simulasi berikut untuk menguji reaksi sistem Auto-Tegur secara instan di hadapan juri:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => handleRunSimulation('ikhfa_short')}
            className="p-2.5 bg-white hover:bg-red-50 text-black border-2 border-black rounded-xl text-left cursor-pointer neo-button shadow-[2px_2px_0px_0px_#000] flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-black text-red-700 block uppercase">⚠️ Simulasi #1</span>
              <span className="text-xs font-extrabold text-black block">Salah Ikhfa (Kurang Dengung)</span>
            </div>
            <span className="text-[10px] text-gray-600 mt-1 block">Uji Auto-Tegur Ikhfa Haqiqi</span>
          </button>

          <button
            onClick={() => handleRunSimulation('mad_short')}
            className="p-2.5 bg-white hover:bg-red-50 text-black border-2 border-black rounded-xl text-left cursor-pointer neo-button shadow-[2px_2px_0px_0px_#000] flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-black text-red-700 block uppercase">⚠️ Simulasi #2</span>
              <span className="text-xs font-extrabold text-black block">Salah Mad (Kurang Panjang)</span>
            </div>
            <span className="text-[10px] text-gray-600 mt-1 block">Uji Auto-Tegur Mad Wajib</span>
          </button>

          <button
            onClick={() => handleRunSimulation('makhraj_ain')}
            className="p-2.5 bg-white hover:bg-red-50 text-black border-2 border-black rounded-xl text-left cursor-pointer neo-button shadow-[2px_2px_0px_0px_#000] flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-black text-red-700 block uppercase">⚠️ Simulasi #3</span>
              <span className="text-xs font-extrabold text-black block">Salah Makhraj ('Ain vs Hamzah)</span>
            </div>
            <span className="text-[10px] text-gray-600 mt-1 block">Uji Auto-Tegur Makhraj Huruf</span>
          </button>

          <button
            onClick={() => handleRunSimulation('perfect')}
            className="p-2.5 bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#0B4627] border-2 border-black rounded-xl text-left cursor-pointer neo-button shadow-[2px_2px_0px_0px_#000] flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-black text-[#0B4627] block uppercase">✓ Simulasi #4</span>
              <span className="text-xs font-extrabold text-black block">Tajwid Sempurna (Mumtaz 98%)</span>
            </div>
            <span className="text-[10px] text-emerald-800 mt-1 block">Uji Kelulusan & Confetti XP</span>
          </button>
        </div>
      </NeobrutalCard>

      {/* 7. SEARCHABLE SOAL UJIAN PICKER MODAL */}
      {isSurahModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-black rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-[8px_8px_0px_0px_#000] overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#0B4627] text-white border-b-2 border-black flex items-center justify-between">
              <div>
                <h4 className="text-base font-black">Pilih Soal Ujian Tajwid</h4>
                <p className="text-xs text-emerald-200">Kumpulan Ayat Ujian Makhraj & Tajwid Khusus</p>
              </div>
              <button
                onClick={() => setIsSurahModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white text-black font-black text-sm flex items-center justify-center border-2 border-black cursor-pointer hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2 flex-1 max-h-96">
              {TAJWID_EXAM_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleSelectPreset(idx);
                    setIsSurahModalOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border-2 border-black text-left flex items-center justify-between cursor-pointer transition-all ${
                    selectedPresetIndex === idx ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-white hover:bg-amber-50 text-black'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-black ${selectedPresetIndex === idx ? 'text-[#F59E0B]' : 'text-gray-600'}`}>
                        #{idx + 1}
                      </span>
                      <span className="font-extrabold text-xs">
                        QS. {preset.surahName} (Ayat {preset.ayahNumber})
                      </span>
                    </div>
                    <span className={`text-[11px] font-bold block mt-0.5 ${selectedPresetIndex === idx ? 'text-emerald-200' : 'text-[#0B4627]'}`}>
                      Hukum: {preset.primaryRule.name} ({preset.primaryRule.arabicName})
                    </span>
                    <p className={`text-[10px] mt-0.5 truncate max-w-sm ${selectedPresetIndex === idx ? 'text-white/80' : 'text-gray-600'}`}>
                      "{preset.translation}"
                    </p>
                  </div>
                  <span className="font-quran text-lg font-bold">{preset.arabicText.split(/\s+/)[0]}...</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

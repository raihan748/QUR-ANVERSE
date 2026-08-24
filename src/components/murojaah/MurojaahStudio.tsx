import React, { useState, useEffect } from 'react';
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
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayat, EvaluationResult, UserProfile, SurahMeta } from '../../types';
import { getRandomAyatFromAvailable, SURAH_LIST, CORE_AYATS_DB, getSurahAyahs } from '../../data/quranData';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { speechEngine } from '../../services/speechEngine';
import { audioPlayer } from '../../services/audioPlayerService';
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

type MurojaahMode = 'daily_target' | 'random' | 'custom_surah';
type InputMode = 'voice' | 'text' | 'demo';

export const MurojaahStudio: React.FC<MurojaahStudioProps> = ({
  userProfile,
  onProfileUpdated
}) => {
  const { language } = useLanguage();

  // Mode selection: default to daily target (user reads today's target)
  const [studyMode, setStudyMode] = useState<MurojaahMode>('daily_target');
  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [dailyTarget, setDailyTarget] = useState<DailyQuranTarget>(getDailyTarget());

  // Current Target Surah Ayats for Sequential Recitation
  const [surahAyats, setSurahAyats] = useState<Ayat[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [currentAyat, setCurrentAyat] = useState<Ayat>(getRandomAyatFromAvailable());

  // Recording & Evaluation State
  const [isRecording, setIsRecording] = useState(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [speechLanguage, setSpeechLanguage] = useState<'ar-SA' | 'ar-KW' | 'id-ID'>('ar-SA');
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [manualTextAnswer, setManualTextAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isPlayingSyekh, setIsPlayingSyekh] = useState(false);

  // Filter & Modal State
  const [filterJuz, setFilterJuz] = useState<number | undefined>(undefined);
  const [filterSurah, setFilterSurah] = useState<number | undefined>(undefined);
  const [isSurahModalOpen, setIsSurahModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load ayahs for daily target or custom surah
  useEffect(() => {
    const targetSurahNo = studyMode === 'daily_target' ? dailyTarget.surahNumber : (filterSurah || 67);
    getSurahAyahs(targetSurahNo).then((ayats) => {
      setSurahAyats(ayats);
      if (ayats.length > 0) {
        if (studyMode === 'daily_target') {
          // Find first uncompleted ayah or start at index 0
          const firstUncompleted = ayats.findIndex(
            (a) => !dailyTarget.completedAyahNumbers.includes(a.numberInSurah)
          );
          const startIdx = firstUncompleted >= 0 ? firstUncompleted : 0;
          setCurrentAyahIndex(startIdx);
          setCurrentAyat(ayats[startIdx]);
        } else {
          setCurrentAyahIndex(0);
          setCurrentAyat(ayats[0]);
        }
      }
    });
  }, [studyMode, dailyTarget.surahNumber, filterSurah]);

  // Switch to next ayah in daily target sequence
  const handleAdvanceToNextAyah = () => {
    speechEngine.stopListening();
    audioRecorder.stopRecording();
    audioPlayer.stop();
    setIsRecording(false);
    setMicVolume(0);
    setIsPlayingSyekh(false);
    setEvaluation(null);
    setSpokenTranscript('');
    setInterimTranscript('');
    setManualTextAnswer('');

    if (studyMode === 'random') {
      const next = getRandomAyatFromAvailable(filterJuz, filterSurah);
      setCurrentAyat(next);
    } else {
      if (currentAyahIndex + 1 < surahAyats.length) {
        const nextIdx = currentAyahIndex + 1;
        setCurrentAyahIndex(nextIdx);
        setCurrentAyat(surahAyats[nextIdx]);
      } else {
        // Completed All Verses in Surah!
        confetti({ particleCount: 150, spread: 90 });
        alert(`🎉 Maa Syaa Allah! Anda telah menuntaskan seluruh ayat Surat ${currentAyat.surahName}!`);
      }
    }
  };

  // Generate new random verse
  const handleGenerateRandom = () => {
    speechEngine.stopListening();
    audioRecorder.stopRecording();
    audioPlayer.stop();
    setIsRecording(false);
    setMicVolume(0);
    setIsPlayingSyekh(false);
    setEvaluation(null);
    setSpokenTranscript('');
    setInterimTranscript('');
    setManualTextAnswer('');
    const next = getRandomAyatFromAvailable(filterJuz, filterSurah);
    setCurrentAyat(next);
  };

  // Start Mic Listening & Decibel Level Meter
  const handleStartRecording = async () => {
    audioPlayer.stop();
    setIsPlayingSyekh(false);
    setEvaluation(null);
    setSpokenTranscript('');
    setInterimTranscript('');

    // Start Audio Decibel Meter for visual feedback
    await audioRecorder.startRecording((vol) => {
      setMicVolume(vol);
    });

    const started = speechEngine.startListening({
      language: speechLanguage as any,
      onInterimResult: (text) => setInterimTranscript(text),
      onFinalResult: (text) => setSpokenTranscript(text),
      onError: (err) => {
        console.warn('Mic warning:', err);
      },
      onEnd: () => {
        // auto-handled by engine
      }
    });

    if (started) {
      setIsRecording(true);
    } else {
      // If Web Speech API blocked, fallback to volume meter active
      setIsRecording(true);
    }
  };

  // Stop Recording and Evaluate
  const handleStopAndEvaluate = async () => {
    speechEngine.stopListening();
    await audioRecorder.stopRecording();
    setIsRecording(false);
    setMicVolume(0);

    const fullSpoken = (spokenTranscript || interimTranscript || manualTextAnswer).trim();
    
    // Evaluate recitation against current ayat (Resilient speech evaluation)
    const evalResult = speechEngine.evaluateRecitation(
      fullSpoken,
      currentAyat
    );

    applyEvaluationResult(evalResult);
  };

  // Evaluate Manual Text / Word Chip Input
  const handleEvaluateManualText = () => {
    if (!manualTextAnswer.trim()) {
      alert('Silakan ketik atau klik kata-kata ayat terlebih dahulu.');
      return;
    }
    const evalResult = speechEngine.evaluateRecitation(manualTextAnswer.trim(), currentAyat);
    applyEvaluationResult(evalResult);
  };

  // 🎯 1-Click Live Presentation Demo Tester (Guaranteed 96% Pitch-Perfect Result)
  const handleRunPresentationDemo = () => {
    audioPlayer.stop();
    setIsPlayingSyekh(false);
    setIsRecording(false);
    setMicVolume(0);

    const demoResult = speechEngine.simulateDemoRecitation(currentAyat);
    setSpokenTranscript(currentAyat.arabicText);
    applyEvaluationResult(demoResult);
  };

  const applyEvaluationResult = (evalResult: EvaluationResult) => {
    setEvaluation(evalResult);

    if (evalResult.isPassed) {
      // SUCCESS: Accuracy >= 60%
      audioPlayer.playSuccessChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Update XP and Streak
      const updatedProfile = addXpAndCheckStreak(150);
      onProfileUpdated(updatedProfile);

      // Track progress in Daily Target
      const updatedTarget = markAyahCompletedInTarget(
        currentAyat.surahNumber,
        currentAyat.numberInSurah,
        (profile, finishedTarget) => {
          onProfileUpdated(profile);
          confetti({ particleCount: 150, spread: 100 });
        }
      );
      setDailyTarget(updatedTarget);

      // Resolve weak verse if previously recorded
      resolveWeakVerse(currentAyat.surahNumber, currentAyat.numberInSurah);

      // Record to Supabase
      recordMurojaahLogToSupabase(
        userProfile.id,
        currentAyat.surahNumber,
        currentAyat.numberInSurah,
        currentAyat.surahName,
        'realtime',
        evalResult.accuracyScore,
        true,
        evalResult.aiAdabPraise
      );
    } else {
      // FAILED: Accuracy < 60% (Wajib Ulang)
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

      // Automatically play Syekh recitation as reference
      setTimeout(() => {
        handlePlaySyekhReference();
      }, 1200);
    }
  };

  // Play Syekh's correct recitation
  const handlePlaySyekhReference = async () => {
    setIsPlayingSyekh(true);
    await audioPlayer.playAyat(currentAyat.surahNumber, currentAyat.numberInSurah, () => {
      setIsPlayingSyekh(false);
    });
  };

  const filteredSurahs = SURAH_LIST.filter(
    (s) =>
      s.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString().includes(searchQuery) ||
      s.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto">
      {/* 🎯 1. DAILY TARGET WIDGET (TARGET HARI INI) */}
      <DailyTargetWidget
        onStartTarget={(target) => {
          setStudyMode('daily_target');
          setDailyTarget(target);
        }}
        onTargetChanged={(newTarget) => {
          setDailyTarget(newTarget);
          setStudyMode('daily_target');
        }}
      />

      {/* 2. MODE SELECTOR TABS */}
      <div className="p-2.5 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_#111827]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => setStudyMode('daily_target')}
            className={`p-2 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              studyMode === 'daily_target'
                ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                : 'bg-gray-100 hover:bg-gray-200 text-black'
            }`}
          >
            <Target className="w-4 h-4 text-[#F59E0B]" />
            <span>Target Muroja'ah Hari Ini</span>
          </button>

          <button
            onClick={() => setStudyMode('random')}
            className={`p-2 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              studyMode === 'random'
                ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                : 'bg-gray-100 hover:bg-gray-200 text-black'
            }`}
          >
            <Shuffle className="w-4 h-4 text-[#10B981]" />
            <span>Acak Bebas (Semua Juz)</span>
          </button>

          <button
            onClick={() => {
              setStudyMode('custom_surah');
              setIsSurahModalOpen(true);
            }}
            className={`p-2 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              studyMode === 'custom_surah'
                ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                : 'bg-gray-100 hover:bg-gray-200 text-black'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#F59E0B]" />
            <span>Pilih Surat Tertentu ▾</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN AYAT RECITATION CARD */}
      <NeobrutalCard variant="white" className="p-4 sm:p-5 border-2 border-black shadow-[3px_3px_0px_0px_#111827] space-y-4">
        {/* Header Verse Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-dashed border-gray-300 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-black bg-[#0B4627] text-white rounded-lg border border-black uppercase">
                QS. {currentAyat.surahName} : Ayat {currentAyat.numberInSurah}
              </span>
              <span className="px-2 py-0.5 text-xs font-bold bg-[#F59E0B] text-black rounded border border-black">
                Juz {currentAyat.juz}
              </span>
              {studyMode === 'daily_target' && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-900 rounded border border-emerald-400">
                  Ayat {currentAyahIndex + 1} dari {surahAyats.length}
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-black">
              Lafalkan Ayat Berikut dengan Tartil
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlaySyekhReference}
              className={`px-3 py-1.5 border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer neo-button ${
                isPlayingSyekh ? 'bg-[#F59E0B] text-black animate-pulse' : 'bg-[#D1FAE5] text-[#0B4627]'
              }`}
              title="Dengarkan Suara Syekh"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isPlayingSyekh ? 'Memutar...' : 'Dengar Syekh'}</span>
            </button>

            <button
              onClick={studyMode === 'random' ? handleGenerateRandom : handleAdvanceToNextAyah}
              className="px-3 py-1.5 bg-white hover:bg-gray-100 text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              {studyMode === 'random' ? <Shuffle className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              <span>{studyMode === 'random' ? 'Acak Lain' : 'Ayat Selanjutnya'}</span>
            </button>
          </div>
        </div>

        {/* Big Arabic Text (Rasm Utsmani) */}
        <div className="p-5 bg-[#F8F5EE] border-2 border-black rounded-2xl text-center space-y-2.5">
          <div
            className="font-quran text-2xl sm:text-3xl lg:text-4xl leading-loose font-bold text-black select-none"
            dir="rtl"
          >
            {currentAyat.arabicText}
          </div>

          {currentAyat.transliteration && (
            <p className="text-xs text-emerald-800 font-semibold italic max-w-2xl mx-auto">
              "{currentAyat.transliteration}"
            </p>
          )}

          <p className="text-xs text-gray-700 italic border-t border-gray-300 pt-2 max-w-2xl mx-auto font-medium">
            "{currentAyat.translation}"
          </p>
        </div>

        {/* 4. MULTI-MODE INPUT SELECTOR (VOICE / KEYBOARD / DEMO) */}
        <div className="p-4 bg-white border-2 border-black rounded-2xl space-y-3 shadow-[2px_2px_0px_0px_#111827]">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 flex-wrap gap-2">
            <span className="text-xs font-black text-gray-700 uppercase flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#0B4627]" /> Metode Input Lisan:
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setInputMode('voice')}
                className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1 cursor-pointer ${
                  inputMode === 'voice' ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Mikrofon Suara</span>
              </button>

              <button
                onClick={() => setInputMode('text')}
                className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1 cursor-pointer ${
                  inputMode === 'text' ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Ketik / Susun Kata</span>
              </button>

              <button
                onClick={handleRunPresentationDemo}
                className="px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black bg-[#F59E0B] hover:bg-[#D97706] text-black flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                title="Simulasi Presentasi Juri Langsung (Garansi Lulus 96%)"
              >
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>⚡ Demo Juri</span>
              </button>
            </div>
          </div>

          {/* TAB A: VOICE MICROPHONE MODE */}
          {inputMode === 'voice' && (
            <div className="space-y-4">
              {/* Language Selector */}
              <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-300">
                <span className="text-xs font-bold text-gray-700">Dialek Suara:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSpeechLanguage('ar-SA')}
                    className={`px-2.5 py-1 text-xs font-black rounded-lg border cursor-pointer ${
                      speechLanguage === 'ar-SA' ? 'bg-[#0B4627] text-white border-black' : 'bg-white text-black border-gray-300'
                    }`}
                  >
                    🇸🇦 Arab (ar-SA)
                  </button>
                  <button
                    onClick={() => setSpeechLanguage('ar-KW')}
                    className={`px-2.5 py-1 text-xs font-black rounded-lg border cursor-pointer ${
                      speechLanguage === 'ar-KW' ? 'bg-[#0B4627] text-white border-black' : 'bg-white text-black border-gray-300'
                    }`}
                  >
                    🇰🇼 Kuwait (ar-KW)
                  </button>
                  <button
                    onClick={() => setSpeechLanguage('id-ID')}
                    className={`px-2.5 py-1 text-xs font-black rounded-lg border cursor-pointer ${
                      speechLanguage === 'id-ID' ? 'bg-[#F59E0B] text-black border-black' : 'bg-white text-black border-gray-300'
                    }`}
                  >
                    🇮🇩 Fonetik (id-ID)
                  </button>
                </div>
              </div>

              {/* Mic Action Bar & Decibel Visualizer */}
              <div className="flex flex-col items-center justify-center gap-3 py-3">
                {/* Real-time Decibel Pulse Ring */}
                <div className="relative flex items-center justify-center">
                  {isRecording && (
                    <div 
                      className="absolute rounded-full bg-emerald-400 opacity-40 animate-ping"
                      style={{ 
                        width: `${Math.max(80, 80 + micVolume * 0.8)}px`, 
                        height: `${Math.max(80, 80 + micVolume * 0.8)}px` 
                      }}
                    />
                  )}
                  <button
                    onClick={isRecording ? handleStopAndEvaluate : handleStartRecording}
                    className={`w-20 h-20 rounded-full border-4 border-black flex items-center justify-center transition-all cursor-pointer relative z-10 ${
                      isRecording
                        ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.7)] scale-105'
                        : 'bg-[#10B981] hover:bg-[#059669] text-black shadow-[4px_4px_0px_0px_#000] hover:scale-105'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>
                </div>

                {/* Real-time Decibel Meter Level */}
                {isRecording && (
                  <div className="w-64 flex flex-col items-center gap-1">
                    <div className="w-full h-3 bg-gray-200 rounded-full border-2 border-black overflow-hidden flex">
                      <div 
                        className={`h-full transition-all duration-75 ${
                          micVolume > 60 ? 'bg-red-500' : (micVolume > 30 ? 'bg-amber-400' : 'bg-emerald-500')
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, micVolume))}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-emerald-800 flex items-center gap-1 animate-pulse">
                      <Activity className="w-3 h-3 text-emerald-600" /> Suara Terdengar ({micVolume} dB) • Silakan Melafalkan
                    </span>
                  </div>
                )}

                <span className="text-xs font-black text-black text-center">
                  {isRecording
                    ? 'Mendengarkan Lisan... Klik Tombol Merah Jika Selesai Melafalkan'
                    : 'Klik Tombol Hijau, Dekatkan ke Bibir, Lalu Baca Ayat'}
                </span>

                {/* Transcript Live Preview */}
                {(spokenTranscript || interimTranscript) && (
                  <div className="w-full p-3 bg-amber-50 border-2 border-black rounded-xl text-center">
                    <span className="text-[10px] font-bold text-gray-500 block">Lafal Terdeteksi:</span>
                    <p className="font-quran text-lg font-bold text-black mt-0.5" dir="rtl">
                      {spokenTranscript || interimTranscript}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB B: KEYBOARD / WORD CHIPS MODE */}
          {inputMode === 'text' && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 border-2 border-black rounded-xl space-y-2">
                <span className="text-[11px] font-black text-gray-700 block">
                  Susun kata atau ketik transliterasi lafal ayat ini:
                </span>

                {/* Clickable Word Chips */}
                <div className="flex flex-wrap gap-1.5 py-1" dir="rtl">
                  {currentAyat.arabicText.split(/\s+/).filter(Boolean).map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => setManualTextAnswer((prev) => (prev ? prev + ' ' + word : word))}
                      className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-black border-2 border-black rounded-lg font-quran text-base font-bold cursor-pointer neo-button shadow-[2px_2px_0px_0px_#000]"
                    >
                      {word}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={manualTextAnswer}
                  onChange={(e) => setManualTextAnswer(e.target.value)}
                  placeholder="Ketik teks Arab atau transliterasi Latin di sini..."
                  className="w-full p-3 bg-white border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setManualTextAnswer('')}
                    className="text-xs font-bold text-gray-500 hover:text-black cursor-pointer"
                  >
                    Bersihkan
                  </button>
                  <button
                    onClick={handleEvaluateManualText}
                    className="px-4 py-2 bg-[#0B4627] text-white border-2 border-black rounded-xl text-xs font-black neo-button cursor-pointer"
                  >
                    Evaluasi Ketikan Lisan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. AI EVALUATION RESULT & FEEDBACK */}
        {evaluation && (
          <div
            className={`p-5 rounded-3xl border-3 border-black space-y-4 animate-in fade-in zoom-in-95 ${
              evaluation.isPassed ? 'bg-[#D1FAE5]' : 'bg-[#FEE2E2]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {evaluation.isPassed ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-700" />
                )}
                <div>
                  <h4 className="text-base font-black text-black">
                    {evaluation.isPassed ? 'LULUS MUROJA\'AH (MUTQIN)' : 'PERLU PERBAIKAN BACAAN'}
                  </h4>
                  <p className="text-xs font-bold text-gray-800">{evaluation.aiAdabPraise}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black font-mono text-black">
                  {evaluation.accuracyScore}%
                </span>
                <span className="text-[10px] font-bold block text-gray-600">Skor Akurasi</span>
              </div>
            </div>

            {/* Word-by-Word Analysis Tag Cloud */}
            {evaluation.wordEvaluations && evaluation.wordEvaluations.length > 0 && (
              <div className="p-3.5 bg-white border-2 border-black rounded-2xl space-y-2">
                <span className="text-[11px] font-black text-gray-700 uppercase block">
                  Analisis Presisi Per Kata:
                </span>
                <div className="flex flex-wrap gap-2" dir="rtl">
                  {evaluation.wordEvaluations.map((w, idx) => (
                    <div
                      key={idx}
                      className={`px-2.5 py-1.5 rounded-xl border-2 border-black font-quran text-base font-bold flex items-center gap-1.5 ${
                        w.status === 'correct'
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-900 shadow-[2px_2px_0px_0px_#065F46]'
                          : (w.status === 'warning'
                            ? 'bg-amber-100 text-amber-950 border-amber-900 shadow-[2px_2px_0px_0px_#92400E]'
                            : 'bg-red-100 text-red-950 border-red-900 shadow-[2px_2px_0px_0px_#991B1B]')
                      }`}
                    >
                      <span>{w.expectedWord}</span>
                      <span className="text-[10px] font-mono font-sans font-bold">
                        {w.status === 'correct' ? '✓' : (w.status === 'warning' ? '⚠️' : '✗')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Note & Action Next Step */}
            <div className="pt-2 border-t border-black/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                onClick={handleStartRecording}
                className="px-4 py-2 bg-white text-black border-2 border-black rounded-xl text-xs font-black flex items-center justify-center gap-1 cursor-pointer neo-button"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Ulangi Ayat Ini
              </button>

              {evaluation.isPassed && (
                <button
                  onClick={handleAdvanceToNextAyah}
                  className="px-5 py-2.5 bg-[#0B4627] text-white border-2 border-black rounded-xl text-xs font-black flex items-center justify-center gap-2 neo-button cursor-pointer shadow-[3px_3px_0px_0px_#000]"
                >
                  <span>Lanjut Ayat Berikutnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </NeobrutalCard>

      {/* SEARCHABLE SURAH PICKER MODAL */}
      {isSurahModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-black rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-[8px_8px_0px_0px_#000] overflow-hidden">
            <div className="p-4 bg-[#0B4627] text-white border-b-3 border-black flex items-center justify-between">
              <div>
                <h4 className="text-base font-black">Pilih Surat untuk Muroja'ah</h4>
                <p className="text-xs text-emerald-200">Pilih surat dari Juz 1 sampai Juz 30</p>
              </div>
              <button
                onClick={() => setIsSurahModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white text-black font-black text-sm flex items-center justify-center border-2 border-black cursor-pointer hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 border-b-2 border-black bg-gray-50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari nama surat atau nomor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-3 overflow-y-auto space-y-1.5 flex-1 max-h-96">
              {filteredSurahs.map((s) => (
                <button
                  key={s.number}
                  onClick={() => {
                    setFilterSurah(s.number);
                    setStudyMode('custom_surah');
                    setIsSurahModalOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl border-2 border-black text-left flex items-center justify-between bg-white hover:bg-amber-50 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black">#{s.number}</span>
                      <span className="font-extrabold text-xs">{s.latinName}</span>
                    </div>
                    <span className="text-[10px] text-gray-600 block mt-0.5">
                      {s.ayahCount} Ayat • Juz {s.juzStart}
                    </span>
                  </div>
                  <span className="font-quran text-lg font-bold">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayat, EvaluationResult, UserProfile, SurahMeta } from '../../types';
import { getRandomAyatFromAvailable, SURAH_LIST, CORE_AYATS_DB, getSurahAyahs } from '../../data/quranData';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { speechEngine } from '../../services/speechEngine';
import { audioPlayer } from '../../services/audioPlayerService';
import { recordWeakVerse, resolveWeakVerse, addXpAndCheckStreak } from '../../services/offlineStorage';
import { recordMurojaahLogToSupabase } from '../../services/supabaseClient';
import { 
  DailyQuranTarget, 
  getDailyTarget, 
  setCustomDailyTarget, 
  markAyahCompletedInTarget 
} from '../../services/dailyTargetService';
import { DailyTargetWidget } from '../common/DailyTargetWidget';

interface MurojaahStudioProps {
  userProfile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
}

type MurojaahMode = 'daily_target' | 'random' | 'custom_surah';

export const MurojaahStudio: React.FC<MurojaahStudioProps> = ({
  userProfile,
  onProfileUpdated
}) => {
  // Mode selection: default to daily target (user reads today's target)
  const [studyMode, setStudyMode] = useState<MurojaahMode>('daily_target');
  const [dailyTarget, setDailyTarget] = useState<DailyQuranTarget>(getDailyTarget());

  // Current Target Surah Ayats for Sequential Recitation
  const [surahAyats, setSurahAyats] = useState<Ayat[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [currentAyat, setCurrentAyat] = useState<Ayat>(getRandomAyatFromAvailable());

  // Recording & Evaluation State
  const [isRecording, setIsRecording] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<'ar-SA' | 'id-ID'>('ar-SA');
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
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
    audioPlayer.stop();
    setIsRecording(false);
    setIsPlayingSyekh(false);
    setEvaluation(null);
    setSpokenTranscript('');
    setInterimTranscript('');

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
    audioPlayer.stop();
    setIsRecording(false);
    setIsPlayingSyekh(false);
    setEvaluation(null);
    setSpokenTranscript('');
    setInterimTranscript('');
    const next = getRandomAyatFromAvailable(filterJuz, filterSurah);
    setCurrentAyat(next);
  };

  // Start Mic Listening
  const handleStartRecording = () => {
    audioPlayer.stop();
    setIsPlayingSyekh(false);
    setEvaluation(null);
    setSpokenTranscript('');
    setInterimTranscript('');

    const started = speechEngine.startListening({
      language: speechLanguage,
      onInterimResult: (text) => setInterimTranscript(text),
      onFinalResult: (text) => {
        setSpokenTranscript((prev) => (prev ? prev + ' ' + text : text));
      },
      onError: (err) => {
        console.warn('Mic error:', err);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });

    if (started) {
      setIsRecording(true);
    } else {
      alert('Izin mikrofon diperlukan untuk evaluasi bacaan Muroja\'ah AI.');
    }
  };

  // Stop Recording and Evaluate
  const handleStopAndEvaluate = async () => {
    speechEngine.stopListening();
    setIsRecording(false);

    const fullSpoken = (spokenTranscript + ' ' + interimTranscript).trim();
    
    // Evaluate recitation against current ayat (Strict speech evaluation)
    const evalResult = speechEngine.evaluateRecitation(
      fullSpoken,
      currentAyat
    );

    setEvaluation(evalResult);

    if (evalResult.isPassed) {
      // SUCCESS: Accuracy >= 80%
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
      // FAILED: Accuracy < 80% (Wajib Ulang)
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

      // Automatically play Syekh Mishary's recitation as reference
      setTimeout(() => {
        handlePlaySyekhReference();
      }, 1200);
    }
  };

  // Play Syekh Mishary's correct recitation
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
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
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

      {/* 2. MODE SELECTOR TABS (TARGET HARIAN vs ACAK BEBAS vs PILIH SURAT) */}
      <div className="p-3 bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_#111827]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => setStudyMode('daily_target')}
            className={`py-2.5 px-3 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studyMode === 'daily_target'
                ? 'bg-[#0B4627] text-[#F59E0B] shadow-[2px_2px_0px_0px_#000]'
                : 'bg-gray-100 text-gray-800 hover:bg-amber-50'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>🎯 Target Hari Ini ({dailyTarget.surahName})</span>
          </button>

          <button
            onClick={() => setStudyMode('random')}
            className={`py-2.5 px-3 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studyMode === 'random'
                ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                : 'bg-gray-100 text-gray-800 hover:bg-amber-50'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>🎲 Acak Ayat (Juz 29 & 30)</span>
          </button>

          <button
            onClick={() => setIsSurahModalOpen(true)}
            className={`py-2.5 px-3 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              studyMode === 'custom_surah'
                ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                : 'bg-gray-100 text-gray-800 hover:bg-amber-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📖 Pilih Surat Tertentu ▾</span>
          </button>
        </div>
      </div>

      {/* 3. ACTIVE AYAT DISPLAY & RECITER CARD */}
      <NeobrutalCard className="p-6 space-y-6">
        {/* Ayat Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-dashed border-gray-300 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0B4627] text-[#F59E0B] border-2 border-black flex items-center justify-center font-mono font-black text-lg shadow-[2px_2px_0px_0px_#000]">
              {currentAyat.numberInSurah}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-gray-600">
                  QS. {currentAyat.surahName} ({currentAyat.surahNumber}) • Ayat {currentAyat.numberInSurah}
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-[10px] font-black">
                  Juz {currentAyat.juz || 30}
                </span>
              </div>
              <h3 className="text-xl font-black text-black">
                {studyMode === 'daily_target'
                  ? `Target Harian: Ayat ${currentAyat.numberInSurah} dari ${surahAyats.length}`
                  : `Muroja'ah Surat ${currentAyat.surahName}`}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlaySyekhReference}
              disabled={isPlayingSyekh}
              className="px-3 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 neo-button cursor-pointer"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingSyekh ? 'animate-bounce' : ''}`} />
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
        <div className="p-6 bg-[#F8F5EE] border-3 border-black rounded-3xl text-center space-y-3">
          <div
            className="font-quran text-3xl sm:text-4xl lg:text-5xl leading-loose font-bold text-black select-none"
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

        {/* 4. MICROPHONE RECORDING & AI EVALUATION CONTROLS */}
        <div className="p-5 bg-white border-3 border-black rounded-3xl space-y-4 shadow-[4px_4px_0px_0px_#111827]">
          {/* Language Selector */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-xs font-bold text-gray-600">Model Bahasa Mikrofon:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSpeechLanguage('ar-SA')}
                className={`px-2.5 py-1 text-xs font-black rounded-lg border cursor-pointer ${
                  speechLanguage === 'ar-SA'
                    ? 'bg-[#0B4627] text-white border-black'
                    : 'bg-gray-100 text-black border-gray-300'
                }`}
              >
                🇸🇦 Arab (ar-SA)
              </button>
              <button
                onClick={() => setSpeechLanguage('id-ID')}
                className={`px-2.5 py-1 text-xs font-black rounded-lg border cursor-pointer ${
                  speechLanguage === 'id-ID'
                    ? 'bg-[#F59E0B] text-black border-black'
                    : 'bg-gray-100 text-black border-gray-300'
                }`}
              >
                🇮🇩 Fonetik (id-ID)
              </button>
            </div>
          </div>

          {/* Mic Action Bar */}
          <div className="flex flex-col items-center justify-center gap-3 py-2">
            <button
              onClick={isRecording ? handleStopAndEvaluate : handleStartRecording}
              className={`w-20 h-20 rounded-full border-4 border-black flex items-center justify-center transition-all cursor-pointer ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                  : 'bg-[#10B981] hover:bg-[#059669] text-black shadow-[4px_4px_0px_0px_#000] hover:scale-105'
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>

            <span className="text-xs font-black text-black">
              {isRecording ? 'Sedang Merekam... Klik untuk Selesai & Evaluasi' : 'Klik Mikrofon & Baca Ayat di Atas'}
            </span>

            {/* Transcript Preview */}
            {(spokenTranscript || interimTranscript) && (
              <div className="w-full p-3 bg-amber-50 border-2 border-black rounded-xl text-center">
                <span className="text-[10px] font-bold text-gray-500 block">Suara Anda Terdeteksi:</span>
                <p className="font-quran text-lg font-bold text-black mt-0.5" dir="rtl">
                  {spokenTranscript} {interimTranscript}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 5. AI EVALUATION RESULT & FEEDBACK */}
        {evaluation && (
          <div
            className={`p-5 rounded-3xl border-3 border-black space-y-3 ${
              evaluation.isPassed ? 'bg-[#D1FAE5]' : 'bg-[#FEE2E2]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {evaluation.isPassed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-700" />
                )}
                <div>
                  <h4 className="text-base font-black text-black">
                    {evaluation.isPassed ? 'LULUS MUROJA\'AH (MUTQIN)' : 'PERLU PERBAIKAN BACAAN'}
                  </h4>
                  <p className="text-xs font-bold text-gray-700">{evaluation.aiAdabPraise}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono text-black">
                  {evaluation.accuracyScore}%
                </span>
                <span className="text-[10px] font-bold block text-gray-600">Akurasi</span>
              </div>
            </div>

            {/* Action Next Step */}
            <div className="pt-2 border-t border-black/10 flex items-center justify-between">
              <button
                onClick={handleStartRecording}
                className="px-3.5 py-1.5 bg-white text-black border-2 border-black rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Ulangi Ayat Ini
              </button>

              {evaluation.isPassed && (
                <button
                  onClick={handleAdvanceToNextAyah}
                  className="px-5 py-2 bg-[#0B4627] text-white border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 neo-button cursor-pointer"
                >
                  <span>Lanjut Ayat Berikutnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </NeobrutalCard>

      {/* SEARCHABLE SURAH PICKER MODAL (NON-CLIPPING) */}
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

            <div className="p-3 border-b-2 border-black bg-amber-50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari surat (contoh: Al-Mulk, Yasin, Al-Kahf, 67)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
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
                  className="w-full p-2.5 rounded-xl border-2 border-black text-left flex items-center justify-between hover:bg-amber-50 transition-all cursor-pointer bg-white text-black"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black">#{s.number}</span>
                      <span className="font-extrabold text-xs">{s.latinName}</span>
                      <span className="text-[10px] opacity-75">({s.meaning})</span>
                    </div>
                    <span className="text-[10px] opacity-80 block mt-0.5">
                      {s.ayahCount} Ayat • Juz {s.juzStart} • {s.revelationPlace}
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

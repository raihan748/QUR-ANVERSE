import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Clock, 
  UserCheck, 
  Volume2, 
  Mic, 
  MicOff, 
  Trophy, 
  Sparkles, 
  RotateCcw, 
  Flame, 
  Award,
  CheckCircle,
  XCircle,
  Zap,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayat, ChallengeMode, UserProfile } from '../../types';
import { getRandomJuz29And30Ayat } from '../../data/quranData';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { audioPlayer } from '../../services/audioPlayerService';
import { speechEngine } from '../../services/speechEngine';
import { addXpAndCheckStreak } from '../../services/offlineStorage';

interface SambungAyatGameProps {
  userProfile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
}

export const SambungAyatGame: React.FC<SambungAyatGameProps> = ({
  userProfile,
  onProfileUpdated
}) => {
  const [mode, setMode] = useState<ChallengeMode>('ai');
  const [juzFilter, setJuzFilter] = useState<29 | 30 | 'all'>('all');
  const [challengeData, setChallengeData] = useState<{ prompt: Ayat; next: Ayat }>(
    getRandomJuz29And30Ayat('all')
  );
  const [gameScore, setGameScore] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Mic & Evaluation
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; accuracy: number; praise: string } | null>(null);

  useEffect(() => {
    loadChallenge(juzFilter);
  }, [juzFilter]);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (mode === 'timer' && isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      alert(`Waktu Habis! Skor Akhir Anda: ${gameScore} Poin!`);
    }
    return () => clearInterval(interval);
  }, [mode, isTimerRunning, timerSeconds, gameScore]);

  const loadChallenge = (filter = juzFilter) => {
    audioPlayer.stop();
    speechEngine.stopListening();
    setIsRecording(false);
    setLastResult(null);
    setSpokenTranscript('');

    const newChallenge = getRandomJuz29And30Ayat(filter);
    setChallengeData(newChallenge);

    // Auto play audio prompt Syekh Mishary
    audioPlayer.playAyat(newChallenge.prompt.surahNumber, newChallenge.prompt.numberInSurah);
  };

  const handleStartMic = () => {
    audioPlayer.stop();
    setLastResult(null);
    setSpokenTranscript('');

    const started = speechEngine.startListening({
      onFinalResult: (text) => setSpokenTranscript(text),
      onError: () => setIsRecording(false),
      onEnd: () => setIsRecording(false)
    });

    if (started) {
      setIsRecording(true);
      if (mode === 'timer' && !isTimerRunning) setIsTimerRunning(true);
    }
  };

  const handleStopAndEvaluate = async () => {
    speechEngine.stopListening();
    setIsRecording(false);

    const target = challengeData.next;
    const evalResult = speechEngine.evaluateRecitation(spokenTranscript || target.arabicText, target);

    if (evalResult.isPassed) {
      // Correct!
      audioPlayer.playSuccessChime();
      confetti({ particleCount: 60, spread: 60 });
      const pts = 250 + comboStreak * 50;
      setGameScore((prev) => prev + pts);
      setComboStreak((prev) => prev + 1);

      const updated = addXpAndCheckStreak(pts);
      onProfileUpdated(updated);

      setLastResult({
        isCorrect: true,
        accuracy: evalResult.accuracyScore,
        praise: 'Maa Syaa Allah! Sambung ayat Anda tepat, fasih & mutqin!'
      });
    } else {
      // Wrong!
      audioPlayer.playCorrectionPromptSound();
      setComboStreak(0);
      setLastResult({
        isCorrect: false,
        accuracy: evalResult.accuracyScore,
        praise: 'Belum tepat. Dengarkan lantunan tartil Syekh Misyari berikut ini untuk memperbaiki!'
      });

      // Auto play correct Syekh recitation
      setTimeout(() => {
        audioPlayer.playAyat(target.surahNumber, target.numberInSurah);
      }, 800);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header Banner */}
      <NeobrutalCard variant="dark" className="p-6 relative overflow-hidden shadow-[6px_6px_0px_0px_#F59E0B]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-black bg-[#F59E0B] text-black rounded border border-black uppercase flex items-center gap-1">
                <Swords className="w-3.5 h-3.5" /> Sambung Ayat AI
              </span>
              <span className="px-2 py-0.5 text-xs font-extrabold bg-[#10B981] text-black rounded border border-black">
                Juz 29 & 30 Full
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Tantangan Sambung Ayat (Audio vs Audio)
            </h2>
            <p className="text-xs text-gray-300 font-medium mt-1">
              Dengarkan lantunan potongan ayat dari Syekh Misyari, lalu sambung ayat berikutnya secara lisan via mikrofon!
            </p>
          </div>

          {/* XP & Combo Display */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 bg-[#F59E0B] text-black border-2 border-black rounded-xl font-mono text-center">
              <span className="text-[10px] font-extrabold block">SKOR GAME</span>
              <span className="text-xl font-black">{gameScore} XP</span>
            </div>
            {comboStreak > 1 && (
              <div className="px-3 py-2 bg-[#EF4444] text-white border-2 border-black rounded-xl font-mono text-center animate-bounce">
                <span className="text-[10px] font-extrabold flex items-center justify-center gap-0.5">
                  <Flame className="w-3 h-3 fill-white" /> COMBO
                </span>
                <span className="text-xl font-black">{comboStreak}x</span>
              </div>
            )}
          </div>
        </div>
      </NeobrutalCard>

      {/* FILTER JUZ & MODE SELECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Juz Filter (Juz 29 vs Juz 30 vs Semua) */}
        <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#111827]">
          <span className="text-xs font-extrabold text-gray-600 block mb-2 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[#0B4627]" /> PILIH CAKUPAN JUZ:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setJuzFilter('all')}
              className={`py-2 text-xs font-extrabold rounded-xl border-2 border-black transition-all cursor-pointer ${
                juzFilter === 'all'
                  ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000] font-black'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Juz 29 & 30 (Semua)
            </button>
            <button
              onClick={() => setJuzFilter(29)}
              className={`py-2 text-xs font-extrabold rounded-xl border-2 border-black transition-all cursor-pointer ${
                juzFilter === 29
                  ? 'bg-[#F59E0B] text-black shadow-[2px_2px_0px_0px_#000] font-black'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Khusus Juz 29
            </button>
            <button
              onClick={() => setJuzFilter(30)}
              className={`py-2 text-xs font-extrabold rounded-xl border-2 border-black transition-all cursor-pointer ${
                juzFilter === 30
                  ? 'bg-[#10B981] text-black shadow-[2px_2px_0px_0px_#000] font-black'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Khusus Juz 30
            </button>
          </div>
        </div>

        {/* Challenge Mode Tabs */}
        <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#111827]">
          <span className="text-xs font-extrabold text-gray-600 block mb-2 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#F59E0B]" /> PILIH MODE PERMAINAN:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => { setMode('ai'); setIsTimerRunning(false); }}
              className={`py-2 text-xs font-extrabold rounded-xl border-2 border-black transition-all cursor-pointer ${
                mode === 'ai'
                  ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Lawan AI
            </button>
            <button
              onClick={() => { setMode('timer'); setTimerSeconds(45); }}
              className={`py-2 text-xs font-extrabold rounded-xl border-2 border-black transition-all cursor-pointer ${
                mode === 'timer'
                  ? 'bg-[#EF4444] text-white shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Timer 45s
            </button>
            <button
              onClick={() => { setMode('mandiri'); setIsTimerRunning(false); }}
              className={`py-2 text-xs font-extrabold rounded-xl border-2 border-black transition-all cursor-pointer ${
                mode === 'mandiri'
                  ? 'bg-[#F59E0B] text-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Mandiri
            </button>
          </div>
        </div>
      </div>

      {/* CHALLENGE ARENA CARD */}
      <NeobrutalCard className="p-6 sm:p-8 space-y-6">
        {/* Info Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#0B4627] text-white text-xs font-black rounded-lg border border-black">
              Juz {challengeData.prompt.juz}
            </span>
            <h3 className="text-lg font-black text-black">
              QS. {challengeData.prompt.surahName} (Ayat {challengeData.prompt.numberInSurah})
            </h3>
          </div>

          <button
            onClick={() => loadChallenge()}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black border-2 border-black rounded-xl text-xs font-extrabold flex items-center gap-1 neo-button cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Acak Soal Baru</span>
          </button>
        </div>

        {/* PROMPT AYAT BOX */}
        <div className="p-5 bg-[#F8F5EE] border-3 border-black rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#0B4627] uppercase tracking-wider">
              1. Dengarkan Ayat Pemicu:
            </span>
            <button
              onClick={() => audioPlayer.playAyat(challengeData.prompt.surahNumber, challengeData.prompt.numberInSurah)}
              className="px-3 py-1 bg-[#F59E0B] hover:bg-[#D97706] text-black border-2 border-black rounded-lg text-xs font-black flex items-center gap-1.5 neo-button cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Putar Audio Syekh</span>
            </button>
          </div>

          <div className="font-quran text-2xl sm:text-3xl text-right leading-loose text-black pt-2 font-bold" dir="rtl">
            {challengeData.prompt.arabicText}
          </div>
          <p className="text-xs text-gray-700 italic border-t border-gray-300 pt-2 font-medium">
            "{challengeData.prompt.translation}"
          </p>
        </div>

        {/* ACTION TARGET: SAMBUNG AYAT BERIKUTNYA */}
        <div className="p-5 bg-white border-3 border-dashed border-[#0B4627] rounded-2xl text-center space-y-4">
          <div className="inline-block px-3 py-1 bg-[#FEF3C7] border-2 border-black rounded-full text-xs font-extrabold text-black">
            🎯 Sambung Ayat ke-{challengeData.next.numberInSurah} Surat {challengeData.next.surahName}
          </div>

          <div className="flex flex-col items-center justify-center gap-3">
            {!isRecording ? (
              <button
                onClick={handleStartMic}
                className="px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-black border-3 border-black rounded-2xl text-base font-black flex items-center gap-3 neo-button shadow-[4px_4px_0px_0px_#000] cursor-pointer"
              >
                <Mic className="w-6 h-6" />
                <span>Mulai Rekam Suara Sambung Ayat</span>
              </button>
            ) : (
              <button
                onClick={handleStopAndEvaluate}
                className="px-8 py-4 bg-[#EF4444] hover:bg-[#DC2626] text-white border-3 border-black rounded-2xl text-base font-black flex items-center gap-3 neo-button shadow-[4px_4px_0px_0px_#000] animate-pulse cursor-pointer"
              >
                <MicOff className="w-6 h-6" />
                <span>Selesai & Evaluasi Jawaban AI</span>
              </button>
            )}

            {isRecording && (
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#EF4444]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping" />
                <span>AI sedang mendengarkan sambungan hafalan Anda...</span>
              </div>
            )}
          </div>

          {spokenTranscript && (
            <div className="p-3 bg-gray-50 border-2 border-black rounded-xl text-left">
              <span className="text-[10px] font-black text-gray-500 block uppercase">Transkrip Suara Anda:</span>
              <p className="text-sm font-semibold text-black mt-0.5">{spokenTranscript}</p>
            </div>
          )}
        </div>

        {/* EVALUATION RESULT BANNER */}
        {lastResult && (
          <div
            className={`p-5 rounded-2xl border-3 border-black space-y-3 ${
              lastResult.isCorrect ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {lastResult.isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-[#10B981]" />
                ) : (
                  <XCircle className="w-6 h-6 text-[#EF4444]" />
                )}
                <h4 className="text-base font-black">
                  {lastResult.isCorrect ? 'BENAR & MUTQIN!' : 'BELUM TEPAT'} (Akurasi: {lastResult.accuracy}%)
                </h4>
              </div>

              <button
                onClick={() => loadChallenge()}
                className="px-4 py-2 bg-black text-white text-xs font-black rounded-xl border border-black neo-button cursor-pointer"
              >
                Ayat Berikutnya &rarr;
              </button>
            </div>

            <p className="text-xs font-semibold">{lastResult.praise}</p>

            {/* Display correct text */}
            <div className="p-4 bg-white border-2 border-black rounded-xl text-black space-y-1">
              <span className="text-[10px] font-black text-gray-500 uppercase">Teks Jawaban yang Benar:</span>
              <p className="font-quran text-xl text-right leading-loose font-bold" dir="rtl">
                {challengeData.next.arabicText}
              </p>
              <p className="text-xs text-gray-700 italic">{challengeData.next.translation}</p>
            </div>
          </div>
        )}
      </NeobrutalCard>
    </div>
  );
};

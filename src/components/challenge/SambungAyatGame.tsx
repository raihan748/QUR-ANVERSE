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
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayat, ChallengeMode, UserProfile, EvaluationResult } from '../../types';
import { getRandomAyatFromAvailable, getSurahAyahs } from '../../data/quranData';
import { INITIAL_BADGES } from '../../data/achievementsData';
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
  const [currentPromptAyat, setCurrentPromptAyat] = useState<Ayat>(getRandomAyatFromAvailable());
  const [expectedNextAyat, setExpectedNextAyat] = useState<Ayat | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Mic & Evaluation
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; accuracy: number; praise: string } | null>(null);

  useEffect(() => {
    loadChallenge();
  }, []);

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

  const loadChallenge = async () => {
    audioPlayer.stop();
    speechEngine.stopListening();
    setIsRecording(false);
    setLastResult(null);
    setSpokenTranscript('');

    const prompt = getRandomAyatFromAvailable();
    setCurrentPromptAyat(prompt);

    const surahAyats = await getSurahAyahs(prompt.surahNumber);
    const next = surahAyats.find(a => a.numberInSurah === prompt.numberInSurah + 1) || surahAyats[0];
    setExpectedNextAyat(next);

    // Auto play audio prompt
    audioPlayer.playAyat(prompt.surahNumber, prompt.numberInSurah);
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

    const target = expectedNextAyat || currentPromptAyat;
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
        praise: 'Maa Syaa Allah! Jawaban sambung ayat Anda tepat dan fasih!'
      });
    } else {
      // Wrong!
      audioPlayer.playCorrectionPromptSound();
      setComboStreak(0);
      setLastResult({
        isCorrect: false,
        accuracy: evalResult.accuracyScore,
        praise: 'Belum tepat. Perhatikan teks dan dengarkan lantunan Syekh Misyari di bawah ini!'
      });

      // Auto play correct Syekh recitation
      setTimeout(() => {
        audioPlayer.playAyat(target.surahNumber, target.numberInSurah);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Game Header */}
      <NeobrutalCard variant="gold" className="p-5 border-3 border-black shadow-[6px_6px_0px_0px_#111827]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-black bg-[#0B4627] text-white rounded border border-black uppercase">
                Challenge Sambung Ayat
              </span>
              <span className="px-2 py-0.5 text-xs font-black bg-white text-black rounded border border-black">
                🔥 Combo: {comboStreak}x
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-black">
              Audio vs Audio Challenge
            </h2>
          </div>

          {/* Mode Switcher */}
          <div className="flex border-2 border-black rounded-xl overflow-hidden bg-white p-1 gap-1">
            <button
              onClick={() => {
                setMode('ai');
                setIsTimerRunning(false);
              }}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                mode === 'ai' ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]' : 'text-gray-700'
              }`}
            >
              <Swords className="w-3.5 h-3.5" /> Lawan AI
            </button>
            <button
              onClick={() => {
                setMode('timer');
                setTimerSeconds(45);
                setIsTimerRunning(true);
              }}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                mode === 'timer' ? 'bg-[#DC2626] text-white shadow-[2px_2px_0px_0px_#000]' : 'text-gray-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Rush Timer
            </button>
            <button
              onClick={() => {
                setMode('mandiri');
                setIsTimerRunning(false);
              }}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                mode === 'mandiri' ? 'bg-[#10B981] text-black shadow-[2px_2px_0px_0px_#000]' : 'text-gray-700'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Mandiri
            </button>
          </div>
        </div>
      </NeobrutalCard>

      {/* Game Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#FFFDF7] p-3 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#111827] text-center">
          <p className="text-[10px] font-extrabold text-gray-500 uppercase">Skor Game</p>
          <p className="text-xl font-black text-[#0B4627]">{gameScore} Pts</p>
        </div>
        <div className="bg-[#FFFDF7] p-3 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#111827] text-center">
          <p className="text-[10px] font-extrabold text-gray-500 uppercase">Streak Combo</p>
          <p className="text-xl font-black text-orange-600">🔥 {comboStreak}x</p>
        </div>
        <div className="bg-[#FFFDF7] p-3 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#111827] text-center">
          <p className="text-[10px] font-extrabold text-gray-500 uppercase">
            {mode === 'timer' ? 'Sisa Waktu' : 'Mode'}
          </p>
          <p className="text-xl font-black text-black">
            {mode === 'timer' ? `${timerSeconds}s` : 'Lawan AI'}
          </p>
        </div>
      </div>

      {/* QUESTION CARD: TAMPILKAN POTONGAN AYAT + TEKS */}
      <NeobrutalCard variant="white" className="p-6 sm:p-8 border-3 border-black shadow-[6px_6px_0px_0px_#111827]">
        <div className="flex items-center justify-between border-b-2 border-dashed border-gray-300 pb-3 mb-4">
          <span className="text-xs font-black px-2.5 py-1 bg-[#0B4627] text-white rounded-lg border border-black">
            Soal: Surat {currentPromptAyat.surahName} : Ayat {currentPromptAyat.numberInSurah}
          </span>
          <button
            onClick={() => audioPlayer.playAyat(currentPromptAyat.surahNumber, currentPromptAyat.numberInSurah)}
            className="flex items-center gap-1.5 text-xs font-extrabold text-[#0B4627] bg-[#D1FAE5] px-2.5 py-1 rounded-lg border border-black neo-button cursor-pointer"
          >
            <Volume2 className="w-4 h-4" /> Putar Potongan Ayat
          </button>
        </div>

        {/* Teks Potongan Ayat */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-wider">
            Potongan Ayat yang Diberikan AI:
          </p>
          <p className="font-quran text-2xl sm:text-4xl text-emerald-950 font-bold leading-loose" dir="rtl">
            {currentPromptAyat.arabicText}
          </p>
          <p className="text-xs text-gray-600 italic mt-2">"{currentPromptAyat.translation}"</p>
        </div>

        {/* Action Prompt */}
        <div className="mt-4 p-3 bg-[#FEF3C7] border-2 border-black rounded-xl text-center">
          <p className="text-xs font-extrabold text-[#92400E]">
            👉 Tugas Anda: Sambung 1-2 ayat berikutnya secara lisan menggunakan Mikrofon!
          </p>
        </div>
      </NeobrutalCard>

      {/* MIC RESPONSE CONTROLLER */}
      <div className="flex justify-center gap-3">
        {!isRecording ? (
          <button
            onClick={handleStartMic}
            className="px-6 py-4 bg-[#0B4627] hover:bg-[#064E3B] text-white font-black text-sm sm:text-base rounded-2xl border-3 border-black neo-button flex items-center gap-3 cursor-pointer shadow-[5px_5px_0px_0px_#111827]"
          >
            <Mic className="w-6 h-6 text-[#F59E0B] animate-pulse" />
            <span>Rekam Jawaban Sambungan Ayat</span>
          </button>
        ) : (
          <button
            onClick={handleStopAndEvaluate}
            className="px-6 py-4 bg-[#DC2626] text-white font-black text-sm sm:text-base rounded-2xl border-3 border-black neo-button flex items-center gap-3 cursor-pointer shadow-[5px_5px_0px_0px_#111827] animate-bounce"
          >
            <MicOff className="w-6 h-6 text-white" />
            <span>Kirim Jawaban ke AI</span>
          </button>
        )}
      </div>

      {/* FEEDBACK IF WRONG OR CORRECT */}
      {lastResult && (
        <NeobrutalCard
          variant={lastResult.isCorrect ? 'emerald' : 'gold'}
          className="p-5 border-3 border-black shadow-[6px_6px_0px_0px_#111827] animate-in slide-in-from-bottom"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {lastResult.isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <XCircle className="w-6 h-6 text-black" />
                )}
                <h4 className="text-base font-extrabold">
                  {lastResult.isCorrect ? 'BENAR! (+250 XP)' : 'KURANG TEPAT'}
                </h4>
              </div>
              <span className="text-sm font-black bg-black/40 text-white px-2 py-0.5 rounded border border-white/40">
                Akurasi: {lastResult.accuracy}%
              </span>
            </div>

            <p className="text-xs font-semibold">{lastResult.praise}</p>

            {/* If wrong, display correct text + audio */}
            {!lastResult.isCorrect && expectedNextAyat && (
              <div className="p-4 bg-white text-black border-2 border-black rounded-xl space-y-2">
                <p className="text-xs font-extrabold text-[#0B4627] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Jawaban Ayat Lanjutan yang Benar:
                </p>
                <p className="font-quran text-2xl text-right leading-loose text-emerald-950" dir="rtl">
                  {expectedNextAyat.arabicText}
                </p>
                <p className="text-xs text-gray-700 italic border-t border-gray-200 pt-1">
                  "{expectedNextAyat.translation}"
                </p>
                <button
                  onClick={() => audioPlayer.playAyat(expectedNextAyat.surahNumber, expectedNextAyat.numberInSurah)}
                  className="flex items-center gap-1.5 text-xs font-extrabold text-[#0B4627] hover:underline cursor-pointer pt-1"
                >
                  <Volume2 className="w-4 h-4" /> Dengarkan Contoh Lantunan Syekh Misyari
                </button>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={loadChallenge}
                className="px-4 py-2 bg-white text-black font-extrabold text-xs rounded-xl border-2 border-black neo-button cursor-pointer flex items-center gap-1.5"
              >
                <span>Soal Tantangan Berikutnya</span>
                <RotateCcw className="w-4 h-4 text-[#0B4627]" />
              </button>
            </div>
          </div>
        </NeobrutalCard>
      )}
    </div>
  );
};

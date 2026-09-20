import React, { useState, useEffect, useRef } from 'react';
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
  BookOpen,
  Globe,
  Radio,
  Play,
  Square,
  Edit3,
  HelpCircle,
  Check,
  Headphones
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayat, ChallengeMode, UserProfile } from '../../types';
import { getRandomJuz29And30ChallengeWithOptions } from '../../data/quranData';
import { audioPlayer } from '../../services/audioPlayerService';
import { speechEngine, SpeechEngine } from '../../services/speechEngine';
import { audioRecorder } from '../../services/audioRecorderService';
import { addXpAndCheckStreak } from '../../services/offlineStorage';
import { useLanguage } from '../../context/LanguageContext';

interface SambungAyatGameProps {
  userProfile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
}

type AnswerInputType = 'quiz' | 'voice' | 'text';

export const SambungAyatGame: React.FC<SambungAyatGameProps> = ({
  userProfile,
  onProfileUpdated
}) => {
  const { language, t } = useLanguage();
  const [mode, setMode] = useState<ChallengeMode>('ai');
  const [inputType, setInputType] = useState<AnswerInputType>('quiz');
  const [juzFilter, setJuzFilter] = useState<29 | 30 | 'all'>('all');
  const [difficulty, setDifficulty] = useState<'hardcore' | 'medium' | 'easy'>('hardcore');
  const [speechLanguage, setSpeechLanguage] = useState<'ar-SA' | 'id-ID'>('id-ID');
  
  const [challengeData, setChallengeData] = useState<{
    prompt: Ayat;
    next: Ayat;
    options: Ayat[];
  }>(getRandomJuz29And30ChallengeWithOptions('all', 'hardcore'));

  const [gameScore, setGameScore] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Voice State & Web Audio Decibel Meter
  const [isRecording, setIsRecording] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [recordedVoiceUrl, setRecordedVoiceUrl] = useState<string | null>(null);
  const [isPlayingUserVoice, setIsPlayingUserVoice] = useState(false);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);

  // Text Input State
  const [textAnswer, setTextAnswer] = useState('');

  // Selected Option for Quiz
  const [selectedOption, setSelectedOption] = useState<Ayat | null>(null);

  // Evaluation Result State
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    accuracy: number;
    praise: string;
  } | null>(null);

  useEffect(() => {
    loadChallenge(juzFilter);
    return () => {
      audioPlayer.stop();
      speechEngine.stopListening();
      audioRecorder.stopRecording();
    };
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

  const loadChallenge = (filter = juzFilter, diff = difficulty) => {
    audioPlayer.stop();
    speechEngine.stopListening();
    audioRecorder.stopRecording();
    setIsRecording(false);
    setMicVolume(0);
    setLastResult(null);
    setSpokenTranscript('');
    setRecordedVoiceUrl(null);
    setTextAnswer('');
    setSelectedOption(null);

    const newChallenge = getRandomJuz29And30ChallengeWithOptions(filter, diff);
    setChallengeData(newChallenge);

    // Auto play audio prompt Syekh Mishary
    audioPlayer.playAyat(newChallenge.prompt.surahNumber, newChallenge.prompt.numberInSurah);
  };

  // 1. QUIZ OPTION SELECT HANDLER
  const handleSelectQuizOption = (option: Ayat) => {
    if (lastResult) return; // already answered
    setSelectedOption(option);

    const isCorrect = option.arabicText === challengeData.next.arabicText;

    if (isCorrect) {
      audioPlayer.playSuccessChime();
      confetti({ particleCount: 60, spread: 60 });
      const pts = 250 + comboStreak * 50;
      setGameScore((prev) => prev + pts);
      setComboStreak((prev) => prev + 1);

      const updated = addXpAndCheckStreak(pts);
      onProfileUpdated(updated);

      setLastResult({
        isCorrect: true,
        accuracy: 100,
        praise: 'Maa Syaa Allah! Jawaban sambung ayat Anda 100% Benar & Tepat!'
      });

      // Play audio of the chosen correct continuation
      setTimeout(() => {
        audioPlayer.playAyat(option.surahNumber, option.numberInSurah);
      }, 400);
    } else {
      audioPlayer.playCorrectionPromptSound();
      setComboStreak(0);
      setLastResult({
        isCorrect: false,
        accuracy: 0,
        praise: 'Belum tepat. Dengarkan lantunan tartil Syekh Misyari berikut ini untuk menyimak ayat yang benar!'
      });

      // Play the actual correct continuation
      setTimeout(() => {
        audioPlayer.playAyat(challengeData.next.surahNumber, challengeData.next.numberInSurah);
      }, 800);
    }
  };

  // 2. VOICE RECORDING HANDLER
  const handleStartMic = async () => {
    audioPlayer.stop();
    setLastResult(null);
    setSpokenTranscript('');
    setRecordedVoiceUrl(null);

    // Preflight microphone permission & ensure audio hardware is unblocked
    await SpeechEngine.requestMicrophonePermission();

    // Dedicated Speech Recognition
    speechEngine.setLanguage(speechLanguage);
    const started = speechEngine.startListening({
      language: speechLanguage,
      onInterimResult: (text) => {
        setSpokenTranscript(text);
        setMicVolume(Math.min(95, 50 + Math.round(Math.random() * 40)));
      },
      onFinalResult: (text) => {
        setSpokenTranscript(text);
        setMicVolume(Math.min(95, 60 + Math.round(Math.random() * 35)));
      },
      onError: (err) => {
        console.warn('Mic speech warn:', err);
        if (typeof err === 'string') {
          setIsRecording(false);
          setMicVolume(0);
          setLastResult({
            isCorrect: false,
            accuracy: 0,
            praise: `${err} (Silakan beralih ke Mode Pilihan Ganda / Mode Tulis 100% Offline)`
          });
        }
      }
    });

    if (started) {
      setIsRecording(true);
      setMicVolume(30);
      if (mode === 'timer' && !isTimerRunning) setIsTimerRunning(true);
    } else {
      setLastResult({
        isCorrect: false,
        accuracy: 0,
        praise: 'Izin mikrofon diperlukan. Anda juga dapat menggunakan Mode Pilihan Ganda 100% Offline!'
      });
    }
  };

  const handleStopAndEvaluateVoice = async () => {
    const finalSpeech = speechEngine.stopListening();
    setIsRecording(false);
    setMicVolume(0);

    const target = challengeData.next;
    const cleanSpoken = (spokenTranscript || finalSpeech || '').trim();
    const alternatives = speechEngine.getAlternativeHypotheses();

    // Check if voice was captured
    if (!cleanSpoken) {
      audioPlayer.playCorrectionPromptSound();
      setComboStreak(0);
      setLastResult({
        isCorrect: false,
        accuracy: 0,
        praise: 'Suara belum tertangkap jelas. Dekatkan mikrofon dan lantunkan kembali, atau gunakan "Mode Pilihan Ganda"!'
      });
      return;
    }

    // Evaluate speech strictly against the expected continuation
    const evalResult = speechEngine.evaluateRecitation(cleanSpoken, target, alternatives);

    if (evalResult.isPassed) {
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
        praise: 'Maa Syaa Allah! Suara Anda berhasil direkam & sambungan ayat dinilai fasih & tepat!'
      });
    } else {
      audioPlayer.playCorrectionPromptSound();
      setComboStreak(0);
      setLastResult({
        isCorrect: false,
        accuracy: evalResult.accuracyScore,
        praise: `Lafal belum tepat (Akurasi: ${evalResult.accuracyScore}%). Dengarkan lantunan tartil Syekh Misyari berikut ini!`
      });

      setTimeout(() => {
        audioPlayer.playAyat(target.surahNumber, target.numberInSurah);
      }, 800);
    }
  };

  // 3. TEXT SUBMISSION HANDLER
  const handleSubmitTextAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textAnswer.trim()) return;

    const target = challengeData.next;
    const evalResult = speechEngine.evaluateRecitation(textAnswer.trim(), target);

    if (evalResult.isPassed) {
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
        praise: 'Maa Syaa Allah! Jawaban hafalan tertulis Anda tepat & mutqin!'
      });
    } else {
      audioPlayer.playCorrectionPromptSound();
      setComboStreak(0);
      setLastResult({
        isCorrect: false,
        accuracy: evalResult.accuracyScore,
        praise: 'Lafal belum tepat. Simak lantunan Syekh Misyari di bawah untuk memperbaiki!'
      });

      setTimeout(() => {
        audioPlayer.playAyat(target.surahNumber, target.numberInSurah);
      }, 800);
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B4627] via-[#08381F] to-[#042413] border border-emerald-800/80 shadow-sm text-white relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full flex items-center gap-1">
                <Swords className="w-3.5 h-3.5" /> {language === 'ar' ? 'مسابقة وصل الآيات' : 'Sambung Ayat AI Arena'}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full">
                {language === 'ar' ? 'الجزء ٢٩ و ٣٠' : 'Juz 29 & 30'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              {t.challengeArenaTitle}
            </h2>
            <p className="text-xs text-emerald-200/90 font-medium mt-1">
              {t.challengeArenaSub}
            </p>
          </div>

          {/* XP & Combo Display */}
          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-xl font-mono text-center shadow-xs">
              <span className="text-[10px] font-semibold block">{t.totalScore}</span>
              <span className="text-lg font-bold text-white">{gameScore} {t.points}</span>
            </div>
            {comboStreak > 1 && (
              <div className="px-3.5 py-2 bg-rose-500/20 border border-rose-400/40 text-rose-300 rounded-xl font-mono text-center shadow-xs">
                <span className="text-[10px] font-semibold flex items-center justify-center gap-0.5">
                  <Flame className="w-3 h-3 fill-rose-300" /> COMBO
                </span>
                <span className="text-lg font-bold text-white">{comboStreak}x</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FILTER & INPUT MODE SELECTOR TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Scope Juz */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#0B4627] dark:text-emerald-400" /> {t.scopeJuzTitle}
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => { setJuzFilter('all'); loadChallenge('all', difficulty); }}
              className={`py-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer ${
                juzFilter === 'all'
                  ? 'bg-[#0B4627] text-white border-emerald-700 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {language === 'ar' ? '٢٩ و ٣٠' : '29 & 30'}
            </button>
            <button
              onClick={() => { setJuzFilter(29); loadChallenge(29, difficulty); }}
              className={`py-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer ${
                juzFilter === 29
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {language === 'ar' ? 'جزء ٢٩' : 'Juz 29'}
            </button>
            <button
              onClick={() => { setJuzFilter(30); loadChallenge(30, difficulty); }}
              className={`py-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer ${
                juzFilter === 30
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {language === 'ar' ? 'جزء ٣٠' : 'Juz 30'}
            </button>
          </div>
        </div>

        {/* 2. Tingkat Kesulitan */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> {t.difficultyTitle}
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => { setDifficulty('hardcore'); loadChallenge(juzFilter, 'hardcore'); }}
              className={`py-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer ${
                difficulty === 'hardcore'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.diffHardcore}
            </button>
            <button
              onClick={() => { setDifficulty('medium'); loadChallenge(juzFilter, 'medium'); }}
              className={`py-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer ${
                difficulty === 'medium'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.diffMedium}
            </button>
            <button
              onClick={() => { setDifficulty('easy'); loadChallenge(juzFilter, 'easy'); }}
              className={`py-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer ${
                difficulty === 'easy'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.diffEasy}
            </button>
          </div>
        </div>

        {/* 3. Input Method Selector */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> {t.methodTitle}
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setInputType('quiz')}
              className={`py-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer ${
                inputType === 'quiz'
                  ? 'bg-[#0B4627] text-white border-emerald-700 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.methodQuiz}
            </button>
            <button
              onClick={() => setInputType('voice')}
              className={`py-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer ${
                inputType === 'voice'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.methodVoice}
            </button>
            <button
              onClick={() => setInputType('text')}
              className={`py-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer ${
                inputType === 'text'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.methodText}
            </button>
          </div>
        </div>
      </div>

      {/* CHALLENGE ARENA CARD */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs space-y-6">
        {/* Info Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-[#0B4627] text-white text-xs font-semibold rounded-lg">
              {language === 'ar' ? `الجزء ${challengeData.prompt.juz}` : `Juz ${challengeData.prompt.juz}`}
            </span>
            {difficulty === 'hardcore' && (
              <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-300/60 dark:border-rose-800/60 text-[11px] font-semibold rounded-lg uppercase flex items-center gap-1">
                <Flame className="w-3 h-3 fill-rose-500" /> {t.diffHardcore}
              </span>
            )}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {language === 'ar'
                ? `سورة ${challengeData.prompt.surahName} (الآية ${challengeData.prompt.numberInSurah})`
                : `QS. ${challengeData.prompt.surahName} (Ayat ${challengeData.prompt.numberInSurah})`}
            </h3>
          </div>

          <button
            onClick={() => loadChallenge()}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition duration-150 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.newQuestion}</span>
          </button>
        </div>

        {/* PROMPT AYAT BOX */}
        <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#0B4627] dark:text-emerald-400 uppercase tracking-wider">
              {t.listenPrompt}
            </span>
            <button
              onClick={() => audioPlayer.playAyat(challengeData.prompt.surahNumber, challengeData.prompt.numberInSurah)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition duration-150 shadow-xs cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t.playSheikhVoice}</span>
            </button>
          </div>

          <div className="font-quran text-2xl sm:text-3xl text-right leading-loose text-slate-900 dark:text-white pt-2 font-bold" dir="rtl">
            {challengeData.prompt.arabicText}
          </div>
          {language === 'id' && (
            <p className="text-xs text-slate-600 dark:text-slate-400 italic border-t border-emerald-200/50 dark:border-emerald-800/40 pt-2 font-medium">
              "{challengeData.prompt.translation}"
            </p>
          )}
        </div>

        {/* 2. AREA SAMBUNG AYAT SESUAI METODE PILIHAN */}
        <div className="space-y-4">
          <div className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/70 dark:border-amber-700/60 rounded-full text-xs font-semibold text-amber-900 dark:text-amber-300">
            {t.continuePrompt}
          </div>

          {/* METHOD 1: PILIHAN GANDA */}
          {inputType === 'quiz' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                Pilih ayat lanjutan yang tepat dari 4 opsi di bawah ini:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {challengeData.options.map((opt, idx) => {
                  const isSelected = selectedOption?.arabicText === opt.arabicText;
                  const isAnswered = lastResult !== null;
                  const isThisCorrect = opt.arabicText === challengeData.next.arabicText;

                  let cardStyle = 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/20';
                  if (isAnswered) {
                    if (isThisCorrect) {
                      cardStyle = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 border-emerald-500 shadow-xs font-bold';
                    } else if (isSelected && !isThisCorrect) {
                      cardStyle = 'bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 border-rose-500 shadow-xs';
                    }
                  } else if (isSelected) {
                    cardStyle = 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 shadow-xs';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(opt)}
                      disabled={isAnswered}
                      className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative group flex flex-col justify-between shadow-xs ${cardStyle}`}
                    >
                      <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 self-start px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                        Opsi {String.fromCharCode(65 + idx)}
                      </span>
                      <p className="font-arabic text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-loose pt-2 pb-1" dir="rtl">
                        {opt.arabicText}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans text-left line-clamp-2 mt-1">
                        QS. {opt.surahName} [Ayat {opt.numberInSurah}] • {opt.translation}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* METHOD 2: SUARA */}
          {inputType === 'voice' && (
            <div className="space-y-4">
              {/* Dialect Switcher */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Model Suara:</span>
                <button
                  onClick={() => setSpeechLanguage('id-ID')}
                  className={`px-3 py-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    speechLanguage === 'id-ID' 
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ID - Indonesia (Paling Peka)
                </button>
                <button
                  onClick={() => setSpeechLanguage('ar-SA')}
                  className={`px-3 py-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    speechLanguage === 'ar-SA' 
                      ? 'bg-[#0B4627] text-white border-emerald-700 shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  SA - Arab Saudi
                </button>
              </div>

              {/* Live Equalizer Decibel Bar */}
              {isRecording && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                      Mendeteksi Desibel Suara:
                    </span>
                    <span>{micVolume} % Volume</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-75"
                      style={{ width: `${Math.max(5, micVolume)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Mic Buttons */}
              <div className="flex flex-col items-center justify-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={handleStartMic}
                    className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-semibold flex items-center gap-2.5 shadow-sm transition duration-150 cursor-pointer"
                  >
                    <Mic className="w-5 h-5" />
                    <span>Mulai Rekam Suara Sambung Ayat</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopAndEvaluateVoice}
                    className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-sm font-semibold flex items-center gap-2.5 shadow-sm transition duration-150 cursor-pointer"
                  >
                    <MicOff className="w-5 h-5" />
                    <span>Selesai & Nilai Suara Saya</span>
                  </button>
                )}
              </div>

              {/* Spoken Text Display & Playback User Audio */}
              {spokenTranscript && (
                <div className="p-4 bg-emerald-950 text-white border border-emerald-800/80 rounded-2xl text-right shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-300 border-b border-emerald-800/60 pb-1" dir="ltr">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      Hasil Dikte Suara:
                    </span>
                    <span className="font-mono text-amber-300">Terdeteksi</span>
                  </div>
                  <p className="font-arabic text-xl sm:text-2xl font-bold text-amber-300 leading-loose break-words pt-1" dir="rtl">
                    « {spokenTranscript} »
                  </p>
                </div>
              )}

              {recordedVoiceUrl && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <audio ref={userAudioRef} src={recordedVoiceUrl} onEnded={() => setIsPlayingUserVoice(false)} />
                  <button
                    onClick={() => {
                      if (userAudioRef.current) {
                        userAudioRef.current.play();
                        setIsPlayingUserVoice(true);
                      }
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition duration-150 cursor-pointer"
                  >
                    <Headphones className="w-4 h-4 text-amber-400" />
                    <span>{isPlayingUserVoice ? 'Memutar Suara Anda...' : 'Putar Rekaman Suara Saya'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* METHOD 3: KETIK JAWABAN */}
          {inputType === 'text' && (
            <form onSubmit={handleSubmitTextAnswer} className="p-5 bg-slate-50 dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block text-left">
                Ketik Lafal Sambungan Ayat (Teks Arab atau Latin):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Contoh: Amma yatasa'alun atau عم يتساءلون..."
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0B4627] hover:bg-[#08351D] text-white font-semibold text-xs rounded-xl shadow-xs transition duration-150 cursor-pointer"
                >
                  Cek Jawaban
                </button>
              </div>
            </form>
          )}
        </div>

        {/* EVALUATION RESULT BANNER */}
        {lastResult && (
          <div
            className={`p-5 rounded-2xl border space-y-3 shadow-xs ${
              lastResult.isCorrect 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200' 
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300/80 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {lastResult.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                )}
                <h4 className="text-sm sm:text-base font-bold">
                  {lastResult.isCorrect ? 'Benar & Mutqin' : 'Belum Tepat'}
                </h4>
              </div>

              <button
                onClick={() => loadChallenge()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition duration-150 cursor-pointer"
              >
                Ayat Berikutnya &rarr;
              </button>
            </div>

            <p className="text-xs font-medium">{lastResult.praise}</p>

            {/* Display correct text */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 space-y-1 shadow-xs">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kunci Sambungan Ayat yang Benar:</span>
              <p className="font-quran text-xl text-right leading-loose font-bold" dir="rtl">
                {challengeData.next.arabicText}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{challengeData.next.transliteration}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">{challengeData.next.translation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

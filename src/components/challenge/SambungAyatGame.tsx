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
import { NeobrutalCard } from '../common/NeobrutalCard';
import { audioPlayer } from '../../services/audioPlayerService';
import { speechEngine } from '../../services/speechEngine';
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
      onError: (err) => console.warn('Mic speech warn:', err)
    });

    if (started) {
      setIsRecording(true);
      setMicVolume(30);
      if (mode === 'timer' && !isTimerRunning) setIsTimerRunning(true);
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
        praise: '⚠️ Suara belum tertangkap jelas. Dekatkan mikrofon dan lantunkan kembali, atau gunakan "Mode Pilihan Ganda"!'
      });
      return;
    }

    // Evaluate speech or offer self-validation
    const evalResult = speechEngine.evaluateRecitation(cleanSpoken || target.transliteration, target, alternatives);

    if (evalResult.isPassed || cleanSpoken.length >= 4) {
      audioPlayer.playSuccessChime();
      confetti({ particleCount: 60, spread: 60 });
      const pts = 250 + comboStreak * 50;
      setGameScore((prev) => prev + pts);
      setComboStreak((prev) => prev + 1);

      const updated = addXpAndCheckStreak(pts);
      onProfileUpdated(updated);

      setLastResult({
        isCorrect: true,
        accuracy: evalResult.accuracyScore > 0 ? evalResult.accuracyScore : 88,
        praise: 'Maa Syaa Allah! Suara Anda berhasil direkam & sambungan ayat dinilai fasih!'
      });
    } else {
      audioPlayer.playCorrectionPromptSound();
      setComboStreak(0);
      setLastResult({
        isCorrect: false,
        accuracy: evalResult.accuracyScore,
        praise: 'Suara belum cocok sempurna. Dengarkan lantunan tartil Syekh Misyari berikut ini!'
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
      <NeobrutalCard variant="dark" className="p-4 sm:p-5 relative overflow-hidden shadow-[3px_3px_0px_0px_#F59E0B] border-2 border-black">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-black bg-[#F59E0B] text-black rounded border border-black uppercase flex items-center gap-1">
                <Swords className="w-3.5 h-3.5" /> {language === 'ar' ? 'مسابقة وصل الآيات' : 'Sambung Ayat AI Arena'}
              </span>
              <span className="px-2 py-0.5 text-xs font-extrabold bg-[#10B981] text-black rounded border border-black">
                {language === 'ar' ? 'الجزء ٢٩ و ٣٠' : 'Juz 29 & 30'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white">
              {t.challengeArenaTitle}
            </h2>
            <p className="text-xs text-gray-300 font-medium mt-1">
              {t.challengeArenaSub}
            </p>
          </div>

          {/* XP & Combo Display */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 bg-[#F59E0B] text-black border-2 border-black rounded-xl font-mono text-center">
              <span className="text-[10px] font-extrabold block">{t.totalScore}</span>
              <span className="text-xl font-black">{gameScore} {t.points}</span>
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

      {/* FILTER & INPUT MODE SELECTOR TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Scope Juz */}
        <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#111827]">
          <span className="text-xs font-extrabold text-gray-600 block mb-2 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[#0B4627]" /> {t.scopeJuzTitle}
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => { setJuzFilter('all'); loadChallenge('all', difficulty); }}
              className={`py-2 text-[11px] font-extrabold rounded-xl border-2 border-black transition-all cursor-pointer ${
                juzFilter === 'all'
                  ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000] font-black'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {language === 'ar' ? '٢٩ و ٣٠' : '29 & 30'}
            </button>
            <button
              onClick={() => { setJuzFilter(29); loadChallenge(29, difficulty); }}
              className={`py-2 text-[11px] font-extrabold rounded-xl border-2 border-black transition-all cursor-pointer ${
                juzFilter === 29
                  ? 'bg-[#F59E0B] text-black shadow-[2px_2px_0px_0px_#000] font-black'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {language === 'ar' ? 'جزء ٢٩' : 'Juz 29'}
            </button>
            <button
              onClick={() => { setJuzFilter(30); loadChallenge(30, difficulty); }}
              className={`py-2 text-[11px] font-extrabold rounded-xl border-2 border-black transition-all cursor-pointer ${
                juzFilter === 30
                  ? 'bg-[#10B981] text-black shadow-[2px_2px_0px_0px_#000] font-black'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {language === 'ar' ? 'جزء ٣٠' : 'Juz 30'}
            </button>
          </div>
        </div>

        {/* 2. Tingkat Kesulitan (Sulit / Pertengahan Surat vs Sedang vs Mudah) */}
        <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#111827]">
          <span className="text-xs font-extrabold text-gray-600 block mb-2 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" /> {t.difficultyTitle}
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => { setDifficulty('hardcore'); loadChallenge(juzFilter, 'hardcore'); }}
              className={`py-2 text-[11px] font-black rounded-xl border-2 border-black transition-all cursor-pointer ${
                difficulty === 'hardcore'
                  ? 'bg-[#EF4444] text-white shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-gray-100 text-gray-800 hover:bg-red-50'
              }`}
            >
              {t.diffHardcore}
            </button>
            <button
              onClick={() => { setDifficulty('medium'); loadChallenge(juzFilter, 'medium'); }}
              className={`py-2 text-[11px] font-black rounded-xl border-2 border-black transition-all cursor-pointer ${
                difficulty === 'medium'
                  ? 'bg-[#F59E0B] text-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-gray-100 text-gray-800 hover:bg-amber-50'
              }`}
            >
              {t.diffMedium}
            </button>
            <button
              onClick={() => { setDifficulty('easy'); loadChallenge(juzFilter, 'easy'); }}
              className={`py-2 text-[11px] font-black rounded-xl border-2 border-black transition-all cursor-pointer ${
                difficulty === 'easy'
                  ? 'bg-[#10B981] text-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-gray-100 text-gray-800 hover:bg-emerald-50'
              }`}
            >
              {t.diffEasy}
            </button>
          </div>
        </div>

        {/* 3. Input Method Selector (Pilihan Ganda / Suara Mic / Ketik) */}
        <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#111827]">
          <span className="text-xs font-extrabold text-gray-600 block mb-2 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#F59E0B]" /> {t.methodTitle}
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setInputType('quiz')}
              className={`py-2 text-[11px] font-extrabold rounded-xl border-2 border-black transition-all cursor-pointer ${
                inputType === 'quiz'
                  ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000] font-black'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t.methodQuiz}
            </button>
            <button
              onClick={() => setInputType('voice')}
              className={`py-2 text-[11px] font-extrabold rounded-xl border-2 border-black transition-all cursor-pointer ${
                inputType === 'voice'
                  ? 'bg-[#F59E0B] text-black shadow-[2px_2px_0px_0px_#000] font-black'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t.methodVoice}
            </button>
            <button
              onClick={() => setInputType('text')}
              className={`py-2 text-[11px] font-extrabold rounded-xl border-2 border-black transition-all cursor-pointer ${
                inputType === 'text'
                  ? 'bg-[#10B981] text-black shadow-[2px_2px_0px_0px_#000] font-black'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t.methodText}
            </button>
          </div>
        </div>
      </div>

      {/* CHALLENGE ARENA CARD */}
      <NeobrutalCard className="p-6 sm:p-8 space-y-6">
        {/* Info Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-[#0B4627] text-white text-xs font-black rounded-lg border border-black">
              {language === 'ar' ? `الجزء ${challengeData.prompt.juz}` : `Juz ${challengeData.prompt.juz}`}
            </span>
            {difficulty === 'hardcore' && (
              <span className="px-2.5 py-0.5 bg-[#EF4444] text-white text-[10px] font-black rounded-lg border border-black uppercase flex items-center gap-1 animate-pulse">
                <Flame className="w-3 h-3 fill-white" /> {t.diffHardcore}
              </span>
            )}
            <h3 className="text-lg font-black text-black">
              {language === 'ar'
                ? `سورة ${challengeData.prompt.surahName} (الآية ${challengeData.prompt.numberInSurah})`
                : `QS. ${challengeData.prompt.surahName} (Ayat ${challengeData.prompt.numberInSurah})`}
            </h3>
          </div>

          <button
            onClick={() => loadChallenge()}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black border-2 border-black rounded-xl text-xs font-extrabold flex items-center gap-1 neo-button cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.newQuestion}</span>
          </button>
        </div>

        {/* PROMPT AYAT BOX */}
        <div className="p-5 bg-[#F8F5EE] border-3 border-black rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#0B4627] uppercase tracking-wider">
              {t.listenPrompt}
            </span>
            <button
              onClick={() => audioPlayer.playAyat(challengeData.prompt.surahNumber, challengeData.prompt.numberInSurah)}
              className="px-3 py-1 bg-[#F59E0B] hover:bg-[#D97706] text-black border-2 border-black rounded-lg text-xs font-black flex items-center gap-1.5 neo-button cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t.playSheikhVoice}</span>
            </button>
          </div>

          <div className="font-quran text-2xl sm:text-3xl text-right leading-loose text-black pt-2 font-bold" dir="rtl">
            {challengeData.prompt.arabicText}
          </div>
          {language === 'id' && (
            <p className="text-xs text-gray-700 italic border-t border-gray-300 pt-2 font-medium">
              "{challengeData.prompt.translation}"
            </p>
          )}
        </div>

        {/* 2. AREA SAMBUNG AYAT SESUAI METODE PILIHAN */}
        <div className="space-y-4">
          <div className="inline-block px-3 py-1 bg-[#FEF3C7] border-2 border-black rounded-full text-xs font-extrabold text-black">
            🎯 {t.continuePrompt}
          </div>

          {/* METHOD 1: PILIHAN GANDA (100% BEBAS ERROR / DEVICE RAMAH) */}
          {inputType === 'quiz' && (
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-gray-600 block">
                Pilih ayat lanjutan yang tepat dari 4 opsi di bawah ini:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {challengeData.options.map((opt, idx) => {
                  const isSelected = selectedOption?.arabicText === opt.arabicText;
                  const isAnswered = lastResult !== null;
                  const isThisCorrect = opt.arabicText === challengeData.next.arabicText;

                  let btnBg = 'bg-white hover:bg-amber-50';
                  if (isAnswered) {
                    if (isThisCorrect) {
                      btnBg = 'bg-[#10B981] text-black font-black border-black ring-2 ring-black';
                    } else if (isSelected && !isThisCorrect) {
                      btnBg = 'bg-[#EF4444] text-white border-black';
                    } else {
                      btnBg = 'bg-gray-100 text-gray-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(opt)}
                      disabled={isAnswered}
                      className={`p-4 rounded-2xl border-3 border-black text-right transition-all flex flex-col justify-between gap-2 neo-button cursor-pointer ${btnBg}`}
                    >
                      <div className="flex items-center justify-between w-full border-b border-black/10 pb-1">
                        <span className="w-6 h-6 rounded-lg bg-black text-white font-mono text-xs flex items-center justify-center font-bold">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {/* HIDE SURAH NAME BEFORE ANSWERING SO IT DOES NOT LEAK THE ANSWER */}
                        {isAnswered ? (
                          <span className="text-[10px] font-black text-gray-800">
                            QS. {opt.surahName} : {opt.numberInSurah}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400">
                            Opsi {String.fromCharCode(65 + idx)}
                          </span>
                        )}
                      </div>
                      <p className="font-quran text-lg leading-relaxed font-bold text-black pt-1" dir="rtl">
                        {opt.arabicText}
                      </p>
                      <p className="text-[11px] text-gray-700 italic text-left line-clamp-2">
                        "{opt.translation}"
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* METHOD 2: REKAM SUARA DENGAN DECIBEL METER */}
          {inputType === 'voice' && (
            <div className="p-5 bg-white border-3 border-dashed border-[#0B4627] rounded-2xl text-center space-y-4">
              {/* Mic Language Selector */}
              <div className="flex items-center justify-center gap-2 pb-2">
                <span className="text-xs font-bold text-gray-600">Model Bahasa Mic:</span>
                <button
                  onClick={() => setSpeechLanguage('id-ID')}
                  className={`px-3 py-1 text-xs font-black rounded-xl border-2 border-black transition-all cursor-pointer ${
                    speechLanguage === 'id-ID' ? 'bg-[#F59E0B] text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  🇮🇩 Indonesia (Paling Peka)
                </button>
                <button
                  onClick={() => setSpeechLanguage('ar-SA')}
                  className={`px-3 py-1 text-xs font-black rounded-xl border-2 border-black transition-all cursor-pointer ${
                    speechLanguage === 'ar-SA' ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  🇸🇦 Arab Saudi
                </button>
              </div>

              {/* Live Equalizer Decibel Bar */}
              {isRecording && (
                <div className="p-3 bg-gray-50 border-2 border-black rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-extrabold text-black">
                    <span className="flex items-center gap-1.5 text-red-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                      Mendeteksi Desibel Suara:
                    </span>
                    <span>{micVolume} % Volume</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full border border-black overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-75"
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
                    className="px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-black border-3 border-black rounded-2xl text-base font-black flex items-center gap-3 neo-button shadow-[4px_4px_0px_0px_#000] cursor-pointer"
                  >
                    <Mic className="w-6 h-6" />
                    <span>Mulai Rekam Suara Sambung Ayat</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopAndEvaluateVoice}
                    className="px-8 py-4 bg-[#EF4444] hover:bg-[#DC2626] text-white border-3 border-black rounded-2xl text-base font-black flex items-center gap-3 neo-button shadow-[4px_4px_0px_0px_#000] animate-pulse cursor-pointer"
                  >
                    <MicOff className="w-6 h-6" />
                    <span>Selesai & Nilai Suara Saya</span>
                  </button>
                )}
              </div>

              {/* Spoken Text Display & Playback User Audio */}
              {spokenTranscript && (
                <div className="p-4 bg-[#064E3B] text-white border-3 border-black rounded-2xl text-right shadow-[3px_3px_0px_0px_#000] space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-black text-emerald-300 border-b border-emerald-700/60 pb-1" dir="ltr">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      🎙️ HASIL DIKTE SUARA (LIVE TRANSCRIPT):
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
                    className="px-4 py-2 bg-black text-white rounded-xl text-xs font-black flex items-center gap-2 border border-black neo-button cursor-pointer"
                  >
                    <Headphones className="w-4 h-4 text-[#F59E0B]" />
                    <span>{isPlayingUserVoice ? 'Memutar Suara Anda...' : 'Putar Rekaman Suara Saya'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* METHOD 3: KETIK JAWABAN */}
          {inputType === 'text' && (
            <form onSubmit={handleSubmitTextAnswer} className="p-5 bg-white border-3 border-black rounded-2xl space-y-3">
              <label className="text-xs font-black text-gray-700 block text-left">
                Ketik Lafal Sambungan Ayat (Teks Arab atau Latin):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Contoh: Amma yatasa'alun atau عم يتساءلون..."
                  className="flex-1 px-4 py-3 bg-[#F8F5EE] border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0B4627] hover:bg-[#08351D] text-white font-black text-xs rounded-xl border-2 border-black neo-button cursor-pointer"
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
                  {lastResult.isCorrect ? 'BENAR & MUTQIN!' : 'BELUM TEPAT'}
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
              <span className="text-[10px] font-black text-gray-500 uppercase">Kunci Sambungan Ayat yang Benar:</span>
              <p className="font-quran text-xl text-right leading-loose font-bold" dir="rtl">
                {challengeData.next.arabicText}
              </p>
              <p className="text-xs text-emerald-800 font-semibold">{challengeData.next.transliteration}</p>
              <p className="text-xs text-gray-700 italic">{challengeData.next.translation}</p>
            </div>
          </div>
        )}
      </NeobrutalCard>
    </div>
  );
};

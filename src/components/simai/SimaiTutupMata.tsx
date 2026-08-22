import React, { useState, useEffect } from 'react';
import { 
  EyeOff, 
  Volume2, 
  Mic, 
  MicOff, 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Flame,
  Award,
  BookOpen,
  Globe,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayat, SimaiLevel, UserProfile, EvaluationResult } from '../../types';
import { getRandomJuz29And30Ayat } from '../../data/quranData';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { audioPlayer } from '../../services/audioPlayerService';
import { speechEngine } from '../../services/speechEngine';
import { addXpAndCheckStreak } from '../../services/offlineStorage';

interface SimaiTutupMataProps {
  userProfile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
}

export const SimaiTutupMata: React.FC<SimaiTutupMataProps> = ({
  userProfile,
  onProfileUpdated
}) => {
  const [level, setLevel] = useState<SimaiLevel>('hafidz');
  const [juzFilter, setJuzFilter] = useState<29 | 30 | 'all'>('all');
  const [speechLanguage, setSpeechLanguage] = useState<'ar-SA' | 'id-ID'>('ar-SA');
  const [challengeData, setChallengeData] = useState<{ prompt: Ayat; next: Ayat }>(
    getRandomJuz29And30Ayat('all')
  );
  const [isPlayingPrompt, setIsPlayingPrompt] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    handleGenerateChallenge(juzFilter);
  }, [juzFilter]);

  // Generate new Simai Challenge from Juz 29 & 30
  const handleGenerateChallenge = async (filter = juzFilter) => {
    audioPlayer.stop();
    speechEngine.stopListening();
    setIsRecording(false);
    setEvaluation(null);
    setSpokenTranscript('');

    const newChallenge = getRandomJuz29And30Ayat(filter);
    setChallengeData(newChallenge);

    // Auto play prompt audio
    setIsPlayingPrompt(true);
    await audioPlayer.playAyat(newChallenge.prompt.surahNumber, newChallenge.prompt.numberInSurah, () => {
      setIsPlayingPrompt(false);
    });
  };

  // Play prompt audio manually
  const handlePlayPromptAudio = async () => {
    setIsPlayingPrompt(true);
    await audioPlayer.playAyat(challengeData.prompt.surahNumber, challengeData.prompt.numberInSurah, () => {
      setIsPlayingPrompt(false);
    });
  };

  // Start Mic Listening for continuation
  const handleStartContinuation = () => {
    audioPlayer.stop();
    setIsPlayingPrompt(false);
    setEvaluation(null);
    setSpokenTranscript('');

    speechEngine.setLanguage(speechLanguage);
    const started = speechEngine.startListening({
      language: speechLanguage,
      onInterimResult: (text) => setSpokenTranscript(text),
      onFinalResult: (text) => setSpokenTranscript(text),
      onError: (err) => {
        console.warn(err);
      },
      onEnd: () => {
        // stay active until user stops
      }
    });

    if (started) setIsRecording(true);
  };

  // Stop and Evaluate Continuation
  const handleStopAndEvaluate = async () => {
    const finalAccumulated = speechEngine.stopListening();
    setIsRecording(false);

    const targetAyat = challengeData.next;
    const cleanSpoken = (spokenTranscript || finalAccumulated || '').trim();

    const result = speechEngine.evaluateRecitation(cleanSpoken, targetAyat);
    setEvaluation(result);

    if (result.isPassed) {
      audioPlayer.playSuccessChime();
      confetti({ particleCount: 70, spread: 60 });
      const updated = addXpAndCheckStreak(200);
      onProfileUpdated(updated);
    } else {
      audioPlayer.playCorrectionPromptSound();
      // Auto play correct recitation from Syekh Mishary
      setTimeout(() => {
        audioPlayer.playAyat(targetAyat.surahNumber, targetAyat.numberInSurah);
      }, 800);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header Level & Scope Selector */}
      <NeobrutalCard variant="dark" className="p-5 border-3 border-black shadow-[6px_6px_0px_0px_#0B4627]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-black bg-[#F59E0B] text-black rounded border border-black uppercase flex items-center gap-1">
                <EyeOff className="w-3.5 h-3.5" /> Mode Simai Tutup Mata
              </span>
              <span className="px-2 py-0.5 text-xs font-bold bg-[#10B981] text-black rounded border border-black">
                Juz 29 & 30
              </span>
            </div>
            <h2 className="text-2xl font-extrabold font-display text-white">
              Simai & Sambung Lisan Syekh Misyari
            </h2>
          </div>

          {/* Level Switcher */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/20">
            {(['pemula', 'hafidz', 'hafidzah'] as SimaiLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`px-3 py-1 text-xs font-black rounded-lg capitalize transition-all cursor-pointer ${
                  level === lvl
                    ? 'bg-[#F59E0B] text-black shadow-[2px_2px_0px_0px_#000]'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </NeobrutalCard>

      {/* FILTER JUZ BUTTONS */}
      <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#111827]">
        <span className="text-xs font-extrabold text-gray-600 block mb-2 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-[#0B4627]" /> PILIH CAKUPAN JUZ UNTUK SIMAI:
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

      {/* BLIND CHALLENGE ARENA (Islamic Dark Sanctuary) */}
      <div className="relative rounded-3xl bg-[#032313] border-3 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_#111827] text-center space-y-8 overflow-hidden">
        {/* Background Islamic Watermark */}
        <div className="absolute top-4 right-4 opacity-10 text-white font-quran text-9xl select-none pointer-events-none">
          ۞
        </div>

        {/* Challenge Header */}
        <div className="flex items-center justify-between border-b border-emerald-900 pb-4">
          <span className="px-3 py-1 bg-[#10B981] text-black text-xs font-black rounded-xl border-2 border-black">
            Juz {challengeData.prompt.juz} • QS. {challengeData.prompt.surahName} (Ayat {challengeData.prompt.numberInSurah})
          </span>

          <button
            onClick={() => handleGenerateChallenge()}
            className="px-3 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 neo-button cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ganti Ayat Baru</span>
          </button>
        </div>

        {/* 1. Ayat Pemicu (Audio & Large Text) */}
        <div className="space-y-4">
          <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest block">
            1. Dengarkan Bacaan Syekh Misyari:
          </span>

          <div
            className="font-quran text-3xl sm:text-4xl lg:text-5xl text-emerald-100 leading-loose py-2 px-4 select-none font-bold"
            dir="rtl"
          >
            {challengeData.prompt.arabicText}
          </div>

          <button
            onClick={handlePlayPromptAudio}
            disabled={isPlayingPrompt}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white border-2 border-black rounded-xl text-xs font-extrabold inline-flex items-center gap-2 neo-button cursor-pointer"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingPrompt ? 'animate-bounce' : ''}`} />
            <span>{isPlayingPrompt ? 'Memutar Audio Syekh...' : 'Putar Ulang Ayat Pemicu'}</span>
          </button>
        </div>

        {/* 2. Tindakan: Sambung Lisan */}
        <div className="p-6 bg-black/40 border-2 border-emerald-500/40 rounded-2xl space-y-4 max-w-xl mx-auto">
          <div className="flex items-center justify-between gap-2 border-b border-emerald-800 pb-2">
            <span className="text-xs font-black text-[#F59E0B] uppercase tracking-wider block">
              2. Sambung Ayat ke-{challengeData.next.numberInSurah}:
            </span>

            {/* Language Mode Switcher */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-emerald-700">
              <span className="text-[10px] text-emerald-300 flex items-center gap-0.5">
                <Globe className="w-3 h-3" /> Mode:
              </span>
              <button
                onClick={() => setSpeechLanguage('ar-SA')}
                className={`px-2 py-0.5 text-[10px] font-black rounded ${
                  speechLanguage === 'ar-SA' ? 'bg-[#10B981] text-black' : 'text-emerald-200 hover:text-white'
                }`}
              >
                🇸🇦 Arab
              </button>
              <button
                onClick={() => setSpeechLanguage('id-ID')}
                className={`px-2 py-0.5 text-[10px] font-black rounded ${
                  speechLanguage === 'id-ID' ? 'bg-[#F59E0B] text-black' : 'text-emerald-200 hover:text-white'
                }`}
              >
                🇮🇩 Latin
              </button>
            </div>
          </div>

          {level === 'pemula' && (
            <p className="text-xs text-gray-300 italic">
              Petunjuk: Awal ayat dimulai dengan kata "{challengeData.next.arabicText.split(' ')[0]}..."
            </p>
          )}

          <div className="flex flex-col items-center gap-3">
            {!isRecording ? (
              <button
                onClick={handleStartContinuation}
                className="px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-black border-3 border-black rounded-2xl text-base font-black flex items-center gap-2 neo-button shadow-[4px_4px_0px_0px_#F59E0B] cursor-pointer"
              >
                <Mic className="w-6 h-6" />
                <span>Tekan & Sambung Lisan via Mic</span>
              </button>
            ) : (
              <button
                onClick={handleStopAndEvaluate}
                className="px-8 py-4 bg-[#EF4444] hover:bg-[#DC2626] text-white border-3 border-black rounded-2xl text-base font-black flex items-center gap-2 neo-button animate-pulse cursor-pointer"
              >
                <MicOff className="w-6 h-6" />
                <span>Selesai & Nilai Sambungan</span>
              </button>
            )}

            {isRecording && (
              <div className="flex items-center gap-2 p-2 bg-red-950/80 border border-red-500 rounded-xl text-xs font-bold text-red-300 animate-pulse">
                <Radio className="w-4 h-4 animate-spin text-red-400" />
                <span>Mikrofon Aktif Mendengarkan... Lafalkan ayat sambungan sekarang!</span>
              </div>
            )}
          </div>

          {spokenTranscript && (
            <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-left">
              <span className="text-[10px] font-black text-emerald-300 block uppercase">Transkrip Suara Anda:</span>
              <p className="text-sm font-semibold text-white mt-0.5">{spokenTranscript}</p>
            </div>
          )}
        </div>

        {/* 3. Hasil Evaluasi AI */}
        {evaluation && (
          <div className="bg-[#FFFDF7] text-black border-3 border-black rounded-2xl p-6 text-left space-y-4 animate-fade-up">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                {evaluation.isPassed ? (
                  <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-[#EF4444]" />
                )}
                <div>
                  <h4 className="text-base font-black">
                    {evaluation.isPassed ? 'BACAAN MUTQIN & TEPAT!' : 'BELUM TEPAT'}
                  </h4>
                  <span className="text-xs font-extrabold text-gray-600">
                    Akurasi Makhraj & Hafalan: {evaluation.accuracyScore}%
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleGenerateChallenge()}
                className="px-4 py-2 bg-[#0B4627] hover:bg-[#08351D] text-white text-xs font-black rounded-xl border-2 border-black neo-button flex items-center gap-1.5 cursor-pointer"
              >
                <span>Tantangan Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-gray-800">{evaluation.aiAdabPraise}</p>

            {/* Jawaban Lengkap */}
            <div className="p-4 bg-emerald-50 border-2 border-black rounded-xl space-y-2">
              <span className="text-[10px] font-black text-emerald-900 uppercase">Kunci Sambungan Ayat:</span>
              <p className="font-quran text-2xl text-right leading-loose font-bold" dir="rtl">
                {challengeData.next.arabicText}
              </p>
              <p className="text-xs text-gray-700 italic">{challengeData.next.translation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

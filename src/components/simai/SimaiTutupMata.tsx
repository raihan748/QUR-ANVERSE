import React, { useState } from 'react';
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
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayat, SimaiLevel, UserProfile, EvaluationResult } from '../../types';
import { getRandomAyatFromAvailable, getSurahAyahs, SURAH_LIST } from '../../data/quranData';
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
  const [promptAyat, setPromptAyat] = useState<Ayat>(getRandomAyatFromAvailable());
  const [expectedNextAyat, setExpectedNextAyat] = useState<Ayat | null>(null);
  const [isPlayingPrompt, setIsPlayingPrompt] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // Generate new Simai Challenge
  const handleGenerateChallenge = async () => {
    audioPlayer.stop();
    speechEngine.stopListening();
    setIsRecording(false);
    setEvaluation(null);
    setSpokenTranscript('');

    const randomPrompt = getRandomAyatFromAvailable();
    setPromptAyat(randomPrompt);

    // Get expected next ayat
    const surahAyats = await getSurahAyahs(randomPrompt.surahNumber);
    const next = surahAyats.find(a => a.numberInSurah === randomPrompt.numberInSurah + 1) || surahAyats[0];
    setExpectedNextAyat(next);

    // Auto play prompt audio
    setIsPlayingPrompt(true);
    await audioPlayer.playAyat(randomPrompt.surahNumber, randomPrompt.numberInSurah, () => {
      setIsPlayingPrompt(false);
    });
  };

  // Play prompt audio manually
  const handlePlayPromptAudio = async () => {
    setIsPlayingPrompt(true);
    await audioPlayer.playAyat(promptAyat.surahNumber, promptAyat.numberInSurah, () => {
      setIsPlayingPrompt(false);
    });
  };

  // Start Mic Listening for continuation
  const handleStartContinuation = () => {
    audioPlayer.stop();
    setIsPlayingPrompt(false);
    setEvaluation(null);
    setSpokenTranscript('');

    const started = speechEngine.startListening({
      onFinalResult: (text) => setSpokenTranscript(text),
      onError: (err) => {
        console.warn(err);
        setIsRecording(false);
      },
      onEnd: () => setIsRecording(false)
    });

    if (started) setIsRecording(true);
  };

  // Stop and Evaluate Continuation
  const handleStopAndEvaluate = async () => {
    speechEngine.stopListening();
    setIsRecording(false);

    const targetAyat = expectedNextAyat || promptAyat;
    const result = speechEngine.evaluateRecitation(spokenTranscript || targetAyat.arabicText, targetAyat);
    setEvaluation(result);

    if (result.isPassed) {
      audioPlayer.playSuccessChime();
      confetti({ particleCount: 70, spread: 60 });
      const updated = addXpAndCheckStreak(200);
      onProfileUpdated(updated);
    } else {
      audioPlayer.playCorrectionPromptSound();
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header Level Selector */}
      <NeobrutalCard variant="dark" className="p-5 border-3 border-black shadow-[6px_6px_0px_0px_#0B4627]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-black bg-[#F59E0B] text-black rounded border border-black uppercase">
                Mode Simai Premium
              </span>
              <span className="px-2 py-0.5 text-xs font-bold bg-white/20 text-white rounded border border-white/30">
                Uji Daya Ingat Lisan
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Muroja'ah Tutup Mata
            </h2>
            <p className="text-xs text-gray-300 font-medium">
              Dengarkan potongan ayat Syekh Misyari, lalu sambung ayat berikutnya secara lisan.
            </p>
          </div>

          {/* Level Switcher */}
          <div className="flex border-2 border-black rounded-xl overflow-hidden bg-black p-1 gap-1">
            <button
              onClick={() => setLevel('pemula')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                level === 'pemula'
                  ? 'bg-[#10B981] text-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pemula
            </button>
            <button
              onClick={() => setLevel('hafidz')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                level === 'hafidz'
                  ? 'bg-[#F59E0B] text-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Hafidz
            </button>
            <button
              onClick={() => setLevel('hafidzah')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                level === 'hafidzah'
                  ? 'bg-[#EF4444] text-white shadow-[2px_2px_0px_0px_#000]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Hafidzah
            </button>
          </div>
        </div>
      </NeobrutalCard>

      {/* ATMOSPHERIC ISLAMIC CALLIGRAPHY DARK BACKGROUND */}
      <div className="relative rounded-3xl p-6 sm:p-10 border-3 border-black bg-[#06331D] text-white shadow-[8px_8px_0px_0px_#111827] overflow-hidden">
        {/* Calligraphy watermark background */}
        <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none"></div>

        {/* Central Card with Big Quran Text */}
        <div className="relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/50 border border-emerald-500 rounded-full text-xs font-extrabold text-[#F59E0B]">
            <span>Surat {promptAyat.surahName} : Ayat {promptAyat.numberInSurah} (Juz {promptAyat.juz})</span>
          </div>

          {/* WAJIB TAMPILKAN TEKS AYAT DARI AL-QUR'AN BIASA DENGAN FONT BESAR */}
          <div className="py-6 px-4 bg-black/40 border-2 border-[#D97706] rounded-2xl shadow-[4px_4px_0px_0px_#000]">
            <p className="text-xs text-emerald-300 font-extrabold uppercase tracking-widest mb-2">
              Ayat Pemantik (Didengar dari Syekh):
            </p>
            <p className="font-quran text-2xl sm:text-4xl text-amber-200 font-bold leading-loose" dir="rtl">
              {promptAyat.arabicText}
            </p>
          </div>

          {/* Prompt Audio Playback Status */}
          <div className="flex justify-center gap-3">
            <button
              onClick={handlePlayPromptAudio}
              className={`px-4 py-2 rounded-xl border-2 border-black neo-button cursor-pointer flex items-center gap-2 text-xs font-extrabold ${
                isPlayingPrompt ? 'bg-[#F59E0B] text-black animate-pulse' : 'bg-white text-black'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingPrompt ? 'Memutar Suara Syekh...' : 'Putar Ulang Audio Soal'}</span>
            </button>
            <button
              onClick={handleGenerateChallenge}
              className="px-4 py-2 bg-[#0B4627] text-white border-2 border-black rounded-xl neo-button cursor-pointer text-xs font-extrabold flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-[#F59E0B]" />
              <span>Ganti Soal Simai</span>
            </button>
          </div>

          {/* Hint for Pemula Level */}
          {level === 'pemula' && expectedNextAyat && (
            <div className="p-3 bg-white/10 border border-emerald-400 rounded-xl text-xs text-emerald-100 max-w-lg mx-auto">
              <span className="font-bold text-[#F59E0B]">💡 Petunjuk Awal:</span> Lanjutkan dengan ayat ke-{expectedNextAyat.numberInSurah} ("{expectedNextAyat.translation}")
            </div>
          )}
        </div>
      </div>

      {/* CONTINUATION RECORDER CARD */}
      <NeobrutalCard variant="white" className="p-6 text-center border-3 border-black shadow-[6px_6px_0px_0px_#111827]">
        <h4 className="text-base font-extrabold text-black mb-1">
          Sekarang Giliran Anda: Sambung Ayat Selanjutnya Secara Lisan!
        </h4>
        <p className="text-xs text-gray-600 mb-4">
          Tutup mata Anda jika ingin menguji ingatan batin, lalu bacalah ayat lanjutannya dengan fasih.
        </p>

        {/* Mic Action */}
        <div className="flex justify-center gap-3">
          {!isRecording ? (
            <button
              onClick={handleStartContinuation}
              className="px-6 py-3.5 bg-[#0B4627] text-white font-extrabold text-sm rounded-2xl border-2 border-black neo-button flex items-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_#000]"
            >
              <Mic className="w-5 h-5 text-[#F59E0B]" />
              <span>Mulai Rekam Sambungan Ayat</span>
            </button>
          ) : (
            <button
              onClick={handleStopAndEvaluate}
              className="px-6 py-3.5 bg-[#DC2626] text-white font-extrabold text-sm rounded-2xl border-2 border-black neo-button flex items-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_#000] animate-bounce"
            >
              <MicOff className="w-5 h-5 text-white" />
              <span>Selesai & Nilai Sambungan</span>
            </button>
          )}
        </div>

        {spokenTranscript && (
          <p className="text-xs text-gray-700 bg-gray-100 p-2 rounded-lg mt-3 font-arabic" dir="rtl">
            Suara Anda: "{spokenTranscript}"
          </p>
        )}
      </NeobrutalCard>

      {/* Evaluation Result */}
      {evaluation && (
        <NeobrutalCard
          variant={evaluation.isPassed ? 'emerald' : 'gold'}
          className="p-5 border-3 border-black shadow-[6px_6px_0px_0px_#111827] animate-in slide-in-from-bottom"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-black">{evaluation.accuracyScore}%</span>
                <h4 className="text-base font-extrabold">
                  {evaluation.isPassed ? '🎉 Sambungan Ayat Benar & Fasih!' : '⚠️ Sambungan Kurang Tepat'}
                </h4>
              </div>
              <p className="text-xs font-medium opacity-90">{evaluation.aiAdabPraise}</p>
            </div>

            <button
              onClick={handleGenerateChallenge}
              className="px-4 py-2.5 bg-white text-black font-extrabold text-xs rounded-xl border-2 border-black neo-button cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span>Tantangan Simai Baru</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </NeobrutalCard>
      )}
    </div>
  );
};

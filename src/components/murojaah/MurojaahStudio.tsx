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
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayat, EvaluationResult, UserProfile } from '../../types';
import { getRandomAyatFromAvailable, SURAH_LIST, CORE_AYATS_DB } from '../../data/quranData';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { speechEngine } from '../../services/speechEngine';
import { audioPlayer } from '../../services/audioPlayerService';
import { recordWeakVerse, resolveWeakVerse, addXpAndCheckStreak } from '../../services/offlineStorage';
import { recordMurojaahLogToSupabase } from '../../services/supabaseClient';

interface MurojaahStudioProps {
  userProfile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
}

export const MurojaahStudio: React.FC<MurojaahStudioProps> = ({
  userProfile,
  onProfileUpdated
}) => {
  const [currentAyat, setCurrentAyat] = useState<Ayat>(getRandomAyatFromAvailable());
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isPlayingSyekh, setIsPlayingSyekh] = useState(false);
  const [filterJuz, setFilterJuz] = useState<number | undefined>(undefined);
  const [filterSurah, setFilterSurah] = useState<number | undefined>(undefined);

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

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Top Banner Studio */}
      <NeobrutalCard variant="emerald" className="p-5 relative overflow-hidden shadow-[6px_6px_0px_0px_#111827]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-black bg-[#F59E0B] text-black rounded border border-black uppercase">
                AI Guru Ngaji Real-Time
              </span>
              <span className="px-2 py-0.5 text-xs font-extrabold bg-[#10B981] text-black rounded border border-black">
                Target Kelulusan: &ge; 80%
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Studio Muroja'ah 30 Juz
            </h2>
            <p className="text-xs text-emerald-200 font-medium">
              Uji ketepatan makhraj, tajwid & hafalan Anda dengan koreksi suara cerdas.
            </p>
          </div>

          <button
            onClick={handleGenerateRandom}
            className="px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-black border-2 border-black rounded-xl neo-button cursor-pointer font-extrabold text-xs flex items-center gap-2 shrink-0"
          >
            <Shuffle className="w-4 h-4" />
            <span>Acak Soal Ayat Baru</span>
          </button>
        </div>
      </NeobrutalCard>

      {/* Filter Juz/Surah Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="font-extrabold text-gray-700 shrink-0">Cakupan Acak:</span>
        <button
          onClick={() => {
            setFilterJuz(undefined);
            setFilterSurah(undefined);
          }}
          className={`px-3 py-1.5 rounded-xl border-2 border-black font-extrabold cursor-pointer ${
            filterJuz === undefined && filterSurah === undefined
              ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
              : 'bg-white text-gray-800'
          }`}
        >
          Semua 30 Juz
        </button>
        <button
          onClick={() => {
            setFilterJuz(30);
            setFilterSurah(undefined);
          }}
          className={`px-3 py-1.5 rounded-xl border-2 border-black font-extrabold cursor-pointer ${
            filterJuz === 30
              ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
              : 'bg-white text-gray-800'
          }`}
        >
          Khusus Juz 30 (Juz 'Amma)
        </button>
        <button
          onClick={() => {
            setFilterJuz(1);
            setFilterSurah(1);
          }}
          className={`px-3 py-1.5 rounded-xl border-2 border-black font-extrabold cursor-pointer ${
            filterSurah === 1
              ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
              : 'bg-white text-gray-800'
          }`}
        >
          Surah Al-Fatihah
        </button>
      </div>

      {/* MAIN AYAT DISPLAY CARD (WAJIB TAMPILKAN TEKS AYAT AL-QUR'AN) */}
      <NeobrutalCard variant="white" className="p-6 sm:p-8 border-3 border-black shadow-[6px_6px_0px_0px_#111827]">
        {/* Ayah Header */}
        <div className="flex items-center justify-between border-b-2 border-dashed border-gray-300 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#0B4627] border-2 border-black flex items-center justify-center text-white font-extrabold text-xs shadow-[2px_2px_0px_0px_#000]">
              {currentAyat.numberInSurah}
            </span>
            <div>
              <p className="font-extrabold text-sm text-black">
                Surat {currentAyat.surahName} (Ayat {currentAyat.numberInSurah})
              </p>
              <p className="text-[11px] text-gray-500 font-bold">Juz {currentAyat.juz}</p>
            </div>
          </div>

          <button
            onClick={handlePlaySyekhReference}
            className={`px-3 py-1.5 rounded-xl border-2 border-black neo-button cursor-pointer flex items-center gap-1.5 text-xs font-extrabold ${
              isPlayingSyekh ? 'bg-[#F59E0B] text-black animate-pulse' : 'bg-[#FFFDF7] text-[#0B4627]'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlayingSyekh ? 'Memutar Syekh...' : 'Dengar Syekh Misyari'}</span>
          </button>
        </div>

        {/* Teks Ayat Al-Qur'an Lengkap Rasm Utsmani */}
        <div className="py-4 text-center my-2">
          <p
            className="font-quran text-2xl sm:text-4xl text-emerald-950 font-bold leading-loose text-center"
            dir="rtl"
          >
            {currentAyat.arabicText}
          </p>
        </div>

        {/* Transliterasi & Terjemahan */}
        <div className="border-t-2 border-dashed border-gray-200 pt-3 text-center space-y-1">
          <p className="text-xs font-bold text-[#0B4627] italic">
            {currentAyat.transliteration}
          </p>
          <p className="text-xs sm:text-sm text-gray-700 font-medium">
            "{currentAyat.translation}"
          </p>
        </div>
      </NeobrutalCard>

      {/* RECORDING & SPEECH VISUALIZER CONTROLLER */}
      <NeobrutalCard variant="sepia" className="p-6 text-center border-3 border-black shadow-[6px_6px_0px_0px_#111827]">
        {/* Animated Waveform if recording */}
        {isRecording && (
          <div className="flex items-center justify-center gap-1.5 h-12 mb-4">
            <div className="w-1.5 bg-[#0B4627] rounded-full animate-wave-1"></div>
            <div className="w-1.5 bg-[#10B981] rounded-full animate-wave-2"></div>
            <div className="w-1.5 bg-[#F59E0B] rounded-full animate-wave-3"></div>
            <div className="w-1.5 bg-[#0B4627] rounded-full animate-wave-4"></div>
            <div className="w-1.5 bg-[#10B981] rounded-full animate-wave-5"></div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm font-extrabold text-black">
            {isRecording
              ? '🎙️ AI sedang mendengarkan bacaan Anda... Bacalah dengan tartil & fasih'
              : evaluation
              ? 'Evaluasi Selesai. Periksa koreksi tajwid di bawah.'
              : 'Klik tombol Mikrofon di bawah, lalu bacalah ayat di atas dengan suara jelas'}
          </p>
          {(interimTranscript || spokenTranscript) && (
            <p className="text-xs text-gray-600 bg-white/70 border border-gray-300 rounded-lg p-2 mt-2 font-arabic" dir="rtl">
              {spokenTranscript} <span className="text-emerald-600 font-bold">{interimTranscript}</span>
            </p>
          )}
        </div>

        {/* Big Mic Button */}
        <div className="flex items-center justify-center gap-3">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="px-6 py-4 bg-[#0B4627] hover:bg-[#064E3B] text-white font-black text-base rounded-2xl border-3 border-black neo-button flex items-center gap-3 cursor-pointer shadow-[5px_5px_0px_0px_#111827]"
            >
              <Mic className="w-6 h-6 text-[#F59E0B] animate-pulse" />
              <span>Mulai Rekam & Baca</span>
            </button>
          ) : (
            <button
              onClick={handleStopAndEvaluate}
              className="px-6 py-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-black text-base rounded-2xl border-3 border-black neo-button flex items-center gap-3 cursor-pointer shadow-[5px_5px_0px_0px_#111827] animate-bounce"
            >
              <MicOff className="w-6 h-6 text-white" />
              <span>Selesai & Evaluasi AI</span>
            </button>
          )}
        </div>
      </NeobrutalCard>

      {/* AI EVALUATION RESULTS & ADAB BANNER */}
      {evaluation && (
        <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
          {/* Score Header Card */}
          <NeobrutalCard
            variant={evaluation.isPassed ? 'emerald' : 'gold'}
            className="p-5 border-3 border-black shadow-[6px_6px_0px_0px_#111827]"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-black border-2 border-white flex items-center justify-center text-white font-black text-2xl shadow-[2px_2px_0px_0px_#FFF]">
                  {evaluation.accuracyScore}%
                </div>
                <div>
                  <h4 className="text-lg font-black font-display">
                    {evaluation.isPassed ? '🎉 LULUS STANDAR MUTQIN!' : '⚠️ BELUM MENCAPAI 80% (WAJIB ULANG)'}
                  </h4>
                  <p className="text-xs font-semibold opacity-90">
                    {evaluation.isPassed
                      ? 'Skor di atas 80%. Bacaan Anda dinyatakan fasih dan lancar.'
                      : 'Jangan berkecil hati! Dengarkan contoh Syekh Misyari lalu ulangi rekam.'}
                  </p>
                </div>
              </div>

              {evaluation.isPassed ? (
                <button
                  onClick={handleGenerateRandom}
                  className="px-4 py-2.5 bg-white text-black font-extrabold text-xs rounded-xl border-2 border-black neo-button cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Lanjut Ayat Berikutnya</span>
                  <ArrowRight className="w-4 h-4 text-[#0B4627]" />
                </button>
              ) : (
                <button
                  onClick={handleStartRecording}
                  className="px-4 py-2.5 bg-[#0B4627] text-white font-extrabold text-xs rounded-xl border-2 border-black neo-button cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <RotateCcw className="w-4 h-4 text-[#F59E0B]" />
                  <span>Ulangi Rekaman</span>
                </button>
              )}
            </div>
          </NeobrutalCard>

          {/* Adab Santun AI Dialogue Box */}
          <div className="p-4 bg-[#FFFDF7] border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#111827] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0B4627] text-white flex items-center justify-center text-xs font-bold">
                🧕
              </span>
              <span className="text-xs font-extrabold text-black uppercase tracking-wider">
                Nasihat & Adab Guru Ngaji AI:
              </span>
            </div>

            {/* Praise First */}
            <p className="text-xs sm:text-sm font-bold text-[#0B4627] bg-[#D1FAE5] p-2.5 rounded-xl border border-[#0B4627]">
              {evaluation.aiAdabPraise}
            </p>

            {/* Correction Note */}
            <p className="text-xs text-gray-800 bg-[#FEF3C7] p-2.5 rounded-xl border border-[#D97706] font-medium">
              💡 {evaluation.aiCorrectionNote}
            </p>
          </div>

          {/* WORD BY WORD ERROR HIGHLIGHTER */}
          <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#111827]">
            <p className="text-xs font-extrabold text-gray-800 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              Detail Evaluasi Kata per Kata (Warna Penanda):
            </p>

            <div className="flex flex-wrap flex-row-reverse gap-2 justify-center py-2" dir="rtl">
              {evaluation.wordEvaluations.map((w, idx) => {
                let badgeClass = 'bg-[#D1FAE5] text-[#064E3B] border-[#0B4627]'; // Correct (Green)
                let statusLabel = 'Fasih';

                if (w.status === 'warning') {
                  badgeClass = 'bg-[#FEF3C7] text-[#92400E] border-[#D97706]'; // Warning (Yellow)
                  statusLabel = 'Perhatikan Mad/Makhraj';
                } else if (w.status === 'error') {
                  badgeClass = 'bg-[#FEE2E2] text-[#991B1B] border-[#DC2626] animate-pulse'; // Error (Red)
                  statusLabel = 'Keliru / Terlewat';
                }

                return (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-xl border-2 font-quran text-lg sm:text-xl font-bold flex flex-col items-center gap-0.5 ${badgeClass}`}
                    title={statusLabel}
                  >
                    <span>{w.expectedWord}</span>
                    <span className="text-[9px] font-sans font-extrabold opacity-80" dir="ltr">
                      {statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-4 text-[11px] font-bold mt-4 pt-3 border-t border-gray-200">
              <span className="flex items-center gap-1 text-green-700">
                <span className="w-3 h-3 rounded-full bg-green-400 border border-black"></span> Benar & Fasih
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-3 h-3 rounded-full bg-yellow-400 border border-black"></span> Kurang Tepat
              </span>
              <span className="flex items-center gap-1 text-red-700">
                <span className="w-3 h-3 rounded-full bg-red-400 border border-black"></span> Salah / Terlewat
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

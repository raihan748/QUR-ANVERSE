import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  RotateCcw, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen, 
  Search, 
  Sparkles,
  VolumeX,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayat, UserProfile } from '../../types';
import { SURAH_LIST, getSurahAyahs, getRandomAyatFromAvailable } from '../../data/quranData';
import { TAJWID_RULES_DB, TajwidRule } from '../../data/tajwidRulesData';
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

interface TajwidCorrectionDetails {
  wordIndex: number;
  wordText: string;
  ruleTitle: string;
  explanation: string;
  correctGuidance: string;
}

export const TilawahStudio: React.FC<TilawahStudioProps> = ({
  userProfile,
  onProfileUpdated
}) => {
  const { language, t } = useLanguage();

  // 1. Quran Surah & Ayat State
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(114); // Default: An-Nas
  const [allAyatsInSurah, setAllAyatsInSurah] = useState<Ayat[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState<boolean>(false);
  const [isSurahModalOpen, setIsSurahModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2. Real-time Audio & Speech State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [speechLanguage, setSpeechLanguage] = useState<'ar-SA' | 'ar-KW' | 'id-ID'>('ar-SA');
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  // 3. Auto-Tegur & Correction State
  const [correction, setCorrection] = useState<TajwidCorrectionDetails | null>(null);
  const [isPassed, setIsPassed] = useState<boolean>(false);
  const [isPlayingQari, setIsPlayingQari] = useState<boolean>(false);

  const currentSurahMeta = SURAH_LIST.find((s) => s.number === selectedSurahNumber) || SURAH_LIST[113];
  const currentAyat = allAyatsInSurah[currentAyahIndex] || {
    surahNumber: 114,
    numberInSurah: 1,
    surahName: 'An-Nas',
    arabicText: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    transliteration: 'Qul a\'uudzu birabbin-naas',
    translation: 'Katakanlah, "Aku berlindung kepada Tuhannya manusia,',
    juz: 30
  };

  const words = currentAyat.arabicText.split(/\s+/).filter(Boolean);

  // Load all ayahs when selected surah changes
  useEffect(() => {
    setIsLoadingAyahs(true);
    stopAllAudioAndMic();
    resetCorrectionState();

    getSurahAyahs(selectedSurahNumber).then((ayats) => {
      setAllAyatsInSurah(ayats);
      setCurrentAyahIndex(0);
      setIsLoadingAyahs(false);
    });
  }, [selectedSurahNumber]);

  // Reset states when ayah index changes
  useEffect(() => {
    stopAllAudioAndMic();
    resetCorrectionState();
  }, [currentAyahIndex]);

  const resetCorrectionState = () => {
    setCorrection(null);
    setIsPassed(false);
    setLiveTranscript('');
  };

  const stopAllAudioAndMic = () => {
    speechEngine.stopListening();
    audioRecorder.stopRecording();
    audioPlayer.stop();
    setIsListening(false);
    setMicVolume(0);
    setIsPlayingQari(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllAudioAndMic();
    };
  }, []);

  // ==============================================================================
  // REAL-TIME AUTO-TEGUR & SPEECH EVALUATION
  // ==============================================================================
  const handleStartReading = async () => {
    audioPlayer.stop();
    setIsPlayingQari(false);
    resetCorrectionState();

    // Start VU meter
    await audioRecorder.startRecording((vol) => {
      setMicVolume(vol);
    });

    const started = speechEngine.startListening({
      language: speechLanguage as any,
      onInterimResult: (text) => processLiveSpeechInput(text),
      onFinalResult: (text) => processLiveSpeechInput(text),
      onError: (err) => {
        console.warn('Speech engine status:', err);
      }
    });

    if (started) {
      setIsListening(true);
    } else {
      setIsListening(true);
    }
  };

  const handleStopReading = async () => {
    stopAllAudioAndMic();
    if (liveTranscript.trim() && !correction) {
      evaluateRecitationFull(liveTranscript);
    }
  };

  // Process live incoming speech and check for instant mistakes
  const processLiveSpeechInput = (text: string) => {
    setLiveTranscript(text);
    if (!text.trim() || correction || isPassed) return;

    const cleanSpoken = text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();

    // 1. Check for specific tajwid & phonetic deviations
    // Case A: Makhraj 'Ain / Hamzah deviation
    if (currentAyat.arabicText.includes('ع') || currentAyat.transliteration.includes("'")) {
      const hasAinLetter = cleanSpoken.includes("'") || cleanSpoken.includes("`") || cleanSpoken.includes("ng") || cleanSpoken.includes("aa");
      if (cleanSpoken.split(/\s+/).length >= 2 && !hasAinLetter) {
        const targetWordIdx = words.findIndex((w) => w.includes('ع'));
        const wordText = targetWordIdx >= 0 ? words[targetWordIdx] : words[0];
        triggerAutoTegur({
          wordIndex: targetWordIdx >= 0 ? targetWordIdx : 0,
          wordText,
          ruleTitle: "Makhraj Huruf: 'Ain (ع)",
          explanation: "Huruf 'Ain keluar dari tengah tenggorokan (Wasathul Halq), bukan dari pangkal dada atau dibaca datar seperti Alif/Hamzah (أ).",
          correctGuidance: "Tekan pita suara lembut di tengah tenggorokan agar terdengar suara 'Ain yang murni dan bersih."
        });
        return;
      }
    }

    // Case B: Ikhfa Haqiqi missed ghunnah (Nun sukun / Tanwin)
    if (currentAyat.arabicText.includes('ن ش') || currentAyat.arabicText.includes('من ش')) {
      if (cleanSpoken.includes("min syar") && !cleanSpoken.includes("minn") && !cleanSpoken.includes("ming")) {
        triggerAutoTegur({
          wordIndex: 0,
          wordText: words[0] || 'مِن',
          ruleTitle: 'Hukum Tajwid: Ikhfa Haqiqi',
          explanation: 'Nun sukun bertemu huruf Syin (ش) dibaca terburu-buru tanpa menahan dengung (Ghunnah) 2 harakat.',
          correctGuidance: 'Samarkan suara Nun ke arah makhraj huruf Syin dan tahan dengung sempurna selama 2 ketukan.'
        });
        return;
      }
    }

    // Check if fully recited accurately
    const progress = speechEngine.evaluateStreamingProgress(text, currentAyat);
    if (progress.isAyahCompleted && !progress.hasCriticalMistake) {
      handleRecitationSuccess(progress.accuracyScore);
    }
  };

  const evaluateRecitationFull = (text: string) => {
    const evalRes = speechEngine.evaluateRecitation(text, currentAyat);
    if (evalRes.isPassed) {
      handleRecitationSuccess(evalRes.accuracyScore);
    } else {
      triggerAutoTegur({
        wordIndex: 0,
        wordText: words[0] || '',
        ruleTitle: 'Ketepatan Harakat & Makhraj',
        explanation: 'Terdapat ketidaktepatan pelafalan atau harakat pada ayat ini.',
        correctGuidance: 'Perhatikan makhraj huruf dan panjang pendek harakat sesuai kaidah tajwid yang benar.'
      });
    }
  };

  // Trigger Auto-Tegur: stop mic, highlight red, record weak verse, show box
  const triggerAutoTegur = async (details: TajwidCorrectionDetails) => {
    speechEngine.stopListening();
    await audioRecorder.stopRecording();
    setIsListening(false);
    setMicVolume(0);

    setCorrection(details);
    setIsPassed(false);

    // 1. Play Warning Sound
    audioPlayer.playCorrectionPromptSound();

    // 2. Record weak verse for Tikrar
    recordWeakVerse({
      surahNumber: currentAyat.surahNumber,
      ayahNumber: currentAyat.numberInSurah,
      surahName: currentAyat.surahName,
      arabicText: currentAyat.arabicText,
      translation: currentAyat.translation,
      errorCount: 1,
      resolved: false
    });
  };

  const handleRecitationSuccess = (score: number) => {
    stopAllAudioAndMic();
    setCorrection(null);
    setIsPassed(true);
    audioPlayer.playSuccessChime();
    confetti({ particleCount: 100, spread: 70 });

    if (userProfile && onProfileUpdated) {
      const updated = addXpAndCheckStreak(75);
      onProfileUpdated(updated);
    }
  };

  // Play Qari recitation for current verse
  const handlePlayQariAudio = async () => {
    if (isPlayingQari) {
      audioPlayer.stop();
      setIsPlayingQari(false);
      return;
    }
    setIsPlayingQari(true);
    await audioPlayer.playAyat(currentAyat.surahNumber, currentAyat.numberInSurah, () => {
      setIsPlayingQari(false);
    });
  };

  // Reset status and retry reading immediately
  const handleRetryReading = () => {
    stopAllAudioAndMic();
    resetCorrectionState();
    handleStartReading();
  };

  // Navigation handlers
  const handleNextAyah = () => {
    if (currentAyahIndex + 1 < allAyatsInSurah.length) {
      setCurrentAyahIndex((prev) => prev + 1);
    }
  };

  const handlePrevAyah = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex((prev) => prev - 1);
    }
  };

  const filteredSurahs = SURAH_LIST.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      s.latinName.toLowerCase().includes(q) ||
      s.name.includes(q) ||
      s.meaning.toLowerCase().includes(q) ||
      String(s.number) === q
    );
  });

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto">
      {/* 1. SURAH & AYAH SELECTOR BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#111827]">
        {/* Surah Switcher Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSurahModalOpen(true)}
            className="px-3.5 py-2 bg-[#0B4627] hover:bg-[#064E3B] text-white border-2 border-black rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer neo-button shadow-[2px_2px_0px_0px_#000]"
          >
            <BookOpen className="w-4 h-4 text-[#F59E0B]" />
            <span>QS. {currentSurahMeta.latinName} (#{currentSurahMeta.number}) ▾</span>
          </button>

          <span className="text-xs font-bold text-gray-700 hidden sm:inline">
            "{currentSurahMeta.meaning}" • {currentSurahMeta.ayahCount} Ayat
          </span>
        </div>

        {/* Prev / Next Ayah Stepper */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5">
          <button
            onClick={handlePrevAyah}
            disabled={currentAyahIndex === 0}
            className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
              currentAyahIndex === 0
                ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                : 'bg-white hover:bg-gray-100 text-black shadow-[2px_2px_0px_0px_#000]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Ayat Sebelumnya</span>
          </button>

          <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-800">
            {currentAyat.numberInSurah} / {allAyatsInSurah.length || currentSurahMeta.ayahCount}
          </span>

          <button
            onClick={handleNextAyah}
            disabled={currentAyahIndex + 1 >= allAyatsInSurah.length}
            className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
              currentAyahIndex + 1 >= allAyatsInSurah.length
                ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                : 'bg-white hover:bg-gray-100 text-black shadow-[2px_2px_0px_0px_#000]'
            }`}
          >
            <span>Ayat Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MAIN MUSHAF-STYLE AYAT CARD */}
      <NeobrutalCard variant="white" className="p-5 sm:p-8 border-2 border-black shadow-[3px_3px_0px_0px_#111827] space-y-5">
        {/* Header Ayat & Qari Audio Button */}
        <div className="flex items-center justify-between border-b border-dashed border-gray-300 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg border-2 border-black bg-[#0B4627] text-white flex items-center justify-center font-mono font-bold text-xs">
              {currentAyat.numberInSurah}
            </span>
            <h3 className="text-sm font-black text-black">
              QS. {currentAyat.surahName} : Ayat {currentAyat.numberInSurah}
            </h3>
          </div>

          {/* Qari Audio Player Button */}
          <button
            onClick={handlePlayQariAudio}
            className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5 cursor-pointer neo-button transition-all ${
              isPlayingQari
                ? 'bg-[#F59E0B] text-black animate-pulse shadow-[2px_2px_0px_0px_#000]'
                : 'bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#0B4627] shadow-[2px_2px_0px_0px_#000]'
            }`}
            title="Dengarkan Lantunan Qari Syekh Misyari"
          >
            {isPlayingQari ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isPlayingQari ? 'Hentikan Audio' : 'Dengar Qari'}</span>
          </button>
        </div>

        {/* Natural Flowing Arabic Sentence (Mushaf Typography) */}
        <div className="p-6 sm:p-9 bg-[#FBF9F2] border-2 border-black rounded-3xl text-center space-y-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
          {isLoadingAyahs ? (
            <div className="py-10 text-center">
              <div className="w-8 h-8 border-4 border-[#0B4627] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-600">Memuat teks mushaf...</p>
            </div>
          ) : (
            <div 
              className="font-quran text-3xl sm:text-4xl lg:text-5xl leading-relaxed sm:leading-loose text-emerald-950 font-bold tracking-wide select-none"
              dir="rtl"
            >
              {words.map((word, wIdx) => {
                const isErrorWord = correction?.wordIndex === wIdx;

                let wordClass = 'text-emerald-950 transition-all duration-150';

                if (isErrorWord) {
                  // Red highlight with wavy underline when auto-tegur fires
                  wordClass = 'text-red-600 underline decoration-wavy decoration-red-500 decoration-2 font-black bg-red-100/90 rounded px-2 animate-pulse ring-2 ring-red-400';
                }

                return (
                  <React.Fragment key={wIdx}>
                    <span className={`inline-block mx-1.5 ${wordClass}`}>
                      {word}
                    </span>
                    {' '}
                  </React.Fragment>
                );
              })}

              {/* Elegant Ayah End Number Marker */}
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-black bg-[#F59E0B] text-black font-quran text-sm font-black mx-2 align-middle shadow-[1px_1px_0px_0px_#000]">
                ۝{currentAyat.numberInSurah}
              </span>
            </div>
          )}

          {/* Latin Transliteration & Indonesian Translation */}
          <div className="border-t border-gray-300/80 pt-3 space-y-1.5 text-center">
            <p className="text-sm sm:text-base font-bold text-[#0B4627] italic font-serif">
              "{currentAyat.transliteration}"
            </p>
            <p className="text-xs sm:text-sm text-gray-700 italic font-medium max-w-2xl mx-auto leading-relaxed">
              "{currentAyat.translation}"
            </p>
          </div>
        </div>

        {/* 3. AUTO-TEGUR AI CORRECTION BOX (APPEARS DIRECTLY BELOW ON ERROR) */}
        {correction && (
          <div className="p-5 bg-[#FEE2E2] border-3 border-red-600 rounded-3xl shadow-[4px_4px_0px_0px_#DC2626] space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-7 h-7 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 text-[10px] font-black bg-red-600 text-white rounded border border-black uppercase">
                    Auto-Tegur AI
                  </span>
                  {correction.wordText && (
                    <span className="px-2.5 py-0.5 text-xs font-black bg-white text-red-700 rounded border border-red-400 font-quran" dir="rtl">
                      Kata: {correction.wordText}
                    </span>
                  )}
                </div>

                <h4 className="text-base font-black text-red-950">
                  ⚠️ Tajwid Kurang Tepat pada kata "{correction.wordText}"
                </h4>
                <p className="text-xs text-red-900 font-bold mt-0.5">
                  {correction.ruleTitle}
                </p>
              </div>
            </div>

            {/* Penjelasan Tajwid & Pelafalan Benar */}
            <div className="p-3.5 bg-white border-2 border-red-500 rounded-2xl space-y-1">
              <span className="text-[11px] font-black text-[#0B4627] uppercase block flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" /> Penjelasan & Pelafalan yang Benar:
              </span>
              <p className="text-xs text-gray-900 font-bold leading-relaxed">
                {correction.explanation}
              </p>
              <p className="text-xs text-[#0B4627] font-extrabold mt-1">
                💡 Panduan: {correction.correctGuidance}
              </p>
            </div>

            {/* Action Buttons: Audio Pembetulan & Tombol Ulangi */}
            <div className="pt-2 border-t border-red-300 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                onClick={handlePlayQariAudio}
                className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-emerald-50 text-black border-2 border-black rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer neo-button shadow-[2px_2px_0px_0px_#000]"
              >
                <Volume2 className="w-4 h-4 text-[#0B4627]" />
                <span>Dengar Contoh Qari</span>
              </button>

              <button
                onClick={handleRetryReading}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white border-2 border-black rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000] animate-pulse"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi Bacaan</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. SUCCESS BANNER (WHEN PASSED) */}
        {isPassed && (
          <div className="p-5 bg-[#D1FAE5] border-3 border-[#0B4627] rounded-3xl shadow-[4px_4px_0px_0px_#065F46] space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-[#0B4627]" />
                <div>
                  <h4 className="text-base font-black text-black">
                    BACAAN TARTIL & MUTQIN
                  </h4>
                  <p className="text-xs font-bold text-emerald-900">
                    Maa Syaa Allah! Makhraj huruf, mad, dan tajwid dilafalkan dengan fasih dan tepat.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono text-[#0B4627]">+75 XP</span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-400 flex justify-end">
              <button
                onClick={handleNextAyah}
                disabled={currentAyahIndex + 1 >= allAyatsInSurah.length}
                className="px-5 py-2.5 bg-[#0B4627] hover:bg-[#064E3B] text-white border-2 border-black rounded-xl text-xs font-black flex items-center gap-2 neo-button cursor-pointer shadow-[3px_3px_0px_0px_#000]"
              >
                <span>Lanjut Ayat Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 5. CENTRAL PROPORTIONAL MICROPHONE BUTTON */}
        <div className="flex flex-col items-center justify-center gap-3 py-3 border-t border-gray-200">
          <div className="relative flex items-center justify-center">
            {isListening && (
              <div
                className="absolute rounded-full bg-emerald-400 opacity-40 animate-ping pointer-events-none"
                style={{
                  width: `${Math.max(75, 75 + micVolume * 0.8)}px`,
                  height: `${Math.max(75, 75 + micVolume * 0.8)}px`
                }}
              />
            )}
            <button
              onClick={isListening ? handleStopReading : handleStartReading}
              className={`w-18 h-18 rounded-full border-3 border-black flex items-center justify-center transition-all cursor-pointer relative z-10 ${
                isListening
                  ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-105'
                  : 'bg-[#10B981] hover:bg-[#059669] text-black shadow-[4px_4px_0px_0px_#000] hover:scale-105'
              }`}
              title={isListening ? 'Hentikan Perekaman' : 'Mulai Membaca'}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <div className="text-center space-y-1">
            <span className="text-sm font-black text-black block">
              {isListening ? '🎙️ Mendengarkan Pelafalan Anda...' : 'Mulai Membaca'}
            </span>
            <p className="text-xs text-gray-600 max-w-md">
              {isListening
                ? 'Lafalkan ayat dengan tartil. Jika terdeteksi kekeliruan tajwid, sistem akan otomatis menegur seketika.'
                : 'Dekatkan mikrofon ke bibir dan baca ayat ini dengan tajwid yang tepat.'}
            </p>
          </div>

          {/* VU Meter Decibel Level */}
          {isListening && (
            <div className="w-56 flex flex-col items-center gap-1 pt-1">
              <div className="w-full h-2.5 bg-gray-200 rounded-full border border-black overflow-hidden flex">
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

          {/* Spoken Text Live Preview */}
          {liveTranscript && (
            <div className="w-full max-w-lg p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-center">
              <span className="text-[10px] text-gray-500 font-bold block">Suara Terdeteksi:</span>
              <p className="text-xs font-bold text-black">{liveTranscript}</p>
            </div>
          )}
        </div>
      </NeobrutalCard>

      {/* 6. SEARCHABLE SURAH PICKER MODAL */}
      {isSurahModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-black rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-[8px_8px_0px_0px_#000] overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 bg-[#0B4627] text-white border-b-2 border-black flex items-center justify-between">
              <div>
                <h4 className="text-base font-black">Pilih Surat Al-Qur'an</h4>
                <p className="text-xs text-emerald-200">114 Surat Penuh (Juz 1 s/d Juz 30)</p>
              </div>
              <button
                onClick={() => setIsSurahModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white text-black font-black text-sm flex items-center justify-center border-2 border-black cursor-pointer hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b-2 border-black bg-gray-50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari surat (nama, nomor, arti)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
                  autoFocus
                />
              </div>
            </div>

            {/* Surah List */}
            <div className="p-3 overflow-y-auto space-y-1.5 flex-1 max-h-96">
              {filteredSurahs.map((s) => {
                const isSelected = s.number === selectedSurahNumber;
                return (
                  <button
                    key={s.number}
                    onClick={() => {
                      setSelectedSurahNumber(s.number);
                      setIsSurahModalOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border-2 border-black text-left flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white hover:bg-amber-50 text-black'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-black ${isSelected ? 'text-[#F59E0B]' : 'text-gray-600'}`}>
                          #{s.number}
                        </span>
                        <span className="font-extrabold text-xs">{s.latinName}</span>
                      </div>
                      <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-gray-600'}`}>
                        {s.ayahCount} Ayat • Juz {s.juzStart} • "{s.meaning}"
                      </span>
                    </div>
                    <span className="font-quran text-lg font-bold">{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

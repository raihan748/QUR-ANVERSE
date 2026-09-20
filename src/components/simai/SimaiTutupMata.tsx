import React, { useState, useEffect, useRef } from 'react';
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
  Radio,
  Zap,
  Check,
  Headphones,
  ChevronDown,
  Edit3,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayat, SimaiLevel, UserProfile, EvaluationResult } from '../../types';
import { simaiQueue, ALL_JUZ_29_SURAHS, ALL_JUZ_30_SURAHS } from '../../data/quranData';
import { audioPlayer, RECITERS_LIST, Reciter } from '../../services/audioPlayerService';
import { speechEngine, SpeechEngine } from '../../services/speechEngine';
import { audioRecorder } from '../../services/audioRecorderService';
import { addXpAndCheckStreak } from '../../services/offlineStorage';
import { useLanguage } from '../../context/LanguageContext';
import { HalaqahMeshRoomView } from './HalaqahMeshRoomView';

interface SimaiTutupMataProps {
  userProfile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
}

export const SimaiTutupMata: React.FC<SimaiTutupMataProps> = ({
  userProfile,
  onProfileUpdated
}) => {
  const { language, t } = useLanguage();
  const [halaqahMode, setHalaqahMode] = useState<'mandiri' | 'mesh'>('mandiri');
  const [level, setLevel] = useState<SimaiLevel>('hafidz');
  const [juzFilter, setJuzFilter] = useState<29 | 30 | 'all'>('all');
  const [speechLanguage, setSpeechLanguage] = useState<'ar-SA' | 'ar-KW' | 'id-ID'>('ar-SA');
  const [inputTab, setInputTab] = useState<'voice' | 'chips'>('voice');
  
  // Sheikh Companion Selector State
  const [activeReciter, setActiveReciter] = useState<Reciter>(audioPlayer.getActiveReciter());
  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState(false);

  const [challengeData, setChallengeData] = useState<{ prompt: Ayat; next: Ayat }>(() => 
    simaiQueue.getNextChallenge('all', 'hardcore')
  );
  
  const [isPlayingPrompt, setIsPlayingPrompt] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  
  // Word chips state
  const [wordChips, setWordChips] = useState<string[]>([]);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  useEffect(() => {
    handleGenerateChallenge(juzFilter, level);
    return () => {
      audioPlayer.stop();
      speechEngine.stopListening();
      audioRecorder.stopRecording();
    };
  }, [juzFilter, level]);

  const mapLevelToDifficulty = (lvl: SimaiLevel): 'easy' | 'medium' | 'hardcore' => {
    if (lvl === 'pemula') return 'easy';
    if (lvl === 'hafidzah') return 'hardcore';
    return 'medium';
  };

  // Generate new Simai Challenge from Juz 29 & 30
  const handleGenerateChallenge = async (filter = juzFilter, currentLvl = level) => {
    audioPlayer.stop();
    speechEngine.stopListening();
    audioRecorder.stopRecording();
    setIsRecording(false);
    setMicVolume(0);
    setEvaluation(null);
    setSpokenTranscript('');
    setSelectedChips([]);

    const diff = mapLevelToDifficulty(currentLvl);
    const newChallenge = simaiQueue.getNextChallenge(filter, diff);
    setChallengeData(newChallenge);

    // Setup word chips from target continuation
    const words = newChallenge.next.arabicText.split(/\s+/).filter(Boolean);
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    setWordChips(shuffled);

    // Auto play prompt audio
    setIsPlayingPrompt(true);
    await audioPlayer.playAyat(newChallenge.prompt.surahNumber, newChallenge.prompt.numberInSurah, () => {
      setIsPlayingPrompt(false);
    }, activeReciter.id);
  };

  // Play prompt audio manually
  const handlePlayPromptAudio = async () => {
    setIsPlayingPrompt(true);
    await audioPlayer.playAyat(challengeData.prompt.surahNumber, challengeData.prompt.numberInSurah, () => {
      setIsPlayingPrompt(false);
    }, activeReciter.id);
  };

  // Start Mic Listening for continuation with live Decibel meter
  const handleStartContinuation = async () => {
    audioPlayer.stop();
    setIsPlayingPrompt(false);
    setEvaluation(null);
    setSpokenTranscript('');

    await SpeechEngine.requestMicrophonePermission();

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
        console.warn('Speech engine:', err);
        if (typeof err === 'string') {
          setIsRecording(false);
          setMicVolume(0);
          setEvaluation({
            accuracyScore: 0,
            isPassed: false,
            recognizedText: '',
            expectedArabic: challengeData.next.arabicText,
            expectedLatin: challengeData.next.transliteration || '',
            wordEvaluations: [],
            aiAdabPraise: 'Kendala Mikrofon',
            aiCorrectionNote: `${err}. Santri dapat beralih menggunakan Mode Susun Potongan Ayat di bawah (100% Offline)!`,
            syekhAudioUrl: ''
          });
        }
      }
    });

    if (started) {
      setIsRecording(true);
      setMicVolume(30);
    } else {
      setEvaluation({
        accuracyScore: 0,
        isPassed: false,
        recognizedText: '',
        expectedArabic: challengeData.next.arabicText,
        expectedLatin: challengeData.next.transliteration || '',
        wordEvaluations: [],
        aiAdabPraise: 'Izin Mikrofon Diperlukan',
        aiCorrectionNote: 'Fitur Dikte Suara memerlukan izin mikrofon browser. Anda juga dapat menggunakan Mode Susun Potongan Ayat di bawah secara 100% Offline!',
        syekhAudioUrl: ''
      });
    }
  };

  // Stop and Evaluate Continuation
  const handleStopAndEvaluate = async () => {
    const finalAccumulated = speechEngine.stopListening();
    setIsRecording(false);
    setMicVolume(0);

    const targetAyat = challengeData.next;
    const cleanSpoken = (spokenTranscript || finalAccumulated || '').trim();
    const alternatives = speechEngine.getAlternativeHypotheses();

    const result = speechEngine.evaluateRecitation(cleanSpoken, targetAyat, alternatives);
    setEvaluation(result);

    if (result.isPassed) {
      audioPlayer.playSuccessChime();
      confetti({ particleCount: 70, spread: 60 });
      const updated = addXpAndCheckStreak(200);
      onProfileUpdated(updated);
    } else {
      audioPlayer.playCorrectionPromptSound();
      setTimeout(() => {
        audioPlayer.playAyat(targetAyat.surahNumber, targetAyat.numberInSurah);
      }, 800);
    }
  };

  // Chips submission evaluation
  const handleEvaluateChips = () => {
    const arrangedText = selectedChips.join(' ');
    const targetAyat = challengeData.next;
    const result = speechEngine.evaluateRecitation(arrangedText, targetAyat);
    setEvaluation(result);

    if (result.isPassed) {
      audioPlayer.playSuccessChime();
      confetti({ particleCount: 70, spread: 60 });
      const updated = addXpAndCheckStreak(200);
      onProfileUpdated(updated);
    } else {
      setTimeout(() => {
        audioPlayer.playSheikhIntervention(targetAyat.surahNumber, targetAyat.numberInSurah, activeReciter.id);
      }, 500);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Mode Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-850 p-1 border border-slate-200/90 dark:border-slate-800 rounded-2xl gap-1 shadow-xs">
        <button
          onClick={() => setHalaqahMode('mandiri')}
          className={`flex-1 py-2 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            halaqahMode === 'mandiri'
              ? 'bg-[#0B4627] text-amber-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <EyeOff className="w-4 h-4" />
          <span>Simai Mandiri (Tutup Mata)</span>
        </button>
        <button
          onClick={() => setHalaqahMode('mesh')}
          className={`flex-1 py-2 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            halaqahMode === 'mesh'
              ? 'bg-[#0B4627] text-amber-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Majelis Halaqah Mesh P2P</span>
        </button>
      </div>

      {halaqahMode === 'mesh' ? (
        <HalaqahMeshRoomView userProfile={userProfile} />
      ) : (
        <div className="space-y-4">
          {/* Header Level & Scope Selector */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B4627] via-[#08381F] to-[#042413] border border-emerald-800/80 shadow-sm text-white relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full flex items-center gap-1">
                    <EyeOff className="w-3.5 h-3.5" /> Mode Simai Tutup Mata
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full">
                    48 Surat (Juz 29 & 30)
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                  Simai & Sambung Lisan Syekh ({activeReciter.name.split(' ')[1] || activeReciter.name})
                </h2>
                <p className="text-xs text-emerald-200/90 font-medium mt-1">
                  Uji ketajaman mutqin hafalan 11 Surat Juz 29 & 37 Surat Juz 30 dengan urutan acak dinamis.
                </p>
              </div>

              {/* Reciter & Level Switcher Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Reciter Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition duration-150 cursor-pointer shadow-xs"
                    title="Pilih Syekh Pendamping Simai"
                  >
                    <Headphones className="w-3.5 h-3.5 text-amber-300" />
                    <span className="truncate max-w-[120px]">{activeReciter.name.split(' ')[1] || activeReciter.name}</span>
                    <ChevronDown className="w-3 h-3 text-amber-300/80" />
                  </button>

                  {isReciterMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-md z-50 animate-in fade-in zoom-in-95 space-y-1">
                      <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-100">
                        <span className="text-[11px] font-bold text-[#0B4627] dark:text-emerald-400">
                          {language === 'ar' ? 'اختر الشيخ المرافق:' : 'Pilih Syekh Pendamping:'}
                        </span>
                        <button
                          onClick={() => setIsReciterMenuOpen(false)}
                          className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                          aria-label="Tutup"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {RECITERS_LIST.map((r) => {
                        const isSelected = r.id === activeReciter.id;
                        return (
                          <button
                            key={r.id}
                            onClick={() => {
                              setActiveReciter(r);
                              audioPlayer.setActiveReciter(r.id);
                              setIsReciterMenuOpen(false);
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 border-emerald-400 shadow-xs'
                                : 'bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 border-transparent'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <p className="text-xs font-bold truncate">{r.name}</p>
                              <p className={`text-[10px] font-medium ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                                {r.style}
                              </p>
                            </div>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-semibold shrink-0 ${
                              isSelected ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {r.bitrate}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Level Switcher */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-emerald-800/60">
                  {(['pemula', 'hafidz', 'hafidzah'] as SimaiLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLevel(lvl)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                        level === lvl
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-emerald-200/80 hover:text-white'
                      }`}
                    >
                      {lvl === 'pemula' ? 'Pemula' : lvl === 'hafidz' ? 'Hafidz' : 'Hafidzah'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FILTER JUZ BUTTONS */}
          <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#0B4627] dark:text-emerald-400" /> PILIH CAKUPAN JUZ UNTUK SIMAI (TOTAL 48 SURAT):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setJuzFilter('all')}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  juzFilter === 'all'
                    ? 'bg-[#0B4627] text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                Semua (Juz 29 & 30) • 48 Surat
              </button>
              <button
                onClick={() => setJuzFilter(29)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  juzFilter === 29
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                Khusus Juz 29 • 11 Surat
              </button>
              <button
                onClick={() => setJuzFilter(30)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  juzFilter === 30
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                Khusus Juz 30 • 37 Surat
              </button>
            </div>
          </div>

          {/* BLIND CHALLENGE ARENA */}
          <div className="relative rounded-3xl bg-[#032313] border border-emerald-800/80 p-6 sm:p-10 shadow-sm text-center space-y-8 overflow-hidden">
            {/* Background Islamic Watermark */}
            <div className="absolute top-4 right-4 opacity-10 text-white font-quran text-9xl select-none pointer-events-none">
              ۞
            </div>

            {/* Challenge Header */}
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-semibold rounded-xl">
                  Juz {challengeData.prompt.juz} • QS. {challengeData.prompt.surahName} (Ayat {challengeData.prompt.numberInSurah})
                </span>
                {challengeData.prompt.numberInSurah >= 10 && (
                  <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-400/40 text-[10px] font-semibold rounded-full uppercase flex items-center gap-0.5">
                    <Flame className="w-3 h-3 fill-rose-300" /> Pertengahan Surat
                  </span>
                )}
              </div>

              <button
                onClick={() => handleGenerateChallenge()}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition duration-150 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ganti Ayat Acak Baru</span>
              </button>
            </div>

            {/* 1. Ayat Pemicu */}
            <div className="space-y-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                1. Dengarkan Lantunan Tartil Syekh Misyari Rasyid:
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
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition duration-150 cursor-pointer"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingPrompt ? 'animate-pulse' : ''}`} />
                <span>{isPlayingPrompt ? 'Memutar Audio Syekh...' : 'Putar Ulang Ayat Pemicu'}</span>
              </button>
            </div>

            {/* 2. AREA SAMBUNG LISAN & 2 METODE INPUT */}
            <div className="p-6 bg-black/40 border border-emerald-500/30 rounded-2xl space-y-4 max-w-xl mx-auto">
              {/* Method Selection Sub-Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/60 rounded-xl border border-emerald-800/80">
                <button
                  onClick={() => setInputTab('voice')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    inputTab === 'voice' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" /> Mic Lisan Otentik
                </button>
                <button
                  onClick={() => setInputTab('chips')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    inputTab === 'chips' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Susun Kata Hafalan
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-emerald-800/60 pb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Sambung Ayat ke-{challengeData.next.numberInSurah}:
                </span>

                {/* Dialect Selector */}
                {inputTab === 'voice' && (
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-emerald-800/80">
                    <span className="text-[10px] text-emerald-300 flex items-center gap-0.5">
                      <Globe className="w-3 h-3" /> Dialek:
                    </span>
                    <button
                      onClick={() => setSpeechLanguage('ar-SA')}
                      className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                        speechLanguage === 'ar-SA' ? 'bg-emerald-600 text-white' : 'text-emerald-200 hover:text-white'
                      }`}
                    >
                      [SA] Arab
                    </button>
                    <button
                      onClick={() => setSpeechLanguage('ar-KW')}
                      className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                        speechLanguage === 'ar-KW' ? 'bg-amber-500 text-slate-950' : 'text-emerald-200 hover:text-white'
                      }`}
                    >
                      [KW] Kuwait
                    </button>
                    <button
                      onClick={() => setSpeechLanguage('id-ID')}
                      className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                        speechLanguage === 'id-ID' ? 'bg-amber-500 text-slate-950' : 'text-emerald-200 hover:text-white'
                      }`}
                    >
                      [ID] Latin
                    </button>
                  </div>
                )}
              </div>

              {level === 'pemula' && (
                <p className="text-xs text-emerald-300 italic">
                  Petunjuk Pemula: Awal ayat berikutnya dimulai dengan lafal "{challengeData.next.arabicText.split(' ')[0]}..."
                </p>
              )}

              {/* TAB 1: VOICE MIC INPUT */}
              {inputTab === 'voice' && (
                <div className="flex flex-col items-center gap-3">
                  {!isRecording ? (
                    <button
                      onClick={handleStartContinuation}
                      className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-sm transition duration-150 cursor-pointer"
                    >
                      <Mic className="w-5 h-5" />
                      <span>Tekan & Sambung Lisan via Mic</span>
                    </button>
                  ) : (
                    <div className="w-full space-y-3">
                      <button
                        onClick={handleStopAndEvaluate}
                        className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition duration-150 cursor-pointer"
                      >
                        <MicOff className="w-5 h-5" />
                        <span>Selesai Melafalkan & Nilai Akurasi</span>
                      </button>

                      {/* Live Arabic Dictation Display */}
                      <div className="p-4 bg-emerald-950/80 text-white border border-amber-400/60 rounded-2xl text-right shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-300 border-b border-emerald-800/60 pb-1" dir="ltr">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                            <Mic className="w-3.5 h-3.5 text-amber-300 inline" />
                            <span>Hasil Dikte Suara:</span>
                          </span>
                          <span className="font-mono text-amber-300">Aktif</span>
                        </div>
                        <p className="font-arabic text-xl sm:text-2xl font-bold text-amber-300 leading-loose break-words pt-1" dir="rtl">
                          {spokenTranscript ? `« ${spokenTranscript} »` : 'Sedang mendengarkan lantunan ayat Anda...'}
                        </p>
                      </div>

                      {/* VU Decibel Meter */}
                      <div className="p-3 bg-black/60 border border-emerald-800/80 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400">
                          <span className="flex items-center gap-1">
                            <Radio className="w-3 h-3 text-rose-500" /> MIKROFON AKTIF
                          </span>
                          <span>Level Input: {micVolume}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-emerald-900">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-75"
                            style={{ width: `${Math.min(100, micVolume * 2.5)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: WORD CHIPS INPUT */}
              {inputTab === 'chips' && (
                <div className="space-y-3">
                  <span className="text-xs text-slate-300 block">
                    Susun kata-kata di bawah ini menjadi sambungan ayat yang benar:
                  </span>
                  
                  {/* Selected chips tray */}
                  <div className="min-h-[50px] p-3 bg-white/5 border border-dashed border-emerald-500/60 rounded-xl flex flex-wrap gap-2 items-center justify-center" dir="rtl">
                    {selectedChips.length === 0 ? (
                      <span className="text-xs text-slate-400 font-sans italic">Pilih potongan kata di bawah...</span>
                    ) : (
                      selectedChips.map((word, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedChips(prev => prev.filter((_, i) => i !== idx));
                            setWordChips(prev => [...prev, word]);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-quran text-lg font-bold rounded-lg hover:bg-rose-600 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <span>{word}</span>
                          <X className="w-3.5 h-3.5 text-white/80" />
                        </button>
                      ))
                    )}
                  </div>

                  {/* Available chips pool */}
                  <div className="flex flex-wrap gap-2 justify-center pt-2" dir="rtl">
                    {wordChips.map((word, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedChips(prev => [...prev, word]);
                          setWordChips(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-quran text-lg font-bold rounded-lg border border-emerald-700/50 transition-colors"
                      >
                        {word}
                      </button>
                    ))}
                  </div>

                  {selectedChips.length > 0 && (
                    <button
                      onClick={handleEvaluateChips}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition duration-150 mt-2 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Periksa Susunan Kata</span>
                    </button>
                  )}
                </div>
              )}

              {spokenTranscript && (
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-left">
                  <span className="text-[10px] font-semibold text-emerald-300 block uppercase">Transkrip Lafal Anda:</span>
                  <p className="text-base font-semibold text-white mt-0.5" dir="rtl">{spokenTranscript}</p>
                </div>
              )}
            </div>

            {/* 3. Hasil Evaluasi AI */}
            {evaluation && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 text-left space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    {evaluation.isPassed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ShieldCheck className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    )}
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {evaluation.isPassed ? 'Bacaan Mutqin & Tepat' : 'Belum Tepat'}
                      </h4>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Akurasi Makhraj & Hafalan: {evaluation.accuracyScore}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGenerateChallenge()}
                    className="px-4 py-2 bg-[#0B4627] hover:bg-[#08351D] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition duration-150 cursor-pointer shadow-xs"
                  >
                    <span>Tantangan Berikutnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{evaluation.aiAdabPraise}</p>

                {/* Jawaban Lengkap */}
                <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Kunci Sambungan Ayat:</span>
                    <button
                      onClick={() => audioPlayer.playAyat(challengeData.next.surahNumber, challengeData.next.numberInSurah)}
                      className="text-xs text-[#0B4627] dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Putar Suara Syekh
                    </button>
                  </div>
                  <p className="font-quran text-2xl text-right leading-loose font-bold text-slate-900 dark:text-white" dir="rtl">
                    {challengeData.next.arabicText}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">{challengeData.next.translation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

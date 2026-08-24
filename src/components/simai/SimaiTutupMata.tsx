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
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ayat, SimaiLevel, UserProfile, EvaluationResult } from '../../types';
import { simaiQueue, ALL_JUZ_29_SURAHS, ALL_JUZ_30_SURAHS } from '../../data/quranData';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { audioPlayer, RECITERS_LIST, Reciter } from '../../services/audioPlayerService';
import { speechEngine } from '../../services/speechEngine';
import { audioRecorder } from '../../services/audioRecorderService';
import { addXpAndCheckStreak } from '../../services/offlineStorage';
import { useLanguage } from '../../context/LanguageContext';

interface SimaiTutupMataProps {
  userProfile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
}

export const SimaiTutupMata: React.FC<SimaiTutupMataProps> = ({
  userProfile,
  onProfileUpdated
}) => {
  const { language, t } = useLanguage();
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

    // Start Audio Recorder for decibel VU meter
    try {
      await audioRecorder.startRecording((vol) => {
        setMicVolume(vol);
      });
    } catch {
      // Continue even if audio recorder permissions vary
    }

    speechEngine.setLanguage(speechLanguage);
    const started = speechEngine.startListening({
      language: speechLanguage,
      onInterimResult: (text) => setSpokenTranscript(text),
      onFinalResult: (text) => setSpokenTranscript(text),
      onError: (err) => {
        console.warn('Speech engine:', err);
      },
      onEnd: () => {
        // stay active
      }
    });

    if (started) setIsRecording(true);
  };

  // Stop and Evaluate Continuation
  const handleStopAndEvaluate = async () => {
    const finalAccumulated = speechEngine.stopListening();
    await audioRecorder.stopRecording();
    setIsRecording(false);
    setMicVolume(0);

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
    <div className="space-y-4 pb-24 max-w-4xl mx-auto">
      {/* Header Level & Scope Selector */}
      <NeobrutalCard variant="dark" className="p-4 sm:p-5 border-2 border-black shadow-[3px_3px_0px_0px_#0B4627]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 text-xs font-black bg-[#F59E0B] text-black rounded border border-black uppercase flex items-center gap-1">
                <EyeOff className="w-3.5 h-3.5" /> Mode Simai Tutup Mata
              </span>
              <span className="px-2 py-0.5 text-xs font-bold bg-[#10B981] text-black rounded border border-black">
                48 Surat (Semua Juz 29 & 30)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white">
              Simai & Sambung Lisan Syekh ({activeReciter.name.split(' ')[1] || activeReciter.name})
            </h2>
            <p className="text-xs text-emerald-200 mt-0.5">
              Uji ketajaman mutqin hafalan 11 Surat Juz 29 & 37 Surat Juz 30 dengan urutan acak dinamis.
            </p>
          </div>

          {/* Reciter & Level Switcher Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Reciter Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
                className="px-2.5 py-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 neo-button cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                title="Pilih Syekh Pendamping Simai"
              >
                <Headphones className="w-3.5 h-3.5 text-[#0B4627]" />
                <span className="truncate max-w-[120px]">{activeReciter.name.split(' ')[1] || activeReciter.name}</span>
                <ChevronDown className="w-3 h-3 text-gray-700" />
              </button>

              {isReciterMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border-3 border-black rounded-2xl p-2 shadow-[6px_6px_0px_0px_#000] z-50 animate-in fade-in zoom-in-95 space-y-1">
                  <div className="p-1.5 border-b-2 border-black flex items-center justify-between text-black">
                    <span className="text-[11px] font-black text-[#0B4627]">
                      {language === 'ar' ? 'اختر الشيخ المرافق:' : 'Pilih Syekh Pendamping:'}
                    </span>
                    <button
                      onClick={() => setIsReciterMenuOpen(false)}
                      className="text-xs font-bold text-gray-500 hover:text-black"
                    >
                      ✕
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
                        className={`w-full p-2 rounded-xl border-2 border-black text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-[#F9FAFB] hover:bg-amber-50 text-gray-900'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="text-xs font-black truncate">{r.name}</p>
                          <p className={`text-[10px] font-bold ${isSelected ? 'text-amber-300' : 'text-gray-600'}`}>
                            {r.style}
                          </p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 border ${
                          isSelected ? 'bg-[#F59E0B] text-black border-black' : 'bg-gray-200 text-gray-700 border-gray-400'
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
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/20">
              {(['pemula', 'hafidz', 'hafidzah'] as SimaiLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`px-2.5 py-1 text-xs font-black rounded-lg capitalize transition-all cursor-pointer ${
                    level === lvl
                      ? 'bg-[#F59E0B] text-black shadow-[2px_2px_0px_0px_#000]'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {lvl === 'pemula' ? '🟢 Pemula' : lvl === 'hafidz' ? '🟡 Hafidz' : '🔥 Hafidzah'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </NeobrutalCard>

      {/* FILTER JUZ BUTTONS */}
      <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_#111827]">
        <span className="text-xs font-extrabold text-gray-600 block mb-2 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-[#0B4627]" /> PILIH CAKUPAN JUZ UNTUK SIMAI (TOTAL 48 SURAT):
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
            Semua (Juz 29 & 30) • 48 Surat
          </button>
          <button
            onClick={() => setJuzFilter(29)}
            className={`py-2 text-xs font-extrabold rounded-xl border-2 border-black transition-all cursor-pointer ${
              juzFilter === 29
                ? 'bg-[#F59E0B] text-black shadow-[2px_2px_0px_0px_#000] font-black'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Khusus Juz 29 • 11 Surat
          </button>
          <button
            onClick={() => setJuzFilter(30)}
            className={`py-2 text-xs font-extrabold rounded-xl border-2 border-black transition-all cursor-pointer ${
              juzFilter === 30
                ? 'bg-[#10B981] text-black shadow-[2px_2px_0px_0px_#000] font-black'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Khusus Juz 30 • 37 Surat
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-[#10B981] text-black text-xs font-black rounded-xl border-2 border-black">
              Juz {challengeData.prompt.juz} • QS. {challengeData.prompt.surahName} (Ayat {challengeData.prompt.numberInSurah})
            </span>
            {challengeData.prompt.numberInSurah >= 10 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-md border border-black uppercase flex items-center gap-0.5">
                <Flame className="w-3 h-3 fill-white" /> Pertengahan Surat
              </span>
            )}
          </div>

          <button
            onClick={() => handleGenerateChallenge()}
            className="px-3 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 neo-button cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ganti Ayat Acak Baru</span>
          </button>
        </div>

        {/* 1. Ayat Pemicu (Audio & Large Text) */}
        <div className="space-y-4">
          <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest block">
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
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white border-2 border-black rounded-xl text-xs font-extrabold inline-flex items-center gap-2 neo-button cursor-pointer"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingPrompt ? 'animate-bounce' : ''}`} />
            <span>{isPlayingPrompt ? 'Memutar Audio Syekh...' : 'Putar Ulang Ayat Pemicu'}</span>
          </button>
        </div>

        {/* 2. AREA SAMBUNG LISAN & 2 METODE INPUT */}
        <div className="p-6 bg-black/40 border-2 border-emerald-500/40 rounded-2xl space-y-4 max-w-xl mx-auto">
          {/* Method Selection Sub-Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/60 rounded-xl border border-emerald-800">
            <button
              onClick={() => setInputTab('voice')}
              className={`py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                inputTab === 'voice' ? 'bg-[#10B981] text-black shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" /> Mic Lisan Otentik
            </button>
            <button
              onClick={() => setInputTab('chips')}
              className={`py-1.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                inputTab === 'chips' ? 'bg-[#F59E0B] text-black shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Susun Kata Hafalan
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 border-b border-emerald-800 pb-2">
            <span className="text-xs font-black text-[#F59E0B] uppercase tracking-wider block">
              Sambung Ayat ke-{challengeData.next.numberInSurah}:
            </span>

            {/* Dialect Selector */}
            {inputTab === 'voice' && (
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-emerald-700">
                <span className="text-[10px] text-emerald-300 flex items-center gap-0.5">
                  <Globe className="w-3 h-3" /> Dialek:
                </span>
                <button
                  onClick={() => setSpeechLanguage('ar-SA')}
                  className={`px-1.5 py-0.5 text-[10px] font-black rounded ${
                    speechLanguage === 'ar-SA' ? 'bg-[#10B981] text-black' : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  🇸🇦 Arab
                </button>
                <button
                  onClick={() => setSpeechLanguage('ar-KW')}
                  className={`px-1.5 py-0.5 text-[10px] font-black rounded ${
                    speechLanguage === 'ar-KW' ? 'bg-amber-400 text-black' : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  🇰🇼 Kuwait
                </button>
                <button
                  onClick={() => setSpeechLanguage('id-ID')}
                  className={`px-1.5 py-0.5 text-[10px] font-black rounded ${
                    speechLanguage === 'id-ID' ? 'bg-[#F59E0B] text-black' : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  🇮🇩 Latin
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
                  className="px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-black border-3 border-black rounded-2xl text-base font-black flex items-center gap-2 neo-button shadow-[4px_4px_0px_0px_#F59E0B] cursor-pointer"
                >
                  <Mic className="w-6 h-6" />
                  <span>Tekan & Sambung Lisan via Mic</span>
                </button>
              ) : (
                <div className="w-full space-y-3">
                  <button
                    onClick={handleStopAndEvaluate}
                    className="w-full py-4 bg-[#EF4444] hover:bg-[#DC2626] text-white border-3 border-black rounded-2xl text-base font-black flex items-center justify-center gap-2 neo-button animate-pulse cursor-pointer"
                  >
                    <MicOff className="w-6 h-6" />
                    <span>Selesai Melafalkan & Nilai Akurasi</span>
                  </button>

                  {/* VU Decibel Meter */}
                  <div className="p-3 bg-black/80 border border-emerald-600 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400">
                      <span className="flex items-center gap-1">
                        <Radio className="w-3 h-3 text-red-500 animate-spin" /> MIKROFON AKTIF
                      </span>
                      <span>Level Input: {micVolume}%</span>
                    </div>
                    <div className="w-full bg-gray-900 h-2.5 rounded-full overflow-hidden border border-emerald-700/50">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500 transition-all duration-75"
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
              <span className="text-xs text-gray-300 block">
                Susun kata-kata di bawah ini menjadi sambungan ayat yang benar:
              </span>
              
              {/* Selected chips tray */}
              <div className="min-h-[50px] p-3 bg-white/10 border-2 border-dashed border-emerald-400 rounded-xl flex flex-wrap gap-2 items-center justify-center" dir="rtl">
                {selectedChips.length === 0 ? (
                  <span className="text-xs text-gray-400 font-sans italic">Pilih potongan kata di bawah...</span>
                ) : (
                  selectedChips.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedChips(prev => prev.filter((_, i) => i !== idx));
                        setWordChips(prev => [...prev, word]);
                      }}
                      className="px-3 py-1.5 bg-[#10B981] text-black font-quran text-lg font-bold rounded-lg border border-black hover:bg-red-400 transition-colors"
                    >
                      {word} ✕
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
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-quran text-lg font-bold rounded-lg border border-emerald-500/50"
                  >
                    {word}
                  </button>
                ))}
              </div>

              {selectedChips.length > 0 && (
                <button
                  onClick={handleEvaluateChips}
                  className="w-full py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-black font-black text-xs rounded-xl border-2 border-black neo-button mt-2 cursor-pointer"
                >
                  ✓ Periksa Susunan Kata
                </button>
              )}
            </div>
          )}

          {spokenTranscript && (
            <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-left">
              <span className="text-[10px] font-black text-emerald-300 block uppercase">Transkrip Lafal Anda:</span>
              <p className="text-base font-semibold text-white mt-0.5" dir="rtl">{spokenTranscript}</p>
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
                <span>Tantangan Sequence Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-gray-800">{evaluation.aiAdabPraise}</p>

            {/* Jawaban Lengkap */}
            <div className="p-4 bg-emerald-50 border-2 border-black rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-emerald-900 uppercase">Kunci Sambungan Ayat:</span>
                <button
                  onClick={() => audioPlayer.playAyat(challengeData.next.surahNumber, challengeData.next.numberInSurah)}
                  className="text-xs text-[#0B4627] font-bold flex items-center gap-1 hover:underline"
                >
                  <Volume2 className="w-3 h-3" /> Putar Suara Syekh Misyari
                </button>
              </div>
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

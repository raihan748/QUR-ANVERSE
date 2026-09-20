import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  ChevronDown,
  Headphones,
  X
} from 'lucide-react';
import { Ayat } from '../../types';
import { audioPlayer, RECITERS_LIST, Reciter } from '../../services/audioPlayerService';
import { useLanguage } from '../../context/LanguageContext';

interface QuranAudioBarProps {
  currentAyat: Ayat | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextAyat?: () => void;
  onPrevAyat?: () => void;
  onReciterChanged?: (reciter: Reciter) => void;
}

export const QuranAudioBar: React.FC<QuranAudioBarProps> = ({
  currentAyat,
  isPlaying,
  onTogglePlay,
  onNextAyat,
  onPrevAyat,
  onReciterChanged
}) => {
  const { language } = useLanguage();
  const [activeReciter, setActiveReciter] = useState<Reciter>(audioPlayer.getActiveReciter());
  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState(false);

  if (!currentAyat) return null;

  const handleSelectReciter = (reciter: Reciter) => {
    audioPlayer.setActiveReciter(reciter.id);
    setActiveReciter(reciter);
    setIsReciterMenuOpen(false);

    if (isPlaying) {
      audioPlayer.playAyat(currentAyat.surahNumber, currentAyat.numberInSurah, undefined, reciter.id);
    }
    if (onReciterChanged) {
      onReciterChanged(reciter);
    }
  };

  return (
    <div className="fixed bottom-16 lg:bottom-4 left-4 right-4 max-w-2xl mx-auto z-30 animate-in slide-in-from-bottom duration-300">
      {/* Multi-Reciter Dropdown Modal */}
      {isReciterMenuOpen && (
        <div className="mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xl space-y-2.5 animate-in fade-in zoom-in-95 backdrop-blur-lg">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 px-1">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-amber-500" />
              {language === 'ar' ? 'اختر القارئ المعتمد:' : 'Pilih Qari / Syekh Tilawah:'}
            </span>
            <button
              onClick={() => setIsReciterMenuOpen(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {RECITERS_LIST.map((r) => {
              const isSelected = r.id === activeReciter.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelectReciter(r)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 dark:bg-emerald-900 border-emerald-700 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="text-xs font-semibold truncate">{r.name}</p>
                    <p className={`text-[10px] ${isSelected ? 'text-amber-300' : 'text-slate-500 dark:text-slate-400'}`}>
                      {r.style}
                    </p>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium shrink-0 border ${
                    isSelected ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                  }`}>
                    {r.bitrate}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Bar Card */}
      <div className="bg-[#042413]/95 backdrop-blur-md text-white border border-emerald-700/50 rounded-2xl p-3 sm:p-3.5 shadow-xl flex items-center justify-between gap-3 ring-1 ring-emerald-500/20">
        {/* Ayah Meta Info & Reciter Chip */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 font-bold shadow-xs">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-xs text-amber-400 truncate">
                {currentAyat.surahName} : Ayat {currentAyat.numberInSurah}
              </p>
              <button
                onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
                className="text-[10px] bg-white/10 hover:bg-white/20 text-amber-300 px-2 py-0.5 rounded-md border border-white/20 font-medium flex items-center gap-0.5 cursor-pointer shrink-0 transition-colors"
                title="Klik untuk ganti Qari"
              >
                <span>{activeReciter.name.split(' ')[1] || activeReciter.name}</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-300 truncate font-arabic mt-0.5" dir="rtl">
              {currentAyat.arabicText}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onPrevAyat && (
            <button
              onClick={onPrevAyat}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl cursor-pointer transition-colors"
              title="Ayat Sebelumnya"
            >
              <SkipBack className="w-4 h-4 text-white" />
            </button>
          )}

          <button
            onClick={onTogglePlay}
            className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold cursor-pointer transition-all shadow-xs active:scale-95"
            title={isPlaying ? 'Jeda' : 'Putar Lantunan'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-slate-950" />}
          </button>

          {onNextAyat && (
            <button
              onClick={onNextAyat}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl cursor-pointer transition-colors"
              title="Ayat Selanjutnya"
            >
              <SkipForward className="w-4 h-4 text-white" />
            </button>
          )}

          <button
            onClick={() => audioPlayer.stop()}
            className="p-2 bg-rose-600/80 hover:bg-rose-600 border border-rose-500/40 rounded-xl cursor-pointer transition-colors"
            title="Hentikan"
          >
            <Square className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

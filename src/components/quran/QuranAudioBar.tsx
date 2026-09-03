import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Sparkles, 
  ChevronDown,
  UserCheck,
  Headphones
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

    // If currently playing, replay current ayah immediately with the newly selected reciter
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
        <div className="mb-2 bg-white border-3 border-black rounded-2xl p-3 shadow-[6px_6px_0px_0px_#000] space-y-2 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b-2 border-black pb-1.5 px-1">
            <span className="text-xs font-black text-[#0B4627] flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-[#F59E0B]" />
              {language === 'ar' ? 'اختر القارئ المعتمد:' : 'Pilih Qari / Syekh Tilawah:'}
            </span>
            <button
              onClick={() => setIsReciterMenuOpen(false)}
              className="text-[10px] font-black text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto">
            {RECITERS_LIST.map((r) => {
              const isSelected = r.id === activeReciter.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelectReciter(r)}
                  className={`p-2 rounded-xl border-2 border-black text-left flex items-center justify-between transition-all cursor-pointer ${
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
        </div>
      )}

      {/* Main Bar Card */}
      <div className="bg-[#0B4627] text-white border-3 border-black rounded-2xl p-3 sm:p-3.5 shadow-[6px_6px_0px_0px_#111827] flex items-center justify-between gap-3">
        {/* Ayah Meta Info & Reciter Chip */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B] border-2 border-black flex items-center justify-center text-black shrink-0 font-extrabold shadow-[2px_2px_0px_0px_#000]">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <p className="font-extrabold text-xs text-[#F59E0B] truncate">
                {currentAyat.surahName} : Ayat {currentAyat.numberInSurah}
              </p>
              {/* Reciter Badge with quick switcher */}
              <button
                onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
                className="text-[9px] bg-black/60 hover:bg-black text-amber-300 px-1.5 py-0.5 rounded-lg border border-amber-400 font-bold flex items-center gap-0.5 cursor-pointer shrink-0"
                title="Klik untuk ganti Qari"
              >
                <span>{activeReciter.name.split(' ')[1] || activeReciter.name}</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
            </div>
            <p className="text-[11px] text-gray-200 truncate font-arabic mt-0.5" dir="rtl">
              {currentAyat.arabicText}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onPrevAyat && (
            <button
              onClick={onPrevAyat}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/40 rounded-lg cursor-pointer"
              title="Ayat Sebelumnya"
            >
              <SkipBack className="w-4 h-4 text-white" />
            </button>
          )}

          <button
            onClick={onTogglePlay}
            className="p-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-black border-2 border-black rounded-xl neo-button cursor-pointer font-black shadow-[2px_2px_0px_0px_#000]"
            title={isPlaying ? 'Jeda' : 'Putar Lantunan'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-black" />}
          </button>

          {onNextAyat && (
            <button
              onClick={onNextAyat}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/40 rounded-lg cursor-pointer"
              title="Ayat Selanjutnya"
            >
              <SkipForward className="w-4 h-4 text-white" />
            </button>
          )}

          <button
            onClick={() => audioPlayer.stop()}
            className="p-2 bg-red-600/80 hover:bg-red-600 border border-black rounded-lg cursor-pointer"
            title="Hentikan"
          >
            <Square className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Play, Pause, Square, SkipForward, SkipBack, Volume2, Sparkles, Repeat } from 'lucide-react';
import { Ayat } from '../../types';
import { audioPlayer } from '../../services/audioPlayerService';

interface QuranAudioBarProps {
  currentAyat: Ayat | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextAyat?: () => void;
  onPrevAyat?: () => void;
}

export const QuranAudioBar: React.FC<QuranAudioBarProps> = ({
  currentAyat,
  isPlaying,
  onTogglePlay,
  onNextAyat,
  onPrevAyat
}) => {
  if (!currentAyat) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-4 left-4 right-4 max-w-2xl mx-auto z-30 animate-in slide-in-from-bottom duration-300">
      <div className="bg-[#0B4627] text-white border-3 border-black rounded-2xl p-3.5 shadow-[6px_6px_0px_0px_#111827] flex items-center justify-between gap-3">
        {/* Ayah Meta Info */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B] border-2 border-black flex items-center justify-center text-black shrink-0 font-extrabold shadow-[2px_2px_0px_0px_#000]">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <p className="font-extrabold text-xs text-[#F59E0B] truncate">
                {currentAyat.surahName} : Ayat {currentAyat.numberInSurah}
              </p>
              <span className="text-[9px] bg-black/50 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500 font-mono">
                Syekh Misyari
              </span>
            </div>
            <p className="text-[11px] text-gray-200 truncate font-arabic mt-0.5" dir="rtl">
              {currentAyat.arabicText}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 shrink-0">
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
            className="p-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-black border-2 border-black rounded-xl neo-button cursor-pointer font-black"
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

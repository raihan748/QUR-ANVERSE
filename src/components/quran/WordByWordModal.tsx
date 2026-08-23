import React from 'react';
import { X, BookOpen, Volume2 } from 'lucide-react';
import { Ayat, WordData } from '../../types';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { audioPlayer } from '../../services/audioPlayerService';

interface WordByWordModalProps {
  ayat: Ayat | null;
  isOpen: boolean;
  onClose: () => void;
  selectedWord?: WordData | null;
}

export const WordByWordModal: React.FC<WordByWordModalProps> = ({
  ayat,
  isOpen,
  onClose,
  selectedWord
}) => {
  if (!isOpen || !ayat) return null;

  const words = (ayat.words && ayat.words.length > 0)
    ? ayat.words
    : ayat.arabicText.split(/\s+/).filter(Boolean).map((w, idx) => ({
        id: idx + 1,
        arabic: w,
        transliteration: `Lafal ke-${idx + 1}`,
        meaningId: `Potongan kata ke-${idx + 1}`
      }));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <NeobrutalCard variant="white" className="p-5 relative border-3 border-black shadow-[8px_8px_0px_0px_#111827] flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#F59E0B] border-2 border-black flex items-center justify-center text-black font-black">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-display text-black">
                  Arti Kata per Kata Al-Qur'an
                </h3>
                <p className="text-xs text-gray-600 font-medium">
                  {ayat.surahName} : Ayat {ayat.numberInSurah} (Juz {ayat.juz})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 bg-[#FEE2E2] hover:bg-[#FCA5A5] border-2 border-black rounded-lg neo-button cursor-pointer"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Full Ayah Preview */}
          <div className="p-3.5 bg-[#FFFDF7] border-2 border-black rounded-xl mb-4 shrink-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-[#0B4627] text-white rounded border border-black">
                Teks Utuh Ayat
              </span>
              <button
                onClick={() => audioPlayer.playAyat(ayat.surahNumber, ayat.numberInSurah)}
                className="flex items-center gap-1 text-xs font-bold text-[#0B4627] hover:underline cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" /> Putar Audio Syekh Misyari
              </button>
            </div>
            <p className="font-quran text-xl sm:text-2xl text-right leading-loose text-emerald-950 my-1" dir="rtl">
              {ayat.arabicText}
            </p>
            <p className="text-xs text-gray-700 italic border-t border-gray-200 pt-1.5 mt-1">
              "{ayat.translation}"
            </p>
          </div>

          {/* Word By Word List Scrollable */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-2.5">
            <p className="text-xs font-bold text-gray-600 mb-2">Rincian Kata & Terjemahan:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {words.map((w, idx) => {
                const isHighlighted = selectedWord?.id === w.id;

                return (
                  <div
                    key={w.id || idx}
                    className={`p-3 rounded-xl border-2 border-black transition-all ${
                      isHighlighted
                        ? 'bg-[#FEF3C7] shadow-[3px_3px_0px_0px_#D97706]'
                        : 'bg-white shadow-[2px_2px_0px_0px_#111827] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="w-5 h-5 rounded bg-gray-100 border border-black text-[10px] font-bold flex items-center justify-center text-gray-700">
                        {idx + 1}
                      </span>
                      <p className="font-quran text-xl text-right font-bold text-emerald-950" dir="rtl">
                        {w.arabic}
                      </p>
                    </div>

                    <div className="mt-2 border-t border-dashed border-gray-300 pt-1.5">
                      <p className="text-xs font-bold text-[#0B4627]">{w.transliteration}</p>
                      <p className="text-xs font-medium text-gray-800 mt-0.5">"{w.meaningId}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </NeobrutalCard>
      </div>
    </div>
  );
};

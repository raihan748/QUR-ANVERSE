import React, { useState } from 'react';
import { RotateCcw, Sparkles, Check } from 'lucide-react';
import { DZIKIR_PAGI_PETANG } from '../../data/dzikirData';
import { NeobrutalCard } from '../common/NeobrutalCard';

export const DzikirCounter: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [count, setCount] = useState(0);

  const currentDzikir = DZIKIR_PAGI_PETANG[currentIndex];

  const handleTap = () => {
    if (count + 1 >= currentDzikir.repeatCount) {
      setCount(0);
      if (currentIndex + 1 < DZIKIR_PAGI_PETANG.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        alert('Alhamdulillah! Dzikir harian Anda telah tuntas.');
        setCurrentIndex(0);
      }
    } else {
      setCount(count + 1);
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  return (
    <NeobrutalCard variant="white" className="p-6 border-3 border-black shadow-[6px_6px_0px_0px_#111827]">
      <div className="flex items-center justify-between border-b-2 border-dashed border-gray-300 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-[#F59E0B] border-2 border-black flex items-center justify-center text-black font-extrabold text-xs">
            📿
          </span>
          <div>
            <h4 className="text-base font-extrabold text-black">Tasbih Digital & Dzikir Pagi Petang</h4>
            <p className="text-xs text-gray-500">
              Dzikir ke-{currentIndex + 1} dari {DZIKIR_PAGI_PETANG.length}
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="p-2 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg neo-button cursor-pointer"
          title="Reset Hitungan"
        >
          <RotateCcw className="w-4 h-4 text-black" />
        </button>
      </div>

      {/* Dzikir Text */}
      <div className="text-center py-4 bg-[#FFFDF7] border-2 border-black rounded-2xl p-4 mb-5">
        <p className="font-quran text-2xl sm:text-3xl text-emerald-950 font-bold leading-loose" dir="rtl">
          {currentDzikir.arabic}
        </p>
        <p className="text-xs font-bold text-[#0B4627] italic mt-2">
          {currentDzikir.transliteration}
        </p>
        <p className="text-xs text-gray-700 mt-1">
          "{currentDzikir.translation}"
        </p>
        <p className="text-[11px] text-amber-900 bg-amber-100 p-2 rounded-lg mt-3 border border-amber-300">
          ✨ Keutamaan: {currentDzikir.note}
        </p>
      </div>

      {/* Big Interactive Tap Counter */}
      <div className="text-center space-y-3">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={handleTap}
            className="w-36 h-36 rounded-full bg-[#0B4627] hover:bg-[#064E3B] active:scale-95 text-white border-4 border-black shadow-[6px_6px_0px_0px_#111827] flex flex-col items-center justify-center cursor-pointer transition-all"
          >
            <span className="text-3xl font-black font-mono text-[#F59E0B]">{count}</span>
            <span className="text-[11px] font-extrabold text-emerald-200 mt-1">
              / {currentDzikir.repeatCount}x (Tap)
            </span>
          </button>
        </div>

        <p className="text-xs font-bold text-gray-500">
          Sentuh lingkaran tasbih di atas setiap selesai membaca 1 kali.
        </p>
      </div>
    </NeobrutalCard>
  );
};

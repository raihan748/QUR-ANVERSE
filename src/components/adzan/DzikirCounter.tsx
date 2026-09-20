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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Tasbih Digital & Dzikir Pagi Petang</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dzikir ke-{currentIndex + 1} dari {DZIKIR_PAGI_PETANG.length}
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition"
          title="Reset Hitungan"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Dzikir Text */}
      <div className="text-center py-5 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 sm:p-5 mb-5">
        <p className="font-quran text-2xl sm:text-3xl text-emerald-950 dark:text-emerald-200 font-bold leading-loose" dir="rtl">
          {currentDzikir.arabic}
        </p>
        <p className="text-xs font-semibold text-[#0B4627] dark:text-emerald-400 italic mt-2.5">
          {currentDzikir.transliteration}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl mx-auto">
          "{currentDzikir.translation}"
        </p>
        <p className="text-[11px] text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg mt-3 border border-amber-200/80 dark:border-amber-800 flex items-center justify-center gap-1.5 max-w-md mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Keutamaan: {currentDzikir.note}</span>
        </p>
      </div>

      {/* Big Interactive Tap Counter */}
      <div className="text-center space-y-3">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={handleTap}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-[#0B4627] to-[#042413] hover:from-[#0d522e] hover:to-[#07301b] active:scale-95 text-white border-2 border-emerald-600/40 shadow-md flex flex-col items-center justify-center cursor-pointer transition-all"
          >
            <span className="text-3xl font-bold font-mono text-amber-300">{count}</span>
            <span className="text-[11px] font-medium text-emerald-200/90 mt-1">
              / {currentDzikir.repeatCount}x (Tap)
            </span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Sentuh lingkaran tasbih di atas setiap selesai membaca 1 kali.
        </p>
      </div>
    </div>
  );
};

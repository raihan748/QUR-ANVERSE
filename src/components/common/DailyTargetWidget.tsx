import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Flame, 
  RotateCcw, 
  BookOpen, 
  Settings2,
  Trophy
} from 'lucide-react';
import { NeobrutalCard } from './NeobrutalCard';
import { 
  DailyQuranTarget, 
  getDailyTarget, 
  setCustomDailyTarget, 
  resetDailyTargetProgress 
} from '../../services/dailyTargetService';
import { SURAH_LIST } from '../../data/quranData';

interface DailyTargetWidgetProps {
  onStartTarget?: (target: DailyQuranTarget) => void;
  onTargetChanged?: (newTarget: DailyQuranTarget) => void;
  compact?: boolean;
}

export const DailyTargetWidget: React.FC<DailyTargetWidgetProps> = ({
  onStartTarget,
  onTargetChanged,
  compact = false
}) => {
  const [target, setTarget] = useState<DailyQuranTarget>(getDailyTarget());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setTarget(getDailyTarget());
  }, []);

  const handleSelectSurah = (surahNumber: number) => {
    const updated = setCustomDailyTarget(surahNumber);
    setTarget(updated);
    setIsModalOpen(false);
    if (onTargetChanged) {
      onTargetChanged(updated);
    }
  };

  const progressPercentage = Math.min(
    100,
    Math.round((target.completedAyahNumbers.length / Math.max(1, target.ayahCount)) * 100)
  );

  const filteredSurahs = SURAH_LIST.filter(
    (s) =>
      s.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString().includes(searchQuery) ||
      s.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="bg-[#FEF3C7] border-3 border-black rounded-2xl p-4 sm:p-5 shadow-[5px_5px_0px_0px_#111827] space-y-3">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F59E0B] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-400">
                  Target Tilawah & Muroja'ah Hari Ini
                </span>
                {target.isCompleted && (
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded border border-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Khatam Hari Ini!
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-black">
                QS. {target.surahName} ({target.surahArabic}) • {target.ayahCount} Ayat (Juz {target.juz})
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-2.5 py-1.5 bg-white hover:bg-amber-100 text-black border-2 border-black rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Ganti Target</span>
            </button>

            {onStartTarget && (
              <button
                onClick={() => onStartTarget(target)}
                className="px-4 py-1.5 bg-[#0B4627] hover:bg-[#08331c] text-[#F59E0B] border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 neo-button cursor-pointer"
              >
                <span>Mulai Baca Target</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-black text-gray-800">
            <span>
              Kemajuan Bacaan: <strong>{target.completedAyahNumbers.length}</strong> dari <strong>{target.ayahCount}</strong> Ayat
            </span>
            <span className="text-amber-900 font-mono font-black">{progressPercentage}%</span>
          </div>

          <div className="w-full h-4 bg-white rounded-full border-2 border-black overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all ${
                target.isCompleted ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
              }`}
              style={{ width: `${Math.max(4, progressPercentage)}%` }}
            />
          </div>
        </div>

        {/* Reward Bonus Information */}
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 pt-1 border-t border-amber-300">
          <span className="flex items-center gap-1 text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            Bonus Target: <strong>+{target.xpReward} XP</strong> & Pertahankan Streak 🔥
          </span>
          <span className="text-gray-500 text-[10px]">
            Diperbarui Otomatis Setiap Hari
          </span>
        </div>
      </div>

      {/* MODAL GANTI TARGET HARIAN (NON-CLIPPING / FULL RESPONSIVE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-black rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-[8px_8px_0px_0px_#000] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-[#0B4627] text-white border-b-3 border-black flex items-center justify-between">
              <div>
                <h4 className="text-base font-black">Pilih Target Tilawah / Muroja'ah Hari Ini</h4>
                <p className="text-xs text-emerald-200">Pilih surat yang ingin Anda fokuskan hari ini</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white text-black font-black text-sm flex items-center justify-center border-2 border-black cursor-pointer hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b-2 border-black bg-amber-50">
              <input
                type="text"
                placeholder="Cari surat (contoh: Al-Mulk, Yasin, Al-Kahf, 67)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
                autoFocus
              />
            </div>

            {/* Quick Filter Categories */}
            <div className="px-3 py-2 bg-gray-100 border-b border-gray-300 flex items-center gap-1.5 overflow-x-auto text-[11px] font-black">
              <span className="text-gray-500 shrink-0">Pilihan Cepat:</span>
              {[
                { no: 67, label: 'Al-Mulk (Juz 29)' },
                { no: 78, label: 'An-Naba\' (Juz 30)' },
                { no: 36, label: 'Ya-Sin' },
                { no: 56, label: 'Al-Waqi\'ah' },
                { no: 18, label: 'Al-Kahf' },
                { no: 1, label: 'Al-Fatihah' }
              ].map((rec) => (
                <button
                  key={rec.no}
                  onClick={() => handleSelectSurah(rec.no)}
                  className="px-2.5 py-1 bg-white hover:bg-amber-200 border border-black rounded-lg shrink-0 cursor-pointer text-black"
                >
                  {rec.label}
                </button>
              ))}
            </div>

            {/* Surah List Scrollable */}
            <div className="p-3 overflow-y-auto space-y-1.5 flex-1 max-h-96">
              {filteredSurahs.map((s) => {
                const isSelected = s.number === target.surahNumber;
                return (
                  <button
                    key={s.number}
                    onClick={() => handleSelectSurah(s.number)}
                    className={`w-full p-2.5 rounded-xl border-2 border-black text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white hover:bg-amber-50 text-black'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black">#{s.number}</span>
                        <span className="font-extrabold text-xs">{s.latinName}</span>
                        <span className="text-[10px] opacity-75">({s.meaning})</span>
                      </div>
                      <span className="text-[10px] opacity-80 block mt-0.5">
                        {s.ayahCount} Ayat • Juz {s.juzStart} • {s.revelationPlace}
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
    </>
  );
};

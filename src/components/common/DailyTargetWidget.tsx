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
  Trophy,
  Calendar,
  X
} from 'lucide-react';
import { NeobrutalCard } from './NeobrutalCard';
import { 
  DailyQuranTarget, 
  getDailyTarget, 
  setCustomDailyTarget, 
  resetDailyTargetProgress,
  getCurrentDayNumber,
  RoadmapDayItem
} from '../../services/dailyTargetService';
import { SURAH_LIST } from '../../data/quranData';
import { AnnualRoadmapModal } from '../dashboard/AnnualRoadmapModal';
import { useLanguage } from '../../context/LanguageContext';

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
  const { language, t } = useLanguage();
  const [target, setTarget] = useState<DailyQuranTarget>(getDailyTarget());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const currentDayNum = getCurrentDayNumber();

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

  const handleSelectFromRoadmap = (day: RoadmapDayItem) => {
    const updated = setCustomDailyTarget(day.surahNumber);
    setTarget(updated);
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
      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B4627] text-amber-300 border border-emerald-800 flex items-center justify-center font-bold text-xs font-mono shadow-xs shrink-0">
              #{currentDayNum}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-900/40 px-2 py-0.5 rounded-md border border-amber-300/80 dark:border-amber-800">
                  {language === 'ar' ? `ورد اليوم #${currentDayNum} من ٣٦٥ يوماً` : `Target Hari #${currentDayNum} / 365 Hari`}
                </span>
                {target.isCompleted && (
                  <span className="text-[10px] font-semibold uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {language === 'ar' ? 'اكتمل ورد اليوم!' : 'Khatam Hari Ini!'}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {language === 'ar' 
                  ? `سورة ${target.surahArabic} (${target.ayahCount} آية - الجزء ${target.juz})`
                  : `QS. ${target.surahName} (${target.surahArabic}) • ${target.ayahCount} Ayat (Juz ${target.juz})`}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            <button
              onClick={() => setIsRoadmapOpen(true)}
              className="px-3 py-1.5 bg-amber-100/80 dark:bg-amber-900/40 hover:bg-amber-200/90 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'خطة ٣٦٥ يوماً' : 'Roadmap 365 Hari'}</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تغيير السورة' : 'Ganti Target'}</span>
            </button>

            {onStartTarget && (
              <button
                onClick={() => onStartTarget(target)}
                className="px-4 py-1.5 bg-[#0B4627] hover:bg-[#07331b] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
              >
                <span>{t.dailyTargetAction}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>
              {language === 'ar'
                ? `التقدم: ${target.completedAyahNumbers.length} من ${target.ayahCount} آية`
                : `Kemajuan Bacaan: ${target.completedAyahNumbers.length} dari ${target.ayahCount} Ayat`}
            </span>
            <span className="text-amber-900 dark:text-amber-400 font-mono font-bold">{progressPercentage}%</span>
          </div>

          <div className="w-full h-2.5 bg-amber-200/50 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                target.isCompleted ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.max(3, progressPercentage)}%` }}
            />
          </div>
        </div>

        {/* Target Info */}
        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1.5 border-t border-amber-200/70 dark:border-amber-900/30">
          <span className="flex items-center gap-1 text-amber-900 dark:text-amber-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {language === 'ar'
              ? `المحافظة على الورد اليومي والختمة المستمرة`
              : `Target Harian Muroja'ah Istiqomah`}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono">
            {language === 'ar' ? 'خطة سنوية متكاملة (١٤٤٨ هـ)' : 'Plan: 23 Agu 2026 - 23 Agu 2027 (1 Tahun)'}
          </span>
        </div>
      </div>

      {/* Modal Roadmap 365 Hari */}
      <AnnualRoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
        onSelectTargetDay={handleSelectFromRoadmap}
      />

      {/* Modal Ganti Target Harian */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-[#0B4627] text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Pilih Target Tilawah / Muroja'ah Hari Ini</h4>
                <p className="text-xs text-emerald-200/90 mt-0.5">Pilih surat yang ingin Anda fokuskan hari ini</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <input
                type="text"
                placeholder="Cari surat (contoh: Al-Mulk, Yasin, Al-Kahf, 67)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
                autoFocus
              />
            </div>

            {/* Quick Filter Categories */}
            <div className="px-3 py-2 bg-slate-50/70 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 shrink-0 font-medium">Pilihan Cepat:</span>
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
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shrink-0 cursor-pointer text-slate-700 dark:text-slate-200 font-medium transition"
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
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B4627] text-white border-[#0B4627] shadow-xs'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>#{s.number}</span>
                        <span className="font-semibold text-xs">{s.latinName}</span>
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

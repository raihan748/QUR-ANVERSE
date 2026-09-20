import React, { useState } from 'react';
import { 
  Calendar, 
  Target, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  BookOpen, 
  RotateCcw, 
  ChevronRight, 
  Search, 
  Trophy,
  Filter,
  Clock,
  X
} from 'lucide-react';
import { 
  RoadmapDayItem, 
  generate365DayCurriculum, 
  getAnnualProgress, 
  getCurrentDayNumber 
} from '../../services/dailyTargetService';

interface AnnualRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTargetDay?: (day: RoadmapDayItem) => void;
}

export const AnnualRoadmapModal: React.FC<AnnualRoadmapModalProps> = ({
  isOpen,
  onClose,
  onSelectTargetDay
}) => {
  const [curriculum] = useState<RoadmapDayItem[]>(generate365DayCurriculum());
  const [annualProgress] = useState(getAnnualProgress());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const currentDayNum = getCurrentDayNumber();

  if (!isOpen) return null;

  const filteredDays = curriculum.filter((day) => {
    const matchesSearch =
      day.surahName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      day.dayNumber.toString().includes(searchQuery) ||
      day.date.includes(searchQuery);

    if (!matchesSearch) return false;

    if (selectedMonth !== 'all') {
      const monthPrefix = selectedMonth; // e.g. "2026-08"
      return day.date.startsWith(monthPrefix);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-[#032313] text-white border-b border-emerald-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-lg border border-amber-400/30 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Master Plan 1 Tahun (365 Hari)
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold rounded-lg border border-emerald-400/30">
                23 Agu 2026 s/d 23 Agu 2027
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
              Roadmap Khatam & Hafalan Al-Qur'an 365 Hari
            </h3>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Kurikulum target harian terstruktur yang mencakup 30 Juz & 114 Surat Al-Qur'an dalam 1 tahun penuh.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 text-white font-bold text-sm flex items-center justify-center border border-white/20 cursor-pointer hover:bg-red-500/80 hover:border-red-400 transition-colors shrink-0"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Overview Bar */}
        <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B4627] text-amber-400 border border-emerald-700/60 flex items-center justify-center font-mono font-bold text-sm shadow-xs">
              #{currentDayNum}
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase block tracking-wider">Posisi Hari Ini:</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Hari ke-{currentDayNum} dari 365 Hari ({annualProgress.completionPercentage}% Selesai)
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <span className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{annualProgress.completedDaysCount} Hari Tuntas</span>
            </span>
            <span className="px-3 py-1.5 bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-300 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{365 - annualProgress.completedDaysCount} Hari Tersisa</span>
            </span>
          </div>
        </div>

        {/* Filter Controls (Search + Month Tabs) */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 space-y-2.5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari hari, tanggal (2026-08), atau surat (Al-Mulk, Yasin)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
              />
            </div>
          </div>

          {/* Quick Month Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1 scrollbar-none">
            <span className="text-slate-400 font-medium shrink-0">Bulan:</span>
            {[
              { id: 'all', label: 'Semua 365 Hari' },
              { id: '2026-08', label: 'Agu 26' },
              { id: '2026-09', label: 'Sep 26' },
              { id: '2026-10', label: 'Okt 26' },
              { id: '2026-11', label: 'Nov 26' },
              { id: '2026-12', label: 'Des 26' },
              { id: '2027-01', label: 'Jan 27' },
              { id: '2027-02', label: 'Feb 27' },
              { id: '2027-03', label: 'Mar 27' },
              { id: '2027-04', label: 'Apr 27' },
              { id: '2027-05', label: 'Mei 27' },
              { id: '2027-06', label: 'Jun 27' },
              { id: '2027-07', label: 'Jul 27' },
              { id: '2027-08', label: 'Agu 27' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMonth(m.id)}
                className={`px-2.5 py-1 rounded-lg border shrink-0 cursor-pointer font-medium transition-all ${
                  selectedMonth === m.id
                    ? 'bg-[#0B4627] text-amber-300 border-emerald-700 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 365-Day Grid / List */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50/50 dark:bg-slate-950">
          {filteredDays.map((day) => {
            const isToday = day.dayNumber === currentDayNum;

            return (
              <div
                key={day.dayNumber}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2 shadow-xs ${
                  isToday
                    ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-400 ring-2 ring-amber-400/40'
                    : day.isCompleted
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800'
                    : 'bg-white dark:bg-slate-850 border-slate-200/90 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-1.5 mb-1.5">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-900 dark:bg-slate-800 text-slate-100">
                      Hari #{day.dayNumber}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {day.date}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        QS. {day.surahName}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                        Ayat {day.ayahStart} - {day.ayahEnd} ({day.ayahCount} Ayat • Juz {day.juz})
                      </p>
                    </div>

                    <span className="font-quran text-lg font-bold text-slate-800 dark:text-slate-200" dir="rtl">
                      {day.surahArabic}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                  {day.isCompleted ? (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tuntas
                    </span>
                  ) : isToday ? (
                    <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                      <Target className="w-3 h-3" /> Target Hari Ini
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">
                      Menunggu
                    </span>
                  )}

                  {onSelectTargetDay && (
                    <button
                      onClick={() => {
                        onSelectTargetDay(day);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-[#0B4627] hover:bg-[#07301a] text-amber-300 border border-emerald-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Buka Target →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

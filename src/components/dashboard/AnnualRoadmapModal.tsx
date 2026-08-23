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
  Filter
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-[10px_10px_0px_0px_#000] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-[#032313] text-white border-b-3 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-[#F59E0B] text-black text-[10px] font-black rounded-lg border border-black uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Master Plan 1 Tahun (365 Hari)
              </span>
              <span className="px-2.5 py-0.5 bg-[#10B981] text-black text-[10px] font-black rounded-lg border border-black">
                23 Agu 2026 – 23 Agu 2027
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-white">
              Roadmap Khatam & Hafalan Al-Qur'an 365 Hari
            </h3>
            <p className="text-xs text-emerald-200 mt-0.5">
              Kurikulum target harian acak terstruktur yang mencakup 30 Juz & 114 Surat Al-Qur'an dalam 1 tahun penuh.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-white text-black font-black text-sm flex items-center justify-center border-2 border-black cursor-pointer hover:bg-red-500 hover:text-white shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Progress Overview Bar */}
        <div className="p-4 bg-[#FEF3C7] border-b-2 border-black flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B4627] text-[#F59E0B] border-2 border-black flex items-center justify-center font-mono font-black text-sm">
              #{currentDayNum}
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-900 uppercase block">Posisi Hari Ini:</span>
              <h4 className="text-sm font-black text-black">
                Hari ke-{currentDayNum} dari 365 Hari ({annualProgress.completionPercentage}% Selesai)
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-black">
            <span className="px-3 py-1.5 bg-white rounded-xl border-2 border-black">
              ✅ {annualProgress.completedDaysCount} Hari Tuntas
            </span>
            <span className="px-3 py-1.5 bg-white rounded-xl border-2 border-black text-amber-900">
              ⏳ {365 - annualProgress.completedDaysCount} Hari Tersisa
            </span>
          </div>
        </div>

        {/* Filter Controls (Search + Month Tabs) */}
        <div className="p-3 bg-gray-100 border-b-2 border-black space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                placeholder="Cari hari, tanggal (2026-08), atau surat (Al-Mulk, Yasin)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
              />
            </div>
          </div>

          {/* Quick Month Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-black pb-1">
            <span className="text-gray-500 shrink-0">Bulan:</span>
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
                className={`px-2.5 py-1 rounded-lg border shrink-0 cursor-pointer font-bold ${
                  selectedMonth === m.id
                    ? 'bg-[#0B4627] text-[#F59E0B] border-black font-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-amber-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 365-Day Grid / List */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-[#F8F5EE]">
          {filteredDays.map((day) => {
            const isToday = day.dayNumber === currentDayNum;

            return (
              <div
                key={day.dayNumber}
                className={`p-3.5 rounded-2xl border-2 border-black transition-all flex flex-col justify-between gap-2 shadow-[2px_2px_0px_0px_#000] ${
                  isToday
                    ? 'bg-[#FEF3C7] ring-3 ring-[#0B4627] scale-[1.01]'
                    : day.isCompleted
                    ? 'bg-[#D1FAE5]'
                    : 'bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-black/10 pb-1.5 mb-1.5">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-black text-white">
                      Hari #{day.dayNumber}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500">
                      {day.date}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-black text-xs text-black">
                        QS. {day.surahName}
                      </h5>
                      <p className="text-[11px] text-gray-600 font-medium">
                        Ayat {day.ayahStart} - {day.ayahEnd} ({day.ayahCount} Ayat • Juz {day.juz})
                      </p>
                    </div>

                    <span className="font-quran text-lg font-bold text-black" dir="rtl">
                      {day.surahArabic}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-black/10 flex items-center justify-between">
                  {day.isCompleted ? (
                    <span className="text-[10px] font-black text-emerald-800 flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Tuntas
                    </span>
                  ) : isToday ? (
                    <span className="text-[10px] font-black text-amber-900 flex items-center gap-1 bg-amber-200 px-2 py-0.5 rounded border border-amber-400">
                      <Target className="w-3 h-3" /> Target Hari Ini
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400">
                      Menunggu
                    </span>
                  )}

                  {onSelectTargetDay && (
                    <button
                      onClick={() => {
                        onSelectTargetDay(day);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-[#0B4627] text-[#F59E0B] border border-black rounded-lg text-[10px] font-black hover:bg-[#08331c] cursor-pointer"
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

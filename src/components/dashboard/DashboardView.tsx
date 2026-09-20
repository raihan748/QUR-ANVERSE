import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw, 
  Calendar, 
  TrendingUp, 
  Award,
  BookOpen,
  Building2,
  Flame,
  CheckSquare,
  Trophy,
  Headphones,
  Zap,
  Crown,
  Check,
  Circle
} from 'lucide-react';
import { UserProfile, WeakVerse, AchievementBadge } from '../../types';
import { getWeakVerses, resolveWeakVerse } from '../../services/offlineStorage';
import { INITIAL_BADGES } from '../../data/achievementsData';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { audioPlayer } from '../../services/audioPlayerService';
import { TahfidzMasteryAnalytics } from './TahfidzMasteryAnalytics';
import { DailyTargetWidget } from '../common/DailyTargetWidget';

import { prayerAttendance } from '../../services/prayerAttendanceService';

interface DashboardViewProps {
  userProfile: UserProfile;
  onNavigateToMurojaah: () => void;
  onOpenPrayerAttendanceModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  onNavigateToMurojaah,
  onOpenPrayerAttendanceModal
}) => {
  const [weakVerses, setWeakVerses] = useState<WeakVerse[]>([]);
  const [badges, setBadges] = useState<AchievementBadge[]>(INITIAL_BADGES);
  const [prayerStats, setPrayerStats] = useState(() => prayerAttendance.getSummaryStats());
  const [todayAttendance, setTodayAttendance] = useState(() => prayerAttendance.getTodayAttendance());

  useEffect(() => {
    setWeakVerses(getWeakVerses());

    const handleAttendanceUpdated = () => {
      const stats = prayerAttendance.getSummaryStats();
      const today = prayerAttendance.getTodayAttendance();
      setPrayerStats({ ...stats });
      setTodayAttendance({ ...today, records: { ...today.records } });
    };
    window.addEventListener('qv_prayer_attendance_updated', handleAttendanceUpdated);
    return () => {
      window.removeEventListener('qv_prayer_attendance_updated', handleAttendanceUpdated);
    };
  }, []);

  const handleResolveWeak = (v: WeakVerse) => {
    resolveWeakVerse(v.surahNumber, v.ayahNumber);
    setWeakVerses(getWeakVerses());
  };

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto">
      {/* Profile Overview Card */}
      <div className="bg-gradient-to-r from-[#0B4627] to-[#06331D] text-white rounded-2xl p-5 sm:p-6 border border-emerald-800/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold text-xl shadow-xs">
              {userProfile.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-800/80 text-emerald-200 rounded-full border border-emerald-600/40 uppercase tracking-wide">
                  {userProfile.hafidzLevel}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                {userProfile.fullName}
              </h2>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Target Khatam Muroja'ah: <span className="text-white font-medium">30 Juz Mutqin</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Jurnal & Absensi Sholat 5 Waktu */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-[#0B4627] dark:text-emerald-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Jurnal & Absensi Sholat Fardhu
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                {prayerStats.todayCompleted} / 5 Selesai ({prayerStats.percentage}%)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Disiplin: <strong className="text-amber-600 dark:text-amber-400 font-semibold">{prayerStats.streakDays} Hari</strong></span>
              </span>
              <span>•</span>
              <span>Pahala Hari Ini: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">+{prayerStats.todayXp} XP</strong></span>
            </p>
            {/* Quick 5-Prayer Check Status Badges */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
              {(['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'] as const).map((pId) => {
                const rec = todayAttendance.records[pId];
                const isDone = rec && rec.status !== 'belum';
                const label = pId.charAt(0).toUpperCase() + pId.slice(1);
                return (
                  <button
                    key={pId}
                    type="button"
                    onClick={onOpenPrayerAttendanceModal}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}
                    title={`Klik untuk mencatat absensi sholat ${label}`}
                  >
                    <span className="flex items-center justify-center">
                      {isDone ? <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" /> : <Circle className="w-2.5 h-2.5 text-slate-400" />}
                    </span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {onOpenPrayerAttendanceModal && (
          <button
            onClick={onOpenPrayerAttendanceModal}
            className="w-full sm:w-auto px-4 py-2 bg-[#0B4627] hover:bg-[#08351d] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition shrink-0"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Ceklis Sholat</span>
          </button>
        )}
      </div>

      {/* Target Tilawah & Muroja'ah Hari Ini */}
      <DailyTargetWidget onStartTarget={() => onNavigateToMurojaah()} />

      {/* Statistik Kelancaran & Analisis Tajwid */}
      <TahfidzMasteryAnalytics 
        userProfile={userProfile} 
        onNavigateToMurojaah={onNavigateToMurojaah} 
      />

      {/* Pelacak Ayat Lemah (Tikrar 1-5-10) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Pelacak Ayat Lemah (Metode Tikrar 1-5-10)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pengulangan berkala Hari ke-1, ke-5, dan ke-10 agar hafalan mutqin.
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-lg border border-red-200">
            {weakVerses.filter(v => !v.resolved).length} Perlu Diulang
          </span>
        </div>

        {weakVerses.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            Belum ada ayat lemah tercatat. Mulai sesi muroja'ah untuk melatih hafalan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {weakVerses.map((v) => (
              <div
                key={`${v.surahNumber}_${v.ayahNumber}`}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  v.resolved
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-red-50/50 border-red-200'
                }`}
              >
                <div>
                  <p className="font-bold text-xs text-slate-900">
                    QS. {v.surahNumber} : Ayat {v.ayahNumber}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Salah diulang {v.errorCount}x • Terakhir: {v.lastTestedDate}
                  </p>
                </div>
                {!v.resolved && (
                  <button
                    onClick={() => handleResolveWeak(v)}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition cursor-pointer text-slate-700"
                    title="Tandai Sudah Lancar"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Koleksi Lencana */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Koleksi Lencana Hafalan</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map((b) => {
            const renderIcon = () => {
              const cls = "w-5 h-5 shrink-0";
              switch (b.icon) {
                case 'sparkles': return <Sparkles className={`${cls} text-amber-500`} />;
                case 'crown': return <Crown className={`${cls} text-amber-500`} />;
                case 'flame': return <Flame className={`${cls} text-orange-500`} />;
                case 'trophy': return <Trophy className={`${cls} text-yellow-500`} />;
                case 'headphones': return <Headphones className={`${cls} text-blue-500`} />;
                case 'zap': return <Zap className={`${cls} text-amber-500`} />;
                case 'book': return <BookOpen className={`${cls} text-emerald-600`} />;
                default: return <Award className={`${cls} text-[#0B4627]`} />;
              }
            };

            return (
              <div
                key={b.id}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  b.unlocked
                    ? 'bg-emerald-50/60 border-emerald-200/80 text-slate-900'
                    : 'bg-slate-50/70 border-slate-200/80 opacity-60'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-xs">
                  {renderIcon()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-xs text-slate-900">{b.title}</p>
                    {b.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{b.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

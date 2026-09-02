import React, { useState, useEffect } from 'react';
import { PrayerTime, DailyPrayerAttendance, PrayerAttendanceStatus } from '../../types';
import { 
  prayerAttendance, 
  FARDHU_PRAYER_IDS, 
  PRAYER_DISPLAY_META, 
  PRAYER_XP_REWARDS 
} from '../../services/prayerAttendanceService';
import confetti from 'canvas-confetti';

interface PrayerAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerTimes: PrayerTime[];
  duePrayer?: PrayerTime | null;
  minutesPassed?: number;
  onXpAwarded?: (xpGained: number) => void;
}

export const PrayerAttendanceModal: React.FC<PrayerAttendanceModalProps> = ({
  isOpen,
  onClose,
  prayerTimes,
  duePrayer,
  minutesPassed = 30,
  onXpAwarded
}) => {
  const [attendance, setAttendance] = useState<DailyPrayerAttendance>(prayerAttendance.getTodayAttendance());
  const [justAwardedXp, setJustAwardedXp] = useState<number | null>(null);
  const [streakDays, setStreakDays] = useState<number>(prayerAttendance.getPrayerStreak());

  useEffect(() => {
    if (isOpen) {
      setAttendance(prayerAttendance.getTodayAttendance());
      setStreakDays(prayerAttendance.getPrayerStreak());
      setJustAwardedXp(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectStatus = (
    prayerId: 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya',
    status: PrayerAttendanceStatus
  ) => {
    const { attendance: updated, diffXp } = prayerAttendance.recordPrayer(prayerId, status);
    setAttendance({ ...updated });
    setStreakDays(prayerAttendance.getPrayerStreak());

    if (diffXp > 0) {
      setJustAwardedXp(diffXp);
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}

      if (onXpAwarded) {
        onXpAwarded(diffXp);
      }

      setTimeout(() => {
        setJustAwardedXp(null);
      }, 3000);
    }
  };

  const handleSnooze = () => {
    if (duePrayer) {
      prayerAttendance.dismissPopupForNow(duePrayer.id, 15);
    }
    onClose();
  };

  // Cari waktu sholat hari ini
  const getPrayerScheduleTime = (prayerId: string): string => {
    const found = prayerTimes.find((p) => p.id === prayerId);
    return found ? found.timeStr : PRAYER_DISPLAY_META[prayerId]?.defaultTime || '--:--';
  };

  const completedCount = attendance.completedCount || 0;
  const progressPercent = Math.round((completedCount / 5) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#0F172A] border-2 border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-950/80 overflow-hidden text-white font-sans">
        
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500"></div>

        {/* Floating Reward Toast Notification */}
        {justAwardedXp !== null && justAwardedXp > 0 && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-emerald-600 text-white font-bold px-4 py-2 rounded-2xl shadow-xl animate-bounce">
            <span className="text-xl">✨</span>
            <span>+{justAwardedXp} XP Diperoleh!</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900/90 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-2xl shadow-lg shadow-emerald-900/50 border border-emerald-400/30">
              🕌
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Jurnal & Absensi Sholat 5 Waktu
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Fardhu
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Pantau kedisiplinan sholat harian & raih pahala berlipat ganda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">

          {/* Alert Banner if Triggered by 30-Minute Post-Adhan */}
          {duePrayer && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-900 border border-amber-500/40 flex items-start gap-3 shadow-lg">
              <span className="text-2xl animate-pulse">⏰</span>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-amber-300">
                  Peringatan Waktu Sholat {duePrayer.name} (+{minutesPassed} Menit)
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
                  Sudah lebih dari <span className="text-amber-300 font-semibold">{minutesPassed} menit</span> sejak Adzan <span className="font-bold text-white">{duePrayer.name}</span> berkumandang. Sudahkah antum menunaikan sholat {duePrayer.name}?
                </p>
              </div>
            </div>
          )}

          {/* Daily Progress & Streak Header */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex items-center gap-4">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-14 h-14 -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    className="text-slate-800"
                    strokeWidth="6"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    className="text-emerald-500 transition-all duration-500"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 24}
                    strokeDashoffset={2 * Math.PI * 24 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-xs font-black text-white">
                  {progressPercent}%
                </span>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-400">Progres Sholat Hari Ini</div>
                <div className="text-lg font-black text-white">
                  {completedCount} <span className="text-xs font-normal text-slate-400">dari 5 Sholat Selesai</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <div>
                  <div className="text-[10px] text-amber-400/80 font-bold uppercase">Streak Sholat</div>
                  <div className="text-sm font-black text-amber-300">{streakDays} Hari Rutin</div>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
                <span className="text-lg">✨</span>
                <div>
                  <div className="text-[10px] text-emerald-400/80 font-bold uppercase">Total Pahala XP</div>
                  <div className="text-sm font-black text-emerald-300">+{attendance.totalXpEarned || 0} XP</div>
                </div>
              </div>
            </div>
          </div>

          {/* 5 Fardhu Prayer Attendance List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>📋 Ceklis Sholat Fardhu Hari Ini</span>
            </h3>

            {FARDHU_PRAYER_IDS.map((pId) => {
              const meta = PRAYER_DISPLAY_META[pId];
              const scheduleTime = getPrayerScheduleTime(pId);
              const record = attendance.records[pId];
              const currentStatus: PrayerAttendanceStatus = record ? record.status : 'belum';
              const isDueNow = duePrayer && duePrayer.id === pId;

              return (
                <div
                  key={pId}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    isDueNow && currentStatus === 'belum'
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/40 ring-2 ring-amber-500/30'
                      : currentStatus !== 'belum'
                      ? 'bg-slate-900/90 border-emerald-500/30'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Left Info: Icon, Name, Arabic & Time */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">
                        {meta.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base sm:text-lg">{meta.name}</span>
                          <span className="font-arabic text-slate-400 text-sm">{meta.arabic}</span>
                          {isDueNow && currentStatus === 'belum' && (
                            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-amber-500 text-slate-950 animate-pulse">
                              Waktunya Absen
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>Waktu: <strong className="text-slate-200">{scheduleTime}</strong></span>
                          {record && record.status !== 'belum' && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-medium">+{record.xpAwarded} XP</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Action Options: Buttons */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 w-full sm:w-auto">
                      {/* Option 1: Berjamaah */}
                      <button
                        onClick={() => handleSelectStatus(pId, 'jamaah_masjid')}
                        className={`px-2.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          currentStatus === 'jamaah_masjid'
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                        }`}
                        title="Sholat Berjamaah di Masjid (+50 XP)"
                      >
                        <span>🕌</span>
                        <span>Berjamaah</span>
                      </button>

                      {/* Option 2: Tepat Waktu */}
                      <button
                        onClick={() => handleSelectStatus(pId, 'tepat_waktu')}
                        className={`px-2.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          currentStatus === 'tepat_waktu'
                            ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30 ring-2 ring-sky-300'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                        }`}
                        title="Sholat Tepat Waktu (+30 XP)"
                      >
                        <span>⏰</span>
                        <span>Awal Waktu</span>
                      </button>

                      {/* Option 3: Munfarid */}
                      <button
                        onClick={() => handleSelectStatus(pId, 'munfarid')}
                        className={`px-2.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          currentStatus === 'munfarid'
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-300'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                        }`}
                        title="Sholat Sendirian / Munfarid (+20 XP)"
                      >
                        <span>🏠</span>
                        <span>Munfarid</span>
                      </button>

                      {/* Option 4: Belum */}
                      <button
                        onClick={() => handleSelectStatus(pId, 'belum')}
                        className={`px-2.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          currentStatus === 'belum'
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-slate-800/40 hover:bg-slate-800 text-slate-500 hover:text-slate-400'
                        }`}
                        title="Belum Menunaikan Sholat"
                      >
                        <span>⭕</span>
                        <span>Belum</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Motivational Hadith Card */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-3">
            <span className="text-xl text-emerald-400 shrink-0">📖</span>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed italic">
              "Amalan yang paling dicintai oleh Allah adalah sholat pada awal waktunya."
              <span className="block not-italic font-semibold text-emerald-400 text-xs mt-1">— HR. Bukhari & Muslim</span>
            </p>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            Total Absen Hari Ini: <strong className="text-white font-bold">{completedCount} / 5 Sholat</strong> ({progressPercent}%)
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {duePrayer && (
              <button
                onClick={handleSnooze}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-bold transition"
              >
                🕒 Ingatkan 15 Mnt Lagi
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2"
            >
              <span>✅ Simpan & Tutup</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Compass, 
  Clock, 
  MapPin, 
  Volume2, 
  Bell, 
  BellOff,
  Sparkles, 
  CheckCircle2, 
  BookOpen,
  VolumeX,
  Play,
  Globe,
  Navigation,
  Loader2,
  ChevronDown,
  Check,
  Download,
  Building2,
  CheckSquare,
  Flame,
  AlertCircle,
  X,
  Circle
} from 'lucide-react';
import { PrayerTime } from '../../types';
import { ADZAN_MARWAN_ALQASSAS_URL } from '../../services/audioPlayerService';
import { 
  fetchLiveInternetPrayerTimes, 
  buildPrayerTimesList, 
  calculatePrayerTimes, 
  getCountdownToNextPrayer, 
  getSavedLocation, 
  saveLocation, 
  detectBrowserGPSLocation,
  POPULAR_CITIES, 
  LocationConfig, 
  LivePrayerApiResponse 
} from '../../services/prayerTimeEngine';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { adzanGlobalService } from '../../services/adzanGlobalService';
import { nativeAdzanScheduler } from '../../services/nativeAdzanScheduler';
import { DzikirCounter } from './DzikirCounter';
import { DOA_SETELAH_ADZAN } from '../../data/dzikirData';
import { prayerAttendance } from '../../services/prayerAttendanceService';

interface PrayerTimesBannerProps {
  onOpenPrayerAttendanceModal?: () => void;
}

export const PrayerTimesBanner: React.FC<PrayerTimesBannerProps> = ({
  onOpenPrayerAttendanceModal
}) => {
  const [activeLocation, setActiveLocation] = useState<LocationConfig>(getSavedLocation());
  const [liveApiResponse, setLiveApiResponse] = useState<LivePrayerApiResponse | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>(calculatePrayerTimes(new Date(), getSavedLocation()));
  const [countdownData, setCountdownData] = useState(getCountdownToNextPrayer(prayerTimes));
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const lastAdzanTriggeredRef = useRef<string>('');
  const [attendanceStats, setAttendanceStats] = useState(() => prayerAttendance.getSummaryStats());
  const [todayAttendance, setTodayAttendance] = useState(() => prayerAttendance.getTodayAttendance());

  useEffect(() => {
    const handleAttendanceUpdated = () => {
      const stats = prayerAttendance.getSummaryStats();
      const today = prayerAttendance.getTodayAttendance();
      setAttendanceStats({ ...stats });
      setTodayAttendance({ ...today, records: { ...today.records } });
    };
    window.addEventListener('qv_prayer_attendance_updated', handleAttendanceUpdated);
    return () => {
      window.removeEventListener('qv_prayer_attendance_updated', handleAttendanceUpdated);
    };
  }, []);

  // Auto-Adzan State with Persisted Permission
  const [autoAdzanEnabled, setAutoAdzanEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('quranverse_auto_adzan_enabled_v1');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  // Auto-dismiss Toast
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  // Load Live Prayer Times from Internet
  const loadPrayerData = useCallback(async (loc: LocationConfig) => {
    try {
      const liveData = await fetchLiveInternetPrayerTimes(loc);
      setLiveApiResponse(liveData);
      const updatedList = buildPrayerTimesList(liveData.timings, new Date());
      setPrayerTimes(updatedList);
      setCountdownData(getCountdownToNextPrayer(updatedList));
    } catch (e) {
      console.warn('Fallback to local calculation:', e);
      const fallbackList = calculatePrayerTimes(new Date(), loc);
      setPrayerTimes(fallbackList);
      setCountdownData(getCountdownToNextPrayer(fallbackList));
    }
  }, []);

  useEffect(() => {
    loadPrayerData(activeLocation);
  }, [activeLocation, loadPrayerData]);

  // Update countdown every second & trigger auto-adzan
  useEffect(() => {
    const timer = setInterval(() => {
      const timings = liveApiResponse?.timings;
      const updatedList = timings
        ? buildPrayerTimesList(timings, new Date())
        : calculatePrayerTimes(new Date(), activeLocation);

      setPrayerTimes(updatedList);
      const countdown = getCountdownToNextPrayer(updatedList);
      setCountdownData(countdown);

      // Trigger automatic fullscreen Adzan if seconds reach 0 AND auto-adzan is enabled
      if (countdown.secondsRemaining === 0 && autoAdzanEnabled) {
        const prayerName = countdown.nextPrayer?.name || 'Shalat';
        const triggerKey = `${prayerName}_${new Date().toDateString()}_${new Date().getHours()}`;
        
        if (lastAdzanTriggeredRef.current !== triggerKey) {
          lastAdzanTriggeredRef.current = triggerKey;
          adzanGlobalService.triggerManual(prayerName);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [liveApiResponse, autoAdzanEnabled, activeLocation]);

  // Toggle Auto-Adzan & Request User Permission
  const handleToggleAutoAdzan = async () => {
    const nextState = !autoAdzanEnabled;
    if (nextState) {
      // 1. Request Notification Permission
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          if (Notification.permission !== 'granted') {
            await Notification.requestPermission();
          }
        } catch {}
      }

      // 2. Unlock Web Audio Context for background playback
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
        }
      } catch {}

      // 3. Sync Native Android Alarm Scheduler
      await nativeAdzanScheduler.initializeNativeAdzan();
      await nativeAdzanScheduler.scheduleUpcomingPrayerAdzans(7);

      setToastMessage('Adzan Otomatis AKTIF: Suara Syekh Muhammad Marwan Al-Qassas akan berkumandang saat waktu shalat tiba (Layar Terkunci & Web).');
    } else {
      setToastMessage('Adzan Otomatis DINONAKTIFKAN.');
    }

    setAutoAdzanEnabled(nextState);
    adzanGlobalService.setEnabled(nextState);
  };

  // Handle City Change
  const handleSelectCity = (cityConfig: LocationConfig) => {
    saveLocation(cityConfig);
    setActiveLocation(cityConfig);
    setIsCityDropdownOpen(false);
    setGpsError(null);
    nativeAdzanScheduler.scheduleUpcomingPrayerAdzans(7);
  };

  // Handle GPS Auto-Detection
  const handleDetectGPS = async () => {
    setIsGpsLoading(true);
    setGpsError(null);
    try {
      const gpsLoc = await detectBrowserGPSLocation();
      setActiveLocation(gpsLoc);
      setIsCityDropdownOpen(false);
      nativeAdzanScheduler.scheduleUpcomingPrayerAdzans(7);
    } catch (err: any) {
      setGpsError(err?.message || 'Gagal mengakses GPS. Pastikan izin lokasi diaktifkan di browser.');
    } finally {
      setIsGpsLoading(false);
    }
  };

  const handleTestAdzan = (name: string) => {
    nativeAdzanScheduler.testAdzanNotificationNow(name);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#0B4627] text-white px-4 py-2.5 rounded-xl border border-emerald-600 shadow-lg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Location Selector */}
      <div className="bg-gradient-to-r from-[#0B4627] to-[#06331D] text-white rounded-2xl p-5 sm:p-6 border border-emerald-800/80 shadow-xs relative overflow-visible space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 rounded-full border border-amber-400/30 uppercase tracking-wide flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Jadwal Shalat Internet
              </span>
              <span className="px-2 py-0.5 text-xs font-medium bg-white/10 text-white rounded-md border border-white/20 font-mono">
                {liveApiResponse?.hijriDate || '13 Rabi\'ul Awwal 1448 H'}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-800/80 text-emerald-200 rounded-md border border-emerald-600/40">
                {liveApiResponse?.source === 'internet' ? 'API Kemenag RI / Aladhan' : 'Astronomis MABIMS'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Waktu Shalat & Adzan Presisi
            </h2>
            <p className="text-xs text-emerald-200/90 font-normal mt-0.5">
              Sinkronisasi waktu lokal internet otomatis dengan audio adzan Syekh Muhammad Marwan Al-Qassas (Masjid Nabawi).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href={ADZAN_MARWAN_ALQASSAS_URL}
              download="adzan-madinah-syekh-marwan-al-qassas.mp3"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 border border-amber-400/40 rounded-xl cursor-pointer font-semibold text-xs flex items-center gap-1.5 shrink-0 transition"
              title="Download File Audio Adzan Madinah (3.6 MB)"
            >
              <Download className="w-4 h-4" />
              <span>Unduh MP3</span>
            </a>

            <button
              onClick={handleToggleAutoAdzan}
              className={`px-3.5 py-2 rounded-xl border font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition ${
                autoAdzanEnabled
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-200 border-rose-400/40 hover:bg-rose-500/30'
              }`}
              title="Aktifkan/Nonaktifkan Adzan otomatis saat masuk waktu shalat"
            >
              {autoAdzanEnabled ? <Bell className="w-4 h-4 text-emerald-300" /> : <BellOff className="w-4 h-4 text-rose-300" />}
              <span>{autoAdzanEnabled ? 'Adzan Auto (Aktif)' : 'Adzan Auto (Mati)'}</span>
            </button>

            <button
              onClick={() => handleTestAdzan(countdownData.nextPrayer?.name || 'Dzuhur')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl cursor-pointer font-semibold text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition"
              title="Tes bunyi notifikasi & suara adzan sekarang"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Tes Notifikasi & Adzan</span>
            </button>
          </div>
        </div>

        {/* Location Selector Bar */}
        <div className="pt-3 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-2">
          {/* Active City Display & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>{activeLocation.city}</span>
              <span className="text-[10px] bg-emerald-800/80 px-1.5 py-0.2 rounded font-mono font-medium text-emerald-200 border border-emerald-600/40">
                UTC+{activeLocation.timezone}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-200" />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 space-y-1">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-slate-900 dark:text-white">
                  <span className="text-xs font-bold text-[#0B4627] dark:text-emerald-400">Pilih Kota / Lokasi Shalat:</span>
                  <button onClick={() => setIsCityDropdownOpen(false)} className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer" aria-label="Tutup"><X className="w-3.5 h-3.5" /></button>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {POPULAR_CITIES.map((c) => {
                    const isSelected = c.id === activeLocation.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCity(c)}
                        className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0B4627] text-white'
                            : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white'
                        }`}
                      >
                        <span className="text-xs font-medium">{c.city}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                          UTC+{c.timezone}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* GPS Auto-Detect Button */}
          <button
            onClick={handleDetectGPS}
            disabled={isGpsLoading}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
          >
            {isGpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            <span>{isGpsLoading ? 'Mendeteksi Koordinat...' : 'Deteksi GPS Otomatis'}</span>
          </button>
        </div>

        {gpsError && (
          <div className="text-xs font-medium text-amber-200 bg-black/40 px-3 py-1.5 rounded-lg border border-amber-400/40 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}
      </div>

      {/* Jurnal & Absensi Sholat 5 Waktu Card */}
      <div className="bg-gradient-to-r from-[#06331D] via-[#0B4627] to-[#06331D] border border-emerald-800/80 rounded-2xl p-5 shadow-xs text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-300">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-bold text-white">
                Jurnal & Absensi Sholat 5 Waktu
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-800/80 text-emerald-200 border border-emerald-600/40">
                {attendanceStats.todayCompleted} / 5 Selesai ({attendanceStats.percentage}%)
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Streak: <strong className="text-amber-300 font-semibold">{attendanceStats.streakDays} Hari Rutin</strong></span>
              </span>
              <span>•</span>
              <span>Pahala: <strong className="text-emerald-300 font-semibold">+{attendanceStats.todayXp} XP</strong></span>
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
                        ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40'
                        : 'bg-black/20 hover:bg-black/30 text-emerald-200/70 border-emerald-900/40'
                    }`}
                    title={`Klik untuk mencatat absensi sholat ${label}`}
                  >
                    {isDone ? (
                      <Check className="w-3 h-3 text-emerald-300" />
                    ) : (
                      <Circle className="w-2.5 h-2.5 opacity-60" />
                    )}
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
            className="w-full md:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition shadow-xs shrink-0"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Ceklis Absensi Sholat</span>
          </button>
        )}
      </div>

      {/* Auto-Adzan Switch */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
            autoAdzanEnabled ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
          }`}>
            {autoAdzanEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Adzan Otomatis Masuk Waktu Shalat
              </h4>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                autoAdzanEnabled ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}>
                {autoAdzanEnabled ? 'AKTIF' : 'NONAKTIF'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Muadzin: <strong className="text-[#0B4627] dark:text-emerald-400 font-semibold">Syekh Muhammad Marwan Al-Qassas</strong> (Masjid Nabawi Madinah)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleToggleAutoAdzan}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-xs ${
              autoAdzanEnabled 
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
            }`}
          >
            {autoAdzanEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            <span>{autoAdzanEnabled ? 'Adzan Otomatis: Aktif' : 'Aktifkan Adzan'}</span>
          </button>
        </div>
      </div>

      {/* 10-Minute Warning Alert */}
      {countdownData.isWithin10Minutes && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800 rounded-2xl flex items-center gap-3 shadow-xs">
          <Bell className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Peringatan: 10 Menit Menuju Waktu Shalat {countdownData.nextPrayer?.name}</span>
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              Persiapkan wudhu dan bersiap menuju shalat tepat waktu.
            </p>
          </div>
        </div>
      )}

      {/* Big Countdown Box */}
      <div className="bg-gradient-to-br from-[#06331D] via-[#0B4627] to-[#042413] border border-emerald-800/80 rounded-2xl p-6 sm:p-8 text-center shadow-xs text-white">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
          <Clock className="w-4 h-4" />
          <span>Hitung Mundur Menuju Shalat {countdownData.nextPrayer?.name}</span>
        </div>

        {/* Digital Clock */}
        <div className="text-5xl sm:text-7xl font-bold font-mono tracking-widest text-white my-3">
          {countdownData.formattedCountdown}
        </div>

        <p className="text-xs text-emerald-200/90 font-normal">
          Waktu Shalat {countdownData.nextPrayer?.name} di {activeLocation.city}:{' '}
          <b className="text-amber-300 text-sm font-mono font-bold">{countdownData.nextPrayer?.timeStr}</b>
        </p>
      </div>

      {/* 7 Prayer Times Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 sm:gap-3">
        {prayerTimes.map((item) => {
          const isCurrent = item.isNext;

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                isCurrent
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs ring-2 ring-amber-300/50'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs'
              }`}
            >
              <span className="font-quran text-base font-bold block">{item.arabicName}</span>
              <p className="font-semibold text-xs mt-0.5">{item.name}</p>
              <p className={`text-base font-bold font-mono mt-1 ${isCurrent ? 'text-slate-950' : 'text-[#0B4627] dark:text-emerald-400'}`}>{item.timeStr}</p>
              {isCurrent && (
                <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-slate-950 text-white rounded mt-1 uppercase">
                  Berikutnya
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Tasbih Digital & Dzikir */}
      <DzikirCounter />
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Compass, 
  Clock, 
  MapPin, 
  Volume2, 
  Bell, 
  Sparkles, 
  CheckCircle2, 
  BookOpen,
  VolumeX,
  Play,
  Globe,
  Navigation,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { PrayerTime } from '../../types';
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
import { FullscreenAdzan } from './FullscreenAdzan';
import { DzikirCounter } from './DzikirCounter';
import { DOA_SETELAH_ADZAN } from '../../data/dzikirData';

export const PrayerTimesBanner: React.FC = () => {
  const [activeLocation, setActiveLocation] = useState<LocationConfig>(getSavedLocation());
  const [liveApiResponse, setLiveApiResponse] = useState<LivePrayerApiResponse | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>(calculatePrayerTimes(new Date(), getSavedLocation()));
  const [countdownData, setCountdownData] = useState(getCountdownToNextPrayer(prayerTimes));
  const [isFullscreenAdzanOpen, setIsFullscreenAdzanOpen] = useState(false);
  const [adzanPrayerName, setAdzanPrayerName] = useState('Dzuhur');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

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

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (liveApiResponse) {
        const updatedList = buildPrayerTimesList(liveApiResponse.timings, new Date());
        setPrayerTimes(updatedList);
        const countdown = getCountdownToNextPrayer(updatedList);
        setCountdownData(countdown);

        // Trigger automatic fullscreen Adzan if seconds reach 0
        if (countdown.secondsRemaining === 0 && !isFullscreenAdzanOpen) {
          setAdzanPrayerName(countdown.nextPrayer?.name || 'Shalat');
          setIsFullscreenAdzanOpen(true);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [liveApiResponse, isFullscreenAdzanOpen]);

  // Handle City Change
  const handleSelectCity = (cityConfig: LocationConfig) => {
    saveLocation(cityConfig);
    setActiveLocation(cityConfig);
    setIsCityDropdownOpen(false);
    setGpsError(null);
  };

  // Handle GPS Auto-Detection
  const handleDetectGPS = async () => {
    setIsGpsLoading(true);
    setGpsError(null);
    try {
      const gpsLoc = await detectBrowserGPSLocation();
      setActiveLocation(gpsLoc);
      setIsCityDropdownOpen(false);
    } catch (err: any) {
      setGpsError(err?.message || 'Gagal mengakses GPS. Pastikan izin lokasi diaktifkan di browser.');
    } finally {
      setIsGpsLoading(false);
    }
  };

  const handleTestAdzan = (name: string) => {
    setAdzanPrayerName(name);
    setIsFullscreenAdzanOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* 1. HEADER & LIVE INTERNET LOCATION SELECTOR */}
      <NeobrutalCard variant="emerald" className="p-5 sm:p-6 relative overflow-visible shadow-[6px_6px_0px_0px_#111827] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2 py-0.5 text-xs font-black bg-[#F59E0B] text-black rounded border border-black uppercase flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Jadwal Shalat Live Internet
              </span>
              <span className="px-2 py-0.5 text-xs font-bold bg-white/20 text-white rounded border border-white/30 font-mono">
                {liveApiResponse?.hijriDate || '13 Rabi\'ul Awwal 1448 H'}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-400 text-black rounded border border-black">
                {liveApiResponse?.source === 'internet' ? '⚡ API Kemenag RI / Aladhan' : '📡 Astronomis MABIMS'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
              Waktu Shalat & Adzan Presisi
            </h2>
            <p className="text-xs text-emerald-100 font-medium">
              Sinkronisasi waktu lokal internet otomatis + pemutaran audio adzan Syekh Misyari saat masuk waktu shalat.
            </p>
          </div>

          <button
            onClick={() => handleTestAdzan(countdownData.nextPrayer?.name || 'Dzuhur')}
            className="px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-black border-2 border-black rounded-xl neo-button cursor-pointer font-black text-xs flex items-center gap-2 shrink-0 shadow-[2px_2px_0px_0px_#000]"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Simulasi Adzan Layar Penuh</span>
          </button>
        </div>

        {/* Location Selector Bar */}
        <div className="pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-2">
          {/* Active City Display & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="px-3 py-1.5 bg-white hover:bg-amber-50 text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-2 neo-button cursor-pointer shadow-[2px_2px_0px_0px_#000]"
            >
              <MapPin className="w-3.5 h-3.5 text-[#0B4627]" />
              <span>{activeLocation.city}</span>
              <span className="text-[10px] bg-emerald-100 px-1.5 py-0.2 rounded font-mono font-bold text-emerald-900 border border-emerald-300">
                UTC+{activeLocation.timezone}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-700" />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white border-3 border-black rounded-2xl p-2 shadow-[6px_6px_0px_0px_#000] z-50 animate-in fade-in zoom-in-95 space-y-1">
                <div className="p-1.5 border-b-2 border-black flex items-center justify-between text-black">
                  <span className="text-xs font-black text-[#0B4627]">Pilih Kota / Lokasi Shalat:</span>
                  <button onClick={() => setIsCityDropdownOpen(false)} className="text-xs font-bold text-gray-500 hover:text-black">✕</button>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {POPULAR_CITIES.map((c) => {
                    const isSelected = c.id === activeLocation.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCity(c)}
                        className={`w-full p-2 rounded-xl border-2 border-black text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-[#F9FAFB] hover:bg-amber-50 text-gray-900'
                        }`}
                      >
                        <span className="text-xs font-black">{c.city}</span>
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-amber-300' : 'text-gray-600'}`}>
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
            className="px-3 py-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 neo-button cursor-pointer shadow-[2px_2px_0px_0px_#000] disabled:opacity-50"
          >
            {isGpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5 text-blue-700" />}
            <span>{isGpsLoading ? 'Mendeteksi Koordinat...' : 'Deteksi GPS Otomatis'}</span>
          </button>
        </div>

        {gpsError && (
          <p className="text-xs font-bold text-amber-200 bg-black/40 px-3 py-1.5 rounded-lg border border-amber-400">
            ⚠️ {gpsError}
          </p>
        )}
      </NeobrutalCard>

      {/* 2. 10-MINUTE WARNING ALERT */}
      {countdownData.isWithin10Minutes && (
        <div className="p-4 bg-[#FEF3C7] border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_#D97706] flex items-center gap-3 animate-bounce">
          <Bell className="w-6 h-6 text-[#D97706] shrink-0" />
          <div>
            <h4 className="text-xs sm:text-sm font-black text-black">
              ⚠️ Peringatan: 10 Menit Menuju Waktu Shalat {countdownData.nextPrayer?.name}!
            </h4>
            <p className="text-xs text-gray-700 font-medium">
              Persiapkan wudhu dan bersiap menuju masjid / shalat tepat waktu.
            </p>
          </div>
        </div>
      )}

      {/* 3. BIG COUNTDOWN BOX */}
      <NeobrutalCard variant="dark" className="p-6 sm:p-8 text-center border-3 border-black shadow-[6px_6px_0px_0px_#0B4627]">
        <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-[#F59E0B] uppercase tracking-wider mb-2">
          <Clock className="w-4 h-4" />
          <span>Hitung Mundur Menuju Shalat {countdownData.nextPrayer?.name}</span>
        </div>

        {/* Huge Digital Clock */}
        <div className="text-5xl sm:text-7xl font-black font-mono tracking-widest text-white my-3">
          {countdownData.formattedCountdown}
        </div>

        <p className="text-xs text-gray-300 font-medium">
          Waktu Shalat {countdownData.nextPrayer?.name} di {activeLocation.city}:{' '}
          <b className="text-[#F59E0B] text-sm font-mono">{countdownData.nextPrayer?.timeStr}</b>
        </p>
      </NeobrutalCard>

      {/* 4. 7 PRAYER TIMES GRID (Imsak, Subuh, Terbit, Dzuhur, Ashar, Maghrib, Isya) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 sm:gap-3">
        {prayerTimes.map((item) => {
          const isCurrent = item.isNext;

          return (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border-2 border-black text-center transition-all ${
                isCurrent
                  ? 'bg-[#F59E0B] text-black shadow-[4px_4px_0px_0px_#111827] -translate-y-1 ring-2 ring-amber-400'
                  : 'bg-white text-gray-900 shadow-[2px_2px_0px_0px_#111827]'
              }`}
            >
              <span className="font-quran text-base font-bold block">{item.arabicName}</span>
              <p className="font-black text-xs mt-0.5">{item.name}</p>
              <p className="text-base font-black font-mono mt-1 text-[#0B4627]">{item.timeStr}</p>
              {isCurrent && (
                <span className="inline-block px-1.5 py-0.5 text-[9px] font-black bg-black text-white rounded mt-1 uppercase">
                  Berikutnya
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. TASBIH DIGITAL & DZIKIR */}
      <DzikirCounter />

      {/* 6. FULLSCREEN ADZAN MODAL */}
      <FullscreenAdzan
        isOpen={isFullscreenAdzanOpen}
        onClose={() => setIsFullscreenAdzanOpen(false)}
        prayerName={adzanPrayerName}
      />
    </div>
  );
};

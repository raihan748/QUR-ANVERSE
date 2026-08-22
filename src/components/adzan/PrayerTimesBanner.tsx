import React, { useState, useEffect } from 'react';
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
  Play
} from 'lucide-react';
import { PrayerTime } from '../../types';
import { calculatePrayerTimes, getCountdownToNextPrayer, MAKASSAR_COORDS } from '../../services/prayerTimeEngine';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { FullscreenAdzan } from './FullscreenAdzan';
import { DzikirCounter } from './DzikirCounter';
import { DOA_SETELAH_ADZAN } from '../../data/dzikirData';

export const PrayerTimesBanner: React.FC = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>(calculatePrayerTimes());
  const [countdownData, setCountdownData] = useState(getCountdownToNextPrayer(prayerTimes));
  const [isFullscreenAdzanOpen, setIsFullscreenAdzanOpen] = useState(false);
  const [adzanPrayerName, setAdzanPrayerName] = useState('Dzuhur');

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      const updatedTimes = calculatePrayerTimes();
      setPrayerTimes(updatedTimes);
      const countdown = getCountdownToNextPrayer(updatedTimes);
      setCountdownData(countdown);

      // Trigger automatic fullscreen Adzan if seconds reach 0
      if (countdown.secondsRemaining === 0 && !isFullscreenAdzanOpen) {
        setAdzanPrayerName(countdown.nextPrayer?.name || 'Shalat');
        setIsFullscreenAdzanOpen(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isFullscreenAdzanOpen]);

  const handleTestAdzan = (name: string) => {
    setAdzanPrayerName(name);
    setIsFullscreenAdzanOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header Widget */}
      <NeobrutalCard variant="emerald" className="p-6 relative overflow-hidden shadow-[6px_6px_0px_0px_#111827]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-black bg-[#F59E0B] text-black rounded border border-black uppercase">
                Jadwal Shalat Presisi
              </span>
              <span className="px-2 py-0.5 text-xs font-extrabold bg-[#10B981] text-black rounded border border-black flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Makassar, Sulsel (WITA)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Waktu Shalat & Adzan Otomatis
            </h2>
            <p className="text-xs text-emerald-200 font-medium">
              Dilengkapi pemutaran audio adzan otomatis Syekh Misyari saat masuk waktu shalat.
            </p>
          </div>

          <button
            onClick={() => handleTestAdzan('Dzuhur')}
            className="px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-black border-2 border-black rounded-xl neo-button cursor-pointer font-extrabold text-xs flex items-center gap-2 shrink-0"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Simulasi Adzan Layar Penuh</span>
          </button>
        </div>
      </NeobrutalCard>

      {/* 10-MINUTE WARNING ALERT */}
      {countdownData.isWithin10Minutes && (
        <div className="p-4 bg-[#FEF3C7] border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_#D97706] flex items-center gap-3 animate-bounce">
          <Bell className="w-6 h-6 text-[#D97706] shrink-0" />
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-black">
              ⚠️ Peringatan: 10 Menit Menuju Waktu Shalat {countdownData.nextPrayer?.name}!
            </h4>
            <p className="text-xs text-gray-700">
              Persiapkan wudhu dan bersiap menuju masjid / shalat tepat waktu.
            </p>
          </div>
        </div>
      )}

      {/* BIG COUNTDOWN BOX */}
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
          Waktu Shalat {countdownData.nextPrayer?.name} Makassar:{' '}
          <b className="text-[#F59E0B]">{countdownData.nextPrayer?.timeStr} WITA</b>
        </p>
      </NeobrutalCard>

      {/* 5 DAILY PRAYER TIMES GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {prayerTimes.map((item) => {
          const isCurrent = item.isNext;

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border-2 border-black text-center transition-all ${
                isCurrent
                  ? 'bg-[#F59E0B] text-black shadow-[4px_4px_0px_0px_#111827] -translate-y-1'
                  : 'bg-white text-gray-900 shadow-[2px_2px_0px_0px_#111827]'
              }`}
            >
              <span className="font-quran text-lg font-bold block">{item.arabicName}</span>
              <p className="font-extrabold text-xs mt-1">{item.name}</p>
              <p className="text-base font-black font-mono mt-1 text-[#0B4627]">{item.timeStr}</p>
              {isCurrent && (
                <span className="inline-block px-1.5 py-0.5 text-[9px] font-black bg-black text-white rounded mt-1.5 uppercase">
                  Berikutnya
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* TASBIH DIGITAL & DZIKIR */}
      <DzikirCounter />

      {/* FULLSCREEN ADZAN MODAL */}
      <FullscreenAdzan
        isOpen={isFullscreenAdzanOpen}
        onClose={() => setIsFullscreenAdzanOpen(false)}
        prayerName={adzanPrayerName}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, X, Sparkles, BookOpen, Clock, Heart } from 'lucide-react';
import { PrayerTime } from '../../types';
import { ADZAN_MARWAN_ALQASSAS_URL, audioPlayer } from '../../services/audioPlayerService';
import { DOA_SETELAH_ADZAN } from '../../data/dzikirData';

interface FullscreenAdzanProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName: string;
}

export const FullscreenAdzan: React.FC<FullscreenAdzanProps> = ({
  isOpen,
  onClose,
  prayerName
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [showDoa, setShowDoa] = useState(false);
  const [iqamahCountdown, setIqamahCountdown] = useState(600); // 10 minutes

  useEffect(() => {
    if (isOpen) {
      // Auto play adzan audio by Syekh Muhammad Marwan Al-Qassas (Masjid Nabawi Madinah)
      audioPlayer.playUrl(ADZAN_MARWAN_ALQASSAS_URL, () => {
        setIsPlayingAudio(false);
        setShowDoa(true);
      });

      // Iqamah 10-min countdown
      const timer = setInterval(() => {
        setIqamahCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => {
        clearInterval(timer);
        audioPlayer.stop();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatIqamahTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const toggleAudio = () => {
    if (isPlayingAudio) {
      audioPlayer.stop();
      setIsPlayingAudio(false);
    } else {
      audioPlayer.playUrl(ADZAN_MARWAN_ALQASSAS_URL, () => setIsPlayingAudio(false));
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06331D] text-white flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-300">
      {/* Background Ornament */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-20 pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] border-2 border-black flex items-center justify-center text-black font-extrabold shadow-[3px_3px_0px_0px_#000]">
            🕌
          </div>
          <div>
            <span className="text-xs font-extrabold text-[#F59E0B] tracking-wider uppercase">
              Waktu Shalat Tiba • Lantunan Adzan Madinah
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              Adzan Shalat {prayerName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className="p-3 bg-black/60 hover:bg-black border-2 border-[#F59E0B] rounded-2xl cursor-pointer text-[#F59E0B]"
            title={isPlayingAudio ? 'Matikan Suara Adzan' : 'Putar Suara Adzan'}
          >
            {isPlayingAudio ? <Volume2 className="w-6 h-6 animate-pulse" /> : <VolumeX className="w-6 h-6" />}
          </button>
          <button
            onClick={onClose}
            className="p-3 bg-[#DC2626] hover:bg-[#B91C1C] border-2 border-black rounded-2xl cursor-pointer text-white shadow-[2px_2px_0px_0px_#000]"
            title="Tutup Layar Adzan"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Center Grand Visual */}
      <div className="text-center relative z-10 my-auto max-w-2xl mx-auto space-y-6">
        {/* Animated Mosque & Wave */}
        <div className="w-28 h-28 mx-auto rounded-3xl bg-[#0B4627] border-3 border-[#F59E0B] flex items-center justify-center text-5xl shadow-[6px_6px_0px_0px_#000] animate-bounce">
          🕌
        </div>

        <div>
          <h1 className="font-quran text-4xl sm:text-6xl text-[#F59E0B] font-bold leading-loose" dir="rtl">
            حَيَّ عَلَى الصَّلَاةِ
          </h1>
          <p className="text-sm sm:text-base text-emerald-200 font-semibold mt-2">
            "Marilah mendirikan shalat, marilah menuju kemenangan."
          </p>
          <div className="mt-3 inline-block px-4 py-1.5 bg-black/50 border border-amber-400/40 rounded-xl">
            <p className="text-xs text-amber-300 font-bold">
              Muadzin: Syekh Muhammad Marwan Al-Qassas (الشيخ محمد مروان قصاص)
            </p>
            <p className="text-[11px] text-emerald-200">
              Masjid Nabawi, Madinah Al-Munawwarah 🇸🇦
            </p>
          </div>
        </div>

        {/* Iqamah Countdown Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-black/60 border-2 border-[#F59E0B] rounded-2xl shadow-[3px_3px_0px_0px_#000]">
          <Clock className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-xs font-extrabold text-white">
            Hitung Mundur Iqamah: <b className="font-mono text-[#F59E0B]">{formatIqamahTime(iqamahCountdown)}</b>
          </span>
        </div>

        {/* Toggle Doa Setelah Adzan */}
        <div className="pt-2">
          <button
            onClick={() => setShowDoa(!showDoa)}
            className="px-5 py-2.5 bg-[#FFFDF7] text-black font-extrabold text-xs rounded-xl border-2 border-black neo-button cursor-pointer"
          >
            {showDoa ? 'Sembunyikan Doa' : '📖 Baca Doa Setelah Adzan'}
          </button>
        </div>

        {/* Doa Setelah Adzan Card */}
        {showDoa && (
          <div className="p-5 bg-black/80 border-2 border-[#F59E0B] rounded-2xl text-left space-y-3 animate-in fade-in">
            <h4 className="text-xs font-black text-[#F59E0B] uppercase tracking-wider">
              {DOA_SETELAH_ADZAN.title}
            </h4>
            <p className="font-quran text-xl text-right leading-loose text-white" dir="rtl">
              {DOA_SETELAH_ADZAN.arabic}
            </p>
            <p className="text-xs text-emerald-300 italic border-t border-emerald-800 pt-2">
              {DOA_SETELAH_ADZAN.transliteration}
            </p>
            <p className="text-xs text-gray-300">
              "{DOA_SETELAH_ADZAN.translation}"
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="text-center relative z-10">
        <button
          onClick={onClose}
          className="px-8 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-black font-black text-sm rounded-xl border-2 border-black neo-button cursor-pointer"
        >
          Tutup & Lanjutkan Muroja'ah
        </button>
      </div>
    </div>
  );
};

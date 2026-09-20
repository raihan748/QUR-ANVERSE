import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, X, Sparkles, BookOpen, Clock, Heart, Download, Building2 } from 'lucide-react';
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
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-amber-300 tracking-wider uppercase">
              Waktu Shalat Tiba • Lantunan Adzan Madinah
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              Adzan Shalat {prayerName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Download Audio Adzan MP3 */}
          <a
            href={ADZAN_MARWAN_ALQASSAS_URL}
            download="adzan-madinah-syekh-marwan-al-qassas.mp3"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-emerald-900/60 hover:bg-emerald-900 text-amber-300 border border-amber-400/30 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-semibold transition shadow-xs"
            title="Download Audio Adzan Madinah (3.6 MB)"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Unduh MP3</span>
          </a>

          <button
            onClick={toggleAudio}
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl cursor-pointer text-amber-300 transition"
            title={isPlayingAudio ? 'Matikan Suara Adzan' : 'Putar Suara Adzan'}
          >
            {isPlayingAudio ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-rose-600/80 border border-white/20 rounded-xl cursor-pointer text-white transition"
            title="Tutup Layar Adzan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Grand Visual */}
      <div className="text-center relative z-10 my-auto max-w-2xl mx-auto space-y-6">
        {/* Mosque Icon */}
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-emerald-800 to-[#0B4627] border border-amber-400/40 flex items-center justify-center text-4xl shadow-lg">
          <Building2 className="w-12 h-12 text-amber-300" />
        </div>

        <div>
          <h1 className="font-quran text-4xl sm:text-6xl text-amber-300 font-bold leading-loose" dir="rtl">
            حَيَّ عَلَى الصَّلَاةِ
          </h1>
          <p className="text-sm sm:text-base text-emerald-200 font-medium mt-2">
            "Marilah mendirikan shalat, marilah menuju kemenangan."
          </p>
          <div className="mt-3 inline-block px-4 py-1.5 bg-black/30 border border-emerald-800/80 rounded-xl">
            <p className="text-xs text-amber-300 font-semibold">
              Muadzin: Syekh Muhammad Marwan Al-Qassas
            </p>
            <p className="text-[11px] text-emerald-200/80">
              Masjid Nabawi, Madinah Al-Munawwarah
            </p>
          </div>
        </div>

        {/* Iqamah Countdown Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 border border-amber-400/30 rounded-xl">
          <Clock className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-semibold text-white">
            Hitung Mundur Iqamah: <b className="font-mono text-amber-300">{formatIqamahTime(iqamahCountdown)}</b>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setShowDoa(!showDoa)}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl border border-white/20 cursor-pointer flex items-center gap-1.5 transition"
          >
            <BookOpen className="w-4 h-4" />
            <span>{showDoa ? 'Sembunyikan Doa' : 'Baca Doa Setelah Adzan'}</span>
          </button>

          <a
            href={ADZAN_MARWAN_ALQASSAS_URL}
            download="adzan-madinah-syekh-marwan-al-qassas.mp3"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs rounded-xl cursor-pointer inline-flex items-center gap-1.5 transition shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Audio Adzan (3.6 MB)</span>
          </a>
        </div>

        {/* Doa Setelah Adzan Card */}
        {showDoa && (
          <div className="p-5 bg-black/60 border border-amber-400/30 rounded-2xl text-left space-y-3 animate-in fade-in">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              {DOA_SETELAH_ADZAN.title}
            </h4>
            <p className="font-quran text-xl text-right leading-loose text-white" dir="rtl">
              {DOA_SETELAH_ADZAN.arabic}
            </p>
            <p className="text-xs text-emerald-300 italic border-t border-emerald-900/60 pt-2">
              {DOA_SETELAH_ADZAN.transliteration}
            </p>
            <p className="text-xs text-slate-300">
              "{DOA_SETELAH_ADZAN.translation}"
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="text-center relative z-10">
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-sm rounded-xl cursor-pointer transition shadow-xs"
        >
          Tutup & Lanjutkan Muroja'ah
        </button>
      </div>
    </div>
  );
};

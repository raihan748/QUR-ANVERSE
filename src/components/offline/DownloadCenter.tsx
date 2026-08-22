import React, { useState } from 'react';
import { DownloadCloud, CheckCircle2, HardDrive, WifiOff, Sparkles, Database } from 'lucide-react';
import { NeobrutalCard } from '../common/NeobrutalCard';

interface DownloadPackage {
  id: string;
  name: string;
  description: string;
  size: string;
  status: 'idle' | 'downloading' | 'completed';
  progress: number;
}

export const DownloadCenter: React.FC = () => {
  const [packages, setPackages] = useState<DownloadPackage[]>([
    {
      id: 'pkg_quran',
      name: 'Teks Al-Qur\'an 30 Juz & Terjemahan Kemenag',
      description: 'Lengkap 114 surat, 6236 ayat, Rasm Utsmani, transliterasi, dan arti per kata.',
      size: '4.8 MB',
      status: 'completed',
      progress: 100
    },
    {
      id: 'pkg_audio_mishary',
      name: 'Paket Audio Syekh Misyari Rasyid Al-Afasi (Juz 30 & Pilihan)',
      description: 'Seluruh lantunan ayat Al-Fatihah, Al-Mulk, Yasin, dan Juz \'Amma untuk audio murojaah.',
      size: '28.5 MB',
      status: 'idle',
      progress: 0
    },
    {
      id: 'pkg_ai_model',
      name: 'Kamus Fonetik & Model AI Koreksi Tajwid',
      description: 'Algoritma pencocokan makhraj, tajwid, dan adab santun guru ngaji tanpa perlu internet.',
      size: '3.2 MB',
      status: 'completed',
      progress: 100
    }
  ]);

  const handleDownload = (id: string) => {
    setPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.id === id) {
          return { ...pkg, status: 'downloading', progress: 10 };
        }
        return pkg;
      })
    );

    // Simulate progressive download
    let current = 10;
    const interval = setInterval(() => {
      current += 20;
      if (current >= 100) {
        clearInterval(interval);
        setPackages((prev) =>
          prev.map((pkg) => (pkg.id === id ? { ...pkg, status: 'completed', progress: 100 } : pkg))
        );
      } else {
        setPackages((prev) =>
          prev.map((pkg) => (pkg.id === id ? { ...pkg, progress: current } : pkg))
        );
      }
    }, 400);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <NeobrutalCard variant="emerald" className="p-6 border-3 border-black shadow-[6px_6px_0px_0px_#111827]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] border-2 border-black flex items-center justify-center text-black font-extrabold shadow-[2px_2px_0px_0px_#000]">
            <DownloadCloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Download Paket Offline
            </h2>
            <p className="text-xs text-emerald-200 font-medium">
              Unduh sekali, nikmati fitur baca, audio, dan muroja'ah AI 100% tanpa kuota internet.
            </p>
          </div>
        </div>
      </NeobrutalCard>

      {/* Offline Status Badge */}
      <div className="p-4 bg-[#D1FAE5] border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_#0B4627] flex items-center gap-3">
        <WifiOff className="w-6 h-6 text-[#0B4627] shrink-0" />
        <div>
          <h4 className="text-xs sm:text-sm font-extrabold text-black">
            Mode Offline Siap Digunakan!
          </h4>
          <p className="text-xs text-gray-700">
            Aplikasi tetap dapat digunakan di daerah tanpa sinyal internet, pesawat, atau pondok pesantren.
          </p>
        </div>
      </div>

      {/* Packages List */}
      <div className="space-y-4">
        {packages.map((pkg) => (
          <NeobrutalCard key={pkg.id} variant="white" className="p-5 border-3 border-black shadow-[4px_4px_0px_0px_#111827]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-extrabold text-black">{pkg.name}</h4>
                  <span className="px-2 py-0.5 text-[10px] font-black bg-gray-100 border border-black rounded">
                    {pkg.size}
                  </span>
                </div>
                <p className="text-xs text-gray-600 max-w-xl">{pkg.description}</p>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                {pkg.status === 'completed' ? (
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-[#D1FAE5] text-[#0B4627] border-2 border-black rounded-xl font-extrabold text-xs shadow-[2px_2px_0px_0px_#000]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Terpasang Offline</span>
                  </div>
                ) : pkg.status === 'downloading' ? (
                  <div className="w-full sm:w-40 space-y-1">
                    <div className="w-full bg-gray-200 h-3 border border-black rounded-full overflow-hidden">
                      <div
                        className="bg-[#0B4627] h-full transition-all duration-300"
                        style={{ width: `${pkg.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-center font-bold text-gray-600">
                      Mengunduh... {pkg.progress}%
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDownload(pkg.id)}
                    className="w-full sm:w-auto px-4 py-2 bg-[#0B4627] text-white border-2 border-black rounded-xl neo-button cursor-pointer font-extrabold text-xs flex items-center justify-center gap-1.5"
                  >
                    <DownloadCloud className="w-4 h-4 text-[#F59E0B]" />
                    <span>Unduh Paket</span>
                  </button>
                )}
              </div>
            </div>
          </NeobrutalCard>
        ))}
      </div>
    </div>
  );
};

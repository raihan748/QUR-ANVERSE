import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Laptop, CheckCircle2, X, Sparkles, Share, PlusSquare, Bell, ShieldCheck, FileDown } from 'lucide-react';
import { NeobrutalCard } from './NeobrutalCard';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('android');
  const [activeTab, setActiveTab] = useState<'apk' | 'pwa'>('apk');

  useEffect(() => {
    // Detect OS
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setPlatform('ios');
      setActiveTab('pwa');
    } else if (/android/i.test(userAgent)) {
      setPlatform('android');
      setActiveTab('apk');
    } else {
      setPlatform('desktop');
      setActiveTab('apk');
    }

    // Capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('Untuk menginstall, silakan buka menu browser Anda (titik 3 di kanan atas) lalu pilih "Tambahkan ke Layar Utama / Install App".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem('qv_full_packet_active', 'true');
      } catch {}
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-in fade-in zoom-in duration-200">
        <NeobrutalCard variant="white" className="p-6 relative border-3 border-black shadow-[8px_8px_0px_0px_#111827]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-[#FEE2E2] hover:bg-[#FCA5A5] border-2 border-black rounded-lg neo-button cursor-pointer"
          >
            <X className="w-5 h-5 text-black" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#0B4627] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#111827]">
              <Smartphone className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black font-display text-black">Pemasangan Aplikasi</h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#F59E0B] text-black border border-black rounded-md">
                  NATIVE / PWA
                </span>
              </div>
              <p className="text-xs text-gray-700 font-medium">QURANVERSE - AI Guru Ngaji Pribadi di Smartphone Anda</p>
            </div>
          </div>

          {/* Tab Selector: Native APK vs Web PWA */}
          <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-gray-100 border-2 border-black rounded-xl">
            <button
              onClick={() => setActiveTab('apk')}
              className={`py-2 px-3 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'apk'
                  ? 'bg-[#0B4627] text-white border border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Native Android (.APK)</span>
            </button>
            <button
              onClick={() => setActiveTab('pwa')}
              className={`py-2 px-3 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'pwa'
                  ? 'bg-[#0B4627] text-white border border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Web PWA (iOS / Laptop)</span>
            </button>
          </div>

          {/* TAB 1: NATIVE ANDROID (.APK) */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              {/* Native Value Props */}
              <div className="bg-[#FFFDF7] border-2 border-black rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0B4627] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#0B4627]" /> Fitur Eksklusif Native App:
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded border border-amber-400">
                    Disarankan untuk Android
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-semibold text-gray-800">
                  <Bell className="w-4 h-4 text-[#0B4627] shrink-0 mt-0.5" />
                  <span><b>Suara Adzan Berbunyi Otomatis di Layar Mati:</b> Tetap berkumandang tepat waktu saat HP di kantong celana atau idle.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-semibold text-gray-800">
                  <Sparkles className="w-4 h-4 text-[#0B4627] shrink-0 mt-0.5" />
                  <span><b>Audio Otentik Madinah:</b> Lantunan Muadzin Masjid Nabawi Syekh Muhammad Marwan Al-Qassas tertanam langsung di sistem.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-bold text-[#0B4627] bg-[#ECFDF5] p-2 rounded-lg border border-[#10B981]">
                  <CheckCircle2 className="w-4 h-4 text-[#0B4627] shrink-0 mt-0.5" />
                  <span>100% Offline Standalone: Berjalan tanpa tergantung tab browser atau izin web.</span>
                </div>
              </div>

              {/* Direct APK Download Button */}
              <a
                href="/download/quranverse.apk"
                download="quranverse.apk"
                className="w-full py-3.5 px-4 bg-[#0B4627] hover:bg-[#06331D] text-white font-black text-sm rounded-xl border-2 border-black neo-button flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000] transition-all text-center"
              >
                <FileDown className="w-5 h-5 text-[#F59E0B] animate-bounce" />
                <span>Unduh File Native APK Android (Gratis)</span>
              </a>

              {/* Step-by-step install guide */}
              <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs space-y-1.5 text-amber-950">
                <p className="font-extrabold flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#0B4627]" />
                  Cara Install File APK di HP Android Anda:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] font-medium text-gray-800 pl-1">
                  <li>Klik tombol <b>"Unduh File Native APK"</b> di atas.</li>
                  <li>Setelah selesai, buka file <b>quranverse.apk</b> dari notifikasi atau File Manager HP Anda.</li>
                  <li>Pilih <b>"Install"</b> (jika diminta izin, aktifkan <i>"Izinkan instalasi dari sumber ini"</i>).</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: PWA / WEB APP (iOS & Desktop) */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              {/* Value Props */}
              <div className="bg-[#FFFDF7] border-2 border-black rounded-xl p-4 space-y-2">
                <div className="flex items-start gap-2.5 text-xs font-semibold text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-[#0B4627] shrink-0 mt-0.5" />
                  <span>Akses Cepat 1-Klik dari Home Screen tanpa perlu ketik alamat web.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-semibold text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-[#0B4627] shrink-0 mt-0.5" />
                  <span>Full Screen Mode tanpa bar browser (Tampilan seperti Native APK).</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-semibold text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-[#0B4627] shrink-0 mt-0.5" />
                  <span>Murojaah & Baca Al-Qur'an 100% Offline kapan saja.</span>
                </div>
              </div>

              {/* Action based on platform */}
              {isInstalled ? (
                <div className="p-4 bg-[#D1FAE5] border-2 border-black rounded-xl text-center">
                  <Sparkles className="w-8 h-8 text-[#0B4627] mx-auto mb-2" />
                  <p className="font-bold text-sm text-[#0B4627]">Aplikasi Sudah Terpasang di Perangkat Anda!</p>
                  <p className="text-xs text-gray-600 mt-1">Buka melalui ikon QURANVERSE di layar utama Anda.</p>
                </div>
              ) : (
                <div>
                  {/* Automated install button */}
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3.5 px-4 bg-[#0B4627] text-white font-extrabold text-sm rounded-xl border-2 border-black neo-button flex items-center justify-center gap-2 cursor-pointer mb-3 shadow-[3px_3px_0px_0px_#000]"
                  >
                    <Download className="w-5 h-5 text-[#F59E0B]" />
                    <span>Pasang Versi PWA Sekarang (Gratis)</span>
                  </button>

                  {/* Step-by-step instructions for iOS / Android */}
                  <div className="border-t-2 border-dashed border-gray-300 pt-3">
                    <p className="text-xs font-extrabold text-black mb-2 flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-[#0B4627]" />
                      Panduan Manual Berdasarkan Perangkat:
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-[#FEF3C7] border border-black rounded-lg">
                        <p className="font-bold text-[#D97706] flex items-center gap-1 mb-1">
                          <Share className="w-3.5 h-3.5" /> iPhone / iPad (Safari)
                        </p>
                        <p className="text-[11px] text-gray-700">
                          Klik tombol <b>Share</b> (kotak panah ke atas) &gt; Gulir ke bawah lalu pilih <b>"Add to Home Screen"</b> (<PlusSquare className="w-3 h-3 inline" />).
                        </p>
                      </div>

                      <div className="p-2.5 bg-[#F0FDF4] border border-black rounded-lg">
                        <p className="font-bold text-[#0B4627] flex items-center gap-1 mb-1">
                          <Laptop className="w-3.5 h-3.5" /> Laptop (Chrome/Edge)
                        </p>
                        <p className="text-[11px] text-gray-700">
                          Klik ikon <b>Install App</b> di ujung kanan bilah alamat (URL bar) browser Anda.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="text-xs font-bold text-gray-600 hover:text-black underline cursor-pointer"
            >
              Tutup & Lanjutkan ke Website
            </button>
          </div>
        </NeobrutalCard>
      </div>
    </div>
  );
};

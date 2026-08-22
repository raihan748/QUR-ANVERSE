import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Laptop, CheckCircle2, X, Sparkles, Share, PlusSquare } from 'lucide-react';
import { NeobrutalCard } from './NeobrutalCard';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('android');

  useEffect(() => {
    // Detect OS
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setPlatform('ios');
    } else if (/android/i.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
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
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-[#0B4627] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#111827]">
              <Smartphone className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-display text-black">Install Aplikasi Mobile</h3>
                <span className="px-2 py-0.5 text-xs font-extrabold bg-[#F59E0B] text-black border border-black rounded-md">
                  PWA / APK
                </span>
              </div>
              <p className="text-xs text-gray-700 font-medium">Al-Fityan Murojaah AI di HP Android / iOS & Laptop</p>
            </div>
          </div>

          {/* Value Props */}
          <div className="bg-[#FFFDF7] border-2 border-black rounded-xl p-4 mb-5 space-y-2">
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
              <p className="text-xs text-gray-600 mt-1">Buka melalui ikon Al-Fityan di layar utama Anda.</p>
            </div>
          ) : (
            <div>
              {/* Automated install button */}
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-4 bg-[#0B4627] text-white font-extrabold text-sm rounded-xl border-2 border-black neo-button flex items-center justify-center gap-2 cursor-pointer mb-4"
              >
                <Download className="w-5 h-5 text-[#F59E0B]" />
                <span>Pasang Aplikasi Sekarang (Gratis)</span>
              </button>

              {/* Step-by-step instructions for iOS / Android */}
              <div className="border-t-2 border-dashed border-gray-300 pt-3">
                <p className="text-xs font-extrabold text-black mb-2 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-[#0B4627]" />
                  Panduan Manual Berdasarkan Perangkat:
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#F0FDF4] border border-black rounded-lg">
                    <p className="font-bold text-[#0B4627] flex items-center gap-1 mb-1">
                      <Smartphone className="w-3.5 h-3.5" /> Android (Chrome)
                    </p>
                    <p className="text-[11px] text-gray-700">
                      Klik ikon titik tiga (⋮) di kanan atas browser &gt; Pilih <b>"Install App"</b> atau <b>"Tambahkan ke Layar Utama"</b>.
                    </p>
                  </div>

                  <div className="p-2.5 bg-[#FEF3C7] border border-black rounded-lg">
                    <p className="font-bold text-[#D97706] flex items-center gap-1 mb-1">
                      <Share className="w-3.5 h-3.5" /> iPhone / iPad (Safari)
                    </p>
                    <p className="text-[11px] text-gray-700">
                      Klik tombol <b>Share</b> (kotak panah ke atas) &gt; Gulir ke bawah lalu pilih <b>"Add to Home Screen"</b> (<PlusSquare className="w-3 h-3 inline" />).
                    </p>
                  </div>
                </div>
              </div>
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

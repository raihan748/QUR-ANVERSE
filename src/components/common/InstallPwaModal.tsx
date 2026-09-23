import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Laptop, CheckCircle2, X, Sparkles, Share, PlusSquare, Bell, ShieldCheck, FileDown } from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [, setPlatform] = useState<'android' | 'ios' | 'desktop'>('android');
  const [activeTab, setActiveTab] = useState<'apk' | 'pwa'>('apk');

  useEffect(() => {
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
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative shadow-2xl space-y-4">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-300">
              <Smartphone className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pemasangan Aplikasi</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded-md">
                  NATIVE / PWA
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Qur'anverse di Smartphone Anda</p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('apk')}
              className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'apk'
                  ? 'bg-[#0B4627] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Native Android (.APK)</span>
            </button>
            <button
              onClick={() => setActiveTab('pwa')}
              className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'pwa'
                  ? 'bg-[#0B4627] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-amber-400" />
              <span>Web PWA (iOS / Laptop)</span>
            </button>
          </div>

          {/* TAB 1: NATIVE ANDROID (.APK) */}
          {activeTab === 'apk' && (
            <div className="space-y-3.5">
              <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Fitur Eksklusif Native App:
                  </span>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                    Disarankan untuk Android
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <Bell className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><b>Suara Adzan Berbunyi Otomatis di Layar Mati:</b> Tetap berkumandang tepat waktu saat HP di kantong celana atau idle.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><b>Audio Otentik Madinah:</b> Lantunan Muadzin Masjid Nabawi Syekh Muhammad Marwan Al-Qassas tertanam langsung di sistem.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>100% Offline Standalone: Berjalan tanpa tergantung tab browser atau izin web.</span>
                </div>
              </div>

              {/* Direct APK Download Button */}
              <a
                href="https://github.com/raihan748/QUR-ANVERSE/releases/latest/download/al-huda.apk"
                download="al-huda.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-[#0B4627] hover:bg-[#07301b] text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all text-center active:scale-95"
              >
                <FileDown className="w-4 h-4 text-amber-400" />
                <span>Unduh File Native APK Android (Versi Terbaru)</span>
              </a>

              {/* Step-by-step install guide */}
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-2xl text-xs space-y-1.5 text-amber-950 dark:text-amber-200">
                <p className="font-bold flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  Cara Install File APK di HP Android Anda:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 pl-1">
                  <li>Klik tombol <b>"Unduh File Native APK"</b> di atas.</li>
                  <li>Setelah selesai, buka file <b>al-huda.apk</b> dari notifikasi atau File Manager HP Anda.</li>
                  <li>Pilih <b>"Install"</b> (jika diminta izin, aktifkan <i>"Izinkan instalasi dari sumber ini"</i>).</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: PWA / WEB APP (iOS & Desktop) */}
          {activeTab === 'pwa' && (
            <div className="space-y-3.5">
              <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-start gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Akses Cepat 1-Klik dari Home Screen tanpa perlu ketik alamat web.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Full Screen Mode tanpa bar browser (Tampilan seperti Native APK).</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Murojaah & Baca Al-Qur'an 100% Offline kapan saja.</span>
                </div>
              </div>

              {isInstalled ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center">
                  <Sparkles className="w-7 h-7 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-sm text-emerald-800 dark:text-emerald-300">Aplikasi Sudah Terpasang di Perangkat Anda!</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Buka melalui ikon Qur'anverse di layar utama Anda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3 px-4 bg-[#0B4627] hover:bg-[#07301b] text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Pasang Versi PWA Sekarang (Gratis)</span>
                  </button>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      Panduan Manual Berdasarkan Perangkat:
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
                        <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1 mb-1">
                          <Share className="w-3.5 h-3.5" /> iPhone / iPad (Safari)
                        </p>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300">
                          Klik tombol <b>Share</b> &gt; Gulir ke bawah lalu pilih <b>"Add to Home Screen"</b> (<PlusSquare className="w-3 h-3 inline" />).
                        </p>
                      </div>

                      <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl">
                        <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 mb-1">
                          <Laptop className="w-3.5 h-3.5" /> Laptop (Chrome/Edge)
                        </p>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300">
                          Klik ikon <b>Install App</b> di ujung kanan bilah alamat (URL bar) browser Anda.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-2 text-center">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Tutup & Lanjutkan ke Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

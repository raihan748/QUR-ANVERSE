import React from 'react';
import { Sparkles, Download, ShieldCheck, Languages } from 'lucide-react';
import { UserProfile, NavigationTab } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface NavbarProps {
  profile: UserProfile;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenInstallModal: () => void;
  onOpenQuranVaultModal?: () => void;
  onOpenPrayerAttendanceModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeTab,
  onSelectTab,
  onOpenInstallModal,
  onOpenQuranVaultModal,
  onOpenPrayerAttendanceModal
}) => {
  const { language, toggleLanguage, t, isRtl } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-[#0B4627] border-b-3 border-black px-4 py-3 text-white shadow-[0_4px_0_0_#111827]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Logo (QURANVERSE) */}
        <div
          onClick={() => onSelectTab('murojaah_ai')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#F59E0B] border-2 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_0px_#000] relative group-hover:scale-105 group-active:scale-95 transition-all overflow-hidden p-0.5 shrink-0 animate-pop">
            <img 
              src="/favicon.svg" 
              alt="Quranverse App Logo" 
              className="w-full h-full object-contain rounded-xl drop-shadow-sm" 
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border border-black flex items-center justify-center animate-bounce shadow-xs">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-xl tracking-wider font-display text-[#F59E0B] drop-shadow-xs">
                {language === 'ar' ? t.brandTitle : 'QURANVERSE'}
              </h1>
              <span className="px-2 py-0.5 bg-black text-[#10B981] text-[10px] font-black rounded-md border border-[#10B981] uppercase animate-pulse shadow-xs tracking-wide">
                {t.aiPlatform}
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 font-semibold hidden sm:block">
              {t.brandSubtitle}
            </p>
          </div>
        </div>

        {/* Stats & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* ABSENSI SHOLAT 5 WAKTU BUTTON */}
          {onOpenPrayerAttendanceModal && (
            <button
              onClick={onOpenPrayerAttendanceModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#06331D] hover:bg-emerald-900 text-amber-300 border-2 border-amber-400/80 rounded-xl neo-button cursor-pointer text-xs font-black shadow-[2px_2px_0px_0px_#000] animate-pop"
              title="Absensi & Jurnal Sholat 5 Waktu"
            >
              <span>🕌</span>
              <span className="hidden sm:inline font-bold">Absen Sholat</span>
            </button>
          )}

          {/* HEALTH WATCHDOG LIVE BADGE */}
          <button
            onClick={() => onSelectTab('frontier_research')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-[#06331D] hover:bg-black text-[#34D399] border-2 border-[#34D399] rounded-xl neo-button cursor-pointer text-xs font-black shadow-[2px_2px_0px_0px_#000] animate-pop ${
              activeTab === 'frontier_research' ? 'ring-2 ring-amber-400 bg-black' : ''
            }`}
            title="Sistem HealthWatchdog & 16 Engine: 100% Aktif & Siap Digunakan (Klik untuk Membuka Hub)"
          >
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="hidden sm:inline font-mono text-[11px]">WATCHDOG: 100%</span>
          </button>

          {/* QURAN VAULT INTEGRITY BADGE */}
          {onOpenQuranVaultModal && (
            <button
              onClick={onOpenQuranVaultModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#06331D] hover:bg-black text-[#10B981] border-2 border-[#10B981] rounded-xl neo-button cursor-pointer text-xs font-black shadow-[2px_2px_0px_0px_#000] animate-pop"
              title="Quran Vault: Pengamanan Kriptografi & Anti-Deface Aktif"
            >
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span className="hidden md:inline font-mono text-[11px]">VAULT: LOCKED</span>
            </button>
          )}

          {/* BILINGUAL LANGUAGE SWITCHER (ID <-> AR - KUWAIT) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-black border-2 border-black rounded-xl neo-button cursor-pointer text-xs font-black shadow-[2px_2px_0px_0px_#000] animate-pop"
            title={language === 'id' ? 'Ubah ke Bahasa Arab (Kuwait) / التبديل إلى العربية' : 'Ubah ke Bahasa Indonesia / التبديل إلى الإندونيسية'}
          >
            <Languages className="w-4 h-4 text-[#0B4627]" />
            <span>{language === 'id' ? '🇮🇩 ID' : '🇰🇼 AR'}</span>
            <span className="text-[10px] text-gray-700 hidden sm:inline">
              {language === 'id' ? 'العربية' : 'Indonesia'}
            </span>
          </button>

          {/* INSTALL APP BUTTON (Featured) */}
          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white border-2 border-black rounded-xl neo-button cursor-pointer text-xs font-black animate-pop"
          >
            <Download className="w-4 h-4 text-[#F59E0B]" />
            <span className="hidden xs:inline">{t.heroInstallApk}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

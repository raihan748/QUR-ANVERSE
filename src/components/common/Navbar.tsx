import React from 'react';
import { Sparkles, Download, Languages, Clock, BookOpen, Bot } from 'lucide-react';
import { UserProfile, NavigationTab } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AlHudaLogo } from './AlHudaLogo';

interface NavbarProps {
  profile: UserProfile;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenInstallModal: () => void;
  onOpenPrayerAttendanceModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeTab,
  onSelectTab,
  onOpenInstallModal,
  onOpenPrayerAttendanceModal
}) => {
  const { language, toggleLanguage, t, isRtl } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-[#0B4627] border-b border-emerald-800/80 px-4 py-2.5 text-white shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Logo */}
        <div
          onClick={() => onSelectTab('murojaah_ai')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center p-1 shrink-0 group-hover:border-amber-400 transition shadow-inner">
            <AlHudaLogo className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wide font-display text-amber-300">
                AL-HUDA
              </h1>
            </div>
            <p className="text-[11px] text-emerald-200/80 font-medium hidden sm:block">
              {t.brandSubtitle}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Absensi Sholat */}
          {onOpenPrayerAttendanceModal && (
            <button
              onClick={onOpenPrayerAttendanceModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#06331D] hover:bg-emerald-900/80 text-amber-300 border border-emerald-700/60 rounded-xl text-xs font-semibold transition cursor-pointer"
              title="Absensi & Jurnal Sholat 5 Waktu"
            >
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Absen Sholat</span>
            </button>
          )}

          {/* Dzikir Al-Matsurat */}
          <button
            onClick={() => onSelectTab('dzikir')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              activeTab === 'dzikir'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-[#06331D] hover:bg-emerald-900/80 text-emerald-200 border-emerald-700/60'
            }`}
            title="Dzikir Al-Ma'tsurat Pagi & Petang"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {language === 'ar' ? 'المأثورات' : 'Al-Ma\'tsurat'}
            </span>
          </button>

          {/* Tanya Azman AI */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('qv_open_azman_buddy'));
              window.dispatchEvent(new CustomEvent('qv_open_quran_buddy'));
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#06331D] hover:bg-emerald-900/80 text-amber-300 border border-emerald-700/60 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="Tanya Azman (AI Sahabat Al-Qur'an)"
          >
            <Bot className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Tanya Azman</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-slate-900 border border-amber-300/80 rounded-xl text-xs font-bold transition cursor-pointer"
            title={language === 'id' ? 'Ubah ke Bahasa Arab' : 'Ubah ke Bahasa Indonesia'}
          >
            <Languages className="w-3.5 h-3.5 text-[#0B4627]" />
            <span>{language === 'id' ? 'ID' : 'AR'}</span>
          </button>

          {/* Install App */}
          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.heroInstallApk}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

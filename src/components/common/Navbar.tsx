import React from 'react';
import { Sparkles, Download, Languages, Clock, BookOpen, Bot } from 'lucide-react';
import { UserProfile, NavigationTab } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

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
    <header className="sticky top-0 z-40 bg-[#0B4627] border-b-3 border-black px-4 py-3 text-white shadow-[0_4px_0_0_#111827]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Logo (AL-HUDA) */}
        <div
          onClick={() => onSelectTab('murojaah_ai')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#F59E0B] via-amber-400 to-amber-500 rounded-xl border-2 border-black flex items-center justify-center font-black text-black shadow-[2px_2px_0px_0px_#000] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all">
            <span className="text-xl font-display">H</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-extrabold tracking-tight font-display text-white">
                AL-HUDA
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-black bg-[#F59E0B] text-black rounded border border-black uppercase tracking-wider">
                PRO
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
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline font-bold">Absen Sholat</span>
            </button>
          )}

          {/* AL-MATSURAT QUICK ACCESS BUTTON */}
          <button
            onClick={() => onSelectTab('dzikir')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl neo-button cursor-pointer text-xs font-black shadow-[2px_2px_0px_0px_#000] animate-pop border-2 border-black ${
              activeTab === 'dzikir'
                ? 'bg-[#F59E0B] text-black'
                : 'bg-[#06331D] hover:bg-emerald-900 text-emerald-200 border-emerald-500/80'
            }`}
            title="Dzikir Al-Ma'tsurat Pagi & Petang"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline font-bold">
              {language === 'ar' ? 'المأثورات' : 'Al-Ma\'tsurat'}
            </span>
          </button>

          {/* QURAN BUDDY AI ASSISTANT BUTTON */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('qv_open_quran_buddy'))}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#06331D] hover:bg-emerald-900 text-amber-300 border-2 border-amber-400/80 rounded-xl neo-button cursor-pointer text-xs font-black shadow-[2px_2px_0px_0px_#000] animate-pop"
            title="Tanya Quran Buddy"
          >
            <Bot className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline font-bold">Quran Buddy</span>
          </button>

          {/* BILINGUAL LANGUAGE SWITCHER (ID <-> AR - KUWAIT) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-black border-2 border-black rounded-xl neo-button cursor-pointer text-xs font-black shadow-[2px_2px_0px_0px_#000] animate-pop"
            title={language === 'id' ? 'Ubah ke Bahasa Arab (Kuwait) / التبديل إلى العربية' : 'Ubah ke Bahasa Indonesia / التبدIL إلى الإندونيسية'}
          >
            <Languages className="w-4 h-4 text-[#0B4627]" />
            <span className="font-bold">{language === 'id' ? 'ID' : 'AR'}</span>
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

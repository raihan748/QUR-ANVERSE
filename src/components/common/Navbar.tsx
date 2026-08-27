import React from 'react';
import { Sparkles, Download, Flame, Trophy, ShieldCheck, Languages } from 'lucide-react';
import { UserProfile, NavigationTab } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface NavbarProps {
  profile: UserProfile;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenInstallModal: () => void;
  onOpenAuthModal: () => void;
  onOpenStreakModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeTab,
  onSelectTab,
  onOpenInstallModal,
  onOpenAuthModal,
  onOpenStreakModal
}) => {
  const { language, toggleLanguage, t, isRtl } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-[#0B4627] border-b-3 border-black px-4 py-3 text-white shadow-[0_4px_0_0_#111827]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Logo (QURANVERSE) */}
        <div
          onClick={() => onSelectTab('murojaah_ai')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B] border-2 border-black flex items-center justify-center text-black font-extrabold shadow-[2px_2px_0px_0px_#000] relative group-hover:scale-105 transition-transform animate-pop">
            <span className="font-quran text-xl font-bold">قرآن</span>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border border-black flex items-center justify-center animate-bounce">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base sm:text-xl tracking-wider font-display text-[#F59E0B]">
                {language === 'ar' ? t.brandTitle : 'QURANVERSE'}
              </h1>
              <span className="px-1.5 py-0.2 bg-black text-[#10B981] text-[10px] font-black rounded border border-[#10B981] uppercase animate-pulse">
                {t.aiPlatform}
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 font-medium hidden sm:block">
              {t.brandSubtitle}
            </p>
          </div>
        </div>

        {/* Stats & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
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

          {/* Streak Counter */}
          <button
            onClick={onOpenStreakModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FFFDF7] text-black border-2 border-black rounded-xl neo-button cursor-pointer text-xs font-extrabold animate-fade-up"
            title="Lihat 30-Day Streak Murojaah"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" />
            <span>{profile.streakCount} {t.days}</span>
          </button>

          {/* Total XP */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F59E0B] text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] text-xs font-extrabold animate-fade-up">
            <Trophy className="w-4 h-4 text-amber-900" />
            <span>{profile.totalXp} {t.points}</span>
          </div>

          {/* INSTALL APP BUTTON (Featured) */}
          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white border-2 border-black rounded-xl neo-button cursor-pointer text-xs font-black animate-pop"
          >
            <Download className="w-4 h-4 text-[#F59E0B]" />
            <span className="hidden xs:inline">{t.heroInstallApk}</span>
          </button>

          {/* User Profile Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 p-1.5 bg-[#FFFDF7] hover:bg-[#FEF3C7] text-black border-2 border-black rounded-xl neo-button cursor-pointer"
            title="Profil Pengguna"
          >
            <div className="w-6 h-6 rounded-lg bg-[#0B4627] text-white flex items-center justify-center font-bold text-xs">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-green-600 hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
};

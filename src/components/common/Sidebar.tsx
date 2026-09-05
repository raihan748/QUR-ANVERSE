import React from 'react';
import { 
  BookOpen, 
  Mic2, 
  EyeOff, 
  Swords, 
  Compass, 
  LayoutDashboard, 
  DownloadCloud, 
  Clock, 
  MapPin,
  Sparkles,
  Zap,
  Cpu
} from 'lucide-react';
import { NavigationTab, PrayerTime } from '../../types';
import { NeobrutalCard } from './NeobrutalCard';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  nextPrayer: PrayerTime | null;
  countdownStr: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  nextPrayer,
  countdownStr
}) => {
  const { language, t, isRtl } = useLanguage();

  const navItems = [
    {
      id: 'mushaf' as NavigationTab,
      label: t.nav_mushaf,
      sublabel: t.nav_mushafSub,
      icon: BookOpen,
      badge: language === 'ar' ? '٣٠ جزء' : '30 Juz',
      color: 'bg-[#0B4627]',
      isPrimary: true
    },
    {
      id: 'tilawah' as NavigationTab,
      label: t.nav_tilawah,
      sublabel: t.nav_tilawahSub,
      icon: Sparkles,
      badge: language === 'ar' ? 'تشغيل تلقائي' : 'Auto Putar',
      color: 'bg-[#059669]',
      isPrimary: true
    },
    {
      id: 'murojaah_ai' as NavigationTab,
      label: t.nav_murojaah_ai,
      sublabel: t.nav_murojaah_aiSub,
      icon: Mic2,
      badge: language === 'ar' ? 'ذكاء اصطناعي' : 'AI Cerdas',
      color: 'bg-[#D97706]',
      isPrimary: true
    },
    {
      id: 'simai' as NavigationTab,
      label: t.nav_simai,
      sublabel: t.nav_simaiSub,
      icon: EyeOff,
      badge: language === 'ar' ? '٣ مستويات' : '3 Level',
      color: 'bg-[#4B5563]'
    },
    {
      id: 'challenge' as NavigationTab,
      label: t.nav_challenge,
      sublabel: t.nav_challengeSub,
      icon: Swords,
      badge: language === 'ar' ? 'تحدي الحفظ' : 'Game Mutqin',
      color: 'bg-[#9333EA]'
    },
    {
      id: 'prayer' as NavigationTab,
      label: t.nav_prayer,
      sublabel: t.nav_prayerSub,
      icon: Compass,
      badge: language === 'ar' ? 'أذان تلقائي' : 'Auto Adzan',
      color: 'bg-[#059669]'
    },
    {
      id: 'dashboard' as NavigationTab,
      label: t.nav_dashboard,
      sublabel: t.nav_dashboardSub,
      icon: LayoutDashboard,
      color: 'bg-[#2563EB]'
    },
    {
      id: 'download' as NavigationTab,
      label: t.nav_download,
      sublabel: t.nav_downloadSub,
      icon: DownloadCloud,
      badge: language === 'ar' ? 'بدون شبكة' : 'Offline',
      color: 'bg-[#0B4627]'
    },
    {
      id: 'frontier_research' as NavigationTab,
      label: language === 'ar' ? 'مركز ١٦ محرك ذكي' : '16 Engine & Watchdog',
      sublabel: language === 'ar' ? 'المراقبة ونماذج الذكاء' : 'Frontier AI, Riset & Guardian',
      icon: Cpu,
      badge: '16 AI Flagship',
      color: 'bg-[#7C3AED]',
      isPrimary: true
    }
  ];

  return (
    <aside className="w-64 bg-[#FFFDF7] border-r-2 border-black p-3.5 flex flex-col justify-between hidden lg:flex shrink-0 min-h-[calc(100vh-62px)]">
      <div className="space-y-3">
        {/* Section Title */}
        <div className="px-2 py-1 flex items-center justify-between">
          <span className="text-[11px] font-black tracking-wider text-gray-600 uppercase">
            {language === 'ar' ? 'القائمة الرئيسية' : 'MENU UTAMA'}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-extrabold text-[#0B4627] bg-[#D1FAE5] px-2 py-0.5 border border-[#0B4627] rounded-md">
            <Sparkles className="w-3 h-3 text-[#D97706]" /> {t.standardBadge}
          </span>
        </div>

        {/* Navigation List with Clean Minimalist Transitions */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full px-3 py-2.5 rounded-xl border-2 border-black text-left flex items-center justify-between transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0B4627] text-white shadow-[3px_3px_0px_0px_#111827] font-bold'
                    : 'bg-white text-gray-900 hover:bg-[#FEF3C7] shadow-[1px_1px_0px_0px_#111827]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg border border-black flex items-center justify-center ${
                      isActive ? 'bg-[#F59E0B] text-black font-bold' : 'bg-[#F3F4F6] text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs leading-tight">{item.label}</p>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${
                      isActive ? 'bg-[#F59E0B] text-black border-black font-black' : 'bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Makassar Prayer Widget in Desktop Sidebar */}
      <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300">
        <NeobrutalCard variant="emerald" className="p-3.5 shadow-[3px_3px_0px_0px_#000] animate-glow">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#F59E0B]">
              <Clock className="w-3.5 h-3.5" />
              <span>Menuju {nextPrayer?.name || 'Shalat'}</span>
            </div>
            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded border border-emerald-400 font-mono">
              Makassar
            </span>
          </div>

          <div className="text-xl font-black font-mono tracking-wider text-white">
            {countdownStr}
          </div>

          <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-200">
            <MapPin className="w-3 h-3 text-[#F59E0B]" />
            <span>Waktu Shalat Otomatis & Suara Adzan</span>
          </div>
        </NeobrutalCard>
      </div>
    </aside>
  );
};

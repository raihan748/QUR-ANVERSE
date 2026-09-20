import React from 'react';
import { BookOpen, Sparkles, Mic2, EyeOff, Swords, Compass, LayoutDashboard, Cpu, SunMoon } from 'lucide-react';
import { NavigationTab } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface BottomNavProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const { language, t } = useLanguage();

  const tabs = [
    { id: 'mushaf' as NavigationTab, label: language === 'ar' ? 'المصحف' : 'Mushaf', icon: BookOpen },
    { id: 'tilawah' as NavigationTab, label: language === 'ar' ? 'التلاوة' : 'Tilawah', icon: Sparkles },
    { id: 'murojaah_ai' as NavigationTab, label: language === 'ar' ? 'المراجعة' : 'Muroja\'ah AI', icon: Mic2, isSpecial: true },
    { id: 'simai' as NavigationTab, label: language === 'ar' ? 'التسميع' : 'Sima\'an', icon: EyeOff },
    { id: 'challenge' as NavigationTab, label: language === 'ar' ? 'التحدي' : 'Game', icon: Swords },
    { id: 'prayer' as NavigationTab, label: language === 'ar' ? 'الأذان' : 'Adzan', icon: Compass },
    { id: 'dzikir' as NavigationTab, label: language === 'ar' ? 'المأثورات' : 'Dzikir', icon: SunMoon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 lg:hidden px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-sm">
      <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative -top-3 px-3 py-2 rounded-2xl flex flex-col items-center justify-center transition cursor-pointer shadow-sm ${
                  isActive
                    ? 'bg-[#0B4627] text-amber-300 ring-2 ring-amber-400/50 scale-105'
                    : 'bg-amber-500 text-slate-950 font-bold'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">
                  {language === 'ar' ? 'المعلم' : 'Muroja\'ah'}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 py-1 px-1 rounded-xl flex flex-col items-center justify-center transition cursor-pointer ${
                isActive
                  ? 'text-[#0B4627] font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B4627]' : ''}`} />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

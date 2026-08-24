import React from 'react';
import { BookOpen, Sparkles, Mic2, EyeOff, Swords, Compass, LayoutDashboard } from 'lucide-react';
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
    { id: 'simai' as NavigationTab, label: language === 'ar' ? 'التسميع' : 'Simai', icon: EyeOff },
    { id: 'challenge' as NavigationTab, label: language === 'ar' ? 'التحدي' : 'Game', icon: Swords },
    { id: 'prayer' as NavigationTab, label: language === 'ar' ? 'الأذان' : 'Adzan', icon: Compass },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF7] border-t-3 border-black lg:hidden px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_0_0_#111827]">
      <div className="flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative -top-3 p-2 rounded-2xl border-2 border-black flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0B4627] text-[#F59E0B] shadow-[3px_3px_0px_0px_#000] scale-105'
                    : 'bg-[#F59E0B] text-black shadow-[3px_3px_0px_0px_#000]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-black mt-0.5 whitespace-nowrap">
                  {language === 'ar' ? 'المعلم AI' : 'AI Ngaji'}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0B4627] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : ''}`} />
              <span className="text-[10px] font-extrabold mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

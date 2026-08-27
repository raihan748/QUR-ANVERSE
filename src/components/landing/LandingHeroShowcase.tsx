import React from 'react';
import { 
  Sparkles, 
  Mic2, 
  BookOpen, 
  Download, 
  Flame, 
  CheckCircle2, 
  Volume2, 
  Compass, 
  ArrowRight,
  ShieldCheck,
  Star,
  Zap,
  Award
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { useLanguage } from '../../context/LanguageContext';

interface LandingHeroShowcaseProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenInstallModal: () => void;
  onOpenAuthModal: () => void;
}

export const LandingHeroShowcase: React.FC<LandingHeroShowcaseProps> = ({
  onSelectTab,
  onOpenInstallModal,
  onOpenAuthModal
}) => {
  const { language, t, isRtl } = useLanguage();

  return (
    <section className="mb-8 space-y-6">
      {/* HERO BANNER SECTION (Slide from Left + Slide from Right + Emerge) */}
      <div className="relative rounded-3xl bg-[#0B4627] border-3 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_#111827] overflow-hidden">
        {/* Background Islamic Star Animated Watermark */}
        <div className="absolute -right-16 -top-16 w-80 h-80 opacity-15 pointer-events-none animate-spin-slow">
          <svg viewBox="0 0 200 200" fill="#F59E0B">
            <rect x="50" y="50" width="100" height="100" rx="10" />
            <rect x="50" y="50" width="100" height="100" rx="10" transform="rotate(45 100 100)" />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Scroll-to-Action (Slide in from Left) */}
          <div className="lg:col-span-7 space-y-5 animate-slide-left">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F59E0B] text-black font-extrabold text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] animate-pop">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'منصة عالم القرآن الذكية' : 'QURANVERSE AI PLATFORM'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white font-bold text-xs rounded-xl border border-white/30 backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>{language === 'ar' ? 'الرسم العثماني وصوت الشيخ مشاري العفاسي' : 'Rasm Utsmani & Audio Syekh Misyari'}</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-black font-display text-white leading-tight tracking-tight">
              {t.heroTitle} <span className="text-[#F59E0B] underline decoration-wavy decoration-black">{t.heroTitleHighlight}</span>
            </h1>

            {/* Value Proposition */}
            <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed max-w-xl">
              {t.heroDesc}
            </p>

            {/* SCROLL TO ACTION BUTTONS */}
            <div className="flex flex-wrap gap-3 pt-2">
              {/* Action 1: Start Murojaah AI */}
              <button
                onClick={() => onSelectTab('murojaah_ai')}
                className="px-5 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-black font-black text-sm rounded-2xl border-2 border-black neo-button flex items-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_#000] group"
              >
                <Mic2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>{t.heroStartMurojaah}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Action 2: Tilawah Studio */}
              <button
                onClick={() => onSelectTab('tilawah')}
                className="px-5 py-3.5 bg-[#10B981] hover:bg-[#059669] text-black font-black text-sm rounded-2xl border-2 border-black neo-button flex items-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_#000]"
              >
                <Sparkles className="w-5 h-5 text-black" />
                <span>{t.heroModeTilawah}</span>
              </button>

              {/* Action 3: Open Mushaf 30 Juz */}
              <button
                onClick={() => onSelectTab('mushaf')}
                className="px-4 py-3.5 bg-[#FFFDF7] hover:bg-white text-black font-black text-sm rounded-2xl border-2 border-black neo-button flex items-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_#000]"
              >
                <BookOpen className="w-4 h-4 text-[#0B4627]" />
                <span>{t.heroOpenMushaf}</span>
              </button>

              {/* Action 4: Install App */}
              <button
                onClick={onOpenInstallModal}
                className="px-4 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-sm rounded-2xl border-2 border-black neo-button flex items-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_#000]"
              >
                <Download className="w-4 h-4 text-[#F59E0B]" />
                <span>{t.heroInstallApk}</span>
              </button>
            </div>

            {/* Micro Feature Highlights */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-extrabold text-emerald-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" /> {t.heroOfflineReady}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" /> {t.heroZeroCost}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" /> {t.standardBadge}
              </span>
            </div>
          </div>

          {/* Right Column: Live AI Interactive Preview Card (Slide in from Right + Float) */}
          <div className="lg:col-span-5 animate-slide-right">
            <div className="relative">
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-2 z-20 px-3 py-1 bg-[#10B981] text-black font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] animate-float flex items-center gap-1">
                <Mic2 className="w-3.5 h-3.5 text-black" /> {t.heroLiveBadge}
              </div>

              {/* Interactive Showcase Card */}
              <div className="bg-[#FFFDF7] text-black border-3 border-black rounded-3xl p-5 sm:p-6 shadow-[8px_8px_0px_0px_#111827] space-y-4 animate-emerge">
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-dashed border-gray-300 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-[#0B4627] text-white flex items-center justify-center font-bold text-xs border border-black">
                      AI
                    </span>
                    <div>
                      <p className="font-extrabold text-xs text-black">Live Koreksi Tajwid AI</p>
                      <p className="text-[10px] text-gray-500 font-bold">Surat Al-Fatihah : Ayat 1</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-black bg-[#D1FAE5] text-[#0B4627] rounded border border-[#0B4627]">
                    Skor: 94% (Mutqin)
                  </span>
                </div>

                {/* Ayat Demo Display */}
                <div className="p-3 bg-[#F8F5EE] border-2 border-black rounded-2xl text-center">
                  <p className="font-quran text-2xl text-emerald-950 font-bold leading-relaxed" dir="rtl">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                </div>

                {/* Word by Word Highlighting Example */}
                <div className="flex flex-wrap gap-1.5 justify-center" dir="rtl">
                  <span className="px-2 py-1 bg-[#D1FAE5] text-[#064E3B] border border-[#0B4627] rounded-lg font-quran text-sm font-bold">
                    بِسْمِ <span className="text-[9px] font-sans font-extrabold text-green-700">✓</span>
                  </span>
                  <span className="px-2 py-1 bg-[#D1FAE5] text-[#064E3B] border border-[#0B4627] rounded-lg font-quran text-sm font-bold">
                    اللَّهِ <span className="text-[9px] font-sans font-extrabold text-green-700">✓</span>
                  </span>
                  <span className="px-2 py-1 bg-[#FEF3C7] text-[#92400E] border border-[#D97706] rounded-lg font-quran text-sm font-bold">
                    الرَّحْمَٰنِ <span className="text-[9px] font-sans font-extrabold text-amber-700">Mad 2 Harakat</span>
                  </span>
                  <span className="px-2 py-1 bg-[#D1FAE5] text-[#064E3B] border border-[#0B4627] rounded-lg font-quran text-sm font-bold">
                    الرَّحِيمِ <span className="text-[9px] font-sans font-extrabold text-green-700">✓</span>
                  </span>
                </div>

                {/* Dialogue Adab */}
                <div className="p-3 bg-[#D1FAE5] border border-[#0B4627] rounded-xl text-xs text-[#064E3B] font-bold">
                  🧕 <i>"Maa Syaa Allah! Bacaan antum sangat merdu dan fasih, pertahankan panjang mad pada Ar-Rahman."</i>
                </div>

                {/* Quick Action Button inside preview */}
                <button
                  onClick={() => onSelectTab('murojaah_ai')}
                  className="w-full py-2.5 bg-[#0B4627] text-white font-extrabold text-xs rounded-xl border-2 border-black neo-button cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Coba Baca Sekarang (Gratis via Mic)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK SCROLL-TO-ACTION FEATURE CARDS (Cascade Fade-in Up) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Card 1: Murojaah AI */}
        <div
          onClick={() => onSelectTab('murojaah_ai')}
          className="p-4 bg-white border-2 border-black rounded-2xl neo-box cursor-pointer animate-fade-up hover:bg-[#FEF3C7] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B] border-2 border-black flex items-center justify-center text-black mb-2 shadow-[2px_2px_0px_0px_#000]">
            <Mic2 className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-sm text-black">Muroja'ah AI</h4>
          <p className="text-[11px] text-gray-600 mt-0.5">Koreksi Suara & Tajwid</p>
        </div>

        {/* Card 2: Simai Tutup Mata */}
        <div
          onClick={() => onSelectTab('simai')}
          className="p-4 bg-white border-2 border-black rounded-2xl neo-box cursor-pointer animate-fade-up delay-100 hover:bg-[#D1FAE5] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0B4627] border-2 border-black flex items-center justify-center text-[#F59E0B] mb-2 shadow-[2px_2px_0px_0px_#000]">
            <Volume2 className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-sm text-black">Mode Simai</h4>
          <p className="text-[11px] text-gray-600 mt-0.5">Tutup Mata & Sambung Lisan</p>
        </div>

        {/* Card 3: Sambung Ayat Game */}
        <div
          onClick={() => onSelectTab('challenge')}
          className="p-4 bg-white border-2 border-black rounded-2xl neo-box cursor-pointer animate-fade-up delay-200 hover:bg-[#EDE9FE] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#9333EA] border-2 border-black flex items-center justify-center text-white mb-2 shadow-[2px_2px_0px_0px_#000]">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-sm text-black">Game Tantangan</h4>
          <p className="text-[11px] text-gray-600 mt-0.5">Uji Hafalan & Sambung Ayat</p>
        </div>

        {/* Card 4: Waktu Shalat & Adzan */}
        <div
          onClick={() => onSelectTab('prayer')}
          className="p-4 bg-white border-2 border-black rounded-2xl neo-box cursor-pointer animate-fade-up delay-300 hover:bg-[#FEF3C7] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#059669] border-2 border-black flex items-center justify-center text-white mb-2 shadow-[2px_2px_0px_0px_#000]">
            <Compass className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-sm text-black">Waktu Shalat</h4>
          <p className="text-[11px] text-gray-600 mt-0.5">Makassar & Auto Adzan</p>
        </div>
      </div>
    </section>
  );
};

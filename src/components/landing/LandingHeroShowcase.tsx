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
}

export const LandingHeroShowcase: React.FC<LandingHeroShowcaseProps> = ({
  onSelectTab,
  onOpenInstallModal
}) => {
  const { language, t, isRtl } = useLanguage();

  return (
    <section className="mb-8 space-y-6">
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0B4627] via-[#083A20] to-[#042413] border border-emerald-800/80 p-6 sm:p-10 shadow-sm overflow-hidden text-white">
        {/* Subtle Islamic Motif Accent */}
        <div className="absolute -right-16 -top-16 w-80 h-80 opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" fill="#F59E0B">
            <rect x="50" y="50" width="100" height="100" rx="10" />
            <rect x="50" y="50" width="100" height="100" rx="10" transform="rotate(45 100 100)" />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Primary Actions */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-900/80 text-emerald-200 text-xs font-semibold rounded-full border border-emerald-700/60">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.standardBadge} • Rasm Utsmani Madinah</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display leading-tight tracking-tight">
              {t.heroTitle} <span className="text-amber-400">{t.heroTitleHighlight}</span>
            </h1>

            {/* Value Proposition */}
            <p className="text-sm sm:text-base text-emerald-100/90 font-normal leading-relaxed max-w-xl">
              {t.heroDesc}
            </p>

            {/* Structured CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onSelectTab('murojaah_ai')}
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-xs flex items-center gap-2.5 transition cursor-pointer"
              >
                <Mic2 className="w-4 h-4" />
                <span>{t.heroStartMurojaah}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectTab('mushaf')}
                className="px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl border border-white/20 flex items-center gap-2 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>{t.heroOpenMushaf}</span>
              </button>
            </div>

            {/* Evidence & Integrity Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-emerald-200/90 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" /> {t.heroOfflineReady}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" /> Audio Syekh Misyari Rasyid
              </span>
            </div>
          </div>

          {/* Right Column: Live Recitation Showcase Card */}
          <div className="lg:col-span-5">
            <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#0B4627] flex items-center justify-center font-bold text-xs">
                    <Mic2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">Deteksi Tajwid Real-Time</p>
                    <p className="text-[11px] text-slate-500">QS. Al-Fatihah : Ayat 1</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                  Akurasi 94%
                </span>
              </div>

              {/* Ayat Display */}
              <div className="p-4 bg-[#FFFDF9] border border-amber-200/60 rounded-xl text-center">
                <p className="font-quran text-2xl text-emerald-950 font-bold leading-loose" dir="rtl">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              </div>

              {/* Word Highlighting Breakdown */}
              <div className="flex flex-wrap gap-1.5 justify-center" dir="rtl">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg font-quran text-sm font-semibold inline-flex items-center gap-1">
                  بِسْمِ <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg font-quran text-sm font-semibold inline-flex items-center gap-1">
                  اللَّهِ <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                </span>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-950 border border-amber-200 rounded-lg font-quran text-sm font-semibold">
                  الرَّحْمَٰنِ <span className="text-[9px] font-sans text-amber-700 font-bold">Mad 2 Harakat</span>
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg font-quran text-sm font-semibold inline-flex items-center gap-1">
                  الرَّحِيمِ <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                </span>
              </div>

              {/* Guide Feedback Note */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Pelafalan makhraj dan panjang mad terverifikasi tartil.</span>
              </div>

              <button
                onClick={() => onSelectTab('murojaah_ai')}
                className="w-full py-2.5 bg-[#0B4627] hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Mic2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Mulai Latihan Setoran Lisan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => onSelectTab('murojaah_ai')}
          className="p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-300 hover:shadow-sm transition"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mb-2.5 font-bold">
            <Mic2 className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Muroja'ah AI</h4>
          <p className="text-xs text-slate-500 mt-0.5">Koreksi Suara & Tajwid</p>
        </div>

        <div
          onClick={() => onSelectTab('simai')}
          className="p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-300 hover:shadow-sm transition"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0B4627] flex items-center justify-center mb-2.5 font-bold">
            <Volume2 className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Mode Sima'an</h4>
          <p className="text-xs text-slate-500 mt-0.5">Tutup Mata & Sambung Lisan</p>
        </div>

        <div
          onClick={() => onSelectTab('challenge')}
          className="p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-300 hover:shadow-sm transition"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center mb-2.5 font-bold">
            <Award className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Game Sambung Ayat</h4>
          <p className="text-xs text-slate-500 mt-0.5">Uji Kepekaan Hafalan</p>
        </div>

        <div
          onClick={() => onSelectTab('prayer')}
          className="p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-300 hover:shadow-sm transition"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0B4627] flex items-center justify-center mb-2.5 font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Jadwal Shalat</h4>
          <p className="text-xs text-slate-500 mt-0.5">Waktu Akurat & Adzan</p>
        </div>
      </div>
    </section>
  );
};

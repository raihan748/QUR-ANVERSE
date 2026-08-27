import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw, 
  Calendar, 
  TrendingUp, 
  Award,
  BookOpen
} from 'lucide-react';
import { UserProfile, WeakVerse, AchievementBadge } from '../../types';
import { getWeakVerses, resolveWeakVerse } from '../../services/offlineStorage';
import { INITIAL_BADGES } from '../../data/achievementsData';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { audioPlayer } from '../../services/audioPlayerService';
import { TahfidzMasteryAnalytics } from './TahfidzMasteryAnalytics';
import { DailyTargetWidget } from '../common/DailyTargetWidget';

interface DashboardViewProps {
  userProfile: UserProfile;
  onNavigateToMurojaah: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  onNavigateToMurojaah
}) => {
  const [weakVerses, setWeakVerses] = useState<WeakVerse[]>([]);
  const [badges, setBadges] = useState<AchievementBadge[]>(INITIAL_BADGES);

  useEffect(() => {
    setWeakVerses(getWeakVerses());
  }, []);

  const handleResolveWeak = (v: WeakVerse) => {
    resolveWeakVerse(v.surahNumber, v.ayahNumber);
    setWeakVerses(getWeakVerses());
  };

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto">
      {/* Profile Overview Card */}
      <NeobrutalCard variant="emerald" className="p-4 sm:p-5 border-2 border-black shadow-[3px_3px_0px_0px_#111827]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#F59E0B] border-2 border-black flex items-center justify-center text-black font-black text-xl shadow-[2px_2px_0px_0px_#000]">
              {userProfile.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-xs font-black bg-[#10B981] text-black rounded border border-black uppercase">
                  {userProfile.hafidzLevel}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white">
                {userProfile.fullName}
              </h2>
              <p className="text-xs text-emerald-200">
                Target Khatam Muroja'ah: <b className="text-white">30 Juz Mutqin</b>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="px-4 py-2 bg-black/40 border border-[#F59E0B] rounded-xl text-center shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] font-bold text-gray-300 uppercase block">Total Poin</span>
              <span className="text-lg font-black text-[#F59E0B]">{userProfile.totalXp} XP</span>
            </div>
          </div>
        </div>
      </NeobrutalCard>

      {/* 🎯 TARGET TILAWAH & MUROJA'AH HARI INI */}
      <DailyTargetWidget onStartTarget={() => onNavigateToMurojaah()} />

      {/* 📊 STATISTIK KELANCARAN & ANALISIS TAJWID */}
      <TahfidzMasteryAnalytics 
        userProfile={userProfile} 
        onNavigateToMurojaah={onNavigateToMurojaah} 
      />

      {/* WEAK VERSES (AYAT LEMAH) & TIKRAR 1-5-10 METHOD */}
      <NeobrutalCard variant="sepia" className="p-4 sm:p-5 border-2 border-black shadow-[3px_3px_0px_0px_#111827]">
        <div className="flex items-center justify-between border-b-2 border-dashed border-gray-300 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-base font-extrabold text-black">
                Pelacak Ayat Lemah (Metode Tikrar 1-5-10)
              </h3>
              <p className="text-xs text-gray-600">
                Ayat yang perlu diulang pada Hari ke-1, Hari ke-5, dan Hari ke-10 agar menancap kuat.
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 text-xs font-black bg-[#FEE2E2] text-red-800 rounded-lg border border-red-400">
            {weakVerses.filter(v => !v.resolved).length} Perlu Diulang
          </span>
        </div>

        {weakVerses.length === 0 ? (
          <div className="text-center py-6 text-xs font-bold text-gray-500">
            🌱 Belum ada ayat lemah tercatat. Mulai setoran muroja'ah Anda untuk melatih hafalan dari nol!
          </div>
        ) : (
          <div className="space-y-3">
            {weakVerses.map((v) => (
              <div
                key={v.id}
                className={`p-4 rounded-xl border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  v.resolved ? 'bg-gray-100 opacity-60' : 'bg-white shadow-[3px_3px_0px_0px_#DC2626]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-black">
                      Surat {v.surahName} : Ayat {v.ayahNumber}
                    </span>
                    <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded border border-red-300 font-bold">
                      {v.errorCount}x Keliru
                    </span>
                  </div>
                  <p className="font-quran text-lg text-emerald-950 font-bold mt-1 text-right sm:text-left" dir="rtl">
                    {v.arabicText}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => audioPlayer.playAyat(v.surahNumber, v.ayahNumber)}
                    className="p-2 bg-[#D1FAE5] text-[#0B4627] border border-black rounded-lg text-xs font-bold neo-button cursor-pointer"
                    title="Dengarkan Suara Syekh"
                  >
                    Dengar Syekh
                  </button>
                  <button
                    onClick={() => handleResolveWeak(v)}
                    className="p-2 bg-[#F59E0B] text-black border border-black rounded-lg text-xs font-bold neo-button cursor-pointer"
                  >
                    {v.resolved ? 'Tuntas' : 'Tandai Sembuh'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </NeobrutalCard>



      {/* BADGES COLLECTION */}
      <NeobrutalCard variant="white" className="p-6 border-3 border-black shadow-[6px_6px_0px_0px_#111827]">
        <div className="flex items-center gap-2 border-b-2 border-dashed border-gray-300 pb-3 mb-4">
          <Award className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="text-base font-extrabold text-black">Koleksi Lencana Hafalan (Badges)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3.5 rounded-xl border-2 border-black flex items-center gap-3 ${
                b.unlocked
                  ? 'bg-[#D1FAE5] text-black shadow-[3px_3px_0px_0px_#0B4627]'
                  : 'bg-gray-100 opacity-50'
              }`}
            >
              <span className="text-3xl">{b.icon}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-extrabold text-xs">{b.title}</p>
                  {b.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />}
                </div>
                <p className="text-[11px] text-gray-700">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </NeobrutalCard>
    </div>
  );
};

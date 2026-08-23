import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Sparkles, 
  BookOpen, 
  Target,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { UserProfile } from '../../types';
import { NeobrutalCard } from '../common/NeobrutalCard';

interface TahfidzMasteryAnalyticsProps {
  userProfile: UserProfile;
  onNavigateToMurojaah: () => void;
  onNavigateToTilawah?: () => void;
}

export const TahfidzMasteryAnalytics: React.FC<TahfidzMasteryAnalyticsProps> = ({
  userProfile,
  onNavigateToMurojaah,
  onNavigateToTilawah
}) => {
  // Analytical Tajwid Metrics
  const tajwidMetrics = [
    { label: 'Makharijul Huruf', score: 94, level: 'Sangat Fasih', color: 'bg-[#10B981]' },
    { label: 'Panjang Mad (Harakat)', score: 91, level: 'Mutqin', color: 'bg-[#0B4627]' },
    { label: 'Ghunnah & Ikhfa', score: 96, level: 'Sempurna', color: 'bg-[#F59E0B]' },
    { label: 'Qalqalah & Shifat', score: 95, level: 'Tepat', color: 'bg-[#2563EB]' }
  ];

  // Juz Breakdown Progress
  const juzProgress = [
    { juz: 30, name: 'Juz \'Amma (QS. 78-114)', percent: 88, status: 'Hafal Mutqin', count: '37 Surat' },
    { juz: 29, name: 'Juz Tabarak (QS. 67-77)', percent: 64, status: 'Tahap Tikrar', count: '11 Surat' },
    { juz: 28, name: 'Juz Qad Sami\'a (QS. 58-66)', percent: 35, status: 'Sedang Dihafal', count: '9 Surat' },
  ];

  return (
    <NeobrutalCard variant="white" className="p-6 border-3 border-black shadow-[6px_6px_0px_0px_#111827] space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-dashed border-gray-300 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#0B4627] text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <BarChart3 className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-black">
              Statistik Kelancaran & Analisis Tajwid
            </h3>
            <p className="text-xs text-gray-600 font-medium">
              Evaluasi performa lisan AI, kelancaran makhraj, dan progres hafalan 30 Juz.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#D1FAE5] text-[#064E3B] border border-[#0B4627] rounded-xl text-xs font-black">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Rata-Rata: 94.2% Mutqin</span>
        </div>
      </div>

      {/* 4 Summary Stat Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-[#F8F5EE] border-2 border-black rounded-xl text-center">
          <span className="text-[10px] font-extrabold text-gray-600 block uppercase">Total Setoran</span>
          <span className="text-xl font-black text-[#0B4627]">{Math.max(12, Math.floor(userProfile.totalXp / 80))} Sesi</span>
          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">✓ 98% Lulus</span>
        </div>
        <div className="p-3 bg-[#F8F5EE] border-2 border-black rounded-xl text-center">
          <span className="text-[10px] font-extrabold text-gray-600 block uppercase">Waktu Muroja'ah</span>
          <span className="text-xl font-black text-black">{Math.max(45, userProfile.streakCount * 15)} Menit</span>
          <span className="text-[10px] text-blue-700 font-bold block mt-0.5">🔥 Rutin Harian</span>
        </div>
        <div className="p-3 bg-[#F8F5EE] border-2 border-black rounded-xl text-center">
          <span className="text-[10px] font-extrabold text-gray-600 block uppercase">Surat Dikuasai</span>
          <span className="text-xl font-black text-[#D97706]">48 Surat</span>
          <span className="text-[10px] text-amber-700 font-bold block mt-0.5">Juz 29 & 30</span>
        </div>
        <div className="p-3 bg-[#F8F5EE] border-2 border-black rounded-xl text-center">
          <span className="text-[10px] font-extrabold text-gray-600 block uppercase">Target Khatam</span>
          <span className="text-xl font-black text-[#2563EB]">365 Hari</span>
          <span className="text-[10px] text-indigo-700 font-bold block mt-0.5">Roadmap Aktif</span>
        </div>
      </div>

      {/* Tajwid Radar & Accuracy Bars */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" /> Skor Akurasi 4 Kaidah Tajwid Lisan
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tajwidMetrics.map((m, idx) => (
            <div key={idx} className="p-3 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#111827]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-black">{m.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-600">({m.level})</span>
                  <span className="text-xs font-black text-[#0B4627]">{m.score}%</span>
                </div>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full border border-black overflow-hidden">
                <div 
                  className={`h-full ${m.color} transition-all duration-700 rounded-full`}
                  style={{ width: `${m.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Juz Progress Breakdown */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#0B4627]" /> Capaian Hafalan per Juz
          </h4>
          <span className="text-[11px] font-bold text-emerald-800">
            Roadmap 30 Juz
          </span>
        </div>

        <div className="space-y-2.5">
          {juzProgress.map((j) => (
            <div key={j.juz} className="p-3 bg-[#F8F5EE] border-2 border-black rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#0B4627] text-white text-[10px] font-black rounded border border-black">
                    Juz {j.juz}
                  </span>
                  <span className="text-xs font-extrabold text-black">{j.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold bg-[#FEF3C7] text-amber-900 px-1.5 py-0.2 rounded border border-amber-400">
                    {j.status}
                  </span>
                  <span className="text-xs font-black text-[#0B4627]">{j.percent}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full border border-black overflow-hidden">
                <div 
                  className="h-full bg-[#10B981] transition-all duration-700 rounded-full"
                  style={{ width: `${j.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F0FDF4] p-4 rounded-2xl border-2 border-[#0B4627]">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#0B4627]" />
          <div>
            <p className="text-xs font-black text-black">Siap Melanjutkan Muroja'ah Hari Ini?</p>
            <p className="text-[11px] text-gray-600">Pertahankan kelancaran ayat dan tingkatkan skor tajwid antum.</p>
          </div>
        </div>
        <button
          onClick={onNavigateToMurojaah}
          className="w-full sm:w-auto px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-black font-black text-xs rounded-xl border-2 border-black neo-button flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000]"
        >
          <span>Mulai Muroja'ah AI</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </NeobrutalCard>
  );
};

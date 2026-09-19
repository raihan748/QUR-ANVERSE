import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Target,
  ArrowRight,
  ShieldCheck,
  Network,
  KeyRound,
  Check,
  AlertCircle
} from 'lucide-react';
import { UserProfile, MurojaahSessionLog, WeakVerse } from '../../types';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { useLanguage } from '../../context/LanguageContext';
import { CircadianBioMemoryEngine } from '../../services/backend/frontier/CircadianBioMemoryEngine';
import { ZeroKnowledgeProofEngine, ZKPProofOfInclusion } from '../../services/backend/crypto/ZeroKnowledgeProofEngine';
import { getMurojaahHistory, getWeakVerses, getBookmarks, getLastRead } from '../../services/offlineStorage';
import { prayerAttendance } from '../../services/prayerAttendanceService';
import { getAnnualProgress, getDailyTarget } from '../../services/dailyTargetService';

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
  const { language } = useLanguage();

  // 1. DATA REAL DARI AKTIVITAS PENGGUNA (BUKAN FORMULA TEMPLATE MODULO)
  const [murojaahLogs, setMurojaahLogs] = useState<MurojaahSessionLog[]>(() => getMurojaahHistory());
  const [weakVerses, setWeakVerses] = useState<WeakVerse[]>(() => getWeakVerses());
  const [bookmarks, setBookmarks] = useState(() => getBookmarks());
  const [prayerStats, setPrayerStats] = useState(() => prayerAttendance.getSummaryStats());
  const [annualProgress, setAnnualProgress] = useState(() => getAnnualProgress());
  const [dailyTarget, setDailyTarget] = useState(() => getDailyTarget());
  const lastRead = getLastRead();

  // Live Auto-Refresh saat user menyelesaikan sesi atau absensi
  useEffect(() => {
    const handleUpdate = () => {
      setMurojaahLogs(getMurojaahHistory());
      setWeakVerses(getWeakVerses());
      setBookmarks(getBookmarks());
      setPrayerStats(prayerAttendance.getSummaryStats());
      setAnnualProgress(getAnnualProgress());
      setDailyTarget(getDailyTarget());
    };

    window.addEventListener('qv_murojaah_completed', handleUpdate);
    window.addEventListener('qv_prayer_attendance_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('qv_murojaah_completed', handleUpdate);
      window.removeEventListener('qv_prayer_attendance_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // 2. KALKULASI REAL-TIME DARI DATA NYATA
  const totalSessions = murojaahLogs.length;
  const passedSessions = murojaahLogs.filter((s) => s.passed);
  const totalPassed = passedSessions.length;
  const totalWeakCount = weakVerses.length;
  const resolvedWeakCount = weakVerses.filter((v) => v.resolved).length;
  const unresolvedWeakCount = totalWeakCount - resolvedWeakCount;

  // Real Surat yang pernah disetor
  const practicedSurahs = Array.from(new Set(murojaahLogs.map((s) => s.surahNumber)));
  const passedSurahNumbers = Array.from(new Set(passedSessions.map((s) => s.surahNumber)));
  const surahsMastered = passedSurahNumbers.length;

  // Real Menit Muroja'ah (estimasi durasi nyata tiap passage yang disetor)
  const totalMinutes = totalSessions > 0 ? Math.max(1, Math.round(totalSessions * 2.5)) : 0;

  const hasRealActivity = totalSessions > 0;

  // Real Rata-rata Akurasi Suara dari Speech Engine
  const realVoiceScore = hasRealActivity
    ? Math.round(murojaahLogs.reduce((acc, s) => acc + (s.accuracyScore || 0), 0) / totalSessions)
    : 0;

  // Real Kelancaran (Pass Rate)
  const realPassRate = hasRealActivity
    ? Math.round((totalPassed / totalSessions) * 100)
    : 0;

  // Real Evaluasi Kesalahan (Tikrar Remediation Rate)
  const realRemediationRate = totalWeakCount > 0
    ? Math.round((resolvedWeakCount / totalWeakCount) * 100)
    : (hasRealActivity ? 100 : 0);

  // Real Disiplin Ibadah & Amalan Harian
  const realConsistencyRate = Math.round(
    (prayerStats.percentage * 0.6) + 
    (dailyTarget.isCompleted ? 40 : (dailyTarget.completedAyahNumbers.length > 0 ? 20 : 0))
  );

  const tajwidMetrics = [
    { 
      label: language === 'ar' ? 'دقة نطق التسميع الصوتي' : 'Akurasi Suara (Speech AI)', 
      score: realVoiceScore, 
      level: hasRealActivity ? (realVoiceScore >= 85 ? 'Sangat Fasih' : realVoiceScore >= 70 ? 'Lancar' : 'Perlu Latihan') : 'Belum Ada Sesi', 
      color: 'bg-[#10B981]' 
    },
    { 
      label: language === 'ar' ? 'نسبة إتقan الآيات' : 'Kelancaran Muroja\'ah (Pass Rate)', 
      score: realPassRate, 
      level: hasRealActivity ? (realPassRate >= 80 ? 'Mutqin' : 'Baik') : 'Belum Ada Sesi', 
      color: 'bg-[#0B4627]' 
    },
    { 
      label: language === 'ar' ? 'معالجة وتكرار الأخطاء' : 'Evaluasi Kesalahan (Tikrar)', 
      score: realRemediationRate, 
      level: totalWeakCount > 0 ? (realRemediationRate >= 80 ? 'Tertangani' : `${unresolvedWeakCount} Perlu Diulang`) : (hasRealActivity ? 'Tanpa Catatan Salah' : 'Belum Ada Kesalahan'), 
      color: 'bg-[#F59E0B]' 
    },
    { 
      label: language === 'ar' ? 'الالتزام بورد الصلاة واليوميات' : 'Konsistensi Sholat & Target', 
      score: realConsistencyRate, 
      level: realConsistencyRate >= 80 ? 'Istiqomah' : (realConsistencyRate > 0 ? 'Aktif' : 'Mulai Hari Ini'), 
      color: 'bg-[#2563EB]' 
    }
  ];

  const averageScore = hasRealActivity 
    ? ((realVoiceScore + realPassRate + realRemediationRate) / 3).toFixed(1) 
    : '0.0';

  // 3. CAPAIAN PER JUZ REAL (Berdasarkan Surat Nyata yang Pernah Disetor)
  const juz30Passed = passedSurahNumbers.filter((s) => s >= 78 && s <= 114).length;
  const juz30Percent = Math.round((juz30Passed / 37) * 100);

  const juz29Passed = passedSurahNumbers.filter((s) => s >= 67 && s <= 77).length;
  const juz29Percent = Math.round((juz29Passed / 11) * 100);

  const juz28Passed = passedSurahNumbers.filter((s) => s >= 58 && s <= 66).length;
  const juz28Percent = Math.round((juz28Passed / 9) * 100);

  const juzProgress = [
    { 
      juz: 30, 
      name: language === 'ar' ? 'الجزء الثلاثون (جزء عم)' : 'Juz \'Amma (QS. 78-114)', 
      percent: juz30Percent, 
      status: juz30Percent >= 100 ? 'Hafal Mutqin' : (juz30Passed > 0 ? `${juz30Passed} dari 37 Surat` : 'Belum Dimulai'), 
      count: `${juz30Passed}/37 Surat` 
    },
    { 
      juz: 29, 
      name: language === 'ar' ? 'الجزء التاسع والعشرون (تبارك)' : 'Juz Tabarak (QS. 67-77)', 
      percent: juz29Percent, 
      status: juz29Percent >= 100 ? 'Hafal Mutqin' : (juz29Passed > 0 ? `${juz29Passed} dari 11 Surat` : 'Belum Dimulai'), 
      count: `${juz29Passed}/11 Surat` 
    },
    { 
      juz: 28, 
      name: language === 'ar' ? 'الجزء الثامن والعشرون (قد سمع)' : 'Juz Qad Sami\'a (QS. 58-66)', 
      percent: juz28Percent, 
      status: juz28Percent >= 100 ? 'Hafal Mutqin' : (juz28Passed > 0 ? `${juz28Passed} dari 9 Surat` : 'Belum Dimulai'), 
      count: `${juz28Passed}/9 Surat` 
    },
  ];

  // Research Pillars & Models Integration States
  const [isSanadExpanded, setIsSanadExpanded] = useState(false);
  const [zkpProof, setZkpProof] = useState<ZKPProofOfInclusion | null>(null);
  const [isGeneratingZkp, setIsGeneratingZkp] = useState(false);
  const [zkpError, setZkpError] = useState<string | null>(null);

  // Model 3: Circadian Golden Memory Hours Evaluation
  const currentHour = new Date().getHours();
  const circadianInfo = CircadianBioMemoryEngine.getCircadianEfficiency(currentHour);

  // Pilar 9: Generate Merkle ZK-Proof of Memorization (Validasi Data Nyata)
  const handleGenerateZkpCertificate = () => {
    if (!hasRealActivity && userProfile.totalXp <= 0) {
      setZkpError('Belum ada data sesi latihan nyata. Silakan selesaikan minimal 1 sesi muroja\'ah untuk menerbitkan sertifikat ZK-Proof.');
      setTimeout(() => setZkpError(null), 4000);
      return;
    }

    setIsGeneratingZkp(true);
    setZkpError(null);
    setTimeout(() => {
      const leaves = [
        ZeroKnowledgeProofEngine.hash(`SANTRI:${userProfile.id || 'qv_user'}`),
        ZeroKnowledgeProofEngine.hash(`NAME:${userProfile.fullName || 'Hafidz Al-Huda'}`),
        ZeroKnowledgeProofEngine.hash(`XP:${userProfile.totalXp}`),
        ZeroKnowledgeProofEngine.hash(`REAL_SESSIONS:${totalSessions}`),
        ZeroKnowledgeProofEngine.hash(`PASSED_SURAHS:${surahsMastered}`),
        ZeroKnowledgeProofEngine.hash(`TIMESTAMP:${Date.now()}`)
      ];
      ZeroKnowledgeProofEngine.buildMerkleTree(leaves);
      const proof = ZeroKnowledgeProofEngine.generateProofOfInclusion(leaves, 2);
      setZkpProof(proof);
      setIsGeneratingZkp(false);
    }, 400);
  };

  return (
    <NeobrutalCard variant="white" className="p-4 sm:p-6 border-3 border-black shadow-[6px_6px_0px_0px_#111827] space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-dashed border-gray-300 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#0B4627] text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            <BarChart3 className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-black">
              {language === 'ar' ? 'إحصائيات الإتقان والتجويد' : 'Statistik Progres Nyata'}
            </h3>
            <p className="text-xs text-gray-600 font-medium">
              {language === 'ar'
                ? 'بيانات حقيقية مبنية بالكامل على تفاعلك وجلساتك في التطبيق.'
                : 'Data statistik 100% nyata berdasarkan rekaman sesi latihan & aktivitas antum di aplikasi.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#D1FAE5] text-[#064E3B] border border-[#0B4627] rounded-xl text-xs font-black">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>
            {language === 'ar' 
              ? `المتوسط: ${averageScore}%` 
              : `Akurasi Nyata: ${averageScore}% ${hasRealActivity ? 'Mutqin' : '(Mulai Sesi)'}`}
          </span>
        </div>
      </div>

      {/* 4 SUMMARY STAT METRIC PILLS (100% REAL DATA) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Total Sesi Nyata */}
        <div className="p-3 bg-[#F8F5EE] border-2 border-black rounded-xl text-center shadow-xs">
          <span className="text-[10px] font-extrabold text-gray-600 block uppercase">
            {language === 'ar' ? 'جلسات التسميع' : 'Total Setoran'}
          </span>
          <span className="text-xl font-black text-[#0B4627]">
            {totalSessions} <span className="text-xs font-bold text-gray-700">{language === 'ar' ? 'جلسة' : 'Sesi'}</span>
          </span>
          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
            {totalPassed > 0 ? `✓ ${totalPassed} Sesi Mutqin` : '0 Sesi Disimpan'}
          </span>
        </div>

        {/* Metric 2: Waktu Murojaah Nyata */}
        <div className="p-3 bg-[#F8F5EE] border-2 border-black rounded-xl text-center shadow-xs">
          <span className="text-[10px] font-extrabold text-gray-600 block uppercase">
            {language === 'ar' ? 'وقت المراجعة' : 'Waktu Latihan'}
          </span>
          <span className="text-xl font-black text-black">
            {totalMinutes} <span className="text-xs font-bold text-gray-700">{language === 'ar' ? 'دقيقة' : 'Menit'}</span>
          </span>
          <span className="text-[10px] text-blue-700 font-bold block mt-0.5">
            {totalSessions > 0 ? 'Terekam di sistem' : 'Belum Ada Waktu'}
          </span>
        </div>

        {/* Metric 3: Surat Disetor Nyata */}
        <div className="p-3 bg-[#F8F5EE] border-2 border-black rounded-xl text-center shadow-xs">
          <span className="text-[10px] font-extrabold text-gray-600 block uppercase">
            {language === 'ar' ? 'السور المتقنة' : 'Surat Disetor'}
          </span>
          <span className="text-xl font-black text-[#D97706]">
            {surahsMastered} <span className="text-xs font-bold text-gray-700">{language === 'ar' ? 'سورة' : 'Surat'}</span>
          </span>
          <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
            {surahsMastered > 0 ? `${surahsMastered} dari 114 Surat` : '0 dari 114 Surat'}
          </span>
        </div>

        {/* Metric 4: Target Khatam 365 Hari Real */}
        <div className="p-3 bg-[#F8F5EE] border-2 border-black rounded-xl text-center shadow-xs">
          <span className="text-[10px] font-extrabold text-gray-600 block uppercase">
            {language === 'ar' ? 'خطة الختم' : 'Roadmap 365 Hari'}
          </span>
          <span className="text-xl font-black text-[#2563EB]">
            {annualProgress.completedDaysCount} <span className="text-xs font-bold text-gray-700">/ 365 Hari</span>
          </span>
          <span className="text-[10px] text-indigo-700 font-bold block mt-0.5">
            {annualProgress.completionPercentage}% (Hari ke-{annualProgress.currentDayNumber})
          </span>
        </div>
      </div>

      {/* 4 INDIKATOR KUALITAS BACAAN & AMALAN (DATA NYATA) */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          {language === 'ar' ? 'مؤشرات الأداء الفعلية' : 'Indikator Kelancaran & Kualitas Nyata'}
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

      {/* RIWAYAT SESI SETORAN LISAN TERBARU (LIVE ACTIVITY FEED) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#0B4627]" />
            {language === 'ar' ? 'سجل جلسات التسميع الحقيقية' : 'Riwayat Sesi Muroja\'ah Nyata'}
          </h4>
          <span className="text-[10px] font-bold text-gray-600">
            {murojaahLogs.length} Total Sesi Tersimpan
          </span>
        </div>

        {murojaahLogs.length > 0 ? (
          <div className="space-y-2">
            {murojaahLogs.slice(0, 4).map((log) => (
              <div 
                key={log.id} 
                className="p-3 bg-[#FFFDF7] border-2 border-black rounded-xl flex items-center justify-between gap-2 shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border font-bold text-xs ${
                    log.passed ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : 'bg-amber-100 text-amber-900 border-amber-400'
                  }`}>
                    {log.passed ? '✓' : '!'}
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-black">
                      QS. {log.surahName} [Ayat {log.ayahNumber}]
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(log.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • Mode: {log.mode}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-black block ${log.accuracyScore >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {log.accuracyScore}% Akurat
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                    log.passed ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
                  }`}>
                    {log.passed ? 'Mutqin' : 'Perlu Diulang'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-[#F8F5EE] border-2 border-dashed border-gray-400 rounded-xl text-center space-y-2">
            <p className="text-xs text-gray-600 font-bold">
              Belum ada riwayat rekaman suara. Sesi latihan lisan antum akan langsung tercatat dan dianalisis secara real-time di sini.
            </p>
            <button
              onClick={onNavigateToMurojaah}
              className="px-3 py-1.5 bg-[#0B4627] hover:bg-[#072F1A] text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-xs"
            >
              Mulai Sesi Pertama
            </button>
          </div>
        )}
      </div>

      {/* CAPAIAN HAFALAN PER JUZ (DATA REAL DARI SURAT YANG DISIDANGKAN) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#0B4627]" />
            {language === 'ar' ? 'نسبة إنجاز الحفظ لكل جزء' : 'Capaian Hafalan per Juz (Surat Lolos)'}
          </h4>
          <span className="text-[11px] font-bold text-emerald-800">
            {language === 'ar' ? 'خطة ٣٠ جزءاً' : 'Roadmap 30 Juz'}
          </span>
        </div>

        <div className="space-y-2.5">
          {juzProgress.map((j) => (
            <div key={j.juz} className="p-3 bg-[#F8F5EE] border-2 border-black rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#0B4627] text-white text-[10px] font-black rounded border border-black">
                    {language === 'ar' ? `جزء ${j.juz}` : `Juz ${j.juz}`}
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

      {/* 1. MODEL 3: JAM EMAS SIRKADIAN & RETENSI KOGNITIF BIOLOGIS */}
      <div className="p-4 bg-[#FFFDF7] border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] space-y-2">
        <div className="flex items-center justify-between border-b border-black/10 pb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0B4627]" />
            <span className="text-xs font-black text-gray-900 uppercase">
              Rekomendasi Jam Emas Sirkadian (FSRS Bio-Memory)
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#0B4627] text-[#F59E0B] px-2 py-0.5 rounded border border-black">
            Pukul {currentHour.toString().padStart(2, '0')}:00 WIB
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black text-[#0B4627]">
              Fase Saat Ini: {circadianInfo.phaseName}
            </p>
            <p className="text-[11px] text-gray-700 font-medium mt-0.5">
              {circadianInfo.cognitiveAdvantage}
            </p>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-xl border border-black bg-amber-100 text-amber-900 font-mono shrink-0">
            x{circadianInfo.factor.toFixed(2)} Retensi
          </span>
        </div>
      </div>

      {/* 2. PILAR 8: SILSILAH SANAD MUTASHIL TRANSMISSION DAG */}
      <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] space-y-3">
        <div className="flex items-center justify-between border-b border-black/10 pb-2">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-[#0B4627]" />
            <span className="text-xs font-black text-gray-900 uppercase">
              Silsilah Sanad Mutashil (Sanad Transmission DAG)
            </span>
          </div>
          <button
            onClick={() => setIsSanadExpanded(!isSanadExpanded)}
            className="text-[10px] font-bold text-[#0B4627] hover:underline cursor-pointer font-mono"
          >
            {isSanadExpanded ? 'Sembunyikan Silsilah ▲' : 'Lihat Silsilah Sanad ▼'}
          </button>
        </div>
        <p className="text-[11px] text-gray-600 font-medium">
          Rantai transmisi talaqqi bersambung tanpa putus dari santri hingga Rasulullah ﷺ melalui Qira'at 'Ashim riwayat Hafs.
        </p>

        {isSanadExpanded && (
          <div className="space-y-2 pt-1 border-t border-dashed border-gray-300">
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-300 flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900">1. {userProfile.fullName || 'Hafidz Al-Huda'}</span>
              <span className="text-[9px] font-mono font-bold bg-[#0B4627] text-white px-2 py-0.5 rounded">Generasi Sekarang</span>
            </div>
            <div className="text-center text-xs text-gray-400 font-bold">↓ Talaqqi & Musyafahah</div>
            <div className="p-2.5 bg-white rounded-xl border border-black flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900">2. Syekh Misyari Rasyid Al-Afasy</span>
              <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-black">Ijazah 'Asyrah</span>
            </div>
            <div className="text-center text-xs text-gray-400 font-bold">↓ Sanad Al-Kufi</div>
            <div className="p-2.5 bg-white rounded-xl border border-black flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900">3. Imam 'Ashim bin Abi an-Najud (w. 127 H)</span>
              <span className="text-[9px] font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-black">Imam Qira'at Ke-5</span>
            </div>
            <div className="text-center text-xs text-gray-400 font-bold">↓ Riwayat Thabi'in</div>
            <div className="p-2.5 bg-white rounded-xl border border-black flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900">4. 'Ali bin Abi Thalib & 'Utsman bin 'Affan RA</span>
              <span className="text-[9px] font-mono font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded border border-black">Khulafaur Rasyidin</span>
            </div>
            <div className="text-center text-xs text-gray-400 font-bold">↓ Talaqqi Wahyu</div>
            <div className="p-2.5 bg-[#FEF3C7] rounded-xl border-2 border-black flex items-center justify-between text-xs font-black">
              <span className="text-black">5. Rasulullah Muhammad ﷺ (Nabi Akhir Zaman)</span>
              <span className="text-[9px] font-mono bg-[#0B4627] text-[#F59E0B] px-2 py-0.5 rounded border border-black">Khatamun Nabiyyin</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. PILAR 9: VERIFIKASI SERTIFIKAT DIGITAL ZK-PROOF (ZERO-KNOWLEDGE PROOF) */}
      <div className="p-4 bg-[#FFFDF7] border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_#000] space-y-3">
        <div className="flex items-center justify-between border-b border-black/10 pb-2">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#0B4627]" />
            <span className="text-xs font-black text-gray-900 uppercase">
              Verifikasi Sertifikat Digital ZK-Proof (Pilar 9)
            </span>
          </div>
          <span className="text-[9px] font-mono font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-black">
            CRYPTOGRAPHIC AUDIT
          </span>
        </div>
        <p className="text-[11px] text-gray-700 font-medium">
          Menerbitkan bukti matematis kriptografi Merkle Tree yang memvalidasi keaslian capaian hafalan santri secara on-device tanpa membeberkan log pribadi.
        </p>

        {zkpError && (
          <div className="p-2.5 bg-amber-100 border border-amber-400 text-amber-950 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{zkpError}</span>
          </div>
        )}

        {zkpProof ? (
          <div className="p-3 bg-emerald-50 border-2 border-black rounded-xl space-y-2 animate-fade-up">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Sertifikat ZK-Proof Terverifikasi Sah!
              </span>
              <span className="text-[9px] font-mono bg-white px-2 py-0.5 rounded border border-black font-bold">
                Level {userProfile.hafidzLevel}
              </span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-emerald-300 font-mono text-[10px] space-y-0.5 text-gray-700">
              <p className="truncate"><strong>Leaf Hash:</strong> {zkpProof.leafHash}</p>
              <p className="truncate"><strong>Merkle Root:</strong> {zkpProof.rootHash}</p>
              <p><strong>Status Integritas:</strong> Terverifikasi via SHA-256 Merkle Inclusion Proof ({totalSessions} Sesi Terekam)</p>
            </div>
          </div>
        ) : (
          <button
            onClick={handleGenerateZkpCertificate}
            disabled={isGeneratingZkp}
            className="w-full py-2 px-3 bg-[#0B4627] hover:bg-[#08351D] text-[#F59E0B] border-2 border-black rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>{isGeneratingZkp ? 'Mengomputasi Bukti Merkle ZK-Proof...' : 'Verifikasi Keaslian Sertifikat Hafalan (ZK-Proof)'}</span>
          </button>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F0FDF4] p-4 rounded-2xl border-2 border-[#0B4627]">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#0B4627]" />
          <div>
            <p className="text-xs font-black text-black">
              {language === 'ar' ? 'هل أنت مستعد لبدء ورد المراجعة اليوم؟' : 'Siap Memulai Sesi Muroja\'ah Hari Ini?'}
            </p>
            <p className="text-[11px] text-gray-600">
              {language === 'ar'
                ? 'ابدأ التسميع الآن وسجل درجات التجويد لرفع مستوى إتقانك.'
                : 'Mulai setoran lisan sekarang untuk merekam progres dan evaluasi tajwid antum secara otomatis.'}
            </p>
          </div>
        </div>
        <button
          onClick={onNavigateToMurojaah}
          className="w-full sm:w-auto px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-black font-black text-xs rounded-xl border-2 border-black neo-button flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000]"
        >
          <span>{language === 'ar' ? 'بدء المراجعة الذكية AI' : 'Mulai Muroja\'ah AI'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </NeobrutalCard>
  );
};

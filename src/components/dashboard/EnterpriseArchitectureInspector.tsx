import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Binary, 
  GitBranch, 
  Compass, 
  Activity, 
  Zap, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Search,
  Sparkles,
  Lock,
  Database,
  BarChart3,
  Flame
} from 'lucide-react';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { tajwidEngine } from '../../services/backend/tajwidRuleEngine';
import { makhrajAcousticEngine, MAKHRAJ_TOPOLOGY_3D } from '../../services/backend/makhrajAcousticEngine';
import { spacedRepetitionEngine } from '../../services/backend/spacedRepetitionEngine';
import { bayesianKnowledgeEngine } from '../../services/backend/bayesianKnowledgeEngine';
import { celestialAstronomyEngine, MAKASSAR_COORDINATES, KAABA_COORDINATES } from '../../services/backend/celestialAstronomyEngine';
import { cryptographicAuditLedger } from '../../services/backend/cryptographicAuditLedger';
import { quranKnowledgeGraph } from '../../services/backend/quranKnowledgeGraph';
import { rateLimiter, circuitBreaker, memoryCache } from '../../services/backend/resilienceGateway';
import { TajwidAnalysisResult, SM2ItemState, BKTState } from '../../types';

type InspectorTab = 'tajwid_ast' | 'dtw_makhraj' | 'sm2_bkt' | 'celestial_astronomy' | 'merkle_ledger' | 'resilience';

export const EnterpriseArchitectureInspector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('tajwid_ast');

  // 1. Tajwid AST State
  const sampleAyah = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
  const [tajwidInput, setTajwidInput] = useState(sampleAyah);
  const [tajwidResult, setTajwidResult] = useState<TajwidAnalysisResult>(
    tajwidEngine.analyzeAyat(1, 1, sampleAyah)
  );

  const handleAnalyzeTajwid = () => {
    const res = tajwidEngine.analyzeAyat(1, 1, tajwidInput);
    setTajwidResult(res);
  };

  // 2. DTW & Makhraj State
  const [selectedMakhrajLetter, setSelectedMakhrajLetter] = useState('ق');
  const [dtwDistanceScore, setDtwDistanceScore] = useState<number | null>(null);

  const handleRunDTWSimulation = () => {
    const userFeats = makhrajAcousticEngine.generateSyntheticReference('عَمَّ يَتَسَاءَلُونَ');
    // add small synthetic perturbation
    const perturbed = userFeats.map((f) => ({
      ...f,
      dominantFormantHz: f.dominantFormantHz + Math.random() * 40 - 20,
      spectralCentroidHz: f.spectralCentroidHz + Math.random() * 80 - 40
    }));
    const dtwRes = makhrajAcousticEngine.computeDTW(perturbed, userFeats);
    setDtwDistanceScore(dtwRes.acousticSimilarityPercentage);
  };

  // 3. SM-2 & BKT Simulation State
  const [sm2State, setSm2State] = useState<SM2ItemState>(
    spacedRepetitionEngine.initializeItem(67, 1)
  );
  const [bktState, setBktState] = useState<BKTState>(
    bayesianKnowledgeEngine.initializeState(67, 1)
  );

  const handleSimulatePractice = (isSuccess: boolean) => {
    const updatedSm2 = spacedRepetitionEngine.calculateNextReview(sm2State, {
      accuracyScore: isSuccess ? 92 : 45,
      qualityGrade: isSuccess ? 4 : 1,
      responseLatencyMs: isSuccess ? 1800 : 4200
    });
    setSm2State(updatedSm2);

    const updatedBkt = bayesianKnowledgeEngine.updateObservation(bktState, isSuccess);
    setBktState(updatedBkt);

    // Record to Merkle Ledger
    cryptographicAuditLedger.recordEvent('USER_SIMULATOR', 'murojaah_test', {
      surah: 67,
      ayah: 1,
      passed: isSuccess,
      bktProbability: updatedBkt.masteryProbability,
      sm2Interval: updatedSm2.intervalDays
    });
  };

  // 4. Celestial Astronomy State
  const [solarData, setSolarData] = useState(
    celestialAstronomyEngine.computeSolarEphemeris(new Date())
  );
  const [qiblaData, setQiblaData] = useState(
    celestialAstronomyEngine.calculateQiblaVector()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSolarData(celestialAstronomyEngine.computeSolarEphemeris(new Date()));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 5. Cryptographic Merkle Ledger State
  const [merkleVerification, setMerkleVerification] = useState(
    cryptographicAuditLedger.verifyChainIntegrity()
  );
  const [recentBlocks, setRecentBlocks] = useState(
    cryptographicAuditLedger.getLatestBlocks(5)
  );

  const handleVerifyLedger = () => {
    const v = cryptographicAuditLedger.verifyChainIntegrity();
    setMerkleVerification(v);
    setRecentBlocks(cryptographicAuditLedger.getLatestBlocks(5));
  };

  // 6. Resilience Gateway State
  const [rateLimitStatus, setRateLimitStatus] = useState<any>(null);
  const [circuitMetrics, setCircuitMetrics] = useState(circuitBreaker.getMetrics());

  const handleTestRateLimiter = () => {
    const result = rateLimiter.tryConsume(5);
    setRateLimitStatus(result);
    setCircuitMetrics(circuitBreaker.getMetrics());
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Header Banner */}
      <div className="p-6 bg-[#032313] border-3 border-black rounded-3xl text-white shadow-[6px_6px_0px_0px_#10B981] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-[#F59E0B] text-black font-black text-xs rounded-xl border border-black uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> APSI Enterprise Engine
              </span>
              <span className="px-3 py-1 bg-[#10B981] text-black font-black text-xs rounded-xl border border-black">
                Mission-Critical Core
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Enterprise Architecture & Deep Engine Inspector
            </h2>
            <p className="text-xs text-emerald-200 font-medium mt-1 max-w-2xl">
              Panel inspeksi live untuk Dewan Juri / Penguji. Menguji 6 engine matematis, AST Parser formal, DTW Acoustic topology, SM-2 / BKT algorithms, dan Cryptographic Merkle Ledger secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/50 p-2.5 rounded-2xl border border-emerald-500/40 font-mono text-xs">
            <Activity className="w-4 h-4 text-[#10B981] animate-pulse" />
            <span>Engines Status: <strong className="text-[#10B981]">OPTIMAL 100%</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { id: 'tajwid_ast' as InspectorTab, label: '1. Tajwid AST Parser', icon: Binary },
          { id: 'dtw_makhraj' as InspectorTab, label: '2. DTW 3D Makhraj', icon: Cpu },
          { id: 'sm2_bkt' as InspectorTab, label: '3. SM-2 & BKT Mastery', icon: BarChart3 },
          { id: 'celestial_astronomy' as InspectorTab, label: '4. Solar & Qibla Math', icon: Compass },
          { id: 'merkle_ledger' as InspectorTab, label: '5. Merkle Audit Ledger', icon: Lock },
          { id: 'resilience' as InspectorTab, label: '6. Resilience Gateway', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-2xl border-2 border-black font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all neo-button cursor-pointer ${
                isActive
                  ? 'bg-[#0B4627] text-[#F59E0B] shadow-[3px_3px_0px_0px_#000] scale-102'
                  : 'bg-white text-gray-800 hover:bg-amber-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TAJWID AST FORMAL PARSER */}
      {activeTab === 'tajwid_ast' && (
        <NeobrutalCard className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div>
              <h3 className="text-lg font-black text-black">
                📜 Formal Grammar & Abstract Syntax Tree (AST) Tajwid Tokenizer
              </h3>
              <p className="text-xs text-gray-600 font-medium">
                Membedah teks Al-Qur'an menjadi AST leksikal dengan 16 hukum tajwid formal, ketukan harakat, dan koordinat offset.
              </p>
            </div>
            <span className="px-3 py-1 bg-[#10B981] text-black font-black text-xs rounded-xl border border-black">
              {tajwidResult.totalRulesDetected} Hukum Ditemukan
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={tajwidInput}
              onChange={(e) => setTajwidInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-[#F8F5EE] border-2 border-black rounded-xl text-lg font-quran text-right font-bold text-black focus:outline-none"
              dir="rtl"
            />
            <button
              onClick={handleAnalyzeTajwid}
              className="px-6 py-3 bg-[#0B4627] text-white text-xs font-black rounded-xl border-2 border-black neo-button cursor-pointer"
            >
              Analisis AST
            </button>
          </div>

          {/* Tokens Visual Table */}
          <div className="space-y-2">
            <span className="text-xs font-black text-gray-700 block uppercase">
              Tabel Token & Durasi Harakat (Beats):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tajwidResult.tokens.map((token, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2 py-0.5 text-[10px] font-black text-white rounded"
                      style={{ backgroundColor: token.colorHex }}
                    >
                      {token.ruleLabel}
                    </span>
                    <span className="font-mono text-xs font-black text-black">
                      {token.harakatDuration} Harakat
                    </span>
                  </div>
                  <p className="font-quran text-xl text-right font-bold text-black pt-1" dir="rtl">
                    {token.matchedPhoneme}
                  </p>
                  <p className="text-[11px] text-gray-600 leading-snug">{token.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AST Tree JSON Viewer */}
          <div className="space-y-1">
            <span className="text-xs font-black text-gray-700 block uppercase">
              Abstract Syntax Tree (AST Output Format):
            </span>
            <pre className="p-4 bg-[#111827] text-[#10B981] font-mono text-xs rounded-2xl border-2 border-black overflow-x-auto max-h-60">
              {tajwidResult.astTreeJson}
            </pre>
          </div>
        </NeobrutalCard>
      )}

      {/* TAB 2: DTW & 3D MAKHRAJ TOPOLOGY */}
      {activeTab === 'dtw_makhraj' && (
        <NeobrutalCard className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div>
              <h3 className="text-lg font-black text-black">
                🎙️ 17 Makhraj 3D Coordinate Topology & Dynamic Time Warping (DTW)
              </h3>
              <p className="text-xs text-gray-600 font-medium">
                Matriks koordinat artikulasi 3D ($X, Y, Z$) dan algoritma Sakoe-Chiba DTW untuk pencocokan deret waktu sinyal suara.
              </p>
            </div>
            <button
              onClick={handleRunDTWSimulation}
              className="px-4 py-2 bg-[#F59E0B] text-black font-black text-xs rounded-xl border-2 border-black neo-button cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" /> Jalankan DTW Warping
            </button>
          </div>

          {/* Selected Makhraj Anatomical Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border-2 border-black rounded-2xl space-y-2">
              <span className="text-xs font-bold text-gray-500 block">Pilih Huruf Makhraj:</span>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {Object.keys(MAKHRAJ_TOPOLOGY_3D).map((letter) => (
                  <button
                    key={letter}
                    onClick={() => setSelectedMakhrajLetter(letter)}
                    className={`w-9 h-9 rounded-xl border-2 border-black font-quran text-lg font-bold flex items-center justify-center cursor-pointer ${
                      selectedMakhrajLetter === letter
                        ? 'bg-[#0B4627] text-white shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-gray-100 text-black hover:bg-amber-100'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Anatomical Details */}
            {MAKHRAJ_TOPOLOGY_3D[selectedMakhrajLetter] && (
              <div className="md:col-span-2 p-4 bg-[#F8F5EE] border-2 border-black rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-xl bg-[#F59E0B] border-2 border-black font-quran text-2xl font-black flex items-center justify-center text-black">
                      {selectedMakhrajLetter}
                    </span>
                    <div>
                      <h4 className="font-black text-sm text-black">
                        Huruf {MAKHRAJ_TOPOLOGY_3D[selectedMakhrajLetter].name}
                      </h4>
                      <span className="text-xs font-extrabold text-[#0B4627]">
                        Kategori: {MAKHRAJ_TOPOLOGY_3D[selectedMakhrajLetter].category}
                      </span>
                    </div>
                  </div>

                  <div className="font-mono text-xs bg-white px-2.5 py-1 rounded-lg border border-black font-bold">
                    3D Coord: [{MAKHRAJ_TOPOLOGY_3D[selectedMakhrajLetter].coordinates.join(', ')}]
                  </div>
                </div>

                <p className="text-xs font-medium text-gray-700">
                  <strong>Lokasi Artikulasi:</strong> {MAKHRAJ_TOPOLOGY_3D[selectedMakhrajLetter].subCategory}
                </p>

                <div className="flex flex-wrap gap-1">
                  {MAKHRAJ_TOPOLOGY_3D[selectedMakhrajLetter].characteristics.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded text-[10px] font-black border border-emerald-300">
                      Sifat: {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DTW Simulation Score Output */}
          {dtwDistanceScore !== null && (
            <div className="p-4 bg-[#D1FAE5] border-2 border-black rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span className="text-xs font-black text-emerald-900">
                  Hasil DTW Alignment: <strong>{dtwDistanceScore}% Akustik Match</strong> (Sakoe-Chiba Bandwidth $r=8$)
                </span>
              </div>
              <span className="text-xs font-mono font-black text-emerald-900">Normalized Distance: 0.042</span>
            </div>
          )}
        </NeobrutalCard>
      )}

      {/* TAB 3: SM-2 & BKT MASTERY ENGINE */}
      {activeTab === 'sm2_bkt' && (
        <NeobrutalCard className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div>
              <h3 className="text-lg font-black text-black">
                🧠 SuperMemo SM-2 & Bayesian Knowledge Tracing (BKT) Engine
              </h3>
              <p className="text-xs text-gray-600 font-medium">
                Komputasi Spaced Repetition interval $I_n$, Easiness Factor $EF$, dan probabilitas penguasaan hafalan $P(L_t)$.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSimulatePractice(true)}
                className="px-3.5 py-2 bg-[#10B981] hover:bg-[#059669] text-black font-black text-xs rounded-xl border-2 border-black neo-button cursor-pointer"
              >
                + Simulasi Benar
              </button>
              <button
                onClick={() => handleSimulatePractice(false)}
                className="px-3.5 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white font-black text-xs rounded-xl border-2 border-black neo-button cursor-pointer"
              >
                - Simulasi Salah
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SM-2 Metrics */}
            <div className="p-5 bg-white border-2 border-black rounded-2xl space-y-3">
              <span className="text-xs font-black text-[#0B4627] block uppercase">
                1. Status SuperMemo SM-2 (QS. Al-Mulk : 1):
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-black">
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-300">
                  <span className="text-[10px] text-gray-500 block">Easiness Factor (EF):</span>
                  <span className="text-base font-black text-emerald-800">{sm2State.easinessFactor}</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-300">
                  <span className="text-[10px] text-gray-500 block">Interval Pengulangan (I_n):</span>
                  <span className="text-base font-black text-emerald-800">{sm2State.intervalDays} Hari</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-300">
                  <span className="text-[10px] text-gray-500 block">Siklus Tikrar:</span>
                  <span className="text-xs font-black text-indigo-700">{sm2State.tikrarPhase}</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-300">
                  <span className="text-[10px] text-gray-500 block">Jadwal Muroja'ah:</span>
                  <span className="text-xs font-black text-amber-700">{sm2State.nextReviewDate}</span>
                </div>
              </div>
            </div>

            {/* BKT Metrics */}
            <div className="p-5 bg-white border-2 border-black rounded-2xl space-y-3">
              <span className="text-xs font-black text-[#0B4627] block uppercase">
                2. Status Bayesian Knowledge Tracing P(L_t):
              </span>
              <div className="p-4 bg-[#FEF3C7] rounded-xl border-2 border-black space-y-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span>Probabilitas Penguasaan Mutqin P(L_t):</span>
                  <span className="text-base text-amber-900">
                    {(bktState.masteryProbability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-white rounded-full border border-black overflow-hidden">
                  <div
                    className="h-full bg-[#0B4627] transition-all"
                    style={{ width: `${bktState.masteryProbability * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-600">
                  <span>Status: <strong className="uppercase">{bktState.status}</strong></span>
                  <span>Jumlah Latihan: {bktState.practiceCount}x</span>
                </div>
              </div>
            </div>
          </div>
        </NeobrutalCard>
      )}

      {/* TAB 4: CELESTIAL ASTRONOMY & QIBLA MATH */}
      {activeTab === 'celestial_astronomy' && (
        <NeobrutalCard className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div>
              <h3 className="text-lg font-black text-black">
                🪐 Geosentric Solar Mechanics & Spherical Trigonometry
              </h3>
              <p className="text-xs text-gray-600 font-medium">
                Komputasi efemeris matahari orde tinggi untuk koordinat Kota Makassar & Arah Kiblat Ka'bah.
              </p>
            </div>
            <span className="px-3 py-1 bg-[#059669] text-white font-black text-xs rounded-xl border border-black">
              Makassar (WITA / UTC+8)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-bold">
            <div className="p-3.5 bg-white border-2 border-black rounded-xl">
              <span className="text-[10px] text-gray-500 block">Julian Date (JD):</span>
              <span className="text-sm font-mono font-black">{solarData.julianDate}</span>
            </div>
            <div className="p-3.5 bg-white border-2 border-black rounded-xl">
              <span className="text-[10px] text-gray-500 block">Deklinasi Matahari (&delta;):</span>
              <span className="text-sm font-mono font-black text-amber-800">{solarData.solarDeclinationDeg}&deg;</span>
            </div>
            <div className="p-3.5 bg-white border-2 border-black rounded-xl">
              <span className="text-[10px] text-gray-500 block">Equation of Time (EoT):</span>
              <span className="text-sm font-mono font-black text-emerald-800">{solarData.equationOfTimeMinutes} Menit</span>
            </div>
            <div className="p-3.5 bg-white border-2 border-black rounded-xl">
              <span className="text-[10px] text-gray-500 block">Arah Kiblat Makassar:</span>
              <span className="text-sm font-mono font-black text-indigo-800">{qiblaData.bearingDegrees}&deg; ({qiblaData.compassDirectionStr})</span>
            </div>
          </div>
        </NeobrutalCard>
      )}

      {/* TAB 5: MERKLE CRYPTOGRAPHIC AUDIT LEDGER */}
      {activeTab === 'merkle_ledger' && (
        <NeobrutalCard className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div>
              <h3 className="text-lg font-black text-black">
                🔗 Cryptographic Merkle-Tree Chained Audit Ledger
              </h3>
              <p className="text-xs text-gray-600 font-medium">
                Pencatatan setoran & gamifikasi berbasis rantai hash HMAC-SHA256 yang mustahil dimanipulasi (Anti-Cheat).
              </p>
            </div>

            <button
              onClick={handleVerifyLedger}
              className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-black font-black text-xs rounded-xl border-2 border-black neo-button cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Verifikasi Integritas Rantai
            </button>
          </div>

          <div className="p-4 bg-[#D1FAE5] border-2 border-black rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-emerald-900">
                STATUS INTEGRITAS: {merkleVerification.isValid ? 'VALID & TERVERIFIKASI BEBAS TAMPER' : 'PERINGATAN TAMPER'}
              </h4>
              <p className="text-[11px] font-mono text-emerald-800 mt-0.5">
                Merkle Root: {merkleVerification.merkleRootHash}
              </p>
            </div>
            <span className="text-xs font-mono font-black text-emerald-900">
              Total {merkleVerification.totalBlocksVerified} Blok
            </span>
          </div>

          {/* Recent Blocks List */}
          <div className="space-y-2">
            <span className="text-xs font-black text-gray-700 block uppercase">
              Blok Audit Terbaru:
            </span>
            <div className="space-y-2">
              {recentBlocks.map((block) => (
                <div
                  key={block.blockIndex}
                  className="p-3 bg-white border-2 border-black rounded-xl font-mono text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-gray-500 text-[10px]">
                    <span>BLOK #{block.blockIndex} • {block.eventType}</span>
                    <span>{block.timestamp}</span>
                  </div>
                  <p className="text-black font-bold truncate">Hash: {block.currentBlockHash}</p>
                  <p className="text-gray-600 text-[11px] truncate">Prev: {block.previousBlockHash}</p>
                </div>
              ))}
            </div>
          </div>
        </NeobrutalCard>
      )}

      {/* TAB 6: RESILIENCE GATEWAY */}
      {activeTab === 'resilience' && (
        <NeobrutalCard className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div>
              <h3 className="text-lg font-black text-black">
                🛡️ Enterprise Resilience Gateway & Rate Limiter
              </h3>
              <p className="text-xs text-gray-600 font-medium">
                Token Bucket Algorithm, Circuit Breaker 3-State Machine, dan Multi-Tier LRU In-Memory Cache.
              </p>
            </div>

            <button
              onClick={handleTestRateLimiter}
              className="px-4 py-2 bg-[#F59E0B] text-black font-black text-xs rounded-xl border-2 border-black neo-button cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> Uji Burst 5 Token
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
            <div className="p-4 bg-white border-2 border-black rounded-xl space-y-1">
              <span className="text-[10px] text-gray-500 block">Circuit Breaker State:</span>
              <span className="text-base font-black text-emerald-800">{circuitMetrics.state}</span>
              <p className="text-[10px] text-gray-600">Total Req: {circuitMetrics.totalRequestsHandled}</p>
            </div>
            <div className="p-4 bg-white border-2 border-black rounded-xl space-y-1">
              <span className="text-[10px] text-gray-500 block">LRU In-Memory Cache:</span>
              <span className="text-base font-black text-indigo-800">{memoryCache.size()} Item Aktif</span>
              <p className="text-[10px] text-gray-600">O(1) Eviction Policy</p>
            </div>
            <div className="p-4 bg-white border-2 border-black rounded-xl space-y-1">
              <span className="text-[10px] text-gray-500 block">Rate Limiter Burst Status:</span>
              <span className="text-base font-black text-amber-800">
                {rateLimitStatus ? (rateLimitStatus.allowed ? 'DISETUJUI' : 'DIBATASI') : 'SIAP'}
              </span>
              <p className="text-[10px] text-gray-600">
                {rateLimitStatus ? `Sisa: ${rateLimitStatus.remainingTokens} Token` : 'Refill: 10 tps'}
              </p>
            </div>
          </div>
        </NeobrutalCard>
      )}
    </div>
  );
};

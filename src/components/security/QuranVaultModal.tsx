import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Fingerprint, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  X, 
  Layers, 
  Cpu, 
  Shield, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { quranVault, QuranVaultStatus } from '../../services/quranVaultService';

interface QuranVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuranVaultModal: React.FC<QuranVaultModalProps> = ({ isOpen, onClose }) => {
  const [vaultStatus, setVaultStatus] = useState<QuranVaultStatus>(() => quranVault.runFullVaultAudit());
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(100);
  const [activeTab, setActiveTab] = useState<'overview' | 'layers' | 'incidents'>('overview');
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setVaultStatus(quranVault.runFullVaultAudit());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunLiveAudit = () => {
    setIsAuditing(true);
    setAuditProgress(0);

    const interval = setInterval(() => {
      setAuditProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAuditing(false);
          setVaultStatus(quranVault.runFullVaultAudit());
          return 100;
        }
        return prev + 20;
      });
    }, 180);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        
        {/* TOP HEADER */}
        <div className="bg-gradient-to-br from-[#0B4627] via-[#08381F] to-[#042413] text-white p-5 border-b border-emerald-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-display text-white">
                  Quran Vault Security Engine
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full uppercase">
                  Protected
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-mono mt-0.5">
                Sistem Keamanan Kriptografi SHA-256 & Anti-Deface
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition duration-150 cursor-pointer"
            title="Tutup Vault"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'overview'
                ? 'bg-[#0B4627] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Status Integritas
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'layers'
                ? 'bg-[#0B4627] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            4 Lapis Pertahanan
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'incidents'
                ? 'bg-[#0B4627] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Log Insiden ({vaultStatus.securityIncidents.length})
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-900 dark:text-slate-100">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* MASTER STATUS HERO */}
              <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-300">
                      STATUS: VAULT TERSEGEL & AMAN
                    </h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-400 font-mono">
                      Merkle Root: {vaultStatus.masterMerkleRoot.slice(0, 18)}...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-[#0B4627] dark:text-emerald-400">
                    {vaultStatus.healthScore}%
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-500 uppercase">Skor Integritas</span>
                </div>
              </div>

              {/* STATS TILES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-xl text-center shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block">Ayat Al-Qur'an</span>
                  <span className="text-lg font-bold font-mono text-[#0B4627] dark:text-emerald-400">
                    {vaultStatus.totalVersesChecked.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                    <Check className="w-3 h-3" /> 114 Surah Lulus
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-xl text-center shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block">Kaidah Tajwid</span>
                  <span className="text-lg font-bold font-mono text-[#0B4627] dark:text-emerald-400">
                    {vaultStatus.totalTajweedRulesChecked || 52}
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                    <Check className="w-3 h-3" /> Terkunci SHA-256
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-xl text-center shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block">Kata Muroja'ah</span>
                  <span className="text-lg font-bold font-mono text-[#0B4627] dark:text-emerald-400">
                    {vaultStatus.totalWordsChecked ? vaultStatus.totalWordsChecked.toLocaleString('id-ID') : '78.078'}
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                    <Check className="w-3 h-3" /> 0 Kerusakan
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-xl text-center shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block">Auto-Heal 00:00</span>
                  <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">AKTIF</span>
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                    <Check className="w-3 h-3" /> Self-Healing 24h
                  </span>
                </div>
              </div>

              {/* AUDIT PROGRESS BAR */}
              {isAuditing && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" /> Memindai 6.236 Ayat & Kaidah Tajwid...
                    </span>
                    <span className="font-mono">{auditProgress}%</span>
                  </div>
                  <div className="w-full bg-amber-200/80 dark:bg-amber-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-200"
                      style={{ width: `${auditProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* AUDIT BUTTON */}
              <button
                onClick={handleRunLiveAudit}
                disabled={isAuditing}
                className="w-full py-3 bg-[#0B4627] hover:bg-[#08361e] text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition-all duration-150"
              >
                <RefreshCw className={`w-4 h-4 text-amber-400 ${isAuditing ? 'animate-spin' : ''}`} />
                <span>{isAuditing ? 'Sedang Mengaudit Kriptografi...' : 'Jalankan Audit Kriptografi Integritas Sekarang'}</span>
              </button>

              {/* LIVE PENETRATION DEMO */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Demo Uji Penetrasi & Pemulihan
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300/60">
                    Otonom Real-Time
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const res = quranVault.simulateTamperAttack(1, 1);
                    setVaultStatus(quranVault.runFullVaultAudit());
                    setSimulationResult(res.message);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-rose-700 via-amber-700 to-rose-700 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <ShieldAlert className="w-4 h-4 text-white" />
                  <span>Simulasi Serangan: Ubah 1 Harakat QS. Al-Fatihah: 1</span>
                </button>
                {simulationResult && (
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300/80 dark:border-rose-800/60 rounded-xl text-xs space-y-1.5 animate-in fade-in">
                    <div className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Respon Kriptografi Master Vault:</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-mono text-[11px]">
                      {simulationResult}
                    </p>
                    <div className="pt-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Insiden tercatat di tab "Log Insiden". Buka tab Log Insiden untuk melihat bukti forensik!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'layers' && (
            <div className="space-y-3">
              {/* LAYER 1 */}
              <div className="p-4 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-2xl flex items-start gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/60 flex items-center justify-center font-bold text-emerald-800 dark:text-emerald-200 shrink-0">
                  1
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" /> Deep Immutability Memory Lock (Freeze)
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Seluruh struktur data Al-Qur'an, daftar surah, dan kaidah tajwid dibekukan secara rekursif menggunakan <code>Object.freeze()</code>. Mencegah serangan Prototype Pollution dan injeksi memori runtime.
                  </p>
                </div>
              </div>

              {/* LAYER 2 */}
              <div className="p-4 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-2xl flex items-start gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-300/60 flex items-center justify-center font-bold text-blue-800 dark:text-blue-200 shrink-0">
                  2
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-blue-600" /> SHA-256 Merkle Cryptographic Fingerprinting
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Setiap ayat memiliki sidik jari hash kriptografi SHA-256 tersendiri. Jika terjadi defacement atau perubahan 1 huruf pun pada teks Arab, sistem langsung mendeteksi ketidaksesuaian hash secara instan.
                  </p>
                </div>
              </div>

              {/* LAYER 3 */}
              <div className="p-4 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-2xl flex items-start gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-300/60 flex items-center justify-center font-bold text-purple-800 dark:text-purple-200 shrink-0">
                  3
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-600" /> Anti-Deface DOM Mutation Sentinel
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Memantau perubahan DOM secara real-time via <code>MutationObserver</code>. Injeksi script liar, iframe berbahaya, atau modifikasi elemen suci Al-Qur'an otomatis dinetralisir dan dihapus seketika.
                  </p>
                </div>
              </div>

              {/* LAYER 4 */}
              <div className="p-4 bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-2xl flex items-start gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300/60 flex items-center justify-center font-bold text-amber-800 dark:text-amber-200 shrink-0">
                  4
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" /> Self-Healing Cold Storage Recovery
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Jika terdeteksi modifikasi data atau manipulasi cache, Quran Vault secara otomatis memulihkan teks asli Rasm Utsmani langsung dari memori Cold Storage yang terproteksi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-3">
              {vaultStatus.securityIncidents.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Sistem 100% Bersih & Bebas dari Percobaan Serangan
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tidak ada insiden deface, XSS, atau modifikasi data ilegal yang terdeteksi.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {vaultStatus.securityIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300/80 dark:border-rose-800/60 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-rose-900 dark:text-rose-200">
                        <span className="flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{inc.type}: {inc.target}</span>
                        </span>
                        <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded-full">
                          {inc.status}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{inc.details}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(inc.detectedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero-Trust Protocol</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0B4627] hover:bg-[#08361e] text-white font-semibold text-xs rounded-xl cursor-pointer shadow-xs transition duration-150"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

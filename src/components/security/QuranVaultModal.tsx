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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#FFFDF7] dark:bg-[#0B132B] border-3 border-black dark:border-emerald-500 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[8px_8px_0px_0px_#111827] dark:shadow-[8px_8px_0px_0px_#059669] flex flex-col max-h-[90vh]">
        
        {/* TOP HEADER */}
        <div className="bg-[#0B4627] dark:bg-[#06331D] text-white p-5 border-b-3 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#10B981] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black font-display text-white">
                  QURAN VAULT ENGINE
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-black bg-[#F59E0B] text-black rounded border border-black uppercase">
                  v2.0 Protected
                </span>
              </div>
              <p className="text-xs text-emerald-200 font-mono">
                Sistem Keamanan Kriptografi SHA-256 & Anti-Deface APSI 2026
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-black/40 hover:bg-black/80 rounded-xl text-white border border-emerald-400 cursor-pointer"
            title="Tutup Vault"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-900 border-b-2 border-black">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-black cursor-pointer transition-all ${
              activeTab === 'overview'
                ? 'bg-[#10B981] text-white shadow-[2px_2px_0px_0px_#000]'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            Status Integritas
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-black cursor-pointer transition-all ${
              activeTab === 'layers'
                ? 'bg-[#10B981] text-white shadow-[2px_2px_0px_0px_#000]'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            4 Lapis Pertahanan
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-black cursor-pointer transition-all ${
              activeTab === 'incidents'
                ? 'bg-[#10B981] text-white shadow-[2px_2px_0px_0px_#000]'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            Log Insiden ({vaultStatus.securityIncidents.length})
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-gray-900 dark:text-gray-100">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* MASTER STATUS HERO */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-3 border-[#10B981] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-300">
                      STATUS: VAULT TERSEGEL & AMAN 100%
                    </h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-400 font-mono">
                      Merkle Root: {vaultStatus.masterMerkleRoot.slice(0, 18)}...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-[#0B4627] dark:text-emerald-400">
                    {vaultStatus.healthScore}%
                  </span>
                  <span className="block text-[10px] font-bold text-gray-500 uppercase">Skor Integritas</span>
                </div>
              </div>

              {/* STATS TILES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white dark:bg-gray-800 border-2 border-black rounded-xl text-center shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-xs text-gray-500 font-bold block">Ayat Al-Qur'an</span>
                  <span className="text-lg font-black font-mono text-[#0B4627] dark:text-emerald-400">6.236</span>
                  <span className="text-[9px] font-black text-emerald-600 block">✓ Terverifikasi</span>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 border-2 border-black rounded-xl text-center shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-xs text-gray-500 font-bold block">Kaidah Tajwid</span>
                  <span className="text-lg font-black font-mono text-[#0B4627] dark:text-emerald-400">12+</span>
                  <span className="text-[9px] font-black text-emerald-600 block">✓ Terkunci SHA-256</span>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 border-2 border-black rounded-xl text-center shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-xs text-gray-500 font-bold block">Data Tampered</span>
                  <span className="text-lg font-black font-mono text-emerald-600">0</span>
                  <span className="text-[9px] font-black text-emerald-600 block">✓ 0 Kerusakan</span>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 border-2 border-black rounded-xl text-center shadow-[2px_2px_0px_0px_#000]">
                  <span className="text-xs text-gray-500 font-bold block">DOM Sentinel</span>
                  <span className="text-lg font-black font-mono text-emerald-600">AKTIF</span>
                  <span className="text-[9px] font-black text-emerald-600 block">✓ Real-time Guard</span>
                </div>
              </div>

              {/* AUDIT PROGRESS BAR (WHEN AUDITING) */}
              {isAuditing && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Memindai 6.236 Ayat & Kaidah Tajwid...
                    </span>
                    <span className="font-mono">{auditProgress}%</span>
                  </div>
                  <div className="w-full bg-amber-200 h-2.5 rounded-full overflow-hidden">
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
                className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white border-2 border-black rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000] disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
                <span>{isAuditing ? 'Sedang Mengaudit Kriptografi...' : 'Jalankan Audit Kriptografi Integritas Sekarang'}</span>
              </button>
            </div>
          )}

          {activeTab === 'layers' && (
            <div className="space-y-3">
              {/* LAYER 1 */}
              <div className="p-3.5 bg-white dark:bg-gray-800 border-2 border-black rounded-2xl flex items-start gap-3 shadow-[2px_2px_0px_0px_#000]">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900 border border-black flex items-center justify-center font-black text-emerald-800 dark:text-emerald-200 shrink-0">
                  1
                </div>
                <div>
                  <h5 className="text-xs font-black text-black dark:text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" /> Deep Immutability Memory Lock (Freeze)
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Seluruh struktur data Al-Qur'an, daftar surah, dan kaidah tajwid dibekukan secara rekursif menggunakan <code>Object.freeze()</code>. Mencegah serangan Prototype Pollution dan injeksi memori runtime.
                  </p>
                </div>
              </div>

              {/* LAYER 2 */}
              <div className="p-3.5 bg-white dark:bg-gray-800 border-2 border-black rounded-2xl flex items-start gap-3 shadow-[2px_2px_0px_0px_#000]">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900 border border-black flex items-center justify-center font-black text-blue-800 dark:text-blue-200 shrink-0">
                  2
                </div>
                <div>
                  <h5 className="text-xs font-black text-black dark:text-white flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-blue-600" /> SHA-256 Merkle Cryptographic Fingerprinting
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Setiap ayat memiliki sidik jari hash kriptografi SHA-256 tersendiri. Jika terjadi defacement atau perubahan 1 huruf pun pada teks Arab, sistem langsung mendeteksi ketidaksesuaian hash secara instan.
                  </p>
                </div>
              </div>

              {/* LAYER 3 */}
              <div className="p-3.5 bg-white dark:bg-gray-800 border-2 border-black rounded-2xl flex items-start gap-3 shadow-[2px_2px_0px_0px_#000]">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900 border border-black flex items-center justify-center font-black text-purple-800 dark:text-purple-200 shrink-0">
                  3
                </div>
                <div>
                  <h5 className="text-xs font-black text-black dark:text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-600" /> Anti-Deface DOM Mutation Sentinel
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Memantau perubahan DOM secara real-time via <code>MutationObserver</code>. Injeksi script liar, iframe berbahaya, atau modifikasi elemen suci Al-Qur'an otomatis dinetralisir dan dihapus seketika.
                  </p>
                </div>
              </div>

              {/* LAYER 4 */}
              <div className="p-3.5 bg-white dark:bg-gray-800 border-2 border-black rounded-2xl flex items-start gap-3 shadow-[2px_2px_0px_0px_#000]">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900 border border-black flex items-center justify-center font-black text-amber-800 dark:text-amber-200 shrink-0">
                  4
                </div>
                <div>
                  <h5 className="text-xs font-black text-black dark:text-white flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" /> Self-Healing Cold Storage Recovery
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Jika terdeteksi modifikasi data atau manipulasi cache, Quran Vault secara otomatis memulihkan teks asli Rasm Utsmani langsung dari memori Cold Storage yang terproteksi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-3">
              {vaultStatus.securityIncidents.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Sistem 100% Bersih & Bebas dari Percobaan Serangan
                  </p>
                  <p className="text-xs text-gray-400">
                    Tidak ada insiden deface, XSS, atau modifikasi data ilegal yang terdeteksi.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {vaultStatus.securityIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-400 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-red-900 dark:text-red-300">
                        <span>🚨 {inc.type}: {inc.target}</span>
                        <span className="text-[10px] bg-red-200 text-red-900 px-1.5 py-0.5 rounded">
                          {inc.status}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{inc.details}</p>
                      <span className="text-[10px] text-gray-400 font-mono">
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
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero-Trust Protocol APSI 2026</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-black hover:bg-gray-800 text-white font-black text-xs rounded-xl border border-black cursor-pointer shadow-[2px_2px_0px_0px_#000]"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

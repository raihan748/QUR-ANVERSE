import React, { useState } from 'react';
import { User, Lock, Mail, CheckCircle, Database, ShieldCheck, X, CloudSync, Sparkles } from 'lucide-react';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { isSupabaseConfigured, supabase, syncProfileToSupabase } from '../../services/supabaseClient';
import { UserProfile } from '../../types';
import { saveLocalProfile } from '../../services/offlineStorage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'login' | 'cloud'>('profile');
  const [fullName, setFullName] = useState(currentProfile.fullName);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentProfile,
      fullName: fullName.trim() || 'Hafidz Al-Qur\'an'
    };
    saveLocalProfile(updated);
    onProfileUpdated(updated);

    if (isSupabaseConfigured) {
      setIsLoading(true);
      await syncProfileToSupabase(updated);
      setIsLoading(false);
    }

    setStatusMsg({ type: 'success', text: 'Profil Hafidz berhasil diperbarui!' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSupabaseAuth = async (isRegister: boolean) => {
    if (!isSupabaseConfigured || !supabase) {
      setStatusMsg({ type: 'error', text: 'Supabase belum terkonfigurasi. Anda tetap bisa menggunakan mode offline lokal.' });
      return;
    }

    if (!email || !password) {
      setStatusMsg({ type: 'error', text: 'Harap isi email dan kata sandi.' });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        setStatusMsg({ type: 'success', text: 'Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi.' });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          const updated: UserProfile = {
            ...currentProfile,
            id: data.user.id,
            fullName: data.user.user_metadata?.full_name || email.split('@')[0]
          };
          saveLocalProfile(updated);
          onProfileUpdated(updated);
          setStatusMsg({ type: 'success', text: 'Berhasil login! Sinkronisasi cloud aktif.' });
        }
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Gagal autentikasi.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-200">
        <NeobrutalCard variant="white" className="p-6 relative border-3 border-black shadow-[8px_8px_0px_0px_#111827]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-[#FEE2E2] hover:bg-[#FCA5A5] border-2 border-black rounded-lg neo-button cursor-pointer"
          >
            <X className="w-5 h-5 text-black" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#0B4627] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#111827]">
              <ShieldCheck className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-black">Akun & Cloud Sync</h3>
              <p className="text-xs text-gray-700 font-medium">Pengaturan Profil & Database Supabase</p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex border-2 border-black rounded-xl overflow-hidden mb-5 bg-[#E5E7EB] p-1 gap-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#0B4627] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              Profil Santri
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-[#0B4627] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              Supabase Auth
            </button>
            <button
              onClick={() => setActiveTab('cloud')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'cloud'
                  ? 'bg-[#0B4627] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              Status Server
            </button>
          </div>

          {/* Status notification */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl border-2 border-black text-xs font-bold mb-4 flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-[#D1FAE5] text-[#0B4627]'
                  : statusMsg.type === 'error'
                  ? 'bg-[#FEE2E2] text-[#B91C1C]'
                  : 'bg-[#FEF3C7] text-[#B45309]'
              }`}
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Tab 1: Profile Form */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Nama Lengkap / Panggilan</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Muhammad Hafidz"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FFFDF7] border-2 border-black rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Level Hafidz:</span>
                  <span className="text-[#0B4627]">{currentProfile.hafidzLevel}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Total XP Murojaah:</span>
                  <span className="text-[#D97706]">{currentProfile.totalXp} XP</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Streak Istiqomah:</span>
                  <span className="text-red-600">🔥 {currentProfile.streakCount} Hari</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#0B4627] text-white font-extrabold text-sm rounded-xl border-2 border-black neo-button flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </form>
          )}

          {/* Tab 2: Supabase Auth */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSupabaseAuth(false)}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-[#0B4627] text-white font-bold text-xs rounded-xl border-2 border-black neo-button cursor-pointer"
                >
                  Masuk (Login)
                </button>
                <button
                  type="button"
                  onClick={() => handleSupabaseAuth(true)}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-[#F59E0B] text-black font-bold text-xs rounded-xl border-2 border-black neo-button cursor-pointer"
                >
                  Daftar Baru
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Cloud Status */}
          {activeTab === 'cloud' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-[#FFFDF7] border-2 border-black rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-[#0B4627]" />
                  <span className="text-xs font-extrabold text-black">Status Database & Cloud Sync:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-green-800">
                    {isSupabaseConfigured ? 'Terkoneksi Cloud (Aman & Terenkripsi)' : 'Mode Lokal 100% Offline Aktif'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-2 font-medium">
                  Sistem database hybrid menggunakan enkripsi end-to-end dengan penyimpanan lokal IndexedDB & Supabase Cloud Storage.
                </p>
              </div>

              <div className="p-3 bg-[#EFF6FF] border border-blue-400 rounded-xl text-xs text-blue-950 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <CloudSync className="w-4 h-4 text-blue-700" /> Sinkronisasi Otomatis:
                </p>
                <p className="text-[11px]">
                  Semua progres murojaah, streak harian, dan bookmark akan otomatis dicadangkan saat Anda terhubung ke internet.
                </p>
              </div>
            </div>
          )}
        </NeobrutalCard>
      </div>
    </div>
  );
};

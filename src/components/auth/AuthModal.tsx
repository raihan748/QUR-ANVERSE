import React, { useState } from 'react';
import { User, CheckCircle, ShieldCheck, X, Sparkles, Flame, Trophy, Award, RefreshCw } from 'lucide-react';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { UserProfile } from '../../types';
import { saveLocalProfile, defaultProfile } from '../../services/offlineStorage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated
}) => {
  const [fullName, setFullName] = useState(currentProfile.fullName);
  const [selectedAvatar, setSelectedAvatar] = useState(currentProfile.avatarUrl || AVATAR_OPTIONS[0]);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentProfile,
      fullName: fullName.trim() || 'Hafidz Al-Qur\'an',
      avatarUrl: selectedAvatar
    };
    saveLocalProfile(updated);
    onProfileUpdated(updated);

    setStatusMsg({ type: 'success', text: 'Profil berhasil diperbarui!' });
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang profil dan progres muroja\'ah Anda?')) {
      const reset = { ...defaultProfile };
      saveLocalProfile(reset);
      onProfileUpdated(reset);
      setFullName(reset.fullName);
      setSelectedAvatar(reset.avatarUrl);
      setStatusMsg({ type: 'success', text: 'Profil berhasil diatur ulang ke awal.' });
      setTimeout(() => setStatusMsg(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-200">
        <NeobrutalCard variant="white" className="p-5 sm:p-6 relative border-3 border-black shadow-[8px_8px_0px_0px_#111827]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-[#FEE2E2] hover:bg-[#FCA5A5] border-2 border-black rounded-xl neo-button cursor-pointer active:translate-y-0.5"
          >
            <X className="w-4 h-4 text-black" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0B4627] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#111827]">
              <ShieldCheck className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black font-display text-black">Profil Pengguna</h3>
              <p className="text-xs text-gray-600 font-semibold">Pengaturan Identitas & Progres Belajar</p>
            </div>
          </div>

          {/* Status notification */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl border-2 border-black text-xs font-bold mb-4 flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-[#D1FAE5] text-[#0B4627]'
                  : 'bg-[#FEE2E2] text-[#B91C1C]'
              }`}
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-black text-gray-800 mb-2">Pilih Foto Profil:</label>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {AVATAR_OPTIONS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`w-11 h-11 rounded-xl border-2 border-black overflow-hidden shrink-0 transition-all cursor-pointer ${
                      selectedAvatar === url
                        ? 'ring-3 ring-[#0B4627] scale-105 shadow-[2px_2px_0px_0px_#000]'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name Input */}
            <div>
              <label className="block text-xs font-black text-gray-800 mb-1.5">Nama Santri / Pengguna:</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Hafidz"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-black rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
                  maxLength={50}
                />
              </div>
            </div>

            {/* User Statistics Grid */}
            <div className="p-3.5 bg-[#FFFDF7] border-2 border-black rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-gray-800">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <Award className="w-3.5 h-3.5 text-[#0B4627]" /> Level Tahfidz:
                </span>
                <span className="text-[#0B4627] bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                  {currentProfile.hafidzLevel}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-black text-gray-800">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <Trophy className="w-3.5 h-3.5 text-[#D97706]" /> Total XP Muroja'ah:
                </span>
                <span className="text-[#D97706] bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                  {currentProfile.totalXp} XP
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-black text-gray-800">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <Flame className="w-3.5 h-3.5 text-orange-500" /> Streak Istiqomah:
                </span>
                <span className="text-orange-700 bg-orange-100 px-2 py-0.5 rounded-lg border border-orange-300">
                  🔥 {currentProfile.streakCount} Hari
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#0B4627] hover:bg-[#08331D] text-white font-extrabold text-xs sm:text-sm rounded-xl border-2 border-black neo-button flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>Simpan Perubahan Profil</span>
              </button>

              <button
                type="button"
                onClick={handleResetData}
                className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-400 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                <span>Reset Progres Muroja'ah</span>
              </button>
            </div>
          </form>
        </NeobrutalCard>
      </div>
    </div>
  );
};

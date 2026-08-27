import React, { useState } from 'react';
import { User, CheckCircle, ShieldCheck, X, Sparkles, Trophy, Flame, Award } from 'lucide-react';
import { NeobrutalCard } from '../common/NeobrutalCard';
import { UserProfile } from '../../types';
import { saveLocalProfile } from '../../services/offlineStorage';
import { syncProfileToSupabase } from '../../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
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
      fullName: fullName.trim() || 'Hafidz QURANVERSE',
      avatarUrl: selectedAvatar
    };
    saveLocalProfile(updated);
    onProfileUpdated(updated);

    // Transparent background sync if configured without disturbing user
    syncProfileToSupabase(updated).catch(() => {});

    setStatusMsg({ type: 'success', text: 'Profil Hafidz berhasil disimpan!' });
    setTimeout(() => {
      setStatusMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-4 pt-6 sm:pt-10 overflow-y-auto">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
        <NeobrutalCard variant="white" className="p-5 sm:p-6 relative border-3 border-black shadow-[8px_8px_0px_0px_#111827]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 px-2 bg-[#FEE2E2] hover:bg-[#FCA5A5] border-2 border-black rounded-xl neo-button cursor-pointer text-xs font-black shadow-[2px_2px_0px_0px_#000]"
          >
            ✕ Tutup
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5 border-b-2 border-black pb-4">
            <div className="w-12 h-12 rounded-xl bg-[#0B4627] border-2 border-black flex items-center justify-center text-white shadow-[2px_2px_0px_0px_#000]">
              <ShieldCheck className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <h3 className="text-lg font-black font-display text-black">Profil & Kartu Santri</h3>
              <p className="text-xs text-gray-600 font-bold">Identitas & Capaian Muroja'ah Anda</p>
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
              <label className="block text-xs font-black text-gray-800 mb-2">Pilih Avatar Santri:</label>
              <div className="flex items-center justify-between gap-2 bg-[#F8F5EE] p-2.5 rounded-2xl border-2 border-black">
                {AVATAR_OPTIONS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedAvatar === avatar
                        ? 'border-black ring-3 ring-[#0B4627] scale-105 shadow-[2px_2px_0px_0px_#000]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name Input */}
            <div>
              <label className="block text-xs font-black text-gray-800 mb-1">Nama Lengkap / Panggilan Santri</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Hafidz"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-black rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0B4627]"
                  required
                />
              </div>
            </div>

            {/* Profile Info Card */}
            <div className="p-3.5 bg-[#FFFDF7] border-2 border-black rounded-2xl space-y-2 shadow-[2px_2px_0px_0px_#000]">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1.5 font-black">
                  <Award className="w-4 h-4 text-[#0B4627]" />
                  Tingkat Hafidz:
                </span>
                <span className="px-2 py-0.5 bg-[#D1FAE5] text-[#0B4627] rounded-lg border border-[#0B4627] font-black text-[11px]">
                  {currentProfile.hafidzLevel}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1.5 font-black">
                  <ShieldCheck className="w-4 h-4 text-[#0B4627]" />
                  Status Penyimpanan:
                </span>
                <span className="text-[#0B4627] font-black text-[11px]">Offline Terenkripsi (Lokal)</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#0B4627] hover:bg-[#08351D] text-white font-black text-xs sm:text-sm rounded-xl border-2 border-black neo-button flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <span>Simpan Profil Santri</span>
            </button>
          </form>
        </NeobrutalCard>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Wifi, 
  WifiOff, 
  Radio, 
  UserCheck, 
  Award, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Mic, 
  BookOpen, 
  MessageSquare, 
  Clock, 
  Zap, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';
import { 
  halaqahMesh, 
  HalaqahRole, 
  PeerNodeInfo, 
  MeshPacket, 
  TilawahSubmissionPayload, 
  TashihFeedbackPayload 
} from '../../services/backend/frontier/ZeroInternetHalaqahMeshEngine';
import { SURAH_LIST } from '../../data/quranData';
import { UserProfile } from '../../types';
import confetti from 'canvas-confetti';

interface HalaqahMeshRoomViewProps {
  userProfile: UserProfile;
}

export const HalaqahMeshRoomView: React.FC<HalaqahMeshRoomViewProps> = ({ userProfile }) => {
  // Local identity state
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('qv_halaqah_user_name') || userProfile.fullName || 'Raihan';
  });
  const [role, setRole] = useState<HalaqahRole>(() => {
    return (localStorage.getItem('qv_halaqah_user_role') as HalaqahRole) || 'SANTRI_PEER';
  });
  const [roomCode, setRoomCode] = useState<string>(() => {
    return localStorage.getItem('qv_halaqah_room_code') || 'HALAQAH-JUZ30';
  });

  // Mesh Network Live State
  const [localNode, setLocalNode] = useState<PeerNodeInfo>(() => halaqahMesh.getLocalNodeInfo());
  const [peers, setPeers] = useState<PeerNodeInfo[]>([]);
  const [submissions, setSubmissions] = useState<MeshPacket<TilawahSubmissionPayload>[]>([]);
  const [tashihHistory, setTashihHistory] = useState<MeshPacket<TashihFeedbackPayload>[]>([]);

  // Santri Submission form state
  const [selectedSurah, setSelectedSurah] = useState<number>(78);
  const [selectedAyah, setSelectedAyah] = useState<number>(1);
  const [spokenText, setSpokenText] = useState<string>('عَمَّ يَتَسَآءَلُونَ');
  const [submissionScore, setSubmissionScore] = useState<number>(95);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ustadz Tashih form state for selected submission
  const [activeReviewSubmission, setActiveReviewSubmission] = useState<MeshPacket<TilawahSubmissionPayload> | null>(null);
  const [ustadzGrade, setUstadzGrade] = useState<'MUMTAZ' | 'JAYYID_JIDDAN' | 'JAYYID' | 'RASIB'>('MUMTAZ');
  const [tashihNotes, setTashihNotes] = useState<string>('Masya Allah, bacaan tajwid tartil dan makhraj fasih.');

  // Subscribe to Halaqah Mesh on mount
  useEffect(() => {
    // Join halaqah with current name, role, roomCode
    halaqahMesh.joinHalaqah(userName, role, roomCode);
    setLocalNode(halaqahMesh.getLocalNodeInfo());

    // Subscribe to real peer updates
    const unsubPeers = halaqahMesh.subscribePeers((updatedPeers) => {
      setPeers(updatedPeers);
      setLocalNode(halaqahMesh.getLocalNodeInfo());
    });

    // Subscribe to live submissions
    const unsubSubmissions = halaqahMesh.subscribeSubmissions((pkt) => {
      setSubmissions(halaqahMesh.getRecentSubmissions());
    });

    // Subscribe to tashih dispatches
    const unsubTashih = halaqahMesh.subscribeTashih((pkt) => {
      setTashihHistory(halaqahMesh.getRecentTashih());
      // Celebrate if local santri received Tashih
      if (pkt.recipientId === halaqahMesh.getLocalNodeInfo().nodeId) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    });

    // Initial state
    setSubmissions(halaqahMesh.getRecentSubmissions());
    setTashihHistory(halaqahMesh.getRecentTashih());

    return () => {
      unsubPeers();
      unsubSubmissions();
      unsubTashih();
    };
  }, []);

  const handleUpdateIdentity = () => {
    localStorage.setItem('qv_halaqah_user_name', userName);
    localStorage.setItem('qv_halaqah_user_role', role);
    localStorage.setItem('qv_halaqah_room_code', roomCode);
    halaqahMesh.joinHalaqah(userName, role, roomCode);
    setLocalNode(halaqahMesh.getLocalNodeInfo());
  };

  const handleSendTilawahSubmission = () => {
    setIsSubmitting(true);
    const surahMeta = SURAH_LIST.find((s) => s.number === selectedSurah) || SURAH_LIST[77];

    halaqahMesh.broadcastSubmission({
      surahNumber: selectedSurah,
      surahName: surahMeta.latinName,
      ayahNumber: selectedAyah,
      score: submissionScore,
      tajweedPassed: submissionScore >= 80,
      warningsCount: submissionScore >= 80 ? 0 : 2,
      spokenArabic: spokenText,
      expectedArabic: spokenText
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissions(halaqahMesh.getRecentSubmissions());
    }, 300);
  };

  const handleDispatchTashih = () => {
    if (!activeReviewSubmission) return;

    halaqahMesh.broadcastTashih({
      submissionId: activeReviewSubmission.payload.submissionId,
      santriId: activeReviewSubmission.senderId,
      santriName: activeReviewSubmission.senderName,
      ustadzId: localNode.nodeId,
      ustadzName: localNode.name,
      grade: ustadzGrade,
      correctionNotes: tashihNotes,
      approved: ustadzGrade !== 'RASIB'
    });

    setActiveReviewSubmission(null);
    setTashihHistory(halaqahMesh.getRecentTashih());
  };

  const currentSurahMeta = SURAH_LIST.find((s) => s.number === selectedSurah) || SURAH_LIST[77];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Mesh Network Status Header */}
      <div className="bg-[#FFFDF7] border-3 border-black rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_0px_#111827]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b-2 border-black/10 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0B4627] text-[#F59E0B] border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_#000]">
              <Radio className="w-4 h-4 animate-pulse text-amber-300" />
              <span>P2P ZERO-INTERNET HALAQAH MESH</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Majelis Sima'an & Tashih Antar-Santri / Ustadz
            </h2>
            <p className="text-xs font-semibold text-gray-600">
              Protokol P2P offline terdesentralisasi via browser <span className="font-mono font-bold text-black bg-amber-100 px-1.5 py-0.5 rounded border border-black">BroadcastChannel</span>. Bebas kuota internet!
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 font-mono">
            <div className="bg-emerald-50 border-2 border-black rounded-2xl px-3 py-2 text-center shadow-[2px_2px_0px_0px_#000]">
              <span className="text-lg font-black text-[#0B4627] block">{peers.length + 1}</span>
              <span className="text-[9px] font-bold text-gray-600 uppercase">Node Aktif</span>
            </div>
            <div className="bg-amber-50 border-2 border-black rounded-2xl px-3 py-2 text-center shadow-[2px_2px_0px_0px_#000]">
              <span className="text-lg font-black text-black block">&lt; 2 ms</span>
              <span className="text-[9px] font-bold text-gray-600 uppercase">Latensi P2P</span>
            </div>
          </div>
        </div>

        {/* Identity & Room Configuration Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-5">
          <div>
            <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider block mb-1">
              Nama Santri / Ustadz:
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onBlur={handleUpdateIdentity}
              placeholder="Ketik nama asli..."
              className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#0B4627] shadow-[2px_2px_0px_0px_#000]"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider block mb-1">
              Peran di Majelis:
            </label>
            <select
              value={role}
              onChange={(e) => {
                const newRole = e.target.value as HalaqahRole;
                setRole(newRole);
                localStorage.setItem('qv_halaqah_user_role', newRole);
                halaqahMesh.joinHalaqah(userName, newRole, roomCode);
                setLocalNode(halaqahMesh.getLocalNodeInfo());
              }}
              className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#0B4627] shadow-[2px_2px_0px_0px_#000] cursor-pointer"
            >
              <option value="SANTRI_PEER">Santri / Hafizh (Peserta)</option>
              <option value="USTADZ_COORDINATOR">Ustadz / Musyrif (Penguji)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-black text-gray-700 uppercase tracking-wider block mb-1">
              Kode Majelis (Room):
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onBlur={handleUpdateIdentity}
              placeholder="HALAQAH-JUZ30"
              className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#0B4627] shadow-[2px_2px_0px_0px_#000]"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleUpdateIdentity}
              className="w-full py-2 px-4 bg-[#0B4627] hover:bg-[#08351D] text-white border-2 border-black rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Perbarui Sinyal P2P</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Peer Roster (Left) & Interaction Hub (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Connected Peer Nodes */}
        <div className="bg-[#FFFDF7] border-3 border-black rounded-3xl p-5 shadow-[4px_4px_0px_0px_#111827] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0B4627]" />
              <span>Daftar Anggota Majelis</span>
            </h3>
            <span className="text-[10px] font-mono font-bold bg-[#F59E0B] text-black px-2 py-0.5 rounded border border-black">
              {roomCode}
            </span>
          </div>

          {/* Local Node Card */}
          <div className="p-3 bg-emerald-50 border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000] relative">
            <span className="absolute right-2 top-2 text-[9px] font-mono font-black bg-[#0B4627] text-[#F59E0B] px-1.5 py-0.2 rounded border border-black">
              ANDA (NODE INI)
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0B4627] text-white font-bold flex items-center justify-center text-xs border border-black">
                {localNode.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-black text-gray-900 leading-tight">
                  {localNode.name}
                </p>
                <p className="text-[10px] font-bold text-gray-600">
                  {localNode.role === 'USTADZ_COORDINATOR' ? 'Ustadz Musyrif' : 'Santri Hafizh'}
                </p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] font-mono font-bold text-gray-600">
              <span>Status: <strong className="text-emerald-700">TERHUBUNG</strong></span>
              <span>Ping: &lt;1ms</span>
            </div>
          </div>

          {/* Remote Connected Peers List */}
          <div className="space-y-2">
            {peers.length === 0 ? (
              <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl text-center space-y-2">
                <Wifi className="w-8 h-8 text-gray-400 mx-auto animate-bounce" />
                <p className="text-xs font-bold text-gray-700">
                  Menunggu santri atau ustadz lain...
                </p>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Buka tab baru di browser Anda atau komputer santri lain pada jaringan yang sama untuk bergabung di majelis <strong className="text-black">{roomCode}</strong>.
                </p>
              </div>
            ) : (
              peers.map((peer) => (
                <div
                  key={peer.nodeId}
                  className="p-3 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs border border-black shrink-0">
                      {peer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-black text-gray-900 truncate">{peer.name}</p>
                      <p className="text-[10px] font-bold text-gray-500">
                        {peer.role === 'USTADZ_COORDINATOR' ? 'Ustadz' : 'Santri'} • {peer.totalSubmissions} Setoran
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-500 bg-emerald-100 text-emerald-900 block">
                      {peer.latencyMs} ms
                    </span>
                    <span className="text-[8px] text-gray-400 block mt-0.5">Online</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (2 Spans): Tilawah Submission & Ustadz Tashih Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Panel for Santri: Kirim Setoran Tilawah */}
          {role === 'SANTRI_PEER' && (
            <div className="bg-[#FFFDF7] border-3 border-black rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#111827] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#0B4627]" />
                  <span>Kirim Setoran Hafalan ke Majelis</span>
                </h3>
                <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-black">
                  Mode Santri
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-700 block mb-1">Pilih Surah:</label>
                  <select
                    value={selectedSurah}
                    onChange={(e) => setSelectedSurah(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_0px_#000]"
                  >
                    {SURAH_LIST.slice(77).map((s) => (
                      <option key={s.number} value={s.number}>
                        {s.number}. {s.latinName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-700 block mb-1">Nomor Ayat:</label>
                  <input
                    type="number"
                    min={1}
                    max={currentSurahMeta.ayahCount}
                    value={selectedAyah}
                    onChange={(e) => setSelectedAyah(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold font-mono shadow-[2px_2px_0px_0px_#000]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-700 block mb-1">Skor Akurasi AI:</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={submissionScore}
                    onChange={(e) => setSubmissionScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold font-mono shadow-[2px_2px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-700 block mb-1">Lafal Tilawah yang Disetor:</label>
                <input
                  type="text"
                  value={spokenText}
                  onChange={(e) => setSpokenText(e.target.value)}
                  dir="rtl"
                  className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl text-base font-quran font-bold shadow-[2px_2px_0px_0px_#000]"
                />
              </div>

              <button
                onClick={handleSendTilawahSubmission}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#F59E0B] hover:bg-[#D97706] text-black border-2 border-black rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000] active:translate-y-0.5"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengirim ke Majelis P2P...' : 'Siarkan Setoran ke Majelis Sekarang'}</span>
              </button>
            </div>
          )}

          {/* Panel for Ustadz: Tashih Review Queue */}
          {role === 'USTADZ_COORDINATOR' && (
            <div className="bg-[#FFFDF7] border-3 border-black rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#111827] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0B4627]" />
                  <span>Antrean Tashih Ustadz Musyrif</span>
                </h3>
                <span className="text-[10px] font-mono font-bold bg-[#0B4627] text-[#F59E0B] px-2 py-0.5 rounded border border-black">
                  Mode Penguji
                </span>
              </div>

              {submissions.length === 0 ? (
                <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-xs font-bold text-gray-700">Belum ada setoran masuk</p>
                  <p className="text-[10px] text-gray-500">
                    Ketika santri di majelis menyiarkan setoran ayat, kartu setoran akan muncul otomatis di sini untuk Anda uji dan beri tashih.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => {
                    const isSelected = activeReviewSubmission?.id === sub.id;
                    return (
                      <div
                        key={sub.id}
                        className={`p-4 rounded-2xl border-2 border-black transition-all ${
                          isSelected ? 'bg-amber-50 shadow-[3px_3px_0px_0px_#000]' : 'bg-white shadow-[2px_2px_0px_0px_#000]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-gray-900">{sub.senderName}</span>
                              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded border border-black font-bold">
                                Skor: {sub.payload.score}%
                              </span>
                            </div>
                            <p className="text-[11px] font-semibold text-gray-600 mt-0.5">
                              QS. {sub.payload.surahName} : {sub.payload.ayahNumber}
                            </p>
                          </div>

                          <button
                            onClick={() => setActiveReviewSubmission(sub)}
                            className="px-3 py-1 bg-[#0B4627] text-white border-2 border-black rounded-lg text-xs font-black cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                          >
                            Beri Tashih
                          </button>
                        </div>

                        <p className="mt-2 p-2 bg-gray-50 border border-black/20 rounded-xl font-quran text-lg text-right" dir="rtl">
                          {sub.payload.spokenArabic}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tashih Modal/Drawer for selected submission */}
              {activeReviewSubmission && (
                <div className="p-4 bg-[#FEF3C7] border-2 border-black rounded-2xl space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-900">
                      Tashih untuk: <strong className="underline">{activeReviewSubmission.senderName}</strong>
                    </span>
                    <button
                      onClick={() => setActiveReviewSubmission(null)}
                      className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1"
                      aria-label="Tutup"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Tutup</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-800 block mb-1">Pilih Predikat Nilai:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['MUMTAZ', 'JAYYID_JIDDAN', 'JAYYID', 'RASIB'] as const).map((grade) => (
                        <button
                          key={grade}
                          onClick={() => setUstadzGrade(grade)}
                          className={`py-1.5 px-2 rounded-xl border-2 border-black text-[11px] font-black cursor-pointer transition-all ${
                            ustadzGrade === grade
                              ? 'bg-[#0B4627] text-[#F59E0B] shadow-[2px_2px_0px_0px_#000]'
                              : 'bg-white text-gray-800 hover:bg-amber-100'
                          }`}
                        >
                          {grade === 'MUMTAZ' ? 'Mumtaz' : grade === 'JAYYID_JIDDAN' ? 'Jayyid Jiddan' : grade === 'JAYYID' ? 'Jayyid' : 'Perlu Ulang'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-800 block mb-1">Catatan Koreksi Tajwid:</label>
                    <input
                      type="text"
                      value={tashihNotes}
                      onChange={(e) => setTashihNotes(e.target.value)}
                      placeholder="Catatan makhraj atau mad..."
                      className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold shadow-[2px_2px_0px_0px_#000]"
                    />
                  </div>

                  <button
                    onClick={handleDispatchTashih}
                    className="w-full py-2 bg-[#0B4627] hover:bg-[#08351D] text-[#F59E0B] border-2 border-black rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Kirim Hasil Tashih ke Santri</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Activity Timeline: Received Submissions & Tashih Results */}
          <div className="bg-[#FFFDF7] border-3 border-black rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#111827] space-y-3">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 border-b-2 border-black/10 pb-3">
              <Clock className="w-4 h-4 text-[#0B4627]" />
              <span>Linimasa Aktivitas Majelis</span>
            </h3>

            {tashihHistory.length === 0 && submissions.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-3 text-center">
                Belum ada aktivitas di majelis ini. Mulai dengan mengirim setoran tilawah di atas!
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {tashihHistory.map((tsh) => (
                  <div
                    key={tsh.id}
                    className="p-3 bg-emerald-50 border-2 border-black rounded-2xl flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#000]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#F59E0B]" />
                        <span className="text-xs font-black text-gray-900">
                          {tsh.payload.santriName} ditashih oleh {tsh.payload.ustadzName}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-700 mt-0.5">
                        "{tsh.payload.correctionNotes}"
                      </p>
                    </div>

                    <span className="text-[10px] font-black px-2 py-0.5 rounded border border-black bg-[#F59E0B] text-black font-mono shrink-0">
                      {tsh.payload.grade}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// TANYA BAYAN AI ASSISTANT SERVICE (BAYAN PERSONA & TOOL CALLING ENGINE)
// Powered by DeepSeek v4 Pro (via Thirty Store) with Function Calling & Grounding
// Official Assistant for AL-HUDA Platform
// ==============================================================================

import { BAYAN_TOOLS_SCHEMA, bayanToolsService, ChatAction } from './bayanToolsService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  actions?: ChatAction[];
}

// Konfigurasi Resmi & Terkunci Thirty Store DeepSeek v4 Pro
export const THIRTY_STORE_API_KEY = 'sk-ts-VB0BNV245K445QF7ZCRVCN6B7ADS';
export const THIRTY_STORE_BASE_URL = 'https://api.thirtystore.com/v1';
export const THIRTY_STORE_MODEL = 'thirty/deepseek-v4-pro';

const STORAGE_KEY_CHAT = 'qv_bayan_chat_history_v1';
const STORAGE_KEY_CHAT_AZMAN = 'qv_azman_chat_history_v1';
const STORAGE_KEY_CHAT_LEGACY = 'qv_quran_buddy_chat_history_v1';

// Hapus sisa konfigurasi lama di browser jika ada
try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('qv_quran_buddy_config_v1');
  }
} catch {}

const SYSTEM_PROMPT = `Kamu adalah "Bayan", asisten AI resmi, sahabat belajar Al-Qur'an, dan pemandu cerdas platform Al-Huda (dari kata Al-Bayan / البيان: penjelas yang terang dan fasih).
Karaktermu: berilmu, bijaksana, santun, hangat, fasih menjelaskan, proaktif memandu, dan menyejukkan hati (layaknya sahabat halaqah & asisten pribadi yang ramah).

Pengetahuan Mendalam Platform Al-Huda:
Platform Al-Huda memiliki 10 modul utama yang siap digunakan:
1. Muroja'ah AI Studio ('murojaah_ai'): Evaluasi kelancaran hafalan dengan speech recognition, deteksi salah lafadz / tajwid secara real-time.
2. Mushaf Al-Qur'an Standar Kemenag ('mushaf'): 30 Juz, 114 Surah, 604 halaman mushaf madinah / kemenag dengan audio per ayat & tafsir.
3. Studio Tilawah ('tilawah'): Rekam tilawah santri, bandingkan makhraj dengan qari internasional.
4. Simai Tutup Mata ('simai'): Latihan hafalan mandiri tanpa melihat teks (teks tertutup), intip kata jika buntu.
5. Tantangan Sambung Ayat ('challenge'): Gamifikasi kuis tebak sambungan ayat, timer, streak skor, dan perolehan XP.
6. Waktu Sholat & Adzan ('prayer'): Jadwal 5 waktu sholat seluruh kota Indonesia (kemenag / hisab presisi), adzan visual fullscreen, dan hitung mundur.
7. Jurnal Absensi Sholat 5 Waktu ('attendance'): Catatan sholat tepat waktu / berjamaah / munfarid dengan reward XP.
8. Dzikir Al-Ma'tsurat ('dzikir'): Wirid doa pagi dan petang Sughro & Kubro lengkap dengan counter tasbih digital.
9. Ensiklopedia Asbabun Nuzul ('asbabun_nuzul'): Latar belakang sebab turunnya ayat-ayat Al-Qur'an sahih.
10. Pusat Unduh Offline 30 Juz ('download'): Download 30 Juz offline (Quran Vault & Master Vault Induk), 100% jalan tanpa internet / di pesawat.

Kewenangan Alat (Function Calling):
Kamu dilengkapi dengan tools untuk mengambil tindakan nyata di website:
- navigate_tab: Arahkan pengguna ke salah satu dari 10 modul di atas saat pengguna meminta atau saat kamu merekomendasikannya.
- jump_to_quran: Buka Mushaf langsung ke nomor Surah (1-114) dan nomor Ayat tertentu saat membahas atau merekomendasikan ayat.
- get_prayer_schedule: Periksa jadwal sholat hari ini dan hitung mundur waktu berikutnya jika pengguna bertanya tentang waktu sholat.
- get_user_progress: Cek status profil santri, XP, streak, dan surah terakhir yang dibaca pengguna.
- open_dzikir_mode: Buka wirid Dzikir Al-Ma'tsurat Pagi atau Petang.
- open_install_guide: Tampilkan panduan unduh APK Android atau pasang PWA Al-Huda.
- explain_feature: Jelaskan cara pakai fitur Al-Huda.

Aturan Respon Bayan:
1. Panggil tools yang relevan jika pengguna meminta aksi nyata (contoh: "buka murojaah", "lihat jadwal sholat", "buka surah Al-Mulk", "aku mau dzikir petang", "cek progress ku").
2. Gunakan bahasa Indonesia yang santun, akrab, jelas, dan menginspirasi. Menyapa dengan hangat: "Sahabat Qur'an" atau "Akhi/Ukhti".
3. Format jawaban dengan poin-poin yang rapi, terstruktur, dan tidak bertele-tele.
4. Jika mengutip ayat, sebutkan nama Surah dan nomor ayatnya.
5. Jika pengguna menyapa, sambutlah dengan salam hangat islami: "Assalamu'alaikum warahmatullah wabarakatuh".`;

class QuranBuddyService {
  public loadHistory(): ChatMessage[] {
    try {
      let saved = localStorage.getItem(STORAGE_KEY_CHAT);
      if (!saved) {
        saved = localStorage.getItem(STORAGE_KEY_CHAT_AZMAN);
      }
      if (!saved) {
        saved = localStorage.getItem(STORAGE_KEY_CHAT_LEGACY);
      }
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    // Pesan sapaan default jika history kosong
    return [
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: `Assalamu'alaikum warahmatullah wabarakatuh!\n\nSaya **Bayan**, asisten AI sahabat Al-Qur'an dan pemandu cerdasmu di **Al-Huda**.\n\nAda yang bisa Bayan bantu hari ini? Kamu bisa bertanya tafsir & makna ayat, hukum tajwid, tips muroja'ah hafalan, atau minta Bayan mengantarmu ke fitur Al-Huda (seperti Muroja'ah AI, Mushaf, Jadwal Sholat, dan Dzikir Al-Ma'tsurat)!`,
        timestamp: Date.now(),
        actions: [
          {
            id: 'act_welcome_murojaah',
            type: 'navigate_tab',
            label: '🎙️ Muroja\'ah AI Studio',
            payload: { tab: 'murojaah_ai' }
          },
          {
            id: 'act_welcome_mushaf',
            type: 'jump_quran',
            label: '📖 Buka Surah Al-Mulk',
            payload: { surahNumber: 67, ayahNumber: 1 }
          },
          {
            id: 'act_welcome_prayer',
            type: 'navigate_tab',
            label: '🕌 Jadwal Sholat',
            payload: { tab: 'prayer' }
          }
        ]
      }
    ];
  }

  public saveHistory(messages: ChatMessage[]): void {
    try {
      // Simpan maksimal 30 pesan terakhir agar efisien di localStorage
      const trimmed = messages.slice(-30);
      localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Gagal menyimpan history chat:', e);
    }
  }

  public clearHistory(): ChatMessage[] {
    try {
      localStorage.removeItem(STORAGE_KEY_CHAT);
      localStorage.removeItem(STORAGE_KEY_CHAT_AZMAN);
    } catch {}
    return this.loadHistory();
  }

  /**
   * Kirim pesan ke DeepSeek v4 Pro via Thirty Store API dengan Function Calling & Fallback
   */
  public async sendMessage(
    userText: string,
    history: ChatMessage[] = []
  ): Promise<{ text: string; actions?: ChatAction[] }> {
    // Cek jika offline secara fisik di browser
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return this.generateOfflineFallback(userText);
    }

    const url = `${THIRTY_STORE_BASE_URL}/chat/completions`;

    // Siapkan payload messages (System prompt + riwayat percakapan terkini)
    const apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Ambil riwayat percakapan valid (hindari welcome message dan error message)
    const validHistory = history.filter(
      (m) => m.id !== 'msg_welcome' && !m.id.startsWith('msg_err_')
    );

    const prevHistory = validHistory.slice(-6);
    for (const msg of prevHistory) {
      if (
        msg === validHistory[validHistory.length - 1] &&
        msg.role === 'user' &&
        msg.content === userText
      ) {
        continue;
      }
      apiMessages.push({
        role: msg.role === 'system' ? 'system' : msg.role,
        content: msg.content
      });
    }

    // Tambahkan pesan user saat ini
    apiMessages.push({ role: 'user', content: userText });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${THIRTY_STORE_API_KEY}`,
          'x-api-key': THIRTY_STORE_API_KEY
        },
        body: JSON.stringify({
          model: THIRTY_STORE_MODEL,
          messages: apiMessages,
          tools: BAYAN_TOOLS_SCHEMA,
          tool_choice: 'auto',
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[BayanService] Thirty Store Error Status:', response.status, errorText);
        throw new Error(`API Thirty Store (${response.status}): ${errorText.slice(0, 120)}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const message = choice?.message;

      if (!message) {
        throw new Error('Format respon API kosong atau tidak sesuai.');
      }

      const actionsCollected: ChatAction[] = [];
      let finalReplyText = (message.content || '').trim();

      // Tangani Tool Calls jika model meminta eksekusi tool
      if (message.tool_calls && Array.isArray(message.tool_calls) && message.tool_calls.length > 0) {
        const toolOutputs: string[] = [];

        for (const toolCall of message.tool_calls) {
          const fnName = toolCall.function?.name;
          const fnArgs = toolCall.function?.arguments;

          if (fnName) {
            const execResult = bayanToolsService.executeTool(fnName, fnArgs);
            if (execResult.action) {
              actionsCollected.push(execResult.action);
            }
            if (execResult.userFacingText) {
              toolOutputs.push(execResult.userFacingText);
            }
          }
        }

        // Jika model mengembalikan teks kosong selain tool_calls, gunakan userFacingText dari tool
        if (!finalReplyText && toolOutputs.length > 0) {
          finalReplyText = toolOutputs.join('\n\n');
        } else if (toolOutputs.length > 0) {
          finalReplyText = `${finalReplyText}\n\n${toolOutputs.join('\n\n')}`;
        }
      }

      // Deteksi aksi kontekstual tambahan jika model menyebutkan surah atau tab spesifik dalam teks
      this.detectContextualActions(finalReplyText, actionsCollected);

      return {
        text: finalReplyText.trim(),
        actions: actionsCollected.length > 0 ? actionsCollected : undefined
      };
    } catch (err: any) {
      console.warn('[BayanService] Gagal koneksi Thirty Store:', err);
      // Jika jaringan gagal, gunakan offline fallback pintar
      return this.generateOfflineFallback(userText);
    }
  }

  /**
   * Menambahkan Action Badges otomatis dari konten teks jika relevan
   */
  private detectContextualActions(text: string, actions: ChatAction[]): void {
    const lower = text.toLowerCase();

    // Cek jika teks menyebutkan Surah tertentu tapi belum ada action jump_quran
    const hasJump = actions.some((a) => a.type === 'jump_quran');
    if (!hasJump) {
      if (lower.includes('al-mulk') || lower.includes('surah al-mulk')) {
        actions.push({
          id: `act_auto_mulk_${Date.now()}`,
          type: 'jump_quran',
          label: '📖 Buka Surah Al-Mulk',
          payload: { surahNumber: 67, ayahNumber: 1 }
        });
      } else if (lower.includes('al-kahf') || lower.includes('surah al-kahf')) {
        actions.push({
          id: `act_auto_kahf_${Date.now()}`,
          type: 'jump_quran',
          label: '📖 Buka Surah Al-Kahf',
          payload: { surahNumber: 18, ayahNumber: 1 }
        });
      } else if (lower.includes('yasin') || lower.includes('surah yasin')) {
        actions.push({
          id: `act_auto_yasin_${Date.now()}`,
          type: 'jump_quran',
          label: '📖 Buka Surah Yasin',
          payload: { surahNumber: 36, ayahNumber: 1 }
        });
      } else if (lower.includes('al-baqarah') || lower.includes('surah al-baqarah')) {
        actions.push({
          id: `act_auto_baq_${Date.now()}`,
          type: 'jump_quran',
          label: '📖 Buka Surah Al-Baqarah',
          payload: { surahNumber: 2, ayahNumber: 1 }
        });
      }
    }

    // Cek modul Muroja'ah
    const hasNav = actions.some((a) => a.type === 'navigate_tab');
    if (!hasNav) {
      if (lower.includes("muroja'ah ai") || lower.includes('murojaah ai') || lower.includes('evaluasi hafalan')) {
        actions.push({
          id: `act_auto_murojaah_${Date.now()}`,
          type: 'navigate_tab',
          label: '🎙️ Buka Muroja\'ah AI Studio',
          payload: { tab: 'murojaah_ai' }
        });
      }
    }
  }

  /**
   * Fallback cerdas saat mode offline (Pesawat / Tanpa Koneksi) dengan dukungan Tool & Action lokal
   */
  private generateOfflineFallback(query: string): { text: string; actions?: ChatAction[] } {
    const q = query.toLowerCase();

    // 1. Permintaan Navigasi Lokal Offline
    if (q.includes('muroja') || q.includes('hafal') || q.includes('evaluasi')) {
      return {
        text: `*(Mode Offline - Basis Data Lokal)*\n\n**Tips Menjaga Hafalan (Muroja'ah):**\n1. **Golden Hour Fajar**: Muroja'ah ba'da Subuh saat gelombang otak dalam kondisi alfa paling tenang.\n2. **Metode Tikrar**: Ulangi 1 halaman minimal 20x sebelum pindah ke ayat berikutnya.\n3. **Gunakan Fitur Muroja'ah AI**: Latih kelancaran bacaanmu di Studio Muroja'ah AI!`,
        actions: [
          {
            id: `act_off_murojaah_${Date.now()}`,
            type: 'navigate_tab',
            label: '🎙️ Buka Studio Muroja\'ah AI',
            payload: { tab: 'murojaah_ai' }
          }
        ]
      };
    }

    if (q.includes('sholat') || q.includes('jadwal') || q.includes('adzan')) {
      const res = bayanToolsService.executeTool('get_prayer_schedule', {});
      return {
        text: `*(Mode Offline - Hisab Lokal)*\n\n${res.userFacingText}`,
        actions: res.action ? [res.action] : undefined
      };
    }

    if (q.includes('dzikir') || q.includes('matsurat') || q.includes("ma'tsurat")) {
      const isPetang = q.includes('petang') || q.includes('sore');
      const res = bayanToolsService.executeTool('open_dzikir_mode', { time: isPetang ? 'petang' : 'pagi' });
      return {
        text: `*(Mode Offline - Wirid Lokal)*\n\n${res.userFacingText}\nKamu dapat melantunkan dzikir Al-Ma'tsurat secara mandiri dengan tasbih digital.`,
        actions: res.action ? [res.action] : undefined
      };
    }

    if (q.includes('tajwid') || q.includes('ikhfa') || q.includes('idgham') || q.includes('idzhar')) {
      return {
        text: `*(Mode Offline - Basis Data Lokal)*\n\n**Hukum Nun Sukun & Tanwin Ringkas:**\n- **Idzhar Halqi**: Dibaca jelas jika bertemu huruf ء هـ ع ح غ خ.\n- **Idgham Bighunnah**: Melebur berdengung bertemu ي ن م و.\n- **Idgham Bilaghunnah**: Melebur tanpa dengung bertemu ل ر.\n- **Iqlab**: Berubah menjadi mim bertemu ب.\n- **Ikhfa Haqiqi**: Dibaca samar bertemu 15 huruf lainnya.\n\n*Hubungkan ke internet untuk penjelasan tajwid interaktif lengkap.*`
      };
    }

    if (q.includes('surah') || q.includes('mushaf') || q.includes('baca')) {
      return {
        text: `*(Mode Offline)*\n\nMushaf Al-Qur'an 30 Juz dan Terjemah Kemenag di Al-Huda dapat kamu akses 100% secara offline tanpa internet.`,
        actions: [
          {
            id: `act_off_mushaf_${Date.now()}`,
            type: 'navigate_tab',
            label: '📖 Buka Mushaf Al-Qur\'an',
            payload: { tab: 'mushaf' }
          }
        ]
      };
    }

    return {
      text: `*(Mode Offline)*\n\nSaat ini perangkat sedang offline atau sambungan internet belum stabil. Pertanyaanmu *" ${query} "* akan dijawab lengkap oleh Bayan begitu terhubung ke jaringan.\n\nKamu tetap bisa menggunakan Mushaf, Muroja'ah AI, Dzikir Al-Ma'tsurat, dan Jadwal Sholat secara 100% offline!`
    };
  }
}

export const quranBuddyService = new QuranBuddyService();

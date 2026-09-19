// ==============================================================================
// QURAN BUDDY AI ASSISTANT SERVICE
// Powered by DeepSeek v4 Pro (via Thirty Store)
// Zero-Regression & Isolated Architecture for QURANVERSE
// ==============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// Konfigurasi Resmi & Terkunci Thirty Store DeepSeek v4 Pro
export const THIRTY_STORE_API_KEY = 'sk-ts-VB0BNV245K445QF7ZCRVCN6B7ADS';
export const THIRTY_STORE_BASE_URL = 'https://api.thirtystore.com/v1';
export const THIRTY_STORE_MODEL = 'thirty/deepseek-v4-pro';

const STORAGE_KEY_CHAT = 'qv_quran_buddy_chat_history_v1';

// Hapus sisa konfigurasi lama di browser pengguna jika ada
try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('qv_quran_buddy_config_v1');
  }
} catch {}

const SYSTEM_PROMPT = `Kamu adalah "Quran Buddy", asisten AI sahabat belajar Al-Qur'an di aplikasi Al-Huda.
Karaktermu: ramah, santun, hangat, suportif, dan menyejukkan hati santri atau penuntut ilmu (seperti teman halaqah yang berilmu).

Keahlian & Lingkup Tugasmu:
1. Menjawab pertanyaan seputar makna ayat Al-Qur'an, tadabbur, asbabun nuzul, dan terjemahan resmi Kemenag.
2. Menjelaskan kaidah hukum tajwid (Idzhar, Idgham, Ikhfa, Iqlab, Mad, Waqaf, Makhraj huruf) dengan ringkas dan contoh lafal yang jelas.
3. Memberikan tips dan motivasi muroja'ah hafalan Al-Qur'an (misal: metode tikrar, pembagian waktu fajar, menjaga hafalan).
4. Menjelaskan doa-doa harian ma'tsur, adab tilawah, dan dzikir (seperti Al-Ma'tsurat).

Aturan Respon:
- Gunakan bahasa Indonesia yang santun, akrab, jelas, dan mudah dipahami. Boleh menyapa dengan panggilan "Sahabat Qur'an" atau "Akhi/Ukhti".
- Format jawaban dengan poin-poin rapi (bullet points) jika menjelaskan tahapan atau hukum bacaan.
- Cantumkan nama Surah dan nomor ayat yang relevan jika mengutip Al-Qur'an.
- Hindari perdebatan khilafiyah yang meruncing; kedepankan adab dan persatuan umat.
- Jika pengguna menyapa, sambutlah dengan salam hangat islami (Assalamu'alaikum).`;

class QuranBuddyService {
  public loadHistory(): ChatMessage[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHAT);
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
        content: `Assalamu'alaikum warahmatullah! 👋\n\nSaya **Quran Buddy**, sahabat belajarmu di Quranverse bertenaga **DeepSeek v4 Pro**.\n\nAda yang bisa saya bantu hari ini? Kamu bisa tanyakan arti ayat, hukum tajwid, tips muroja'ah, atau adab membaca Al-Qur'an! 😊`,
        timestamp: Date.now()
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
    } catch {}
    return this.loadHistory();
  }

  /**
   * Kirim pesan langsung ke DeepSeek v4 Pro via Thirty Store API
   */
  public async sendMessage(
    userText: string,
    history: ChatMessage[] = []
  ): Promise<string> {
    const url = `${THIRTY_STORE_BASE_URL}/chat/completions`;

    // Siapkan payload messages (System prompt + riwayat percakapan terkini)
    const apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Ambil maksimal 6 riwayat percakapan valid (hindari welcome message dan error message)
    const validHistory = history.filter(
      (m) => m.id !== 'msg_welcome' && !m.id.startsWith('msg_err_')
    );

    // Ambil konteks percakapan sebelumnya tanpa menduplikasi pesan user saat ini
    const prevHistory = validHistory.slice(-6);
    for (const msg of prevHistory) {
      if (msg === validHistory[validHistory.length - 1] && msg.role === 'user' && msg.content === userText) {
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
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[QuranBuddy] Thirty Store Error Status:', response.status, errorText);
        throw new Error(`API Thirty Store (${response.status}): ${errorText.slice(0, 120)}`);
      }

      const data = await response.json();
      const replyContent = data.choices?.[0]?.message?.content;

      if (!replyContent) {
        throw new Error('Format respon API kosong atau tidak sesuai.');
      }

      return replyContent.trim();
    } catch (err: any) {
      console.warn('[QuranBuddy] Gagal koneksi Thirty Store:', err);
      // Jika perangkat offline di mode pesawat
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return this.generateOfflineFallback(userText);
      }
      throw err;
    }
  }

  /**
   * Fallback cerdas saat mode offline (Pesawat / Tanpa Koneksi)
   */
  private generateOfflineFallback(query: string): string {
    const q = query.toLowerCase();

    if (q.includes('tajwid') || q.includes('ikhfa') || q.includes('idgham') || q.includes('idzhar')) {
      return `*(Mode Offline - Basis Data Lokal)* 📖\n\n**Hukum Nun Sukun & Tanwin Ringkas:**\n- **Idzhar Halqi**: Dibaca jelas jika bertemu huruf ء هـ ع ح غ خ.\n- **Idgham Bighunnah**: Melebur berdengung bertemu ي ن م و.\n- **Idgham Bilaghunnah**: Melebur tanpa dengung bertemu ل ر.\n- **Iqlab**: Berubah menjadi mim bertemu ب.\n- **Ikhfa Haqiqi**: Dibaca samar bertemu 15 huruf lainnya.\n\n*Hubungkan ke internet untuk penjelasan DeepSeek v4 Pro yang lebih mendalam.*`;
    }

    if (q.includes('ikhlas') || q.includes('al-ikhlas')) {
      return `*(Mode Offline - Basis Data Lokal)* 🌟\n\n**Keutamaan Surah Al-Ikhlas:**\nRasulullah ﷺ bersabda bahwa Surah Al-Ikhlas nilainya sebanding dengan sepertiga Al-Qur'an (HR. Bukhari no. 5013) karena memuat pemurnian tauhid kepada Allah Yang Maha Esa.`;
    }

    if (q.includes('muroja') || q.includes('hafal') || q.includes('tips') || q.includes('ingat')) {
      return `*(Mode Offline - Basis Data Lokal)* 💡\n\n**Tips Menjaga Hafalan (Muroja'ah):**\n1. **Golden Hour Fajar**: Muroja'ah ba'da Subuh saat gelombang otak dalam kondisi alfa paling tenang.\n2. **Metode Tikrar**: Ulangi 1 halaman minimal 20x sebelum pindah ke ayat berikutnya.\n3. **Pakai di Sholat**: Bacalah hafalan baru pada sholat sunnah Rawatib dan Tahajjud.\n4. **Gunakan Fitur Muroja'ah AI**: Latih kelancaran bacaanmu di tab Muroja'ah Quranverse!`;
    }

    return `*(Mode Offline)* 📡\n\nMaaf, koneksi ke DeepSeek v4 Pro sedang tidak tersedia atau perangkat sedang offline. Pertanyaanmu *" ${query} "* akan terjawab lengkap begitu terhubung ke jaringan internet.\n\nKamu tetap bisa menggunakan fitur Mushaf, Muroja'ah AI, dan Al-Ma'tsurat secara 100% offline!`;
  }
}

export const quranBuddyService = new QuranBuddyService();

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

export interface QuranBuddyConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const DEFAULT_CONFIG: QuranBuddyConfig = {
  apiKey: import.meta.env.VITE_AI_API_KEY || 'sk-ts-VB0BNV245K445QF7ZCRVCN6B7ADS',
  baseUrl: import.meta.env.VITE_AI_BASE_URL || 'https://api.thirtystore.com/v1',
  model: import.meta.env.VITE_AI_MODEL || 'thirty/deepseek-v4-pro'
};

const STORAGE_KEY_CONFIG = 'qv_quran_buddy_config_v1';
const STORAGE_KEY_CHAT = 'qv_quran_buddy_chat_history_v1';

const SYSTEM_PROMPT = `Kamu adalah "Quran Buddy", asisten AI sahabat belajar Al-Qur'an di aplikasi QURANVERSE.
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
  private config: QuranBuddyConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  public getConfig(): QuranBuddyConfig {
    return { ...this.config };
  }

  public updateConfig(partial: Partial<QuranBuddyConfig>): void {
    this.config = { ...this.config, ...partial };
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
    } catch (e) {
      console.warn('Gagal menyimpan config Quran Buddy:', e);
    }
  }

  private loadConfig(): QuranBuddyConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch {}
    return { ...DEFAULT_CONFIG };
  }

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
   * Kirim pesan ke DeepSeek v4 Pro via Thirty Store API
   */
  public async sendMessage(
    userText: string,
    history: ChatMessage[]
  ): Promise<string> {
    const cleanEndpoint = this.config.baseUrl.replace(/\/+$/, '');
    const url = `${cleanEndpoint}/chat/completions`;

    // Siapkan payload messages (System prompt + riwayat percakapan terkini)
    const apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Ambil maksimal 8 percakapan terakhir untuk konteks percakapan
    const recentHistory = history
      .filter((m) => m.id !== 'msg_welcome')
      .slice(-8);

    for (const msg of recentHistory) {
      apiMessages.push({
        role: msg.role === 'system' ? 'system' : msg.role,
        content: msg.content
      });
    }

    // Tambahkan pesan user saat ini
    apiMessages.push({ role: 'user', content: userText });

    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 1024
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`Quran Buddy Attempt ${attempt} HTTP ${response.status}:`, errorText.slice(0, 100));
          if (attempt < maxRetries && (response.status >= 500 || response.status === 429)) {
            // Wait 1.2s before retry
            await new Promise((resolve) => setTimeout(resolve, 1200));
            continue;
          }
          throw new Error(`Status ${response.status}: ${errorText.slice(0, 100)}`);
        }

        const data = await response.json();
        const replyContent = data.choices?.[0]?.message?.content;

        if (!replyContent) {
          throw new Error('Format respon API kosong atau tidak sesuai.');
        }

        return replyContent.trim();
      } catch (err: any) {
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        console.warn('Gagal koneksi ke DeepSeek Thirty Store, beralih ke local fallback:', err);
        return this.generateOfflineFallback(userText);
      }
    }

    return this.generateOfflineFallback(userText);
  }

  /**
   * Fallback cerdas saat mode offline atau koneksi sedang tidak tersedia
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

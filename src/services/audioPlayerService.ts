// High-Fidelity Audio Player Service with Multi-Reciter Support & Smart Preloader
// Supporting top international reciters (Kuwait 🇰🇼, Medina, Egypt)

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  style: string;
  bitrate: string;
  country: string;
  folder: string;
}

export const RECITERS_LIST: Reciter[] = [
  {
    id: 'alafasy',
    name: 'Syekh Mishary Rashid Al-Afasy',
    arabicName: 'مشاري راشد العفاسي',
    style: 'Murattal Merdu (Kuwait 🇰🇼)',
    bitrate: '128 kbps',
    country: 'Kuwait',
    folder: 'Alafasy_128kbps'
  },
  {
    id: 'alijaber',
    name: 'Syekh Ali Jaber (Rahimahullah)',
    arabicName: 'علي عبد الله جابر',
    style: 'Legenda Imam Masjidil Haram',
    bitrate: '64 kbps',
    country: 'Arab Saudi',
    folder: 'Ali_Jaber_64kbps'
  },
  {
    id: 'qatami',
    name: 'Syekh Nasser Al-Qatami',
    arabicName: 'ناصر القطامي',
    style: 'Murattal Syahdu & Khusyuk',
    bitrate: '128 kbps',
    country: 'Arab Saudi',
    folder: 'Nasser_Alqatami_128kbps'
  },
  {
    id: 'muaiqly',
    name: 'Syekh Mahir Al-Mu\'aiqly',
    arabicName: 'ماهر المعيقلي',
    style: 'Imam Masjidil Haram Makkah',
    bitrate: '128 kbps',
    country: 'Arab Saudi',
    folder: 'MaherAlMuaiqly128kbps'
  },
  {
    id: 'dossari',
    name: 'Syekh Yasser Ad-Dossari',
    arabicName: 'ياسر الدوسري',
    style: 'Imam Masjidil Haram Makkah',
    bitrate: '128 kbps',
    country: 'Arab Saudi',
    folder: 'Yasser_Ad-Dussary_128kbps'
  },
  {
    id: 'shuraim',
    name: 'Syekh Saud Asy-Syuraim',
    arabicName: 'سعود الشريم',
    style: 'Imam Masjidil Haram Makkah',
    bitrate: '128 kbps',
    country: 'Arab Saudi',
    folder: 'Saood_ash-Shuraym_128kbps'
  },
  {
    id: 'minshawi',
    name: 'Syekh Muhammad Siddiq Al-Minshawi',
    arabicName: 'محمد صديق المنشاوي',
    style: 'Suara Menangis (Al-Shaut Al-Baki)',
    bitrate: '128 kbps',
    country: 'Mesir',
    folder: 'Minshawy_Murattal_128kbps'
  },
  {
    id: 'husary',
    name: 'Syekh Mahmoud Khalil Al-Husary',
    arabicName: 'محمود خليل الحصري',
    style: 'Standar Emas Tajwid & Muallim',
    bitrate: '128 kbps',
    country: 'Mesir',
    folder: 'Husary_128kbps'
  },
  {
    id: 'abdulbasit',
    name: 'Syekh Abdul Basit Abdul Samad',
    arabicName: 'عبد الباسط عبد الصمد',
    style: 'Murattal Klasik HD',
    bitrate: '192 kbps HD',
    country: 'Mesir',
    folder: 'Abdul_Basit_Murattal_192kbps'
  },
  {
    id: 'sudais',
    name: 'Syekh Abdurrahman As-Sudais',
    arabicName: 'عبد الرحمن السديس',
    style: 'Imam Masjidil Haram Makkah',
    bitrate: '192 kbps HD',
    country: 'Arab Saudi',
    folder: 'Abdurrahmaan_As-Sudais_192kbps'
  },
  {
    id: 'ghamadi',
    name: 'Syekh Sa\'ad Al-Ghamdi',
    arabicName: 'سعد الغامدي',
    style: 'Murattal Tenang & Mengalir',
    bitrate: '128 kbps',
    country: 'Arab Saudi',
    folder: 'Ghamadi_40kbps'
  }
];

const RECITER_STORAGE_KEY = 'quranverse_selected_reciter_v1';

export function getSavedReciterId(): string {
  try {
    const saved = localStorage.getItem(RECITER_STORAGE_KEY);
    if (saved && RECITERS_LIST.some(r => r.id === saved)) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'alafasy'; // Default to Kuwait's Syekh Mishary
}

export function saveReciterId(id: string): void {
  try {
    localStorage.setItem(RECITER_STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

// EveryAyah CDN Format: 3-digit surah + 3-digit ayah (e.g. 001001.mp3)
export function formatAyatAudioUrl(
  surahNumber: number, 
  ayahNumber: number, 
  reciterId?: string
): string {
  const rId = reciterId || getSavedReciterId();
  const reciter = RECITERS_LIST.find(r => r.id === rId) || RECITERS_LIST[0];
  const sStr = String(Math.max(1, Math.min(114, surahNumber))).padStart(3, '0');
  const aStr = String(Math.max(1, ayahNumber)).padStart(3, '0');
  return `https://everyayah.com/data/${reciter.folder}/${sStr}${aStr}.mp3`;
}

// Backward compatibility alias
export const formatAlafasyAudioUrl = formatAyatAudioUrl;

// Audio Adzan Syekh Misyari Rasyid Al-Afasi
export const ADZAN_ALAFASY_URL = 'https://ia800301.us.archive.org/24/items/Athan_Mishary_Rashid_Alafasy/Athan.mp3';

class AudioPlayerService {
  private currentAudio: HTMLAudioElement | null = null;
  private preloadedAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private activeReciterId = getSavedReciterId();
  private onEndedCallback: (() => void) | null = null;
  private onTimeUpdateCallback: ((current: number, duration: number) => void) | null = null;
  private sharedAudioCtx: AudioContext | null = null;

  public getReciters(): Reciter[] {
    return RECITERS_LIST;
  }

  public getActiveReciter(): Reciter {
    return RECITERS_LIST.find(r => r.id === this.activeReciterId) || RECITERS_LIST[0];
  }

  public setActiveReciter(id: string): void {
    if (RECITERS_LIST.some(r => r.id === id)) {
      this.activeReciterId = id;
      saveReciterId(id);
    }
  }

  private getAudioContext(): AudioContext | null {
    try {
      if (!this.sharedAudioCtx || this.sharedAudioCtx.state === 'closed') {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          this.sharedAudioCtx = new AudioCtxClass();
        }
      }
      if (this.sharedAudioCtx && this.sharedAudioCtx.state === 'suspended') {
        this.sharedAudioCtx.resume().catch(() => {});
      }
      return this.sharedAudioCtx;
    } catch {
      return null;
    }
  }

  // Preload upcoming ayah audio in background for gapless playback
  public preloadAyat(surahNumber: number, ayahNumber: number): void {
    try {
      const url = formatAyatAudioUrl(surahNumber, ayahNumber, this.activeReciterId);
      this.preloadedAudio = new Audio(url);
      this.preloadedAudio.preload = 'auto';
    } catch {
      // ignore
    }
  }

  // Play a specific URL with error resilience & timeout safeguards
  public async playUrl(
    url: string, 
    onEnded?: () => void, 
    onTimeUpdate?: (current: number, duration: number) => void
  ): Promise<boolean> {
    this.stop();

    try {
      const parsedUrl = new URL(url, window.location.origin);
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        if (onEnded) onEnded();
        return false;
      }

      this.currentAudio = new Audio();
      this.currentAudio.src = parsedUrl.toString();
      this.currentAudio.crossOrigin = 'anonymous';
      this.currentAudio.preload = 'auto';
      this.onEndedCallback = onEnded || null;
      this.onTimeUpdateCallback = onTimeUpdate || null;

      let hasEnded = false;
      const finishPlayback = () => {
        if (hasEnded) return;
        if (!this.isPlaying) return;
        hasEnded = true;
        this.isPlaying = false;
        if (this.onEndedCallback) {
          const cb = this.onEndedCallback;
          this.onEndedCallback = null;
          cb();
        }
      };

      this.currentAudio.addEventListener('ended', finishPlayback);

      this.currentAudio.addEventListener('timeupdate', () => {
        if (this.currentAudio && this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(this.currentAudio.currentTime, this.currentAudio.duration || 0);
        }
      });

      this.currentAudio.addEventListener('error', () => {
        if (!this.isPlaying) return;
        console.warn('Audio playback network error, triggering graceful end.');
        finishPlayback();
      });

      // 12-second safety watchdog in case network audio hangs indefinitely
      setTimeout(() => {
        if (this.isPlaying && this.currentAudio && !this.currentAudio.paused && this.currentAudio.currentTime === 0) {
          console.warn('Audio stall timeout reached, resolving gracefully.');
          finishPlayback();
        }
      }, 12000);

      this.isPlaying = true;
      const playPromise = this.currentAudio.play();
      if (playPromise !== undefined) {
        await playPromise.catch((err: Error) => {
          if (err.name === 'AbortError' || !this.isPlaying) {
            // Interrupted cleanly by pause() or stop()
            return;
          }
          console.warn('Auto-play blocked or network failure:', err);
          finishPlayback();
        });
      }

      return true;
    } catch (err) {
      console.warn('Audio player exception:', err);
      this.isPlaying = false;
      if (onEnded) onEnded();
      return false;
    }
  }

  // Play specified Ayah recitation with active reciter
  public async playAyat(
    surahNumber: number, 
    ayahNumber: number, 
    onEnded?: () => void,
    customReciterId?: string
  ): Promise<boolean> {
    const url = formatAyatAudioUrl(surahNumber, ayahNumber, customReciterId || this.activeReciterId);
    return this.playUrl(url, onEnded);
  }

  // Play Sheikh Live Correction Intervention (Teguran Suara Syekh)
  public async playSheikhIntervention(
    surahNumber: number,
    ayahNumber: number,
    customReciterId?: string,
    onEnded?: () => void
  ): Promise<boolean> {
    // 1. Play subtle correction cue tone
    this.playCorrectionPromptSound();

    // 2. Play authentic Sheikh voice recitation after cue
    return new Promise((resolve) => {
      setTimeout(async () => {
        const success = await this.playAyat(surahNumber, ayahNumber, () => {
          if (onEnded) onEnded();
        }, customReciterId);
        resolve(success);
      }, 350);
    });
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  public resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.isPlaying = true;
      this.currentAudio.play().catch(console.warn);
    }
  }

  public isPaused(): boolean {
    return Boolean(this.currentAudio && this.currentAudio.paused);
  }

  public stop(): void {
    this.isPlaying = false;
    this.onEndedCallback = null;
    this.onTimeUpdateCallback = null;

    if (this.currentAudio) {
      try {
        this.currentAudio.onended = null;
        this.currentAudio.onerror = null;
        this.currentAudio.ontimeupdate = null;
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
      } catch {}
      this.currentAudio = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Studio-Quality Soft Velvet Chime for Correct Answers
  public playSuccessChime(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 - E5 - G5 - C6 Major Chord

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + i * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.7);
      });
    } catch {
      // ignore
    }
  }

  // Distinct Alarm Sound for Tajweed / Makhraj Correction (Teguran Syekh)
  public playAlarmTeguranSound(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // Dual-tone staccato warning chime: 587.33Hz (D5) -> 440Hz (A4) -> 329.63Hz (E4)
      const warningFrequencies = [587.33, 440.00, 329.63];

      warningFrequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle'; // Richer, distinct alarm tone
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.35);
      });
    } catch {
      // ignore
    }
  }

  // Gentle Soft Tone for Correction
  public playCorrectionPromptSound(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(392.00, now); // G4
      osc.frequency.linearRampToValueAtTime(349.23, now + 0.2); // F4

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // ignore
    }
  }
}

export const audioPlayer = new AudioPlayerService();

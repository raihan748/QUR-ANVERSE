// Service Pemutar Audio Syekh Misyari Rasyid Al-Afasi & Efek Suara

// EveryAyah CDN Format: 3-digit surah + 3-digit ayah (e.g. 001001.mp3)
export function formatAlafasyAudioUrl(surahNumber: number, ayahNumber: number): string {
  const sStr = String(surahNumber).padStart(3, '0');
  const aStr = String(ayahNumber).padStart(3, '0');
  return `https://everyayah.com/data/Alafasy_128kbps/${sStr}${aStr}.mp3`;
}

// Audio Adzan Syekh Misyari Rasyid Al-Afasi
export const ADZAN_ALAFASY_URL = 'https://ia800301.us.archive.org/24/items/Athan_Mishary_Rashid_Alafasy/Athan.mp3';

class AudioPlayerService {
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private onEndedCallback: (() => void) | null = null;
  private onTimeUpdateCallback: ((current: number, duration: number) => void) | null = null;

  // Play a specific URL with error resilience
  public async playUrl(
    url: string, 
    onEnded?: () => void, 
    onTimeUpdate?: (current: number, duration: number) => void
  ): Promise<boolean> {
    this.stop();

    try {
      this.currentAudio = new Audio(url);
      this.onEndedCallback = onEnded || null;
      this.onTimeUpdateCallback = onTimeUpdate || null;

      this.currentAudio.addEventListener('ended', () => {
        this.isPlaying = false;
        if (this.onEndedCallback) this.onEndedCallback();
      });

      this.currentAudio.addEventListener('timeupdate', () => {
        if (this.currentAudio && this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(this.currentAudio.currentTime, this.currentAudio.duration || 0);
        }
      });

      this.currentAudio.addEventListener('error', (e) => {
        console.warn('Audio playback error, fallback to synthetic chime:', e);
        this.isPlaying = false;
      });

      await this.currentAudio.play();
      this.isPlaying = true;
      return true;
    } catch (err) {
      console.warn('Auto-play blocked or network error:', err);
      this.isPlaying = false;
      return false;
    }
  }

  // Play Syekh Mishary's specific Ayah recitation
  public async playAyat(
    surahNumber: number, 
    ayahNumber: number, 
    onEnded?: () => void
  ): Promise<boolean> {
    const url = formatAlafasyAudioUrl(surahNumber, ayahNumber);
    return this.playUrl(url, onEnded);
  }

  public pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.isPlaying = false;
    }
  }

  public resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play().catch(console.warn);
      this.isPlaying = true;
    }
  }

  public stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.isPlaying = false;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Play Sound Effects using Web Audio API (Zero-dependency & instant)
  public playSuccessChime(): void {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc1.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      osc1.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc1.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc1.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio context might be restricted
    }
  }

  public playCorrectionPromptSound(): void {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.setValueAtTime(392, ctx.currentTime + 0.15); // G4

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // ignore
    }
  }
}

export const audioPlayer = new AudioPlayerService();

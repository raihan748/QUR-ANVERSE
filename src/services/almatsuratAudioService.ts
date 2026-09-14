// Al-Matsurat Dedicated Audio Service for QURANVERSE
// Completely isolated from the main Quran audio player to ensure zero-regression

import { MatsuratTime, MATSURAT_META } from '../data/almatsuratData';

export type PlaybackType = 'none' | 'full' | 'item';

export interface MatsuratAudioState {
  isPlaying: boolean;
  playbackType: PlaybackType;
  activeTime: MatsuratTime;
  activeItemId: string | null;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
}

type AudioStateListener = (state: MatsuratAudioState) => void;

class AlMatsuratAudioService {
  private audio: HTMLAudioElement | null = null;
  private listeners: Set<AudioStateListener> = new Set();
  private segmentEnd: number | null = null;
  private state: MatsuratAudioState = {
    isPlaying: false,
    playbackType: 'none',
    activeTime: 'morning',
    activeItemId: null,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    volume: 1.0,
    isLoading: false,
    error: null
  };

  private CACHE_NAME = 'quranverse-almatsurat-v1';

  constructor() {
    // Only init audio in browser environment
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'metadata';
      
      this.audio.addEventListener('play', () => {
        this.updateState({ isPlaying: true, isLoading: false, error: null });
      });

      this.audio.addEventListener('pause', () => {
        this.updateState({ isPlaying: false });
      });

      this.audio.addEventListener('waiting', () => {
        this.updateState({ isLoading: true });
      });

      this.audio.addEventListener('playing', () => {
        this.updateState({ isPlaying: true, isLoading: false });
      });

      this.audio.addEventListener('timeupdate', () => {
        if (this.audio) {
          // Check if playing a segment and reached end of segment
          if (this.segmentEnd !== null && this.audio.currentTime >= this.segmentEnd) {
            this.audio.pause();
            this.segmentEnd = null;
            this.updateState({
              isPlaying: false,
              playbackType: 'none',
              activeItemId: null
            });
            return;
          }

          this.updateState({
            currentTime: this.audio.currentTime,
            duration: this.audio.duration || 0
          });
        }
      });

      this.audio.addEventListener('durationchange', () => {
        if (this.audio) {
          this.updateState({ duration: this.audio.duration || 0 });
        }
      });

      this.audio.addEventListener('ended', () => {
        this.segmentEnd = null;
        this.updateState({
          isPlaying: false,
          playbackType: 'none',
          activeItemId: null,
          currentTime: 0
        });
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('Al-Matsurat Audio Load Event:', e);
        const currentSrc = this.audio?.src || '';
        const targetMeta = this.state.activeTime === 'morning' ? MATSURAT_META.fullAudioMorning : MATSURAT_META.fullAudioEvening;

        // If local audio fails to load, fallback to remote streaming archive URL
        if (targetMeta.fallbackUrl && !currentSrc.includes('archive.org') && this.audio) {
          console.info('Switching to remote fallback audio stream:', targetMeta.fallbackUrl);
          this.audio.src = targetMeta.fallbackUrl;
          this.audio.play().catch((err) => {
            console.warn('Fallback play note:', err);
            this.updateState({
              isPlaying: false,
              isLoading: false,
              error: 'Gagal memutar audio Al-Ma\'tsurat.'
            });
          });
          return;
        }

        this.updateState({
          isPlaying: false,
          isLoading: false,
          error: 'Gagal memuat streaming audio.'
        });
      });
    }
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(partial: Partial<MatsuratAudioState>) {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  private notifyListeners() {
    const currentState = { ...this.state };
    this.listeners.forEach((listener) => listener(currentState));
  }

  public getState(): MatsuratAudioState {
    return { ...this.state };
  }

  /**
   * Play full continuous Al-Ma'tsurat recitation based on morning vs evening
   */
  public async playFull(time: MatsuratTime, startFromSec?: number): Promise<void> {
    this.initAudioElement();
    if (!this.audio) return;
    this.segmentEnd = null;

    const targetMeta = time === 'morning' ? MATSURAT_META.fullAudioMorning : MATSURAT_META.fullAudioEvening;

    // If startFromSec provided and already active on this audio, seek & play
    if (this.state.playbackType === 'full' && this.state.activeTime === time && typeof startFromSec === 'number') {
      this.audio.currentTime = startFromSec;
      if (!this.state.isPlaying) {
        await this.audio.play();
      }
      return;
    }

    // If already playing this full audio (toggle pause)
    if (this.state.playbackType === 'full' && this.state.activeTime === time && this.state.isPlaying && typeof startFromSec === 'undefined') {
      this.audio.pause();
      return;
    }

    // If paused on this audio, resume
    if (this.state.playbackType === 'full' && this.state.activeTime === time && !this.state.isPlaying && this.audio.src && typeof startFromSec === 'undefined') {
      try {
        await this.audio.play();
        return;
      } catch (err) {
        console.error('Resume error:', err);
      }
    }

    this.updateState({
      playbackType: 'full',
      activeTime: time,
      activeItemId: null,
      isLoading: true,
      error: null
    });

    try {
      const currentSrc = this.audio.src || '';
      const isSameSrc = currentSrc.includes(targetMeta.url) || (targetMeta.fallbackUrl ? currentSrc.includes(targetMeta.fallbackUrl) : false);

      if (!isSameSrc) {
        this.audio.src = targetMeta.url;
        this.audio.load();
      }

      if (typeof startFromSec === 'number') {
        this.audio.currentTime = startFromSec;
      }
      this.audio.playbackRate = this.state.playbackRate;
      this.audio.volume = this.state.volume;
      await this.audio.play();
      this.cacheAudioInBackground(targetMeta.url);
    } catch (err) {
      console.warn('Initial playback attempt failed, trying fallback...', err);
      if (targetMeta.fallbackUrl && this.audio) {
        try {
          this.audio.src = targetMeta.fallbackUrl;
          if (typeof startFromSec === 'number') {
            this.audio.currentTime = startFromSec;
          }
          await this.audio.play();
          return;
        } catch (err2) {
          console.error('Fallback also failed:', err2);
        }
      }
      this.updateState({
        isPlaying: false,
        isLoading: false,
        error: 'Tidak dapat memutar audio. Silakan periksa koneksi internet.'
      });
    }
  }

  /**
   * Play an individual doa / ayah segment from the master audio with millisecond precision
   */
  public async playSegment(
    itemId: string,
    time: MatsuratTime,
    startTime: number,
    endTime: number
  ): Promise<void> {
    this.initAudioElement();
    if (!this.audio) return;

    const targetMeta = time === 'morning' ? MATSURAT_META.fullAudioMorning : MATSURAT_META.fullAudioEvening;

    // If already playing this item segment, toggle pause
    if (this.state.playbackType === 'item' && this.state.activeItemId === itemId && this.state.isPlaying) {
      this.audio.pause();
      return;
    }

    // If paused on this segment, resume
    if (this.state.playbackType === 'item' && this.state.activeItemId === itemId && !this.state.isPlaying) {
      try {
        this.segmentEnd = endTime;
        await this.audio.play();
        return;
      } catch (err) {
        console.error('Resume error:', err);
      }
    }

    this.segmentEnd = endTime;
    this.updateState({
      playbackType: 'item',
      activeTime: time,
      activeItemId: itemId,
      isLoading: true,
      error: null
    });

    try {
      const currentSrc = this.audio.src || '';
      const isSameSrc = currentSrc.includes(targetMeta.url) || (targetMeta.fallbackUrl ? currentSrc.includes(targetMeta.fallbackUrl) : false);

      if (!isSameSrc) {
        this.audio.src = targetMeta.url;
        await new Promise<void>((resolve) => {
          if (!this.audio) return resolve();
          const onLoaded = () => {
            this.audio?.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          };
          this.audio.addEventListener('loadedmetadata', onLoaded);
          this.audio.load();
        });
      }

      this.audio.currentTime = startTime;
      this.audio.playbackRate = this.state.playbackRate;
      this.audio.volume = this.state.volume;
      await this.audio.play();
      this.cacheAudioInBackground(targetMeta.url);
    } catch (err) {
      console.warn('Segment playback error:', err);
      if (targetMeta.fallbackUrl && this.audio) {
        try {
          this.audio.src = targetMeta.fallbackUrl;
          this.audio.currentTime = startTime;
          await this.audio.play();
          return;
        } catch (err2) {
          console.error('Segment fallback also failed:', err2);
        }
      }
      this.updateState({
        isPlaying: false,
        isLoading: false,
        error: 'Tidak dapat memutar audio doa.'
      });
    }
  }

  /**
   * Legacy playItem support (falls back to URL if provided)
   */
  public async playItem(itemId: string, time: MatsuratTime, audioUrl: string): Promise<void> {
    this.initAudioElement();
    if (!this.audio || !audioUrl) return;

    if (this.state.playbackType === 'item' && this.state.activeItemId === itemId && this.state.isPlaying) {
      this.audio.pause();
      return;
    }

    if (this.state.playbackType === 'item' && this.state.activeItemId === itemId && !this.state.isPlaying && this.audio.src) {
      try {
        await this.audio.play();
        return;
      } catch (err) {
        console.error('Resume error:', err);
      }
    }

    this.segmentEnd = null;
    this.updateState({
      playbackType: 'item',
      activeTime: time,
      activeItemId: itemId,
      isLoading: true,
      error: null
    });

    try {
      this.audio.src = audioUrl;
      this.audio.playbackRate = this.state.playbackRate;
      this.audio.volume = this.state.volume;
      await this.audio.play();
      this.cacheAudioInBackground(audioUrl);
    } catch (err) {
      console.warn('Item playback error:', err);
      this.updateState({
        isPlaying: false,
        isLoading: false,
        error: 'Audio doa tidak tersedia atau gagal diputar.'
      });
    }
  }

  public pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  public async resume(): Promise<void> {
    if (this.audio && this.audio.paused && this.audio.src) {
      try {
        await this.audio.play();
      } catch (err) {
        console.error('Resume error:', err);
      }
    }
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.updateState({
        isPlaying: false,
        playbackType: 'none',
        activeItemId: null,
        currentTime: 0
      });
    }
  }

  public seek(seconds: number): void {
    if (this.audio && Number.isFinite(seconds)) {
      const clamped = Math.max(0, Math.min(seconds, this.audio.duration || seconds));
      this.audio.currentTime = clamped;
      this.updateState({ currentTime: clamped });
    }
  }

  public setSpeed(rate: number): void {
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
    this.updateState({ playbackRate: rate });
  }

  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = clamped;
    }
    this.updateState({ volume: clamped });
  }

  private async cacheAudioInBackground(url: string) {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    try {
      const cache = await caches.open(this.CACHE_NAME);
      const match = await cache.match(url);
      if (!match) {
        await cache.add(url);
      }
    } catch (e) {
      // Non-critical cache error, ignore
    }
  }
}

export const almatsuratAudioService = new AlMatsuratAudioService();

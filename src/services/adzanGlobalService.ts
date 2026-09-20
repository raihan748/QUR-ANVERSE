import { PrayerTime } from '../types';
import { calculatePrayerTimes, getSavedLocation } from './prayerTimeEngine';

export interface GlobalAdzanTriggerPayload {
  prayerName: string;
  timestamp: number;
}

class AdzanGlobalService {
  private checkInterval: any = null;
  private isAutoAdzanEnabled = true;

  constructor() {
    try {
      const saved = localStorage.getItem('quranverse_auto_adzan_enabled_v1');
      this.isAutoAdzanEnabled = saved !== 'false';
    } catch {
      this.isAutoAdzanEnabled = true;
    }
  }

  public isEnabled(): boolean {
    return this.isAutoAdzanEnabled;
  }

  public setEnabled(val: boolean): void {
    this.isAutoAdzanEnabled = val;
    try {
      localStorage.setItem('quranverse_auto_adzan_enabled_v1', val ? 'true' : 'false');
    } catch {}
  }

  /**
   * Start global 24/7 background checker (Runs every 3 seconds)
   * Resilient to browser background tab throttling with a 0-90s arrival tolerance window
   */
  public startDaemon(): void {
    if (this.checkInterval) return;

    // Check once immediately
    this.checkCurrentTimeAndTrigger();

    this.checkInterval = setInterval(() => {
      this.checkCurrentTimeAndTrigger();
    }, 3000);
  }

  public stopDaemon(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  public checkCurrentTimeAndTrigger(): PrayerTime | null {
    if (!this.isAutoAdzanEnabled) return null;

    try {
      const now = new Date();
      const times = calculatePrayerTimes(now, getSavedLocation());
      const nowMs = now.getTime();
      const todayStr = now.toDateString();

      for (const prayer of times) {
        const pDate = prayer.timeDate instanceof Date ? prayer.timeDate : new Date(prayer.timeDate);
        const diffMs = nowMs - pDate.getTime();
        const diffSec = diffMs / 1000;

        // 0 to 90 seconds tolerance window after prayer time has arrived
        if (diffSec >= 0 && diffSec <= 90) {
          const triggerKey = `qv_adzan_notified_${prayer.name}_${todayStr}_${pDate.getHours()}`;
          if (!sessionStorage.getItem(triggerKey)) {
            sessionStorage.setItem(triggerKey, 'true');

            // Dispatch global event for App.tsx FullscreenAdzan modal
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent<GlobalAdzanTriggerPayload>('qv_global_adzan_trigger', {
                  detail: {
                    prayerName: prayer.name,
                    timestamp: nowMs
                  }
                })
              );

              // Web / PWA Push Notification
              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(`Waktu Shalat ${prayer.name} Telah Tiba!`, {
                    body: `Lantunan Adzan: Syekh Muhammad Marwan Al-Qassas (Muadzin Masjid Nabawi Madinah).`,
                    icon: '/favicon.svg',
                    badge: '/icon-192.svg'
                  });
                } catch {}
              }
            }

            return prayer;
          }
        }
      }
    } catch (e) {
      console.warn('[AdzanGlobalService] Check error:', e);
    }
    return null;
  }

  public triggerManual(prayerName: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<GlobalAdzanTriggerPayload>('qv_global_adzan_trigger', {
          detail: {
            prayerName,
            timestamp: Date.now()
          }
        })
      );
    }
  }
}

export const adzanGlobalService = new AdzanGlobalService();

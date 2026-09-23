/**
 * AL-HUDA - Native Adzan Background Alarm & Notification Scheduler
 * Powered by Capacitor LocalNotifications for Android / iOS native execution.
 * 
 * Works when phone is idle, screen is locked (Doze mode), or app is closed.
 * Plays high-fidelity Adzan Madinah by Syekh Muhammad Marwan Al-Qassas from res/raw.
 * 
 * Zero-Regression Guarantee:
 * When running in standard web browser (desktop/laptop), this service gracefully 
 * falls back to adzanGlobalService without throwing errors.
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { calculatePrayerTimes, getSavedLocation } from './prayerTimeEngine';
import { adzanGlobalService } from './adzanGlobalService';

export const NATIVE_ADZAN_CHANNEL_ID = 'quranverse_adzan_v1';
export const NATIVE_ADZAN_SOUND = 'adzan_marwan_al_qassas.mp3';

// Unique base ID generator for prayer notifications (1 to 5 for prayers, day offset * 10)
const PRAYER_ID_MAP: Record<string, number> = {
  subuh: 1,
  dzuhur: 2,
  ashar: 3,
  maghrib: 4,
  isya: 5
};

class NativeAdzanScheduler {
  private isInitialized = false;

  public isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Initializes the native Android notification channel and registers action types.
   */
  public async initializeNativeAdzan(): Promise<boolean> {
    if (!this.isNative()) {
      return false;
    }

    try {
      // 1. Check and request permissions
      const permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display !== 'granted') {
        const reqStatus = await LocalNotifications.requestPermissions();
        if (reqStatus.display !== 'granted') {
          console.warn('[NativeAdzanScheduler] Notification permission not granted by user.');
        }
      }

      // 2. Create High-Priority Notification Channel on Android 8+
      await LocalNotifications.createChannel({
        id: NATIVE_ADZAN_CHANNEL_ID,
        name: 'Waktu Shalat & Lantunan Adzan Madinah',
        description: 'Memutar suara Adzan Syekh Muhammad Marwan Al-Qassas tepat pada waktu shalat tiba, bahkan saat HP idle/layar terkunci.',
        importance: 5, // High/Max - Heads-up popup banner and custom sound
        sound: NATIVE_ADZAN_SOUND, // Resolves from res/raw/adzan_marwan_al_qassas.mp3
        visibility: 1, // Public - visible on lock screen
        vibration: true,
        lights: true,
        lightColor: '#06331D'
      });

      this.isInitialized = true;

      // 3. Immediately schedule upcoming prayer adzans for the next 7 days
      await this.scheduleUpcomingPrayerAdzans(7);

      return true;
    } catch (err) {
      console.warn('[NativeAdzanScheduler] Initialization error:', err);
      return false;
    }
  }

  /**
   * Schedule all upcoming prayer times for the specified number of days ahead into Android AlarmManager.
   */
  public async scheduleUpcomingPrayerAdzans(daysAhead = 7): Promise<{ scheduledCount: number }> {
    if (!this.isNative()) {
      return { scheduledCount: 0 };
    }

    try {
      // Cancel previous scheduled prayer adzans to prevent duplicate alarm stacking
      const pending = await LocalNotifications.getPending();
      const prayerPending = pending.notifications.filter(
        (n) => n.extra?.isPrayerAdzan === true
      );

      if (prayerPending.length > 0) {
        await LocalNotifications.cancel({
          notifications: prayerPending.map((p) => ({ id: p.id }))
        });
      }

      const now = new Date();
      const nowMs = now.getTime();
      const location = getSavedLocation();
      const notificationsToSchedule: any[] = [];

      for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + dayOffset);

        const prayers = calculatePrayerTimes(targetDate, location);

        for (const prayer of prayers) {
          const prayerKey = prayer.id.toLowerCase();
          // We only schedule adzan for the 5 compulsory prayers
          if (!PRAYER_ID_MAP[prayerKey]) continue;

          const prayerDate = prayer.timeDate instanceof Date ? prayer.timeDate : new Date(prayer.timeDate);
          const pMs = prayerDate.getTime();

          // Only schedule future prayer times
          if (pMs > nowMs) {
            const numericId = 1000 + dayOffset * 10 + PRAYER_ID_MAP[prayerKey];

            notificationsToSchedule.push({
              id: numericId,
              title: `Waktu Shalat ${prayer.name} Telah Tiba!`,
              body: `Lantunan Adzan Madinah: Syekh Muhammad Marwan Al-Qassas (Muadzin Masjid Nabawi). Hayya 'alash-Shalah...`,
              channelId: NATIVE_ADZAN_CHANNEL_ID,
              sound: NATIVE_ADZAN_SOUND,
              schedule: {
                at: prayerDate,
                allowWhileIdle: true
              },
              extra: {
                isPrayerAdzan: true,
                prayerName: prayer.name,
                prayerId: prayer.id,
                scheduledTime: prayerDate.toISOString()
              },
              smallIcon: 'ic_stat_quranverse',
              iconColor: '#06331D',
              ongoing: false,
              autoCancel: true
            });
          }
        }
      }

      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({
          notifications: notificationsToSchedule
        });
        console.log(`[NativeAdzanScheduler] Successfully scheduled ${notificationsToSchedule.length} prayer adzans.`);
      }

      return { scheduledCount: notificationsToSchedule.length };
    } catch (err) {
      console.warn('[NativeAdzanScheduler] Scheduling error:', err);
      return { scheduledCount: 0 };
    }
  }

  /**
   * Test immediate Adzan playback & notification.
   * If on Native Android: triggers a high-priority notification 2 seconds from now with adzan sound.
   * If on Web Browser: invokes adzanGlobalService manual trigger with FullscreenAdzan modal and audio.
   */
  public async testAdzanNotificationNow(prayerName = 'Dzuhur (Uji Coba)'): Promise<boolean> {
    if (this.isNative()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 99999,
              title: `[UJI COBA] Waktu Shalat ${prayerName} Tiba!`,
              body: `Suara Adzan Madinah: Syekh Muhammad Marwan Al-Qassas (Masjid Nabawi). Berhasil aktif di latar belakang!`,
              channelId: NATIVE_ADZAN_CHANNEL_ID,
              sound: NATIVE_ADZAN_SOUND,
              schedule: {
                at: new Date(Date.now() + 2000), // 2 seconds from now
                allowWhileIdle: true
              },
              smallIcon: 'ic_stat_quranverse',
              iconColor: '#06331D',
              extra: {
                isTest: true
              }
            }
          ]
        });
        return true;
      } catch (err) {
        console.warn('[NativeAdzanScheduler] Native test notification failed:', err);
      }
    }

    // Fallback / Web mode: Trigger FullscreenAdzan & web audio
    adzanGlobalService.triggerManual(prayerName);
    return true;
  }

  /**
   * Get diagnostics info for UI banner display.
   */
  public async getDiagnostics(): Promise<{
    isNative: boolean;
    isInitialized: boolean;
    pendingAdzansCount: number;
  }> {
    if (!this.isNative()) {
      return {
        isNative: false,
        isInitialized: this.isInitialized,
        pendingAdzansCount: 0
      };
    }

    try {
      const pending = await LocalNotifications.getPending();
      const prayerCount = pending.notifications.filter((n) => n.extra?.isPrayerAdzan).length;
      return {
        isNative: true,
        isInitialized: this.isInitialized,
        pendingAdzansCount: prayerCount
      };
    } catch {
      return {
        isNative: true,
        isInitialized: this.isInitialized,
        pendingAdzansCount: 0
      };
    }
  }
}

export const nativeAdzanScheduler = new NativeAdzanScheduler();

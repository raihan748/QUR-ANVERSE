/**
 * ==============================================================================
 * QURANVERSE - PRAYER ATTENDANCE & 30-MIN POST-ADHAN JURNAL SERVICE
 * ==============================================================================
 * Mengelola absensi sholat 5 waktu, deteksi otonom 30 menit pasca-adzan,
 * sistem gamifikasi pahala/XP, dan pencatatan streak sholat harian santri.
 * Data persisten 100% tahan reload & anti-lupa (Multi-Tier Storage).
 * ==============================================================================
 */

import { PrayerTime, DailyPrayerAttendance, PrayerAttendanceStatus, PrayerRecordItem } from '../types';
import { safeJsonParse, safeJsonStringify } from './securityHardening';
import { getLocalDateString, calculatePrayerTimes, getSavedLocation } from './prayerTimeEngine';

const STORAGE_KEYS = {
  ATTENDANCE_HISTORY: 'qv_prayer_attendance_history_v1',
  TODAY_ATTENDANCE: 'qv_prayer_attendance_today_v1',
  SNOOZE_TIMESTAMP: 'qv_prayer_snooze_dismiss_v1'
};

export const PRAYER_XP_REWARDS: Record<PrayerAttendanceStatus, number> = {
  jamaah_masjid: 50, // 27 Derajat Pahala Berjamaah di Masjid
  tepat_waktu: 30,   // Amalan Paling Dicintai Allah di Awal Waktu
  munfarid: 20,      // Menunaikan Kewajiban Fardhu
  belum: 0
};

export const FARDHU_PRAYER_IDS: Array<'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya'> = [
  'subuh',
  'dzuhur',
  'ashar',
  'maghrib',
  'isya'
];

export const PRAYER_DISPLAY_META: Record<string, { name: string; arabic: string; icon: string }> = {
  subuh: { name: 'Subuh', arabic: 'الفجر', icon: 'sunrise' },
  dzuhur: { name: 'Dzuhur', arabic: 'الظهر', icon: 'sun' },
  ashar: { name: 'Ashar', arabic: 'العصر', icon: 'cloud-sun' },
  maghrib: { name: 'Maghrib', arabic: 'المغرب', icon: 'sunset' },
  isya: { name: 'Isya', arabic: 'العشاء', icon: 'moon' }
};

export class PrayerAttendanceService {
  private static instance: PrayerAttendanceService;
  private inMemoryCache: Record<string, DailyPrayerAttendance> = {};

  public static getInstance(): PrayerAttendanceService {
    if (!PrayerAttendanceService.instance) {
      PrayerAttendanceService.instance = new PrayerAttendanceService();
    }
    return PrayerAttendanceService.instance;
  }

  public getTodayDateString(): string {
    return getLocalDateString(new Date());
  }

  /**
   * Broadcasts attendance changes to all UI subscribers via CustomEvent
   */
  public notifyUpdate(data: DailyPrayerAttendance): void {
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('qv_prayer_attendance_updated', {
            detail: {
              ...data,
              records: { ...data.records }
            }
          })
        );
      } catch {}
    }
  }

  /**
   * Mengambil riwayat absensi sholat untuk hari ini (Selalu mengembalikan objek fresh/cloned)
   */
  public getTodayAttendance(): DailyPrayerAttendance {
    const today = this.getTodayDateString();

    let result: DailyPrayerAttendance | null = null;

    // 1. Cek dedicated today storage key
    try {
      const todayRaw = localStorage.getItem(STORAGE_KEYS.TODAY_ATTENDANCE);
      if (todayRaw) {
        const parsedToday = safeJsonParse<DailyPrayerAttendance | null>(todayRaw, null);
        if (parsedToday && parsedToday.date === today && parsedToday.records) {
          result = {
            ...parsedToday,
            records: { ...parsedToday.records }
          };
        }
      }
    } catch {}

    // 2. Cek in-memory cache
    if (!result && this.inMemoryCache[today]) {
      result = {
        ...this.inMemoryCache[today],
        records: { ...this.inMemoryCache[today].records }
      };
    }

    // 3. Cek master history storage
    if (!result) {
      try {
        const history = this.getAllHistory();
        if (history[today] && history[today].records) {
          result = {
            ...history[today],
            records: { ...history[today].records }
          };
        }
      } catch {}
    }

    // 4. Default template jika belum ada absensi untuk hari ini
    if (!result) {
      result = {
        date: today,
        records: {},
        completedCount: 0,
        totalXpEarned: 0
      };
    }

    // 5. AUTO-HEAL: Rekonsiliasi dengan hard failsafe backup per-prayer keys (qv_attended_${today}_${pId})
    for (const pId of FARDHU_PRAYER_IDS) {
      if (!result.records[pId]) {
        try {
          const rawFailsafe = localStorage.getItem(`qv_attended_${today}_${pId}`);
          if (rawFailsafe) {
            const parsed = safeJsonParse<PrayerRecordItem | null>(rawFailsafe, null);
            if (parsed && parsed.status) {
              result.records[pId] = parsed;
            }
          }
        } catch {}
      }
    }

    // Hitung ulang total selesai & total XP
    let count = 0;
    let totalXp = 0;
    FARDHU_PRAYER_IDS.forEach((id) => {
      const rec = result!.records[id];
      if (rec && rec.status && rec.status !== 'belum') {
        count++;
        totalXp += (rec.xpAwarded || PRAYER_XP_REWARDS[rec.status] || 0);
      }
    });
    result.completedCount = count;
    result.totalXpEarned = totalXp;

    // Simpan ke cache internal
    this.inMemoryCache[today] = {
      ...result,
      records: { ...result.records }
    };

    return {
      ...result,
      records: { ...result.records }
    };
  }

  /**
   * Menyimpan data absensi hari ini ke seluruh layer persistensi (Memory + Today Storage + History Storage + Failsafe)
   */
  public saveTodayAttendance(attendance: DailyPrayerAttendance): void {
    try {
      const cloned: DailyPrayerAttendance = {
        ...attendance,
        records: { ...attendance.records }
      };

      this.inMemoryCache[cloned.date] = cloned;

      // 1. Simpan ke Today Storage Key
      localStorage.setItem(STORAGE_KEYS.TODAY_ATTENDANCE, safeJsonStringify(cloned));

      // 2. Simpan ke Master History Ledger
      const history = this.getAllHistory();
      history[cloned.date] = cloned;
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE_HISTORY, safeJsonStringify(history));

      // 3. Simpan per-prayer hard failsafe keys
      for (const pId of FARDHU_PRAYER_IDS) {
        const rec = cloned.records[pId];
        if (rec) {
          localStorage.setItem(`qv_attended_${cloned.date}_${pId}`, safeJsonStringify(rec));
        } else {
          localStorage.removeItem(`qv_attended_${cloned.date}_${pId}`);
        }
      }

      // 4. Siarkan event ke UI
      this.notifyUpdate(cloned);
    } catch (e) {
      console.warn('Gagal menyimpan riwayat absensi sholat:', e);
    }
  }

  public getAllHistory(): Record<string, DailyPrayerAttendance> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE_HISTORY);
      if (raw) {
        return safeJsonParse<Record<string, DailyPrayerAttendance>>(raw, {});
      }
    } catch {}
    return {};
  }

  /**
   * Mencatat kehadiran sholat (Subuh, Dzuhur, Ashar, Maghrib, Isya)
   */
  public recordPrayer(
    prayerId: 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya',
    status: PrayerAttendanceStatus
  ): { attendance: DailyPrayerAttendance; xpGained: number; diffXp: number } {
    const today = this.getTodayDateString();
    const todayData = this.getTodayAttendance();
    const oldRecord = todayData.records[prayerId];
    const oldXp = oldRecord ? (oldRecord.xpAwarded || 0) : 0;
    const newXp = PRAYER_XP_REWARDS[status] || 0;
    const diffXp = newXp - oldXp;

    const newRecord: PrayerRecordItem = {
      status,
      timestamp: new Date().toISOString(),
      xpAwarded: newXp
    };

    todayData.records[prayerId] = newRecord;

    // Hitung ulang total selesai & total XP hari ini
    let completedCount = 0;
    let totalXp = 0;

    FARDHU_PRAYER_IDS.forEach((id) => {
      const rec = todayData.records[id];
      if (rec && rec.status && rec.status !== 'belum') {
        completedCount++;
        totalXp += (rec.xpAwarded || PRAYER_XP_REWARDS[rec.status] || 0);
      }
    });

    todayData.completedCount = completedCount;
    todayData.totalXpEarned = totalXp;

    // Matikan pengingat pop-up 24 jam untuk sholat ini karena sudah diabsen oleh pengguna!
    this.dismissPopupForNow(prayerId, 24 * 60);

    this.saveTodayAttendance(todayData);

    const freshCopy: DailyPrayerAttendance = {
      ...todayData,
      records: { ...todayData.records }
    };

    return {
      attendance: freshCopy,
      xpGained: newXp,
      diffXp
    };
  }

  /**
   * Mengambil data kamus snooze saat ini dari LocalStorage
   */
  public getSnoozeStore(): { generalUntil?: number; prayers: Record<string, number> } {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SNOOZE_TIMESTAMP);
      if (raw) {
        const parsed = safeJsonParse<any>(raw, null);
        if (parsed) {
          if (parsed.prayers && typeof parsed.prayers === 'object') {
            return {
              generalUntil: Number(parsed.generalUntil) || 0,
              prayers: parsed.prayers
            };
          }
          const prayers: Record<string, number> = {};
          if (parsed.prayerId && parsed.until) {
            prayers[parsed.prayerId] = Number(parsed.until);
          }
          return {
            generalUntil: !parsed.prayerId && parsed.until ? Number(parsed.until) : 0,
            prayers
          };
        }
      }
    } catch {}
    return { prayers: {} };
  }

  /**
   * Menyimpan kamus snooze ke LocalStorage
   */
  public saveSnoozeStore(store: { generalUntil?: number; prayers: Record<string, number> }): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SNOOZE_TIMESTAMP, safeJsonStringify(store));
    } catch {}
  }

  /**
   * Menyetel general cooldown global agar pop-up absensi sholat tidak muncul dalam kurun waktu tertentu
   */
  public setGeneralCooldown(minutes: number = 30): void {
    const store = this.getSnoozeStore();
    store.generalUntil = Date.now() + minutes * 60 * 1000;
    this.saveSnoozeStore(store);
  }

  /**
   * Menunda / Snooze Pop-up agar tidak mengganggu terus-menerus
   */
  public dismissPopupForNow(prayerId?: string, snoozeMinutes: number = 60): void {
    try {
      const store = this.getSnoozeStore();
      const until = Date.now() + snoozeMinutes * 60 * 1000;
      if (prayerId) {
        store.prayers[prayerId] = until;
      } else {
        store.generalUntil = until;
      }
      this.saveSnoozeStore(store);
    } catch {}
  }

  /**
   * Memeriksa apakah Pop-up Absensi 30 Menit Pasca-Adzan perlu ditampilkan
   * (Anti-Lupa: Jika pengguna sudah mengisi/menandai, TIDAK AKAN mengulang pop-up)
   */
  public checkShouldShow30MinPopup(prayerTimes: PrayerTime[]): {
    shouldShow: boolean;
    duePrayer: PrayerTime | null;
    minutesPassed: number;
    reason?: string;
  } {
    const now = new Date();
    const nowMs = now.getTime();

    // 1. Cek general cooldown global
    const snoozeStore = this.getSnoozeStore();
    if (snoozeStore.generalUntil && nowMs < snoozeStore.generalUntil) {
      return { shouldShow: false, duePrayer: null, minutesPassed: 0 };
    }

    const todayAttendance = this.getTodayAttendance();

    // Filter hanya 5 sholat fardhu
    const fardhuPrayers = prayerTimes.filter((p) =>
      FARDHU_PRAYER_IDS.includes(p.id as any)
    );

    // Cari sholat yang sudah masuk waktu >= 30 menit yang lalu dan belum diabsen sama sekali
    for (let i = 0; i < fardhuPrayers.length; i++) {
      const p = fardhuPrayers[i];
      
      // 2. Cek apakah sholat ini sudah diabsen hari ini
      // PENTING: Jika pengguna SUDAH mengisi absensi (baik sudah sholat ataupun menandai belum),
      // JANGAN munculkan pop-up lagi! Pilihan pengguna wajib dihormati dan diingat!
      const record = todayAttendance.records[p.id as 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya'];
      if (record && record.status) {
        continue;
      }

      // 3. Periksa apakah pengguna sedang men-snooze pop-up untuk sholat spesifik ini
      const prayerSnoozeUntil = snoozeStore.prayers[p.id] || 0;
      if (nowMs < prayerSnoozeUntil) {
        continue;
      }

      // 4. Parse waktu sholat secara aman
      let pTime: Date;
      if (p.timeDate instanceof Date && !isNaN(p.timeDate.getTime())) {
        pTime = p.timeDate;
      } else {
        const [hStr, mStr] = (p.timeStr || '00:00').split(':');
        pTime = new Date();
        pTime.setHours(Number(hStr) || 0, Number(mStr) || 0, 0, 0);
      }

      // Hitung selisih menit sejak adzan berkumandang
      const diffMs = nowMs - pTime.getTime();
      const diffMinutes = Math.floor(diffMs / (60 * 1000));

      // Jika waktu adzan sudah lewat minimal 30 menit
      if (diffMinutes >= 30) {
        const nextPrayer = fardhuPrayers[i + 1];
        let isStillInWindow = false;

        if (nextPrayer) {
          let nextTime: Date;
          if (nextPrayer.timeDate instanceof Date && !isNaN(nextPrayer.timeDate.getTime())) {
            nextTime = nextPrayer.timeDate;
          } else {
            const [nhStr, nmStr] = (nextPrayer.timeStr || '00:00').split(':');
            nextTime = new Date();
            nextTime.setHours(Number(nhStr) || 0, Number(nmStr) || 0, 0, 0);
          }
          isStillInWindow = nowMs < nextTime.getTime();
        } else {
          // KHUSUS ISYA: Jendela berlaku maksimal 180 menit dan wajib hari yang sama
          const isSameDay = now.getDate() === pTime.getDate() && now.getMonth() === pTime.getMonth();
          isStillInWindow = isSameDay && diffMinutes <= 180;
        }

        if (isStillInWindow) {
          return {
            shouldShow: true,
            duePrayer: p,
            minutesPassed: diffMinutes,
            reason: `Sudah ${diffMinutes} menit sejak adzan ${p.name} berkumandang.`
          };
        }
      }
    }

    return { shouldShow: false, duePrayer: null, minutesPassed: 0 };
  }

  /**
   * Menghitung Streak Sholat 5 Waktu (Hari berturut-turut dengan >= 4 sholat terlaksana)
   */
  public getPrayerStreak(): number {
    const history = this.getAllHistory();
    const today = this.getTodayDateString();
    let streak = 0;

    const todayData = history[today];
    if (todayData && todayData.completedCount >= 4) {
      streak++;
    }

    const checkDate = new Date();
    // Periksa hingga 60 hari ke belakang
    for (let dayOffset = 1; dayOffset <= 60; dayOffset++) {
      checkDate.setDate(checkDate.getDate() - 1);
      const dateStr = getLocalDateString(checkDate);

      const dayData = history[dateStr];
      if (dayData && dayData.completedCount >= 4) {
        streak++;
      } else {
        break;
      }
    }

    return Math.max(streak, 1);
  }

  /**
   * Mengambil statistik ringkas untuk ditampilkan di dashboard dan banner
   */
  public getSummaryStats(): {
    todayCompleted: number;
    todayTotal: number;
    todayXp: number;
    streakDays: number;
    percentage: number;
  } {
    const todayData = this.getTodayAttendance();
    const completed = todayData.completedCount || 0;
    const percentage = Math.round((completed / 5) * 100);

    return {
      todayCompleted: completed,
      todayTotal: 5,
      todayXp: todayData.totalXpEarned || 0,
      streakDays: this.getPrayerStreak(),
      percentage
    };
  }

  /**
   * Mendapatkan waktu sholat hari ini untuk keperluan display jadwal di absensi
   */
  public getPrayerScheduleTime(prayerId: string, prayerTimesList: PrayerTime[] = []): string {
    const found = prayerTimesList.find((p) => p.id === prayerId);
    if (found && found.timeStr) {
      return found.timeStr;
    }

    // Jika belum ada di list, hitung langsung dari engine lokasi aktif
    try {
      const times = calculatePrayerTimes(new Date(), getSavedLocation());
      const matched = times.find((p) => p.id === prayerId);
      if (matched && matched.timeStr) {
        return matched.timeStr;
      }
    } catch {}

    return '--:--';
  }
}

export const prayerAttendance = PrayerAttendanceService.getInstance();

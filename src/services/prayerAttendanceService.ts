/**
 * ==============================================================================
 * QURANVERSE - PRAYER ATTENDANCE & 30-MIN POST-ADHAN JURNAL SERVICE
 * ==============================================================================
 * Mengelola absensi sholat 5 waktu, deteksi otonom 30 menit pasca-adzan,
 * sistem gamifikasi pahala/XP, dan pencatatan streak sholat harian santri.
 * ==============================================================================
 */

import { PrayerTime, DailyPrayerAttendance, PrayerAttendanceStatus, PrayerRecordItem } from '../types';
import { safeJsonParse, safeJsonStringify } from './securityHardening';

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

export const PRAYER_DISPLAY_META: Record<string, { name: string; arabic: string; icon: string; defaultTime: string }> = {
  subuh: { name: 'Subuh', arabic: 'الفجر', icon: '🌅', defaultTime: '04:46' },
  dzuhur: { name: 'Dzuhur', arabic: 'الظهر', icon: '☀️', defaultTime: '12:04' },
  ashar: { name: 'Ashar', arabic: 'العصر', icon: '🌤️', defaultTime: '15:22' },
  maghrib: { name: 'Maghrib', arabic: 'المغرب', icon: '🌇', defaultTime: '18:04' },
  isya: { name: 'Isya', arabic: 'العشاء', icon: '🌙', defaultTime: '19:14' }
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
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Broadcasts attendance changes to all UI subscribers via CustomEvent
   */
  public notifyUpdate(data: DailyPrayerAttendance): void {
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('qv_prayer_attendance_updated', { detail: data }));
      } catch {}
    }
  }

  /**
   * Mengambil riwayat absensi sholat untuk hari ini dengan multi-tier fallback (Memory -> Today Key -> History Key -> Hard Failsafe Keys)
   */
  public getTodayAttendance(): DailyPrayerAttendance {
    const today = this.getTodayDateString();

    let result: DailyPrayerAttendance | null = null;

    // 1. Check in-memory cache first
    if (this.inMemoryCache[today]) {
      result = this.inMemoryCache[today];
    }

    // 2. Check dedicated today storage key
    if (!result) {
      try {
        const todayRaw = localStorage.getItem(STORAGE_KEYS.TODAY_ATTENDANCE);
        if (todayRaw) {
          const parsedToday = safeJsonParse<DailyPrayerAttendance | null>(todayRaw, null);
          if (parsedToday && parsedToday.date === today) {
            result = parsedToday;
          }
        }
      } catch {}
    }

    // 3. Check full history storage
    if (!result) {
      const history = this.getAllHistory();
      if (history[today]) {
        result = history[today];
      }
    }

    // 4. Default template untuk hari baru jika belum ada
    if (!result) {
      result = {
        date: today,
        records: {},
        completedCount: 0,
        totalXpEarned: 0
      };
    }

    // 5. AUTO-HEAL: Rekonsiliasi dengan hard failsafe backup per-prayer keys (qv_attended_${today}_${pId})
    let healed = false;
    for (const pId of FARDHU_PRAYER_IDS) {
      if (!result.records[pId]) {
        try {
          const rawFailsafe = localStorage.getItem(`qv_attended_${today}_${pId}`);
          if (rawFailsafe) {
            const parsed = safeJsonParse<PrayerRecordItem | null>(rawFailsafe, null);
            if (parsed && parsed.status) {
              result.records[pId] = parsed;
              healed = true;
            }
          }
        } catch {}
      }
    }

    // Hitung ulang count dan total XP jika terjadi pemulihan auto-heal
    if (healed) {
      let count = 0;
      let totalXp = 0;
      FARDHU_PRAYER_IDS.forEach((id) => {
        const rec = result!.records[id];
        if (rec && rec.status !== 'belum') {
          count++;
          totalXp += rec.xpAwarded;
        }
      });
      result.completedCount = count;
      result.totalXpEarned = totalXp;
    }

    this.inMemoryCache[today] = result;
    return result;
  }

  /**
   * Menyimpan data absensi hari ini ke seluruh layer persistensi (Memory + Today Storage + History Storage)
   */
  public saveTodayAttendance(attendance: DailyPrayerAttendance): void {
    try {
      this.inMemoryCache[attendance.date] = attendance;

      // Save to dedicated today key
      localStorage.setItem(STORAGE_KEYS.TODAY_ATTENDANCE, safeJsonStringify(attendance));

      // Save to master history ledger
      const history = this.getAllHistory();
      history[attendance.date] = attendance;
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE_HISTORY, safeJsonStringify(history));

      // Broadcast update to all components
      this.notifyUpdate(attendance);
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
    const oldXp = oldRecord ? oldRecord.xpAwarded : 0;
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
      if (rec && rec.status !== 'belum') {
        completedCount++;
        totalXp += rec.xpAwarded;
      }
    });

    todayData.completedCount = completedCount;
    todayData.totalXpEarned = totalXp;

    // Simpan ke hard failsafe lock key per-sholat agar tidak mungkin terlupakan!
    try {
      localStorage.setItem(`qv_attended_${today}_${prayerId}`, safeJsonStringify(newRecord));
    } catch {}

    // Auto-dismiss reminder:
    // - Jika sholat sudah terlaksana ('jamaah_masjid', 'tepat_waktu', 'munfarid') -> matikan pop-up 24 jam!
    // - Jika santri menandai "belum" -> tunda pop-up 60 menit agar tidak mengganggu setiap 30 detik!
    if (status !== 'belum') {
      this.dismissPopupForNow(prayerId, 24 * 60);
    } else {
      this.dismissPopupForNow(prayerId, 60);
    }

    this.saveTodayAttendance(todayData);

    return {
      attendance: todayData,
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
          // Dukungan kompatibilitas mundur format skalar lama { prayerId, until }
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
  public setGeneralCooldown(minutes: number = 15): void {
    const store = this.getSnoozeStore();
    store.generalUntil = Date.now() + minutes * 60 * 1000;
    this.saveSnoozeStore(store);
  }

  /**
   * Menunda / Snooze Pop-up agar tidak mengganggu terus-menerus (Mendukung Multi-Prayer Dictionary)
   */
  public dismissPopupForNow(prayerId?: string, snoozeMinutes: number = 30): void {
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
   */
  public checkShouldShow30MinPopup(prayerTimes: PrayerTime[]): {
    shouldShow: boolean;
    duePrayer: PrayerTime | null;
    minutesPassed: number;
    reason?: string;
  } {
    const now = new Date();
    const nowMs = now.getTime();

    // 1. Cek general cooldown global (misal: modal baru saja ditutup pengguna)
    const snoozeStore = this.getSnoozeStore();
    if (snoozeStore.generalUntil && nowMs < snoozeStore.generalUntil) {
      return { shouldShow: false, duePrayer: null, minutesPassed: 0 };
    }

    const todayAttendance = this.getTodayAttendance();

    // Filter hanya 5 sholat fardhu
    const fardhuPrayers = prayerTimes.filter((p) =>
      FARDHU_PRAYER_IDS.includes(p.id as any)
    );

    // Cari sholat yang sudah masuk waktu >= 30 menit yang lalu dan belum diabsen
    for (let i = 0; i < fardhuPrayers.length; i++) {
      const p = fardhuPrayers[i];
      
      // 2. Cek apakah sholat ini sudah diabsen selesai hari ini ('jamaah_masjid' | 'tepat_waktu' | 'munfarid')
      const record = todayAttendance.records[p.id as 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya'];
      const isCompleted = record && record.status !== 'belum';
      if (isCompleted) {
        continue;
      }

      // 3. Periksa apakah pengguna sedang men-snooze pop-up untuk sholat spesifik ini
      const prayerSnoozeUntil = snoozeStore.prayers[p.id] || 0;
      if (nowMs < prayerSnoozeUntil) {
        continue; // Di-snooze, lewati sholat ini
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
          // Untuk Subuh, Dzuhur, Ashar, Maghrib: jendela berlaku hingga waktu sholat fardhu berikutnya
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
          // KHUSUS ISYA (i === 4):
          // Jendela post-adhan hanya berlaku maksimal 180 menit (3 jam) setelah adzan Isya,
          // DAN wajib pada hari yang sama sebelum tengah malam (23:59:59).
          // Tidak boleh terus-menerus muncul saat larut malam (00:00 - Subuh)!
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

    const checkDate = new Date();

    // Jika hari ini belum lengkap, mulai hitung dari kemarin atau hari ini jika sudah >= 4
    const todayData = history[today];
    if (todayData && todayData.completedCount >= 4) {
      streak++;
    }

    // Periksa hari-hari sebelumnya
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const y = checkDate.getFullYear();
      const m = String(checkDate.getMonth() + 1).padStart(2, '0');
      const d = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

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
   * Mengambil statistik ringkas untuk ditampilkan di dashboard
   */
  public getSummaryStats(): {
    todayCompleted: number;
    todayTotal: number;
    todayXp: number;
    streakDays: number;
    percentage: number;
  } {
    const todayData = this.getTodayAttendance();
    const completed = todayData.completedCount;
    const percentage = Math.round((completed / 5) * 100);

    return {
      todayCompleted: completed,
      todayTotal: 5,
      todayXp: todayData.totalXpEarned,
      streakDays: this.getPrayerStreak(),
      percentage
    };
  }
}

export const prayerAttendance = PrayerAttendanceService.getInstance();

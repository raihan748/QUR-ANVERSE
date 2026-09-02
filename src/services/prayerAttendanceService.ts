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
   * Mengambil riwayat absensi sholat untuk hari ini
   */
  public getTodayAttendance(): DailyPrayerAttendance {
    const today = this.getTodayDateString();
    const history = this.getAllHistory();

    if (history[today]) {
      return history[today];
    }

    // Default template untuk hari baru
    const initial: DailyPrayerAttendance = {
      date: today,
      records: {},
      completedCount: 0,
      totalXpEarned: 0
    };

    return initial;
  }

  /**
   * Menyimpan data absensi hari ini ke localStorage
   */
  public saveTodayAttendance(attendance: DailyPrayerAttendance): void {
    try {
      const history = this.getAllHistory();
      history[attendance.date] = attendance;
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE_HISTORY, safeJsonStringify(history));
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

    this.saveTodayAttendance(todayData);

    return {
      attendance: todayData,
      xpGained: newXp,
      diffXp
    };
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
    const todayAttendance = this.getTodayAttendance();

    // Periksa apakah pengguna sedang men-snooze pop-up
    try {
      const snoozeRaw = localStorage.getItem(STORAGE_KEYS.SNOOZE_TIMESTAMP);
      if (snoozeRaw) {
        const snoozeData = safeJsonParse<{ prayerId: string; until: number } | null>(snoozeRaw, null);
        if (snoozeData && now.getTime() < snoozeData.until) {
          return { shouldShow: false, duePrayer: null, minutesPassed: 0 };
        }
      }
    } catch {}

    // Filter hanya 5 sholat fardhu
    const fardhuPrayers = prayerTimes.filter((p) =>
      FARDHU_PRAYER_IDS.includes(p.id as any)
    );

    // Cari sholat yang sudah masuk waktu >= 30 menit yang lalu dan belum diabsen
    for (let i = 0; i < fardhuPrayers.length; i++) {
      const p = fardhuPrayers[i];
      const pTime = new Date(p.timeDate);

      // Hitung selisih menit sejak adzan berkumandang
      const diffMs = now.getTime() - pTime.getTime();
      const diffMinutes = Math.floor(diffMs / (60 * 1000));

      // Jika waktu adzan sudah lewat minimal 30 menit
      if (diffMinutes >= 30) {
        const nextPrayer = fardhuPrayers[i + 1];
        const isStillInWindow = !nextPrayer || now.getTime() < new Date(nextPrayer.timeDate).getTime();

        // Pastikan masih dalam jendela sholat tersebut dan belum diabsen hari ini
        const record = todayAttendance.records[p.id as 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya'];
        const isAlreadyAttended = record && record.status !== 'belum';

        if (isStillInWindow && !isAlreadyAttended) {
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
   * Menunda / Snooze Pop-up agar tidak mengganggu terus-menerus
   */
  public dismissPopupForNow(prayerId: string, snoozeMinutes: number = 15): void {
    try {
      const until = Date.now() + snoozeMinutes * 60 * 1000;
      localStorage.setItem(
        STORAGE_KEYS.SNOOZE_TIMESTAMP,
        safeJsonStringify({ prayerId, until })
      );
    } catch {}
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

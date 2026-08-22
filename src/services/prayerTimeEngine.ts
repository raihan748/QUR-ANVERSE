// Prayer Times Calculation Engine - Makassar, Sulawesi Selatan (WITA / UTC+8)

import { PrayerTime } from '../types';

export const MAKASSAR_COORDS = {
  city: 'Makassar, Sulawesi Selatan',
  latitude: -5.1477,
  longitude: 119.4327,
  timezone: 8 // WITA
};

// Accurate Astronomical Calculation for Prayer Times (MABIMS / Kemenag RI standard)
export function calculatePrayerTimes(date: Date = new Date()): PrayerTime[] {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Julian Day
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  const d = jd - 2451545.0;
  const g = 357.529 + 0.98560028 * d;
  const q = 280.459 + 0.98564736 * d;
  const L = q + 1.915 * Math.sin((g * Math.PI) / 180) + 0.020 * Math.sin((2 * g * Math.PI) / 180);

  const e = 23.439 - 0.00000036 * d;
  const RA = (Math.atan2(Math.cos((e * Math.PI) / 180) * Math.sin((L * Math.PI) / 180), Math.cos((L * Math.PI) / 180)) * 180) / Math.PI;
  const dec = (Math.asin(Math.sin((e * Math.PI) / 180) * Math.sin((L * Math.PI) / 180)) * 180) / Math.PI;

  const EqT = (q / 15 - RA / 15 + 24) % 24;

  const latRad = (MAKASSAR_COORDS.latitude * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;

  // Dhuhr (Midday)
  const dhuhrDecimal = 12 + MAKASSAR_COORDS.timezone - MAKASSAR_COORDS.longitude / 15 - EqT;

  // Fajr (Subuh) - 20 degrees angle
  const fajrAngle = 20;
  const fajrCos = (Math.sin((-fajrAngle * Math.PI) / 180) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
  const fajrHourAngle = (Math.acos(Math.max(-1, Math.min(1, fajrCos))) * 180) / Math.PI / 15;
  const subuhDecimal = dhuhrDecimal - fajrHourAngle;

  // Sunrise (Terbit) - 0.833 degrees
  const sunriseCos = (Math.sin((-0.833 * Math.PI) / 180) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
  const sunriseHourAngle = (Math.acos(Math.max(-1, Math.min(1, sunriseCos))) * 180) / Math.PI / 15;
  const terbitDecimal = dhuhrDecimal - sunriseHourAngle;

  // Asr - Standard Shafi'i (Shadow length = 1)
  const asrAlt = (Math.atan(1 + Math.tan(Math.abs(latRad - decRad))) * 180) / Math.PI;
  const asrCos = (Math.sin(((90 - asrAlt) * Math.PI) / 180) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
  const asrHourAngle = (Math.acos(Math.max(-1, Math.min(1, asrCos))) * 180) / Math.PI / 15;
  const asharDecimal = dhuhrDecimal + asrHourAngle;

  // Maghrib - Sunset
  const maghribDecimal = dhuhrDecimal + sunriseHourAngle;

  // Isha - 18 degrees angle
  const ishaAngle = 18;
  const ishaCos = (Math.sin((-ishaAngle * Math.PI) / 180) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
  const ishaHourAngle = (Math.acos(Math.max(-1, Math.min(1, ishaCos))) * 180) / Math.PI / 15;
  const isyaDecimal = dhuhrDecimal + ishaHourAngle;

  // Helper to convert decimal hours to Date object and "HH:MM" string
  const formatTime = (decHour: number) => {
    // Add 2-minute ihtiyat (safety margin) standard Kemenag
    const totalMinutes = Math.round(decHour * 60) + 2;
    const hours = Math.floor((totalMinutes / 60) % 24);
    const minutes = Math.floor(totalMinutes % 60);

    const dObj = new Date(date);
    dObj.setHours(hours, minutes, 0, 0);

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return { str: `${hh}:${mm}`, dateObj: dObj };
  };

  const timesRaw = [
    { id: 'subuh', name: 'Subuh', arabicName: 'الفجر', ...formatTime(subuhDecimal) },
    { id: 'terbit', name: 'Terbit', arabicName: 'الشروق', ...formatTime(terbitDecimal) },
    { id: 'dzuhur', name: 'Dzuhur', arabicName: 'الظهر', ...formatTime(dhuhrDecimal) },
    { id: 'ashar', name: 'Ashar', arabicName: 'العصر', ...formatTime(asharDecimal) },
    { id: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', ...formatTime(maghribDecimal) },
    { id: 'isya', name: 'Isya', arabicName: 'العشاء', ...formatTime(isyaDecimal) },
  ];

  const now = new Date();
  let foundNext = false;

  const result: PrayerTime[] = timesRaw.map((t) => {
    const isPassed = now > t.dateObj;
    let isNext = false;

    if (!isPassed && !foundNext && t.id !== 'terbit') {
      isNext = true;
      foundNext = true;
    }

    return {
      id: t.id as any,
      name: t.name,
      arabicName: t.arabicName,
      timeStr: t.str,
      timeDate: t.dateObj,
      isPassed,
      isNext
    };
  });

  // If all prayers today have passed, Subuh tomorrow is next
  if (!foundNext) {
    const subuhItem = result.find(r => r.id === 'subuh');
    if (subuhItem) subuhItem.isNext = true;
  }

  return result;
}

// Get Seconds Until Next Prayer
export function getCountdownToNextPrayer(prayerTimes: PrayerTime[]): {
  nextPrayer: PrayerTime | null;
  secondsRemaining: number;
  formattedCountdown: string;
  isWithin10Minutes: boolean;
} {
  const nextPrayer = prayerTimes.find(p => p.isNext) || prayerTimes[0];
  if (!nextPrayer) {
    return { nextPrayer: null, secondsRemaining: 0, formattedCountdown: '00:00:00', isWithin10Minutes: false };
  }

  const now = new Date();
  let targetTime = new Date(nextPrayer.timeDate);

  // If time has passed today, target is tomorrow
  if (targetTime.getTime() < now.getTime()) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const diffMs = targetTime.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return {
    nextPrayer,
    secondsRemaining: totalSeconds,
    formattedCountdown: `${hh}:${mm}:${ss}`,
    isWithin10Minutes: totalSeconds > 0 && totalSeconds <= 600
  };
}

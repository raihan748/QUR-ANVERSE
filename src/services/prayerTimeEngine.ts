// Prayer Times Calculation Engine - Makassar, Sulawesi Selatan (WITA / UTC+8)
// Standar Kemenag RI / MABIMS dengan koreksi astronomis presisi

import { PrayerTime } from '../types';

export const MAKASSAR_COORDS = {
  city: 'Makassar, Sulawesi Selatan',
  latitude: -5.1477,
  longitude: 119.4327,
  timezone: 8 // WITA (UTC+8)
};

// Precise Solar Calculations for Makassar, Indonesia
export function calculatePrayerTimes(baseDate: Date = new Date()): PrayerTime[] {
  const date = new Date(baseDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Day of year calculation
  const startOfYear = new Date(year, 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Approximate Solar Declination (Delta in degrees)
  const delta = 23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
  const deltaRad = (delta * Math.PI) / 180;
  const latRad = (MAKASSAR_COORDS.latitude * Math.PI) / 180;

  // Equation of time in minutes
  const b = ((360 / 365) * (dayOfYear - 81) * Math.PI) / 180;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

  // Solar Transit / Midday (Dzuhur) in Makassar Local Time
  // Makassar is at 119.4327° E. Standard WITA meridian is 120° E.
  // Longitudinal correction = (120 - 119.4327) * 4 minutes = +2.269 minutes
  const longitudeCorrection = (15 * MAKASSAR_COORDS.timezone - MAKASSAR_COORDS.longitude) * 4;
  const dzuhurMinutes = 12 * 60 + longitudeCorrection - eot + 3; // +3 min ihtiyat Kemenag

  // Hour angle calculation helper for altitude alpha (in degrees)
  const getHourAngleMinutes = (alphaDeg: number): number => {
    const alphaRad = (alphaDeg * Math.PI) / 180;
    const cosHA =
      (Math.sin(alphaRad) - Math.sin(latRad) * Math.sin(deltaRad)) /
      (Math.cos(latRad) * Math.cos(deltaRad));
    const clampedCosHA = Math.max(-1, Math.min(1, cosHA));
    const haDeg = (Math.acos(clampedCosHA) * 180) / Math.PI;
    return (haDeg / 15) * 60; // convert degrees to minutes
  };

  // Subuh (Fajr): Solar angle -20° (Kemenag standard)
  const subuhHA = getHourAngleMinutes(-20);
  const subuhMinutes = dzuhurMinutes - subuhHA + 2;

  // Syuruq (Terbit): Solar angle -0.833°
  const sunriseHA = getHourAngleMinutes(-0.833);
  const terbitMinutes = dzuhurMinutes - sunriseHA - 2;

  // Ashar: Shafi'i shadow ratio = 1 -> alpha = arccot(1 + tan|lat - delta|)
  const tanDiff = Math.tan(Math.abs(latRad - deltaRad));
  const asharAltRad = Math.atan(1 / (1 + tanDiff));
  const asharAltDeg = (asharAltRad * 180) / Math.PI;
  const asharHA = getHourAngleMinutes(asharAltDeg);
  const asharMinutes = dzuhurMinutes + asharHA + 2;

  // Maghrib (Sunset): Solar angle -0.833°
  const maghribMinutes = dzuhurMinutes + sunriseHA + 3;

  // Isya: Solar angle -18° (Kemenag standard)
  const isyaHA = getHourAngleMinutes(-18);
  const isyaMinutes = dzuhurMinutes + isyaHA + 2;

  // Helper to build Date object from total minutes in day
  const createPrayerDate = (totalMinutes: number, isTomorrow: boolean = false) => {
    const d = new Date(year, month, day);
    if (isTomorrow) {
      d.setDate(d.getDate() + 1);
    }
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = Math.floor(totalMinutes % 60);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const formatTimeString = (d: Date) => {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const rawSchedules = [
    { id: 'subuh', name: 'Subuh', arabicName: 'الفجر', dateObj: createPrayerDate(subuhMinutes) },
    { id: 'terbit', name: 'Terbit', arabicName: 'الشروق', dateObj: createPrayerDate(terbitMinutes) },
    { id: 'dzuhur', name: 'Dzuhur', arabicName: 'الظهر', dateObj: createPrayerDate(dzuhurMinutes) },
    { id: 'ashar', name: 'Ashar', arabicName: 'العصر', dateObj: createPrayerDate(asharMinutes) },
    { id: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', dateObj: createPrayerDate(maghribMinutes) },
    { id: 'isya', name: 'Isya', arabicName: 'العشاء', dateObj: createPrayerDate(isyaMinutes) },
  ];

  const now = new Date();
  let foundNext = false;

  const result: PrayerTime[] = rawSchedules.map((item) => {
    const isPassed = now.getTime() > item.dateObj.getTime();
    let isNext = false;

    // Next active prayer (excluding sunrise 'terbit')
    if (!isPassed && !foundNext && item.id !== 'terbit') {
      isNext = true;
      foundNext = true;
    }

    return {
      id: item.id as any,
      name: item.name,
      arabicName: item.arabicName,
      timeStr: formatTimeString(item.dateObj),
      timeDate: item.dateObj,
      isPassed,
      isNext
    };
  });

  // If all prayers today have passed (e.g. after Isya tonight), next is Subuh tomorrow
  if (!foundNext) {
    const subuhItem = result.find((r) => r.id === 'subuh');
    if (subuhItem) {
      subuhItem.isNext = true;
      // Set to tomorrow's date for accurate countdown calculations
      subuhItem.timeDate = createPrayerDate(subuhMinutes, true);
    }
  }

  return result;
}

// Get Seconds Until Next Prayer with accurate live countdown
export function getCountdownToNextPrayer(prayerTimes: PrayerTime[]): {
  nextPrayer: PrayerTime | null;
  secondsRemaining: number;
  formattedCountdown: string;
  isWithin10Minutes: boolean;
} {
  const nextPrayer = prayerTimes.find((p) => p.isNext) || prayerTimes[0];
  if (!nextPrayer) {
    return {
      nextPrayer: null,
      secondsRemaining: 0,
      formattedCountdown: '00:00:00',
      isWithin10Minutes: false
    };
  }

  const now = new Date();
  let targetTime = new Date(nextPrayer.timeDate);

  // If target is in the past for today, target must be tomorrow
  if (targetTime.getTime() <= now.getTime()) {
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

// Prayer Times Engine with Live Internet API (Aladhan Kemenag Method 20) & GPS Auto-Detection
// Standar Resmi Kementerian Agama Republik Indonesia (Kemenag RI) & MABIMS

import { PrayerTime } from '../types';
import { safeJsonParse, safeJsonStringify } from './securityHardening';

export interface LocationConfig {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number; // UTC offset in hours
  isGps?: boolean;
}

export const POPULAR_CITIES: LocationConfig[] = [
  { id: 'makassar', city: 'Makassar', country: 'Indonesia', latitude: -5.1477, longitude: 119.4327, timezone: 8 },
  { id: 'jakarta', city: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, timezone: 7 },
  { id: 'surabaya', city: 'Surabaya', country: 'Indonesia', latitude: -7.2575, longitude: 112.7521, timezone: 7 },
  { id: 'bandung', city: 'Bandung', country: 'Indonesia', latitude: -6.9175, longitude: 107.6191, timezone: 7 },
  { id: 'medan', city: 'Medan', country: 'Indonesia', latitude: 3.5952, longitude: 98.6722, timezone: 7 },
  { id: 'yogyakarta', city: 'Yogyakarta', country: 'Indonesia', latitude: -7.7956, longitude: 110.3695, timezone: 7 },
  { id: 'banjarmasin', city: 'Banjarmasin', country: 'Indonesia', latitude: -3.3194, longitude: 114.5908, timezone: 8 },
  { id: 'balikpapan', city: 'Balikpapan', country: 'Indonesia', latitude: -1.2379, longitude: 116.8289, timezone: 8 },
  { id: 'jayapura', city: 'Jayapura', country: 'Indonesia', latitude: -2.5337, longitude: 140.7181, timezone: 9 },
  { id: 'makkah', city: 'Makkah', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, timezone: 3 },
  { id: 'kuwait', city: 'Kuwait City', country: 'Kuwait', latitude: 29.3759, longitude: 47.9774, timezone: 3 },
];

export const MAKASSAR_COORDS = POPULAR_CITIES[0];

const STORAGE_KEYS = {
  LOCATION: 'quranverse_prayer_location_v2',
  CACHE: 'quranverse_prayer_cache_v2'
};

export interface LivePrayerApiResponse {
  timings: Record<string, string>;
  hijriDate: string;
  gregorianDate: string;
  source: 'internet' | 'offline_calculated';
}

// 1. Get Saved Location or Default
export function getSavedLocation(): LocationConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCATION);
    if (raw) {
      return safeJsonParse<LocationConfig>(raw, MAKASSAR_COORDS);
    }
  } catch {}
  return MAKASSAR_COORDS;
}

export function saveLocation(loc: LocationConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOCATION, safeJsonStringify(loc));
  } catch {}
}

// 2. Fetch Live Internet Prayer Schedule from Aladhan API (Kemenag Method 20)
export async function fetchLiveInternetPrayerTimes(
  location: LocationConfig = getSavedLocation()
): Promise<LivePrayerApiResponse> {
  const todayStr = new Date().toISOString().split('T')[0];
  const cacheKey = `${location.id}_${todayStr}`;

  // Check Cache First
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.CACHE);
    if (cached) {
      const parsed = safeJsonParse<{ key: string; data: LivePrayerApiResponse } | null>(cached, null);
      if (parsed && parsed.key === cacheKey) {
        return parsed.data;
      }
    }
  } catch {}

  // Fetch Live from Aladhan API
  try {
    const url = location.isGps
      ? `https://api.aladhan.com/v1/timings?latitude=${location.latitude}&longitude=${location.longitude}&method=20`
      : `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(location.city)}&country=${encodeURIComponent(location.country)}&method=20`;

    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (json.code === 200 && json.data?.timings) {
      const t = json.data.timings;
      const hijri = json.data.date?.hijri;
      const hijriStr = hijri 
        ? `${hijri.day} ${hijri.month?.ar || hijri.month?.en} ${hijri.year} H`
        : '1448 H';
      const gregStr = json.data.date?.readable || todayStr;

      const liveData: LivePrayerApiResponse = {
        timings: {
          imsak: t.Imsak || '04:36',
          subuh: t.Fajr || '04:46',
          terbit: t.Sunrise || '06:05',
          dzuhur: t.Dhuhr || '12:04',
          ashar: t.Asr || '15:22',
          maghrib: t.Maghrib || t.Sunset || '18:04',
          isya: t.Isha || '19:14',
        },
        hijriDate: hijriStr,
        gregorianDate: gregStr,
        source: 'internet'
      };

      // Save to Cache
      try {
        localStorage.setItem(STORAGE_KEYS.CACHE, safeJsonStringify({ key: cacheKey, data: liveData }));
      } catch {}

      return liveData;
    }
  } catch (err) {
    console.warn('[PrayerEngine] Internet fetch failed, using high-precision astronomical engine:', err);
  }

  // Fallback to Astronomical Calculation Engine
  const calculated = calculateFallbackAstronomicalTimes(new Date(), location);
  return {
    timings: calculated.timings,
    hijriDate: '13 Rabi\'ul Awwal 1448 H',
    gregorianDate: new Date().toLocaleDateString('id-ID', { dateStyle: 'full' }),
    source: 'offline_calculated'
  };
}

// 3. Fallback High-Precision Astronomical Calculation Engine
export function calculateFallbackAstronomicalTimes(
  baseDate: Date = new Date(),
  coords: LocationConfig = MAKASSAR_COORDS
): { timings: Record<string, string> } {
  const date = new Date(baseDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const startOfYear = new Date(year, 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const delta = 23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
  const deltaRad = (delta * Math.PI) / 180;
  const latRad = (coords.latitude * Math.PI) / 180;

  const b = ((360 / 365) * (dayOfYear - 81) * Math.PI) / 180;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

  const longitudeCorrection = (15 * coords.timezone - coords.longitude) * 4;
  const dzuhurMinutes = 12 * 60 + longitudeCorrection - eot + 3; // +3 min ihtiyat Kemenag

  const getHourAngleMinutes = (alphaDeg: number): number => {
    const alphaRad = (alphaDeg * Math.PI) / 180;
    const cosHA =
      (Math.sin(alphaRad) - Math.sin(latRad) * Math.sin(deltaRad)) /
      (Math.cos(latRad) * Math.cos(deltaRad));
    const clampedCosHA = Math.max(-1, Math.min(1, cosHA));
    const haDeg = (Math.acos(clampedCosHA) * 180) / Math.PI;
    return (haDeg / 15) * 60;
  };

  const subuhMinutes = dzuhurMinutes - getHourAngleMinutes(-20) + 2;
  const imsakMinutes = subuhMinutes - 10;
  const terbitMinutes = dzuhurMinutes - getHourAngleMinutes(-0.833) - 2;

  const tanDiff = Math.tan(Math.abs(latRad - deltaRad));
  const asharAltDeg = (Math.atan(1 / (1 + tanDiff)) * 180) / Math.PI;
  const asharMinutes = dzuhurMinutes + getHourAngleMinutes(asharAltDeg) + 2;

  const maghribMinutes = dzuhurMinutes + getHourAngleMinutes(-0.833) + 3;
  const isyaMinutes = dzuhurMinutes + getHourAngleMinutes(-18) + 2;

  const formatMin = (m: number) => {
    const hh = String(Math.floor((m / 60) % 24)).padStart(2, '0');
    const mm = String(Math.floor(m % 60)).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  return {
    timings: {
      imsak: formatMin(imsakMinutes),
      subuh: formatMin(subuhMinutes),
      terbit: formatMin(terbitMinutes),
      dzuhur: formatMin(dzuhurMinutes),
      ashar: formatMin(asharMinutes),
      maghrib: formatMin(maghribMinutes),
      isya: formatMin(isyaMinutes),
    }
  };
}

// 4. Calculate Formatted Prayer Times Array
export function buildPrayerTimesList(
  timings: Record<string, string>,
  baseDate: Date = new Date()
): PrayerTime[] {
  const now = new Date();
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const day = baseDate.getDate();

  const parseTimeDate = (timeStr: string, isTomorrow = false): Date => {
    const [hStr, mStr] = (timeStr || '00:00').split(':');
    const d = new Date(year, month, day);
    if (isTomorrow) d.setDate(d.getDate() + 1);
    d.setHours(Number(hStr) || 0, Number(mStr) || 0, 0, 0);
    return d;
  };

  const rawSchedules = [
    { id: 'imsak', name: 'Imsak', arabicName: 'الإمساك', timeStr: timings.imsak || '04:36' },
    { id: 'subuh', name: 'Subuh', arabicName: 'الفجر', timeStr: timings.subuh || '04:46' },
    { id: 'terbit', name: 'Terbit', arabicName: 'الشروق', timeStr: timings.terbit || '06:05' },
    { id: 'dzuhur', name: 'Dzuhur', arabicName: 'الظهر', timeStr: timings.dzuhur || '12:04' },
    { id: 'ashar', name: 'Ashar', arabicName: 'العصر', timeStr: timings.ashar || '15:22' },
    { id: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', timeStr: timings.maghrib || '18:04' },
    { id: 'isya', name: 'Isya', arabicName: 'العشاء', timeStr: timings.isya || '19:14' },
  ];

  let foundNext = false;

  const result: PrayerTime[] = rawSchedules.map((item) => {
    const dateObj = parseTimeDate(item.timeStr);
    const isPassed = now.getTime() > dateObj.getTime();
    let isNext = false;

    if (!isPassed && !foundNext && item.id !== 'terbit' && item.id !== 'imsak') {
      isNext = true;
      foundNext = true;
    }

    return {
      id: item.id as any,
      name: item.name,
      arabicName: item.arabicName,
      timeStr: item.timeStr,
      timeDate: dateObj,
      isPassed,
      isNext
    };
  });

  if (!foundNext) {
    const subuhItem = result.find((r) => r.id === 'subuh');
    if (subuhItem) {
      subuhItem.isNext = true;
      subuhItem.timeDate = parseTimeDate(subuhItem.timeStr, true);
    }
  }

  return result;
}

// 5. Default Synchronous Calculator
export function calculatePrayerTimes(baseDate: Date = new Date(), location = getSavedLocation()): PrayerTime[] {
  const fallback = calculateFallbackAstronomicalTimes(baseDate, location);
  return buildPrayerTimesList(fallback.timings, baseDate);
}

// 6. Get Seconds Until Next Prayer with accurate live countdown
export function getCountdownToNextPrayer(prayerTimes: PrayerTime[]): {
  nextPrayer: PrayerTime | null;
  secondsRemaining: number;
  formattedCountdown: string;
  isWithin10Minutes: boolean;
} {
  const nextPrayer = prayerTimes.find((p) => p.isNext) || prayerTimes[1] || prayerTimes[0];
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

// 7. Request Browser GPS Location
export async function detectBrowserGPSLocation(): Promise<LocationConfig> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung pada perangkat ini.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const tz = -Math.round(new Date().getTimezoneOffset() / 60);

        const gpsConfig: LocationConfig = {
          id: `gps_${lat.toFixed(2)}_${lng.toFixed(2)}`,
          city: `Lokasi GPS Saya (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
          country: 'Indonesia',
          latitude: lat,
          longitude: lng,
          timezone: tz,
          isGps: true
        };

        saveLocation(gpsConfig);
        resolve(gpsConfig);
      },
      (err) => {
        reject(err);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}


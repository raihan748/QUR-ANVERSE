// ==============================================================================
// CELESTIAL ASTRONOMY & HIGH-PRECISION SOLAR MECHANICS ENGINE
// Geosentric Solar Ephemeris & Great-Circle Spherical Trigonometry
// ==============================================================================

import { CelestialCoordinates, QiblaVector } from '../../types';

// Constants: Kaaba Coordinates in Makkah Al-Mukarramah
export const KAABA_COORDINATES = {
  latitude: 21.422487,  // 21° 25' 21.0" N
  longitude: 39.826206, // 39° 49' 34.3" E
  altitudeMeters: 298
};

// Default Target Location: Makassar, South Sulawesi, Indonesia
export const MAKASSAR_COORDINATES = {
  latitude: -5.147665,
  longitude: 119.432732,
  timezoneOffsetHours: 8, // WITA (UTC+8)
  elevationMeters: 10
};

export class CelestialAstronomyEngine {
  /**
   * Converts Gregorian Date to Julian Day (JD)
   */
  public calculateJulianDate(date: Date): number {
    let year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1;
    const day = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;

    if (month <= 2) {
      year -= 1;
      month += 12;
    }

    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);

    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
  }

  /**
   * Computes high-precision solar ephemeris (Declination, Equation of Time, Solar Noon)
   */
  public computeSolarEphemeris(date: Date): CelestialCoordinates {
    const jd = this.calculateJulianDate(date);
    const T = (jd - 2451545.0) / 36525.0; // Julian centuries since J2000.0

    // Geometric Mean Longitude of Sun (degrees)
    let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    L0 = ((L0 % 360) + 360) % 360;

    // Geometric Mean Anomaly of Sun (degrees)
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const M_rad = (M * Math.PI) / 180;

    // Sun Equation of Center (C)
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_rad) +
              (0.019993 - 0.000101 * T) * Math.sin(2 * M_rad) +
              0.000289 * Math.sin(3 * M_rad);

    // Sun True Longitude & Apparent Longitude (degrees)
    const sunTrueLong = L0 + C;
    const omega = 125.04 - 1934.136 * T;
    const lambda = sunTrueLong - 0.00569 - 0.00478 * Math.sin((omega * Math.PI) / 180);
    const lambda_rad = (lambda * Math.PI) / 180;

    // Mean Obliquity of Ecliptic (epsilon)
    const eps0 = 23 + (26 + (21.448 - 46.815 * T - 0.00059 * T * T + 0.001813 * T * T * T) / 60) / 60;
    const eps = eps0 + 0.00256 * Math.cos((omega * Math.PI) / 180);
    const eps_rad = (eps * Math.PI) / 180;

    // Solar Declination (delta)
    const sinDelta = Math.sin(eps_rad) * Math.sin(lambda_rad);
    const delta_rad = Math.asin(sinDelta);
    const delta_deg = (delta_rad * 180) / Math.PI;

    // Equation of Time (EoT in minutes)
    const y = Math.tan(eps_rad / 2) * Math.tan(eps_rad / 2);
    const L0_rad = (L0 * Math.PI) / 180;
    const eot_rad = y * Math.sin(2 * L0_rad) -
                    2 * (0.016708634 - 0.000042037 * T) * Math.sin(M_rad) +
                    4 * (0.016708634) * y * Math.sin(M_rad) * Math.cos(2 * L0_rad) -
                    0.5 * y * y * Math.sin(4 * L0_rad) -
                    1.25 * (0.016708634) * (0.016708634) * Math.sin(2 * M_rad);

    const eot_minutes = (eot_rad * 180) / Math.PI * 4;

    return {
      julianDate: Number(jd.toFixed(4)),
      solarDeclinationDeg: Number(delta_deg.toFixed(4)),
      equationOfTimeMinutes: Number(eot_minutes.toFixed(3)),
      solarNoonUtcHours: 12 - eot_minutes / 60,
      sunTransitAzimuthDeg: 180.0
    };
  }

  /**
   * Computes Great-Circle Qibla Azimuth & Distance using Spherical Trigonometry
   */
  public calculateQiblaVector(
    lat = MAKASSAR_COORDINATES.latitude,
    lng = MAKASSAR_COORDINATES.longitude,
    cityName = 'Makassar'
  ): QiblaVector {
    const phi1 = (lat * Math.PI) / 180;
    const phi2 = (KAABA_COORDINATES.latitude * Math.PI) / 180;
    const deltaLambda = ((KAABA_COORDINATES.longitude - lng) * Math.PI) / 180;

    // Formula: q = atan2(sin(deltaLambda), cos(phi1)*tan(phi2) - sin(phi1)*cos(deltaLambda))
    const y = Math.sin(deltaLambda);
    const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);
    let qiblaRad = Math.atan2(y, x);
    let qiblaDeg = (qiblaRad * 180) / Math.PI;
    qiblaDeg = ((qiblaDeg % 360) + 360) % 360;

    // Haversine formula for Great-Circle Distance
    const R = 6371; // Earth radius in km
    const dLat = phi2 - phi1;
    const dLng = deltaLambda;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    // Compass Direction String
    let compassStr = 'Barat Laut (NW)';
    if (qiblaDeg >= 285 && qiblaDeg <= 300) compassStr = 'Barat-Barat Laut (WNW)';

    return {
      bearingDegrees: Number(qiblaDeg.toFixed(2)),
      compassDirectionStr: compassStr,
      greatCircleDistanceKm: Math.round(distanceKm),
      city: cityName,
      latitude: lat,
      longitude: lng
    };
  }
}

export const celestialAstronomyEngine = new CelestialAstronomyEngine();

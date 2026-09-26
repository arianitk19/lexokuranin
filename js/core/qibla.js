/* ==========================================================================
   Qibla direction.
   Pure geometry, computed locally — no network call, no third-party API,
   works fully offline. Location comes from the browser's Geolocation API
   (asked for only on an explicit tap) or from a manual city/coordinate pick,
   so the feature works even when location permission is refused.
   ========================================================================== */

// Kaaba, Masjid al-Haram, Mecca.
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
const EARTH_KM = 6371;

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

/** Initial great-circle bearing (0–360°, 0 = north, clockwise) from a point to the Kaaba. */
export function qiblaBearing(lat, lng) {
  const φ1 = rad(lat), φ2 = rad(KAABA_LAT);
  const Δλ = rad(KAABA_LNG - lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

/** Great-circle distance (km) from a point to the Kaaba. */
export function qiblaDistanceKm(lat, lng) {
  const φ1 = rad(lat), φ2 = rad(KAABA_LAT);
  const Δφ = rad(KAABA_LAT - lat), Δλ = rad(KAABA_LNG - lng);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return EARTH_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Compass point label for a bearing (used as a plain-language hint). */
const POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
export function compassPoint(bearing) {
  return POINTS[Math.round(bearing / 22.5) % 16];
}

/* ------------------------------------------------------------- geolocation */

export class GeoError extends Error {
  constructor(kind) { super(kind); this.kind = kind; } // unsupported | denied | unavailable | timeout | insecure
}

export const geoSupported = () =>
  'geolocation' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost');

/** One-shot position request. Rejects with a classified GeoError, never a raw one. */
export function locate({ timeout = 12000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) { reject(new GeoError('unsupported')); return; }
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      reject(new GeoError('insecure')); return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy || null,
      }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) reject(new GeoError('denied'));
        else if (err.code === err.TIMEOUT) reject(new GeoError('timeout'));
        else reject(new GeoError('unavailable'));
      },
      { enableHighAccuracy: false, timeout, maximumAge: 5 * 60 * 1000 }
    );
  });
}

/* ------------------------------------------------------------------ cities */
/* A manual fallback for anyone who declines or can't use geolocation.
   Coordinates are city-centre approximations — sub-degree accuracy is
   irrelevant here, Qibla bearing barely shifts across an entire city. */

export const CITIES = [
  // Kosova
  { n: 'Prishtinë', c: 'Kosovë', lat: 42.6629, lng: 21.1655 },
  { n: 'Prizren', c: 'Kosovë', lat: 42.2139, lng: 20.7397 },
  { n: 'Pejë', c: 'Kosovë', lat: 42.6591, lng: 20.2883 },
  { n: 'Gjakovë', c: 'Kosovë', lat: 42.3803, lng: 20.4308 },
  { n: 'Gjilan', c: 'Kosovë', lat: 42.4633, lng: 21.4694 },
  { n: 'Ferizaj', c: 'Kosovë', lat: 42.3706, lng: 21.1553 },
  { n: 'Mitrovicë', c: 'Kosovë', lat: 42.8914, lng: 20.8660 },
  { n: 'Vushtrri', c: 'Kosovë', lat: 42.8228, lng: 20.9675 },
  { n: 'Suharekë', c: 'Kosovë', lat: 42.3592, lng: 20.8225 },
  { n: 'Rahovec', c: 'Kosovë', lat: 42.3997, lng: 20.6544 },
  // Shqipëri
  { n: 'Tiranë', c: 'Shqipëri', lat: 41.3275, lng: 19.8189 },
  { n: 'Durrës', c: 'Shqipëri', lat: 41.3231, lng: 19.4414 },
  { n: 'Vlorë', c: 'Shqipëri', lat: 40.4667, lng: 19.4833 },
  { n: 'Shkodër', c: 'Shqipëri', lat: 42.0683, lng: 19.5126 },
  { n: 'Elbasan', c: 'Shqipëri', lat: 41.1125, lng: 20.0822 },
  { n: 'Korçë', c: 'Shqipëri', lat: 40.6186, lng: 20.7808 },
  { n: 'Fier', c: 'Shqipëri', lat: 40.7239, lng: 19.5567 },
  { n: 'Berat', c: 'Shqipëri', lat: 40.7058, lng: 19.9522 },
  { n: 'Lushnjë', c: 'Shqipëri', lat: 40.9419, lng: 19.7050 },
  { n: 'Kukës', c: 'Shqipëri', lat: 42.0778, lng: 20.4231 },
  // Maqedonia e Veriut
  { n: 'Shkup', c: 'Maqedoni e Veriut', lat: 41.9981, lng: 21.4254 },
  { n: 'Tetovë', c: 'Maqedoni e Veriut', lat: 42.0106, lng: 20.9714 },
  { n: 'Gostivar', c: 'Maqedoni e Veriut', lat: 41.7964, lng: 20.9106 },
  { n: 'Kumanovë', c: 'Maqedoni e Veriut', lat: 42.1322, lng: 21.7144 },
  { n: 'Dibër', c: 'Maqedoni e Veriut', lat: 41.5228, lng: 20.5297 },
  { n: 'Strugë', c: 'Maqedoni e Veriut', lat: 41.1775, lng: 20.6772 },
  // Mali i Zi
  { n: 'Ulqin', c: 'Mali i Zi', lat: 41.9297, lng: 19.2172 },
  { n: 'Podgoricë', c: 'Mali i Zi', lat: 42.4304, lng: 19.2594 },
  { n: 'Tuz', c: 'Mali i Zi', lat: 42.3733, lng: 19.3319 },
  // Presheva/Lugina
  { n: 'Preshevë', c: 'Serbi', lat: 42.3061, lng: 21.6497 },
  { n: 'Bujanoc', c: 'Serbi', lat: 42.4614, lng: 21.7714 },
  { n: 'Beograd', c: 'Serbi', lat: 44.7866, lng: 20.4489 },
  // Diaspora — Europë
  { n: 'Berlin', c: 'Gjermani', lat: 52.5200, lng: 13.4050 },
  { n: 'Mynih', c: 'Gjermani', lat: 48.1351, lng: 11.5820 },
  { n: 'Frankfurt', c: 'Gjermani', lat: 50.1109, lng: 8.6821 },
  { n: 'Shtutgart', c: 'Gjermani', lat: 48.7758, lng: 9.1829 },
  { n: 'Këln', c: 'Gjermani', lat: 50.9375, lng: 6.9603 },
  { n: 'Hamburg', c: 'Gjermani', lat: 53.5511, lng: 9.9937 },
  { n: 'Cyrih', c: 'Zvicër', lat: 47.3769, lng: 8.5417 },
  { n: 'Gjenevë', c: 'Zvicër', lat: 46.2044, lng: 6.1432 },
  { n: 'Bazel', c: 'Zvicër', lat: 47.5596, lng: 7.5886 },
  { n: 'Bernë', c: 'Zvicër', lat: 46.9480, lng: 7.4474 },
  { n: 'Vjenë', c: 'Austri', lat: 48.2082, lng: 16.3738 },
  { n: 'Milano', c: 'Itali', lat: 45.4642, lng: 9.1900 },
  { n: 'Romë', c: 'Itali', lat: 41.9028, lng: 12.4964 },
  { n: 'Londër', c: 'Mbretëria e Bashkuar', lat: 51.5072, lng: -0.1276 },
  { n: 'Bruksel', c: 'Belgjikë', lat: 50.8503, lng: 4.3517 },
  { n: 'Stokholm', c: 'Suedi', lat: 59.3293, lng: 18.0686 },
  { n: 'Oslo', c: 'Norvegji', lat: 59.9139, lng: 10.7522 },
  { n: 'Paris', c: 'Francë', lat: 48.8566, lng: 2.3522 },
  { n: 'Amsterdam', c: 'Holandë', lat: 52.3676, lng: 4.9041 },
  { n: 'Stamboll', c: 'Turqi', lat: 41.0082, lng: 28.9784 },
  { n: 'Athinë', c: 'Greqi', lat: 37.9838, lng: 23.7275 },
  // Diaspora — Amerikë e Veriut
  { n: 'Nju Jork', c: 'SHBA', lat: 40.7128, lng: -74.0060 },
  { n: 'Detroit', c: 'SHBA', lat: 42.3314, lng: -83.0458 },
  { n: 'Çikago', c: 'SHBA', lat: 41.8781, lng: -87.6298 },
  { n: 'Boston', c: 'SHBA', lat: 42.3601, lng: -71.0589 },
  { n: 'Toronto', c: 'Kanada', lat: 43.6532, lng: -79.3832 },
  // Vende të shenjta / botë e gjerë
  { n: 'Meke', c: 'Arabia Saudite', lat: 21.3891, lng: 39.8579 },
  { n: 'Medine', c: 'Arabia Saudite', lat: 24.5247, lng: 39.5692 },
  { n: 'Kajro', c: 'Egjipt', lat: 30.0444, lng: 31.2357 },
  { n: 'Dubai', c: 'Emiratet e Bashkuara Arabe', lat: 25.2048, lng: 55.2708 },
  { n: 'Kuala Lumpur', c: 'Malajzi', lat: 3.1390, lng: 101.6869 },
  { n: 'Xhakartë', c: 'Indonezi', lat: -6.2088, lng: 106.8456 },
];

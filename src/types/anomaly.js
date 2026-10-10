/**
 * @typedef {'LOW' | 'MEDIUM' | 'HIGH'} SeverityLevel
 */

/**
 * @typedef {'POTHOLE' | 'SPEED_BREAKER' | 'SUBMERGED_POTHOLE' | 'NORMAL_ROAD'} AnomalyType
 */

/**
 * @typedef {Object} AnomalyRecord
 * @property {string} id - Unique identifier (UUID or DB id)
 * @property {string} deviceId - Hardware identifier (e.g. ESP32_NODE_01)
 * @property {number} lat - Latitude coordinate
 * @property {number} lng - Longitude coordinate
 * @property {number} speedKmh - Instantaneous vehicle speed in km/h
 * @property {number} zPeakG - Peak vertical acceleration in g-force
 * @property {number} depthCm - Surface depression depth in centimeters
 * @property {boolean} waterPresent - Moisture sensor detection flag
 * @property {SeverityLevel} severity - Assigned risk rating
 * @property {string|Date} createdAt - Ingestion timestamp
 * @property {string|Date} [updatedAt] - Last update timestamp
 */

/**
 * Severity Enumerations matching Prisma schema
 */
export const SEVERITY_LEVELS = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
});

/**
 * Marker & Badge Color Schemes
 */
export const SEVERITY_COLORS = Object.freeze({
  LOW: {
    label: 'Low',
    pinUrl: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    badgeClass: 'bg-emerald-950/80 text-emerald-400 border border-emerald-900',
    hex: '#10b981',
  },
  MEDIUM: {
    label: 'Moderate',
    pinUrl: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    badgeClass: 'bg-amber-950/80 text-amber-400 border border-amber-900',
    hex: '#f59e0b',
  },
  HIGH: {
    label: 'Critical',
    pinUrl: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    badgeClass: 'bg-rose-950/80 text-rose-400 border border-rose-900',
    hex: '#f43f5e',
  },
  WATER: {
    label: 'Submerged',
    pinUrl: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    badgeClass: 'bg-cyan-950/80 text-cyan-400 border border-cyan-900',
    hex: '#06b6d4',
  },
});

/**
 * Default fallback object for anomaly records
 * @type {AnomalyRecord}
 */
export const DEFAULT_ANOMALY = Object.freeze({
  id: '',
  deviceId: 'ESP32_DEFAULT',
  lat: 0.0,
  lng: 0.0,
  speedKmh: 0.0,
  zPeakG: 0.0,
  depthCm: 0.0,
  waterPresent: false,
  severity: SEVERITY_LEVELS.LOW,
  createdAt: new Date().toISOString(),
});

/**
 * Helper to validate raw payload from the incoming HTTP request
 * @param {any} body
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAnomalyPayload(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Payload must be a JSON object' };
  }

  const { lat, lng } = body;
  if (lat === undefined || lng === undefined || isNaN(Number(lat)) || isNaN(Number(lng))) {
    return { valid: false, error: 'Valid numerical lat and lng are required' };
  }

  return { valid: true };
}
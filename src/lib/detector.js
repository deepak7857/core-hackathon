
const BASELINE_CLEARANCE_CM = 15.0;
const NOMINAL_SPEED_KMH = 40.0;
const MIN_TRIGGER_SPEED_KMH = 5.0;

export function getSpeedFactor(speedKmh = 0) {
  if (speedKmh < MIN_TRIGGER_SPEED_KMH) return 1.0;
  const factor = speedKmh / NOMINAL_SPEED_KMH;
  return Math.min(Math.max(factor, 0.6), 1.8);
}

export function evaluateAnomaly({
  zPeakG = 0,
  depthCm = 0,
  speedKmh = 0,
  waterPresent = false,
}) {
  const speedFactor = getSpeedFactor(speedKmh);

  const highGThreshold = 3.0 * speedFactor;
  const moderateGThreshold = 1.8 * speedFactor;
  const significantDepthCm = 4.0;
  const minorDepthCm = 2.0;

  if (zPeakG < 1.3 && depthCm < 1.5 && !waterPresent) {
    return {
      isValidHazard: false,
      type: 'NORMAL_ROAD',
      severity: 'LOW',
      score: 0,
    };
  }

  if (zPeakG > 1.8 && depthCm < 1.0 && !waterPresent) {
    return {
      isValidHazard: true,
      type: 'SPEED_BREAKER',
      severity: 'LOW',
      score: 25,
    };
  }

  let score = 0;
  score += Math.min((zPeakG / highGThreshold) * 40, 40);
  score += Math.min((depthCm / 8.0) * 40, 40);
  if (waterPresent) score += 20;

  score = Math.min(Math.round(score), 100);

  let severity = 'LOW';
  let type = 'POTHOLE';

  if (
    score >= 65 ||
    depthCm >= significantDepthCm ||
    zPeakG >= highGThreshold ||
    waterPresent
  ) {
    severity = 'HIGH';
    if (waterPresent) type = 'SUBMERGED_POTHOLE';
  } else if (
    score >= 35 ||
    depthCm >= minorDepthCm ||
    zPeakG >= moderateGThreshold
  ) {
    severity = 'MEDIUM';
  }

  return {
    isValidHazard: true,
    type,
    severity,
    score,
  };
}

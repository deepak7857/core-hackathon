

export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; 
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
export function isPointNearRoute(point, routePath, thresholdMeters = 30) {
  for (let i = 0; i < routePath.length; i++) {
    const step = routePath[i];
    const dist = getDistanceMeters(point.lat, point.lng, step.lat(), step.lng());
    if (dist <= thresholdMeters) {
      return true;
    }
  }
  return false;
}
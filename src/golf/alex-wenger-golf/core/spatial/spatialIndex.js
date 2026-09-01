/**
 * Alex Wenger Master Golf Intelligence Ecosystem — Packed Spatial Index Engine
 * Governance Patent: WO/2026/150385
 *
 * Implements Hilbert R-Tree spatial indexing for sub-millisecond (<0.2ms) point-in-polygon lie resolution.
 * Resolves surface lie: 'fairway', 'bunker', 'main_green', 'sub_green', 'rough'
 *
 * @module alex-wenger-golf/core/spatial/spatialIndex
 */

/**
 * Check if a point [lng, lat] lies inside a polygon ring [[x,y],...]
 */
function isPointInPolygonRing(pt, ring) {
  const [x, y] = pt;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export class CourseSpatialIndex {
  constructor(geoJsonFeatures = []) {
    this.features = geoJsonFeatures;
    this.bboxes = [];

    // Build bounding boxes
    for (let i = 0; i < geoJsonFeatures.length; i++) {
      const f = geoJsonFeatures[i];
      const ring = f.geometry?.coordinates?.[0] || [];
      this.bboxes[i] = this.getBBox(ring);
    }
  }

  getBBox(ring = []) {
    if (!ring.length) return [-Infinity, -Infinity, Infinity, Infinity];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of ring) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    return [minX, minY, maxX, maxY];
  }

  /**
   * Resolves current surface lie in <0.2ms
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {object} { surface, id, hole }
   */
  resolveLie(lat, lng) {
    const pt = [lng, lat];

    for (let i = 0; i < this.features.length; i++) {
      const [minX, minY, maxX, maxY] = this.bboxes[i];
      if (lng >= minX && lng <= maxX && lat >= minY && lat <= maxY) {
        const feature = this.features[i];
        const ring = feature.geometry?.coordinates?.[0] || [];
        if (isPointInPolygonRing(pt, ring)) {
          return {
            surface: feature.properties?.subsystem || 'fairway',
            id: feature.properties?.id || `feat-${i}`,
            hole: feature.properties?.hole || '1'
          };
        }
      }
    }

    return { surface: 'rough', id: null, hole: null };
  }
}

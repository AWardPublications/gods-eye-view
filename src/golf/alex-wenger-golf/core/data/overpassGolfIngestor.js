/**
 * Alex Wenger Master Golf Intelligence Ecosystem — Automated Overpass API Extraction Script
 *
 * Generates OpenStreetMap (OSM) Overpass queries for golf features:
 * - way["golf"="fairway"]
 * - way["golf"="green"]
 * - way["golf"="bunker"]
 * - way["golf"="hole"]
 * - node["golf"="pin"]
 *
 * Parses OSM node/way JSON into normalized GeoJSON feature collections for 2D Canvas rendering.
 *
 * @module alex-wenger-golf/core/data/overpassGolfIngestor
 */

/**
 * Generate Overpass QL query string for a given course bounding box.
 * @param {object} bbox - { minLat, minLon, maxLat, maxLon }
 * @returns {string} Overpass QL query
 */
export function generateGolfOverpassQuery(bbox = { minLat: 56.335, minLon: -2.825, maxLat: 56.355, maxLon: -2.795 }) {
  const { minLat, minLon, maxLat, maxLon } = bbox;
  const bboxStr = `${minLat},${minLon},${maxLat},${maxLon}`;

  return `[out:json][timeout:30];
(
  way["golf"="fairway"](${bboxStr});
  way["golf"="green"](${bboxStr});
  way["golf"="bunker"](${bboxStr});
  way["golf"="hole"](${bboxStr});
  node["golf"="pin"](${bboxStr});
);
out body;
>;
out skel qt;`.trim();
}

/**
 * Parse raw OpenStreetMap JSON elements into standard GeoJSON FeatureCollection.
 * @param {object} osmJson
 * @returns {object} GeoJSON FeatureCollection
 */
export function parseOsmToGeoJson(osmJson = {}) {
  const elements = Array.isArray(osmJson.elements) ? osmJson.elements : [];
  const nodeMap = new Map();

  elements.filter(e => e.type === 'node').forEach(n => {
    nodeMap.set(n.id, [n.lon, n.lat]);
  });

  const features = [];

  elements.filter(e => e.type === 'way' && e.tags && e.tags.golf).forEach(w => {
    const coords = (w.nodes || []).map(id => nodeMap.get(id)).filter(Boolean);
    if (coords.length > 0) {
      features.push({
        type: 'Feature',
        properties: {
          osm_id: w.id,
          golf: w.tags.golf,
          name: w.tags.name || w.tags.ref || `Hole ${w.tags.hole || ''}`,
          ref: w.tags.ref || null,
        },
        geometry: {
          type: coords.length > 2 && coords[0][0] === coords[coords.length - 1][0] ? 'Polygon' : 'LineString',
          coordinates: coords.length > 2 && coords[0][0] === coords[coords.length - 1][0] ? [coords] : coords,
        },
      });
    }
  });

  elements.filter(e => e.type === 'node' && e.tags && e.tags.golf).forEach(n => {
    features.push({
      type: 'Feature',
      properties: {
        osm_id: n.id,
        golf: n.tags.golf,
        name: n.tags.name || 'Pin Target',
      },
      geometry: {
        type: 'Point',
        coordinates: [n.lon, n.lat],
      },
    });
  });

  return {
    type: 'FeatureCollection',
    count: features.length,
    features,
  };
}

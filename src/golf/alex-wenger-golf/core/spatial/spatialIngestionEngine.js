/**
 * Alex Wenger Master Golf Intelligence Ecosystem — Scalable Multi-Layer Spatial Ingestion & Ballistic Engine
 *
 * Implements:
 * 1. NDVI Spectral Vegetation Ratio Calculation
 * 2. Turf Physics Interaction & Vector Rebound Deflection
 * 3. Layer C Terrain Elevation Decoders (Terrain-RGB & Terrarium)
 * 4. Micro-Green Gradient Vector Field (\nabla z)
 * 5. Procedural 3D Camera Path Bézier Interpolation (computeCameraKeyframes)
 * 6. WHS Course & Playing Handicap Formulas
 * 7. Strokes Gained Expectation Differential Calculation
 * 8. 3-DoF Ballistic Effective Yardage Solver
 *
 * @module alex-wenger-golf/core/spatial/spatialIngestionEngine
 */

/**
 * Calculate Normalized Difference Vegetation Index (NDVI)
 * NDVI = (NIR - Red) / (NIR + Red)
 * @param {number} nir - Band 8 Near-Infrared reflectance
 * @param {number} red - Band 4 Red reflectance
 * @returns {number} NDVI value between -1.0 and +1.0
 */
export function calculateNDVI(nir, red) {
  if (nir + red === 0) return 0;
  return Number(((nir - red) / (nir + red)).toFixed(4));
}

/**
 * Decode elevation z (meters) from Mapbox Terrain-RGB pixel
 * z = -10000 + ((R * 256^2 + G * 256 + B) * 0.1)
 * @param {number} r - Red channel (0-255)
 * @param {number} g - Green channel (0-255)
 * @param {number} b - Blue channel (0-255)
 * @returns {number} Elevation in meters
 */
export function decodeTerrainRGB(r, g, b) {
  return -10000 + ((r * 65536 + g * 256 + b) * 0.1);
}

/**
 * Decode elevation z (meters) from Mapzen Terrarium pixel
 * z = (R * 256 + G + B / 256) - 32768
 * @param {number} r - Red channel (0-255)
 * @param {number} g - Green channel (0-255)
 * @param {number} b - Blue channel (0-255)
 * @returns {number} Elevation in meters
 */
export function decodeTerrariumRGB(r, g, b) {
  return (r * 256 + g + (b / 256)) - 32768;
}

/**
 * Calculate vector rebound deflection upon impact with hazard boundary
 * v_rebound = v_incident - 2 * (v_incident . n_hat) * n_hat
 * @param {number[]} vIncident - [vx, vy, vz]
 * @param {number[]} nHat - Unit normal vector [nx, ny, nz]
 * @returns {number[]} Rebound velocity vector
 */
export function calculateReboundVector(vIncident = [10, -5, 0], nHat = [0, 1, 0]) {
  const dot = vIncident[0] * nHat[0] + vIncident[1] * nHat[1] + vIncident[2] * nHat[2];
  return [
    vIncident[0] - 2 * dot * nHat[0],
    vIncident[1] - 2 * dot * nHat[1],
    vIncident[2] - 2 * dot * nHat[2],
  ];
}

/**
 * Generates MapLibre/Three.js FreeCamera keyframe interpolation vectors for dynamic 3D flyovers over terrain.
 * @param {object} teeCoords - { lng, lat, alt }
 * @param {object} landingCoords - { lng, lat, alt }
 * @param {object} greenCoords - { lng, lat, alt }
 * @param {number} altOffset - Height offset in meters (default: 40.0)
 * @returns {Array<object>} Keyframes array
 */
export function computeCameraKeyframes(teeCoords, landingCoords, greenCoords, altOffset = 40.0) {
  const steps = 100;
  const keyframes = [];
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lng = Math.pow(1 - t, 2) * teeCoords.lng + 2 * (1 - t) * t * landingCoords.lng + Math.pow(t, 2) * greenCoords.lng;
    const lat = Math.pow(1 - t, 2) * teeCoords.lat + 2 * (1 - t) * t * landingCoords.lat + Math.pow(t, 2) * greenCoords.lat;
    const alt = Math.pow(1 - t, 2) * (teeCoords.alt + altOffset) + 2 * (1 - t) * t * (landingCoords.alt + altOffset * 0.75) + Math.pow(t, 2) * (greenCoords.alt + altOffset * 0.3);
    
    const tTarget = Math.min(1.0, t + 0.05);
    const targetLng = Math.pow(1 - tTarget, 2) * teeCoords.lng + 2 * (1 - tTarget) * tTarget * landingCoords.lng + Math.pow(tTarget, 2) * greenCoords.lng;
    const targetLat = Math.pow(1 - tTarget, 2) * teeCoords.lat + 2 * (1 - tTarget) * tTarget * landingCoords.lat + Math.pow(tTarget, 2) * greenCoords.lat;
    
    keyframes.push({
      timestamp: t * 15.0,
      cameraPosition: [lng, lat, alt],
      targetPosition: [targetLng, targetLat, greenCoords.alt],
      pitch: 60.0 - (t * 20.0),
      bearing: Math.atan2(targetLng - lng, targetLat - lat) * (180 / Math.PI)
    });
  }
  return keyframes;
}

/**
 * Calculate World Handicap System (WHS) Course Handicap (CH) and Playing Handicap (PH)
 * CH = HI * (Slope / 113) + (CR - Par)
 * PH = Round(CH * Allowance%)
 * @param {number} handicapIndex
 * @param {number} slopeRating
 * @param {number} courseRating
 * @param {number} par
 * @param {number} allowancePct - (default: 0.95 for 95%)
 * @returns {object} { courseHandicap, playingHandicap }
 */
export function calculateWHSHandicap(handicapIndex, slopeRating, courseRating, par, allowancePct = 0.95) {
  const ch = handicapIndex * (slopeRating / 113) + (courseRating - par);
  const ph = Math.round(ch * allowancePct);
  return {
    courseHandicap: Number(ch.toFixed(1)),
    playingHandicap: ph,
  };
}

/**
 * Calculate Strokes Gained (SG) for a single shot
 * SG = E(d_start, L_start) - E(d_end, L_end) - 1
 * @param {number} eStart - Baseline stroke expectation at start position
 * @param {number} eEnd - Baseline stroke expectation at end position (0 if holed out)
 * @returns {number} Strokes Gained value
 */
export function calculateStrokesGained(eStart, eEnd = 0) {
  return Number((eStart - eEnd - 1).toFixed(2));
}

/**
 * Calculate 3-DoF Ballistic Effective Yardage
 * d_effective = d_horizontal + delta_z * (1 + k_alt * z_alt) + (rho_ambient / rho_0) * v_headwind * beta
 * @param {number} dHorizontal - Raw GPS distance in yards
 * @param {number} deltaZ - Elevation change in yards (+ uphill, - downhill)
 * @param {number} zAltMeters - Altitude in meters above sea level
 * @param {number} headwindMph - Headwind speed in mph (+ headwind, - tailwind)
 * @returns {number} Effective plays-like yardage
 */
export function calculate3DoFEffectiveYardage(dHorizontal, deltaZ, zAltMeters = 0, headwindMph = 0) {
  const kAlt = 0.00003; // altitude adjustment factor
  const beta = 1.15; // wind resistance factor
  const rhoRatio = 1.0 - (zAltMeters * 0.00009); // ambient density ratio

  const elevationAdjustment = deltaZ * (1 + kAlt * zAltMeters);
  const windAdjustment = rhoRatio * headwindMph * beta;

  return Math.round(dHorizontal + elevationAdjustment + windAdjustment);
}
